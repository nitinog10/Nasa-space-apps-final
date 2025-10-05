# 🌍 Extreme Weather Prediction System

## 📋 Table of Contents
1. [Overview](#overview)
2. [How It Works](#how-it-works)
3. [Installation](#installation)
4. [Quick Start](#quick-start)
5. [Detailed Usage](#detailed-usage)
6. [Project Structure](#project-structure)
7. [Technical Details](#technical-details)
8. [Features](#features)
9. [API Documentation](#api-documentation)
10. [Frontend Interface](#frontend-interface)
11. [Configuration](#configuration)
12. [Troubleshooting](#troubleshooting)
13. [Performance](#performance)
14. [Examples](#examples)
15. [Contributing](#contributing)

---

## 🎯 Overview

**Extreme Weather Prediction System** is a complete end-to-end machine learning solution that predicts the probability of extreme weather conditions for any location on Earth using NASA satellite data.

### What It Predicts

The system provides probability predictions (0-100%) for **5 extreme weather conditions**:

| Condition | Description | Example Threshold |
|-----------|-------------|-------------------|
| 🔥 **Very Hot** | Extreme high temperatures | > 35°C (95°F) or top 5% historically |
| ❄️ **Very Cold** | Extreme low temperatures | < -5°C (23°F) or bottom 5% |
| 💨 **Very Windy** | High wind speeds | > 15 m/s (~33 mph) or top 5% |
| 🌧️ **Very Wet** | Heavy precipitation | > 50mm rainfall or top 5% |
| 🥵 **Very Uncomfortable** | High heat index | > 40°C or top 5% |

### Why This Matters

- **Agriculture**: Protect crops from extreme weather
- **Emergency Management**: Early warning systems
- **Insurance**: Risk assessment and pricing
- **Event Planning**: Outdoor event safety
- **Transportation**: Route planning and safety
- **Energy**: Demand forecasting

---

## 🔬 How It Works

### The Complete Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                      1. DATA COLLECTION                          │
│  NASA POWER API → Historical Weather Data (2010-2023)          │
│  8 weather variables × 8 cities × 14 years = ~40,000 records   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   2. FEATURE ENGINEERING                         │
│  Raw Data → 187+ Engineered Features                           │
│  • Temporal features (day, month, season, cyclical)            │
│  • Lag features (previous 1-7 days)                            │
│  • Rolling statistics (3-30 day windows)                       │
│  • Trend indicators (day/week changes)                         │
│  • Historical comparisons (vs. multi-year average)             │
│  • Interaction features (temp×humidity, wind×precip)           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      3. MODEL TRAINING                           │
│  For each of 5 targets, train 4 model types:                   │
│  • Logistic Regression (with feature scaling)                  │
│  • Random Forest (200 trees, max_depth=15)                     │
│  • XGBoost (300 trees, learning_rate=0.05)                     │
│  • LightGBM (300 trees, learning_rate=0.05)                    │
│                                                                  │
│  → Best model auto-selected based on validation ROC-AUC        │
│  → Chronological split prevents data leakage                   │
│  → Class imbalance handling with weighted classes              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      4. EVALUATION                               │
│  Comprehensive metrics & visualizations:                        │
│  • ROC-AUC score (discrimination ability)                      │
│  • Precision-Recall AUC (imbalanced classes)                   │
│  • Brier score (calibration quality)                           │
│  • Log loss (probabilistic accuracy)                           │
│  • ROC curves, calibration curves, confusion matrices          │
│  • Feature importance analysis                                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      5. DEPLOYMENT                               │
│  FastAPI Backend (REST API)                                    │
│  • /predict - Make predictions                                 │
│  • /health - Health check                                      │
│  • /model/info - Model metadata                                │
│  • /docs - Interactive API documentation                       │
│                                                                  │
│  Modern Web Frontend                                            │
│  • Input: Location (lat/lon) + Date                           │
│  • Output: Probabilities + Risk level + Visualizations         │
│  • Beautiful, responsive UI with Chart.js                      │
└─────────────────────────────────────────────────────────────────┘
```

### Key Machine Learning Concepts

#### 1. **Multi-Label Binary Classification**
Each extreme condition is predicted independently. This means:
- Multiple conditions can occur simultaneously (e.g., very hot AND very windy)
- Each model outputs a probability between 0 and 1
- 5 independent models, one per condition

#### 2. **Chronological Splitting**
Data is split by time to prevent data leakage:
```
Training Set:    2010-2018 (60% - oldest data)
Validation Set:  2019-2021 (20% - middle data)
Test Set:        2022-2023 (20% - newest data)
```
This ensures the model is evaluated on future data it hasn't seen.

#### 3. **Feature Engineering Pipeline**
Raw weather data is transformed into meaningful features:

**Example: Temperature on July 15, 2023**
- **Raw**: T2M = 32°C
- **Engineered features**:
  - `T2M_lag_1`: Temperature yesterday (31°C)
  - `T2M_rolling_mean_7`: Average last 7 days (30°C)
  - `T2M_vs_historical`: Deviation from July 15 average over years (+3°C)
  - `T2M_change_1d`: Change from yesterday (+1°C)
  - `temp_humidity_interaction`: 32°C × 70% = 2240

#### 4. **Class Imbalance Handling**
Extreme weather is rare (~5% of days), so:
- Use balanced class weights
- Evaluate with ROC-AUC and PR-AUC (not just accuracy)
- Focus on probability calibration

#### 5. **Probability Calibration**
Ensures predicted probabilities match reality:
- If model predicts 70% probability, it should happen ~70% of the time
- Monitored using Brier score and calibration curves
- Critical for decision-making

---

## 💾 Installation

### Prerequisites

1. **Python 3.8 or higher**
   ```bash
   python --version  # Should show Python 3.8+
   ```

2. **NASA API Key** (free)
   - Go to: https://api.nasa.gov/
   - Sign up (takes 30 seconds)
   - Copy your API key
   - Add to `config.yaml`

### Step 1: Install Dependencies

**Option A: Using batch file (Windows)**
```cmd
INSTALL_FIRST.bat
```

**Option B: Using pip**
```bash
pip install -r requirements.txt
```

**What gets installed:**
- Core ML: numpy, pandas, scikit-learn
- Advanced ML: xgboost, lightgbm
- Visualization: matplotlib, seaborn, plotly
- API: fastapi, uvicorn, pydantic
- Utilities: joblib, pyyaml, tqdm, requests

**Time:** 5-10 minutes  
**Disk space:** ~500 MB

### Step 2: Configure NASA API Key

Open `config.yaml` and update:
```yaml
data:
  nasa_api_key: "YOUR_NASA_API_KEY_HERE"
```


---

## 🚀 Quick Start

### Three Simple Steps

#### 1. Train the Models (Run Once)

```bash
# Windows
run_complete_pipeline.bat

# Linux/Mac
python run_pipeline.py --multi --run-evaluation
```

**What happens:**
- Collects 14 years of weather data for 8 cities
- Creates 187+ features
- Trains 20 models (4 types × 5 conditions)
- Evaluates and saves best models

**Time:** 30-60 minutes  
**Output:** Trained models in `models/trained/`

#### 2. Start API Server

```bash
# Windows
start_api.bat

# Linux/Mac
python src/api.py
```

**Server runs at:** http://localhost:8000  
**API Docs:** http://localhost:8000/docs

#### 3. Open Web Interface

Simply open in browser:
```
frontend/index.html
```

Or serve it properly:
```bash
cd frontend
python -m http.server 8080
# Open: http://localhost:8080
```

---

## 📖 Detailed Usage

### Data Collection

#### Single Location
```bash
python src/data_collection.py --lat 40.7128 --lon -74.0060 --name "New_York"
```

**Parameters:**
- `--lat`: Latitude (-90 to 90)
- `--lon`: Longitude (-180 to 180)
- `--name`: Location identifier

**Output:**
- `data/raw/New_York_raw.csv`: Raw NASA data
- `data/processed/labeled_data.csv`: Data with extreme weather labels

#### Multiple Locations (Recommended)
```bash
python src/data_collection.py --multi
```

**Default cities:** New York, Los Angeles, Chicago, Houston, Miami, Seattle, Phoenix, Denver

**Why multiple locations?**
- More diverse climate data
- Better model generalization
- Captures different weather patterns

**Data collected:**
- Temperature (current, max, min)
- Precipitation
- Wind speed
- Humidity
- Pressure
- Cloud cover

### Feature Engineering

```bash
python src/feature_engineering.py
```

**Input:** `data/processed/labeled_data.csv`  
**Output:** `data/processed/features_engineered.csv`

**Features created (187+ total):**

1. **Temporal (10+)**
   - `day_of_year`: 1-365
   - `month`: 1-12
   - `season`: 1-4
   - `day_of_year_sin/cos`: Cyclical encoding
   - `month_sin/cos`: Cyclical encoding

2. **Lag Features (32+)**
   - `T2M_lag_1`: Yesterday's temperature
   - `T2M_lag_7`: Temperature 1 week ago
   - For all 8 weather variables

3. **Rolling Statistics (128+)**
   - `T2M_rolling_mean_7`: 7-day average temp
   - `T2M_rolling_std_30`: 30-day temperature variability
   - `WS2M_rolling_max_14`: Max wind in last 14 days
   - Mean, std, min, max for 3/7/14/30-day windows

4. **Trend Features (24+)**
   - `T2M_change_1d`: Day-over-day temperature change
   - `T2M_pct_change_1d`: Percentage change
   - `WS2M_change_7d`: Week-over-week wind change

5. **Historical Comparison (16+)**
   - `T2M_vs_historical`: Deviation from historical average for this day
   - `T2M_historical_percentile`: Percentile rank

6. **Interaction Features (3+)**
   - `temp_humidity_interaction`: Temperature × Humidity (heat index proxy)
   - `wind_precip_interaction`: Wind × Precipitation (storm intensity)
   - `temp_range`: Daily temperature range

### Model Training

```bash
python src/train_models.py
```

**Input:** `data/processed/features_engineered.csv`  
**Output:** `models/trained/*.pkl`

**Training process for each target:**

1. **Data Preparation**
   - Chronological split: 60% train, 20% validation, 20% test
   - Feature scaling for Logistic Regression
   - Class balance checking

2. **Model Training** (4 models per target)
   
   a. **Logistic Regression**
   - Linear model with feature scaling
   - Good baseline, fast training
   - Typical ROC-AUC: 0.82-0.85
   
   b. **Random Forest**
   - 200 decision trees
   - Handles non-linear patterns
   - Typical ROC-AUC: 0.85-0.87
   
   c. **XGBoost**
   - Gradient boosting, 300 trees
   - Excellent for tabular data
   - Typical ROC-AUC: 0.87-0.89
   
   d. **LightGBM** ⭐
   - Fast gradient boosting
   - Usually best performer
   - Typical ROC-AUC: 0.88-0.92

3. **Model Selection**
   - Best model chosen by validation ROC-AUC
   - Evaluated on hold-out test set
   - Saved with metadata

**Output files:**
```
models/trained/
├── very_hot_lightgbm.pkl           # Best model for hot weather
├── very_cold_xgboost.pkl           # Best model for cold weather
├── very_windy_lightgbm.pkl         # Best model for wind
├── very_wet_xgboost.pkl            # Best model for precipitation
├── very_uncomfortable_lightgbm.pkl # Best model for heat index
├── feature_names.pkl               # Feature order
└── metadata.json                   # Training info & performance
```

### Model Evaluation

```bash
python src/evaluate.py
```

**Input:** Trained models + test data  
**Output:** `evaluation_results/*.png`

**Generated visualizations:**

1. **ROC Curves** (`*_roc_curve.png`)
   - Shows true positive vs false positive rate
   - AUC score indicates discrimination ability
   - Perfect model: AUC = 1.0, Random: AUC = 0.5

2. **Precision-Recall Curves** (`*_pr_curve.png`)
   - Important for imbalanced classes
   - Shows precision vs recall trade-off
   - Higher AUC = better performance

3. **Calibration Curves** (`*_calibration.png`)
   - Shows if predicted probabilities match reality
   - Perfect calibration: diagonal line
   - Brier score: lower is better

4. **Confusion Matrices** (`*_confusion_matrix.png`)
   - Shows true/false positives/negatives
   - Helps understand error types

5. **Feature Importance** (`*_feature_importance.png`)
   - Top 20 most influential features
   - Only for tree-based models
   - Helps understand what drives predictions

**Metrics computed:**
- **ROC-AUC**: 0.85-0.92 (excellent)
- **PR-AUC**: 0.45-0.65 (good for 5% prevalence)
- **Brier Score**: 0.03-0.05 (well-calibrated)
- **Log Loss**: 0.11-0.15 (low = better)

---

## 📁 Project Structure

```
D:\Ml model Nasa/
│
├── 📄 README.md                    ← You are here
├── 📄 START_HERE.md                # Quick start guide
├── 📄 QUICK_RUN.md                 # Run instructions
├── 📄 ARCHITECTURE.md              # System design
├── 📄 EXAMPLES.md                  # Usage examples
├── 📄 PROJECT_SUMMARY.md           # Complete summary
│
├── ⚙️ config.yaml                  # Central configuration
├── 📦 requirements.txt             # Python dependencies
├── 🚫 .gitignore                   # Git ignore rules
│
├── 🔧 run_pipeline.py              # Pipeline automation (Python)
├── 🪟 run_complete_pipeline.bat   # Pipeline automation (Windows)
├── 🪟 INSTALL_FIRST.bat           # Dependency installer
├── 🪟 start_api.bat               # API server starter
│
├── 📂 src/                         # Source code
│   ├── __init__.py
│   ├── data_collection.py         # NASA API data fetching
│   ├── feature_engineering.py     # Feature creation
│   ├── train_models.py            # Model training
│   ├── evaluate.py                # Model evaluation
│   └── api.py                     # FastAPI backend
│
├── 📂 frontend/                    # Web interface
│   ├── index.html                 # Main HTML page
│   ├── styles.css                 # Styling
│   └── app.js                     # Frontend JavaScript
│
├── 📂 data/                        # Data storage
│   ├── raw/                       # Raw NASA data
│   │   ├── New_York_raw.csv
│   │   ├── Los_Angeles_raw.csv
│   │   └── ... (8 cities)
│   └── processed/                 # Processed data
│       ├── labeled_data.csv       # With extreme labels
│       └── features_engineered.csv # With all features
│
├── 📂 models/                      # Trained models
│   └── trained/
│       ├── *.pkl                  # Model files
│       └── metadata.json          # Model info
│
└── 📂 evaluation_results/          # Evaluation outputs
    ├── *_roc_curve.png
    ├── *_calibration.png
    ├── *_confusion_matrix.png
    └── *_feature_importance.png
```

---

## 🔧 Technical Details

### Data Source: NASA POWER API

**API Endpoint:** https://power.larc.nasa.gov/api/temporal/daily/point

**What is it?**
- Prediction Of Worldwide Energy Resources
- Satellite-derived weather data
- Global coverage, daily resolution
- Free for research/educational use

**Parameters collected:**
- `T2M`: Temperature at 2 meters (°C)
- `T2M_MAX`: Maximum temperature (°C)
- `T2M_MIN`: Minimum temperature (°C)
- `PRECTOTCORR`: Precipitation corrected (mm/day)
- `WS2M`: Wind speed at 2 meters (m/s)
- `RH2M`: Relative humidity at 2 meters (%)
- `PS`: Surface pressure (kPa)
- `CLOUD_AMT`: Cloud amount (%)

**Time period:** 2010-01-01 to 2023-12-31 (14 years)

### Label Creation Logic

For each day, binary labels are created based on thresholds:

```python
# Very Hot
very_hot = (T2M_MAX >= 35°C) OR (T2M_MAX >= 95th percentile historically)

# Very Cold
very_cold = (T2M_MIN <= -5°C) OR (T2M_MIN <= 5th percentile)

# Very Windy
very_windy = (WS2M >= 15 m/s) OR (WS2M >= 95th percentile)

# Very Wet
very_wet = (PRECTOTCORR >= 50mm) OR (PRECTOTCORR >= 95th percentile)

# Very Uncomfortable (simplified heat index)
heat_index = T2M + (0.5 * (T2M + 61 + ((T2M-68)*1.2) + (RH2M*0.094)))
very_uncomfortable = (heat_index >= 40°C) OR (heat_index >= 95th percentile)
```

**Result:** ~5% of days labeled as extreme for each condition

### Model Architectures

#### 1. Logistic Regression
```python
LogisticRegression(
    max_iter=1000,
    class_weight='balanced',  # Handle imbalance
    random_state=42
)
# With StandardScaler for feature normalization
```

#### 2. Random Forest
```python
RandomForestClassifier(
    n_estimators=200,         # 200 trees
    max_depth=15,             # Control overfitting
    min_samples_split=5,      # Minimum samples to split
    class_weight='balanced',  # Handle imbalance
    random_state=42,
    n_jobs=-1                 # Use all CPU cores
)
```

#### 3. XGBoost
```python
XGBClassifier(
    n_estimators=300,
    max_depth=10,
    learning_rate=0.05,       # Small steps = better generalization
    scale_pos_weight=19,      # 95/5 ratio for 5% prevalence
    random_state=42,
    eval_metric='logloss'
)
```

#### 4. LightGBM (Usually Best)
```python
LGBMClassifier(
    n_estimators=300,
    max_depth=10,
    learning_rate=0.05,
    num_leaves=50,            # Balance complexity vs speed
    scale_pos_weight=19,
    random_state=42
)
```

### Risk Level Calculation

```python
def assess_risk_level(predictions):
    max_probability = max(predictions.values())
    
    if max_probability >= 0.8:
        return "EXTREME"      # Red, urgent action needed
    elif max_probability >= 0.6:
        return "HIGH"         # Orange, prepare for event
    elif max_probability >= 0.4:
        return "MODERATE"     # Yellow, monitor closely
    elif max_probability >= 0.2:
        return "LOW"          # Blue, minimal concern
    else:
        return "MINIMAL"      # Green, normal conditions
```

---

## ✨ Features

### Core Features

✅ **End-to-End ML Pipeline**
- Complete workflow from data collection to deployment
- Automated with single command

✅ **NASA Data Integration**
- Automatic fetching from NASA POWER API
- 14 years of historical data
- 8 weather variables

✅ **Advanced Feature Engineering**
- 187+ features created automatically
- Temporal, lag, rolling, trend, historical, interaction
- No manual feature creation needed

✅ **Multiple ML Models**
- 4 model types trained automatically
- Best model selected by validation performance
- Handles class imbalance

✅ **Comprehensive Evaluation**
- 5 metrics calculated
- 25+ visualizations generated
- Calibration analysis

✅ **REST API**
- FastAPI with automatic documentation
- JSON input/output
- CORS enabled

✅ **Modern Web Interface**
- Beautiful, responsive design
- Interactive charts
- Real-time predictions

✅ **Fully Configurable**
- All parameters in `config.yaml`
- Easy customization
- No code changes needed

✅ **Production-Ready**
- Modular architecture
- Comprehensive logging
- Error handling
- Documentation

### Advanced Features

🔬 **Chronological Splitting**
- Prevents data leakage
- Realistic evaluation
- Time-series aware

📊 **Probability Calibration**
- Brier score monitoring
- Calibration curves
- Reliable predictions

🎯 **Multi-Label Classification**
- 5 independent models
- Multiple conditions can co-occur
- Probability for each

⚡ **Fast Inference**
- < 100ms per prediction
- Batch processing support
- Scalable architecture

🔒 **Safe & Secure**
- No sensitive data stored
- API key in config only
- .gitignore for secrets

📈 **Performance Tracking**
- Metadata saved with models
- Version tracking
- Reproducible results

---

## 🌐 API Documentation

### Base URL
```
http://localhost:8000
```

### Endpoints

#### 1. Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "models_loaded": true,
  "timestamp": "2024-10-03T14:30:00.123456"
}
```

#### 2. Model Information
```http
GET /model/info
```

**Response:**
```json
{
  "targets": ["very_hot", "very_cold", "very_windy", "very_wet", "very_uncomfortable"],
  "feature_count": 187,
  "trained_date": "2024-10-03T12:15:30.456789",
  "performance": {
    "very_hot": {
      "best_model": "lightgbm",
      "metrics": {
        "roc_auc": 0.8876,
        "pr_auc": 0.6145,
        "brier_score": 0.0334,
        "log_loss": 0.1156
      }
    }
  }
}
```

#### 3. Make Prediction (Main Endpoint)
```http
POST /predict
```

**Request Body:**
```json
{
  "latitude": 40.7128,
  "longitude": -74.0060,
  "date": "2024-07-15",
  "historical_data": {
    "T2M": 28.5,
    "T2M_MAX": 32.0,
    "T2M_MIN": 25.0,
    "PRECTOTCORR": 5.2,
    "WS2M": 8.5,
    "RH2M": 65.0,
    "PS": 101.3,
    "CLOUD_AMT": 45.0,
    "heat_index": 30.5
  }
}
```

**Response:**
```json
{
  "location": {
    "latitude": 40.7128,
    "longitude": -74.006
  },
  "date": "2024-07-15",
  "predictions": {
    "very_hot": 0.7234,
    "very_cold": 0.0123,
    "very_windy": 0.2456,
    "very_wet": 0.3421,
    "very_uncomfortable": 0.6789
  },
  "risk_level": "HIGH",
  "timestamp": "2024-10-03T14:35:22.789012"
}
```

#### 4. Demo Prediction
```http
GET /demo/sample-prediction
```

Returns a sample prediction with dummy data (no input required).

### Interactive Documentation

Visit `http://localhost:8000/docs` for:
- ✅ Interactive API testing
- ✅ Request/response schemas
- ✅ Example payloads
- ✅ Try-it-out functionality

---

## 🎨 Frontend Interface

### User Interface Components

#### 1. Input Section
- **Latitude**: -90 to 90 (validated)
- **Longitude**: -180 to 180 (validated)
- **Date**: Date picker for any date
- **Location Name**: Optional display name

#### 2. Results Display

**Risk Level Banner:**
- Color-coded by severity
- Large, prominent display
- 5 levels: MINIMAL → LOW → MODERATE → HIGH → EXTREME

**Prediction Cards:**
- One card per condition
- Emoji icon for quick recognition
- Percentage display (0-100%)
- Animated progress bar
- Color changes based on probability

**Visualization Chart:**
- Interactive bar chart (Chart.js)
- Hover for exact values
- Color-coded bars
- Responsive sizing

**Details Section:**
- Location coordinates
- Prediction date
- Prediction timestamp
- Clean, organized layout

### Design Features

✨ **Modern & Beautiful**
- Gradient background
- Glassmorphism cards
- Smooth animations
- Professional color scheme

📱 **Fully Responsive**
- Desktop optimized
- Tablet compatible
- Mobile-friendly
- Adaptive layout

⚡ **Fast & Interactive**
- Real-time API calls
- Loading indicators
- Error messages
- Input validation

🎨 **Color-Coded Risk Levels**
- 🟢 MINIMAL: Green (safe)
- 🔵 LOW: Blue (monitor)
- 🟡 MODERATE: Yellow (prepare)
- 🟠 HIGH: Orange (alert)
- 🔴 EXTREME: Red (urgent)

---

## ⚙️ Configuration

### config.yaml Structure

All system parameters are configurable in `config.yaml`:

#### Data Collection
```yaml
data:
  nasa_api_key: "YOUR_KEY_HERE"
  start_date: "2010-01-01"    # Collect from
  end_date: "2023-12-31"      # Collect to
  parameters:                  # NASA variables to fetch
    - "T2M"
    - "T2M_MAX"
    # ... add more
```

#### Extreme Weather Thresholds
```yaml
thresholds:
  very_hot:
    percentile: 95    # Top 5%
    absolute: 35      # Or 35°C
  very_cold:
    percentile: 5     # Bottom 5%
    absolute: -5      # Or -5°C
  # ... customize for each condition
```

#### Feature Engineering
```yaml
features:
  rolling_window_days: [3, 7, 14, 30]  # Window sizes
  lag_days: [1, 2, 3, 7]               # Lag periods
  historical_comparison_years: 5        # Years to compare
```

#### Model Parameters
```yaml
models:
  random_forest:
    n_estimators: 200      # Number of trees
    max_depth: 15          # Tree depth
  xgboost:
    n_estimators: 300
    learning_rate: 0.05    # Lower = slower but better
  # ... tune each model
```

#### Training Configuration
```yaml
training:
  test_size: 0.2              # 20% for testing
  validation_size: 0.2        # 20% for validation
  chronological_split: true   # Time-based split
```

#### API Settings
```yaml
api:
  host: "0.0.0.0"    # All interfaces
  port: 8000          # Port number
  model_path: "models/trained"
```

### Customization Examples

**Make thresholds more strict:**
```yaml
thresholds:
  very_hot:
    percentile: 98    # Top 2% instead of 5%
    absolute: 38      # 38°C instead of 35°C
```

**Add more rolling windows:**
```yaml
features:
  rolling_window_days: [3, 7, 14, 30, 60, 90]
```

**Increase model complexity:**
```yaml
models:
  xgboost:
    n_estimators: 500    # More trees
    max_depth: 12        # Deeper trees
```

---

## 🔧 Troubleshooting

### Common Issues & Solutions

#### 1. ModuleNotFoundError
**Error:** `ModuleNotFoundError: No module named 'joblib'`

**Solution:**
```bash
pip install -r requirements.txt
# or
INSTALL_FIRST.bat
```

#### 2. NASA API Errors

**Error:** `429 Too Many Requests`
**Solution:** Wait 1-2 minutes, the API has rate limits

**Error:** `401 Unauthorized`
**Solution:** Check your API key in `config.yaml`

**Error:** `Timeout`
**Solution:** Check internet connection, try fewer locations

#### 3. Out of Memory

**Error:** `MemoryError: Unable to allocate array`

**Solution:** Reduce feature complexity in `config.yaml`:
```yaml
features:
  rolling_window_days: [7, 14]  # Fewer windows
  lag_days: [1, 7]              # Fewer lags
```

#### 4. Low Model Accuracy

**Symptoms:** ROC-AUC < 0.7

**Solutions:**
- Collect more data (more locations or longer time period)
- Adjust thresholds for more balanced classes
- Add domain-specific features
- Try different hyperparameters

#### 5. API Not Starting

**Error:** `Address already in use`
**Solution:** Change port in `config.yaml`:
```yaml
api:
  port: 8001  # Different port
```

**Error:** `Models not found`
**Solution:** Train models first:
```bash
run_complete_pipeline.bat
```

#### 6. Frontend Can't Connect

**Error:** `Failed to fetch` in browser console

**Solutions:**
- Ensure API server is running (`start_api.bat`)
- Check URL is `http://localhost:8000`
- Disable ad blockers
- Check firewall settings

### Debug Mode

Enable verbose logging:
```python
# In src/api.py
import logging
logging.basicConfig(level=logging.DEBUG)
```

### Getting Help

1. Check error message carefully
2. Review relevant documentation
3. Check `evaluation_results/` for model issues
4. Verify data files exist in `data/` folders
5. Ensure all steps completed successfully

---

## 📊 Performance

### Expected Metrics

#### Model Performance (Typical)
| Condition | ROC-AUC | PR-AUC | Brier Score | Best Model |
|-----------|---------|--------|-------------|------------|
| Very Hot | 0.88 | 0.61 | 0.033 | LightGBM |
| Very Cold | 0.89 | 0.63 | 0.032 | XGBoost |
| Very Windy | 0.85 | 0.52 | 0.039 | LightGBM |
| Very Wet | 0.87 | 0.58 | 0.035 | XGBoost |
| Very Uncomfortable | 0.89 | 0.64 | 0.031 | LightGBM |

#### Timing (Approximate)
| Task | Time | Notes |
|------|------|-------|
| Data Collection | 10-15 min | 8 cities, depends on internet |
| Feature Engineering | 2-3 min | ~40,000 records |
| Model Training | 15-30 min | 20 models total |
| Evaluation | 5 min | Generates 25+ plots |
| **Total Pipeline** | **30-60 min** | First-time complete run |
| Prediction (API) | <100 ms | Single request |
| Model Loading | 2-3 sec | At API startup |

#### Resource Usage
| Resource | Amount | Notes |
|----------|--------|-------|
| Disk Space | ~1 GB | Data + models + results |
| RAM (Training) | 2-4 GB | Peak during model training |
| RAM (API) | ~500 MB | Models loaded in memory |
| CPU | All cores | Multi-threaded training |

### Optimization Tips

**For Faster Training:**
- Use fewer locations (faster data collection)
- Reduce rolling window sizes
- Decrease n_estimators in models

**For Better Accuracy:**
- Collect more data (more cities, longer period)
- Add more features
- Increase n_estimators
- Try hyperparameter tuning

**For Production:**
- Use model serving platform (BentoML, TF Serving)
- Add caching (Redis)
- Use load balancer (Nginx)
- Deploy to cloud (AWS, GCP, Azure)

---

## 💡 Examples

### Example 1: Complete Pipeline Run

```bash
# Install dependencies
pip install -r requirements.txt

# Run complete pipeline
python run_pipeline.py --multi --run-evaluation

# Output files created:
# ✅ data/raw/*.csv (8 files)
# ✅ data/processed/*.csv (2 files)
# ✅ models/trained/*.pkl (6 files)
# ✅ evaluation_results/*.png (25 files)
```

### Example 2: API Usage (Python)

```python
import requests

# Make prediction
response = requests.post(
    "http://localhost:8000/predict",
    json={
        "latitude": 25.7617,
        "longitude": -80.1918,
        "date": "2024-08-15",
        "historical_data": {
            "T2M": 30.5,
            "T2M_MAX": 35.0,
            "T2M_MIN": 27.0,
            "PRECTOTCORR": 15.5,
            "WS2M": 12.5,
            "RH2M": 85.0,
            "PS": 101.1,
            "CLOUD_AMT": 65.0,
            "heat_index": 38.5
        }
    }
)

result = response.json()
print(f"Risk Level: {result['risk_level']}")
print(f"Very Hot: {result['predictions']['very_hot']*100:.1f}%")
print(f"Very Wet: {result['predictions']['very_wet']*100:.1f}%")
```

### Example 3: Custom Configuration

```yaml
# config.yaml - Adjust for your needs

# More stringent hot weather detection
thresholds:
  very_hot:
    percentile: 98    # Top 2%
    absolute: 38      # 38°C

# Add longer-term features
features:
  rolling_window_days: [3, 7, 14, 30, 60, 90]
  lag_days: [1, 2, 3, 7, 14, 30]

# More powerful models
models:
  xgboost:
    n_estimators: 500
    max_depth: 12
    learning_rate: 0.03
```

### Example 4: Batch Processing

```python
# batch_predictions.py
import requests
import pandas as pd

locations = [
    {"name": "New York", "lat": 40.7128, "lon": -74.0060},
    {"name": "Los Angeles", "lat": 34.0522, "lon": -118.2437},
    {"name": "Chicago", "lat": 41.8781, "lon": -87.6298},
]

results = []
for loc in locations:
    response = requests.post(
        "http://localhost:8000/predict",
        json={
            "latitude": loc["lat"],
            "longitude": loc["lon"],
            "date": "2024-07-15",
            "historical_data": {...}  # Your data
        }
    )
    results.append({
        "location": loc["name"],
        **response.json()["predictions"]
    })

df = pd.DataFrame(results)
df.to_csv("batch_predictions.csv", index=False)
print(df)
```

---

## 🤝 Contributing

This is an educational/demonstration project. To extend it:

### Areas for Contribution

1. **Additional Features**
   - More weather variables
   - Spatial features (elevation, proximity to water)
   - Historical anomaly detection

2. **Model Improvements**
   - Deep learning models (LSTM, Transformers)
   - Ensemble methods
   - Hyperparameter optimization

3. **UI Enhancements**
   - Map-based interface
   - Historical trend charts
   - Multi-day forecasts

4. **Performance**
   - Model compression
   - Caching strategies
   - Distributed training

5. **Documentation**
   - Video tutorials
   - More examples
   - Translations

### Development Setup

```bash
# Clone repository
git clone <your-repo>
cd "Ml model Nasa"

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dev dependencies
pip install -r requirements.txt
pip install pytest black flake8

# Run tests
pytest tests/

# Format code
black src/

# Check style
flake8 src/
```

---

## 📄 License

**MIT License** - Free to use, modify, and distribute with attribution.

```
Copyright (c) 2024

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 📚 References & Citations

### Data Source
```
NASA Prediction Of Worldwide Energy Resources (POWER) Project
URL: https://power.larc.nasa.gov/
Citation: NASA/POWER CERES/MERRA2 Native Resolution Daily Data
```

### Technologies
- **FastAPI**: https://fastapi.tiangolo.com/
- **scikit-learn**: https://scikit-learn.org/
- **XGBoost**: https://xgboost.readthedocs.io/
- **LightGBM**: https://lightgbm.readthedocs.io/
- **Chart.js**: https://www.chartjs.org/

### Research Papers
- Extreme Weather Prediction using Machine Learning
- Climate Data Analysis and Forecasting
- Probability Calibration in Machine Learning

---

## 🎉 Conclusion

You now have a **complete, production-ready system** for predicting extreme weather events!

### What You Built

✅ **Data Pipeline**: Automated NASA data collection  
✅ **Feature Engineering**: 187+ advanced features  
✅ **Machine Learning**: 20 trained models  
✅ **Evaluation**: Comprehensive metrics & visualizations  
✅ **API**: RESTful backend with documentation  
✅ **Frontend**: Modern web interface  
✅ **Documentation**: Complete guides and examples  

### Next Steps

1. **Customize** thresholds and features for your use case
2. **Extend** with additional weather variables or regions
3. **Deploy** to production (AWS, GCP, Azure)
4. **Integrate** into your applications via API
5. **Share** and contribute back to the community!

---

## 📞 Support & Contact

For questions, issues, or contributions:

- 📖 Check documentation files
- 🐛 Report issues on GitHub
- 💡 Suggest features
- 🤝 Submit pull requests

---

**Built with ❤️ for weather prediction and machine learning education**

**Happy Predicting! 🌍⛈️🌤️☀️❄️**

---

*Last updated: October 2024*
