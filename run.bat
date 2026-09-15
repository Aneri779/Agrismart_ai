@echo off
title AgriSmart AI Launcher
color 0A

echo ===================================================================
echo               AgriSmart AI - Crop Health & Advisory
echo ===================================================================
echo.

:: 1. Navigate to script directory
cd /d "%~dp0"

:: 2. Check Python
where python >nul 2>nul
if %ERRORLEVEL% neq 0 (
    color 0C
    echo [ERROR] Python was not found in PATH!
    echo Please install Python 3.10+ from python.org and add it to your PATH.
    echo.
    pause
    exit /b 1
)

:: 3. Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    color 0C
    echo [ERROR] Node.js was not found in PATH!
    echo Please install Node.js 18+ from nodejs.org and add it to your PATH.
    echo.
    pause
    exit /b 1
)

:: 4. Environment Variables & .env Setup
if not exist "%~dp0.env" (
    if exist "%~dp0.env.example" (
        echo [INFO] No root .env found. Creating one from .env.example...
        copy "%~dp0.env.example" "%~dp0.env" >nul
        echo [!] Created .env file. Please add your GEMINI_API_KEY to .env for AI advisory.
    )
)

if "%AGRISMART_OUTPUT_DIR%"=="" (
    set "AGRISMART_OUTPUT_DIR=%~dp0ml-model"
)

:: 5. Auto-Install Backend Python Dependencies
echo [*] Checking Python dependencies...
python -c "import fastapi, uvicorn, dotenv, bcrypt" >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [INFO] Installing FastAPI backend dependencies (pip install -r backend\requirements.txt)...
    pip install -r "%~dp0backend\requirements.txt"
    echo.
)

:: 6. Auto-Install Frontend Node Dependencies
if not exist "%~dp0frontend\node_modules\" (
    echo [INFO] Frontend node_modules not found.
    echo [INFO] Running 'npm install' in frontend directory...
    cd /d "%~dp0frontend"
    call npm install
    cd /d "%~dp0"
    echo.
)

echo [OK] Dependencies verified.
echo      AGRISMART_OUTPUT_DIR = %AGRISMART_OUTPUT_DIR%
echo.

:: 7. Launch FastAPI Backend in a separate window
echo [*] Launching FastAPI Backend on http://localhost:8000 ...
start "AgriSmart AI - FastAPI Backend" cmd /k "title AgriSmart Backend && cd /d "%~dp0backend" && python -m uvicorn main:app --reload --port 8000"

:: Wait 3 seconds for backend to start
timeout /t 3 /nobreak >nul

:: 8. Launch Vite Frontend in a separate window
echo [*] Launching Vite Frontend on http://localhost:5173 ...
start "AgriSmart AI - Frontend" cmd /k "title AgriSmart Frontend && cd /d "%~dp0frontend" && npm run dev"

echo.
echo ===================================================================
echo   System running!
echo   Frontend : http://localhost:5173
echo   Backend  : http://localhost:8000 (API Docs: http://localhost:8000/docs)
echo   Health   : http://localhost:8000/api/health
echo ===================================================================
echo Close the respective terminal windows to stop the servers.
echo.
pause
