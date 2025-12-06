@echo off
chcp 65001 >nul
echo ========================================
echo 心理健康智能平台 - 启动脚本
echo ========================================
echo.

echo [1/2] 启动后端服务...
cd mental-health-backend
start "后端服务" cmd /k "npm run dev"
cd ..

timeout /t 3 /nobreak >nul

echo [2/2] 启动前端服务...
cd mental-health-frontend
start "前端服务" cmd /k "npm run dev"
cd ..

echo.
echo ========================================
echo 服务启动中，请稍候...
echo ========================================
echo.
echo 访问地址:
echo   前端: http://localhost:63334
echo   后端: http://localhost:8000
echo.
echo 按任意键退出...
pause >nul

