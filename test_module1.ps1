# 模块1功能验证脚本

Write-Host "`n=== 模块1功能验证 ===" -ForegroundColor Green

# 测试1: 健康检查
Write-Host "`n[测试1] 健康检查接口" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/health" -Method GET
    Write-Host "✓ 后端服务正常运行" -ForegroundColor Green
    Write-Host "  响应: $($response | ConvertTo-Json -Compress)"
} catch {
    Write-Host "✗ 后端服务未启动: $_" -ForegroundColor Red
    exit 1
}

# 测试2: 情绪数据提交
Write-Host "`n[测试2] 情绪数据提交接口" -ForegroundColor Yellow
$emotionData = @{
    dataType = "text"
    content = "今天心情很好，工作顺利"
    timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/emotion/submit" `
        -Method POST `
        -Body $emotionData `
        -ContentType "application/json" `
        -Headers @{"X-User-Id"="test-user-123"}
    
    Write-Host "✓ 情绪数据提交成功" -ForegroundColor Green
    Write-Host "  情绪标签: $($response.data.emotionTag)"
    Write-Host "  情绪分数: $($response.data.emotionScore)"
    Write-Host "  消息: $($response.msg)"
} catch {
    Write-Host "✗ 情绪数据提交失败: $_" -ForegroundColor Red
}

# 测试3: 情绪历史查询
Write-Host "`n[测试3] 情绪历史查询接口" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/emotion/history" `
        -Method GET `
        -Headers @{"X-User-Id"="test-user-123"}
    
    Write-Host "✓ 情绪历史查询成功" -ForegroundColor Green
    Write-Host "  记录数量: $($response.data.Count)"
    Write-Host "  消息: $($response.msg)"
} catch {
    Write-Host "✗ 情绪历史查询失败: $_" -ForegroundColor Red
}

# 测试4: AI情绪分析
Write-Host "`n[测试4] AI情绪分析接口" -ForegroundColor Yellow
$analyzeData = @{
    content = "最近总是焦虑不安"
    dataType = "text"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/ai/emotion-analyze" `
        -Method POST `
        -Body $analyzeData `
        -ContentType "application/json"
    
    Write-Host "✓ AI情绪分析成功" -ForegroundColor Green
    Write-Host "  情绪标签: $($response.data.emotionTag)"
    Write-Host "  情绪分数: $($response.data.emotionScore)"
    Write-Host "  消息: $($response.msg)"
} catch {
    Write-Host "✗ AI情绪分析失败: $_" -ForegroundColor Red
}

# 测试5: 用户信息接口
Write-Host "`n[测试5] 用户信息接口" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/user/info?userId=test-user-123" `
        -Method GET
    
    Write-Host "✓ 用户信息查询成功" -ForegroundColor Green
    Write-Host "  消息: $($response.msg)"
} catch {
    Write-Host "✗ 用户信息查询失败: $_" -ForegroundColor Red
}

Write-Host "`n=== 功能验证完成 ===" -ForegroundColor Green
Write-Host "`n前端服务地址: http://localhost:63334" -ForegroundColor Cyan
Write-Host "后端服务地址: http://localhost:8000" -ForegroundColor Cyan
Write-Host "`n模块1页面:" -ForegroundColor Cyan
Write-Host "  - 情绪采集: http://localhost:63334/emotion/collect" -ForegroundColor Cyan
Write-Host "  - 情绪档案: http://localhost:63334/emotion/archive" -ForegroundColor Cyan
Write-Host "  - 预警页面: http://localhost:63334/emotion/alert" -ForegroundColor Cyan

