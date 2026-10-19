@echo off
chcp 65001 >nul
setlocal
cd /d %~dp0

echo ============================================================
echo   CIFNEW 一键启动 (Windows)
echo   ipfs -^> 后端(orbit-server.exe) -^> 前端(react-scripts)
echo ============================================================
echo.

where ipfs >nul 2>nul
if errorlevel 1 (
    echo [警告] 未在 PATH 中找到 ipfs 命令，请先安装 Kubo 并加入 PATH。
    echo        下载: https://dist.ipfs.tech/#kubo
    echo.
)

if not exist "orbit-server\orbit-server.exe" (
    echo [错误] 未找到 orbit-server\orbit-server.exe
    echo        请先执行:  npm run build:backend:win
    echo.
    pause
    exit /b 1
)

echo 启动ipfs
start /b "" cmd /c "npm run ipfs"
timeout /t 5 /nobreak >nul

echo 启动后端
start /b "" cmd /c "npm run backend:win"
timeout /t 10 /nobreak >nul

echo 启动应用
start /b "" cmd /c "npm run start"

echo.
echo 所有命令已启动！
echo 前端地址: http://localhost:3001
echo 后端地址: http://localhost:3456
echo.
echo [注意] 保持本窗口开启；关闭本窗口会一并结束以上三个服务。
pause >nul
