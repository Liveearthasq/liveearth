@echo off
chcp 65001 >nul
cd /d "D:\202610\WorkBudd\2026-11-10-09-56-53"
echo ============================================
echo   实时地球 LiveEarth 本地预览服务
echo   浏览器打开: http://localhost:8080/
echo   关闭本窗口即可停止服务
echo ============================================
"C:\Users\Administrator\.workbuddy\binaries\python\versions\3.13.12\python.exe" -m http.server 8080 --bind 0.0.0.0
echo.
echo 服务已停止。
pause
