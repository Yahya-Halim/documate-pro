@echo off
echo ========================================
echo Manual Database Connection Test
echo ========================================
echo.

echo Testing connection to MySQL database...
echo.

REM Test basic connection
echo Testing basic connection...
mysql -h sql5.freesqldatabase.com -u sql5818473 -prh5QWTcKd6 sql5818473 -e "SELECT 'Connection successful!' as status;"

if %errorlevel% equ 0 (
    echo.
    echo Connection successful! Now running setup...
    echo.
    
    REM Run the setup
    mysql -h sql5.freesqldatabase.com -u sql5818473 -prh5QWTcKd6 sql5818473 < database_setup.sql
    
    if %errorlevel% equ 0 (
        echo.
        echo ========================================
        echo SETUP COMPLETED SUCCESSFULLY!
        echo ========================================
        echo.
        echo Database tables created and default data inserted.
        echo You can now use the application.
    ) else (
        echo.
        echo Setup failed. Please check the SQL file.
    )
) else (
    echo.
    echo ========================================
    echo CONNECTION FAILED!
    echo ========================================
    echo.
    echo Please verify:
    echo 1. Database server is online
    echo 2. Credentials are correct
    echo 3. MySQL client is installed
    echo 4. Internet connection is working
    echo.
    echo Try running this command manually:
    echo mysql -h sql5.freesqldatabase.com -u sql5818473 -prh5QWTcKd6 sql5818473 -e "SELECT 1;"
)

echo.
pause
