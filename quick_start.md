# Quick Start Guide - Extreme Weather Prediction System

## Prerequisites

1. **Python 3.8 or higher**
2. **NASA API Key** (free): Get from https://api.nasa.gov/

## Installation Steps

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure API Key

Open `config.yaml` and update:
```yaml
data:
  nasa_api_key: "YOUR_NASA_API_KEY_HERE"
```

## Usage Options

### Option A: Run Complete Pipeline (Recommended for First Time)

```bash
# Run everything at once
python run_pipeline.py --multi --run-evaluation

# Or for a single location
python run_pipeline.py --lat 40.7128 --lon -74.0060 --name "New_York" --run-evaluation
```

This will:
- Collect NASA data
- Engineer features
- Train all models
- Evaluate performance

**Expected time:** 30-60 minutes depending on data size

---

### Option B: Step-by-Step Execution

#### Step 1: Collect Data

```bash
# Single location
python src/data_collection.py --lat 40.7128 --lon -74.0060 --name "New_York"

# Multiple locations (recommended for better model)
python src/data_collection.py --multi
```

**Output:** `data/raw/` and `data/processed/labeled_data.csv`

#### Step 2: Engineer Features

```bash
python src/feature_engineering.py
```

**Output:** `data/processed/features_engineered.csv`

#### Step 3: Train Models

```bash
python src/train_models.py
```

**Output:** Trained models in `models/trained/`

Models trained:
- Logistic Regression
- Random Forest
- XGBoost
- LightGBM

Best model for each target is automatically selected.

#### Step 4: Evaluate Models (Optional)

```bash
python src/evaluate.py
```

**Output:** Visualizations in `evaluation_results/`
- ROC curves
- Precision-Recall curves
- Calibration curves
- Confusion matrices
- Feature importance

---

### Option C: Use Demo Mode (No NASA Data Required)

If you want to test the system without collecting data:

```bash
# Start API server with demo endpoint
python src/api.py

# In another terminal, test demo prediction
curl http://localhost:8000/demo/sample-prediction
```

---

## Running the Application

### 1. Start API Server

```bash
python src/api.py
```

Server will start at: `http://localhost:8000`

API Documentation: `http://localhost:8000/docs`

### 2. Open Frontend

**Option A: Direct file access**
```bash
# Simply open in browser
frontend/index.html
```

**Option B: Using local server (recommended)**
```bash
cd frontend
python -m http.server 8080
```
Then open: `http://localhost:8080`

---

## Making Predictions

### Via Frontend UI

1. Open `frontend/index.html` in browser
2. Enter location coordinates
3. Select date
4. Click "Predict Weather Risks"
5. View probability visualizations

### Via API (cURL)

```bash
curl -X POST "http://localhost:8000/predict" \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

### Via Python

```python
import requests

response = requests.post(
    "http://localhost:8000/predict",
    json={
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
)

print(response.json())
```

---

## Expected Output

### Predictions

```json
{
  "location": {"latitude": 40.7128, "longitude": -74.006},
  "date": "2024-07-15",
  "predictions": {
    "very_hot": 0.7234,
    "very_cold": 0.0123,
    "very_windy": 0.2456,
    "very_wet": 0.3421,
    "very_uncomfortable": 0.6789
  },
  "risk_level": "HIGH",
  "timestamp": "2024-01-15T10:30:00"
}
```

### Risk Levels
- **MINIMAL**: < 20% probability
- **LOW**: 20-40%
- **MODERATE**: 40-60%
- **HIGH**: 60-80%
- **EXTREME**: > 80%

---

## Troubleshooting

### NASA API Issues
- **Error 429**: Rate limit exceeded. Wait and retry.
- **Error 401**: Invalid API key. Check `config.yaml`
- **Timeout**: Try smaller date range or single location

### Model Training Issues
- **Memory Error**: Reduce data size or rolling window sizes in `config.yaml`
- **Low Accuracy**: Collect more data or adjust thresholds in `config.yaml`

### API Not Starting
- **Port in use**: Change port in `config.yaml`
- **Models not found**: Run training first: `python src/train_models.py`

### Frontend Not Loading
- **CORS Error**: Make sure API allows CORS (already configured)
- **Cannot connect**: Check API is running on `http://localhost:8000`

---

## Customization

### Adjust Extreme Weather Thresholds

Edit `config.yaml`:
```yaml
thresholds:
  very_hot:
    percentile: 95  # Top 5% (change to 90 for top 10%)
    absolute: 35    # 35°C threshold
```

### Add More Locations

Edit `src/data_collection.py` and add to `locations` list:
```python
locations = [
    (40.7128, -74.0060, "New_York"),
    (your_lat, your_lon, "Your_Location"),
]
```

### Modify Model Parameters

Edit `config.yaml`:
```yaml
models:
  random_forest:
    n_estimators: 200  # Increase for better accuracy
    max_depth: 15      # Increase for more complex models
```

---

## Performance Tips

1. **Use multiple locations** for more diverse training data
2. **Collect 3+ years** of historical data
3. **Enable cross-validation** in `config.yaml`
4. **Use chronological split** to avoid data leakage
5. **Monitor calibration** - predicted probabilities should match actual frequencies

---

## Citation

If using NASA data, cite:
```
NASA Prediction Of Worldwide Energy Resources (POWER) Project
https://power.larc.nasa.gov/
```

---

## Support

- Check logs in `logs/` directory
- Review model performance in `evaluation_results/`
- See API docs at `http://localhost:8000/docs`

