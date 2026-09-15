@echo off
title AgriSmart AI - PostgreSQL Database Viewer
cd /d "%~dp0"

set "PATH=%LOCALAPPDATA%\Programs\Python\Python311;%LOCALAPPDATA%\Programs\Python\Python311\Scripts;%PATH%"

python backend\view_db.py

echo.
pause
