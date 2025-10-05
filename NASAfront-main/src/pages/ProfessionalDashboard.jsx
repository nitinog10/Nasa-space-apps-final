import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import Plot from 'react-plotly.js';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// --- Leaflet Icon Fix ---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// --- Main Dashboard Component ---
const ProfessionalDashboard = () => {
    // --- State Management ---
    const [coords, setCoords] = useState({ lat: 23.2599, lon: 77.4126 });
    const [locationName, setLocationName] = useState("Bhopal");
    const [currentWeather, setCurrentWeather] = useState(null);
    const [riskPrediction, setRiskPrediction] = useState(null);
    const [forecast, setForecast] = useState(null);
    const [activeLayer, setActiveLayer] = useState('temp_new');
    const [isLoading, setIsLoading] = useState({ weather: true, risk: true, forecast: true });
    const [error, setError] = useState(null);

    const OWM_KEY = '84254d5ce02335eb1d0ed7c9393e2ebb'; // Hardcoded for simplicity

    const API_BASE_URL = 'http://127.0.0.1:8081';

    // --- Data Fetching ---
    const fetchData = useCallback(async () => {
        setIsLoading({ weather: true, risk: true, forecast: true });
        setError(null);

        const fetchWeather = axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${OWM_KEY}&units=metric`);
        const fetchRisk = axios.post(`${API_BASE_URL}/predict`, { latitude: coords.lat, longitude: coords.lon, date: new Date().toISOString().slice(0, 10) });
        const fetchForecast = axios.post(`${API_BASE_URL}/forecast`, { latitude: coords.lat, longitude: coords.lon, months: 6 });

        try {
            const [weatherRes, riskRes, forecastRes] = await Promise.all([fetchWeather, fetchRisk, fetchForecast]);
            setCurrentWeather(weatherRes.data);
            setRiskPrediction(riskRes.data);
            setForecast(forecastRes.data);
        } catch (err) {
            console.error("Data fetching error:", err);
            setError("Failed to fetch data. Ensure the backend is running and models are trained.");
        } finally {
            setIsLoading({ weather: false, risk: false, forecast: false });
        }
    }, [coords]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- UI Components & Helpers ---
    const getRiskColor = (level) => ({
        'EXTREME': '#e74c3c', 'HIGH': '#f39c12', 'MODERATE': '#f1c40f',
        'LOW': '#2ecc71', 'MINIMAL': '#95a5a6'
    }[level] || '#95a5a6');

    const layers = {
        'temp_new': { name: 'Temperature', icon: '🌡️', color: '#e74c3c' },
        'wind_new': { name: 'Wind', icon: '💨', color: '#3498db' },
        'precipitation_new': { name: 'Precipitation', icon: '💧', color: '#8e44ad' },
        'clouds_new': { name: 'Clouds', icon: '☁️', color: '#95a5a6' },
    };

    const renderBellCurve = (param, data) => {
        const { mean, std_dev } = data;
        const x = Array.from({ length: 100 }, (_, i) => i / 99); // Probabilities from 0 to 1
        const y = x.map(p => (1 / (std_dev * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((p - mean) / std_dev, 2)));
        
        return (
            <Plot
                data={[{ x, y, type: 'scatter', mode: 'lines', fill: 'tozeroy', line: { color: '#4facfe' } }]}
                layout={{
                    height: 100,
                    margin: { t: 5, b: 20, l: 20, r: 20 },
                    xaxis: { showgrid: false, zeroline: false, showticklabels: false, range: [0, 1] },
                    yaxis: { showgrid: false, zeroline: false, showticklabels: false },
                    paper_bgcolor: 'transparent',
                    plot_bgcolor: 'transparent',
                }}
                config={{ displayModeBar: false }}
                style={{ width: '100%' }}
            />
        );
    };

    return (
        <div style={styles.dashboard}>
            {/* --- Left Sidebar --- */}
            <div style={styles.sidebar}>
                <h1 style={styles.sidebarTitle}>Weather<br/>Intelligence</h1>
                <div style={styles.locationInput}>
                    <input type="number" value={coords.lat} onChange={e => setCoords(c => ({...c, lat: parseFloat(e.target.value)}))} placeholder="Latitude" style={styles.input} />
                    <input type="number" value={coords.lon} onChange={e => setCoords(c => ({...c, lon: parseFloat(e.target.value)}))} placeholder="Longitude" style={styles.input} />
                </div>
                {currentWeather && (
                    <div style={styles.currentWeather}>
                        <div style={{fontSize: '48px'}}>{Math.round(currentWeather.main.temp)}°C</div>
                        <div style={{textTransform: 'capitalize'}}>{currentWeather.weather[0].description}</div>
                        <div style={{opacity: 0.7}}>{locationName}</div>
                    </div>
                )}
                <div style={styles.riskPrediction}>
                    <h3 style={{textAlign: 'center', borderBottom: '1px solid #444', paddingBottom: '10px'}}>AI Risk Assessment</h3>
                    {isLoading.risk ? <p>Loading Risk...</p> : riskPrediction ? (
                        <>
                            <div style={{textAlign: 'center', padding: '10px', borderRadius: '8px', backgroundColor: getRiskColor(riskPrediction.risk_level) + '30', border: `1px solid ${getRiskColor(riskPrediction.risk_level)}`}}>
                                <strong>{riskPrediction.risk_level}</strong> Risk
                            </div>
                            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '15px'}}>
                                {Object.entries(riskPrediction.predictions).map(([key, value]) => (
                                    <div key={key} style={{fontSize: '12px'}}>
                                        <div>{key.replace('very_', '').toUpperCase()}</div>
                                        <div style={{fontWeight: 'bold', fontSize: '16px'}}>{(value * 100).toFixed(0)}%</div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : <p style={{color: '#e74c3c'}}>{error}</p>}
                </div>
            </div>

            {/* --- Main Content --- */}
            <div style={styles.mainContent}>
                {/* --- Map View --- */}
                <div style={styles.mapContainer}>
                    <MapContainer center={[coords.lat, coords.lon]} zoom={7} style={{ height: '100%', width: '100%' }} key={`${coords.lat}-${coords.lon}`}>
                        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution='&copy; CartoDB' />
                        <TileLayer url={`https://tile.openweathermap.org/map/${activeLayer}/{z}/{x}/{y}.png?appid=${OWM_KEY}`} opacity={0.6} />
                        <Marker position={[coords.lat, coords.lon]}><Popup>{locationName}</Popup></Marker>
                    </MapContainer>
                    <div style={styles.layerSelector}>
                        {Object.entries(layers).map(([key, { name, icon, color }]) => (
                            <button key={key} onClick={() => setActiveLayer(key)} style={{...styles.layerButton, backgroundColor: activeLayer === key ? color + '40' : '#2c3e50', borderColor: activeLayer === key ? color : '#444'}}>
                                {icon} {name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* --- Forecast View --- */}
                <div style={styles.forecastContainer}>
                    <h2 style={{borderBottom: '1px solid #444', paddingBottom: '10px'}}>6-Month AI Forecast</h2>
                    <div style={styles.forecastGrid}>
                        {isLoading.forecast ? <p>Loading Forecast...</p> : forecast ? forecast.forecasts.map((month, i) => (
                            <div key={i} style={{...styles.forecastCard, borderColor: getRiskColor(month.risk_level)}}>
                                <div style={{fontWeight: 'bold'}}>{month.month}</div>
                                <div style={{fontSize: '12px', color: getRiskColor(month.risk_level)}}>{month.risk_level}</div>
                                {renderBellCurve(Object.keys(month.distributions)[0], month.distributions.very_hot)}
                                <div style={{fontSize: '11px', opacity: 0.8}}>
                                    Hot: {(month.predictions.very_hot * 100).toFixed(0)}%,
                                    Cold: {(month.predictions.very_cold * 100).toFixed(0)}%
                                </div>
                            </div>
                        )) : <p style={{color: '#e74c3c'}}>{error}</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Styles ---
const styles = {
    dashboard: { display: 'flex', height: '100vh', backgroundColor: '#1e272e', color: 'white', fontFamily: 'sans-serif' },
    sidebar: { width: '300px', padding: '20px', backgroundColor: '#2c3e50', display: 'flex', flexDirection: 'column' },
    sidebarTitle: { margin: 0, fontSize: '28px', fontWeight: 'bold', background: 'linear-gradient(45deg, #4facfe, #00f2fe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
    locationInput: { margin: '20px 0', display: 'flex', gap: '10px' },
    input: { width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #444', backgroundColor: '#1e272e', color: 'white' },
    currentWeather: { textAlign: 'center', marginTop: 'auto', marginBottom: 'auto' },
    riskPrediction: { backgroundColor: '#1e272e', padding: '15px', borderRadius: '10px' },
    mainContent: { flex: 1, display: 'flex', flexDirection: 'column', padding: '20px', gap: '20px' },
    mapContainer: { flex: 1, position: 'relative', borderRadius: '15px', overflow: 'hidden' },
    layerSelector: { position: 'absolute', top: '10px', right: '10px', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '5px' },
    layerButton: { padding: '8px', borderRadius: '5px', cursor: 'pointer', border: '1px solid' },
    forecastContainer: { height: '350px', backgroundColor: '#2c3e50', borderRadius: '15px', padding: '20px' },
    forecastGrid: { display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '15px' },
    forecastCard: { backgroundColor: '#1e272e', padding: '10px', borderRadius: '10px', border: '2px solid', textAlign: 'center' },
};

export default ProfessionalDashboard;
