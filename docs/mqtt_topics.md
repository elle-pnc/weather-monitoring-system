# MQTT Topic Structure

## Overview
This document describes the MQTT topic architecture for the Weather Monitoring System.

## Topic Map

```
weather/
├── temperature          [PUBLISH] - Temperature readings in °C
├── humidity             [PUBLISH] - Humidity readings in %
├── status               [PUBLISH] - Device status (JSON)
└── control/
    └── fan              [SUBSCRIBE] - Fan control commands
```

## Topic Details

### `weather/temperature`
- **Direction**: ESP32 → Dashboard
- **QoS**: 0
- **Format**: Plain text (float)
- **Example**: `"25.50"`
- **Frequency**: Every 5 seconds
- **Description**: Current temperature reading from DHT22 sensor

### `weather/humidity`
- **Direction**: ESP32 → Dashboard
- **QoS**: 0
- **Format**: Plain text (float)
- **Example**: `"65.30"`
- **Frequency**: Every 5 seconds
- **Description**: Current humidity reading from DHT22 sensor

### `weather/status`
- **Direction**: ESP32 → Dashboard
- **QoS**: 0
- **Format**: JSON
- **Example**: 
  ```json
  {
    "connected": true,
    "temperature": 25.50,
    "humidity": 65.30,
    "fan": false
  }
  ```
- **Frequency**: Every 5 seconds
- **Description**: Complete device status including sensor readings and control state

### `weather/control/fan`
- **Direction**: Dashboard → ESP32
- **QoS**: 0
- **Format**: Plain text
- **Values**: 
  - `"ON"` or `"1"` - Turn fan ON
  - `"OFF"` or `"0"` - Turn fan OFF
- **Description**: Control command for fan relay

## QoS Settings

All topics use **QoS 0** (at most once delivery) for simplicity and low latency. For production systems, consider:
- QoS 1 for critical control commands
- QoS 2 for guaranteed delivery (higher overhead)

## Message Flow

```
┌─────────┐                    ┌──────────┐                    ┌──────────┐
│  ESP32  │──temperature──────▶│  MQTT    │──temperature──────▶│Dashboard │
│         │──humidity─────────▶│  Broker  │──humidity──────────▶│          │
│         │──status───────────▶│          │──status────────────▶│          │
│         │◀──control/fan──────│          │◀──control/fan───────│          │
└─────────┘                    └──────────┘                    └──────────┘
```

## Security Considerations

For production deployment:
- Use TLS/SSL (port 8883 for MQTT, 8884 for WebSocket)
- Implement authentication (username/password or certificates)
- Use topic prefixes with client IDs
- Consider topic-level access control (ACL)

