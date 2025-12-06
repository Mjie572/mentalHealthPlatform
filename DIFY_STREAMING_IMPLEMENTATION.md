# Dify 对话型 API Streaming 流式模式实现说明

## 核心配置

1. **Dify API 基础地址**: `http://localhost/v1`
2. **API 密钥**: `app-8nHR8v6mryIQM4eBmc8Od9V1`
3. **鉴权方式**: 所有请求在 HTTP Header 中携带 `Authorization: Bearer app-8nHR8v6mryIQM4eBmc8Od9V1`

## 功能实现

### 1. 发送对话消息（Streaming流式模式）

#### 后端实现 (`server.js`)

**接口路径**: `POST /api/ai/dify/chat`

**关键实现点**:

1. **请求格式**:
   ```javascript
   {
     query: "用户咨询内容",  // 必填
     inputs: {
       userId: "用户ID",
       emotionTags: ["情绪标签"],
       emotionScore: 75
     },
     response_mode: "streaming",  // 必须使用streaming模式
     user: "用户唯一标识",  // 必填
     conversation_id: "会话ID"  // 可选，用于会话持久化
   }
   ```

2. **鉴权头**: 
   ```javascript
   headers: {
     'Authorization': `Bearer ${AGENT_API_KEY}`,  // 正确格式
     'Content-Type': 'application/json'
   }
   ```

3. **SSE响应处理**:
   - 设置响应头: `Content-Type: text/event-stream`
   - 解析SSE格式: 每行以 `data: ` 开头
   - 处理不同事件类型:
     - `message` / `agent_message`: 拼接 `answer` 字段
     - `message_end`: 结束流，保存完整回复
     - `error`: 捕获异常并返回友好提示
     - `ping`: 保持连接

4. **超时处理**: 30秒超时机制

#### 前端实现 (`Advisor.vue` + `decompress.js`)

**关键实现点**:

1. **流式响应处理**:
   ```javascript
   callDifyAdvisor(data, onMessage, onError, onEnd)
   ```
   - `onMessage`: 实时接收消息块，更新UI
   - `onError`: 错误处理
   - `onEnd`: 消息结束，保存会话ID

2. **实时UI更新**:
   - 使用占位符消息，实时更新内容
   - 显示打字光标动画
   - 自动滚动到底部

### 2. 会话持久化

#### 会话ID存储

1. **首次对话**:
   - 不传递 `conversation_id`
   - 从Dify返回的 `message_end` 事件中提取 `conversation_id`
   - 保存到 `localStorage`: `dify_conversation_{userId}`

2. **后续对话**:
   - 从 `localStorage` 读取会话ID
   - 在请求中携带 `conversation_id`
   - 实现会话上下文连续性

3. **新建会话**:
   - 清除 `localStorage` 中的会话ID
   - 下次请求不传递 `conversation_id`，创建新会话

#### 代码位置

- **后端**: `server.js` - `userConversationIds` 对象管理
- **前端**: `Advisor.vue` - `currentConversationId` ref + `localStorage`

### 3. 异常处理

#### 错误码处理

- **400**: 请求参数错误 → "请求参数错误，请检查输入"
- **404**: 对话不存在 → "对话不存在或已过期"
- **500**: 服务内部错误 → "服务内部错误，请稍后重试"
- **其他**: 网络错误 → "咨询服务暂不可用"

#### 流式连接中断

- 超时处理: 30秒超时自动取消
- 连接中断: 捕获异常并显示友好提示
- 错误事件: 解析Dify返回的 `error` 事件

## 关键步骤说明

### 1. 会话ID存储

**后端**:
```javascript
// 从返回结果中提取conversation_id
if (eventData.conversation_id) {
  finalConversationId = eventData.conversation_id;
  userConversationIds[userId] = finalConversationId;
}
```

**前端**:
```javascript
// 保存到localStorage
if (result.conversationId) {
  currentConversationId.value = result.conversationId;
  localStorage.setItem(`dify_conversation_${currentUserId.value}`, result.conversationId);
}

// 从localStorage恢复
const savedConversationId = localStorage.getItem(`dify_conversation_${currentUserId.value}`);
if (savedConversationId) {
  currentConversationId.value = savedConversationId;
}
```

### 2. 流式响应解析

**后端SSE解析**:
```javascript
// 处理 data: {...} 格式
if (line.startsWith('data: ')) {
  const jsonStr = line.substring(6); // 去掉 "data: " 前缀
  const eventData = JSON.parse(jsonStr);
  
  if (eventData.event === 'message' || eventData.event === 'agent_message') {
    fullAnswer += eventData.answer;  // 拼接answer
    // 实时转发给前端
    res.write(`data: ${JSON.stringify({...})}\n\n`);
  }
}
```

**前端SSE处理**:
```javascript
// 使用fetch处理流式响应
const reader = response.body.getReader();
const decoder = new TextDecoder();

reader.read().then(({ done, value }) => {
  buffer += decoder.decode(value, { stream: true });
  // 解析SSE格式并调用回调
});
```

### 3. 鉴权配置

**后端**:
```javascript
headers: {
  'Authorization': `Bearer ${AGENT_API_KEY}`,  // ✅ 正确格式
  'Content-Type': 'application/json'
}
```

**注意**: 
- ❌ 不要使用 `X-API-Key`
- ✅ 必须使用 `Authorization: Bearer {API_KEY}`

## 需要替换的自定义逻辑

### 1. 用户标识生成

**当前实现**: 使用 `currentUserId`（来自全局状态）

**如需自定义**:
```javascript
// 在 Advisor.vue 中
const userId = currentUserId.value || generateUUID();
```

### 2. 上下文存储

**当前实现**: 
- 后端: 内存存储 (`difyConversations`)
- 前端: `localStorage` 存储会话ID

**如需持久化**:
- 后端: 可替换为数据库存储
- 前端: 可替换为 IndexedDB 或其他存储方案

### 3. 错误处理策略

**当前实现**: 显示友好提示，允许重试

**可自定义**:
- 添加重试机制
- 记录错误日志
- 发送错误报告

## 测试要点

1. ✅ 验证鉴权头格式正确
2. ✅ 验证请求体包含必填项（query, user, response_mode）
3. ✅ 验证SSE流式响应解析正确
4. ✅ 验证会话ID存储和恢复
5. ✅ 验证错误处理和超时机制
6. ✅ 验证流式UI更新实时性

## 注意事项

1. **Agent模式必须使用streaming**: Dify Agent模式不支持blocking模式
2. **SSE格式**: 每行必须以 `data: ` 开头，块之间以 `\n\n` 分隔
3. **会话ID管理**: 首次对话不传conversation_id，后续必须传递
4. **超时设置**: 建议30秒，可根据实际情况调整
5. **错误处理**: 所有错误都应返回友好提示，避免暴露技术细节

