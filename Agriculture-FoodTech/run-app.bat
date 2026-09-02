@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

set "APP_URL=http://localhost:8080"
set "BACKEND_DIR=%~dp0"
if not exist "%BACKEND_DIR%\pom.xml" (
  if exist "%~dp0..\frontend\desktop-tutorial\pom.xml" (
    set "BACKEND_DIR=%~dp0..\frontend\desktop-tutorial"
  )
)
set "FRONTEND_DIR=%~dp0..\frontend\desktop-tutorial\frontend"

REM This is the only website that should open for the app.
REM Do not open any alternate index files or separate frontend pages.
cls
echo.
echo =====================================================
echo.
echo   FasalSathi - Agricultural AI Advisor
echo.
echo   MAIN WEBSITE: %APP_URL%
echo.
echo =====================================================
echo.
echo Starting FasalSathi at %APP_URL%
echo.

set "JAVA_HOME="
for %%D in (
  "C:\Program Files\Java\jdk-26.0.2.1"
  "C:\Program Files\Java\jdk-26.0.2"
  "C:\Program Files\Java\jdk-21.0.2"
  "C:\Program Files\Eclipse Adoptium\jdk-21.0.12.101-hotspot"
  "C:\Program Files\Java\latest"
) do (
  if exist "%%~D\bin\java.exe" (
    set "JAVA_HOME=%%~D"
    goto :java_ready
  )
)
:java_ready
if not "%JAVA_HOME%"=="" set "PATH=%JAVA_HOME%\bin;%PATH%"

set "MAVEN_HOME="
for %%D in (
  "C:\apache-maven-3.9.9"
  "C:\Program Files\Apache\Maven"
  "C:\Program Files\Apache\apache-maven-3.9.9"
  "C:\Program Files\Maven"
  "C:\Users\admin\maven\apache-maven-3.9.9"
) do (
  if exist "%%~D\bin\mvn.cmd" (
    set "MAVEN_HOME=%%~D"
    goto :maven_ready
  )
)
:maven_ready
if not "%MAVEN_HOME%"=="" set "PATH=%MAVEN_HOME%\bin;%PATH%"

REM Prefer the project-local Node runtime when Node.js is not installed system-wide.
if exist "%~dp0..\tools\node-v22.23.1-win-x64\npm.cmd" set "PATH=%~dp0..\tools\node-v22.23.1-win-x64;%PATH%"

where java >nul 2>nul
if errorlevel 1 (
  echo Java JDK 21+ was not found. Install Java, then run this file again.
  pause
  exit /b 1
)

where mvn >nul 2>nul
if errorlevel 1 (
  echo Maven was not found. Install Apache Maven 3.9+ and ensure it is on PATH.
  pause
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo Node.js and npm were not found. Install Node.js, then run this file again.
  pause
  exit /b 1
)

if not exist "%BACKEND_DIR%\pom.xml" (
  echo Backend project not found: %BACKEND_DIR%
  pause
  exit /b 1
)

if not exist "%FRONTEND_DIR%\package.json" (
  echo Frontend project not found: %FRONTEND_DIR%
  pause
  exit /b 1
)

echo [1/3] Building the React frontend...
pushd "%FRONTEND_DIR%"
if not exist node_modules call npm ci
if errorlevel 1 goto :build_failed
call npm run build
if errorlevel 1 goto :build_failed
popd

REM Serve the freshly built React app from Spring Boot at the main URL.
xcopy /E /I /Y "%FRONTEND_DIR%\dist\*" "%BACKEND_DIR%\src\main\resources\static\" >nul
if errorlevel 1 goto :build_failed

echo [2/3] Starting the backend and website...
set "HEALTH_URL=%APP_URL%/api/v1/health"
set "SERVER_READY=0"
powershell -NoProfile -ExecutionPolicy Bypass -Command "try { $response = Invoke-WebRequest -Uri '%APP_URL%' -UseBasicParsing -TimeoutSec 2; if ($response.StatusCode -eq 200 -and $response.Content -match 'id=\"root\"') { exit 0 } } catch {} ; exit 1" >nul 2>&1
if not errorlevel 1 (
  set "SERVER_READY=1"
  echo Existing React FasalSathi server is already ready.
  goto server_ready
)
REM Stop an older static FasalSathi instance using the same port.
powershell -NoProfile -ExecutionPolicy Bypass -Command "$connection = Get-NetTCPConnection -LocalPort 8080 -State Listen -ErrorAction SilentlyContinue; if ($connection) { Stop-Process -Id $connection.OwningProcess -Force -ErrorAction SilentlyContinue }" >nul 2>&1
start "FasalSathi" cmd /k "cd /d ""%BACKEND_DIR%"" && mvn spring-boot:run"

echo [3/3] Waiting for the MAIN WEBSITE: %APP_URL%...
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
  echo Check the FasalSathi terminal window for the startup error.
  pause
  exit /b 1
)
start "" "%APP_URL%"

echo.
echo FasalSathi is running at %APP_URL%
echo MAIN WEBSITE: %APP_URL%
echo Close the FasalSathi terminal window to stop it.
pause
exit /b 0

:build_failed
popd
echo Frontend build failed. Fix the errors above and run this file again.
pause
exit /b 1
