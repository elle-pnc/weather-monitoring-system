# Quick Setup Guide

## 🚀 Get Started in 5 Steps

### Step 1: Install Arduino IDE & ESP32 Support
1. Download Arduino IDE from https://www.arduino.cc/en/software
2. Open Arduino IDE → File → Preferences
3. Add ESP32 board manager URL:
   ```
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   ```
4. Tools → Board → Boards Manager → Search "ESP32" → Install
5. Select board: Tools → Board → ESP32 Arduino → ESP32 Dev Module

### Step 2: Install Required Libraries
Open Arduino IDE → Sketch → Include Library → Manage Libraries, install:
- **DHT sensor library** by Adafruit
- **PubSubClient** by Nick O'Leary
- **ArduinoJson** by Benoit Blanchon (for JSON parsing)

### Step 3: Configure Firmware
1. Copy `firmware/config.h.example` to `firmware/config.h`
2. Edit `firmware/config.h`:
   ```cpp
   #define WIFI_SSID "YourWiFiName"
   #define WIFI_PASSWORD "YourWiFiPassword"
   #define MQTT_BROKER "broker.hivemq.com"  // or your broker
   #define MQTT_PORT 1883
   ```

### Step 4: Upload Firmware
1. Connect ESP32 via USB
2. Select correct COM port: Tools → Port
3. Open `firmware/weather_monitor.ino`
4. Click Upload (→ button)
5. Open Serial Monitor (115200 baud) to verify connection

### Step 5: Run Dashboard
1. Open `dashboard/index.html` in a web browser
2. In dashboard settings, enter MQTT broker URL:
   - HiveMQ Public: `ws://broker.hivemq.com:8000/mqtt`
   - Or your custom broker
3. Click "Connect"
4. You should see sensor data appear!

## 📋 Hardware Checklist

- [ ] ESP32 Development Board
- [ ] DHT22 Temperature & Humidity Sensor
- [ ] 5V Relay Module
- [ ] Breadboard
- [ ] Jumper wires
- [ ] USB cable
- [ ] Device to control (fan/LED)

See `docs/hardware_setup.md` for detailed wiring instructions.

## 🔧 MQTT Broker Options

### Option 1: HiveMQ Public (Easiest - No Setup)
- URL: `ws://broker.hivemq.com:8000/mqtt`
- No account needed
- Good for testing
- **Note**: Public broker, not secure

### Option 2: HiveMQ Cloud (Free Tier)
1. Sign up at https://www.hivemq.com/cloud/
2. Create a cluster
3. Get WebSocket URL (format: `wss://xxxxx.hivemq.cloud:8884`)
4. Use in dashboard settings
5. Update ESP32 config with broker details

### Option 3: Local Mosquitto
1. Install Mosquitto: https://mosquitto.org/download/
2. Enable WebSocket (port 9001)
3. Use: `ws://localhost:9001` in dashboard

## ✅ Verification Checklist

After setup, verify:

- [ ] ESP32 connects to WiFi (check Serial Monitor)
- [ ] ESP32 connects to MQTT broker (check Serial Monitor)
- [ ] Dashboard connects to MQTT broker (green "Connected" badge)
- [ ] Temperature and humidity values appear in dashboard
- [ ] Fan control buttons work (relay clicks)
- [ ] Chart updates with new data points

## 🐛 Troubleshooting

### ESP32 Not Connecting to WiFi
- Check SSID and password in `config.h`
- Verify WiFi is 2.4GHz (ESP32 doesn't support 5GHz)
- Check Serial Monitor for error messages

### MQTT Connection Failed
- Verify broker URL and port
- Check firewall settings
- For local broker, ensure it's running
- Check Serial Monitor for MQTT error codes

### Dashboard Not Receiving Data
- Verify ESP32 is publishing (check Serial Monitor)
- Check MQTT topics match (should be `weather/temperature`, `weather/humidity`)
- Use MQTT client tool (like MQTT Explorer) to verify messages

### Sensor Reading Errors
- Check DHT22 wiring (especially DATA pin)
- Verify pull-up resistor (4.7kΩ) is present
- Try different GPIO pin if needed
- Check power supply (3.3V)

## 📚 Next Steps

1. **Test the system** - Let it run for a while to verify stability
2. **Take photos** - Document your hardware setup
3. **Create schematic** - Use Fritzing, KiCad, or draw.io
4. **Record demo video** - Show all features working
5. **Write report** - Use `docs/report_template.md` as starting point

## 📁 Project Structure

```
WEATHER/
├── firmware/
│   ├── weather_monitor.ino    # Main ESP32 code
│   ├── config.h.example       # Config template
│   └── config.h               # Your config (create this)
├── dashboard/
│   ├── index.html             # Dashboard UI
│   ├── style.css              # Styling
│   └── script.js              # MQTT logic
├── docs/
│   ├── hardware_setup.md      # Wiring guide
│   ├── mqtt_topics.md         # Topic documentation
│   └── report_template.md     # Report template
└── README.md                  # Project overview
```

## 🎯 MQTT Topics Reference

- **Publish**: `weather/temperature`, `weather/humidity`, `weather/status`
- **Subscribe**: `weather/control/fan`

See `docs/mqtt_topics.md` for details.

---

**Need Help?** Check the documentation files in the `docs/` folder or review the code comments.

