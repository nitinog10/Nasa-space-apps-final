@echo off
cls
echo ======================================================================
echo    RESTART: Professional Weather Dashboard Services
echo ======================================================================
echo.

REM Kill any existing Python processes
echo [1/4] Stopping existing services...
taskkill /F /IM python.exe 2>nul
timeout /t 2 > nul

REM Clear the port
echo [2/4] Clearing ports...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8081') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000') do taskkill /F /PID %%a 2>nul
timeout /t 2 > nul

REM Start backend
echo [3/4] Starting Backend API on port 8081...
start "Backend API" cmd /k "python src\professional_api.py"
timeout /t 5 > nul

REM Start frontend
echo [4/4] Starting Frontend on port 8000...
cd frontend
start "Frontend Server" cmd /k "python -m http.server 8000"
cd ..
timeout /t 3 > nul

echo.
echo ======================================================================
echo    SUCCESS! Services are starting...
echo ======================================================================
echo.
echo   Backend API: http://127.0.0.1:8081
echo   Frontend:    http://localhost:8000/dashboard.html
echo.
echo Opening dashboard in browser...
timeout /t 3 > nul
start http://localhost:8000/dashboard.html

