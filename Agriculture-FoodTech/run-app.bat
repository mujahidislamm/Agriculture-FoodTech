@echo off
setlocal
cd /d "%~dp0"

echo Starting FasalSathi at http://localhost:8080

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

start "FasalSathi Web App" http://localhost:8080
call mvn spring-boot:run
pause
