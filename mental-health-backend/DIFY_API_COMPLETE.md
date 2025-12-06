# Dify API 完整集成文档

## 配置信息

- **API基础地址**: `http://172.26.96.1.80/v1`
- **API密钥**: `app-8nHR8v6mryIQM4eBmc8Od9V1`
- **鉴权方式**: `Authorization: Bearer app-8nHR8v6mryIQM4eBmc8Od9V1`

## 已实现的接口

### 1. POST /chat-messages - 发送对话消息（流式模式）

**后端路由**: `POST /api/ai/dify/chat`

**请求体格式**（严格遵循Dify API文档）:
```json
{
  "query": "用户输入/提问内容",
  "user": "用户唯一标识",
  "response_mode": "streaming",
  "inputs": {},
  "conversation_id": "会话ID（可选）",
  "auto_generate_name": true
}
```

**响应处理**（SSE流式响应）:

#### 支持的事件类型：

1. **event: message** / **event: agent_message**
   - 拼接 `answer` 字段作为回复
   - 实时发送给前端
   - 保存 `conversation_id` 和 `message_id`

2. **event: agent_thought**
   - Agent思考步骤（Agent模式下使用）
   - 包含：thought（思考内容）、observation（工具调用结果）、tool（使用的工具）

3. **event: message_file**
   - 文件事件（如Agent生成的图片）
   - 包含：id、type、url、belongs_to

4. **event: message_replace**
   - 消息内容替换事件（内容审查时使用）
   - 替换完整回复内容

5. **event: tts_message** / **event: tts_message_end**
   - TTS音频流事件（语音合成输出）
   - 包含Base64编码的音频数据

6. **event: message_end**
   - 消息结束事件
   - 包含完整的metadata和usage信息
   - 存储 `conversation_id` 用于后续会话

7. **event: error**
   - 错误事件
   - 包含错误码和错误消息

8. **event: ping**
   - 每10秒一次的ping事件，保持连接存活

### 2. GET /messages - 获取会话历史消息

**后端路由**: `GET /api/ai/dify/history`

**查询参数**:
- `userId`: 用户标识（必填）
- `conversationId`: 会话ID（可选）
- `limit`: 返回条数（默认20）
- `firstId`: 分页ID（可选）

**响应格式**:
```json
{
  "code": 200,
  "msg": "Demo版模拟数据",
  "data": {
    "data": [
      {
        "id": "消息ID",
        "role": "user" | "assistant",
        "content": "消息内容",
        "timestamp": "ISO时间戳",
        "messageId": "消息唯一ID",
        "conversationId": "会话ID",
        "messageFiles": [],
        "agentThoughts": [],
        "retrieverResources": []
      }
    ],
    "limit": 20,
    "hasMore": false
  }
}
```

### 3. GET /conversations - 获取会话列表

**后端路由**: `GET /api/ai/dify/conversations`

**查询参数**:
- `userId`: 用户标识（必填）
- `limit`: 返回条数（默认20，最大100）
- `lastId`: 分页ID（可选）
- `sortBy`: 排序字段（可选，默认-updated_at）

**响应格式**:
```json
{
  "code": 200,
  "msg": "Demo版模拟数据",
  "data": {
    "data": [
      {
        "id": "会话ID",
        "name": "会话名称",
        "inputs": {},
        "status": "normal",
        "created_at": 1679667915,
        "updated_at": 1679667915
      }
    ],
    "limit": 20,
    "hasMore": false
  }
}
```

### 4. GET /info - 获取应用基本信息

**后端路由**: `GET /api/ai/dify/test`

**功能**: 测试Dify API可达性，获取应用基本信息

**响应格式**:
```json
{
  "code": 200,
  "msg": "Demo版模拟数据",
  "data": {
    "reachable": true,
    "message": "Dify API连接成功",
    "apiUrl": "http://172.26.96.1.80/v1",
    "appInfo": {
      "name": "应用名称",
      "description": "应用描述",
      "tags": ["标签1", "标签2"],
      "mode": "chat",
      "author_name": "作者名称"
    }
  }
}
```

## 错误处理

### HTTP错误码处理

根据Dify API文档，完整处理所有错误码：

#### 400错误（多种原因）:
- `invalid_param`: 传入参数异常
- `app_unavailable`: App配置不可用
- `provider_not_initialize`: 无可用模型凭据配置
- `provider_quota_exceeded`: 模型调用额度不足
- `model_currently_not_support`: 当前模型不可用
- `workflow_not_found`: 指定的工作流版本未找到
- `draft_workflow_error`: 无法使用草稿工作流版本
- `workflow_id_format_error`: 工作流ID格式错误，需要UUID格式
- `completion_request_error`: 文本生成失败

#### 其他错误码:
- `401/403`: API密钥验证失败
- `404`: 对话不存在或Dify服务未找到
- `500`: 服务内部异常

### 网络错误处理

- **连接超时**: 30秒超时保护
- **连接失败**: ECONNREFUSED, ENOTFOUND等
- **流式响应中断**: 自动处理并保存已接收内容

## 会话持久化

### 实现机制

1. **首次对话**: 不传 `conversation_id`，让Dify自动创建新会话
2. **继续对话**: 使用之前返回的 `conversation_id`
3. **会话恢复**: 
   - 从本地存储获取（`userConversationIds`）
   - 或从Dify API获取（`GET /conversations`）

### 会话ID管理

- 每个用户维护一个 `conversation_id`
- 存储在 `userConversationIds` 对象中
- 在 `message_end` 事件中更新
- 支持前端传递 `conversationId` 参数覆盖

## 代码关键位置

### 1. API配置（第469-473行）

```javascript
const AGENT_API_BASE_URL = 'http://172.26.96.1.80/v1';
const AGENT_API_KEY = 'app-8nHR8v6mryIQM4eBmc8Od9V1';
```

### 2. 请求体构建（第575-581行）

```javascript
const requestBody = {
  query: message.trim(),
  user: userId,
  response_mode: "streaming",
  inputs: {},
  auto_generate_name: true,
  ...(conversationId && conversationId !== '' ? { conversation_id: conversationId } : {})
};
```

### 3. SSE事件处理（第688-820行）

- `message` / `agent_message`: 拼接answer
- `agent_thought`: Agent思考步骤
- `message_file`: 文件事件
- `message_replace`: 消息替换
- `tts_message` / `tts_message_end`: TTS音频流
- `message_end`: 消息结束
- `error`: 错误处理
- `ping`: 保持连接

### 4. 错误处理（第617-630行）

完整处理所有400错误码和HTTP状态码

## 测试方法

### 1. 测试API可达性

```bash
curl http://localhost:8000/api/ai/dify/test
```

### 2. 测试发送消息

```bash
curl -X POST http://localhost:8000/api/ai/dify/chat \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test_user_001",
    "message": "我不想上课"
  }'
```

### 3. 测试获取历史

```bash
curl "http://localhost:8000/api/ai/dify/history?userId=test_user_001&limit=20"
```

### 4. 测试获取会话列表

```bash
curl "http://localhost:8000/api/ai/dify/conversations?userId=test_user_001&limit=20"
```

## 注意事项

1. **Agent模式**: 必须使用 `response_mode: "streaming"`，不支持blocking
2. **会话持久化**: 首次请求不传 `conversation_id`，后续复用返回的ID
3. **用户ID**: 自动生成UUID格式，确保唯一性
4. **超时设置**: 30秒超时，可根据实际情况调整
5. **事件处理**: 所有事件类型都已实现，可根据需要扩展

## 前端调用示例

```javascript
// 发送消息（流式）
import { callDifyAdvisor } from '@/api/decompress'

await callDifyAdvisor(
  {
    userId: 'user_001',
    message: '我不想上课',
    conversationId: '会话ID（可选）'
  },
  (chunk, fullAnswer) => {
    // onMessage: 实时接收消息块
    console.log('收到消息块:', chunk)
  },
  (error) => {
    // onError: 错误处理
    console.error('错误:', error)
  },
  (result) => {
    // onEnd: 消息结束
    console.log('完整回复:', result.fullAnswer)
    console.log('会话ID:', result.conversationId)
  }
)

// 获取历史
import { getDifyHistory } from '@/api/decompress'

const history = await getDifyHistory({
  userId: 'user_001',
  conversationId: '会话ID（可选）',
  limit: 20
})
```

