// API Configuration
const API_URL = 'http://127.0.0.1:8081';

// Chart instance
let riskChart = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;
    
    // Add event listener to predict button
    document.getElementById('predict-btn').addEventListener('click', handlePredict);
    
    // Check API health
    checkAPIHealth();
});

// Check if API is available
async function checkAPIHealth() {
    try {
        const response = await fetch(`${API_URL}/health`);
        const data = await response.json();
        
        if (!data.models_loaded) {
            showError('Models not loaded. Please train models first by running: python src/train_models.py');
        }
    } catch (error) {
        console.warn('API not available:', error);
        // Don't show error immediately - wait for user to click predict
    }
}

// Handle prediction request
async function handlePredict() {
    // Get input values
    const latitude = parseFloat(document.getElementById('latitude').value);
    const longitude = parseFloat(document.getElementById('longitude').value);
    const date = document.getElementById('date').value;
    const locationName = document.getElementById('location-name').value || `${latitude}, ${longitude}`;
    
    // Validate inputs
    if (isNaN(latitude) || isNaN(longitude) || !date) {
        showError('Please fill in all required fields (latitude, longitude, date)');
        return;
    }
    
    if (latitude < -90 || latitude > 90) {
        showError('Latitude must be between -90 and 90');
        return;
    }
    
    if (longitude < -180 || longitude > 180) {
        showError('Longitude must be between -180 and 180');
        return;
    }
    
    // Validate date is not too far in future or past
    const selectedDate = new Date(date);
    const today = new Date();
    const minDate = new Date('2010-01-01');
    const maxDate = new Date('2023-12-31');
    
    if (selectedDate < minDate || selectedDate > maxDate) {
        showError(`Date must be between 2010-01-01 and 2023-12-31 (NASA POWER API data range)`);
        return;
    }
    
    // Hide previous results and errors
    hideError();
    hideResults();
    showLoading();
    
    try {
        // Make prediction request (API will fetch NASA data automatically)
        const response = await fetch(`${API_URL}/predict`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                latitude: latitude,
                longitude: longitude,
                date: date
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `API Error: ${response.status}`);
        }
        
        const result = await response.json();
        
        // Display results
        displayResults(result, locationName);
        
    } catch (error) {
        console.error('Prediction error:', error);
        showError(`Failed to get prediction: ${error.message}`);
    } finally {
        hideLoading();
    }
}

// Display prediction results
function displayResults(result, locationName) {
    // Update risk level banner
    const riskBanner = document.getElementById('risk-banner');
    const riskLevel = document.getElementById('risk-level');
    
    riskLevel.textContent = result.risk_level;
    
    // Update banner styling based on risk level
    riskBanner.className = 'card risk-banner';
    riskBanner.classList.add(result.risk_level.toLowerCase());
    
    // Update individual predictions
    const predictions = result.predictions;
    
    for (const [key, value] of Object.entries(predictions)) {
        const percentage = (value * 100).toFixed(1);
        
        // Update percentage text
        document.getElementById(`prob-${key}`).textContent = `${percentage}%`;
        
        // Update progress bar
        document.getElementById(`bar-${key}`).style.width = `${percentage}%`;
        
        // Color code based on severity
        const bar = document.getElementById(`bar-${key}`);
        if (value >= 0.7) {
            bar.style.background = 'linear-gradient(90deg, #ef4444, #dc2626)';
        } else if (value >= 0.4) {
            bar.style.background = 'linear-gradient(90deg, #f59e0b, #d97706)';
        } else {
            bar.style.background = 'linear-gradient(90deg, #10b981, #059669)';
        }
    }
    
    // Update details
    document.getElementById('detail-location').textContent = locationName;
    document.getElementById('detail-date').textContent = result.date;
    document.getElementById('detail-timestamp').textContent = 
        new Date(result.timestamp).toLocaleString();
    
    // Add data source info if available
    if (result.data_source) {
        const sourceElement = document.getElementById('detail-source');
        if (sourceElement) {
            sourceElement.textContent = result.data_source;
        }
    }
    
    // Update chart
    updateChart(predictions);
    
    // Show results
    showResults();
}

// Update risk visualization chart
function updateChart(predictions) {
    const ctx = document.getElementById('riskChart').getContext('2d');
    
    // Destroy existing chart if any
    if (riskChart) {
        riskChart.destroy();
    }
    
    // Prepare data
    const labels = Object.keys(predictions).map(key => 
        key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    );
    const values = Object.values(predictions).map(v => (v * 100).toFixed(1));
    
    // Create new chart
    riskChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Probability (%)',
                data: values,
                backgroundColor: [
                    'rgba(239, 68, 68, 0.7)',
                    'rgba(59, 130, 246, 0.7)',
                    'rgba(139, 92, 246, 0.7)',
                    'rgba(16, 185, 129, 0.7)',
                    'rgba(245, 158, 11, 0.7)'
                ],
                borderColor: [
                    'rgba(239, 68, 68, 1)',
                    'rgba(59, 130, 246, 1)',
                    'rgba(139, 92, 246, 1)',
                    'rgba(16, 185, 129, 1)',
                    'rgba(245, 158, 11, 1)'
                ],
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Probability: ${context.parsed.y}%`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// UI Helper Functions
function showLoading() {
    document.getElementById('loading').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loading').classList.add('hidden');
}

function showResults() {
    document.getElementById('results-section').classList.remove('hidden');
}

function hideResults() {
    document.getElementById('results-section').classList.add('hidden');
}

function showError(message) {
    const errorDiv = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');
    
    errorText.textContent = message;
    errorDiv.classList.remove('hidden');
    
    // Auto-hide after 10 seconds
    setTimeout(hideError, 10000);
}

function hideError() {
    document.getElementById('error-message').classList.add('hidden');
}

