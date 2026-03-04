@echo off
echo ========================================
echo Truck Driver Expense Management System
echo Remote MySQL Database Setup Script
echo ========================================
echo.

echo Database Configuration:
echo Host: sql5.freesqldatabase.com
echo Database: sql5818473
echo User: sql5818473
echo Port: 3306
echo.

REM Check if MySQL client is available
mysql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: MySQL client is not installed or not in PATH
    echo Please install MySQL or add it to your PATH
    echo You can download MySQL from: https://dev.mysql.com/downloads/mysql/
    echo.
    pause
    exit /b 1
)

echo MySQL client found. Proceeding with database setup...
echo.

REM Run SQL setup script
echo Executing database setup...
mysql -h sql5.freesqldatabase.com -u sql5818473 -prh5QWTcKd6 sql5818473 < database_setup.sql

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo SUCCESS: Remote database setup completed!
    echo ========================================
    echo.
    echo Database: sql5818473
    echo Host: sql5.freesqldatabase.com:3306
    echo.
    echo Default admin account created:
    echo Username: admin
    echo Password: admin123
    echo.
    echo Default expense categories inserted:
    echo - Fuel, Maintenance, Food & Meals, Lodging
    echo - Tolls & Fees, Insurance, Supplies, Other
    echo.
    echo You can now run index.html file to start application.
) else (
    echo.
    echo ========================================
    echo ERROR: Database setup failed!
    echo ========================================
    echo.
    echo Please check:
    echo 1. Database server is accessible
    echo 2. Credentials are correct
    echo 3. MySQL client is properly installed
    echo 4. Network connection is stable
    echo.
    echo You can try running the SQL manually:
    echo mysql -h sql5.freesqldatabase.com -u sql5818473 -prh5QWTcKd6 sql5818473 < database_setup.sql
)

echo.
pause
