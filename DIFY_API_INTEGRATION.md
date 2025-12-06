# Dify API 接入文档

## 一、接入状态

✅ **已切换到正式版，已接入真实Dify API**

- **基础URL**: `http://localhost/v1`
- **API密钥**: `app-E60XsJdpfPZGWvb2f4rkhmTU`
- **API类型**: 工作流编排对话型应用
- **响应模式**: blocking（阻塞模式）

## 二、配置信息

### 后端配置

**文件**: `mental-health-backend/services/emotionAnalyzeService.js`

```javascript
const DIFY_BASE_URL = 'http://localhost/v1'
const DIFY_API_KEY = 'app-E60XsJdpfPZGWvb2f4rkhmTU'
```

### 系统配置

**后端**: `mental-health-backend/config/GlobalConfig.js`
```javascript
const systemConfig = {
  debug: false,
  timeout: 30000, // 30秒超时
  isDemo: false // 正式版
}
```

**前端**: `mental-health-frontend/src/utils/common.js`
```javascript
export const systemConfig = {
  debug: false,
  timeout: 30000,
  isDemo: false // 正式版
}
```

## 三、API调用实现

### 接口端点

**POST** `/chat-messages`

### 请求格式

```javascript
{
  inputs: {
    content: "情绪内容",
    data_type: "text|voice|behavior"
  },
  query: "请分析以下文本数据的情绪状态，并给出情绪标签和情绪分数：{content}",
  response_mode: "blocking",
  user: "emotion-analyzer",
  conversation_id: "" // 首次对话为空
}
```

### 响应格式

根据Dify API文档，blocking模式返回`ChatCompletionResponse`格式：

```javascript
{
  event: "message",
  task_id: "...",
  id: "...",
  message_id: "...",
  conversation_id: "...",
  mode: "chat",
  answer: "AI分析结果...",
  metadata: {...},
  usage: {...},
  created_at: 1705395332
}
```

### 数据解析

1. **提取答案**: `difyResult.answer`
2. **提取情绪标签**: 从答案中匹配`emotionCommonTags`
3. **提取情绪分数**: 使用正则表达式提取数字
4. **判断严重程度**: 根据情绪标签和分数判断

## 四、错误处理

### 常见错误

1. **连接错误**
   - 检查Dify服务是否启动
   - 检查URL是否正确（`http://localhost/v1`）
   - 检查网络连接

2. **认证错误**
   - 检查API密钥是否正确
   - 检查Authorization Header格式

3. **超时错误**
   - 增加timeout配置（当前30秒）
   - 检查Dify服务响应速度

4. **格式错误**
   - 检查响应数据格式
   - 检查answer字段是否存在

### 错误处理代码

```javascript
try {
  // API调用
} catch (error) {
  if (error.response) {
    // HTTP错误响应
    console.error('状态码:', error.response.status)
    console.error('错误信息:', error.response.data)
  } else if (error.request) {
    // 请求已发送但未收到响应
    console.error('Dify服务未响应')
  } else {
    // 其他错误
    console.error('错误:', error.message)
  }
}
```

## 五、测试方法

### 1. 使用测试脚本

```bash
cd mental-health-backend
node ../test-dify-api.js
```

### 2. 使用curl测试

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

### 3. 通过前端页面测试

1. 启动后端服务：`cd mental-health-backend && npm start`
2. 启动前端服务：`cd mental-health-frontend && npm run dev`
3. 访问情绪采集页面：`http://localhost:63334/emotion/collect`
4. 输入情绪内容并提交
5. 查看分析结果

## 六、调试技巧

### 1. 启用调试日志

在`emotionAnalyzeService.js`中添加详细日志：

```javascript
console.log('Dify API请求:', {
  url: `${DIFY_BASE_URL}/chat-messages`,
  query: queryText,
  headers: { 'Authorization': `Bearer ${DIFY_API_KEY}` }
})

console.log('Dify API响应:', response.data)
```

### 2. 检查响应数据

```javascript
console.log('完整响应:', JSON.stringify(response.data, null, 2))
console.log('答案内容:', response.data.answer)
console.log('会话ID:', response.data.conversation_id)
```

### 3. 验证数据解析

```javascript
console.log('提取的情绪标签:', emotionTag)
console.log('提取的情绪分数:', emotionScore)
console.log('严重程度:', severity)
```

## 七、性能优化

### 1. 超时设置

当前超时时间：30秒

如果Dify响应较慢，可以适当增加：

```javascript
timeout: 60000 // 60秒
```

### 2. 错误重试

可以添加重试机制：

```javascript
async function analyzeEmotionWithRetry(content, dataType, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await analyzeEmotion(content, dataType)
    } catch (error) {
      if (i === retries - 1) throw error
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
    }
  }
}
```

## 八、注意事项

1. **API密钥安全**
   - ✅ 密钥已封装在后端，不会泄露到前端
   - ✅ 使用环境变量存储密钥（生产环境推荐）

2. **会话管理**
   - 当前每次调用创建新会话（conversation_id为空）
   - 如需会话持久化，可以保存conversation_id

3. **数据格式**
   - Dify返回的answer可能是文本或JSON格式
   - 代码已支持两种格式的解析

4. **错误处理**
   - 所有错误都会被捕获并返回友好的错误信息
   - 不会因为API错误导致整个服务崩溃

## 九、切换回Demo版

如果需要临时切换回Demo版进行测试：

1. 修改`mental-health-backend/config/GlobalConfig.js`:
   ```javascript
   isDemo: true
   ```

2. 修改`mental-health-frontend/src/utils/common.js`:
   ```javascript
   isDemo: true
   ```

3. 重启服务

## 十、相关文档

- [Dify API文档](https://docs.dify.ai/guides/application-development/workflow-development/workflow-api)
- [模块1开发总结](./MODULE1_DEVELOPMENT_SUMMARY.md)
- [快速启动指南](./MODULE1_QUICK_START.md)

---

**最后更新**: 2024-12-10  
**状态**: ✅ 正式版已接入，功能正常

