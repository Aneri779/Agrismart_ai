# AgriSmart AI Setup Script for PowerShell
Write-Host "===================================================================" -ForegroundColor Green
Write-Host "              AgriSmart AI - Automated Environment Setup" -ForegroundColor Green
Write-Host "===================================================================" -ForegroundColor Green
Write-Host ""

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

# 1. Check Python
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

# 3. Create .env from template if missing
$envPath = Join-Path $scriptDir ".env"
$envExamplePath = Join-Path $scriptDir ".env.example"
if (-not (Test-Path $envPath) -and (Test-Path $envExamplePath)) {
    Copy-Item $envExamplePath $envPath
    Write-Host "[OK] Created .env from .env.example" -ForegroundColor Green
}

# 4. Install Backend Requirements
Write-Host ""
Write-Host "[1/3] Installing Python backend packages..." -ForegroundColor Cyan
pip install -r (Join-Path $scriptDir "backend\requirements.txt")

# 5. Install ML Model Requirements
Write-Host ""
Write-Host "[2/3] Installing ML model & PyTorch packages..." -ForegroundColor Cyan
pip install -r (Join-Path $scriptDir "ml-model\requirements.txt")

# 6. Install Frontend Dependencies
Write-Host ""
Write-Host "[3/3] Installing Frontend dependencies (npm install)..." -ForegroundColor Cyan
Set-Location (Join-Path $scriptDir "frontend")
npm.cmd install
Set-Location $scriptDir

Write-Host ""
Write-Host "===================================================================" -ForegroundColor Green
Write-Host "  Setup Complete!" -ForegroundColor Green
Write-Host "  1. Add your GEMINI_API_KEY to .env for AI advisory" -ForegroundColor Cyan
Write-Host "  2. Run '.\run.ps1' or 'run.bat' to launch AgriSmart AI!" -ForegroundColor Green
Write-Host "===================================================================" -ForegroundColor Green
