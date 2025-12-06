# 服务启动指南

## 当前状态

✅ **后端服务**: 已启动在 `http://localhost:8000`  
✅ **前端服务**: 已启动在 `http://localhost:63334`  
⚠️ **Dify服务**: 需要单独启动

## 服务启动步骤

### 1. 后端服务（Node.js + Express）

```bash
cd mental-health-backend
npm start
```

**状态检查**:
```bash
curl http://localhost:8000/api/health
```

**预期响应**:
```json
{"code":200,"data":{"status":"ok"},"message":"healthy"}
```

### 2. 前端服务（Vue 3 + Vite）

```bash
cd mental-health-frontend
npm run dev
```

**访问地址**: `http://localhost:63334`

### 3. Dify服务（需要单独启动）

⚠️ **重要**: Dify服务需要单独安装和启动

#### 方式1: Docker启动（推荐）

```bash
# 拉取Dify镜像
docker pull langgenius/dify-web:latest
docker pull langgenius/dify-api:latest

# 启动Dify服务
# 请参考Dify官方文档进行Docker部署
```

#### 方式2: 本地安装

1. 下载Dify安装包
2. 按照官方文档配置
3. 确保服务运行在 `http://localhost/v1`

#### 验证Dify服务

```bash
curl -X POST 'http://localhost/v1/chat-messages' \
  --header 'Authorization: Bearer app-E60XsJdpfPZGWvb2f4rkhmTU' \
  --header 'Content-Type: application/json' \
  --data-raw '{
    "inputs": {},
    "query": "你好",
    "response_mode": "blocking",
    "user": "test-user",
    "conversation_id": ""
  }'
```

## 功能测试

### 1. 测试后端接口

```bash
# 健康检查
curl http://localhost:8000/api/health

# 情绪数据提交（Demo模式，不依赖Dify）
curl -X POST http://localhost:8000/api/emotion/submit \
  -H "Content-Type: application/json" \
  -H "X-User-Id: test-user" \
  -d '{"dataType":"text","content":"今天心情很好","timestamp":1702195200000}'
```

### 2. 测试前端页面

1. 打开浏览器访问: `http://localhost:63334`
2. 导航到情绪采集页面: `http://localhost:63334/emotion/collect`
3. 输入情绪内容并提交
4. 查看分析结果

### 3. 测试Dify API（需要Dify服务运行）

```bash
cd mental-health-backend
node test-dify-api.js
```

## 服务状态检查

### 检查后端服务

```powershell
# PowerShell
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/api/health" -UseBasicParsing
    Write-Host "✓ 后端服务运行正常: $($response.StatusCode)"
} catch {
    Write-Host "✗ 后端服务未运行"
}
```

### 检查前端服务

打开浏览器访问: `http://localhost:63334`

### 检查Dify服务

```powershell
try {
    $response = Invoke-WebRequest -Uri "http://localhost/v1/info" `
        -Headers @{"Authorization"="Bearer app-E60XsJdpfPZGWvb2f4rkhmTU"} `
        -UseBasicParsing
    Write-Host "✓ Dify服务运行正常"
} catch {
    Write-Host "✗ Dify服务未运行或配置错误"
}
```

## 常见问题

### Q1: 后端服务启动失败

**解决方案**:
1. 检查端口8000是否被占用
2. 确保已安装所有依赖: `npm install`
3. 查看错误日志

### Q2: 前端服务无法连接后端

**解决方案**:
1. 确保后端服务已启动
2. 检查`vite.config.js`中的代理配置
3. 检查浏览器控制台错误

### Q3: Dify API返回404

**原因**: Dify服务未启动或URL配置错误

**解决方案**:
1. 启动Dify服务
2. 验证服务运行在 `http://localhost/v1`
3. 检查API密钥是否正确

### Q4: 情绪分析失败

**如果Dify服务未运行**:
- 系统会自动切换到Demo模式（如果isDemo=true）
- 或返回错误信息（如果isDemo=false）

**如果Dify服务运行但分析失败**:
1. 检查API密钥
2. 查看后端日志
3. 验证Dify服务配置

## 当前配置

- **后端端口**: 8000
- **前端端口**: 63334
- **Dify URL**: http://localhost/v1
- **Dify API密钥**: app-E60XsJdpfPZGWvb2f4rkhmTU
- **运行模式**: 正式版（isDemo: false）

## 下一步

1. ✅ 后端服务已启动
2. ✅ 前端服务已启动
3. ⏳ 启动Dify服务（需要单独配置）
4. ⏳ 运行完整功能测试

---

**提示**: 如果Dify服务暂时无法启动，可以临时将`isDemo`设置为`true`来测试其他功能。

