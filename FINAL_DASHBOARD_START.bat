@echo off
echo ======================================================================
echo    🌍 NASA Weather Intelligence - FINAL ENHANCED DASHBOARD
echo ======================================================================

REM Check if models exist
if not exist "models\trained\metadata.json" (
    echo ❌ Models not found! Training models first...
    echo This will take about 10-15 minutes...
    python src\train_models.py
    if errorlevel 1 (
        echo ❌ Model training failed!
        pause
        exit /b 1
    )
    echo ✅ Models trained successfully!
)

REM Start enhanced backend API
echo 🚀 Starting enhanced backend API...
start "NASA Enhanced API" cmd /k "python src\api_enhanced_final.py"

REM Wait for backend to start
echo ⏳ Waiting for backend to initialize...
timeout /t 8

REM Navigate to frontend
cd NASAfront-main

REM Install dependencies if needed
if not exist "node_modules" (
    echo 📦 Installing frontend dependencies...
    npm install --legacy-peer-deps --silent
    if errorlevel 1 (
        echo ❌ Frontend installation failed!
        pause
        exit /b 1
    )
)

REM Create .env file with API key
echo 🔧 Setting up environment...
echo VITE_OWM_KEY=84254d5ce02335eb1d0ed7c9393e2ebb > .env
echo VITE_API_BASE_URL=http://127.0.0.1:8081 >> .env

REM Start frontend
echo 🌐 Starting enhanced dashboard...
start "NASA Dashboard" cmd /k "npm run dev"

REM Go back to root
cd ..

echo.
echo ======================================================================
echo    ✅ ENHANCED DASHBOARD LAUNCHED!
echo ======================================================================
echo.
echo 🖥️  Backend API: http://127.0.0.1:8081
echo 🌐 Enhanced Dashboard: http://localhost:5173
echo 📚 API Documentation: http://127.0.0.1:8081/docs
echo.
echo ✨ FEATURES AVAILABLE:
echo   🗺️  Live weather heat maps (5 categories)
echo   📍 Custom coordinate input
echo   🎯 AI weather risk predictions
echo   📈 Enhanced 6-month forecasting
echo   🌍 Geographic climate modeling
echo   🎨 Modern single-page UI
echo.
echo ⏳ Waiting 10 seconds for services to start...
timeout /t 10

echo 🚀 Opening dashboard...
start http://localhost:5173

echo.
echo Dashboard should open automatically!
echo If not, manually open: http://localhost:5173
echo.
pause
