# Sensor Integration Plan - Version 2.0

## 📊 New Sensors to Add

| Sensor | Data | Interface | Library Needed |
|--------|------|-----------|----------------|
| **BMP280** | Atmospheric Pressure, Temperature | I2C/SPI | Adafruit BMP280 Library |
| **DHT11** | Humidity | Digital (1-wire) | DHT Library (already have) |
| **DIY Anemometer** | Wind Speed | Analog/Digital | Custom code (ADC) |
| **DIY Vane** | Wind Direction | Analog/Digital | Custom code (ADC) |
| **Water Sensor** | Rain Detection | Analog/Digital | Custom code (ADC) |
| **LDR** | Light Intensity | Analog | Custom code (ADC) |

## ⚠️ Important Considerations

### Sensor Redundancy
- **DHT22** (current): Temperature + Humidity
- **BMP280** (new): Temperature + Pressure
- **DHT11** (new): Humidity only

**Recommendation**: 
- Use **BMP280 temperature** (more accurate for pressure calculations)
- Use **DHT22 humidity** (more accurate than DHT11)
- **DHT11 can be optional** or used as backup

### GPIO Pin Allocation

ESP32 has limited GPIO pins. Here's a suggested allocation:

```
Current:
- GPIO 2: Relay control
- GPIO 4: DHT22 data

New Sensors:
- GPIO 21 (SDA): BMP280 I2C
- GPIO 22 (SCL): BMP280 I2C
- GPIO 5: DHT11 data (optional, if keeping)
- GPIO 34: Anemometer (ADC1, input only)
- GPIO 35: Wind Vane (ADC1, input only)
- GPIO 36: Rain Sensor (ADC1, input only)
- GPIO 39: LDR (ADC1, input only)
```

**Note**: GPIO 34, 35, 36, 39 are ADC-only pins (no output capability)

## 🔧 Hardware Requirements

### Additional Components Needed
- BMP280 module (I2C)
- 4.7kΩ pull-up resistors for I2C (usually on module)
- Voltage dividers for analog sensors (if needed)
- Additional breadboard space
- Jumper wires

### Power Considerations
- ESP32 3.3V can power most sensors
- Check current draw - may need external power for all sensors
- Consider using a power distribution board

## 📡 MQTT Topic Structure (New)

```
weather/
├── temperature          [EXISTING] - DHT22 temp
├── humidity             [EXISTING] - DHT22 humidity
├── pressure             [NEW] - BMP280 pressure (hPa)
├── wind_speed           [NEW] - Anemometer (m/s or km/h)
├── wind_direction       [NEW] - Wind vane (degrees 0-360)
├── rain                 [NEW] - Rain sensor (0-100% or boolean)
├── light                [NEW] - LDR light intensity (0-100%)
├── status               [UPDATED] - All sensor data (JSON)
└── control/
    └── fan              [EXISTING] - Fan control
```

## 💻 Firmware Changes Required

### 1. New Libraries to Install
```cpp
#include <Adafruit_BMP280.h>  // BMP280 sensor
#include <Wire.h>              // I2C communication
// DHT library already included
```

### 2. New Global Variables
```cpp
// Sensor objects
Adafruit_BMP280 bmp;
DHT dht11(DHT11_PIN, DHT11);

// Shared data (add to existing mutex-protected data)
float pressure = 0.0;
float windSpeed = 0.0;
float windDirection = 0.0;
float rainLevel = 0.0;
float lightLevel = 0.0;
```

### 3. New RTOS Tasks
- **BMP280 Task**: Read pressure every 5 seconds
- **Anemometer Task**: Read wind speed every 1 second (faster for wind)
- **Wind Vane Task**: Read wind direction every 2 seconds
- **Rain Sensor Task**: Read rain level every 2 seconds
- **LDR Task**: Read light intensity every 2 seconds

### 4. Updated MQTT Publish Task
- Publish all new sensor data
- Update `weather/status` JSON with all sensors

## 🎨 Dashboard Changes Required

### 1. New Metric Cards
Add to metrics grid:
- **Pressure Card**: Display atmospheric pressure (hPa)
- **Wind Speed Card**: Display wind speed (m/s or km/h)
- **Wind Direction Card**: Display wind direction with compass
- **Rain Card**: Display rain level (% or status)
- **Light Card**: Display light intensity (%)

### 2. Chart Updates
- Add new datasets to chart:
  - Pressure line
  - Wind speed line
  - Light intensity line
- Consider separate charts for:
  - Weather conditions (temp, humidity, pressure)
  - Wind data (speed, direction)
  - Environmental (rain, light)

### 3. Weather Condition Logic
Update `computeWeatherCondition()` to consider:
- **Pressure**: Low pressure = stormy weather
- **Wind Speed**: High wind = windy conditions
- **Rain**: Rain sensor = rainy weather
- **Light**: Low light = cloudy/overcast

### 4. UI Layout
- Expand metrics grid to accommodate new cards
- Consider tabs or sections:
  - **Overview**: Temp, Humidity, Pressure
  - **Wind**: Speed, Direction
  - **Environment**: Rain, Light

## 📋 Implementation Steps

### Phase 1: Hardware Setup
1. ✅ Wire BMP280 (I2C)
2. ✅ Wire DIY Anemometer (analog)
3. ✅ Wire DIY Wind Vane (analog)
4. ✅ Wire Rain Sensor (analog)
5. ✅ Wire LDR (analog)
6. ✅ Test each sensor individually

### Phase 2: Firmware Development
1. ✅ Add BMP280 library and initialization
2. ✅ Add analog sensor reading functions
3. ✅ Create new RTOS tasks for each sensor
4. ✅ Update shared data structure
5. ✅ Update MQTT publish task
6. ✅ Test MQTT publishing

### Phase 3: Dashboard Development
1. ✅ Add new MQTT topic subscriptions
2. ✅ Create new metric cards in HTML
3. ✅ Add CSS styling for new cards
4. ✅ Update JavaScript to handle new data
5. ✅ Update chart with new datasets
6. ✅ Update weather condition logic
7. ✅ Test UI responsiveness

### Phase 4: Testing & Integration
1. ✅ Test all sensors reading correctly
2. ✅ Test MQTT data flow
3. ✅ Test dashboard display
4. ✅ Test chart updates
5. ✅ Test on mobile devices
6. ✅ Performance testing

## 🔍 Technical Details

### BMP280 Calibration
- Sea level pressure: ~1013.25 hPa
- Altitude affects readings
- May need altitude compensation

### DIY Anemometer
- Typically uses Hall effect sensor or reed switch
- Counts rotations per time period
- Formula: `windSpeed = (rotations / time) * calibration_factor`

### DIY Wind Vane
- Typically uses potentiometer or multiple switches
- Returns angle (0-360 degrees)
- May need calibration for true north

### Rain Sensor
- Analog: Returns 0-4095 (12-bit ADC)
- Higher value = more water
- May need threshold for "raining" vs "dry"

### LDR (Light Dependent Resistor)
- Analog: Returns 0-4095 (12-bit ADC)
- Higher value = more light
- May need calibration for lux values

## 📊 Data Flow Diagram

```
┌─────────────┐
│   Sensors   │
│             │
│ DHT22       │──┐
│ BMP280      │──┤
│ Anemometer  │──┤
│ Wind Vane   │──┤──▶ [RTOS Tasks] ──▶ [Shared Data] ──▶ [MQTT Publish]
│ Rain Sensor │──┤
│ LDR         │──┘
└─────────────┘
                      │
                      ▼
              ┌──────────────┐
              │ MQTT Broker │
              └──────────────┘
                      │
                      ▼
              ┌──────────────┐
              │  Dashboard   │
              │              │
              │ - Display    │
              │ - Chart      │
              │ - Control    │
              └──────────────┘
```

## ⚡ Performance Considerations

### ESP32 Limitations
- **ADC Resolution**: 12-bit (0-4095)
- **I2C Speed**: 100kHz (standard) or 400kHz (fast)
- **Task Priorities**: Adjust based on sensor importance
- **Memory**: Monitor stack usage with new tasks

### Recommended Reading Intervals
- **Temperature/Humidity**: 2-5 seconds (DHT22 is slow)
- **Pressure**: 5 seconds (BMP280 is fast)
- **Wind Speed**: 1 second (for accurate wind measurement)
- **Wind Direction**: 2 seconds
- **Rain**: 2 seconds
- **Light**: 2 seconds

## 🐛 Potential Issues & Solutions

### Issue 1: I2C Address Conflict
- **Solution**: BMP280 has configurable address (0x76 or 0x77)

### Issue 2: Analog Sensor Noise
- **Solution**: Use averaging (read multiple times, average)

### Issue 3: ADC Voltage Range
- **Solution**: Use voltage dividers if sensors output >3.3V

### Issue 4: Too Many Tasks
- **Solution**: Combine similar sensors into one task

### Issue 5: MQTT Message Size
- **Solution**: JSON status message will grow - monitor size

## 📝 Next Steps

1. **Review this plan** and adjust as needed
2. **Order/acquire sensors** if not already available
3. **Set up hardware** on breadboard
4. **Start with BMP280** (easiest - I2C, well-documented)
5. **Test each sensor individually** before integrating
6. **Implement firmware** incrementally (one sensor at a time)
7. **Update dashboard** as sensors are added

## 🎯 Success Criteria

- [ ] All sensors reading correctly
- [ ] All data publishing to MQTT
- [ ] Dashboard displaying all sensor data
- [ ] Charts showing historical data
- [ ] Weather condition logic updated
- [ ] Mobile responsive design maintained
- [ ] No performance degradation
- [ ] System stable for extended periods

---

**Ready to start?** Let's begin with BMP280 integration as it's the most straightforward!

