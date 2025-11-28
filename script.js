// MQTT Client Configuration
let mqttClient = null;
let isConnected = false;

// Chart Configuration
let dataChart = null;
const maxDataPoints = 20;
let temperatureData = [];
let humidityData = [];
let timeLabels = [];

// DOM Elements
const connectionStatus = document.getElementById('connectionStatus');
const statusDot = document.getElementById('statusDot');
const statusIndicator = document.getElementById('statusIndicator');
const temperatureDisplay = document.getElementById('temperature');
const humidityDisplay = document.getElementById('humidity');
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

// Automation DOM Elements
const automationEnabled = document.getElementById('automationEnabled');
const fanMode = document.getElementById('fanMode');
const modeDescription = document.getElementById('modeDescription');
const currentTempSettings = document.getElementById('currentTempSettings');
const currentHumSettings = document.getElementById('currentHumSettings');

// Preset configurations for user-friendly modes
const fanModePresets = {
    'very_hot': {
        description: 'Fan turns on when temperature is very high (> 32°C) or humidity is very high (> 80%)',
        tempOn: 32,
        tempOff: 30,
        tempCondition: 'above',
        humOn: 80,
        humOff: 75,
        humCondition: 'above'
    },
    'hot': {
        description: 'Fan turns on when temperature is high (> 28°C) or humidity is high (> 70%)',
        tempOn: 28,
        tempOff: 26,
        tempCondition: 'above',
        humOn: 70,
        humOff: 65,
        humCondition: 'above'
    },
    'always_on': {
        description: 'Fan stays on regardless of temperature or humidity',
        tempOn: -999,
        tempOff: -999,
        tempCondition: 'above',
        humOn: -999,
        humOff: -999,
        humCondition: 'above'
    }
};

// Automation State
let automationActive = false;
let currentTemp = null;
let currentHum = null;
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
                                const value = context.dataset.label === 'Temperature' 
                                    ? context.parsed.y.toFixed(1) + '°C'
                                    : context.parsed.y.toFixed(1) + '%';
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
    } else if (topic === 'weather/status') {
        try {
            const status = JSON.parse(message);
            // Only read sensor data from ESP32, NOT fan status
            // Dashboard determines fan status based on sensor data + automation rules
            if (status.temperature !== undefined) updateTemperature(status.temperature);
            if (status.humidity !== undefined) updateHumidity(status.humidity);
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
}

// Update humidity display
function updateHumidity(value) {
    if (humidityDisplay) {
        humidityDisplay.textContent = value.toFixed(1);
        addDataPoint('humidity', value);
    }
    currentHum = value;
    checkAutomation();
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
    }
    
    // Update time labels (only when we have new data)
    // Use adaptive format: HH:MM when many points, HH:MM:SS when few
    if (temperatureData.length === humidityData.length) {
        const totalPoints = Math.max(temperatureData.length, humidityData.length);
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

    // Update current settings display
    if (currentTempSettings && currentHumSettings) {
        if (mode === 'always_on') {
            currentTempSettings.textContent = 'Always ON';
            currentHumSettings.textContent = 'Always ON';
        } else {
            const tempCondSymbol = preset.tempCondition === 'below' ? '<' : '>';
            const humCondSymbol = preset.humCondition === 'below' ? '<' : '>';
            currentTempSettings.textContent = `ON: ${tempCondSymbol} ${preset.tempOn}°C, OFF: ${tempCondSymbol === '>' ? '<' : '>'} ${preset.tempOff}°C`;
            currentHumSettings.textContent = `ON: ${humCondSymbol} ${preset.humOn}%, OFF: ${humCondSymbol === '>' ? '<' : '>'} ${preset.humOff}%`;
        }
    }
}

// Check automation conditions using hysteresis (professional approach)
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
    
    console.log(`🔍 Automation check: mode=${mode}, temp=${currentTemp}°C, hum=${currentHum}%, fanState=${fanAutoState}`);

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

    // For other modes, require sensor data
    if (currentTemp === null || currentHum === null) {
        return;
    }

    // Get thresholds from preset
    const tempThreshOn = preset.tempOn;
    const humThreshOn = preset.humOn;
    const tempCondOn = preset.tempCondition;
    const humCondOn = preset.humCondition;

    const tempThreshOff = preset.tempOff;
    const humThreshOff = preset.humOff;
    const tempCondOff = preset.tempCondition;
    const humCondOff = preset.humCondition;

    // Check if conditions are met for turning ON (using ON thresholds)
    const tempOnMet = tempCondOn === 'below' ? currentTemp < tempThreshOn : currentTemp > tempThreshOn;
    const humOnMet = humCondOn === 'below' ? currentHum < humThreshOn : currentHum > humThreshOn;
    const shouldTurnOn = tempOnMet || humOnMet;

    // Check if conditions are met for turning OFF (using OFF thresholds)
    const tempOffMet = tempCondOff === 'below' ? currentTemp > tempThreshOff : currentTemp < tempThreshOff;
    const humOffMet = humCondOff === 'below' ? currentHum > humThreshOff : currentHum < humThreshOff;
    const shouldTurnOff = tempOffMet || humOffMet;
    
    console.log(`🔍 Conditions: tempOn=${tempOnMet} (${currentTemp} ${tempCondOn} ${tempThreshOn}), humOn=${humOnMet} (${currentHum} ${humCondOn} ${humThreshOn})`);
    console.log(`🔍 Should turn ON: ${shouldTurnOn}, Should turn OFF: ${shouldTurnOff}, Current fan state: ${fanAutoState}`);

    // Hysteresis logic: Use different thresholds for ON and OFF
    if (shouldTurnOn && !fanAutoState) {
        // Condition met to turn ON - start delay timer for noise filtering
        if (conditionMetSince === null) {
            conditionMetSince = Date.now();
            const delay = 1000; // 1 second delay for sensor noise filter (reduced from 2s)
            
            console.log(`⏱️ Starting activation timer (${delay}ms delay) - Conditions met for turning ON`);
            
            // Clear any existing timer
            if (activationTimer) {
                clearTimeout(activationTimer);
            }
            
            // Set timer to activate fan after short delay (sensor noise filter)
            activationTimer = setTimeout(() => {
                // Double-check condition is still met (hysteresis ON threshold)
                const stillOn = (tempCondOn === 'below' ? currentTemp < tempThreshOn : currentTemp > tempThreshOn) ||
                               (humCondOn === 'below' ? currentHum < humThreshOn : currentHum > humThreshOn);
                
                // Also check that OFF condition is not met
                const notOff = !((tempCondOff === 'below' ? currentTemp > tempThreshOff : currentTemp < tempThreshOff) ||
                                (humCondOff === 'below' ? currentHum > humThreshOff : currentHum < humThreshOff));
                
                console.log(`⏱️ Timer fired - stillOn: ${stillOn}, notOff: ${notOff}, fanAutoState: ${fanAutoState}, automationActive: ${automationActive}`);
                
                if (stillOn && notOff && !fanAutoState && automationActive) {
                    console.log(`✅ Automation: Activating fan (${mode} mode - threshold met)`);
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
        // Condition met to turn OFF (hysteresis OFF threshold) - immediate
        if (conditionMetSince !== null) {
            conditionMetSince = null;
            if (activationTimer) {
                clearTimeout(activationTimer);
                activationTimer = null;
            }
        }
        
        // Turn off immediately when OFF threshold is met (hysteresis prevents rapid cycling)
        console.log(`Automation: Deactivating fan (${mode} mode - OFF threshold met)`);
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
    
    // Auto-connect on load (optional - comment out if you want manual connection)
    // connectToMQTT();
});
