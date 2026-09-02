@echo off
setlocal
cd /d "%~dp0"

if exist "%~dp0setup-and-run.bat" (
  call "%~dp0setup-and-run.bat"
) else (
  call "%~dp0Agriculture-FoodTech\run-app.bat"
)
