@echo off
title AI-Playground Backend
cd /d "%~dp0backend"

echo Starting AI-Playground backend...

if exist "venv\Scripts\activate.bat" (
    call "venv\Scripts\activate.bat"
) else (
    echo.
    echo Backend virtual environment was not found.
    echo Create it with: python -m venv venv
    echo Then install packages with: pip install -r requirements.txt
    echo.
)

netstat -ano | findstr ":8000 " >nul
if errorlevel 1 (
    echo Backend will run at http://127.0.0.1:8000
    python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload --app-dir "%~dp0backend"
    goto end
)

echo Port 8000 is already in use. Trying backup port 8010...
echo Backend will run at http://127.0.0.1:8010
python -m uvicorn main:app --host 127.0.0.1 --port 8010 --reload --app-dir "%~dp0backend"

:end

echo.
echo Backend stopped. Press any key to close this window.
pause >nul
