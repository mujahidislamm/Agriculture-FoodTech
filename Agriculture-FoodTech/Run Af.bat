
@echo off
setlocal
set "ROOT_DIR=%~dp0..\"
set "BACKEND_DIR=%ROOT_DIR%frontend\desktop-tutorial"
set "FRONTEND_DIR=%BACKEND_DIR%\frontend"
set "FRONTEND_URL=http://localhost:4173"
set "BACKEND_URL=http://localhost:8080"

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

where java >nul 2>nul
if errorlevel 1 (
    echo Java JDK 21+ is required but was not found.
    echo Please install Java, then run this file again.
    pause
    exit /b 1
)

where mvn >nul 2>nul
if errorlevel 1 (
    echo Maven is required but was not found in PATH.
    echo Please install Apache Maven 3.9+, then run this file again.
    pause
    exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
    echo Node.js and npm are required but were not found in PATH.
    echo Please install Node.js, then run this file again.
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

cd /d "%BACKEND_DIR%"
echo [1/3] Starting backend...
start "FasalSathi Backend" cmd /k "cd /d ""%BACKEND_DIR%"" && mvn spring-boot:run"

echo [2/3] Starting frontend...
start "FasalSathi Frontend" cmd /k "cd /d ""%FRONTEND_DIR%"" && if not exist node_modules npm install && npm run dev -- --host 0.0.0.0 --port 4173"

echo [3/3] Opening app...
timeout /t 18 /nobreak > nul
start "" "%FRONTEND_URL%"

echo.
echo FasalSathi app started.
echo Frontend: %FRONTEND_URL%
echo Backend: %BACKEND_URL%
echo.
echo Close the terminal windows when you want to stop the app.
pause
