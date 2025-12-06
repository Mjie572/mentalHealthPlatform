# 前端开发服务器启动脚本
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   心理健康平台 - 前端开发服务器启动" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 确保在正确的目录
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host "当前目录: $(Get-Location)" -ForegroundColor Green
Write-Host ""

# 检查 package.json
if (-not (Test-Path "package.json")) {
    Write-Host "错误: package.json 不存在！" -ForegroundColor Red
    Write-Host "请确保在 mental-health-frontend 目录中运行此脚本" -ForegroundColor Yellow
    exit 1
}

# 检查依赖
if (-not (Test-Path "node_modules")) {
    Write-Host "node_modules 不存在，正在安装依赖..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "依赖安装失败！" -ForegroundColor Red
        exit 1
    }
}

# 清理旧进程
Write-Host "清理旧进程..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1

# 启动服务器
Write-Host ""
Write-Host "正在启动 Vite 开发服务器..." -ForegroundColor Green
Write-Host "服务器地址: http://localhost:63334" -ForegroundColor Cyan
Write-Host ""
Write-Host "----------------------------------------" -ForegroundColor Gray
Write-Host ""

npm run dev

