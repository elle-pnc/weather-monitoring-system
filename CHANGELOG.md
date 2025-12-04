# Changelog

All notable changes to the Weather Monitoring System will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned for v2.2 (Current Development - ver-2 branch)
- [ ] **BMP280 Integration**: Atmospheric pressure and temperature sensor
- [ ] **DHT11 Integration**: Additional humidity sensor (optional/backup)
- [ ] **DIY Anemometer**: Wind speed measurement
- [ ] **DIY Wind Vane**: Wind direction measurement (0-360°)
- [ ] **Rain Sensor**: Water/rain detection sensor
- [ ] **LDR Sensor**: Light intensity measurement
- [ ] **Enhanced MQTT Topics**: New topics for all sensor data
- [ ] **Expanded Dashboard UI**: New metric cards for all sensors
- [ ] **Advanced Charts**: Multiple chart views for different sensor groups
- [ ] **Improved Weather Logic**: Weather condition computation using all sensors
- [ ] **Advanced Automation**: Fan control considering wind, rain, pressure, light

### Planned for v4.0
- [ ] Feature ideas here
- [ ] Another feature idea

---

## [3.0.0] - 2025-01-XX

### Added
- Auto-connect to MQTT broker on page load with pre-filled credentials
- Brand updates: Icon.svg and Brand Name.svg integration
- Enhanced mobile chart scrolling and visibility fixes

### Changed
- Improved sidebar toggle behavior on desktop
- Enhanced mobile menu experience
- Better chart timestamp display formatting

### Fixed
- Mobile chart container scrolling issues
- Sidebar toggle positioning on different screen sizes

---

## [2.1.0] - 2025-01-XX

### Added
- High-tech chart enhancements with neon glow effects
- Enhanced UI improvements

### Changed
- Improved chart visualization aesthetics
- Better color schemes and gradients

---

## [2.0.0] - 2025-01-XX

### Added
- Fan automation system with multiple modes
- Firebase integration (if applicable)
- Enhanced features and controls

### Changed
- Major UI/UX improvements
- Enhanced dashboard functionality

---

## [1.0.0] - Initial Release

### Added
- Real-time temperature & humidity monitoring
- MQTT bidirectional communication
- RTOS multitasking (FreeRTOS on ESP32)
- Web dashboard with control interface
- Relay control (fan/LED/heater)
- Weather condition computation
- Historical data charting

---

## Version History

- **v3.0.0**: Auto-connect, brand updates, mobile fixes
- **v2.1.0**: High-tech chart enhancements
- **v2.0.0**: Fan automation, Firebase integration
- **v1.0.0**: Initial release

---

## How to Update This Changelog

When creating a new version:

1. Copy the `[Unreleased]` section
2. Update version number and date
3. Move planned items to appropriate sections (Added/Changed/Fixed/Removed)
4. Add new `[Unreleased]` section for future plans
5. Commit with message: `"Update CHANGELOG for v4.0"`

---

## Changelog Format

```markdown
## [Version] - YYYY-MM-DD

### Added
- New features

### Changed
- Changes to existing features

### Fixed
- Bug fixes

### Removed
- Removed features (if any)

### Security
- Security fixes (if any)
```

