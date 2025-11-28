# Hardware Schematic Reference

## Component List for Schematic

1. **ESP32 DevKit V1** (or similar)
2. **DHT22** Temperature & Humidity Sensor
3. **5V Relay Module** (Single Channel, Optocoupler)
4. **4.7kΩ Resistor** (Pull-up for DHT22, may be included in module)
5. **Controlled Device** (Fan/LED shown as load)

## Pin Connections

### ESP32 Connections
- **3.3V** → DHT22 VCC
- **GND** → Common ground (DHT22 GND, Relay GND)
- **GPIO 4** → DHT22 DATA
- **GPIO 2** → Relay IN
- **5V** (if available) → Relay VCC (or use 3.3V if relay supports it)

### DHT22 Connections
- **VCC** → ESP32 3.3V
- **GND** → ESP32 GND
- **DATA** → ESP32 GPIO 4
- **DATA** → 4.7kΩ resistor → ESP32 3.3V (pull-up)

### Relay Module Connections
- **VCC** → ESP32 5V (or 3.3V)
- **GND** → ESP32 GND
- **IN** → ESP32 GPIO 2
- **NO** (Normally Open) → Load positive
- **COM** (Common) → Load negative/ground

## Schematic Tools

### Recommended Software:
1. **Fritzing** (https://fritzing.org/) - Easy to use, good for breadboard view
2. **KiCad** (https://www.kicad.org/) - Professional, free, open-source
3. **draw.io** (https://app.diagrams.net/) - Online, simple circuit diagrams
4. **EasyEDA** (https://easyeda.com/) - Online, browser-based

### Schematic Requirements:
- Show all components clearly labeled
- Indicate pin numbers
- Show power connections (3.3V, 5V, GND)
- Include pull-up resistor for DHT22
- Label GPIO pins used
- Show controlled device connection

## Example Schematic Description

```
                    ┌─────────────┐
                    │    ESP32    │
                    │             │
        3.3V ───────┤ 3.3V        │
                    │             │
        GND ────────┤ GND         │
                    │             │
        GPIO4 ──────┤ GPIO4       │
                    │             │
        GPIO2 ──────┤ GPIO2       │
                    │             │
        5V ─────────┤ 5V          │
                    └─────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
    ┌───▼───┐       ┌────▼────┐      ┌───▼────┐
    │ DHT22 │       │  Relay  │      │  Load  │
    │       │       │ Module  │      │ (Fan)  │
    │ VCC───┼───3.3V│ VCC     │      │        │
    │ GND───┼───GND │ GND     │      │        │
    │ DATA──┼──GPIO4│ IN      │      │        │
    │       │       │         │      │        │
    │       │       │ NO──────┼──────┤ +      │
    │       │       │ COM─────┼──────┤ -      │
    └───┬───┘       └─────────┘      └────────┘
        │
        │ 4.7kΩ
        │
        └───3.3V
```

## Notes for Schematic

1. **Power Supply**: ESP32 can be powered via USB (5V) or external supply
2. **Pull-up Resistor**: DHT22 requires 4.7kΩ pull-up between DATA and VCC
3. **Relay Power**: Check relay module specs - some need 5V, others work with 3.3V
4. **Isolation**: Relay module provides optocoupler isolation for safety
5. **Ground**: All components share common ground

## Breadboard Layout Tips

- Place ESP32 on one side of breadboard
- DHT22 can be placed nearby with short wires
- Relay module can be separate or on breadboard
- Keep power and ground rails organized
- Use color coding: Red (power), Black (ground), Other colors (signals)

## Export Format

For submission, export schematic as:
- **PDF** (recommended for report)
- **PNG** (high resolution, for report)
- **SVG** (vector format, scalable)

## Checklist

- [ ] All components labeled
- [ ] Pin numbers indicated
- [ ] Power connections shown (3.3V, 5V, GND)
- [ ] GPIO pins labeled
- [ ] Pull-up resistor shown
- [ ] Controlled device connection shown
- [ ] Clean, professional appearance
- [ ] Export in PDF/PNG format

