@echo off
echo ========================================
echo Sync Local Data to Remote Database
echo ========================================
echo.

echo This script will sync localStorage data to your remote MySQL database
echo.

REM Check if MySQL client is available
mysql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: MySQL client is not installed or not in PATH
    echo Please install MySQL or add it to your PATH
    echo.
    pause
    exit /b 1
)

echo Extracting data from localStorage...
echo.

REM Create a temporary file to extract localStorage data
echo const fs = require('fs'); > temp_extract.js
echo const path = require('path'); >> temp_extract.js
echo. >> temp_extract.js
echo // Read localStorage data from the main application >> temp_extract.js
echo const localStoragePath = path.join(__dirname, 'localStorage_backup.json'); >> temp_extract.js
echo. >> temp_extract.js
echo try { >> temp_extract.js
echo     if (fs.existsSync(localStoragePath)) { >> temp_extract.js
echo         const data = fs.readFileSync(localStoragePath, 'utf8'); >> temp_extract.js
echo         console.log('localStorage data found:', data); >> temp_extract.js
echo     } else { >> temp_extract.js
echo         console.log('No localStorage backup found. Please run the application first.'); >> temp_extract.js
echo     } >> temp_extract.js
echo } catch (error) { >> temp_extract.js
echo     console.error('Error reading localStorage:', error); >> temp_extract.js
echo } >> temp_extract.js

echo Creating localStorage backup extractor...
echo.
echo Please follow these steps:
echo.
echo 1. Open index.html in your browser
echo 2. Open Developer Tools (F12)
echo 3. Go to Console tab
echo 4. Run this command:
echo    localStorage.getItem('tdems_users')
echo 5. Copy the output and save it to users_backup.json
echo.
echo 6. Run this command to import to database:
echo    mysql -h sql5.freesqldatabase.com -u sql5818473 -prh5QWTcKd6 sql5818473 -e "LOAD DATA LOCAL INFILE 'users_backup.json' INTO TABLE users"
echo.
pause
