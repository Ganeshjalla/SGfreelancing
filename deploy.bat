@echo off
REM SGNexasoft - One-Click Deployment Script for Windows

echo.
echo ====================================
echo    SGNexasoft - Quick Deploy
echo ====================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not installed or not in PATH
    echo Please install Docker Desktop from https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

echo [✓] Docker found

REM Navigate to project directory
cd /d %~dp0

if not exist "docker-compose.yml" (
    echo [ERROR] docker-compose.yml not found. Please run this script from the project root directory.
    pause
    exit /b 1
)

echo [✓] Project directory verified

REM Ask user for action
echo.
echo What would you like to do?
echo.
echo 1. Fresh Deploy (Clean and Start)
echo 2. Start Services
echo 3. Stop Services
echo 4. View Logs
echo 5. Clean Everything and Exit
echo.
set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" (
    echo.
    echo [INFO] Cleaning previous deployment...
    docker compose down -v
    
    echo [INFO] Starting fresh deployment...
    docker compose up --build
    
) else if "%choice%"=="2" (
    echo.
    echo [INFO] Starting services...
    docker compose up
    
) else if "%choice%"=="3" (
    echo.
    echo [INFO] Stopping services...
    docker compose down
    echo [✓] Services stopped
    
) else if "%choice%"=="4" (
    echo.
    echo Select service to view logs:
    echo 1. Backend
    echo 2. Database
    echo 3. Frontend
    echo 4. All Services
    echo.
    set /p log_choice="Enter your choice (1-4): "
    
    if "%log_choice%"=="1" (
        docker compose logs backend -f
    ) else if "%log_choice%"=="2" (
        docker compose logs db -f
    ) else if "%log_choice%"=="3" (
        docker compose logs frontend -f
    ) else if "%log_choice%"=="4" (
        docker compose logs -f
    )
    
) else if "%choice%"=="5" (
    echo.
    echo [INFO] Cleaning everything...
    docker compose down -v
    echo [✓] All services removed
    echo [INFO] Exiting...
    
) else (
    echo [ERROR] Invalid choice
    exit /b 1
)

pause
