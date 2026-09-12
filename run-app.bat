@echo off
setlocal
cd /d "%~dp0"
set "APP_URL=http://localhost:8080"

echo FasalSathi main website: %APP_URL%
echo.

call "%~dp0setup-and-run.bat"
if errorlevel 1 exit /b %errorlevel%
start "" "%APP_URL%"
echo FasalSathi is running at %APP_URL%.
exit /b 0
