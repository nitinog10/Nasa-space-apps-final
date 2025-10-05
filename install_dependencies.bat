@echo off
echo ======================================================================
echo    Installing Dependencies for Extreme Weather Prediction System
echo ======================================================================
echo.
echo This may take a few minutes...
echo.

pip install --upgrade pip

echo Installing core packages...
pip install numpy==1.24.3 pandas==2.0.3 scikit-learn==1.3.0

echo Installing gradient boosting libraries...
pip install xgboost==2.0.0 lightgbm==4.1.0

echo Installing utilities...
pip install joblib==1.3.2 pyyaml==6.0.1 tqdm==4.66.1 requests==2.31.0

echo Installing visualization libraries...
pip install matplotlib==3.7.2 seaborn==0.12.2 plotly==5.16.1

echo Installing API framework...
pip install fastapi==0.103.1 uvicorn==0.23.2 pydantic==2.3.0 python-multipart==0.0.6

echo Installing additional utilities...
pip install python-dotenv==1.0.0 statsmodels==0.14.0 geopy==2.4.0

echo.
echo ======================================================================
echo    ✅ Installation Complete!
echo ======================================================================
echo.
echo Now you can run: run_complete_pipeline.bat
echo.
pause

