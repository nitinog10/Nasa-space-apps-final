@echo off
cls
echo ======================================================================
echo    RETRAINING ML MODELS
echo    29 Indian State Capitals + 10 US Cities
echo ======================================================================
echo.
echo This will:
echo   1. Collect data from NASA POWER API (39 cities)
echo   2. Engineer features (222 features)
echo   3. Train ML models (Random Forest, XGBoost, LightGBM)
echo   4. Evaluate models and generate reports
echo.
echo This may take 30-60 minutes depending on your internet speed.
echo.
pause
echo.
echo Starting pipeline...
python run_pipeline.py
echo.
echo ======================================================================
echo    Training Complete!
echo ======================================================================
echo.
echo Check the following directories:
echo   - data/processed/        (processed datasets)
echo   - models/trained/        (trained model files)
echo   - evaluation_results/    (performance metrics and plots)
echo.
pause

