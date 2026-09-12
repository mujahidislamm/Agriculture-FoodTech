@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0frontend\desktop-tutorial"

set "JAVA_FOUND="
for /d %%D in ("%LOCALAPPDATA%\Programs\Eclipse Adoptium\jdk-25*" "%LOCALAPPDATA%\jdks\jdk-25*" "C:\Program Files\Java\jdk-25*") do (
  if exist "%%~D\bin\java.exe" if not defined JAVA_FOUND (
    set "JAVA_HOME=%%~D"
    set "PATH=%%~D\bin;!PATH!"
    set "JAVA_FOUND=1"
  )
)

if not defined JAVA_FOUND (
  java -version 2>&1 | findstr /r /c:"version \"25" >nul
  if errorlevel 1 (
    echo ERROR: Java 25 or later was not found.
    exit /b 1
  )
)

set "MAVEN_CMD="
for %%D in (
  "%USERPROFILE%\.maven\maven-3.9.15"
  "%USERPROFILE%\.maven\maven-3.10.0-rc-1"
  "C:\Program Files\Apache\Maven"
  "C:\Program Files\Maven"
  "C:\apache-maven-3.9.9"
) do (
  if exist "%%~D\bin\mvn.cmd" if not defined MAVEN_CMD set "MAVEN_CMD=%%~D\bin\mvn.cmd"
)

if not defined MAVEN_CMD (
  where mvn.cmd >nul 2>&1
  if errorlevel 1 (
    echo ERROR: Maven 3.9+ was not found.
    exit /b 1
  )
  set "MAVEN_CMD=mvn.cmd"
)

echo Building FasalSathi from %CD%...
call "%MAVEN_CMD%" clean package
exit /b %errorlevel%