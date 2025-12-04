/*
 * Network-Enabled Weather Monitoring System
 * ESP32 Firmware with FreeRTOS
 * 
 * Features:
 * - DHT22 Temperature & Humidity Sensor
 * - BMP280 Atmospheric Pressure & Temperature Sensor
 * - MQTT Communication
 * - Relay Control (Fan/LED)
 * - RTOS Multitasking
 */

#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <DHT.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <Adafruit_BMP280.h>

// Include configuration
#include "config.h"

// ==================== PIN DEFINITIONS ====================
#define DHT_PIN 4          // GPIO 4 for DHT22 data
#define RELAY_PIN 2         // GPIO 2 for relay control
#define DHT_TYPE DHT22      // DHT22 sensor type
#define BMP280_SDA 21       // GPIO 21 for BMP280 I2C SDA
#define BMP280_SCL 22       // GPIO 22 for BMP280 I2C SCL
#define LDR_PIN 39          // GPIO 39 for LDR (ADC1, input only)

// ==================== GLOBAL OBJECTS ====================
DHT dht(DHT_PIN, DHT_TYPE);
Adafruit_BMP280 bmp;        // BMP280 sensor object
#if MQTT_PORT == 8883
  // Use secure client for TLS (HiveMQ Cloud)
  WiFiClientSecure espClient;
#else
  // Use regular client for non-TLS connections
  WiFiClient espClient;
#endif
PubSubClient mqttClient(espClient);

// ==================== SHARED DATA (Protected by Mutex) ====================
float temperature = 0.0;
float humidity = 0.0;
float pressure = 0.0;       // Atmospheric pressure in hPa
float lightLevel = 0.0;     // Light intensity (0-100%)
bool fanState = false;
bool mqttConnected = false;

// Mutex for shared data protection
SemaphoreHandle_t dataMutex;

// ==================== RTOS TASK HANDLES ====================
TaskHandle_t sensorTaskHandle = NULL;
TaskHandle_t bmp280TaskHandle = NULL;
TaskHandle_t ldrTaskHandle = NULL;
TaskHandle_t mqttPublishTaskHandle = NULL;
TaskHandle_t mqttSubscribeTaskHandle = NULL;
TaskHandle_t controlTaskHandle = NULL;
TaskHandle_t wifiTaskHandle = NULL;

// ==================== FUNCTION DECLARATIONS ====================
void connectToWiFi();
void connectToMQTT();
void mqttCallback(char* topic, byte* payload, unsigned int length);
void sensorTask(void* parameter);
void bmp280Task(void* parameter);
void ldrTask(void* parameter);
void mqttPublishTask(void* parameter);
void mqttSubscribeTask(void* parameter);
void controlTask(void* parameter);
void wifiTask(void* parameter);

// ==================== SETUP ====================
void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n=== Weather Monitoring System Starting ===");
  
  // Initialize pins
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW);
  
  // Initialize LDR pin (analog input, no pinMode needed for ADC)
  // GPIO 39 is ADC1_CH3, input-only pin
  
  // Initialize I2C for BMP280
  Wire.begin(BMP280_SDA, BMP280_SCL);
  
  // Initialize DHT sensor
  dht.begin();
  Serial.println("DHT22 sensor initialized");
  
  // Initialize BMP280 sensor
  if (!bmp.begin(0x76)) {  // Try default I2C address 0x76
    if (!bmp.begin(0x77)) {  // Try alternative address 0x77
      Serial.println("[BMP280] ERROR: Could not find BMP280 sensor!");
      Serial.println("[BMP280] Check wiring: SDA->GPIO21, SCL->GPIO22");
    } else {
      Serial.println("BMP280 sensor initialized (address 0x77)");
      bmp.setSampling(Adafruit_BMP280::MODE_NORMAL,     // Operating Mode
                      Adafruit_BMP280::SAMPLING_X2,     // Temp. oversampling
                      Adafruit_BMP280::SAMPLING_X16,    // Pressure oversampling
                      Adafruit_BMP280::FILTER_X16,      // Filtering
                      Adafruit_BMP280::STANDBY_MS_500); // Standby time
    }
  } else {
    Serial.println("BMP280 sensor initialized (address 0x76)");
    bmp.setSampling(Adafruit_BMP280::MODE_NORMAL,     // Operating Mode
                    Adafruit_BMP280::SAMPLING_X2,     // Temp. oversampling
                    Adafruit_BMP280::SAMPLING_X16,    // Pressure oversampling
                    Adafruit_BMP280::FILTER_X16,      // Filtering
                    Adafruit_BMP280::STANDBY_MS_500); // Standby time
  }
  
  // Create mutex for shared data
  dataMutex = xSemaphoreCreateMutex();
  if (dataMutex == NULL) {
    Serial.println("ERROR: Failed to create mutex!");
    while(1) delay(1000);
  }
  
  // Configure MQTT
  mqttClient.setServer(MQTT_BROKER, MQTT_PORT);
  mqttClient.setCallback(mqttCallback);
  mqttClient.setKeepAlive(60);
  mqttClient.setSocketTimeout(15);
  
  // Configure TLS for secure connections (HiveMQ Cloud)
  #if MQTT_PORT == 8883
    espClient.setInsecure(); // Skip certificate validation for HiveMQ Cloud
    Serial.println("[MQTT] TLS enabled for secure connection");
  #endif
  
  // Connect to WiFi first
  connectToWiFi();
  
  // Create RTOS tasks
  // Task 1: Sensor Reading - DHT22 (Priority: 2, Stack: 2048)
  xTaskCreatePinnedToCore(
    sensorTask,
    "SensorTask",
    2048,
    NULL,
    2,
    &sensorTaskHandle,
    1  // Core 1
  );
  
  // Task 2: BMP280 Reading (Priority: 2, Stack: 2048)
  xTaskCreatePinnedToCore(
    bmp280Task,
    "BMP280Task",
    2048,
    NULL,
    2,
    &bmp280TaskHandle,
    1  // Core 1
  );
  
  // Task 3: LDR Reading (Priority: 2, Stack: 2048)
  xTaskCreatePinnedToCore(
    ldrTask,
    "LDRTask",
    2048,
    NULL,
    2,
    &ldrTaskHandle,
    1  // Core 1
  );
  
  // Task 4: MQTT Publish (Priority: 2, Stack: 4096)
  xTaskCreatePinnedToCore(
    mqttPublishTask,
    "MQTTPublishTask",
    4096,
    NULL,
    2,
    &mqttPublishTaskHandle,
    0  // Core 0
  );
  
  // Task 5: MQTT Subscribe (Priority: 3, Stack: 4096)
  xTaskCreatePinnedToCore(
    mqttSubscribeTask,
    "MQTTSubscribeTask",
    4096,
    NULL,
    3,
    &mqttSubscribeTaskHandle,
    0  // Core 0
  );
  
  // Task 6: Control Task (Priority: 3, Stack: 2048)
  xTaskCreatePinnedToCore(
    controlTask,
    "ControlTask",
    2048,
    NULL,
    3,
    &controlTaskHandle,
    1  // Core 1
  );
  
  // Task 6: WiFi Monitoring (Priority: 1, Stack: 2048)
  xTaskCreatePinnedToCore(
    wifiTask,
    "WiFiTask",
    2048,
    NULL,
    1,
    &wifiTaskHandle,
    0  // Core 0
  );
  
  Serial.println("All RTOS tasks created successfully!");
  Serial.println("System ready!");
}

// ==================== LOOP ====================
void loop() {
  // FreeRTOS handles task scheduling
  // Main loop can be used for low-priority operations
  delay(10000);  // Just a safety delay
}

// ==================== TASK 1: SENSOR READING ====================
void sensorTask(void* parameter) {
  Serial.println("Sensor Task started on Core 1");
  
  while (true) {
    // Read temperature and humidity
    float temp = dht.readTemperature();
    float hum = dht.readHumidity();
    
    // Check if readings are valid
    if (!isnan(temp) && !isnan(hum)) {
      // Protect shared data with mutex
      if (xSemaphoreTake(dataMutex, portMAX_DELAY) == pdTRUE) {
        temperature = temp;
        humidity = hum;
        xSemaphoreGive(dataMutex);
        
        Serial.printf("[Sensor] Temp: %.2f°C, Humidity: %.2f%%\n", temp, hum);
      }
    } else {
      Serial.println("[Sensor] ERROR: Failed to read from DHT sensor!");
    }
    
    // Read every 2 seconds
    vTaskDelay(pdMS_TO_TICKS(2000));
  }
}

// ==================== TASK 2: BMP280 READING ====================
void bmp280Task(void* parameter) {
  Serial.println("BMP280 Task started on Core 1");
  
  // Wait a bit for BMP280 to stabilize
  vTaskDelay(pdMS_TO_TICKS(1000));
  
  while (true) {
    // Read pressure from BMP280
    float press = bmp.readPressure() / 100.0;  // Convert Pa to hPa
    float tempBmp = bmp.readTemperature();
    
    // Check if readings are valid
    if (!isnan(press) && press > 0 && press < 2000) {  // Valid pressure range
      // Protect shared data with mutex
      if (xSemaphoreTake(dataMutex, portMAX_DELAY) == pdTRUE) {
        pressure = press;
        // Optionally use BMP280 temperature (more accurate) instead of DHT22
        // temperature = tempBmp;  // Uncomment to use BMP280 temp
        xSemaphoreGive(dataMutex);
        
        Serial.printf("[BMP280] Pressure: %.2f hPa, Temp: %.2f°C\n", press, tempBmp);
      }
    } else {
      Serial.println("[BMP280] ERROR: Invalid pressure reading!");
    }
    
    // Read every 5 seconds (BMP280 is fast, but pressure changes slowly)
    vTaskDelay(pdMS_TO_TICKS(5000));
  }
}

// ==================== TASK 3: MQTT PUBLISH ====================
void mqttPublishTask(void* parameter) {
  Serial.println("MQTT Publish Task started on Core 0");
  
  while (true) {
    // Ensure MQTT connection
    if (!mqttClient.connected()) {
      connectToMQTT();
    }
    
    // Process MQTT loop (non-blocking)
    mqttClient.loop();
    
    // Publish sensor data every 5 seconds
    if (mqttClient.connected()) {
      // Get latest sensor data (protected by mutex)
      float temp, hum, press;
      if (xSemaphoreTake(dataMutex, portMAX_DELAY) == pdTRUE) {
        temp = temperature;
        hum = humidity;
        press = pressure;
        xSemaphoreGive(dataMutex);
      }
      
      // Publish temperature
      char tempMsg[20];
      snprintf(tempMsg, sizeof(tempMsg), "%.2f", temp);
      mqttClient.publish("weather/temperature", tempMsg);
      
      // Publish humidity
      char humMsg[20];
      snprintf(humMsg, sizeof(humMsg), "%.2f", hum);
      mqttClient.publish("weather/humidity", humMsg);
      
      // Publish pressure
      char pressMsg[20];
      snprintf(pressMsg, sizeof(pressMsg), "%.2f", press);
      mqttClient.publish("weather/pressure", pressMsg);
      
      // Publish status (JSON format for dashboard)
      StaticJsonDocument<300> statusDoc;
      statusDoc["temperature"] = temp;
      statusDoc["humidity"] = hum;
      statusDoc["pressure"] = press;
      
      char statusMsg[300];
      serializeJson(statusDoc, statusMsg);
      mqttClient.publish("weather/status", statusMsg, true); // Retain message
      
      Serial.printf("[MQTT] Published: Temp=%.2f°C, Hum=%.2f%%, Pressure=%.2f hPa\n", temp, hum, press);
    }
    
    vTaskDelay(pdMS_TO_TICKS(5000));
  }
}

// ==================== TASK 4: MQTT SUBSCRIBE ====================
void mqttSubscribeTask(void* parameter) {
  Serial.println("MQTT Subscribe Task started on Core 0");
  
  while (true) {
    // Ensure MQTT connection
    if (!mqttClient.connected()) {
      connectToMQTT();
    }
    
    // Process MQTT loop (handles incoming messages)
    mqttClient.loop();
    
    // Small delay to prevent CPU hogging
    vTaskDelay(pdMS_TO_TICKS(100));
  }
}

// ==================== TASK 5: CONTROL TASK ====================
void controlTask(void* parameter) {
  Serial.println("Control Task started on Core 1");
  
  while (true) {
    // Control relay based on fanState
    if (xSemaphoreTake(dataMutex, portMAX_DELAY) == pdTRUE) {
      digitalWrite(RELAY_PIN, fanState ? HIGH : LOW);
      xSemaphoreGive(dataMutex);
    }
    
    // Check every 500ms
    vTaskDelay(pdMS_TO_TICKS(500));
  }
}

// ==================== TASK 6: WIFI MONITORING ====================
void wifiTask(void* parameter) {
  Serial.println("WiFi Task started on Core 0");
  
  while (true) {
    // Check WiFi connection every 10 seconds
    if (WiFi.status() != WL_CONNECTED) {
      Serial.println("[WiFi] Connection lost! Reconnecting...");
      connectToWiFi();
    }
    
    vTaskDelay(pdMS_TO_TICKS(10000));
  }
}

// ==================== MQTT CALLBACK ====================
void mqttCallback(char* topic, byte* payload, unsigned int length) {
  // Convert payload to string
  char message[length + 1];
  memcpy(message, payload, length);
  message[length] = '\0';
  
  Serial.printf("[MQTT] Message received on topic: %s\n", topic);
  Serial.printf("[MQTT] Message: %s\n", message);
  
  // Handle fan control commands
  if (strcmp(topic, "weather/control/fan") == 0) {
    if (xSemaphoreTake(dataMutex, portMAX_DELAY) == pdTRUE) {
      bool newState = false;
      if (strcmp(message, "ON") == 0 || strcmp(message, "1") == 0 || strcmp(message, "true") == 0) {
        newState = true;
        Serial.println("[Control] Fan command: ON");
      } else if (strcmp(message, "OFF") == 0 || strcmp(message, "0") == 0 || strcmp(message, "false") == 0) {
        newState = false;
        Serial.println("[Control] Fan command: OFF");
      }
      
      if (fanState != newState) {
        fanState = newState;
        Serial.printf("[Control] Fan state changed to: %s\n", fanState ? "ON" : "OFF");
      }
      xSemaphoreGive(dataMutex);
    }
  }
  
  // Handle fan status updates from dashboard (optional - for synchronization)
  if (strcmp(topic, "weather/fan/status") == 0) {
    // Parse JSON status message
    StaticJsonDocument<100> doc;
    DeserializationError error = deserializeJson(doc, message);
    
    if (!error && doc.containsKey("status")) {
      bool statusValue = doc["status"];
      if (xSemaphoreTake(dataMutex, portMAX_DELAY) == pdTRUE) {
        if (fanState != statusValue) {
          fanState = statusValue;
          Serial.printf("[Status] Fan status synchronized: %s\n", fanState ? "ON" : "OFF");
        }
        xSemaphoreGive(dataMutex);
      }
    }
  }
}

// ==================== WIFI CONNECTION ====================
void connectToWiFi() {
  Serial.print("\n[WiFi] Connecting to: ");
  Serial.println(WIFI_SSID);
  
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[WiFi] Connected!");
    Serial.print("[WiFi] IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n[WiFi] Connection failed!");
  }
}

// ==================== MQTT CONNECTION ====================
void connectToMQTT() {
  while (!mqttClient.connected()) {
    Serial.print("[MQTT] Connecting to broker...");
    
    // Generate unique client ID
    String clientId = "ESP32-Weather-";
    clientId += String(random(0xffff), HEX);
    
    // Attempt connection with authentication
    bool connected = false;
    
    // Check if authentication is required
    if (strlen(MQTT_USER) > 0 && strlen(MQTT_PASSWORD) > 0) {
      Serial.print(" (with auth)...");
      connected = mqttClient.connect(clientId.c_str(), MQTT_USER, MQTT_PASSWORD);
    } else {
      Serial.print(" (no auth)...");
      connected = mqttClient.connect(clientId.c_str());
    }
    
    if (connected) {
      Serial.println(" Connected!");
      
      // Subscribe to control topics
      if (mqttClient.subscribe("weather/control/fan")) {
        Serial.println("[MQTT] Subscribed to: weather/control/fan");
      } else {
        Serial.println("[MQTT] ERROR: Failed to subscribe to weather/control/fan");
      }
      
      // Subscribe to fan status topic (for synchronization with dashboard)
      if (mqttClient.subscribe("weather/fan/status")) {
        Serial.println("[MQTT] Subscribed to: weather/fan/status");
      } else {
        Serial.println("[MQTT] ERROR: Failed to subscribe to weather/fan/status");
      }
      
      mqttConnected = true;
    } else {
      Serial.print(" Failed, rc=");
      Serial.print(mqttClient.state());
      Serial.print(" (");
      switch (mqttClient.state()) {
        case -4: Serial.print("Connection timeout"); break;
        case -3: Serial.print("Connection lost"); break;
        case -2: Serial.print("Connect failed"); break;
        case -1: Serial.print("Disconnected"); break;
        case 1: Serial.print("Bad protocol version"); break;
        case 2: Serial.print("Bad client ID"); break;
        case 3: Serial.print("Unavailable"); break;
        case 4: Serial.print("Bad credentials"); break;
        case 5: Serial.print("Unauthorized"); break;
        default: Serial.print("Unknown error"); break;
      }
      Serial.println(")");
      Serial.println(" Retrying in 5 seconds...");
      delay(5000);
    }
  }
}

