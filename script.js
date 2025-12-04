// MQTT Client Configuration
let mqttClient = null;
let isConnected = false;

// Chart Configuration
let dataChart = null;
const maxDataPoints = 20;
let temperatureData = [];
let humidityData = [];
let pressureData = [];
let lightData = [];
let rainData = [];
let windSpeedData = [];
let windDirectionData = [];
let timeLabels = [];

// DOM Elements
const connectionStatus = document.getElementById('connectionStatus');
const statusDot = document.getElementById('statusDot');
const statusIndicator = document.getElementById('statusIndicator');
const temperatureDisplay = document.getElementById('temperature');
const humidityDisplay = document.getElementById('humidity');
const pressureDisplay = document.getElementById('pressure');
const lightDisplay = document.getElementById('light');
const rainDisplay = document.getElementById('rain');
const windSpeedDisplay = document.getElementById('windSpeed');
const windDirectionDisplay = document.getElementById('windDirection');
const fanStatusCard = document.getElementById('fanStatusCard');
const fanStatusDot = document.getElementById('fanStatusDot');
const fanStatusText = document.getElementById('fanStatusText');
const fanStatusSubtext = document.getElementById('fanStatusSubtext');
const fanIcon = document.getElementById('fanIcon');
const connectBtn = document.getElementById('connectBtn');
const disconnectBtn = document.getElementById('disconnectBtn');
const brokerUrlInput = document.getElementById('brokerUrl');
const clientIdInput = document.getElementById('clientId');
const mqttUsernameInput = document.getElementById('mqttUsername');
const mqttPasswordInput = document.getElementById('mqttPassword');
const timestamp = document.getElementById('timestamp');

// Weather DOM Elements
const weatherCard = document.getElementById('weatherCard');
const weatherIcon = document.getElementById('weatherIcon');
const weatherIconContainer = document.getElementById('weatherIconContainer');
const weatherTime = document.getElementById('weatherTime');
const weatherStatus = document.getElementById('weatherStatus');
const weatherLocation = document.getElementById('weatherLocation');

// Automation DOM Elements
const automationEnabled = document.getElementById('automationEnabled');
const fanMode = document.getElementById('fanMode');
const modeDescription = document.getElementById('modeDescription');
const currentTempSettings = document.getElementById('currentTempSettings');
const currentHumSettings = document.getElementById('currentHumSettings');

// Preset configurations based on weather conditions
const fanModePresets = {
    'very_hot': {
        description: 'Fan turns on when weather is Hot & Dry or Sunny',
        turnOnConditions: ['hot', 'sunny'],
        turnOffConditions: ['cold']
    },
    'hot': {
        description: 'Fan turns on when weather is Hot & Dry, Sunny, or Partly Cloudy',
        turnOnConditions: ['hot', 'sunny', 'partly-cloudy'],
        turnOffConditions: ['cold']
    },
    'always_on': {
        description: 'Fan stays on regardless of weather conditions',
        turnOnConditions: ['always'],
        turnOffConditions: []
    }
};

// Automation State
let automationActive = false;
let currentTemp = null;
let currentHum = null;
let currentPressure = null;
let currentLight = null;
let currentRain = null;
let currentWindSpeed = null;
let currentWindDirection = null;
let fanAutoState = false;
let activationTimer = null;
let conditionMetSince = null;

// Update timestamp (12-hour format with AM/PM for Philippines)
function updateTimestamp() {
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { 
        hour12: true,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    if (timestamp) timestamp.textContent = time;
}

setInterval(updateTimestamp, 1000);
updateTimestamp();

// Update weather time every second
setInterval(updateWeatherTime, 1000);
updateWeatherTime();

// Initialize weather display
updateWeather();

// Initialize Chart with High-Tech Dark Theme
function initializeChart() {
    const ctx = document.getElementById('dataChart').getContext('2d');
    
    // High-tech color palette with neon effects
    const tempColor = '#ff6b35';
    const tempColorGlow = 'rgba(255, 107, 53, 0.6)';
    const humColor = '#4dabf7';
    const humColorGlow = 'rgba(77, 171, 247, 0.6)';
    const gridColor = 'rgba(139, 148, 158, 0.08)';
    const gridColorStrong = 'rgba(139, 148, 158, 0.15)';
    const textColor = '#8b949e';
    
    // Create gradient fills for high-tech look
    const tempGradient = ctx.createLinearGradient(0, 0, 0, 400);
    tempGradient.addColorStop(0, 'rgba(255, 107, 53, 0.25)');
    tempGradient.addColorStop(0.5, 'rgba(255, 107, 53, 0.12)');
    tempGradient.addColorStop(1, 'rgba(255, 107, 53, 0.02)');
    
    const humGradient = ctx.createLinearGradient(0, 0, 0, 400);
    humGradient.addColorStop(0, 'rgba(77, 171, 247, 0.25)');
    humGradient.addColorStop(0.5, 'rgba(77, 171, 247, 0.12)');
    humGradient.addColorStop(1, 'rgba(77, 171, 247, 0.02)');
    
    // Pressure color
    const pressColor = '#bc8cff';
    const pressColorGlow = 'rgba(188, 140, 255, 0.6)';
    const pressGradient = ctx.createLinearGradient(0, 0, 0, 400);
    pressGradient.addColorStop(0, 'rgba(188, 140, 255, 0.25)');
    pressGradient.addColorStop(0.5, 'rgba(188, 140, 255, 0.12)');
    pressGradient.addColorStop(1, 'rgba(188, 140, 255, 0.02)');
    
    // Light color
    const lightColor = '#ffd700';
    const lightColorGlow = 'rgba(255, 215, 0, 0.6)';
    const lightGradient = ctx.createLinearGradient(0, 0, 0, 400);
    lightGradient.addColorStop(0, 'rgba(255, 215, 0, 0.25)');
    lightGradient.addColorStop(0.5, 'rgba(255, 215, 0, 0.12)');
    lightGradient.addColorStop(1, 'rgba(255, 215, 0, 0.02)');
    
    // Rain color
    const rainColor = '#4a90e2';
    const rainColorGlow = 'rgba(74, 144, 226, 0.6)';
    const rainGradient = ctx.createLinearGradient(0, 0, 0, 400);
    rainGradient.addColorStop(0, 'rgba(74, 144, 226, 0.25)');
    rainGradient.addColorStop(0.5, 'rgba(74, 144, 226, 0.12)');
    rainGradient.addColorStop(1, 'rgba(74, 144, 226, 0.02)');
    
    // Wind speed color
    const windSpeedColor = '#7c3aed';
    const windSpeedColorGlow = 'rgba(124, 58, 237, 0.6)';
    const windSpeedGradient = ctx.createLinearGradient(0, 0, 0, 400);
    windSpeedGradient.addColorStop(0, 'rgba(124, 58, 237, 0.25)');
    windSpeedGradient.addColorStop(0.5, 'rgba(124, 58, 237, 0.12)');
    windSpeedGradient.addColorStop(1, 'rgba(124, 58, 237, 0.02)');
    
    // Wind direction color
    const windDirColor = '#06b6d4';
    const windDirColorGlow = 'rgba(6, 182, 212, 0.6)';
    const windDirGradient = ctx.createLinearGradient(0, 0, 0, 400);
    windDirGradient.addColorStop(0, 'rgba(6, 182, 212, 0.25)');
    windDirGradient.addColorStop(0.5, 'rgba(6, 182, 212, 0.12)');
    windDirGradient.addColorStop(1, 'rgba(6, 182, 212, 0.02)');
    
    dataChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: timeLabels,
            datasets: [
                {
                    label: 'Temperature',
                    data: temperatureData,
                    borderColor: tempColor,
                    backgroundColor: tempGradient,
                    borderWidth: 3,
                    tension: 0.5,
                    fill: true,
                    pointRadius: 0,
                    pointHoverRadius: 8,
                    pointBackgroundColor: tempColor,
                    pointBorderColor: '#0d1117',
                    pointBorderWidth: 3,
                    pointHoverBackgroundColor: tempColor,
                    pointHoverBorderColor: '#ffffff',
                    pointHoverBorderWidth: 3,
                    yAxisID: 'y'
                },
                {
                    label: 'Humidity',
                    data: humidityData,
                    borderColor: humColor,
                    backgroundColor: humGradient,
                    borderWidth: 3,
                    tension: 0.5,
                    fill: true,
                    pointRadius: 0,
                    pointHoverRadius: 8,
                    pointBackgroundColor: humColor,
                    pointBorderColor: '#0d1117',
                    pointBorderWidth: 3,
                    pointHoverBackgroundColor: humColor,
                    pointHoverBorderColor: '#ffffff',
                    pointHoverBorderWidth: 3,
                    yAxisID: 'y1'
                },
                {
                    label: 'Pressure',
                    data: pressureData,
                    borderColor: pressColor,
                    backgroundColor: pressGradient,
                    borderWidth: 3,
                    tension: 0.5,
                    fill: true,
                    pointRadius: 0,
                    pointHoverRadius: 8,
                    pointBackgroundColor: pressColor,
                    pointBorderColor: '#0d1117',
                    pointBorderWidth: 3,
                    pointHoverBackgroundColor: pressColor,
                    pointHoverBorderColor: '#ffffff',
                    pointHoverBorderWidth: 3,
                    yAxisID: 'y2'
                },
                {
                    label: 'Light',
                    data: lightData,
                    borderColor: lightColor,
                    backgroundColor: lightGradient,
                    borderWidth: 3,
                    tension: 0.5,
                    fill: true,
                    pointRadius: 0,
                    pointHoverRadius: 8,
                    pointBackgroundColor: lightColor,
                    pointBorderColor: '#0d1117',
                    pointBorderWidth: 3,
                    pointHoverBackgroundColor: lightColor,
                    pointHoverBorderColor: '#ffffff',
                    pointHoverBorderWidth: 3,
                    yAxisID: 'y1'  // Share axis with humidity (both 0-100%)
                },
                {
                    label: 'Rain',
                    data: rainData,
                    borderColor: rainColor,
                    backgroundColor: rainGradient,
                    borderWidth: 3,
                    tension: 0.5,
                    fill: true,
                    pointRadius: 0,
                    pointHoverRadius: 8,
                    pointBackgroundColor: rainColor,
                    pointBorderColor: '#0d1117',
                    pointBorderWidth: 3,
                    pointHoverBackgroundColor: rainColor,
                    pointHoverBorderColor: '#ffffff',
                    pointHoverBorderWidth: 3,
                    yAxisID: 'y1'  // Share axis with humidity and light (all 0-100%)
                },
                {
                    label: 'Wind Speed',
                    data: windSpeedData,
                    borderColor: windSpeedColor,
                    backgroundColor: windSpeedGradient,
                    borderWidth: 3,
                    tension: 0.5,
                    fill: true,
                    pointRadius: 0,
                    pointHoverRadius: 8,
                    pointBackgroundColor: windSpeedColor,
                    pointBorderColor: '#0d1117',
                    pointBorderWidth: 3,
                    pointHoverBackgroundColor: windSpeedColor,
                    pointHoverBorderColor: '#ffffff',
                    pointHoverBorderWidth: 3,
                    yAxisID: 'y3'  // Separate axis for wind speed (m/s)
                },
                {
                    label: 'Wind Direction',
                    data: windDirectionData,
                    borderColor: windDirColor,
                    backgroundColor: windDirGradient,
                    borderWidth: 3,
                    tension: 0.5,
                    fill: true,
                    pointRadius: 0,
                    pointHoverRadius: 8,
                    pointBackgroundColor: windDirColor,
                    pointBorderColor: '#0d1117',
                    pointBorderWidth: 3,
                    pointHoverBackgroundColor: windDirColor,
                    pointHoverBorderColor: '#ffffff',
                    pointHoverBorderWidth: 3,
                    yAxisID: 'y4'  // Separate axis for wind direction (0-360°)
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 800,
                easing: 'easeOutQuart',
                x: {
                    duration: 0
                },
                y: {
                    duration: 800
                }
            },
            transitions: {
                show: {
                    animations: {
                        x: {
                            from: 0
                        },
                        y: {
                            from: 0
                        }
                    }
                },
                hide: {
                    animations: {
                        x: {
                            to: 0
                        },
                        y: {
                            to: 0
                        }
                    }
                }
            },
            interaction: {
                mode: 'index',
                intersect: false,
            },
            elements: {
                point: {
                    hoverRadius: 8,
                    hoverBorderWidth: 3
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    align: 'end',
                    labels: {
                        color: textColor,
                        font: {
                            family: 'Space Grotesk, sans-serif',
                            size: 12,
                            weight: '600'
                        },
                        padding: 24,
                        usePointStyle: true,
                        pointStyle: 'circle',
                        boxWidth: 10,
                        boxHeight: 10,
                        pointStyleWidth: 10
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(13, 17, 23, 0.98)',
                    titleColor: '#f0f6fc',
                    bodyColor: '#8b949e',
                    borderColor: '#30363d',
                    borderWidth: 1.5,
                    padding: 14,
                    cornerRadius: 10,
                    displayColors: true,
                    titleFont: {
                        family: 'Space Grotesk, sans-serif',
                        size: 13,
                        weight: '600'
                    },
                    bodyFont: {
                        family: 'JetBrains Mono, monospace',
                        size: 13,
                        weight: '500'
                    },
                    boxPadding: 6,
                    usePointStyle: true,
                    callbacks: {
                        title: function(context) {
                            return context[0].label || '';
                        },
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                let value;
                                if (context.dataset.label === 'Temperature') {
                                    value = context.parsed.y.toFixed(1) + '°C';
                                } else if (context.dataset.label === 'Humidity' || context.dataset.label === 'Light' || context.dataset.label === 'Rain') {
                                    value = context.parsed.y.toFixed(1) + '%';
                                } else if (context.dataset.label === 'Pressure') {
                                    value = context.parsed.y.toFixed(1) + ' hPa';
                                } else if (context.dataset.label === 'Wind Speed') {
                                    value = context.parsed.y.toFixed(1) + ' m/s';
                                } else if (context.dataset.label === 'Wind Direction') {
                                    value = context.parsed.y.toFixed(0) + '°';
                                } else {
                                    value = context.parsed.y.toFixed(1);
                                }
                                label += value;
                            }
                            return label;
                        },
                        labelColor: function(context) {
                            return {
                                borderColor: context.dataset.borderColor,
                                backgroundColor: context.dataset.borderColor,
                                borderWidth: 3,
                                borderRadius: 2
                            };
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: textColor,
                        font: {
                            family: 'JetBrains Mono, monospace',
                            size: 11,
                            weight: '500'
                        },
                        maxRotation: 0,
                        padding: 8,
                        maxTicksLimit: 10, // Limit number of visible labels to prevent overlap
                        callback: function(value, index, ticks) {
                            const label = this.getLabelForValue(value);
                            const totalTicks = ticks.length;
                            
                            // When there are many data points, show fewer labels
                            if (totalTicks > 12) {
                                const step = Math.ceil(totalTicks / 8); // Show ~8 labels max
                                if (index % step !== 0 && index !== ticks.length - 1) {
                                    return '';
                                }
                            }
                            
                            // Remove seconds from label if it has them (for cleaner display)
                            if (label.includes(':') && label.match(/:\d{2}:/)) {
                                // Format: HH:MM:SS AM/PM -> HH:MM AM/PM
                                const parts = label.split(':');
                                if (parts.length >= 3) {
                                    const ampm = parts[2].split(' ')[1] || '';
                                    return parts[0] + ':' + parts[1] + (ampm ? ' ' + ampm : '');
                                }
                            }
                            
                            return label;
                        }
                    },
                    grid: {
                        color: gridColor,
                        drawBorder: false,
                        lineWidth: 1,
                        drawTicks: false,
                        z: 0
                    },
                    border: {
                        display: false
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Temperature (°C)',
                        color: textColor,
                        font: {
                            family: 'Space Grotesk, sans-serif',
                            size: 11,
                            weight: '500'
                        },
                        padding: { top: 0, bottom: 12 }
                    },
                    ticks: {
                        color: textColor,
                        font: {
                            family: 'JetBrains Mono, monospace',
                            size: 11
                        },
                        padding: 8
                    },
                    grid: {
                        color: gridColor,
                        drawBorder: false,
                        lineWidth: 1,
                        drawTicks: false,
                        z: 1
                    },
                    border: {
                        display: false
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Humidity (%)',
                        color: textColor,
                        font: {
                            family: 'Space Grotesk, sans-serif',
                            size: 11,
                            weight: '500'
                        },
                        padding: { top: 0, bottom: 12 }
                    },
                    ticks: {
                        color: textColor,
                        font: {
                            family: 'JetBrains Mono, monospace',
                            size: 11
                        },
                        padding: 8
                    },
                    grid: {
                        drawOnChartArea: false,
                        drawBorder: false,
                        drawTicks: false
                    },
                    border: {
                        display: false
                    }
                }
            }
        }
    });
}

// Connect to MQTT Broker
function connectToMQTT() {
    // Disconnect existing connection first to prevent duplicates
    if (mqttClient) {
        console.log('Disconnecting existing MQTT client...');
        mqttClient.end();
        mqttClient = null;
        isConnected = false;
    }
    
    const brokerUrl = brokerUrlInput.value || 'ws://broker.hivemq.com:8000/mqtt';
    const clientId = clientIdInput.value || 'dashboard-' + Math.random().toString(16).substr(2, 8);
    const username = mqttUsernameInput ? mqttUsernameInput.value.trim() : '';
    const password = mqttPasswordInput ? mqttPasswordInput.value.trim() : '';
    
    console.log('Connecting to MQTT broker:', brokerUrl);
    
    // Check if credentials are required for secure brokers
    if (brokerUrl.startsWith('wss://') && (!username || !password)) {
        alert('Username and password are required for HiveMQ Cloud. Please enter your credentials.');
        return;
    }
    
    try {
        const connectOptions = {
            clientId: clientId,
            clean: true,
            reconnectPeriod: 1000,
            connectTimeout: 10000, // 10 second timeout
            keepalive: 60, // Keep alive interval
        };
        
        // Add authentication if provided
        if (username && password) {
            connectOptions.username = username;
            connectOptions.password = password;
            console.log('Using authentication credentials');
        }
        
        mqttClient = mqtt.connect(brokerUrl, connectOptions);
        
        mqttClient.on('connect', () => {
            console.log('Connected to MQTT broker');
            isConnected = true;
            updateConnectionStatus(true);
            
            // Subscribe to topics (only sensor data, NOT fan status)
            // Dashboard determines fan status based on sensor data + automation
            mqttClient.subscribe('weather/temperature', (err) => {
                if (!err) console.log('Subscribed to weather/temperature');
            });
            
            mqttClient.subscribe('weather/humidity', (err) => {
                if (!err) console.log('Subscribed to weather/humidity');
            });
            
            mqttClient.subscribe('weather/status', (err) => {
                if (!err) console.log('Subscribed to weather/status (sensor data only)');
            });
        });
        
        mqttClient.on('message', (topic, message) => {
            const data = message.toString();
            console.log(`Received on ${topic}: ${data}`);
            
            handleMQTTMessage(topic, data);
        });
        
        mqttClient.on('error', (error) => {
            console.error('❌ MQTT Error:', error);
            console.error('Error details:', error.message, error.code);
            isConnected = false;
            updateConnectionStatus(false);
        });
        
        mqttClient.on('close', () => {
            console.log('⚠️ MQTT connection closed');
            isConnected = false;
            updateConnectionStatus(false);
        });
        
        mqttClient.on('offline', () => {
            console.log('⚠️ MQTT client offline');
            isConnected = false;
            updateConnectionStatus(false);
        });
        
        mqttClient.on('reconnect', () => {
            console.log('🔄 MQTT reconnecting...');
        });
        
    } catch (error) {
        console.error('Failed to connect:', error);
        alert('Failed to connect to MQTT broker. Check the broker URL.');
    }
}

// Disconnect from MQTT
function disconnectFromMQTT() {
    if (mqttClient) {
        mqttClient.end();
        mqttClient = null;
        isConnected = false;
        updateConnectionStatus(false);
        console.log('Disconnected from MQTT broker');
    }
}

// Handle incoming MQTT messages
function handleMQTTMessage(topic, message) {
    if (topic === 'weather/temperature') {
        const temp = parseFloat(message);
        if (!isNaN(temp)) {
            updateTemperature(temp);
        }
    } else if (topic === 'weather/humidity') {
        const hum = parseFloat(message);
        if (!isNaN(hum)) {
            updateHumidity(hum);
        }
    } else if (topic === 'weather/pressure') {
        const press = parseFloat(message);
        if (!isNaN(press)) {
            updatePressure(press);
        }
    } else if (topic === 'weather/light') {
        const light = parseFloat(message);
        if (!isNaN(light)) {
            updateLight(light);
        }
    } else if (topic === 'weather/rain') {
        const rain = parseFloat(message);
        if (!isNaN(rain)) {
            updateRain(rain);
        }
    } else if (topic === 'weather/wind_speed') {
        const windSpeed = parseFloat(message);
        if (!isNaN(windSpeed)) {
            updateWindSpeed(windSpeed);
        }
    } else if (topic === 'weather/wind_direction') {
        const windDir = parseFloat(message);
        if (!isNaN(windDir)) {
            updateWindDirection(windDir);
        }
    } else if (topic === 'weather/status') {
        try {
            const status = JSON.parse(message);
            // Only read sensor data from ESP32, NOT fan status
            // Dashboard determines fan status based on sensor data + automation rules
            if (status.temperature !== undefined) updateTemperature(status.temperature);
            if (status.humidity !== undefined) updateHumidity(status.humidity);
            if (status.pressure !== undefined) updatePressure(status.pressure);
            if (status.light !== undefined) updateLight(status.light);
            if (status.rain !== undefined) updateRain(status.rain);
            if (status.windSpeed !== undefined) updateWindSpeed(status.windSpeed);
            if (status.windDirection !== undefined) updateWindDirection(status.windDirection);
            // Ignore status.fan - dashboard is the source of truth for fan status
        } catch (e) {
            console.error('Error parsing status JSON:', e);
        }
    }
}

// Update temperature display
function updateTemperature(value) {
    if (temperatureDisplay) {
        temperatureDisplay.textContent = value.toFixed(1);
        addDataPoint('temperature', value);
    }
    currentTemp = value;
    checkAutomation();
    updateWeather();
}

// Update humidity display
function updateHumidity(value) {
    if (humidityDisplay) {
        humidityDisplay.textContent = value.toFixed(1);
        addDataPoint('humidity', value);
    }
    currentHum = value;
    checkAutomation();
    updateWeather();
}

// Update pressure display
function updatePressure(value) {
    if (pressureDisplay) {
        pressureDisplay.textContent = value.toFixed(1);
        addDataPoint('pressure', value);
    }
    currentPressure = value;
    updateWeather();
}

// Update light display
function updateLight(value) {
    if (lightDisplay) {
        lightDisplay.textContent = value.toFixed(1);
        addDataPoint('light', value);
    }
    currentLight = value;
    updateWeather();
}

// Update rain display
function updateRain(value) {
    if (rainDisplay) {
        rainDisplay.textContent = value.toFixed(1);
        addDataPoint('rain', value);
    }
    currentRain = value;
    updateWeather();
}

// Update wind speed display
function updateWindSpeed(value) {
    if (windSpeedDisplay) {
        windSpeedDisplay.textContent = value.toFixed(1);
        addDataPoint('windSpeed', value);
    }
    currentWindSpeed = value;
    updateWeather();
}

// Update wind direction display
function updateWindDirection(value) {
    if (windDirectionDisplay) {
        // Normalize to 0-360 range
        let normalized = value % 360;
        if (normalized < 0) normalized += 360;
        windDirectionDisplay.textContent = normalized.toFixed(0);
        addDataPoint('windDirection', normalized);
    }
    currentWindDirection = value;
    updateWeather();
}

// Compute weather condition based on temperature, humidity, pressure, light, rain, and wind
// Based on real-world meteorological standards (WMO, NOAA, Davis Vantage Pro2):
// - HIGH humidity (>90%) = Foggy (WMO standard: >90% for fog/dew)
// - HIGH humidity (70-90%) = Rainy/Cloudy (moisture in air = precipitation potential)
// - LOW humidity (<50%) = Sunny/Clear (dry air = clear skies)
// - MEDIUM humidity (50-70%) = Partly Cloudy (transitional)
// - VERY LOW pressure (<980 hPa) = Severe storm (WMO: <980 hPa = very unstable)
// - LOW pressure (980-1000 hPa) = Stormy/Unstable weather
// - NORMAL pressure (1000-1020 hPa) = Variable conditions
// - HIGH pressure (>1020 hPa) = Stable/Clear weather (WMO: >1020 hPa = fair weather)
// - LOW light (<20%) = Overcast/Cloudy conditions
// - HIGH light (>80%) = Clear/Sunny conditions
// - HIGH rain (>50%) = Rainy conditions (direct detection)
// - HIGH wind speed (>15 m/s = Near Gale, Beaufort Scale) = Windy/Stormy conditions
function computeWeatherCondition(temp, hum, press = null, light = null, rain = null, windSpeed = null) {
    if (temp === null || hum === null) {
        return 'unknown';
    }
    
    // Priority order: most specific conditions first (based on meteorological standards)
    
    // 0. Rainy: High rain sensor reading (>50%) - direct rain detection
    // Real-world: Rain sensor directly detects water presence
    if (rain !== null && rain > 50) {
        return 'rainy';  // Rain sensor detects water = rainy
    }
    
    // 0.5. Severe Storm: Very low pressure (<980 hPa) - WMO standard for severe storms
    if (press !== null && press < 980) {
        return 'rainy';  // Very low pressure = severe stormy conditions
    }
    
    // 0.6. Stormy: Low pressure (980-1000 hPa) - indicates unstable weather
    // WMO: 980-1000 hPa = low pressure system (unstable/stormy)
    if (press !== null && press >= 980 && press < 1000) {
        return 'rainy';  // Low pressure = stormy/rainy conditions
    }
    
    // 0.7. Windy/Stormy: High wind speed (>15 m/s = Near Gale, Beaufort Scale)
    // Beaufort Scale: 15 m/s = Near Gale (13.9-17.2 m/s range)
    if (windSpeed !== null && windSpeed > 15) {
        return 'cloudy';  // High wind often associated with stormy/cloudy weather
    }
    
    // 0.8. Overcast: Low light (<20%) - indicates cloudy/overcast
    // Real-world: Low light levels indicate cloud cover
    if (light !== null && light < 20) {
        return 'cloudy';  // Low light = overcast conditions
    }
    
    // 1. Foggy: Very high humidity (>90%) - WMO standard for fog/dew formation
    // Updated from 85% to 90% based on meteorological standards
    if (hum > 90) {
        return 'foggy';
    }
    
    // 2. Cold: Low temperature (<15°C) - temperature-based, regardless of humidity
    if (temp < 15) {
        return 'cold';
    }
    
    // 3. Hot & Dry: High temp (>30°C) AND low humidity (<40%) - desert-like conditions
    // Real-world: High temp + low humidity = hot and dry (desert conditions)
    if (temp > 30 && hum < 40) {
        return 'hot';
    }
    
    // 3.5. Very Hot: Very high temp (>35°C) - extreme heat conditions
    // WMO: >35°C = extreme heat (heat stroke risk)
    if (temp > 35) {
        return 'hot';  // Very hot conditions
    }
    
    // 4. Hot & Humid: High temp (>30°C) AND high humidity (70-90%) - tropical/steamy
    // Real-world: High temp + high humidity = tropical/steamy conditions
    if (temp > 30 && hum >= 70 && hum <= 90) {
        return 'cloudy'; // Hot and humid = overcast/cloudy, not rainy
    }
    
    // 5. Rainy: HIGH humidity (70-90%) AND moderate temp (15-30°C)
    // WMO: 70-90% humidity = high humidity (precipitation potential)
    // High humidity = moisture in air = rainy conditions
    if (hum >= 70 && hum <= 90 && temp >= 15 && temp <= 30) {
        return 'rainy';
    }
    
    // 6. Cloudy: Medium-high humidity (60-70%) AND moderate temp (15-30°C)
    // WMO: 60-70% = moderate-high humidity (cloudy but not necessarily raining)
    if (hum >= 60 && hum < 70 && temp >= 15 && temp <= 30) {
        return 'cloudy';
    }
    
    // 7. Partly Cloudy: Medium humidity (50-60%) - transitional conditions
    if (hum >= 50 && hum < 60) {
        return 'partly-cloudy';
    }
    
    // 8. Sunny: LOW humidity (<50%) AND moderate to high temp (>15°C)
    // WMO: <50% humidity = low humidity (clear/dry conditions)
    // Low humidity = dry air = clear/sunny skies
    if (hum < 50 && temp > 15) {
        return 'sunny';
    }
    
    // 9. High Pressure Clear: High pressure (>1020 hPa) indicates fair weather
    // WMO: >1020 hPa = high pressure (stable/fair weather)
    if (press !== null && press > 1020) {
        return 'sunny';  // High pressure = clear/fair weather
    }
    
    // Default: Partly Cloudy (fallback for edge cases)
    return 'partly-cloudy';
}

// Update weather display
function updateWeather() {
    const condition = computeWeatherCondition(currentTemp, currentHum, currentPressure, currentLight, currentRain, currentWindSpeed);
    
    // Update weather location (top label)
    if (weatherLocation) {
        weatherLocation.textContent = 'Weather';
    }
    
    // Update weather status text (bottom - like date in clock widget)
    // Store condition for date formatting
    if (weatherStatus) {
        const statusText = {
            'sunny': 'Sunny',
            'cloudy': 'Cloudy',
            'partly-cloudy': 'Partly Cloudy',
            'rainy': 'Rainy',
            'foggy': 'Foggy',
            'hot': 'Hot & Dry',
            'cold': 'Cold',
            'unknown': 'Unknown'
        };
        const conditionText = statusText[condition] || 'Unknown';
        // Update status, date will be added by updateWeatherTime
        weatherStatus.dataset.condition = conditionText;
        // Update immediately with date
        updateWeatherTime();
    }
    
    // Update weather card class for styling
    if (weatherCard) {
        // Remove all weather condition classes
        weatherCard.classList.remove('weather-sunny', 'weather-cloudy', 'weather-partly-cloudy', 
                                     'weather-rainy', 'weather-foggy', 'weather-hot', 'weather-cold');
        // Add current condition class
        if (condition !== 'unknown') {
            weatherCard.classList.add(`weather-${condition}`);
        }
    }
    
    // Update weather icon - load SVG based on condition (decorative, top-right)
    if (weatherIcon && weatherIconContainer) {
        // Map condition names to actual SVG file names
        const iconMap = {
            'sunny': 'Sunny.svg',
            'cloudy': 'Cloudy.svg',
            'partly-cloudy': 'Partly Cloudy.svg',
            'rainy': 'Rainy.svg',
            'foggy': 'Foggy.svg',
            'hot': 'Hot and Dry.svg',
            'cold': 'Cold.svg',
            'unknown': null
        };
        
        const iconFileName = iconMap[condition];
        
        if (iconFileName) {
            // Load SVG file
            fetch(iconFileName)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Failed to load ${iconFileName}`);
                    }
                    return response.text();
                })
                .then(svgContent => {
                    // Replace the icon content with the loaded SVG
                    weatherIcon.innerHTML = svgContent;
                    // Ensure SVG scales properly
                    const svg = weatherIcon.querySelector('svg');
                    if (svg) {
                        svg.setAttribute('width', '48');
                        svg.setAttribute('height', '48');
                        svg.setAttribute('viewBox', svg.getAttribute('viewBox') || '0 0 24 24');
                        svg.style.fill = 'currentColor';
                        svg.style.color = 'currentColor';
                    }
                })
                .catch(error => {
                    console.error('Error loading weather icon:', error);
                    // Keep default icon on error
                });
        }
    }
}

// Update real-world time in weather card (clock widget style)
function updateWeatherTime() {
    if (weatherTime) {
        const now = new Date();
        // Format: HH:MM AM/PM (like clock widget)
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        const timeString = `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`;
        weatherTime.textContent = timeString;
    }
    
    // Update date below status (like clock widget)
    if (weatherStatus) {
        const now = new Date();
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const dayName = days[now.getDay()];
        const day = now.getDate();
        const month = months[now.getMonth()];
        const dateString = `${dayName}, ${day} ${month}`;
        
        // Get weather condition from dataset or use current text
        const condition = weatherStatus.dataset.condition || weatherStatus.textContent.split(' • ')[0];
        // Combine status and date
        if (condition && condition !== '--' && condition !== 'Unknown') {
            weatherStatus.textContent = `${condition} • ${dateString}`;
        } else {
            weatherStatus.textContent = dateString;
        }
    }
}

// Update fan status with visual indicator
function updateFanStatus(state) {
    if (!fanStatusCard || !fanStatusDot || !fanStatusText || !fanStatusSubtext) {
        console.warn('Fan status elements not found');
        return;
    }

    if (state) {
        // Fan is ON
        fanStatusCard.classList.add('fan-on');
        fanStatusCard.classList.remove('fan-off');
        fanStatusDot.classList.add('fan-on');
        fanStatusDot.classList.remove('fan-off');
        fanStatusText.classList.add('fan-on');
        fanStatusText.classList.remove('fan-off');
        fanStatusText.textContent = 'ON';
        fanStatusSubtext.textContent = 'Running';
    } else {
        // Fan is OFF
        fanStatusCard.classList.add('fan-off');
        fanStatusCard.classList.remove('fan-on');
        fanStatusDot.classList.add('fan-off');
        fanStatusDot.classList.remove('fan-on');
        fanStatusText.classList.add('fan-off');
        fanStatusText.classList.remove('fan-on');
        fanStatusText.textContent = 'OFF';
        fanStatusSubtext.textContent = 'Standby';
    }
    
    console.log('Fan status updated to:', state ? 'ON' : 'OFF');
}

// Add data point to chart
function addDataPoint(type, value) {
    const now = new Date();
    
    if (type === 'temperature') {
        temperatureData.push(value);
        if (temperatureData.length > maxDataPoints) {
            temperatureData.shift();
        }
    } else if (type === 'humidity') {
        humidityData.push(value);
        if (humidityData.length > maxDataPoints) {
            humidityData.shift();
        }
    } else if (type === 'pressure') {
        pressureData.push(value);
        if (pressureData.length > maxDataPoints) {
            pressureData.shift();
        }
    } else if (type === 'light') {
        lightData.push(value);
        if (lightData.length > maxDataPoints) {
            lightData.shift();
        }
    } else if (type === 'rain') {
        rainData.push(value);
        if (rainData.length > maxDataPoints) {
            rainData.shift();
        }
    } else if (type === 'windSpeed') {
        windSpeedData.push(value);
        if (windSpeedData.length > maxDataPoints) {
            windSpeedData.shift();
        }
    } else if (type === 'windDirection') {
        windDirectionData.push(value);
        if (windDirectionData.length > maxDataPoints) {
            windDirectionData.shift();
        }
    }
    
    // Update time labels when we have new data
    // Use adaptive format: HH:MM when many points, HH:MM:SS when few
    const totalPoints = Math.max(temperatureData.length, humidityData.length, pressureData.length || 0, lightData.length || 0, rainData.length || 0, windSpeedData.length || 0, windDirectionData.length || 0);
    
    // Add time label if we have any new data
    if (totalPoints > timeLabels.length) {
        const showSeconds = totalPoints <= 10; // Show seconds only when 10 or fewer points
        
        const timeLabel = now.toLocaleTimeString('en-US', { 
            hour12: true,
            hour: '2-digit',
            minute: '2-digit',
            second: showSeconds ? '2-digit' : undefined
        });
        
        timeLabels.push(timeLabel);
        if (timeLabels.length > maxDataPoints) {
            timeLabels.shift();
        }
    }
    
    // Update chart
    if (dataChart) {
        dataChart.update('none');
    }
}


// Update connection status UI
function updateConnectionStatus(connected) {
    if (connected) {
        if (connectionStatus) {
            connectionStatus.textContent = 'Online';
        }
        if (statusDot) {
            statusDot.classList.add('online');
        }
    } else {
        if (connectionStatus) {
            connectionStatus.textContent = 'Offline';
        }
        if (statusDot) {
            statusDot.classList.remove('online');
        }
    }
}

// Send fan control command
function sendFanCommand(command, isAuto = false) {
    const fanState = command === 'ON';
    
    // Update UI immediately (regardless of MQTT connection)
    updateFanStatus(fanState);
    if (isAuto) {
        fanAutoState = fanState;
    }
    
    // Send MQTT command to ESP32
    // ESP32 only receives commands and controls the relay - it doesn't send fan status back
    if (mqttClient && isConnected) {
        // Publish control command to ESP32
        // ESP32 subscribes to this topic and executes the command
        mqttClient.publish('weather/control/fan', command, { qos: 1 }, (err) => {
            if (err) {
                console.error('Error publishing fan command:', err);
                if (!isAuto) {
                    alert('Failed to send command. Check MQTT connection.');
                }
            } else {
                console.log(`✅ Fan command sent to ESP32: ${command}${isAuto ? ' (auto)' : ''}`);
            }
        });
    } else {
        if (!isAuto) {
            alert('Not connected to MQTT broker. Please connect first.');
        } else {
            console.log(`⚠️ MQTT not connected, but fan status updated locally: ${command}`);
        }
    }
}


// Apply preset mode configuration
function applyFanMode(mode) {
    const preset = fanModePresets[mode];
    if (!preset) return;

    // Update description
    if (modeDescription) {
        modeDescription.textContent = preset.description;
    }

    // Update current settings display based on weather conditions
    if (currentTempSettings && currentHumSettings) {
        if (mode === 'always_on') {
            currentTempSettings.textContent = 'Always ON';
            currentHumSettings.textContent = 'Always ON';
        } else {
            const onConditions = preset.turnOnConditions.map(c => {
                const names = {
                    'hot': 'Hot & Dry',
                    'sunny': 'Sunny',
                    'partly-cloudy': 'Partly Cloudy',
                    'cloudy': 'Cloudy',
                    'rainy': 'Rainy'
                };
                return names[c] || c;
            }).join(', ');
            
            const offConditions = preset.turnOffConditions.map(c => {
                const names = {
                    'cold': 'Cold'
                };
                return names[c] || c;
            }).join(', ') || 'None';
            
            currentTempSettings.textContent = `Turns ON: ${onConditions}`;
            currentHumSettings.textContent = `Turns OFF: ${offConditions}`;
        }
    }
}

// Check automation conditions based on weather conditions
function checkAutomation() {
    if (!automationActive) {
        console.log('🔍 Automation check skipped: automation not active');
        return;
    }

    const mode = fanMode ? fanMode.value : 'hot';
    const preset = fanModePresets[mode];
    if (!preset) {
        console.log('🔍 Automation check skipped: invalid preset');
        return;
    }
    
    // Always ON mode - works even without sensor data
    if (mode === 'always_on') {
        if (!fanAutoState) {
            const delay = 1000; // 1 second delay for noise filtering
            if (conditionMetSince === null) {
                conditionMetSince = Date.now();
                if (activationTimer) {
                    clearTimeout(activationTimer);
                }
                activationTimer = setTimeout(() => {
                    if (!fanAutoState && automationActive) {
                        console.log('Automation: Activating fan (Always ON mode)');
                        sendFanCommand('ON', true);
                    }
                }, delay);
            }
        }
        return;
    }

    // For other modes, require sensor data to compute weather condition
    if (currentTemp === null || currentHum === null) {
        return;
    }

    // Get current weather condition
    const weatherCondition = computeWeatherCondition(currentTemp, currentHum);
    console.log(`🌤️ Automation check: mode=${mode}, weather=${weatherCondition}, temp=${currentTemp}°C, hum=${currentHum}%, fanState=${fanAutoState}`);

    // Check if weather condition should turn fan ON
    const shouldTurnOn = preset.turnOnConditions.includes(weatherCondition) || preset.turnOnConditions.includes('always');
    
    // Check if weather condition should turn fan OFF
    const shouldTurnOff = preset.turnOffConditions.includes(weatherCondition);
    
    console.log(`🔍 Should turn ON: ${shouldTurnOn} (weather: ${weatherCondition}), Should turn OFF: ${shouldTurnOff}, Current fan state: ${fanAutoState}`);

    // Turn ON logic with delay to prevent rapid cycling
    if (shouldTurnOn && !fanAutoState) {
        // Condition met to turn ON - start delay timer for noise filtering
        if (conditionMetSince === null) {
            conditionMetSince = Date.now();
            const delay = 2000; // 2 second delay for weather condition stability
            
            console.log(`⏱️ Starting activation timer (${delay}ms delay) - Weather condition: ${weatherCondition}`);
            
            // Clear any existing timer
            if (activationTimer) {
                clearTimeout(activationTimer);
            }
            
            // Set timer to activate fan after delay
            activationTimer = setTimeout(() => {
                // Re-check weather condition to ensure it's still valid
                const currentWeather = computeWeatherCondition(currentTemp, currentHum);
                const stillOn = preset.turnOnConditions.includes(currentWeather) || preset.turnOnConditions.includes('always');
                const notOff = !preset.turnOffConditions.includes(currentWeather);
                
                console.log(`⏱️ Timer fired - weather: ${currentWeather}, stillOn: ${stillOn}, notOff: ${notOff}, fanAutoState: ${fanAutoState}`);
                
                if (stillOn && notOff && !fanAutoState && automationActive) {
                    console.log(`✅ Automation: Activating fan (${mode} mode - weather: ${currentWeather})`);
                    sendFanCommand('ON', true);
                } else {
                    console.log(`❌ Timer fired but conditions not met - canceling activation`);
                    conditionMetSince = null;
                }
            }, delay);
        } else {
            console.log(`⏱️ Activation timer already running (started ${Date.now() - conditionMetSince}ms ago)`);
        }
    } else if (shouldTurnOff && fanAutoState) {
        // Condition met to turn OFF - immediate (cold weather)
        if (conditionMetSince !== null) {
            conditionMetSince = null;
            if (activationTimer) {
                clearTimeout(activationTimer);
                activationTimer = null;
            }
        }
        
        console.log(`Automation: Deactivating fan (${mode} mode - weather: ${weatherCondition})`);
        sendFanCommand('OFF', true);
    } else if (!shouldTurnOn && conditionMetSince !== null) {
        // Condition no longer met for turning ON - cancel timer
        conditionMetSince = null;
        if (activationTimer) {
            clearTimeout(activationTimer);
            activationTimer = null;
        }
    }
}

// Event Listeners
if (connectBtn) {
    connectBtn.addEventListener('click', () => {
        connectToMQTT();
    });
}

if (disconnectBtn) {
    disconnectBtn.addEventListener('click', () => {
        disconnectFromMQTT();
    });
}

// Automation event listeners
if (automationEnabled) {
    automationEnabled.addEventListener('change', (e) => {
        automationActive = e.target.checked;
        if (!automationActive) {
            // Disable automation - clear timers
            if (activationTimer) {
                clearTimeout(activationTimer);
                activationTimer = null;
            }
            conditionMetSince = null;
            console.log('Automation disabled');
        } else {
            // Enable automation - check conditions immediately
            console.log('✅ Automation enabled, checking conditions...');
            conditionMetSince = null; // Reset condition timer
            checkAutomation();
        }
    });
}

// Fan mode change handler
if (fanMode) {
    fanMode.addEventListener('change', (e) => {
        const mode = e.target.value;
        applyFanMode(mode);
        if (automationActive) {
            // Reset automation state when mode changes
            if (activationTimer) {
                clearTimeout(activationTimer);
                activationTimer = null;
            }
            conditionMetSince = null;
            checkAutomation();
        }
    });
}

// View switching
function switchView(view) {
    const dashboardView = document.getElementById('dashboardView');
    const settingsView = document.getElementById('settingsView');
    const navItems = document.querySelectorAll('.nav-item');
    
    if (view === 'dashboard') {
        if (dashboardView) {
            dashboardView.style.display = 'block';
            // Force chart resize when switching to dashboard
            setTimeout(() => {
                if (dataChart) {
                    dataChart.resize();
                }
            }, 50);
        }
        if (settingsView) settingsView.style.display = 'none';
        navItems.forEach(item => {
            if (item.getAttribute('href') === '#dashboard') {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    } else if (view === 'settings') {
        if (dashboardView) dashboardView.style.display = 'none';
        if (settingsView) settingsView.style.display = 'block';
        navItems.forEach(item => {
            if (item.getAttribute('href') === '#settings') {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('Dashboard initialized');
    
    // Initialize chart after a small delay to ensure layout is calculated
    setTimeout(() => {
        initializeChart();
        // Force chart resize after initialization
        if (dataChart) {
            setTimeout(() => {
                dataChart.resize();
                console.log('Chart initialized and resized');
            }, 200);
        }
    }, 150);
    
    // Handle window resize for chart
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (dataChart) {
                dataChart.resize();
            }
        }, 250);
    });
    
    // Set default client ID
    if (clientIdInput) {
        clientIdInput.value = 'dashboard-' + Math.random().toString(16).substr(2, 8);
    }
    
    // Initialize fan mode
    if (fanMode) {
        applyFanMode(fanMode.value);
    }
    
    // Initialize fan status display
    updateFanStatus(false);
    
    // Check if automation is enabled on page load
    if (automationEnabled) {
        automationActive = automationEnabled.checked;
        if (automationActive) {
            console.log('✅ Automation is enabled on page load');
            // Check automation immediately if sensor data is available
            if (currentTemp !== null && currentHum !== null) {
                console.log('🔍 Initial automation check with existing data');
                checkAutomation();
            }
        } else {
            console.log('⚠️ Automation is DISABLED - toggle it ON to enable automatic fan control');
        }
    }
    
    // Handle navigation
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const href = item.getAttribute('href');
            if (href === '#dashboard') {
                switchView('dashboard');
            } else if (href === '#settings') {
                switchView('settings');
            }
            // Close mobile menu after navigation
            closeMobileMenu();
        });
    });
    
    // Sidebar toggle (Desktop)
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebarToggleHeader = document.getElementById('sidebarToggleHeader');
    const sidebar = document.getElementById('sidebar');
    const appContainer = document.querySelector('.app-container');
    
    function toggleSidebar() {
        // Only toggle on desktop (width > 768px)
        if (window.innerWidth <= 768) {
            return;
        }
        
        if (sidebar && appContainer) {
            sidebar.classList.toggle('collapsed');
            // Update app container class for CSS selector
            if (sidebar.classList.contains('collapsed')) {
                appContainer.classList.add('sidebar-collapsed');
            } else {
                appContainer.classList.remove('sidebar-collapsed');
            }
            // Save preference
            localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
        }
    }
    
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }
    
    if (sidebarToggleHeader) {
        sidebarToggleHeader.addEventListener('click', toggleSidebar);
    }
    
    // Restore sidebar state from localStorage
    if (sidebar && appContainer && window.innerWidth > 768) {
        const savedState = localStorage.getItem('sidebarCollapsed');
        if (savedState === 'true') {
            sidebar.classList.add('collapsed');
            appContainer.classList.add('sidebar-collapsed');
        }
    }
    
    // Mobile menu toggle
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const sidebarClose = document.getElementById('sidebarClose');
    const sidebarOverlay = document.createElement('div');
    sidebarOverlay.className = 'sidebar-overlay';
    document.body.appendChild(sidebarOverlay);
    
    function openMobileMenu() {
        if (sidebar) {
            sidebar.classList.add('mobile-open');
            sidebarOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
    
    function closeMobileMenu() {
        if (sidebar) {
            sidebar.classList.remove('mobile-open');
            sidebarOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
    
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', openMobileMenu);
    }
    
    if (sidebarClose) {
        sidebarClose.addEventListener('click', closeMobileMenu);
    }
    
    sidebarOverlay.addEventListener('click', closeMobileMenu);
    
    // Close menu on window resize if it becomes desktop size
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            closeMobileMenu();
            // Remove mobile classes when switching to desktop
            if (sidebar) {
                sidebar.classList.remove('mobile-open');
            }
        } else {
            // On mobile, ensure sidebar uses mobile behavior (not collapsed)
            if (sidebar) {
                // Remove collapsed class on mobile - use mobile-open instead
                sidebar.classList.remove('collapsed');
                if (appContainer) {
                    appContainer.classList.remove('sidebar-collapsed');
                }
            }
        }
    });
    
    // Auto-connect on load with pre-filled credentials
    // Wait a moment for DOM to be fully ready, then auto-connect
    setTimeout(() => {
        if (brokerUrlInput && brokerUrlInput.value && mqttUsernameInput && mqttUsernameInput.value && mqttPasswordInput && mqttPasswordInput.value) {
            console.log('🔄 Auto-connecting to MQTT broker with saved credentials...');
            connectToMQTT();
        }
    }, 500);
});
