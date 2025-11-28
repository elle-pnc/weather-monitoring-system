# Hardware Setup Guide

## Required Components

1. **ESP32 Development Board** (e.g., ESP32 DevKit V1)
2. **DHT22 Temperature & Humidity Sensor**
3. **5V Relay Module** (Single Channel)
4. **Breadboard** (Half-size or full-size)
5. **Jumper Wires** (Male-to-Male)
6. **Micro USB Cable** (for power and programming)
7. **Controlled Device** (Fan, LED, or Heater - for demonstration)

## Wiring Diagram

### ESP32 Pinout Reference
- **3.3V**: Power output
- **5V**: Power output (if available)
- **GND**: Ground
- **GPIO 4**: Digital I/O (DHT22 data)
- **GPIO 2**: Digital I/O (Relay control)

### Connections

#### DHT22 Sensor
```
DHT22          ESP32
─────────────────────
VCC      →     3.3V
GND      →     GND
DATA     →     GPIO 4
```

**Note**: DHT22 requires a 4.7kΩ pull-up resistor between DATA and VCC. Some modules include this resistor.

#### Relay Module
```
Relay Module   ESP32
─────────────────────
VCC      →     5V (or 3.3V)
GND      →     GND
IN       →     GPIO 2
```

**Note**: Check your relay module specifications. Some work with 3.3V, others need 5V.

#### Controlled Device (Fan/LED)
```
Device          Relay Module
─────────────────────────────
Positive  →     NO (Normally Open)
Negative  →     Common
```

## Step-by-Step Assembly

1. **Place ESP32 on breadboard**
   - Ensure proper orientation
   - Leave space for other components

2. **Connect DHT22**
   - Connect power (3.3V and GND)
   - Connect DATA pin to GPIO 4
   - Add pull-up resistor if not included in module

3. **Connect Relay Module**
   - Connect power (5V or 3.3V and GND)
   - Connect IN pin to GPIO 2

4. **Connect Controlled Device**
   - Connect device to relay output terminals
   - Ensure proper polarity for DC devices

5. **Double-check connections**
   - Verify all power connections
   - Check for loose wires
   - Ensure no short circuits

## Power Considerations

- ESP32 can be powered via USB (5V) or external power supply
- DHT22 requires 3.3V (can draw from ESP32)
- Relay module may need 5V (check specifications)
- Ensure total current draw is within ESP32 limits (~500mA via USB)

## Testing Connections

Before uploading firmware:

1. **Power Test**: Connect USB, verify ESP32 LED lights up
2. **Sensor Test**: Use multimeter to check DHT22 power (should be 3.3V)
3. **Relay Test**: Manually set GPIO 2 HIGH/LOW to test relay clicking

## Troubleshooting

### DHT22 Not Reading
- Check wiring (especially DATA pin)
- Verify pull-up resistor is present
- Check power supply (3.3V)
- Try different GPIO pin

### Relay Not Working
- Verify power supply voltage matches relay requirements
- Check GPIO pin connection
- Test relay with multimeter (continuity test)
- Ensure controlled device is properly connected

### ESP32 Not Connecting
- Check USB cable (data-capable, not charge-only)
- Install ESP32 board support in Arduino IDE
- Install USB drivers if needed (CP2102 or CH340)

## Safety Notes

- ⚠️ **AC Power**: If controlling AC devices, use proper relay rated for AC voltage
- ⚠️ **Isolation**: Relay module provides optical isolation - use it for safety
- ⚠️ **Current Limits**: Don't exceed relay current rating
- ⚠️ **Polarity**: Check DC device polarity before connecting

## Next Steps

After hardware setup:
1. Install Arduino IDE and ESP32 board support
2. Install required libraries (DHT, PubSubClient)
3. Configure `config.h` with WiFi and MQTT credentials
4. Upload firmware to ESP32
5. Test sensor readings via Serial Monitor

