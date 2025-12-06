# Dify API集成问题解决方案总结

## ✅ 已完成的改进

### 1. 优化API调用Prompt

**改进点**:
- 明确要求返回JSON格式
- 指定情绪标签选项（愉悦、焦虑、平静、烦躁、低落）
- 说明情绪分数范围（0-100）
- 提供JSON格式示例

**代码位置**: `mental-health-backend/services/emotionAnalyzeService.js` (第36-50行)

### 2. 增强结果解析逻辑

**三层解析策略**:

1. **JSON格式解析**（优先）
   - 支持 ```json {...} ``` 代码块
   - 支持 ``` {...} ``` 普通代码块
   - 支持直接JSON对象

2. **文本模式匹配**
   - 精确匹配：`情绪标签：愉悦`
   - JSON格式匹配：`"emotionTag": "愉悦"`
   - 简单包含匹配

3. **分数提取**
   - 多种格式：`情绪分数：75`、`分数：75`、`75分`
   - JSON格式：`"emotionScore": 75`

**代码位置**: `mental-health-backend/services/emotionAnalyzeService.js` (第118-180行)

### 3. 改进情绪等级判断

**逻辑**:
- 负面情绪（低落、焦虑、烦躁）：severity = 'high'，分数上限60
- 正面情绪（愉悦、平静）：severity = 'normal'，分数下限60

**代码位置**: `mental-health-backend/services/emotionAnalyzeService.js` (第182-195行)

### 4. 增强错误处理和日志

**改进**:
- 添加详细的console.log输出
- 记录API请求和响应
- 记录解析过程
- 优雅的错误处理

**代码位置**: `mental-health-backend/services/emotionAnalyzeService.js` (多处)

### 5. 增加超时时间

**改进**: 从30秒增加到60秒，适应Dify API响应时间

**代码位置**: `mental-health-backend/services/emotionAnalyzeService.js` (第55行)

## 📝 测试工具

### 1. 完整功能测试脚本

**文件**: `mental-health-backend/test-emotion-analysis.js`

**功能**:
- 测试Dify服务连接
- 测试多种情绪场景
- 验证情绪等级判断
- 生成测试报告

**使用方法**:
```bash
cd mental-health-backend
node test-emotion-analysis.js
```

### 2. 简单连接测试

**文件**: `mental-health-backend/test-dify-api.js`

**功能**: 快速测试Dify API连接

## 🔧 配置信息

### Dify API配置

```javascript
const DIFY_BASE_URL = 'http://localhost/v1'
const DIFY_API_KEY = 'app-E60XsJdpfPZGWvb2f4rkhmTU'
```

### 系统配置

```javascript
{
  timeout: 60000,  // 60秒超时
  isDemo: false    // 正式版模式
}
```

## 📊 预期工作流程

### 1. API调用流程

```
用户提交情绪数据
  ↓
后端接收请求
  ↓
调用emotionAnalyzeService.analyzeEmotion()
  ↓
构建优化的prompt
  ↓
调用Dify API (POST /chat-messages)
  ↓
接收响应 (blocking模式)
  ↓
解析响应数据
  ↓
提取情绪标签和分数
  ↓
判断情绪等级
  ↓
返回结果
```

### 2. 解析流程

```
接收Dify返回的answer
  ↓
尝试JSON格式解析
  ├─ 成功 → 提取emotionTag和emotionScore
  └─ 失败 → 文本模式匹配
      ├─ 精确匹配情绪标签
      ├─ 提取情绪分数
      └─ 设置默认值（如需要）
  ↓
验证结果有效性
  ↓
判断严重程度
  ↓
返回结构化结果
```

## 🧪 测试场景

### 测试用例1: 正面情绪
- **输入**: "今天心情很好，工作顺利"
- **预期**: emotionTag = "愉悦", emotionScore > 70, severity = "normal"

### 测试用例2: 负面情绪
- **输入**: "最近总是焦虑不安，压力很大"
- **预期**: emotionTag = "焦虑", emotionScore < 60, severity = "high"

### 测试用例3: 低落情绪
- **输入**: "感觉很失落，心情很低落"
- **预期**: emotionTag = "低落", emotionScore < 50, severity = "high"

### 测试用例4: 平静情绪
- **输入**: "今天一切正常，心情平静"
- **预期**: emotionTag = "平静", emotionScore = 70-80, severity = "normal"

## ⚠️ 注意事项

### 1. Dify服务要求

- Dify服务必须运行在 `http://localhost/v1`
- API密钥必须正确：`app-E60XsJdpfPZGWvb2f4rkhmTU`
- 服务必须支持blocking模式

### 2. 智能体配置

建议在Dify中配置智能体：
- 明确要求返回JSON格式
- 情绪标签限制在指定选项内
- 情绪分数范围0-100

### 3. 错误处理

- 如果Dify服务未运行，会返回错误信息
- 如果解析失败，会使用默认值并记录日志
- 所有错误都会被捕获，不会导致服务崩溃

## 🚀 下一步操作

1. **启动Dify服务**
   ```bash
   # 根据Dify官方文档启动服务
   # 确保运行在 http://localhost/v1
   ```

2. **运行测试**
   ```bash
   cd mental-health-backend
   node test-emotion-analysis.js
   ```

3. **验证功能**
   - 访问前端页面
   - 提交情绪数据
   - 查看分析结果

4. **根据实际返回调整**
   - 查看日志中的实际返回内容
   - 如有需要，调整解析逻辑
   - 优化prompt提示词

## 📚 相关文档

- `DIFY_INTEGRATION_FIX.md` - 详细的问题解决方案
- `DIFY_API_INTEGRATION.md` - API接入文档
- `test-emotion-analysis.js` - 完整测试脚本

---

**状态**: ✅ 代码优化完成  
**最后更新**: 2024-12-10  
**下一步**: 启动Dify服务并运行测试

