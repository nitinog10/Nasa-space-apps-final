@echo off
echo ======================================================================
echo    Running with Python 3.13 Compatibility Fixes
echo ======================================================================
echo.

REM Set environment variables to prevent numpy crashes with Python 3.13
set OPENBLAS_NUM_THREADS=1
set MKL_NUM_THREADS=1
set NUMEXPR_NUM_THREADS=1
set OMP_NUM_THREADS=1
set VECLIB_MAXIMUM_THREADS=1

echo Environment variables set to prevent numpy crashes...
echo.

REM Run the specified command
echo Running: %*
echo ======================================================================
%*

echo.
echo ======================================================================
echo    Command completed with compatibility fixes
echo ======================================================================
pause
