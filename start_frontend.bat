@echo off
title AI-Playground Frontend
cd /d "%~dp0frontend"

echo Starting AI-Playground frontend...
echo.

if "%VITE_API_BASE_URL%"=="" (
    set "VITE_API_BASE_URL=http://localhost:8000"
)

echo Frontend API URL: %VITE_API_BASE_URL%
echo.

netstat -ano | findstr ":5173 " >nul
if errorlevel 1 (
    echo Frontend will run at http://localhost:5173
    npm run dev -- --host localhost --port 5173 --strictPort
    goto end
)

echo Port 5173 is already in use. Trying backup port 5199...
netstat -ano | findstr ":5199 " >nul
if errorlevel 1 (
    echo Frontend will run at http://localhost:5199
    npm run dev -- --host localhost --port 5199 --strictPort
    goto end
)

echo Port 5199 is also in use. Trying backup port 5200...
netstat -ano | findstr ":5200 " >nul
if errorlevel 1 (
    echo Frontend will run at http://localhost:5200
    npm run dev -- --host localhost --port 5200 --strictPort
    goto end
)

echo.
echo Could not start frontend because ports 5173, 5199, and 5200 are already in use.
echo Close other frontend command windows, then try again.

:end

echo.
echo Frontend stopped. Press any key to close this window.
pause >nul
