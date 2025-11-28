# Network-Enabled Weather Monitoring System

A complete IoT weather monitoring system using ESP32, MQTT, and a real-time dashboard.

## Project Structure

```
WEATHER/
├── firmware/              # ESP32 Arduino code
│   ├── weather_monitor.ino
│   └── config.h.example
├── docs/                 # Documentation
│   ├── report_template.md
│   └── mqtt_topics.md
├── index.html            # Web dashboard (GitHub Pages compatible)
├── style.css             # Dashboard styles
├── script.js             # Dashboard JavaScript
└── README.md
```

## Quick Start

### 1. Hardware Setup
- ESP32 Development Board
- DHT22 Temperature & Humidity Sensor
- Relay Module (for fan/LED control)
- Jumper wires and breadboard

### 2. MQTT Broker Setup
Choose one:
- **Cloud (Recommended)**: Sign up at [HiveMQ Cloud](https://www.hivemq.com/cloud/) (free tier)
- **Local**: Install Mosquitto broker

### 3. Configure Firmware
1. Copy `firmware/config.h.example` to `firmware/config.h`
2. Update WiFi credentials and MQTT broker details
3. Upload to ESP32 using Arduino IDE

### 4. Run Dashboard
1. Open `index.html` in a web browser (or use GitHub Pages)
2. Update MQTT broker connection in the dashboard settings
3. Connect and monitor!

**GitHub Pages**: The dashboard is compatible with GitHub Pages. Enable it in repository settings to host it automatically.

## Features

- ✅ Real-time temperature & humidity monitoring
- ✅ MQTT bidirectional communication
- ✅ RTOS multitasking (FreeRTOS on ESP32)
- ✅ Web dashboard with control interface
- ✅ Relay control (fan/LED/heater)

## MQTT Topics

- `weather/temperature` - Temperature data (published)
- `weather/humidity` - Humidity data (published)
- `weather/control/fan` - Fan control commands (subscribed)
- `weather/status` - Device status (published)

## Requirements Met

- [x] Environmental sensing (Temperature & Humidity)
- [x] Dashboard for monitoring & control
- [x] MQTT networking (publish/subscribe)
- [x] RTOS multitasking demonstration
- [x] Complete documentation

