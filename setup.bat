@echo off
title AgriSmart AI Setup
color 0B

echo ===================================================================
echo               AgriSmart AI - Automated Environment Setup
echo ===================================================================
echo.

cd /d "%~dp0"

:: 1. Check Python
where python >nul 2>nul
if %ERRORLEVEL% neq 0 (
    color 0C
    echo [ERROR] Python not found in PATH. Please install Python 3.10+ from python.org.
    pause
    exit /b 1
)

:: 2. Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    color 0C
    echo [ERROR] Node.js not found in PATH. Please install Node.js 18+ from nodejs.org.
    pause
    exit /b 1
)

:: 3. Setup .env file
if not exist "%~dp0.env" (
    if exist "%~dp0.env.example" (
        copy "%~dp0.env.example" "%~dp0.env" >nul
        echo [OK] Created root .env from .env.example
    )
)

:: 4. Install Python backend requirements
echo.
echo [1/3] Installing Python backend packages...
pip install -r "%~dp0backend\requirements.txt"
if %ERRORLEVEL% neq 0 (
    echo [WARNING] Backend package installation reported warnings/errors.
)

:: 5. Install PyTorch & ML model requirements
echo.
echo [2/3] Installing ML model & PyTorch packages...
pip install -r "%~dp0ml-model\requirements.txt"
if %ERRORLEVEL% neq 0 (
    echo [WARNING] ML package installation reported warnings/errors.
)

:: 6. Install Frontend dependencies (npm install)
echo.
echo [3/3] Installing Frontend dependencies (npm install)...
cd /d "%~dp0frontend"
call npm install
cd /d "%~dp0"

echo.
echo ===================================================================
echo   Setup Complete!
echo   1. Edit .env to add your GEMINI_API_KEY (optional for basic scan,
echo      required for AI chat advisory).
echo   2. Run 'run.bat' or 'run.ps1' to launch AgriSmart AI!
echo ===================================================================
echo.
pause
