@echo off
REM FasalSathi - Complete Setup and Launch Script
REM This script handles all dependencies and starts the application

setlocal enabledelayedexpansion
cd /d "%~dp0"

REM Color output
for /f %%A in ('copy /Z "%~f0" nul') do set "BS=%%A"

echo.
echo =====================================================
echo FasalSathi - Agricultural AI Advisor Setup
echo =====================================================
echo.

REM ===== JAVA CHECK =====
echo [1/4] Checking Java installation...
java -version >nul 2>&1
if errorlevel 1 (
  echo ERROR: Java JDK 21+ is required but not found.
  echo Please install Java from: https://www.oracle.com/java/technologies/downloads/
  echo Then add it to your system PATH and try again.
  pause
  exit /b 1
)
for /f "tokens=2" %%i in ('java -version 2^>^&1 ^| find "version"') do (
  set JAVA_VERSION=%%i
  echo ✓ Java found: !JAVA_VERSION!
)

REM ===== MAVEN CHECK & INSTALL =====
echo.
echo [2/4] Checking Maven installation...
where mvn >nul 2>&1
if errorlevel 1 (
  echo ! Maven not found in PATH. Attempting to locate or set up...
  
  REM Check common locations
  set MAVEN_FOUND=0
  for %%D in (
    "C:\Program Files\Apache\Maven"
    "C:\Program Files\Maven"
    "C:\apache-maven-3.9.9"
  ) do (
    if exist "%%~D\bin\mvn.cmd" (
      set "MAVEN_HOME=%%~D"
      set "PATH=%%~D\bin;!PATH!"
      set MAVEN_FOUND=1
      echo ✓ Maven found at: %%~D
      goto maven_ready
    )
  )
  
  if !MAVEN_FOUND! equ 0 (
    echo.
    echo ! Maven is not installed. 
    echo Installing Maven...
    call :install_maven
    if errorlevel 1 (
      echo ERROR: Failed to install Maven automatically.
      echo Please install Apache Maven 3.9+ from: https://maven.apache.org/download.cgi
      echo Then add it to your system PATH and try again.
      pause
      exit /b 1
    )
  )
)
:maven_ready
mvn --version | findstr "Apache Maven" >nul 2>&1
if errorlevel 1 (
  echo ERROR: Maven verification failed.
  pause
  exit /b 1
)
echo ✓ Maven is ready

REM ===== NODE.JS CHECK =====
echo.
echo [3/4] Checking Node.js installation...
where node >nul 2>&1
if errorlevel 1 (
  echo ERROR: Node.js 20+ is required but not found.
  echo Please install Node.js from: https://nodejs.org/
  echo Then add it to your system PATH and try again.
  pause
  exit /b 1
)
for /f "tokens=1" %%i in ('node --version') do (
  set NODE_VERSION=%%i
  echo ✓ Node.js found: !NODE_VERSION!
)

REM ===== NPM CHECK =====
echo.
echo [4/4] Checking npm...
where npm >nul 2>&1
if errorlevel 1 (
  echo ERROR: npm not found in PATH.
  pause
  exit /b 1
)
echo ✓ npm is ready

REM ===== PROJECT SETUP =====
echo.
echo =====================================================
echo Starting FasalSathi Application
echo =====================================================
echo.
echo URL: http://localhost:8080
echo.
echo.

REM Navigate to frontend and build
set "BACKEND_DIR=%~dp0Agriculture-FoodTech"
set "FRONTEND_DIR=%~dp0frontend\desktop-tutorial\frontend"
if not exist "%FRONTEND_DIR%\package.json" (
  echo ERROR: Frontend project not found at %FRONTEND_DIR%
  pause
  exit /b 1
)

echo Building React frontend...
pushd "%FRONTEND_DIR%"
if not exist node_modules (
  echo Installing frontend dependencies...
  call npm ci --legacy-peer-deps
  if errorlevel 1 (
    echo ERROR: npm ci failed
    popd
    pause
    exit /b 1
  )
)
call npm run build
if errorlevel 1 (
  echo ERROR: Frontend build failed
  popd
  pause
  exit /b 1
)
popd
xcopy /E /I /Y "%FRONTEND_DIR%\dist\*" "%BACKEND_DIR%\src\main\resources\static\" >nul
if errorlevel 1 (
  echo ERROR: Could not copy the frontend build into the backend static directory
  pause
  exit /b 1
)
echo ✓ Frontend built successfully

REM Start backend
echo.
echo Starting Spring Boot backend...
set "HEALTH_URL=http://localhost:8080/api/v1/health"
set "SERVER_READY=0"
powershell -NoProfile -ExecutionPolicy Bypass -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:8080/' -UseBasicParsing -TimeoutSec 2; if ($response.StatusCode -eq 200 -and $response.Content -match 'id=\"root\"') { exit 0 } } catch {} ; exit 1" >nul 2>&1
if not errorlevel 1 (
  set "SERVER_READY=1"
  echo Existing React FasalSathi server is already ready.
  goto server_ready
)
REM Stop an older static FasalSathi instance using the same port.
powershell -NoProfile -ExecutionPolicy Bypass -Command "$connection = Get-NetTCPConnection -LocalPort 8080 -State Listen -ErrorAction SilentlyContinue; if ($connection) { Stop-Process -Id $connection.OwningProcess -Force -ErrorAction SilentlyContinue }" >nul 2>&1
pushd "%BACKEND_DIR%"
start "FasalSathi Backend" cmd /k "title FasalSathi Backend Server && mvn spring-boot:run"
popd

REM Wait for backend to start
echo Waiting for server to start...
for /l %%N in (1,1,60) do (
  powershell -NoProfile -ExecutionPolicy Bypass -Command "try { $response = Invoke-WebRequest -Uri '%HEALTH_URL%' -UseBasicParsing -TimeoutSec 2; if ($response.StatusCode -eq 200) { exit 0 } } catch {} ; exit 1" >nul 2>&1
  if not errorlevel 1 (
    set "SERVER_READY=1"
    goto server_ready
  )
  timeout /t 2 /nobreak >nul
)

:server_ready
if "%SERVER_READY%"=="0" (
  echo.
  echo ERROR: FasalSathi did not become ready within 120 seconds.
  echo Check the FasalSathi Backend window for the startup error.
  pause
  exit /b 1
)

REM Open browser
echo.
echo =====================================================
echo Opening http://localhost:8080 in your browser...
echo =====================================================
start "" "http://localhost:8080"

echo.
echo ✓ FasalSathi is running!
echo.
echo Close the FasalSathi backend window to stop the server.
echo.
pause
exit /b 0

REM ===== MAVEN INSTALL FUNCTION =====
:install_maven
echo.
echo Attempting automatic Maven installation...
set "MAVEN_DOWNLOAD_URL=https://archive.apache.org/dist/maven/maven-3/3.9.9/binaries/apache-maven-3.9.9-bin.zip"
set "MAVEN_INSTALL_PATH=C:\apache-maven-3.9.9"

if exist "%TEMP%\maven-download.zip" del "%TEMP%\maven-download.zip"

echo Downloading Maven...
powershell -Command "(New-Object System.Net.ServicePointManager).SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; Invoke-WebRequest -Uri '%MAVEN_DOWNLOAD_URL%' -OutFile '%TEMP%\maven-download.zip'" >nul 2>&1
if errorlevel 1 (
  echo Failed to download Maven
  exit /b 1
)

echo Extracting Maven...
powershell -Command "Expand-Archive -Path '%TEMP%\maven-download.zip' -DestinationPath 'C:\' -Force" >nul 2>&1
if errorlevel 1 (
  echo Failed to extract Maven
  exit /b 1
)

set "PATH=%MAVEN_INSTALL_PATH%\bin;!PATH!"
set "MAVEN_HOME=%MAVEN_INSTALL_PATH%"

echo ✓ Maven installed at: %MAVEN_INSTALL_PATH%
exit /b 0
