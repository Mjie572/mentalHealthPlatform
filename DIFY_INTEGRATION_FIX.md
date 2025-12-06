# Dify API集成问题解决方案

## 问题分析

根据测试结果，Dify API集成存在以下问题：
1. Dify服务可能未正确启动
2. API调用格式需要优化
3. 情绪分析结果解析需要改进

## 解决方案

### 1. 优化API调用Prompt

**改进前**:
```javascript
const queryText = `请分析以下文本数据的情绪状态，并给出情绪标签和情绪分数：${content}`
```

**改进后**:
```javascript
const queryText = `请分析以下${dataTypeText}数据的情绪状态。

要求：
1. 情绪标签：从以下选项中选择一个（愉悦、焦虑、平静、烦躁、低落）
2. 情绪分数：0-100的整数，分数越低表示情绪越负面
3. 分析说明：简要说明情绪状态和建议

请以JSON格式返回，格式如下：
{
  "emotionTag": "情绪标签",
  "emotionScore": 情绪分数,
  "analysis": "分析说明"
}

待分析内容：${content}`
```

### 2. 改进结果解析逻辑

#### 多层级解析策略

1. **JSON格式解析**（优先）
   - 支持代码块格式：```json {...}```
   - 支持普通代码块：``` {...} ```
   - 支持直接JSON对象

2. **文本模式匹配**
   - 精确匹配：`情绪标签：愉悦`
   - 包含匹配：查找关键词

3. **分数提取**
   - 多种格式支持：`情绪分数：75`、`分数：75`、`75分`
   - JSON格式：`"emotionScore": 75`

### 3. 情绪等级判断

```javascript
// 判断严重程度
if (['低落', '焦虑', '烦躁'].includes(emotionTag)) {
  severity = 'high'
  // 负面情绪分数不应超过60
  if (emotionScore > 60) {
    emotionScore = Math.min(emotionScore, 60)
  }
} else {
  severity = 'normal'
  // 正面情绪分数不应低于60
  if (emotionScore < 50) {
    emotionScore = Math.max(emotionScore, 60)
  }
}
```

### 4. 错误处理增强

- 添加详细的日志输出
- 支持多种响应格式
- 优雅降级处理

## 测试方法

### 1. 运行完整测试

```bash
cd mental-health-backend
node test-emotion-analysis.js
```

### 2. 测试单个功能

```bash
# 测试Dify连接
node -e "const service = require('./services/emotionAnalyzeService'); service.analyzeEmotion('今天心情很好', 'text').then(r => console.log(r))"
```

### 3. 通过API测试

```bash
curl -X POST http://localhost:8000/api/ai/emotion-analyze \
  -H "Content-Type: application/json" \
  -d '{"content":"今天心情很好","dataType":"text"}'
```

## 配置检查清单

- [x] Dify API URL: `http://localhost/v1`
- [x] API密钥: `app-E60XsJdpfPZGWvb2f4rkhmTU`
- [x] 超时时间: 60秒
- [x] 响应模式: blocking
- [x] Prompt优化: 要求JSON格式返回
- [x] 解析逻辑: 多层级解析策略
- [x] 错误处理: 完善的异常处理

## 预期结果

### 成功调用时

```json
{
  "success": true,
  "emotionTag": "愉悦",
  "emotionScore": 85,
  "analysis": "检测到愉悦情绪，情绪状态良好",
  "severity": "normal",
  "conversationId": "...",
  "messageId": "..."
}
```

### 失败时

```json
{
  "success": false,
  "error": "错误信息"
}
```

## 故障排查

### 问题1: Dify服务返回404

**原因**: Dify服务未启动或URL配置错误

**解决**:
1. 确认Dify服务运行在 `http://localhost/v1`
2. 检查防火墙设置
3. 验证服务状态

### 问题2: API返回空答案

**原因**: Dify智能体配置问题或prompt不清晰

**解决**:
1. 检查Dify智能体配置
2. 优化prompt提示词
3. 查看Dify服务日志

### 问题3: 解析失败

**原因**: Dify返回格式不符合预期

**解决**:
1. 查看实际返回内容（日志中已输出）
2. 调整解析逻辑
3. 优化prompt要求结构化返回

## 下一步

1. ✅ 代码已优化
2. ⏳ 启动Dify服务
3. ⏳ 运行测试验证
4. ⏳ 根据实际返回调整解析逻辑

---

**最后更新**: 2024-12-10  
**状态**: ✅ 代码优化完成，等待Dify服务启动测试

