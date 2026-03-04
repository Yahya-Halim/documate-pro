@echo off
echo ========================================
echo Truck Driver Expense Management System
echo Local MySQL Database Setup Script
echo ========================================
echo.

echo Database Configuration:
echo Host: localhost (port 8801)
echo Database: Will create 'truck_expense_db'
echo User: root
echo Password: ASWQqwsa123!@#
echo.

REM Check if MySQL client is available
"C:\Program Files\MySQL\MySQL Server 9.6\bin\mysql.exe" --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: MySQL client is not found at expected location
    echo Expected: "C:\Program Files\MySQL\MySQL Server 9.6\bin\mysql.exe"
    echo Please verify MySQL installation path
    echo.
    pause
    exit /b 1
)

echo MySQL client found. Proceeding with database setup...
echo.

REM Create the database first
echo Creating database 'truck_expense_db'...
"C:\Program Files\MySQL\MySQL Server 9.6\bin\mysql.exe" -h localhost -P 8801 -u root -pASWQqwsa123!@# -e "CREATE DATABASE IF NOT EXISTS truck_expense_db;"

if %errorlevel% neq 0 (
    echo ERROR: Failed to create database
    echo Please check MySQL service is running on port 8801
    echo Also verify the password is correct
    echo.
    pause
    exit /b 1
)

echo Database created successfully. Now setting up tables...
echo.

REM Run the SQL setup script
echo Executing database setup...
"C:\Program Files\MySQL\MySQL Server 9.6\bin\mysql.exe" -h localhost -P 8801 -u root -pASWQqwsa123!@# truck_expense_db < database_setup.sql

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo SUCCESS: Local database setup completed!
    echo ========================================
    echo.
    echo Database: truck_expense_db
    echo Host: localhost:8801
    echo User: root
    echo.
    echo Default admin account created:
    echo Username: admin
    echo Password: admin123
    echo.
    echo Default expense categories inserted:
    echo - Fuel, Maintenance, Food & Meals, Lodging
    echo - Tolls & Fees, Insurance, Supplies, Other
    echo.
    echo Database is ready! You can now run index.html
) else (
    echo.
    echo ========================================
    echo ERROR: Database setup failed!
    echo ========================================
    echo.
    echo Please check:
    echo 1. MySQL service is running on port 8801
    echo 2. Database 'truck_expense_db' was created
    echo 3. Password 'ASWQqwsa123!@#' is correct
    echo 4. SQL file is in the same directory
    echo.
    echo You can try running the SQL manually:
    echo "C:\Program Files\MySQL\MySQL Server 9.6\bin\mysql.exe" -h localhost -P 8801 -u root -pASWQqwsa123!@# truck_expense_db < database_setup.sql
)

echo.
pause
