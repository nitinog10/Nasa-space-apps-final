@echo off
echo ======================================================================
echo    STEP 0: Install Required Dependencies
echo ======================================================================
echo.
echo Installing all packages from requirements.txt...
echo This may take 5-10 minutes...
echo.

pip install -r requirements.txt

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Installation failed!
    echo.
    echo Trying alternative installation method...
    echo.
    python -m pip install --upgrade pip
    pip install -r requirements.txt
)

echo.
echo ======================================================================
echo    ✅ Dependencies Installed Successfully!
echo ======================================================================
echo.
echo Now run: run_complete_pipeline.bat
echo.
pause

