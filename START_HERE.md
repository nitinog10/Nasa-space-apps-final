# 🎯 START HERE - Complete Setup Guide

## 📋 Follow These Steps IN ORDER:

---

## ✅ **STEP 0: Install Dependencies (DO THIS FIRST!)**

### In your terminal, run:
```cmd
pip install -r requirements.txt
```

### OR simply double-click:
```
INSTALL_FIRST.bat
```

**⏱️ Time:** 5-10 minutes  
**Why:** Installs all required Python packages (numpy, pandas, scikit-learn, xgboost, etc.)

**Expected output:**
```
Successfully installed numpy-1.24.3
Successfully installed pandas-2.0.3
Successfully installed scikit-learn-1.3.0
Successfully installed xgboost-2.0.0
Successfully installed lightgbm-4.1.0
...
✅ Dependencies Installed Successfully!
```

---

## ✅ **STEP 1: Run the Complete Pipeline**

### After dependencies are installed, run:

Double-click: **`run_complete_pipeline.bat`**

Or from terminal:
```cmd
run_complete_pipeline.bat
```

**⏱️ Time:** 30-60 minutes

This will:
1. 📡 Collect NASA data for 8 cities
2. 🔧 Engineer 187+ features
3. 🤖 Train 20 ML models
4. 📊 Generate evaluation plots

**Expected output:**
```
Step 1: Collecting NASA Data for Multiple Cities...
✓ Data collection completed!

Step 2: Feature Engineering...
✓ Feature engineering completed!

Step 3: Training Models...
✓ Model training completed!

Step 4: Evaluating Models...
✓ Model evaluation completed!

✅ PIPELINE COMPLETED SUCCESSFULLY!
```

---

## ✅ **STEP 2: Start the API Server**

### After training is complete, run:

Double-click: **`start_api.bat`**

Or from terminal:
```cmd
python src\api.py
```

**Server URL:** http://localhost:8000  
**API Docs:** http://localhost:8000/docs

**Expected output:**
```
✓ Loaded models for 5 targets
Starting Extreme Weather Prediction API
Server: http://0.0.0.0:8000
Docs: http://0.0.0.0:8000/docs
```

**⚠️ Keep this terminal window open!** The API server runs here.

---

## ✅ **STEP 3: Open the Web Interface**

### Option A: Direct (Simple)
Just double-click:
```
frontend\index.html
```

### Option B: With Local Server (Better)
In a NEW terminal:
```cmd
cd frontend
python -m http.server 8080
```
Then open browser: http://localhost:8080

---

## 🎉 **You're Done!**

Now you can:
- 🌍 Enter any latitude/longitude
- 📅 Select a date
- 🔮 Get extreme weather predictions
- 📊 View probability visualizations

---

## 🔧 **Troubleshooting**

### Error: "ModuleNotFoundError"
**Solution:** Run `INSTALL_FIRST.bat` or `pip install -r requirements.txt`

### Error: "NASA API error"
**Solutions:**
- Check internet connection
- Verify API key in `config.yaml`
- NASA servers might be busy - wait and retry

### Error: "Models not found"
**Solution:** You need to train models first. Run `run_complete_pipeline.bat`

### API not accessible
**Solution:** Make sure `start_api.bat` is running in a terminal window

---

## 📁 **What Gets Created**

After running the pipeline:

```
D:\Ml model Nasa\
├── data\
│   ├── raw\
│   │   ├── New_York_raw.csv        ✅ Created
│   │   ├── Los_Angeles_raw.csv     ✅ Created
│   │   └── ... (8 cities)          ✅ Created
│   └── processed\
│       ├── labeled_data.csv        ✅ Created
│       └── features_engineered.csv ✅ Created
│
├── models\
│   └── trained\
│       ├── very_hot_lightgbm.pkl        ✅ Created
│       ├── very_cold_xgboost.pkl        ✅ Created
│       ├── very_windy_lightgbm.pkl      ✅ Created
│       ├── very_wet_xgboost.pkl         ✅ Created
│       ├── very_uncomfortable_lightgbm.pkl ✅ Created
│       ├── feature_names.pkl            ✅ Created
│       └── metadata.json                ✅ Created
│
└── evaluation_results\
    ├── very_hot_roc_curve.png           ✅ Created
    ├── very_hot_calibration.png         ✅ Created
    ├── very_hot_confusion_matrix.png    ✅ Created
    ├── very_hot_feature_importance.png  ✅ Created
    └── ... (25+ visualization files)    ✅ Created
```

---

## 🚀 **Quick Command Summary**

```cmd
# 1. Install (once)
pip install -r requirements.txt

# 2. Train (once, or when you want to retrain)
run_complete_pipeline.bat

# 3. Start API (every time you want to use the system)
python src\api.py

# 4. Open frontend (in browser)
frontend\index.html
```

---

## 📚 **More Information**

- **QUICK_RUN.md** - Detailed run instructions
- **README.md** - Project overview
- **EXAMPLES.md** - Usage examples
- **ARCHITECTURE.md** - System design
- **PROJECT_SUMMARY.md** - Complete summary

---

## ✅ **Checklist**

- [ ] Python 3.8+ installed
- [ ] Dependencies installed (`pip install -r requirements.txt`)
- [ ] NASA API key in `config.yaml` (✅ already done!)
- [ ] Pipeline executed (`run_complete_pipeline.bat`)
- [ ] Models trained (check `models\trained\` folder)
- [ ] API server running (`start_api.bat`)
- [ ] Frontend opened (`frontend\index.html`)

---

**Need help?** Check the documentation files or review error messages carefully!

**Happy predicting! 🌍⛈️🌤️**

