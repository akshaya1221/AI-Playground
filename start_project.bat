@echo off
title AI-Playground Project
cd /d "%~dp0"

echo Opening backend and frontend in separate windows...

set "BACKEND_PORT=8000"
netstat -ano | findstr ":8000 " >nul
if not errorlevel 1 (
    set "BACKEND_PORT=8010"
)

start "AI-Playground Backend" cmd /k ""%~dp0start_backend.bat""
start "AI-Playground Frontend" cmd /k "set VITE_API_BASE_URL=http://localhost:%BACKEND_PORT%&& call ""%~dp0start_frontend.bat"""

echo.
echo Backend window: http://localhost:%BACKEND_PORT%
echo Frontend window: http://localhost:5173
echo If port 5173 is busy, frontend will try http://localhost:5199 or http://localhost:5200
echo Frontend API URL: http://localhost:%BACKEND_PORT%
echo.
echo Keep both windows open while testing CSV upload.
pause
