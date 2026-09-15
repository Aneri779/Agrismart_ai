# AgriSmart AI Launcher for PowerShell
Write-Host "===================================================================" -ForegroundColor Green
Write-Host "              AgriSmart AI - Crop Health & Advisory" -ForegroundColor Green
Write-Host "===================================================================" -ForegroundColor Green
Write-Host ""

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

# 1. Check Python & configure PATH
$py311 = "$env:LOCALAPPDATA\Programs\Python\Python311"
if (Test-Path $py311) {
    $env:PATH = "$py311;$py311\Scripts;$env:PATH"
}

if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Python was not found in PATH! Please install Python 3.10+." -ForegroundColor Red
    pause
    exit 1
}

# 2. Check Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Node.js was not found in PATH! Please install Node.js 18+." -ForegroundColor Red
    pause
    exit 1
}

# 3. Check / Create .env from template
$envPath = Join-Path $scriptDir ".env"
$envExamplePath = Join-Path $scriptDir ".env.example"
if (-not (Test-Path $envPath) -and (Test-Path $envExamplePath)) {
    Copy-Item $envExamplePath $envPath
    Write-Host "[INFO] Created .env from .env.example. Please configure your GEMINI_API_KEY." -ForegroundColor Yellow
}

# 4. Auto-Install Backend Python Dependencies if missing
Write-Host "[*] Checking Python dependencies..." -ForegroundColor Gray
python -c "import fastapi, uvicorn, dotenv, bcrypt" 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "[INFO] Installing backend Python packages (pip install -r backend/requirements.txt)..." -ForegroundColor Yellow
    pip install -r (Join-Path $scriptDir "backend\requirements.txt")
}

# 5. Auto-Install Frontend Node Dependencies if missing
$nodeModulesPath = Join-Path $scriptDir "frontend\node_modules"
if (-not (Test-Path $nodeModulesPath)) {
    Write-Host "[INFO] Frontend node_modules not found." -ForegroundColor Yellow
    Write-Host "[INFO] Running 'npm install' in frontend directory..." -ForegroundColor Yellow
    Set-Location (Join-Path $scriptDir "frontend")
    npm.cmd install
    Set-Location $scriptDir
    Write-Host ""
}

# 6. Environment Variables
if (-not $env:AGRISMART_OUTPUT_DIR) {
    $env:AGRISMART_OUTPUT_DIR = Join-Path $scriptDir "ml-model"
}

Write-Host "[OK] Dependencies & environment verified." -ForegroundColor Cyan
Write-Host "     AGRISMART_OUTPUT_DIR = $env:AGRISMART_OUTPUT_DIR"
Write-Host "     GEMINI_API_KEY       = Loaded from .env by FastAPI"
Write-Host ""

# 7. Start Backend in separate window
Write-Host "[*] Launching FastAPI Backend on port 8000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptDir\backend'; `$host.UI.RawUI.WindowTitle = 'AgriSmart Backend'; python -m uvicorn main:app --reload --port 8000"

Start-Sleep -Seconds 3

# 8. Start Frontend in separate window
Write-Host "[*] Launching Vite Frontend on port 5173..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptDir\frontend'; `$host.UI.RawUI.WindowTitle = 'AgriSmart Frontend'; npm.cmd run dev"

Write-Host ""
Write-Host "===================================================================" -ForegroundColor Green
Write-Host "  System running!" -ForegroundColor Green
Write-Host "  Frontend : http://localhost:5173" -ForegroundColor Cyan
Write-Host "  Backend  : http://localhost:8000 (API Docs: http://localhost:8000/docs)" -ForegroundColor Cyan
Write-Host "  Health   : http://localhost:8000/api/health" -ForegroundColor Cyan
Write-Host "===================================================================" -ForegroundColor Green
