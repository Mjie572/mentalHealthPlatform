# 心理健康智能平台 - 启动脚本 (PowerShell)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "心理健康智能平台 - 启动脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查并启动后端服务
Write-Host "[1/2] 启动后端服务..." -ForegroundColor Yellow
Set-Location "mental-health-backend"

if (-not (Test-Path "node_modules")) {
    Write-Host "正在安装后端依赖..." -ForegroundColor Yellow
    npm install
}

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run dev"
Set-Location ..

Start-Sleep -Seconds 3

# 检查并启动前端服务
Write-Host "[2/2] 启动前端服务..." -ForegroundColor Yellow
Set-Location "mental-health-frontend"

if (-not (Test-Path "node_modules")) {
    Write-Host "正在安装前端依赖..." -ForegroundColor Yellow
    npm install
}

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run dev"
Set-Location ..

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "服务启动中，请稍候..." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "访问地址:" -ForegroundColor Magenta
Write-Host "  前端: http://localhost:63334" -ForegroundColor Cyan
Write-Host "  后端: http://localhost:8000" -ForegroundColor Cyan
Write-Host ""
Write-Host "等待服务启动后，在浏览器中访问上述地址" -ForegroundColor Yellow
Write-Host ""

