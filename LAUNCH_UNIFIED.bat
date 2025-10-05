@echo off
cls
echo ======================================================================
echo    LAUNCH: Unified Weather Intelligence Dashboard
echo ======================================================================

REM Kill existing processes
taskkill /F /IM python.exe 2>nul
timeout /t 2 > nul

REM Start backend
echo [1/2] Starting Backend API...
start "Backend API" cmd /k "python src\professional_api.py"
timeout /t 5 > nul

REM Start frontend
echo [2/2] Starting Frontend...
cd frontend
start "Frontend Server" cmd /k "python -m http.server 8000"
cd ..
timeout /t 3 > nul

echo.
echo ======================================================================
echo    SUCCESS! Opening Unified Dashboard
echo ======================================================================
echo.
echo   Backend API: http://127.0.0.1:8081
echo   Dashboard:   http://localhost:8000/unified_dashboard.html
echo.
echo Opening dashboard...
timeout /t 3 > nul
start http://localhost:8000/unified_dashboard.html
