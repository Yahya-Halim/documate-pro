@echo off
echo ========================================
echo Testing Local MySQL Connection
echo ========================================
echo.

echo Testing connection to local MySQL server...
echo Host: localhost:8801
echo User: root
echo Password: ASWQqwsa123!@#
echo.

REM Test basic connection
echo Testing basic connection...
"C:\Program Files\MySQL\MySQL Server 9.6\bin\mysql.exe" -h localhost -P 8801 -u root -pASWQqwsa123!@# -e "SELECT 'Connection successful!' as status, NOW() as current_time;"

if %errorlevel% equ 0 (
    echo.
    echo Connection successful! Checking databases...
    echo.
    
    REM Show databases
    echo Available databases:
    "C:\Program Files\MySQL\MySQL Server 9.6\bin\mysql.exe" -h localhost -P 8801 -u root -pASWQqwsa123!@# -e "SHOW DATABASES;"
    
    echo.
    echo Testing database creation...
    "C:\Program Files\MySQL\MySQL Server 9.6\bin\mysql.exe" -h localhost -P 8801 -u root -pASWQqwsa123!@# -e "CREATE DATABASE IF NOT EXISTS test_db; DROP DATABASE IF EXISTS test_db;"
    
    if %errorlevel% equ 0 (
        echo.
        echo ========================================
        echo LOCAL MYSQL IS WORKING PERFECTLY!
        echo ========================================
        echo.
        echo You can now run: setup_local_database.bat
        echo.
        echo This will create the truck_expense_db database
        echo and set up all required tables and data.
    ) else (
        echo.
        echo Database creation test failed.
    )
) else (
    echo.
    echo ========================================
    echo CONNECTION FAILED!
    echo ========================================
    echo.
    echo Possible issues:
    echo 1. MySQL service is not running
    echo 2. Wrong port (should be 8801)
    echo 3. Incorrect password
    echo 4. MySQL client path is incorrect
    echo.
    echo Check MySQL service:
    echo net start MySQL96
    echo.
    echo Or restart MySQL service:
    echo net stop MySQL96
    echo net start MySQL96
    echo.
    echo Try connecting manually:
    echo "C:\Program Files\MySQL\MySQL Server 9.6\bin\mysql.exe" -h localhost -P 8801 -u root -pASWQqwsa123!@#
)

echo.
pause
