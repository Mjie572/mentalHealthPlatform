# Dify API 完整实现说明

## API配置

- **API基础地址**: `http://localhost/v1`
- **API密钥**: `app-8nHR8v6mryIQM4eBmc8Od9V1`
- **鉴权方式**: Bearer Token（请求头：`Authorization: Bearer app-8nHR8v6mryIQM4eBmc8Od9V1`）

## 已实现的接口

### 1. 发送对话消息

**后端路由**: `POST /api/ai/dify/chat`

**Dify API**: `POST /chat-messages`

**请求格式**（根据Dify API文档）:
```json
{
  "query": "用户输入/提问内容",
  "inputs": {
    "userId": "user_001",
    "emotionTags": ["压力", "焦虑"],
    "emotionScore": 75
  },
  "response_mode": "blocking",
  "user": "user_001",
  "conversation_id": "会话ID（可选）",
  "auto_generate_name": true
}
```

**响应格式**（blocking模式）:
```json
{
  "event": "message",
  "task_id": "任务ID",
  "id": "唯一ID",
  "message_id": "消息唯一ID",
  "conversation_id": "会话ID",
  "mode": "chat",
  "answer": "完整回复内容",
  "metadata": {
    "usage": {...},
    "retriever_resources": [...]
  },
  "created_at": 1705395332
}
```

**后端处理**:
- 解析 `answer` 字段作为AI回复
- 保存 `conversation_id` 用于后续对话
- 保存 `message_id` 用于消息追踪

### 2. 获取对话历史

**后端路由**: `GET /api/ai/dify/history`

**Dify API**: `GET /messages`

**查询参数**:
- `conversation_id`: 会话ID
- `user`: 用户标识
- `limit`: 返回条数（默认20）
- `first_id`: 分页ID（可选）

**响应格式**:
```json
{
  "limit": 20,
  "has_more": false,
  "data": [
    {
      "id": "消息ID",
      "conversation_id": "会话ID",
      "query": "用户输入",
      "answer": "AI回复",
      "created_at": 1705569239,
      "message_files": [],
      "retriever_resources": [...]
    }
  ]
}
```

**后端处理**:
- 将Dify格式转换为前端需要的格式
- 合并用户消息和AI回复
- 按时间排序

### 3. 获取会话列表

**后端路由**: `GET /api/ai/dify/conversations`

**Dify API**: `GET /conversations`

**查询参数**:
- `user`: 用户标识
- `limit`: 返回条数（默认20）
- `last_id`: 分页ID（可选）

**响应格式**:
```json
{
  "limit": 20,
  "has_more": false,
  "data": [
    {
      "id": "会话ID",
      "name": "会话名称",
      "inputs": {},
      "status": "normal",
      "created_at": 1679667915,
      "updated_at": 1679667915
    }
  ]
}
```

## 实现细节

### 会话ID管理

1. **首次对话**: 不传 `conversation_id`，让Dify自动创建新会话
2. **继续对话**: 使用之前返回的 `conversation_id`
3. **会话恢复**: 从 `/conversations` 接口获取最新的会话ID

### 响应模式

- **blocking模式**（当前实现）: 等待完整结果返回，适合简单场景
- **streaming模式**（可选）: 流式返回，需要处理SSE，适合实时交互

### 错误处理

- 网络错误：返回500错误
- API错误：解析错误信息并返回
- 参数错误：返回400错误

## 前端调用示例

```javascript
// 发送消息
import { callDifyAdvisor } from '@/api/decompress'

const response = await callDifyAdvisor({
  userId: 'user_001',
  message: '我最近感到压力很大',
  emotionTags: ['压力', '焦虑'],
  emotionScore: 75,
  conversationId: '会话ID（可选）',
  responseMode: 'blocking' // 或 'streaming'
})

// 获取历史
import { getDifyHistory } from '@/api/decompress'

const history = await getDifyHistory({
  userId: 'user_001',
  conversationId: '会话ID（可选）',
  limit: 20
})

// 获取会话列表
import { getDifyConversations } from '@/api/decompress'

const conversations = await getDifyConversations({
  userId: 'user_001',
  limit: 20
})
```

## 注意事项

1. **会话持久化**: Dify会自动管理会话，通过 `conversation_id` 继续对话
2. **用户隔离**: 每个用户的会话是独立的，通过 `user` 参数区分
3. **变量传递**: 通过 `inputs` 传递App定义的变量（如情绪标签、评分）
4. **错误处理**: 确保前端有适当的错误提示和降级处理

## 测试建议

1. 测试发送消息功能
2. 测试会话持久化（多次对话）
3. 测试历史记录加载
4. 测试会话列表获取
5. 测试错误场景（服务不可用、网络错误等）

