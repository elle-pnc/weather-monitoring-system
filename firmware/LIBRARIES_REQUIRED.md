# Required Arduino Libraries

## For BMP280 Sensor (v2.2+)

Install the following library in Arduino IDE:

1. **Adafruit BMP280 Library**
   - Open Arduino IDE
   - Go to: `Sketch` → `Include Library` → `Manage Libraries`
   - Search for: `Adafruit BMP280`
   - Install: **Adafruit BMP280** by Adafruit
   - Version: Latest

2. **Adafruit Unified Sensor** (dependency)
   - This is usually installed automatically with BMP280
   - If not, search for: `Adafruit Unified Sensor`
   - Install: **Adafruit Unified Sensor** by Adafruit

3. **Wire Library** (built-in)
   - Already included with ESP32 Arduino Core
   - No installation needed

## Existing Libraries (Already Required)

- **DHT sensor library** by Adafruit
- **PubSubClient** by Nick O'Leary
- **ArduinoJson** by Benoit Blanchon

## Installation Steps

1. Open Arduino IDE
2. Go to `Sketch` → `Include Library` → `Manage Libraries`
3. Search and install each library listed above
4. Restart Arduino IDE
5. Open `weather_monitor.ino`
6. Verify compilation (should compile without errors)

## Library Versions Tested

- Adafruit BMP280 Library: v2.6.6+
- Adafruit Unified Sensor: v1.1.9+
- DHT sensor library: v1.4.4+
- PubSubClient: v2.8.0+
- ArduinoJson: v6.21.0+

## Troubleshooting

### Error: "Adafruit_BMP280.h: No such file or directory"
- Solution: Install Adafruit BMP280 Library (see above)

### Error: "Wire.h: No such file or directory"
- Solution: This shouldn't happen with ESP32. Try reinstalling ESP32 board support.

### Error: I2C address not found
- Solution: BMP280 might be on address 0x77 instead of 0x76. The code tries both automatically.

### Compilation errors
- Make sure all libraries are installed
- Check ESP32 board support is up to date
- Try restarting Arduino IDE

