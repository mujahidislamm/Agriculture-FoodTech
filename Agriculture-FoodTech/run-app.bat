@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

set "APP_URL=http://localhost:8080"
set "BACKEND_DIR=%~dp0..\frontend\desktop-tutorial"
set "FRONTEND_DIR=%BACKEND_DIR%\frontend"

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
  "C:\Users\admin\maven\apache-maven-3.9.9"
  "C:\Program Files\Apache\Maven"
  "C:\Program Files\Apache\apache-maven-3.9.9"
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

echo [2/3] Starting the backend and website...
start "FasalSathi" cmd /k "cd /d ""%BACKEND_DIR%"" && mvn spring-boot:run"

echo [3/3] Opening the MAIN WEBSITE ONLY: %APP_URL%...
timeout /t 8 /nobreak >nul
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
