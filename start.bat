@echo off
setlocal

title NEWS.PORTAL Launcher
color 0B

set "ROOT=%~dp0"

echo ================================================================
echo                 NEWS.PORTAL - MEDIA SYSTEM
echo ================================================================
echo.

where node >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Node.js was not found in PATH.
    echo Install Node.js v18 or later and run this file again.
    pause
    exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
    echo [ERROR] npm was not found in PATH.
    echo Install Node.js with npm and run this file again.
    pause
    exit /b 1
)

if not exist "%ROOT%server\node_modules" (
    echo [SETUP] Installing backend dependencies...
    pushd "%ROOT%server"
    call npm install
    if errorlevel 1 (
        popd
        echo [ERROR] Backend dependency installation failed.
        pause
        exit /b 1
    )
    popd
)

if not exist "%ROOT%client\node_modules" (
    echo [SETUP] Installing frontend dependencies...
    pushd "%ROOT%client"
    call npm install
    if errorlevel 1 (
        popd
        echo [ERROR] Frontend dependency installation failed.
        pause
        exit /b 1
    )
    popd
)

echo.
echo [1/2] Starting backend on http://localhost:5000...
start "NEWS.PORTAL Backend" /D "%ROOT%server" cmd /k npm start

echo [2/2] Starting frontend on http://localhost:5173...
start "NEWS.PORTAL Frontend" /D "%ROOT%client" cmd /k npm run dev

echo.
echo ================================================================
echo [SUCCESS] Backend and frontend launch commands were started.
echo Frontend: http://localhost:5173
echo Backend : http://localhost:5000
echo ================================================================
echo.
pause
endlocal
