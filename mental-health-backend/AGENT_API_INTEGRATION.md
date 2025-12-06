# 心理顾问Agent API对接说明

## API配置

- **API基础地址**: `http://localhost/v1`
- **API密钥**: `app-8nHR8v6mryIQM4eBmc8Od9V1`
- **鉴权方式**: Bearer Token（请求头：`Authorization: Bearer app-8nHR8v6mryIQM4eBmc8Od9V1`）

## 已实现的接口

### 1. 用户咨询消息发送接口

**后端路由**: `POST /api/ai/dify/chat`

**前端调用**: 
```javascript
import { callDifyAdvisor } from '@/api/decompress'

const response = await callDifyAdvisor({
  userId: 'user_001',
  message: '我最近感到压力很大',
  emotionTags: ['压力', '焦虑'],
  emotionScore: 75,
  conversationHistory: [] // 可选，最近10条消息作为上下文
})
```

**后端实现**:
- 接收用户ID和咨询文本
- 调用Agent API: `POST http://localhost/v1/chat-messages`
- 请求头包含API密钥
- 返回Agent的回复文本

**请求格式**:
```json
{
  "inputs": {
    "userId": "user_001",
    "emotionTags": ["压力", "焦虑"],
    "emotionScore": 75
  },
  "query": "我最近感到压力很大",
  "conversation_id": "conv_user_001_1234567890",
  "user": "user_001"
}
```

**响应格式**:
```json
{
  "code": 200,
  "msg": "Demo版模拟数据",
  "data": {
    "reply": "Agent的回复内容",
    "message": "Agent的回复内容",
    "userId": "user_001",
    "conversationId": "conv_user_001_1234567890"
  }
}
```

### 2. 对话历史查询接口

**后端路由**: `GET /api/ai/dify/history`

**前端调用**:
```javascript
import { getDifyHistory } from '@/api/decompress'

const response = await getDifyHistory({
  userId: 'user_001',
  limit: 20 // 可选，默认20条
})
```

**后端实现**:
- 接收用户ID
- 优先从本地存储获取历史记录
- 如果本地没有，尝试从Agent API获取: `GET http://localhost/v1/messages?conversation_id=xxx&user=xxx&limit=20`
- 返回该用户的所有对话记录

**响应格式**:
```json
{
  "code": 200,
  "msg": "Demo版模拟数据",
  "data": [
    {
      "role": "user",
      "content": "我最近感到压力很大",
      "timestamp": "2025-01-07T10:00:00.000Z"
    },
    {
      "role": "assistant",
      "content": "Agent的回复内容",
      "timestamp": "2025-01-07T10:00:05.000Z"
    }
  ]
}
```

## 错误处理

如果Agent API调用失败，后端会：
1. 记录错误日志
2. 返回错误响应（code: 500）
3. 前端可以显示友好的错误提示

## 注意事项

1. **Agent服务必须运行**: 确保心理顾问Agent服务在 `http://localhost/v1` 正常运行
2. **API格式可能不同**: 如果Agent API的实际格式与上述不同，需要调整 `server.js` 中的请求和响应解析逻辑
3. **对话ID管理**: 系统会自动为每个用户生成和管理对话ID
4. **历史记录**: 对话历史会同时保存在本地（内存）和Agent服务中

## 调试

如果遇到问题，请检查：
1. Agent服务是否正常运行
2. API密钥是否正确
3. 网络连接是否正常
4. 后端控制台的错误日志

## 修改API格式

如果Agent API的实际格式不同，请修改 `server.js` 中的以下部分：

1. **请求格式** (约第520行): 调整 `requestBody` 的结构
2. **响应解析** (约第540行): 调整 `aiReply` 的提取逻辑
3. **历史记录格式** (约第600行): 调整历史记录的解析逻辑

