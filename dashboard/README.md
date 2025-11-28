# Weather Monitoring Dashboard

A real-time web dashboard for monitoring temperature, humidity, and controlling devices via MQTT.

## Features

- Real-time temperature and humidity display
- Interactive fan control (ON/OFF)
- Historical data chart (last 20 data points)
- MQTT connection management
- Responsive design

## Setup

1. **Open the dashboard**: Simply open `index.html` in a modern web browser (Chrome, Firefox, Edge)

2. **Configure MQTT Broker**:
   - Default: `ws://broker.hivemq.com:8000/mqtt` (public HiveMQ broker)
   - For local Mosquitto: `ws://localhost:9001` (if WebSocket enabled)
   - For secure broker: `wss://your-broker.com:8884`

3. **Connect**: Click the "Connect" button in the settings section

## Usage

- The dashboard automatically subscribes to:
  - `weather/temperature` - Temperature readings
  - `weather/humidity` - Humidity readings
  - `weather/status` - Device status updates

- Control commands are published to:
  - `weather/control/fan` - Send "ON" or "OFF" to control fan

## MQTT Broker Options

### Option 1: HiveMQ Cloud (Free, Recommended)
- Sign up at https://www.hivemq.com/cloud/
- Get WebSocket URL (format: `wss://your-instance.hivemq.cloud:8884`)
- Use in dashboard settings

### Option 2: Local Mosquitto
- Install Mosquitto broker
- Enable WebSocket support (port 9001)
- Use: `ws://localhost:9001`

### Option 3: Public HiveMQ (Testing Only)
- URL: `ws://broker.hivemq.com:8000/mqtt`
- No authentication required
- Good for testing, not for production

## Troubleshooting

- **Connection fails**: Check broker URL and ensure WebSocket is enabled
- **No data received**: Verify ESP32 is publishing to correct topics
- **Chart not updating**: Check browser console for errors

