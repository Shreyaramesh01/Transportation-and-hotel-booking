@echo off
title SmartTrip Launcher
cd /d "%~dp0"
echo ========================================================
echo   Starting SmartTrip Transport & Hotel Booking System
echo ========================================================
echo.

echo [1/2] Starting Backend API Server (Port 5000)...
start "SmartTrip Backend API" cmd /k "cd backend && node server.js"

timeout /t 2 >nul

echo [2/2] Starting Frontend Vite Client (Port 5173)...
start "SmartTrip Frontend" cmd /k "cd frontend && npm.cmd run dev"

echo.
echo All servers launched successfully!
echo Opening browser at http://localhost:5173 ...
echo.
timeout /t 3 >nul
start http://localhost:5173
