# 🚀 Quick Run Instructions

## ⚠️ IMPORTANT: Install Dependencies FIRST!

### **Run this ONCE before anything else:**

Double-click: **`INSTALL_FIRST.bat`**

Or from command line:
```cmd
pip install -r requirements.txt
```

This installs all required packages (takes 5-10 minutes).

---

## Prerequisites Check

Before running, make sure you have:
- ✅ Python 3.8+ installed
- ✅ Dependencies installed: `pip install -r requirements.txt` ← **DO THIS FIRST!**
- ✅ NASA API key added to `config.yaml` (already done! ✓)

## Option 1: Run Complete Pipeline (Recommended First Time)

### On Windows:
Simply double-click: **`run_complete_pipeline.bat`**

Or from command line:
```cmd
run_complete_pipeline.bat
```

This will:
1. ✅ Collect NASA data for 8 major cities
2. ✅ Engineer 187+ features
3. ✅ Train 4 models for each of 5 weather conditions
4. ✅ Evaluate all models with visualizations

**Time required:** 30-60 minutes depending on internet speed

---

## Option 2: Run Step-by-Step

### Step 1: Collect Data
```cmd
python src\data_collection.py --multi
```

### Step 2: Engineer Features
```cmd
python src\feature_engineering.py
```

### Step 3: Train Models
```cmd
python src\train_models.py
```

### Step 4: Evaluate Models
```cmd
python src\evaluate.py
```

---

## After Training: Start Using the System

### Start API Server

Double-click: **`start_api.bat`**

Or from command line:
```cmd
python src\api.py
```

The server will start at: **http://localhost:8000**

API Documentation: **http://localhost:8000/docs**

### Open Frontend

Double-click: **`frontend\index.html`**

Or serve it properly:
```cmd
cd frontend
python -m http.server 8080
```
Then open: **http://localhost:8080**

---

## Quick Test (Without Training)

If you want to test the API without training models first:

1. Start API: `python src\api.py`
2. Visit: http://localhost:8000/demo/sample-prediction
3. You'll get a demo prediction with sample data

---

## Troubleshooting

### "Module not found"
```cmd
pip install -r requirements.txt
```

### "NASA API error"
- Check your internet connection
- Verify API key in `config.yaml`
- NASA servers might be busy - try again later

### "Out of memory"
- Reduce rolling windows in `config.yaml`
- Use fewer locations (edit `src\data_collection.py`)

---

## Expected Output Files

After running, you'll have:

```
data/
  ├── raw/
  │   ├── New_York_raw.csv
  │   ├── Los_Angeles_raw.csv
  │   └── ... (8 cities)
  └── processed/
      ├── labeled_data.csv
      └── features_engineered.csv

models/
  └── trained/
      ├── very_hot_lightgbm.pkl
      ├── very_cold_xgboost.pkl
      ├── very_windy_lightgbm.pkl
      ├── very_wet_xgboost.pkl
      ├── very_uncomfortable_lightgbm.pkl
      ├── feature_names.pkl
      └── metadata.json

evaluation_results/
  ├── very_hot_roc_curve.png
  ├── very_hot_pr_curve.png
  ├── very_hot_calibration.png
  ├── very_hot_confusion_matrix.png
  ├── very_hot_feature_importance.png
  └── ... (same for each condition)
```

---

## Need Help?

- Check `README.md` for detailed documentation
- See `EXAMPLES.md` for usage examples
- Review `ARCHITECTURE.md` for system design
- Read `PROJECT_SUMMARY.md` for complete overview

---

**Ready to predict extreme weather! 🌍⛈️🌤️**

