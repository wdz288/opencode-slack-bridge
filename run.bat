@echo off
setlocal

echo ========================================
echo   OpenCode Slack Bridge Launcher
echo ========================================
echo.

cd /d "%~dp0"

:: Check 4097 first
powershell -Command "$r = Invoke-WebRequest -Uri 'http://localhost:4097/global/health' -UseBasicParsing -TimeoutSec 3 -ErrorAction SilentlyContinue; if ($r) { exit 0 } else { exit 1 }"
if %errorlevel% equ 0 (
    echo [OK] OpenCode on 4097
    set "PORT=4097"
    goto :done
)

:: Check 4096
powershell -Command "$r = Invoke-WebRequest -Uri 'http://localhost:4096/global/health' -UseBasicParsing -TimeoutSec 3 -ErrorAction SilentlyContinue; if ($r) { exit 0 } else { exit 1 }"
if %errorlevel% equ 0 (
    echo [OK] OpenCode on 4096
    set "PORT=4096"
    goto :done
)

:: Start on 4097
echo [INFO] Starting OpenCode on 4097...
start "OpenCode" cmd /k "opencode serve --port 4097"
powershell -Command "Start-Sleep -Seconds 20"

:done
echo Using port: %PORT%

:: Update .env with regex replace
powershell -Command "$c = Get-Content '.env' -Raw; $c = $c -replace 'OPENCODE_URL=http://localhost:\d+', 'OPENCODE_URL=http://localhost:%PORT%'; $c | Set-Content '.env'"

echo.
echo Starting Slack Bridge...
npm run dev