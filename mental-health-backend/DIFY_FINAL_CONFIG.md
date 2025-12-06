# Dify智能体对接最终配置说明

## 【关键配置项位置】

### 配置文件：`server.js`

**第467-471行** - API基础配置：
```javascript
// ========== 【关键配置项】心理顾问Agent API配置 ==========
// ⚠️ 重要：以下配置项需要根据实际部署环境修改
// API基础地址：Dify服务的完整地址（格式：http://IP:端口/v1）
const AGENT_API_BASE_URL = 'http://172.26.96.1:80/v1';
// API密钥：Dify应用的API密钥
const AGENT_API_KEY = 'app-8nHR8v6mryIQM4eBmc8Od9V1';
// 鉴权方式：Bearer Token（在HTTP Header中携带：Authorization: Bearer {API_KEY}）
// ========== 【配置项结束】 ==========
```

## 核心配置

1. **Dify API 基础地址**: `http://172.26.96.1:80/v1`
2. **API 密钥**: `app-8nHR8v6mryIQM4eBmc8Od9V1`
3. **鉴权方式**: `Authorization: Bearer app-8nHR8v6mryIQM4eBmc8Od9V1`

## 功能实现

### 1. 核心接口对接：POST /chat-messages

**后端路由**: `POST /api/ai/dify/chat`

**请求体格式**（严格遵循Dify API文档）:
```json
{
  "query": "用户输入的心理咨询内容",
  "user": "唯一用户ID，如 user_123456",
  "response_mode": "streaming",
  "conversation_id": "存储的会话ID，首次为空",
  "inputs": {}
}
```

**必传参数**:
- `query`: 用户咨询文本（必填）
- `user`: 用户唯一标识（必填，自动生成UUID格式）
- `response_mode`: "streaming"（Agent模式强制要求）

**可选参数**:
- `conversation_id`: 会话持久化（首次请求不传，后续复用返回的ID）
- `inputs`: App定义的变量值（当前为空对象）

### 2. 流式响应处理

**SSE格式解析**:
- Content-Type: `text/event-stream`
- 每行以 `data: ` 开头，需剔除前缀后解析JSON
- 块之间以 `\n\n` 分隔

**事件处理**:
- `event: message` / `event: agent_message`: 拼接 `answer` 字段作为回复
- `event: message_end`: 终止拼接，存储返回的 `conversation_id` 用于后续会话
- `event: error`: 返回友好提示（"心理咨询服务暂不可用，请稍后重试"）

### 3. 异常处理

**网络连接失败**:
- 捕获连接错误（ECONNREFUSED, ENOTFOUND）
- 返回友好提示

**超时处理**:
- 设置30秒超时
- 超时后自动取消请求并返回错误

**HTTP错误码**:
- 400: 请求参数错误
- 401/403: API密钥验证失败
- 404: Dify服务未找到
- 500: 服务内部错误
- 0或500+: 无法连接到Dify服务

### 4. API可达性测试

**测试接口**: `GET /api/ai/dify/test`

**功能**:
- 测试 `GET http://172.26.96.1:80/v1/info` 能否正常返回应用信息
- 验证API地址可达性
- 返回连接状态和应用信息

**使用方式**:
```bash
curl http://localhost:8000/api/ai/dify/test
```

## 代码关键部分

### 1. 请求体构建（第568-580行）

```javascript
const requestBody = {
  query: message.trim(),        // 必填：用户咨询文本
  user: userId,                 // 必填：用户唯一标识
  response_mode: "streaming",   // 必填：Agent模式强制要求
  inputs: {},                   // 可选：App定义的变量值
  ...(conversationId && conversationId !== '' ? { conversation_id: conversationId } : {}) // 可选：会话ID
};
```

### 2. SSE响应解析（第656-748行）

```javascript
// 解析SSE格式响应，每行以 data: 开头，需剔除前缀后解析JSON
if (line.startsWith('data: ')) {
  const jsonStr = line.substring(6); // 去掉 "data: " 前缀
  const eventData = JSON.parse(jsonStr);
  
  // 拼接 answer 字段
  if (eventType === 'message' || eventType === 'agent_message') {
    fullAnswer += eventData.answer;
  }
  
  // 收到 message_end 时终止拼接，存储 conversation_id
  if (eventType === 'message_end') {
    userConversationIds[userId] = eventData.conversation_id;
  }
}
```

### 3. 错误处理（第601-640行）

```javascript
// 处理400/404/500等HTTP错误码
if (!agentResponse.ok) {
  // 根据状态码返回不同错误提示
  if (agentResponse.status === 400) {
    errorMessage = '请求参数错误，请检查输入';
  } else if (agentResponse.status === 404) {
    errorMessage = 'Dify服务未找到，请确保服务在 http://172.26.96.1:80/v1 运行';
  }
  // ...
}
```

## 测试用例

### 测试"我不想上课"请求

1. **启动服务**:
   ```bash
   cd mental-health-backend
   npm run dev
   ```

2. **测试API可达性**:
   ```bash
   curl http://localhost:8000/api/ai/dify/test
   ```

3. **发送咨询消息**:
   ```bash
   curl -X POST http://localhost:8000/api/ai/dify/chat \
     -H "Content-Type: application/json" \
     -d '{
       "userId": "test_user_001",
       "message": "我不想上课"
     }'
   ```

4. **预期结果**:
   - 返回Dify智能体的心理疏导回复
   - 不是"抱歉，我暂时无法回答您的问题"
   - 流式返回，实时显示回复内容

## 维护说明

### 修改API地址

**位置**: `server.js` 第468行
```javascript
const AGENT_API_BASE_URL = 'http://172.26.96.1:80/v1';
```

### 修改API密钥

**位置**: `server.js` 第469行
```javascript
const AGENT_API_KEY = 'app-8nHR8v6mryIQM4eBmc8Od9V1';
```

### 测试连接

使用测试接口验证配置：
```bash
GET /api/ai/dify/test
```

## 注意事项

1. **API地址格式**: 必须是 `http://IP:端口/v1` 格式
2. **Agent模式**: 必须使用 `response_mode: "streaming"`，不支持blocking
3. **会话持久化**: 首次请求不传 `conversation_id`，后续复用返回的ID
4. **用户ID**: 自动生成UUID格式，确保唯一性
5. **超时设置**: 30秒超时，可根据实际情况调整

