# Fan Automation Feature

## Overview

The automation feature uses **professional hysteresis control** to automatically turn the fan on/off based on temperature and humidity thresholds. This industry-standard approach prevents rapid cycling and provides stable, energy-efficient operation. When the fan state changes, it automatically updates Firebase Realtime Database.

## Features

- **Hysteresis Control (Professional Approach)**: Separate ON and OFF thresholds create a deadband that prevents rapid cycling
- **Temperature-based control**: Set ON and OFF thresholds with conditions (< or >)
- **Humidity-based control**: Set ON and OFF thresholds with conditions (< or >)
- **Sensor Noise Filter**: Short delay (1-2 seconds) to filter sensor noise
- **Firebase integration**: Automatically saves fan status to Firebase Realtime Database
- **Manual override**: Manual fan control disables automation temporarily

## How It Works

1. **Enable Automation**: Toggle the "Auto Fan Control" switch
2. **Set Hysteresis Thresholds**: 
   - **Temperature**: Set ON threshold (e.g., < 28°C) and OFF threshold (e.g., < 26°C)
   - **Humidity**: Set ON threshold (e.g., < 70%) and OFF threshold (e.g., < 65%)
   - The difference between ON and OFF thresholds is the "deadband" (prevents cycling)
3. **Set Noise Filter**: Configure short delay (1-2 seconds) to filter sensor noise
4. **Automatic Control**: 
   - Fan turns ON when temperature OR humidity meets ON threshold
   - Fan turns OFF when temperature OR humidity meets OFF threshold
   - Deadband prevents rapid on/off cycling (professional HVAC approach)
5. **Firebase Updates**: Every fan state change is saved to Firebase at `fan/status`

## Hysteresis Explained

**Hysteresis** is the industry-standard method used in HVAC systems. Instead of using the same threshold for both ON and OFF, you use different thresholds:

- **Example**: Fan ON at temp < 28°C, OFF at temp < 26°C
- **Deadband**: 2°C difference (28 - 26 = 2°C)
- **Benefit**: Prevents rapid cycling when temperature hovers around a single threshold

This is more professional than simple delays because:
- ✅ More predictable behavior
- ✅ More energy efficient (fewer cycles)
- ✅ Standard in professional HVAC systems
- ✅ No arbitrary delays needed

## Firebase Data Structure

```json
{
  "fan": {
    "status": {
      "status": true,
      "isAuto": true,
      "timestamp": "2025-01-15T10:30:00.000Z",
      "temperature": 27.5,
      "humidity": 65.0
    }
  }
}
```

## Configuration

### Firebase Setup

1. Copy `firebase-config.js.example` to `firebase-config.js`
2. Get your Firebase credentials from Firebase Console
3. Fill in `apiKey` and `appId`
4. Enable Realtime Database in Firebase Console

### Automation Settings

- **Temperature ON Threshold**: Default < 28°C
- **Temperature OFF Threshold**: Default < 26°C (2°C deadband)
- **Humidity ON Threshold**: Default < 70%
- **Humidity OFF Threshold**: Default < 65% (5% deadband)
- **Noise Filter Delay**: Default 2 seconds (filters sensor noise)
- **Conditions**: Fan activates when temperature OR humidity meets ON threshold

## Behavior

- **ON Threshold Met**: When temperature/humidity meets ON threshold, short delay starts (noise filter)
- **After Delay**: Fan turns ON automatically and status is saved to Firebase
- **OFF Threshold Met**: Fan turns OFF immediately when OFF threshold is met (hysteresis prevents cycling)
- **Deadband Protection**: The difference between ON and OFF thresholds prevents rapid cycling
- **Manual Control**: User can manually control fan, which temporarily disables automation for that session

## Recommended Settings

### Temperature Control
- **Cooling Mode** (fan on when hot):
  - ON: temp > 28°C
  - OFF: temp < 26°C
  - Deadband: 2°C

- **Heating Mode** (fan on when cold):
  - ON: temp < 20°C
  - OFF: temp > 22°C
  - Deadband: 2°C

### Humidity Control
- **Dehumidification** (fan on when humid):
  - ON: humidity > 70%
  - OFF: humidity < 65%
  - Deadband: 5%

## Troubleshooting

- **Fan not turning on**: Check that automation is enabled and ON thresholds are set correctly
- **Fan not turning off**: Check that OFF thresholds are set correctly (should be different from ON)
- **Rapid cycling**: Increase the deadband (difference between ON and OFF thresholds)
- **Firebase not updating**: Verify `firebase-config.js` is configured and Realtime Database is enabled

