// Professional Weather Dashboard JavaScript

const API_BASE_URL = 'http://127.0.0.1:8081';
const OWM_KEY = '84254d5ce02335eb1d0ed7c9393e2ebb';

// Global state
let currentCoords = { lat: 23.2599, lon: 77.4126 };
let currentDate = new Date().toISOString().slice(0, 10);
let map = null;
let weatherLayer = null;
let currentLayer = 'temp_new';

// Initialize dashboard on page load
document.addEventListener('DOMContentLoaded', () => {
    // Set default date to today
    document.getElementById('predictionDate').value = currentDate;
    document.getElementById('predictionDate').min = new Date().toISOString().slice(0, 10);
    document.getElementById('predictionDate').max = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    
    initializeMap();
    setupEventListeners();
    updateAllData();
});

// Initialize Leaflet map
function initializeMap() {
    map = L.map('weatherMap').setView([currentCoords.lat, currentCoords.lon], 7);
    
    // Dark theme base layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CartoDB',
        maxZoom: 19
    }).addTo(map);
    
    // Add weather layer
    updateWeatherLayer();
    
    // Add marker for current location
    L.marker([currentCoords.lat, currentCoords.lon]).addTo(map);
}

// Update weather layer on map
function updateWeatherLayer() {
    if (weatherLayer) {
        map.removeLayer(weatherLayer);
    }
    
    weatherLayer = L.tileLayer(
        `https://tile.openweathermap.org/map/${currentLayer}/{z}/{x}/{y}.png?appid=${OWM_KEY}`,
        { opacity: 0.6 }
    );
    weatherLayer.addTo(map);
}

// Setup event listeners
function setupEventListeners() {
    // Update location button
    document.getElementById('updateLocation').addEventListener('click', () => {
        const lat = parseFloat(document.getElementById('latitude').value);
        const lon = parseFloat(document.getElementById('longitude').value);
        const date = document.getElementById('predictionDate').value;
        
        if (!isNaN(lat) && !isNaN(lon) && date) {
            currentCoords = { lat, lon };
            currentDate = date;
            map.setView([lat, lon], 7);
            updateAllData();
        }
    });
    
    // Layer selector buttons
    document.querySelectorAll('.layer-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.layer-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentLayer = e.target.dataset.layer;
            updateWeatherLayer();
        });
    });
}

// Update all data
async function updateAllData() {
    await Promise.all([
        updateCurrentWeather(),
        updateRiskPrediction(),
        updateForecast()
    ]);
}

// Fetch and display current weather
async function updateCurrentWeather() {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/weather/current?lat=${currentCoords.lat}&lon=${currentCoords.lon}`
        );
        
        const weather = response.data;
        document.getElementById('currentWeather').innerHTML = `
            <div class="weather-temp">${Math.round(weather.temperature)}°C</div>
            <div class="weather-desc">${weather.description}</div>
            <div class="weather-location">${weather.location_name || 'Custom Location'}</div>
            <div class="weather-details" style="font-size: 12px; opacity: 0.7; margin-top: 10px;">
                <div>💧 Humidity: ${Math.round(weather.humidity)}%</div>
                <div>💨 Wind: ${weather.wind_speed.toFixed(1)} m/s</div>
                <div>🌡️ Range: ${Math.round(weather.temp_min)}° - ${Math.round(weather.temp_max)}°</div>
            </div>
        `;
    } catch (error) {
        console.error('Weather fetch error:', error);
        document.getElementById('currentWeather').innerHTML = '<div class="loading">Weather data unavailable</div>';
    }
}

// Fetch and display risk prediction
async function updateRiskPrediction() {
    try {
        const response = await axios.post(`${API_BASE_URL}/predict`, {
            latitude: currentCoords.lat,
            longitude: currentCoords.lon,
            date: currentDate
        });
        
        const risk = response.data;
        const riskClass = risk.risk_level.toLowerCase();
        
        let paramsHtml = '';
        for (const [key, value] of Object.entries(risk.predictions)) {
            const name = key.replace('very_', '').toUpperCase();
            const percent = Math.round(value * 100);
            paramsHtml += `
                <div class="risk-param">
                    <div class="risk-param-name">${name}</div>
                    <div class="risk-param-value">${percent}%</div>
                </div>
            `;
        }
        
        // Add data source info
        let dataSourceHtml = `<div class="data-source">`;
        dataSourceHtml += `<strong>Data Source:</strong> ${risk.data_source}<br>`;
        if (risk.forecast_accuracy) {
            dataSourceHtml += `${risk.forecast_accuracy}`;
        }
        dataSourceHtml += `</div>`;
        
        document.getElementById('riskContent').innerHTML = `
            <div class="risk-level ${riskClass}">
                ${risk.risk_level} RISK
            </div>
            <div class="risk-params">${paramsHtml}</div>
            ${dataSourceHtml}
        `;
    } catch (error) {
        console.error('Risk prediction error:', error);
        document.getElementById('riskContent').innerHTML = '<div class="loading">Risk assessment unavailable</div>';
    }
}

// Fetch and display 6-month forecast
async function updateForecast() {
    try {
        const response = await axios.post(`${API_BASE_URL}/forecast`, {
            latitude: currentCoords.lat,
            longitude: currentCoords.lon,
            months: 6
        });
        
        const forecast = response.data;
        let forecastHtml = '';
        
        forecast.forecasts.forEach((month, index) => {
            const riskClass = month.risk_level.toLowerCase();
            const bellCurveId = `bellCurve${index}`;
            
            // Check if using ML model or statistical model
            const dataSource = month.data_source || 'Statistical';
            const sourceIndicator = dataSource.includes('ML Model') ? '🤖' : '📊';
            
            // Show confidence if available
            let confidenceHtml = '';
            if (month.distributions.very_hot && month.distributions.very_hot.confidence) {
                const confidence = (month.distributions.very_hot.confidence * 100).toFixed(1);
                confidenceHtml = `<div style="font-size: 10px; opacity: 0.6;">Confidence: ${confidence}%</div>`;
            }
            
            forecastHtml += `
                <div class="forecast-card" style="border-color: ${getRiskColor(month.risk_level)}">
                    <div class="forecast-month">${month.month} ${sourceIndicator}</div>
                    <div class="forecast-risk ${riskClass}">${month.risk_level}</div>
                    <div id="${bellCurveId}" class="forecast-bell-curve"></div>
                    <div class="forecast-details">
                        Hot: ${Math.round(month.predictions.very_hot * 100)}%,
                        Cold: ${Math.round(month.predictions.very_cold * 100)}%
                    </div>
                    ${confidenceHtml}
                </div>
            `;
        });
        
        // Add legend
        forecastHtml += '<div style="grid-column: span 6; text-align: center; font-size: 11px; opacity: 0.7; margin-top: 10px;">🤖 = ML Model Prediction | 📊 = Statistical Forecast</div>';
        
        document.getElementById('forecastGrid').innerHTML = forecastHtml;
        
        // Render bell curves
        forecast.forecasts.forEach((month, index) => {
            renderBellCurve(`bellCurve${index}`, month.distributions.very_hot);
        });
        
    } catch (error) {
        console.error('Forecast error:', error);
        document.getElementById('forecastGrid').innerHTML = '<div class="loading">Forecast unavailable</div>';
    }
}

// Render bell curve using Plotly
function renderBellCurve(elementId, data) {
    const mean = data.mean;
    const stdDev = data.std_dev;
    
    // Generate bell curve data
    const x = [];
    const y = [];
    
    for (let i = 0; i <= 100; i++) {
        const prob = i / 100;
        x.push(prob);
        
        // Normal distribution formula
        const exponent = -0.5 * Math.pow((prob - mean) / stdDev, 2);
        const coefficient = 1 / (stdDev * Math.sqrt(2 * Math.PI));
        y.push(coefficient * Math.exp(exponent));
    }
    
    const trace = {
        x: x,
        y: y,
        type: 'scatter',
        mode: 'lines',
        fill: 'tozeroy',
        line: { color: '#4facfe', width: 2 },
        fillcolor: 'rgba(79, 172, 254, 0.2)'
    };
    
    const layout = {
        height: 80,
        margin: { t: 0, b: 0, l: 0, r: 0 },
        xaxis: {
            showgrid: false,
            zeroline: false,
            showticklabels: false,
            range: [0, 1]
        },
        yaxis: {
            showgrid: false,
            zeroline: false,
            showticklabels: false
        },
        paper_bgcolor: 'transparent',
        plot_bgcolor: 'transparent',
        showlegend: false
    };
    
    const config = {
        displayModeBar: false,
        responsive: true
    };
    
    Plotly.newPlot(elementId, [trace], layout, config);
}

// Get risk color
function getRiskColor(level) {
    const colors = {
        'EXTREME': '#e74c3c',
        'HIGH': '#f39c12',
        'MODERATE': '#f1c40f',
        'LOW': '#2ecc71',
        'MINIMAL': '#95a5a6'
    };
    return colors[level] || '#95a5a6';
}
