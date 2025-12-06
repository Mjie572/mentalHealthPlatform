# 测试模块1接口
Write-Host "=== 测试模块1：AI情绪监控与预警模块 ===" -ForegroundColor Green

# 测试1: 情绪数据提交
Write-Host "`n1. 测试情绪数据提交接口..." -ForegroundColor Yellow
$body = '{"dataType":"text","content":"今天心情很好，工作顺利","timestamp":1702195200000}'
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/emotion/submit" -Method POST -Body $body -ContentType "application/json" -Headers @{"X-User-Id"="test-user-123"}
    Write-Host "✓ 提交成功" -ForegroundColor Green
    Write-Host "  情绪标签: $($response.data.emotionTag)" -ForegroundColor Cyan
    Write-Host "  情绪分数: $($response.data.emotionScore)" -ForegroundColor Cyan
    Write-Host "  消息: $($response.msg)" -ForegroundColor Cyan
} catch {
    Write-Host "✗ 提交失败: $_" -ForegroundColor Red
}

# 测试2: 情绪历史查询
Write-Host "`n2. 测试情绪历史查询接口..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/emotion/history" -Method GET -Headers @{"X-User-Id"="test-user-123"}
    Write-Host "✓ 查询成功" -ForegroundColor Green
    Write-Host "  记录数量: $($response.data.Count)" -ForegroundColor Cyan
    Write-Host "  消息: $($response.msg)" -ForegroundColor Cyan
} catch {
    Write-Host "✗ 查询失败: $_" -ForegroundColor Red
}

# 测试3: AI情绪分析
Write-Host "`n3. 测试AI情绪分析接口..." -ForegroundColor Yellow
$body = '{"content":"最近总是焦虑不安","dataType":"text"}'
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/ai/emotion-analyze" -Method POST -Body $body -ContentType "application/json"
    Write-Host "✓ 分析成功" -ForegroundColor Green
    Write-Host "  情绪标签: $($response.data.emotionTag)" -ForegroundColor Cyan
    Write-Host "  情绪分数: $($response.data.emotionScore)" -ForegroundColor Cyan
    Write-Host "  消息: $($response.msg)" -ForegroundColor Cyan
} catch {
    Write-Host "✗ 分析失败: $_" -ForegroundColor Red
}

Write-Host "`n=== 测试完成 ===" -ForegroundColor Green
