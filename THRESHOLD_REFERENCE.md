# Weather Condition Thresholds Reference
## Real-World Meteorological Standards

This document provides the threshold values used in the weather condition computation, based on WMO (World Meteorological Organization), NOAA, and professional weather station standards.

---

## THRESHOLD VALUES

### 1. ATMOSPHERIC PRESSURE (hPa)
- **Sea Level Standard:** 1013.25 hPa
- **Very Low (Severe Storm):** < 980 hPa
- **Low (Stormy/Unstable):** 980-1000 hPa
- **Normal:** 1000-1020 hPa
- **High (Clear/Fair):** > 1020 hPa

**Source:** WMO standards, NOAA guidelines

---

### 2. RELATIVE HUMIDITY (%)
- **Very High (Fog/Dew):** > 90%
- **High (Cloudy/Rainy):** 70-90%
- **Moderate-High (Cloudy):** 60-70%
- **Moderate (Partly Cloudy):** 50-60%
- **Low (Clear/Sunny):** < 50%

**Source:** WMO standards (fog forms at >90% RH)

---

### 3. TEMPERATURE (°C)
- **Freezing:** < 0°C
- **Cold:** < 15°C
- **Moderate:** 15-25°C
- **Warm:** 25-30°C
- **Hot:** > 30°C
- **Very Hot:** > 35°C

**Source:** General meteorological classification

---

### 4. LIGHT INTENSITY (%)
- **Overcast/Cloudy:** < 20%
- **Clear/Sunny:** > 80%

**Note:** LDR sensors output percentage (0-100%), not lux. Thresholds are based on relative light levels.

---

### 5. RAIN SENSOR (%)
- **No Rain:** 0-20%
- **Light Rain:** 20-50%
- **Rain:** > 50%

**Note:** Rain sensors output analog percentage. Higher value = more water detected.

---

### 6. WIND SPEED (m/s) - Beaufort Scale
- **Calm:** 0-0.5 m/s
- **Light Air:** 0.5-1.5 m/s
- **Light Breeze:** 1.5-3.3 m/s
- **Gentle Breeze:** 3.3-5.5 m/s
- **Moderate Breeze:** 5.5-8.0 m/s
- **Fresh Breeze:** 8.0-10.8 m/s
- **Strong Breeze:** 10.8-13.9 m/s
- **Near Gale:** 13.9-17.2 m/s
- **Gale:** 17.2-20.8 m/s
- **Strong Gale:** 20.8-24.5 m/s
- **Storm:** > 24.5 m/s

**Current Threshold:** > 15 m/s (Near Gale) = Windy/Stormy conditions

**Source:** Beaufort Wind Scale (WMO standard)

---

### 7. WIND DIRECTION (°)
- **Range:** 0-360°
- **North:** 0° or 360°
- **East:** 90°
- **South:** 180°
- **West:** 270°

**Note:** Wind direction is displayed as-is, no thresholds needed.

---

## WEATHER CONDITION PRIORITY ORDER

The system evaluates conditions in this priority order (most specific first):

1. **Rain Sensor** (>50%) → Rainy
2. **Very Low Pressure** (<980 hPa) → Rainy (Severe Storm)
3. **Low Pressure** (980-1000 hPa) → Rainy (Stormy)
4. **High Wind** (>15 m/s) → Cloudy (Windy)
5. **Low Light** (<20%) → Cloudy (Overcast)
6. **Very High Humidity** (>90%) → Foggy
7. **Cold** (<15°C) → Cold
8. **Very Hot** (>35°C) → Hot
9. **Hot & Dry** (>30°C, <40% RH) → Hot
10. **Hot & Humid** (>30°C, 70-90% RH) → Cloudy
11. **High Humidity** (70-90% RH, 15-30°C) → Rainy
12. **Moderate-High Humidity** (60-70% RH, 15-30°C) → Cloudy
13. **Moderate Humidity** (50-60% RH) → Partly Cloudy
14. **Low Humidity** (<50% RH, >15°C) → Sunny
15. **High Pressure** (>1020 hPa) → Sunny
16. **Default** → Partly Cloudy

---

## ACCURACY STANDARDS

Based on professional weather station specifications (Davis Vantage Pro2):

- **Temperature:** ±0.5°C
- **Humidity:** ±3% (up to 90% RH), ±4% (above 90% RH)
- **Pressure:** ±1.0 hPa
- **Wind Speed:** ±0.2 m/s or ±5%
- **Wind Direction:** ±5°
- **Rainfall:** ±4% or 1 tip
- **Light:** ±5% of full scale

---

## CALIBRATION NOTES

1. **Pressure:** Should be calibrated to sea level (altitude compensation may be needed)
2. **Light:** LDR sensors need calibration based on circuit design (voltage divider)
3. **Rain:** Rain sensors need calibration based on sensor type and circuit
4. **Wind:** Anemometers need calibration factor based on sensor design

---

## REFERENCES

- World Meteorological Organization (WMO) Standards
- NOAA Weather Station Guidelines
- Davis Vantage Pro2 Specifications
- Beaufort Wind Scale
- ISO 7726 (Thermal environments)

---

**Last Updated:** Based on research conducted for v2.2 development

