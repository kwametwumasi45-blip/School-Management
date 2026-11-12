@echo off
title Emena School Management System

cd /d "%~dp0"

echo Starting Emena School Management System...
echo.

start "" http://localhost:3000

npm.cmd start

pause
