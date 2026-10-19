@echo off
rem ============================================================
rem  orbit-server Windows launcher
rem  1. Make sure the Kubo (IPFS) daemon is running first:
rem       ipfs daemon --enable-pubsub-experiment
rem  2. Then double-click this file, or run:
rem       orbit-server.exe orbit-config.json
rem  3. Ctrl+C stops the server gracefully.
rem ============================================================

cd /d %~dp0

if not exist orbit-server.exe (
    echo [ERROR] orbit-server.exe not found in %cd%
    echo         Build it with:  npm run build:backend:win
    pause
    exit /b 1
)

if not exist orbit-config.json (
    echo [WARN] orbit-config.json not found in %cd%
    echo        Defaults will be used: kubo /ip4/127.0.0.1/tcp/5001, port 3456, dir ./orbitdb-data
)

echo Starting orbit-server.exe ...
orbit-server.exe orbit-config.json

echo.
echo [orbit-server exited] press any key to close ...
pause > nul
