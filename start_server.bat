@echo off
echo ========================================
echo Starting Truck Driver Expense Tracker
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo Node.js found. Checking dependencies...
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
) else (
    echo Dependencies already installed.
)

echo.
echo Starting server...
echo The application will be available at: http://localhost:3000
echo Press Ctrl+C to stop the server
echo.

REM Start the server
node server.js

echo.
echo Server stopped.
pause
