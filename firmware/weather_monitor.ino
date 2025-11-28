/*
 * Network-Enabled Weather Monitoring System
 * ESP32 Firmware with FreeRTOS
 * 
 * Features:
 * - DHT22 Temperature & Humidity Sensor
 * - MQTT Communication
 * - Relay Control (Fan/LED)
 * - RTOS Multitasking
 */

#include <WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>
#include <ArduinoJson.h>

// Include configuration
#include "config.h"

// ==================== PIN DEFINITIONS ====================
#define DHT_PIN 4          // GPIO 4 for DHT22 data
#define RELAY_PIN 2        // GPIO 2 for relay control
#define DHT_TYPE DHT22     // DHT22 sensor type

// ==================== GLOBAL OBJECTS ====================
DHT dht(DHT_PIN, DHT_TYPE);
WiFiClient espClient;
PubSubClient mqttClient(espClient);

// ==================== SHARED DATA (Protected by Mutex) ====================
float temperature = 0.0;
float humidity = 0.0;
bool fanState = false;
bool mqttConnected = false;

// Mutex for shared data protection
SemaphoreHandle_t dataMutex;

// ==================== RTOS TASK HANDLES ====================
TaskHandle_t sensorTaskHandle = NULL;
TaskHandle_t mqttPublishTaskHandle = NULL;
TaskHandle_t mqttSubscribeTaskHandle = NULL;
TaskHandle_t controlTaskHandle = NULL;
TaskHandle_t wifiTaskHandle = NULL;

// ==================== FUNCTION DECLARATIONS ====================
void connectToWiFi();
void connectToMQTT();
void mqttCallback(char* topic, byte* payload, unsigned int length);
void sensorTask(void* parameter);
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
  
  // Initialize DHT sensor
  dht.begin();
  Serial.println("DHT22 sensor initialized");
  
  // Create mutex for shared data
  dataMutex = xSemaphoreCreateMutex();
  if (dataMutex == NULL) {
    Serial.println("ERROR: Failed to create mutex!");
    while(1) delay(1000);
  }
  
  // Configure MQTT
  mqttClient.setServer(MQTT_BROKER, MQTT_PORT);
  mqttClient.setCallback(mqttCallback);
  
  // Connect to WiFi first
  connectToWiFi();
  
  // Create RTOS tasks
  // Task 1: Sensor Reading (Priority: 2, Stack: 2048)
  xTaskCreatePinnedToCore(
    sensorTask,
    "SensorTask",
    2048,
    NULL,
    2,
    &sensorTaskHandle,
    1  // Core 1
  );
  
  // Task 2: MQTT Publish (Priority: 2, Stack: 4096)
  xTaskCreatePinnedToCore(
    mqttPublishTask,
    "MQTTPublishTask",
    4096,
    NULL,
    2,
    &mqttPublishTaskHandle,
    0  // Core 0
  );
  
  // Task 3: MQTT Subscribe (Priority: 3, Stack: 4096)
  xTaskCreatePinnedToCore(
    mqttSubscribeTask,
    "MQTTSubscribeTask",
    4096,
    NULL,
    3,
    &mqttSubscribeTaskHandle,
    0  // Core 0
  );
  
  // Task 4: Control Task (Priority: 3, Stack: 2048)
  xTaskCreatePinnedToCore(
    controlTask,
    "ControlTask",
    2048,
    NULL,
    3,
    &controlTaskHandle,
    1  // Core 1
  );
  
  // Task 5: WiFi Monitoring (Priority: 1, Stack: 2048)
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

// ==================== TASK 2: MQTT PUBLISH ====================
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
      float temp, hum;
      if (xSemaphoreTake(dataMutex, portMAX_DELAY) == pdTRUE) {
        temp = temperature;
        hum = humidity;
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
      
      // Publish status
      StaticJsonDocument<200> statusDoc;
      statusDoc["connected"] = true;
      statusDoc["temperature"] = temp;
      statusDoc["humidity"] = hum;
      statusDoc["fan"] = fanState;
      
      char statusMsg[200];
      serializeJson(statusDoc, statusMsg);
      mqttClient.publish("weather/status", statusMsg);
      
      Serial.printf("[MQTT] Published: Temp=%.2f, Hum=%.2f%%\n", temp, hum);
    }
    
    vTaskDelay(pdMS_TO_TICKS(5000));
  }
}

// ==================== TASK 3: MQTT SUBSCRIBE ====================
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

// ==================== TASK 4: CONTROL TASK ====================
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

// ==================== TASK 5: WIFI MONITORING ====================
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
  
  // Handle fan control
  if (strcmp(topic, "weather/control/fan") == 0) {
    if (xSemaphoreTake(dataMutex, portMAX_DELAY) == pdTRUE) {
      if (strcmp(message, "ON") == 0 || strcmp(message, "1") == 0) {
        fanState = true;
        Serial.println("[Control] Fan turned ON");
      } else if (strcmp(message, "OFF") == 0 || strcmp(message, "0") == 0) {
        fanState = false;
        Serial.println("[Control] Fan turned OFF");
      }
      xSemaphoreGive(dataMutex);
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
    
    // Attempt connection
    if (mqttClient.connect(clientId.c_str(), MQTT_USER, MQTT_PASSWORD)) {
      Serial.println(" Connected!");
      
      // Subscribe to control topics
      mqttClient.subscribe("weather/control/fan");
      Serial.println("[MQTT] Subscribed to: weather/control/fan");
      
      mqttConnected = true;
    } else {
      Serial.print(" Failed, rc=");
      Serial.print(mqttClient.state());
      Serial.println(" Retrying in 5 seconds...");
      delay(5000);
    }
  }
}

