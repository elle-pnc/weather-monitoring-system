# Weather Icons Setup Guide

## Overview
The weather card displays real-world time and computed weather conditions based on temperature and humidity readings.

## Weather Condition Computation

The system determines weather conditions using the following priority order:

1. **Rainy** - High humidity (>70%) AND temperature >20°C
2. **Foggy** - Very high humidity (>85%)
3. **Hot & Dry** - Low humidity (<40%) AND high temperature (>30°C)
4. **Cold** - Low temperature (<15°C)
5. **Cloudy** - High humidity (60-80%) AND moderate temperature (15-30°C)
6. **Partly Cloudy** - Medium humidity (50-60%)
7. **Sunny** - Low humidity (<50%) AND temperature >15°C

## SVG Icon Files Required

Please upload the following SVG icon files to the `dashboard/icons/` directory (or create this directory):

- `sunny.svg` - For sunny weather
- `cloudy.svg` - For cloudy weather
- `partly-cloudy.svg` - For partly cloudy weather
- `rainy.svg` - For rainy weather
- `foggy.svg` - For foggy/misty weather
- `hot.svg` - For hot and dry weather
- `cold.svg` - For cold weather

## Icon Integration

Once you upload the SVG files, update the `updateWeather()` function in `script.js` to load the icons:

```javascript
// In the updateWeather() function, replace the weatherIcon update section:
if (weatherIcon) {
    // Load SVG icon based on condition
    const iconPath = `icons/${condition}.svg`;
    weatherIcon.innerHTML = `<img src="${iconPath}" alt="${condition}" style="width: 100%; height: 100%;">`;
}
```

Or if you prefer to use inline SVG, you can load the SVG content directly:

```javascript
if (weatherIcon) {
    fetch(`icons/${condition}.svg`)
        .then(response => response.text())
        .then(svg => {
            weatherIcon.innerHTML = svg;
        })
        .catch(err => {
            console.error('Error loading weather icon:', err);
        });
}
```

## Current Features

- ✅ Real-world time display (12-hour format with AM/PM)
- ✅ Weather condition computation from temperature and humidity
- ✅ Weather status text display
- ✅ Weather card styling based on condition
- ⏳ SVG icon loading (pending icon uploads)

## File Structure

```
dashboard/
├── icons/
│   ├── sunny.svg
│   ├── cloudy.svg
│   ├── partly-cloudy.svg
│   ├── rainy.svg
│   ├── foggy.svg
│   ├── hot.svg
│   └── cold.svg
├── index.html
├── script.js
└── style.css
```

