@echo off
setlocal enabledelayedexpansion

echo ========================================
echo   OpenCode Slack Bridge Launcher
echo ========================================
echo.

cd /d "%~dp0"

:: Ports to try - start with 4096, then fall back
set "FOUND_PORT="
set "START_PORT=4096"

:scan_loop
for %%P in (%START_PORT% 4097 4098 4099 5000 6000 61108 62000 63000 64000 65000 70000) do (
    powershell -Command "try { Invoke-WebRequest -Uri 'http://localhost:%%P/global/health' -UseBasicParsing -TimeoutSec 2 | Out-Null; exit 0 } catch { exit 1 }"
    if !errorlevel! equ 0 (
        set "FOUND_PORT=%%P"
        goto :server_found
    )
)

:try_start
if defined START_PORT (
    echo [OPENCODE] Port %START_PORT% not responding, starting server...
    start "OpenCode Server" cmd /k "opencode serve --port %START_PORT%"
    powershell -Command "Start-Sleep -Seconds 15"
    set "START_PORT=" & goto :scan_loop
)

:server_found
if not defined FOUND_PORT (
    echo [ERROR] Could not find or start OpenCode server
    pause
    exit /b 1
)

echo [OPENCODE] Using port %FOUND_PORT%

:: Update .env with the correct port
powershell -Command "$c = Get-Content '.env'; $c = $c -replace 'OPENCODE_URL=http://localhost:\d+', 'OPENCODE_URL=http://localhost:%FOUND_PORT%'; Set-Content '.env' $c"

echo.
echo Starting Slack Bridge...
echo.
npm run dev