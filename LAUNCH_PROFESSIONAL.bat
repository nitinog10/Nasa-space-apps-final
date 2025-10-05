@echo off
cls
echo ======================================================================
echo    LAUNCH: Professional Weather Dashboard
echo ======================================================================

REM 1. Start Backend API
echo [1/2] Starting ML Backend API...
start "Backend API" cmd /k "python src\professional_api.py"
timeout /t 5 > nul

REM 2. Open Frontend
echo [2/2] Launching Weather Dashboard...
start http://localhost:8000/frontend/dashboard.html

REM 3. Start Simple HTTP Server for Frontend
echo.
echo Starting HTTP server for frontend...
cd frontend
python -m http.server 8000
cd ..
