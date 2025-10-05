# Usage Examples - Extreme Weather Prediction System

## Table of Contents
1. [Complete Pipeline Example](#complete-pipeline-example)
2. [Individual Step Examples](#individual-step-examples)
3. [API Examples](#api-examples)
4. [Custom Configuration Examples](#custom-configuration-examples)

---

## Complete Pipeline Example

### Run Everything at Once (Recommended)

```bash
# Collect data for multiple cities, train models, and evaluate
python run_pipeline.py --multi --run-evaluation

# Or with API server startup
python run_pipeline.py --multi --run-evaluation --start-api
```

**Expected Output:**
```
======================================================================
🌍 EXTREME WEATHER PREDICTION - COMPLETE PIPELINE
======================================================================

======================================================================
STEP: Data Collection from NASA API
======================================================================
Running: python src/data_collection.py --multi

Fetching data for New_York (40.7128, -74.006)
Requesting data from NASA POWER API...
✓ Saved raw data to data/raw/New_York_raw.csv
✓ Collected 5114 days of data

[... continues for 8 cities ...]

Creating extreme weather labels...
Extreme weather label distribution:
  very_hot: 256 days (5.01%)
  very_cold: 257 days (5.02%)
  very_windy: 255 days (4.99%)
  very_wet: 256 days (5.01%)
  very_uncomfortable: 256 days (5.01%)

✓ Saved labeled data to data/processed/labeled_data.csv

======================================================================
STEP: Feature Engineering
======================================================================
[... feature creation ...]
✓ Feature engineering complete!
  Total features: 187
  Final dataset size: 40912 rows

======================================================================
STEP: Model Training
======================================================================
Training models for: very_hot
  Training Logistic Regression...
    Validation ROC-AUC: 0.8234
  Training Random Forest...
    Validation ROC-AUC: 0.8567
  Training XGBoost...
    Validation ROC-AUC: 0.8891
  Training LightGBM...
    Validation ROC-AUC: 0.8923
  ✓ Best model: lightgbm (Val AUC: 0.8923)

[... continues for all 5 targets ...]

======================================================================
STEP: Model Evaluation
======================================================================
[... evaluation metrics and plots ...]

✅ PIPELINE COMPLETED SUCCESSFULLY!

Next steps:
  1. Review trained models in: models/trained/
  2. Check evaluation results in: evaluation_results/
  3. Start the API server: python src/api.py
  4. Open frontend: frontend/index.html
```

---

## Individual Step Examples

### Example 1: Collect Data for Single Location

```bash
python src/data_collection.py --lat 34.0522 --lon -118.2437 --name "Los_Angeles"
```

**Output:**
```
Fetching data for Los_Angeles (34.0522, -118.2437)
Requesting data from NASA POWER API...
✓ Saved raw data to data/raw/Los_Angeles_raw.csv
✓ Collected 5114 days of data

Creating extreme weather labels...
Extreme weather label distribution:
  very_hot: 256 days (5.01%)
  very_cold: 5 days (0.10%)
  very_windy: 128 days (2.50%)
  very_wet: 64 days (1.25%)
  very_uncomfortable: 320 days (6.26%)

✓ Saved labeled data to data/processed/labeled_data.csv
✓ Data collection complete! Total records: 5114
```

### Example 2: Feature Engineering

```bash
python src/feature_engineering.py
```

**Output:**
```
==================================================
Starting Feature Engineering Pipeline
==================================================
Creating temporal features...
Creating lag features for [1, 2, 3, 7] days...
Creating rolling features for windows [3, 7, 14, 30]...
Creating trend features...
Creating historical comparison features...
Creating interaction features...

✓ Feature engineering complete!
  Total features: 187
  Removed 30 rows due to NaN values
  Final dataset size: 5084 rows

✓ Saved engineered features to data/processed/features_engineered.csv
```

### Example 3: Train Models

```bash
python src/train_models.py
```

**Output:**
```
Loading features from data/processed/features_engineered.csv...
✓ Loaded 5084 samples with 197 columns

============================================================
Training models for: very_hot
============================================================

Preparing data for very_hot...
  Chronological split:
    Train: 3050 samples
    Validation: 1017 samples
    Test: 1017 samples
  Target class distribution in train: 5.18% positive

  Training Logistic Regression...
    Validation ROC-AUC: 0.8234
  
  Evaluating Logistic Regression...
    ROC-AUC: 0.8156
    PR-AUC: 0.4521
    Brier Score: 0.0421
    Log Loss: 0.1523

  Training Random Forest...
    Validation ROC-AUC: 0.8567
  
  Evaluating Random Forest...
    ROC-AUC: 0.8489
    PR-AUC: 0.5234
    Brier Score: 0.0389
    Log Loss: 0.1342

  Training XGBoost...
    Validation ROC-AUC: 0.8891
  
  Evaluating XGBoost...
    ROC-AUC: 0.8823
    PR-AUC: 0.6012
    Brier Score: 0.0345
    Log Loss: 0.1189

  Training LightGBM...
    Validation ROC-AUC: 0.8923
  
  Evaluating LightGBM...
    ROC-AUC: 0.8876
    PR-AUC: 0.6145
    Brier Score: 0.0334
    Log Loss: 0.1156

  ✓ Best model: lightgbm (Val AUC: 0.8923)

[... repeats for all 5 targets ...]

============================================================
Saving models...
============================================================
✓ Saved very_hot model: models/trained/very_hot_lightgbm.pkl
✓ Saved very_cold model: models/trained/very_cold_xgboost.pkl
✓ Saved very_windy model: models/trained/very_windy_lightgbm.pkl
✓ Saved very_wet model: models/trained/very_wet_xgboost.pkl
✓ Saved very_uncomfortable model: models/trained/very_uncomfortable_lightgbm.pkl
✓ Saved feature names: models/trained/feature_names.pkl
✓ Saved metadata: models/trained/metadata.json

============================================================
✓ Training complete!
============================================================
```

### Example 4: Evaluate Models

```bash
python src/evaluate.py
```

**Output:**
```
Loading test data...
✓ Loaded 1017 test samples

============================================================
Evaluating very_hot
============================================================
Generating evaluation plots...
  ✓ ROC curve: evaluation_results/very_hot_roc_curve.png
  ✓ PR curve: evaluation_results/very_hot_pr_curve.png
  ✓ Calibration curve: evaluation_results/very_hot_calibration.png
  ✓ Confusion matrix: evaluation_results/very_hot_confusion_matrix.png
  ✓ Feature importance: evaluation_results/very_hot_feature_importance.png

Classification Report:
              precision    recall  f1-score   support

           0       0.98      0.97      0.97       965
           1       0.72      0.78      0.75        52

    accuracy                           0.96      1017
   macro avg       0.85      0.88      0.86      1017
weighted avg       0.96      0.96      0.96      1017

[... repeats for all 5 targets ...]

============================================================
✓ Evaluation complete!
✓ Results saved to: evaluation_results
============================================================
```

---

## API Examples

### Example 1: Start API Server

```bash
python src/api.py
```

**Output:**
```
✓ Loaded models for 5 targets

============================================================
Starting Extreme Weather Prediction API
Server: http://0.0.0.0:8000
Docs: http://0.0.0.0:8000/docs
============================================================

INFO:     Started server process [12345]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Example 2: Test API Health

```bash
curl http://localhost:8000/health
```

**Response:**
```json
{
  "status": "healthy",
  "models_loaded": true,
  "timestamp": "2024-10-03T14:30:00.123456"
}
```

### Example 3: Get Model Information

```bash
curl http://localhost:8000/model/info
```

**Response:**
```json
{
  "targets": [
    "very_hot",
    "very_cold",
    "very_windy",
    "very_wet",
    "very_uncomfortable"
  ],
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
    },
    ...
  }
}
```

### Example 4: Make Prediction (cURL)

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

### Example 5: Make Prediction (Python)

```python
import requests

# Prediction request
response = requests.post(
    "http://localhost:8000/predict",
    json={
        "latitude": 25.7617,
        "longitude": -80.1918,
        "date": "2024-08-20",
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

print(f"Location: Miami, FL")
print(f"Date: {result['date']}")
print(f"Overall Risk: {result['risk_level']}")
print("\nPredictions:")
for condition, probability in result['predictions'].items():
    print(f"  {condition}: {probability*100:.1f}%")
```

**Output:**
```
Location: Miami, FL
Date: 2024-08-20
Overall Risk: EXTREME

Predictions:
  very_hot: 85.3%
  very_cold: 0.2%
  very_windy: 42.1%
  very_wet: 78.9%
  very_uncomfortable: 92.4%
```

### Example 6: Demo Endpoint

```bash
curl http://localhost:8000/demo/sample-prediction
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
    "very_hot": 0.6543,
    "very_cold": 0.0234,
    "very_windy": 0.3123,
    "very_wet": 0.4567,
    "very_uncomfortable": 0.5891
  },
  "risk_level": "MODERATE",
  "timestamp": "2024-10-03T14:40:15.234567"
}
```

---

## Custom Configuration Examples

### Example 1: Adjust Extreme Weather Thresholds

**File:** `config.yaml`

```yaml
# Make "very hot" more stringent (top 2% instead of top 5%)
thresholds:
  very_hot:
    percentile: 98
    absolute: 38  # Raise from 35°C to 38°C
```

### Example 2: Add More Feature Engineering Windows

**File:** `config.yaml`

```yaml
features:
  rolling_window_days: [3, 7, 14, 30, 60, 90]  # Add 60 and 90 day windows
  lag_days: [1, 2, 3, 7, 14]  # Add 14-day lag
```

### Example 3: Tune Model Hyperparameters

**File:** `config.yaml`

```yaml
models:
  xgboost:
    n_estimators: 500  # Increase from 300
    max_depth: 12      # Increase from 10
    learning_rate: 0.03  # Decrease from 0.05 for more regularization
```

### Example 4: Change Train/Test Split

**File:** `config.yaml`

```yaml
training:
  test_size: 0.15  # Use 15% for test (instead of 20%)
  validation_size: 0.15  # Use 15% for validation
  # This leaves 70% for training (instead of 60%)
```

### Example 5: Add Custom Location

**File:** `src/data_collection.py`, line ~240

```python
locations = [
    (40.7128, -74.0060, "New_York"),
    (34.0522, -118.2437, "Los_Angeles"),
    # Add your location here:
    (51.5074, -0.1278, "London"),
    (35.6762, 139.6503, "Tokyo"),
]
```

---

## Batch Processing Example

### Process Multiple Locations

**Script:** `batch_predict.py`

```python
import requests
import pandas as pd
from datetime import datetime

# Define locations
locations = [
    {"name": "New York", "lat": 40.7128, "lon": -74.0060},
    {"name": "Los Angeles", "lat": 34.0522, "lon": -118.2437},
    {"name": "Chicago", "lat": 41.8781, "lon": -87.6298},
    {"name": "Houston", "lat": 29.7604, "lon": -95.3698},
]

date = "2024-07-15"
results = []

for loc in locations:
    # Sample historical data (in production, fetch from NASA API)
    historical_data = {
        "T2M": 28.5, "T2M_MAX": 32.0, "T2M_MIN": 25.0,
        "PRECTOTCORR": 5.2, "WS2M": 8.5, "RH2M": 65.0,
        "PS": 101.3, "CLOUD_AMT": 45.0, "heat_index": 30.5
    }
    
    response = requests.post(
        "http://localhost:8000/predict",
        json={
            "latitude": loc["lat"],
            "longitude": loc["lon"],
            "date": date,
            "historical_data": historical_data
        }
    )
    
    if response.ok:
        result = response.json()
        results.append({
            "location": loc["name"],
            "risk_level": result["risk_level"],
            **result["predictions"]
        })

# Convert to DataFrame
df = pd.DataFrame(results)
print(df)

# Save to CSV
df.to_csv("batch_predictions.csv", index=False)
```

**Output:**
```
      location risk_level  very_hot  very_cold  very_windy  very_wet  very_uncomfortable
0     New York       HIGH    0.7234     0.0123      0.2456    0.3421              0.6789
1  Los Angeles   MODERATE    0.5621     0.0089      0.1234    0.2345              0.5123
2      Chicago       HIGH    0.6891     0.0234      0.4567    0.5678              0.6234
3      Houston    EXTREME    0.8234     0.0045      0.3456    0.6789              0.8456
```

---

## Troubleshooting Examples

### Issue 1: NASA API Rate Limit

**Error:**
```
Error fetching data: 429 Too Many Requests
```

**Solution:**
```bash
# Add delays between requests
# Edit data_collection.py, line ~170
time.sleep(2)  # Increase from 1 to 2 seconds
```

### Issue 2: Out of Memory During Training

**Error:**
```
MemoryError: Unable to allocate array
```

**Solution:**
```yaml
# Reduce feature engineering in config.yaml
features:
  rolling_window_days: [7, 14]  # Reduce from [3, 7, 14, 30]
  lag_days: [1, 7]  # Reduce from [1, 2, 3, 7]
```

### Issue 3: Low Model Accuracy

**Symptoms:**
```
ROC-AUC: 0.52 (barely better than random)
```

**Solutions:**
```bash
# 1. Collect more data
python src/data_collection.py --multi

# 2. Adjust thresholds for more balanced classes
# Edit config.yaml, change percentile from 95 to 90

# 3. Add more features
# Edit feature_engineering.py to add domain-specific features
```

---

## Production Deployment Example

### Docker Deployment

**Dockerfile:**
```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["python", "src/api.py"]
```

**Build and Run:**
```bash
docker build -t weather-prediction .
docker run -p 8000:8000 weather-prediction
```

---

## Summary

This system provides a complete end-to-end solution for extreme weather prediction:

✅ **Data Collection** from NASA APIs  
✅ **Feature Engineering** with 187+ features  
✅ **Model Training** with 4 different algorithms  
✅ **Evaluation** with comprehensive metrics  
✅ **API Deployment** with FastAPI  
✅ **Modern UI** with visualizations  

All components are modular, configurable, and production-ready!

