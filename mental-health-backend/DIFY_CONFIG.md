# Dify 机器人接入配置指南

## ✅ 已完成的配置

代码已经正确配置，可以接入你的 Dify 机器人。

## 📝 配置步骤

### 1. 编辑 `.env` 文件

在 `mental-health-backend` 目录下，编辑 `.env` 文件：

```env
# Dify API 配置
DIFY_API_BASE_URL=http://localhost/v1
DIFY_API_KEY=你的真实_Dify_API_Key
PORT=3000
```

### 2. 重要提示

- **API Key 格式**：只需要密钥本身，**不需要** "Authorization: Bearer" 前缀
  - ✅ 正确：`app-xxxxx` 或 `sk-xxxxx`
  - ❌ 错误：`Authorization: Bearer app-xxxxx`
  
- **代码会自动处理**：即使你误加了前缀，代码也会自动移除

- **API URL**：`http://localhost/v1`
  - 如果你的 Dify API 端点不同，请告诉我具体路径
  - 例如：`http://localhost/v1/chat-messages` 或 `http://localhost/v1/messages`

## 🔍 验证配置

启动服务器后，查看控制台输出：

```
环境变量检查:
  - DIFY_API_BASE_URL: http://localhost/v1
  - DIFY_API_KEY: 已设置
```

## 🧪 测试接口

使用 Postman 或 curl 测试：

```bash
curl -X POST http://localhost:3000/positive/content \
  -H "Content-Type: application/json" \
  -d '{"userMood": "今天心情有点低落"}'
```

## 📊 调试日志

代码已添加详细日志，调用 Dify API 时会输出：
- 请求 URL
- 请求体
- API Key（部分显示）
- 响应状态和数据

查看后端服务器控制台即可看到详细日志。

## ⚠️ 常见问题

### 问题 1：接口返回 500 错误

**可能原因**：
1. Dify API Key 未正确配置
2. Dify 服务未启动
3. API URL 不正确

**解决方法**：
1. 检查 `.env` 文件中的 `DIFY_API_KEY` 是否正确
2. 确认 Dify 服务是否运行在 `http://localhost/v1`
3. 查看服务器控制台日志，查看具体错误信息

### 问题 2：API Key 格式错误

**解决方法**：
- 确保 `.env` 文件中的 `DIFY_API_KEY` 只包含密钥本身
- 代码会自动处理格式问题，但建议使用正确格式

## 📞 需要帮助？

如果遇到问题，请提供：
1. 后端服务器控制台的错误日志
2. Dify API 的具体端点路径（如果不是 `/v1`）
3. 你的 Dify API Key 格式示例（隐藏敏感部分）



