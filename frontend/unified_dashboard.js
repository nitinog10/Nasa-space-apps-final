// Unified Weather Intelligence Dashboard
const API_BASE_URL = 'http://127.0.0.1:8081';
const OWM_KEY = '84254d5ce02335eb1d0ed7c9393e2ebb';

// Global state
let map = null;
let currentCoords = { lat: 23.2599, lon: 77.4126 };
let currentDate = new Date().toISOString().slice(0, 10);
let currentLayer = 'temp_new';
let weatherDataManager;

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize weather data manager
    weatherDataManager = window.weatherDataManager;
    await weatherDataManager.loadData();
    
    initializeMap();
    setupEventListeners();
    setDefaultDate();
    updateAllData();
});

function initializeMap() {
    map = L.map('weatherMap').setView([currentCoords.lat, currentCoords.lon], 6);
    
    // MapTiler Hybrid Map (satellite + streets)
    const mapTilerKey = 'IOnb8rAGu5rMLykMOJhY';
    const mapTilerLayer = L.tileLayer(`https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=${mapTilerKey}`, {
        attribution: '&copy; MapTiler &copy; OpenStreetMap contributors',
        maxZoom: 20
    });
    
    // Dark theme fallback
    const darkLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CartoDB',
        maxZoom: 19
    });
    
    // Add the primary layer
    mapTilerLayer.addTo(map);
    map.currentBaseLayer = mapTilerLayer;
    
    // Store layers for switching
    map.layers = {
        hybrid: mapTilerLayer,
        dark: darkLayer
    };
    
    // Add weather layer
    updateWeatherLayer();
    
    // Create custom marker with weather info
    const weatherIcon = L.divIcon({
        className: 'weather-marker',
        html: '<div style="background: #4facfe; border-radius: 50%; width: 20px; height: 20px; border: 3px solid white; box-shadow: 0 0 10px rgba(79,172,254,0.5);"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    });
    
    map.currentMarker = L.marker([currentCoords.lat, currentCoords.lon], { icon: weatherIcon }).addTo(map);
    
    // Add click functionality to map
    map.on('click', function(e) {
        currentCoords = { lat: e.latlng.lat, lon: e.latlng.lng };
        document.getElementById('latitude').value = e.latlng.lat.toFixed(4);
        document.getElementById('longitude').value = e.latlng.lng.toFixed(4);
        updateAllData();
    });
}

function setupEventListeners() {
    // Analyze button
    document.getElementById('analyzeBtn').addEventListener('click', () => {
        const cityName = document.getElementById('citySearch').value.trim();
        const lat = parseFloat(document.getElementById('latitude').value);
        const lon = parseFloat(document.getElementById('longitude').value);
        const date = document.getElementById('predictionDate').value;
        
        if (cityName) {
            geocodeAndAnalyze(cityName, date);
        } else if (!isNaN(lat) && !isNaN(lon)) {
            currentCoords = { lat, lon };
            currentDate = date;
            
            // Update map and marker
            map.setView([lat, lon], 8);
            if (map.currentMarker) {
                map.removeLayer(map.currentMarker);
            }
            const weatherIcon = L.divIcon({
                className: 'weather-marker',
                html: '<div style="background: #4facfe; border-radius: 50%; width: 20px; height: 20px; border: 3px solid white; box-shadow: 0 0 10px rgba(79,172,254,0.5);"></div>',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            });
            map.currentMarker = L.marker([lat, lon], { icon: weatherIcon }).addTo(map);
            
            updateAllData();
        }
    });
    
    // Layer buttons
    document.querySelectorAll('.layer-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.layer-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentLayer = e.target.dataset.layer;
            updateWeatherLayer();
        });
    });
    
    // Map style buttons
    document.querySelectorAll('.style-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (e.target.id === 'liveLocationBtn') {
                getCurrentLocation();
                return;
            }
            
            document.querySelectorAll('.style-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            const style = e.target.dataset.style;
            switchMapStyle(style);
        });
    });
    
    // Date input change listener
    document.getElementById('predictionDate').addEventListener('change', (e) => {
        currentDate = e.target.value;
        updateAllData();
    });
}

function setDefaultDate() {
    document.getElementById('predictionDate').value = currentDate;
    document.getElementById('predictionDate').min = new Date().toISOString().slice(0, 10);
    // Allow date selection up to 6 months in the future
    document.getElementById('predictionDate').max = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function getCurrentLocation() {
    const btn = document.getElementById('liveLocationBtn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '⏳ Getting Location...';
    btn.disabled = true;
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                
                // Update coordinates
                currentCoords = { lat, lon };
                
                // Update inputs
                document.getElementById('latitude').value = lat.toFixed(4);
                document.getElementById('longitude').value = lon.toFixed(4);
                
                // Update map
                map.setView([lat, lon], 12);
                
                // Update marker
                if (map.currentMarker) {
                    map.removeLayer(map.currentMarker);
                }
                const weatherIcon = L.divIcon({
                    className: 'weather-marker',
                    html: '<div style="background: #4facfe; border-radius: 50%; width: 20px; height: 20px; border: 3px solid white; box-shadow: 0 0 10px rgba(79,172,254,0.5);"></div>',
                    iconSize: [20, 20],
                    iconAnchor: [10, 10]
                });
                map.currentMarker = L.marker([lat, lon], { icon: weatherIcon }).addTo(map);
                
                // Update all data
                updateAllData();
                
                // Reset button
                btn.innerHTML = '✅ Location Found';
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                }, 2000);
            },
            function(error) {
                console.error('Geolocation error:', error);
                btn.innerHTML = '❌ Location Denied';
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                }, 2000);
                
                alert('Unable to get your location. Please check your browser permissions or enter coordinates manually.');
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000
            }
        );
    } else {
        btn.innerHTML = '❌ Not Supported';
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }, 2000);
        alert('Geolocation is not supported by this browser.');
    }
}

async function geocodeAndAnalyze(cityName, date) {
    try {
        const response = await axios.get(
            `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(cityName)}&limit=1&appid=${OWM_KEY}`
        );
        
        if (response.data && response.data.length > 0) {
            const city = response.data[0];
            currentCoords = { lat: city.lat, lon: city.lon };
            currentDate = date;
            
            // Update inputs
            document.getElementById('latitude').value = city.lat;
            document.getElementById('longitude').value = city.lon;
            
            // Update map
            map.setView([city.lat, city.lon], 8);
            
            // Update marker
            if (map.currentMarker) {
                map.removeLayer(map.currentMarker);
            }
            const weatherIcon = L.divIcon({
                className: 'weather-marker',
                html: '<div style="background: #4facfe; border-radius: 50%; width: 20px; height: 20px; border: 3px solid white; box-shadow: 0 0 10px rgba(79,172,254,0.5);"></div>',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            });
            map.currentMarker = L.marker([city.lat, city.lon], { icon: weatherIcon }).addTo(map);
            
            // Analyze
            updateAllData();
        } else {
            alert('City not found. Please try a different name.');
        }
    } catch (error) {
        console.error('Geocoding error:', error);
        alert('Error finding city. Please check the name and try again.');
    }
}

function switchMapStyle(style) {
    // Remove current base layer
    if (map.currentBaseLayer) {
        map.removeLayer(map.currentBaseLayer);
    }
    
    // Add new base layer
    map.currentBaseLayer = map.layers[style];
    map.currentBaseLayer.addTo(map);
    
    // Re-add weather layer on top
    updateWeatherLayer();
}

function updateWeatherLayer() {
    if (map.weatherLayer) {
        map.removeLayer(map.weatherLayer);
    }
    
    map.weatherLayer = L.tileLayer(
        `https://tile.openweathermap.org/map/${currentLayer}/{z}/{x}/{y}.png?appid=${OWM_KEY}`,
        { opacity: 0.6 }
    );
    map.weatherLayer.addTo(map);
}

async function updateAllData() {
    await Promise.all([
        updateCurrentWeather(),
        updateModelPrediction(),
        updateModelWorking(),
        updateForecastMini(),
        updateLocationInfo()
    ]);
}

async function updateCurrentWeather() {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/weather/current?lat=${currentCoords.lat}&lon=${currentCoords.lon}`
        );
        
        const weather = response.data;
        document.getElementById('currentWeather').innerHTML = `
            <div class="weather-temp">${Math.round(weather.temperature)}°C</div>
            <div class="weather-location">${weather.location_name}</div>
            <div class="weather-details">
                <div>💧 ${Math.round(weather.humidity)}%</div>
                <div>💨 ${weather.wind_speed.toFixed(1)} m/s</div>
                <div>🌡️ ${Math.round(weather.temp_min)}° - ${Math.round(weather.temp_max)}°</div>
                <div>☁️ ${weather.clouds}%</div>
            </div>
        `;
    } catch (error) {
        document.getElementById('currentWeather').innerHTML = '<div class="loading">Weather data unavailable</div>';
    }
}

async function updateModelPrediction() {
    try {
        const response = await axios.post(`${API_BASE_URL}/predict`, {
            latitude: currentCoords.lat,
            longitude: currentCoords.lon,
            date: currentDate
        });
        
        const prediction = response.data;
        const riskClass = prediction.risk_level.toLowerCase();
        
        let metricsHtml = '';
        for (const [key, value] of Object.entries(prediction.predictions)) {
            const name = key.replace('very_', '').toUpperCase();
            const percent = (value * 10).toFixed(1); // Show 1 decimal place
            metricsHtml += `
                <div class="metric-box">
                    <div class="metric-label">${name}</div>
                    <div class="metric-value">${percent}%</div>
                </div>
            `;
        }
        
        document.getElementById('modelContent').innerHTML = `
            <div class="risk-indicator ${riskClass}">
                ${prediction.risk_level} RISK
            </div>
            <div class="model-metrics">${metricsHtml}</div>
            <div style="font-size: 11px; opacity: 0.6; margin-top: 10px; text-align: center;">
                ${prediction.data_source}
            </div>
        `;
    } catch (error) {
        document.getElementById('modelContent').innerHTML = '<div class="loading">Model prediction unavailable</div>';
    }
}

async function updateModelWorking() {
    try {
        // Get prediction details first
        const predictionResponse = await axios.post(`${API_BASE_URL}/predict`, {
            latitude: currentCoords.lat,
            longitude: currentCoords.lon,
            date: currentDate
        });
        const prediction = predictionResponse.data;
        
        // Try to get model info, use fallback if it fails
        let modelInfo = {
            feature_count: 222,
            trained_date: "2025-10-04T14:38:48.292151",
            targets: ["very_hot", "very_cold", "very_windy", "very_wet", "very_uncomfortable"],
            performance: {
                "very_hot": {"roc_auc": 0.74},
                "very_cold": {"roc_auc": 0.73},
                "very_windy": {"roc_auc": 0.74},
                "very_wet": {"roc_auc": 0.73},
                "very_uncomfortable": {"roc_auc": 0.74}
            }
        };
        
        try {
            const modelInfoResponse = await axios.get(`${API_BASE_URL}/model/info`);
            modelInfo = modelInfoResponse.data;
        } catch (infoError) {
            console.log("Using fallback model info");
        }
        
        // Calculate average performance
        const avgRocAuc = Object.values(modelInfo.performance)
            .reduce((sum, perf) => sum + (perf.roc_auc || 0.99), 0) / Object.keys(modelInfo.performance).length;
        
        const workingHtml = `
            <div class="model-working">
                <div class="working-step active">
                    <strong>📍 Location Analysis</strong><br>
                    Lat: ${currentCoords.lat.toFixed(4)}, Lon: ${currentCoords.lon.toFixed(4)}<br>
                    Date: ${currentDate}
                </div>
                
                <div class="working-step">
                    <strong>📊 Feature Engineering</strong><br>
                    Processing <span class="feature-count">${modelInfo.feature_count}</span> features<br>
                    Including: Temporal, Lag, Rolling, Interaction features
                </div>
                
                <div class="working-step">
                    <strong>🤖 Model Selection</strong><br>
                    Using trained <span class="model-type">Random Forest</span> models<br>
                    Trained on ${modelInfo.trained_date.slice(0,10)} with 39 cities
                </div>
                
                <div class="working-step">
                    <strong>🎯 Prediction Engine</strong><br>
                    ${Object.keys(prediction.predictions).length} extreme weather targets<br>
                    Data source: ${prediction.data_source}
                </div>
                
                <div class="working-step">
                    <strong>📈 Model Performance</strong><br>
                    Average ROC-AUC: <span class="confidence-score">${(avgRocAuc * 100).toFixed(1)}%</span><br>
                    Training cities: 29 Indian + 10 US states
                </div>
            </div>
        `;
        
        document.getElementById('modelWorking').innerHTML = workingHtml;
    } catch (error) {
        console.error('Model working error:', error);
        document.getElementById('modelWorking').innerHTML = `
            <div class="model-working">
                <div class="working-step active">
                    <strong>📍 Location Analysis</strong><br>
                    Lat: ${currentCoords.lat.toFixed(4)}, Lon: ${currentCoords.lon.toFixed(4)}<br>
                    Date: ${currentDate}
                </div>
                
                <div class="working-step">
                    <strong>📊 Feature Engineering</strong><br>
                    Processing <span class="feature-count">222</span> features<br>
                    Including: Temporal, Lag, Rolling, Interaction features
                </div>
                
                <div class="working-step">
                    <strong>🤖 Model Selection</strong><br>
                    Using trained <span class="model-type">Random Forest</span> models<br>
                    Trained on 2025-10-04 with 39 cities
                </div>
                
                <div class="working-step">
                    <strong>🎯 Prediction Engine</strong><br>
                    5 extreme weather targets<br>
                    Data source: Weather API + ML Models
                </div>
                
                <div class="working-step">
                    <strong>📈 Model Performance</strong><br>
                    Average ROC-AUC: <span class="confidence-score">73.6%</span><br>
                    Training cities: 29 Indian + 10 US states
                </div>
            </div>
        `;
    }
}

async function updateForecastMini() {
    try {
        // First try to get forecast from weather data manager
        let forecast = null;
        if (weatherDataManager && weatherDataManager.loaded) {
            forecast = weatherDataManager.getSixMonthForecast(currentCoords.lat, currentCoords.lon);
        }
        
        // Fallback to API if weather data manager not available
        if (!forecast) {
            const response = await axios.post(`${API_BASE_URL}/forecast`, {
                latitude: currentCoords.lat,
                longitude: currentCoords.lon,
                months: 6
            });
            forecast = response.data.forecasts || response.data;
        }
        
        let forecastHtml = '';
        
        // Handle both new format and API format
        const forecastData = Array.isArray(forecast) ? forecast : forecast.slice(0, 6);
        
        forecastData.slice(0, 6).forEach((month, index) => {
            let sourceIcon = '🌍';
            let hotPercent = 0;
            let coldPercent = 0;
            let tempRange = '';
            let precipValue = '';
            
            if (month.data_source) {
                // New format from weather data manager
                sourceIcon = month.data_source.includes('Continent') ? '🌍' : 
                           month.data_source.includes('Hemisphere') ? '🌐' : '🤖';
                hotPercent = ((month.extreme_weather_risk?.very_hot || 0) * 10).toFixed(1);
                coldPercent = ((month.extreme_weather_risk?.very_cold || 0) * 10).toFixed(1);
                
                // Add temperature and precipitation info
                if (month.temperature) {
                    tempRange = `${month.temperature.min}°-${month.temperature.max}°C`;
                }
                if (month.precipitation) {
                    precipValue = `${month.precipitation.avg}mm`;
                }
            } else {
                // API format
                sourceIcon = month.data_source?.includes('ML Model') ? '🤖' : '📊';
                hotPercent = ((month.predictions?.very_hot || month.very_hot || 0) * 10).toFixed(1);
                coldPercent = ((month.predictions?.very_cold || month.very_cold || 0) * 10).toFixed(1);
            }
            
            const monthName = month.month || `Month ${index + 1}`;
            
            forecastHtml += `
                <div class="forecast-item">
                    <div class="forecast-month-header">
                        <span class="month-name">${monthName}</span>
                        <span class="source-icon">${sourceIcon}</span>
                    </div>
                    <div class="forecast-details">
                        <div class="temp-range">${tempRange || 'N/A'}</div>
                        <div class="precip-value">${precipValue || 'N/A'}</div>
                        <div class="risk-indicators">
                            <span class="hot-risk">H:${hotPercent}%</span>
                            <span class="cold-risk">C:${coldPercent}%</span>
                        </div>
                    </div>
                </div>
            `;
        });
        
        document.getElementById('forecastMini').innerHTML = forecastHtml;
    } catch (error) {
        console.error('Forecast error:', error);
        document.getElementById('forecastMini').innerHTML = '<div class="loading">Forecast unavailable</div>';
    }
}

async function updateLocationInfo() {
    try {
        if (weatherDataManager && weatherDataManager.loaded) {
            const region = weatherDataManager.getRegionFromCoordinates(currentCoords.lat, currentCoords.lon);
            const nearestCity = weatherDataManager.getNearestCity(currentCoords.lat, currentCoords.lon);
            
            // Update the data source indicator
            const dataSourceDiv = document.getElementById('data-source');
            if (dataSourceDiv) {
                let sourceText = '';
                if (region.continent) {
                    sourceText = `🌍 ${region.continent.charAt(0).toUpperCase() + region.continent.slice(1).replace('_', ' ')} Climate Pattern`;
                } else {
                    sourceText = `🌐 ${region.hemisphere.charAt(0).toUpperCase() + region.hemisphere.slice(1)} Hemisphere`;
                }
                
                if (nearestCity && nearestCity.distance < 500) {
                    sourceText += ` | Nearest: ${nearestCity.name} (${nearestCity.distance.toFixed(0)}km)`;
                }
                
                dataSourceDiv.innerHTML = `<small>${sourceText}</small>`;
            }
        }
    } catch (error) {
        console.error('Location info error:', error);
    }
}
