# 模块1功能验证测试脚本

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "模块1：AI情绪监控与预警模块 - 功能验证" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 等待服务启动
Write-Host "等待服务启动..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# 测试1: 健康检查
Write-Host "测试1: 健康检查接口" -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/health" -Method GET
    Write-Host "  ✓ 健康检查成功: $($response.message)" -ForegroundColor Green
} catch {
    Write-Host "  ✗ 健康检查失败: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# 测试2: 情绪数据提交（文本类型）
Write-Host "测试2: 情绪数据提交（文本类型）" -ForegroundColor Green
try {
    $body = @{
        dataType = "text"
        content = "今天心情很好，工作顺利"
        timestamp = [DateTimeOffset]::Now.ToUnixTimeMilliseconds()
    } | ConvertTo-Json

    $headers = @{
        "Content-Type" = "application/json"
        "X-User-Id" = "test-user-123"
    }

    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/emotion/submit" -Method POST -Headers $headers -Body $body
    Write-Host "  ✓ 提交成功" -ForegroundColor Green
    Write-Host "    情绪标签: $($response.data.emotionTag)" -ForegroundColor Gray
    Write-Host "    情绪分数: $($response.data.emotionScore)" -ForegroundColor Gray
    Write-Host "    消息: $($response.msg)" -ForegroundColor Gray
} catch {
    Write-Host "  ✗ 提交失败: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# 测试3: 情绪数据提交（语音类型）
Write-Host "测试3: 情绪数据提交（语音类型）" -ForegroundColor Green
try {
    $body = @{
        dataType = "voice"
        content = "语音转文字：最近压力很大，总是焦虑不安"
        timestamp = [DateTimeOffset]::Now.ToUnixTimeMilliseconds()
    } | ConvertTo-Json

    $headers = @{
        "Content-Type" = "application/json"
        "X-User-Id" = "test-user-123"
    }

    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/emotion/submit" -Method POST -Headers $headers -Body $body
    Write-Host "  ✓ 提交成功" -ForegroundColor Green
    Write-Host "    情绪标签: $($response.data.emotionTag)" -ForegroundColor Gray
    Write-Host "    情绪分数: $($response.data.emotionScore)" -ForegroundColor Gray
} catch {
    Write-Host "  ✗ 提交失败: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# 测试4: 情绪历史查询
Write-Host "测试4: 情绪历史查询" -ForegroundColor Green
try {
    $headers = @{
        "X-User-Id" = "test-user-123"
    }

    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/emotion/history" -Method GET -Headers $headers
    Write-Host "  ✓ 查询成功" -ForegroundColor Green
    Write-Host "    记录数量: $($response.data.Count)" -ForegroundColor Gray
    Write-Host "    消息: $($response.msg)" -ForegroundColor Gray
} catch {
    Write-Host "  ✗ 查询失败: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# 测试5: AI情绪分析接口
Write-Host "测试5: AI情绪分析接口" -ForegroundColor Green
try {
    $body = @{
        content = "最近总是焦虑不安，睡眠质量下降"
        dataType = "text"
    } | ConvertTo-Json

    $headers = @{
        "Content-Type" = "application/json"
    }

    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/ai/emotion-analyze" -Method POST -Headers $headers -Body $body
    Write-Host "  ✓ 分析成功" -ForegroundColor Green
    Write-Host "    情绪标签: $($response.data.emotionTag)" -ForegroundColor Gray
    Write-Host "    情绪分数: $($response.data.emotionScore)" -ForegroundColor Gray
    Write-Host "    消息: $($response.msg)" -ForegroundColor Gray
} catch {
    Write-Host "  ✗ 分析失败: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# 测试6: 参数验证（缺少content）
Write-Host "测试6: 参数验证（缺少content）" -ForegroundColor Green
try {
    $body = @{
        dataType = "text"
    } | ConvertTo-Json

    $headers = @{
        "Content-Type" = "application/json"
    }

    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/emotion/submit" -Method POST -Headers $headers -Body $body
    Write-Host "  ✗ 应该返回错误，但成功了" -ForegroundColor Red
} catch {
    $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
    if ($errorResponse.code -eq 400) {
        Write-Host "  ✓ 参数验证正确: $($errorResponse.msg)" -ForegroundColor Green
    } else {
        Write-Host "  ✗ 错误码不正确" -ForegroundColor Red
    }
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "功能验证完成！" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "前端服务: http://localhost:63334" -ForegroundColor Yellow
Write-Host "后端服务: http://localhost:8000" -ForegroundColor Yellow
Write-Host ""
Write-Host "访问模块1页面:" -ForegroundColor Yellow
Write-Host "  - 情绪采集: http://localhost:63334/emotion/collect" -ForegroundColor Gray
Write-Host "  - 情绪档案: http://localhost:63334/emotion/archive" -ForegroundColor Gray
Write-Host "  - 预警页面: http://localhost:63334/emotion/alert" -ForegroundColor Gray

