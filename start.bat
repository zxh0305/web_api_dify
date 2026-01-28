@echo off
chcp 65001 >nul
echo ========================================
echo   Dify Chat System - Quick Start
echo ========================================
echo.

:: 检测Python
where python >nul 2>&1
if %errorlevel% equ 0 (
    echo [√] Python is available
    python --version
    set HAS_PYTHON=1
) else (
    echo [×] Python not found
    set HAS_PYTHON=0
)

:: 检测Node.js
where node >nul 2>&1
if %errorlevel% equ 0 (
    echo [√] Node.js is available
    node --version
    set HAS_NODE=1
) else (
    echo [×] Node.js not found
    set HAS_NODE=0
)

echo.
echo Select startup method:
echo 1) Python HTTP Server (Simple, no dependencies)
echo 2) Node.js Express Server (Recommended, need npm install)
echo 3) Docker (Need Docker installed)
echo.
set /p choice="Your choice [1-3]: "

if "%choice%"=="1" (
    if %HAS_PYTHON% equ 1 (
        set /p port="Port [8000]: "
        if "%port%"=="" set port=8000
        set /p host="Host [0.0.0.0]: "
        if "%host%"=="" set host=0.0.0.0

        echo.
        echo Starting Python server...
        echo Access URLs:
        echo   - Local: http://localhost:%port%
        echo.
        python server.py %port% %host%
    ) else (
        echo Error: Python is not installed. Please install Python first.
        pause
        exit /b 1
    )
) else if "%choice%"=="2" (
    if %HAS_NODE% equ 1 (
        if not exist "node_modules" (
            echo.
            echo Installing dependencies...
            call npm install
            if %errorlevel% neq 0 (
                echo Error: Failed to install dependencies.
                pause
                exit /b 1
            )
        )

        set /p port="Port [8000]: "
        if "%port%"=="" set port=8000
        set /p host="Host [0.0.0.0]: "
        if "%host%"=="" set host=0.0.0.0

        echo.
        echo Starting Node.js server...
        set PORT=%port%
        set HOST=%host%
        call npm start
    ) else (
        echo Error: Node.js is not installed. Please install Node.js first.
        pause
        exit /b 1
    )
) else if "%choice%"=="3" (
    where docker >nul 2>&1
    if %errorlevel% equ 0 (
        echo Starting with Docker...
        docker-compose up -d

        echo.
        echo Access URLs:
        echo   - Local: http://localhost:8000
        echo.
        echo View logs: docker-compose logs -f
        echo Stop service: docker-compose down
        pause
    ) else (
        echo Error: Docker is not installed. Please install Docker first.
        pause
        exit /b 1
    )
) else (
    echo Invalid choice. Exiting.
    pause
    exit /b 1
)
