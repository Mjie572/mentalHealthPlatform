# 模块1：AI情绪监控与预警模块 - 快速启动指南

## 一、环境要求

- Node.js >= 14.0.0
- npm >= 6.0.0

## 二、后端启动步骤

### 1. 进入后端目录
```bash
cd mental-health-backend
```

### 2. 安装依赖
```bash
npm install
```

**注意**：如果已安装过依赖，可跳过此步骤。新增依赖包括：
- `axios` - 用于调用Dify API和模块5接口

### 3. 启动后端服务
```bash
npm start
```

### 4. 验证启动成功
看到以下输出表示启动成功：
```
Backend server running at http://localhost:8000
Module 1: Emotion Monitor routes registered at /api/emotion
Module 1: AI routes registered at /api/ai
```

### 5. 测试接口（可选）
```bash
# 测试健康检查
curl http://localhost:8000/api/health

# 测试情绪提交接口（Demo版）
curl -X POST http://localhost:8000/api/emotion/submit \
  -H "Content-Type: application/json" \
  -d '{"dataType":"text","content":"今天心情很好","timestamp":1702195200000}'
```

## 三、前端启动步骤

### 1. 进入前端目录
```bash
cd mental-health-frontend
```

### 2. 安装依赖
```bash
npm install
```

### 3. 启动开发服务器
```bash
npm run dev
```

### 4. 访问应用
浏览器打开：`http://localhost:63334`

### 5. 访问模块1页面
- 情绪采集：`http://localhost:63334/emotion/collect`
- 情绪档案：`http://localhost:63334/emotion/archive`
- 预警页面：`http://localhost:63334/emotion/alert`

## 四、功能测试清单

### ✅ 情绪数据采集
1. 打开情绪采集页面
2. 选择数据类型（文本/语音/行为）
3. 输入情绪内容
4. 点击"提交并分析情绪"
5. 查看分析结果（情绪标签、分数、AI分析）
6. 如触发预警，查看预约信息

### ✅ 情绪档案查询
1. 打开情绪档案页面
2. 查看历史记录列表
3. 使用时间范围筛选（可选）
4. 查看统计数据（总记录数、平均分数、最常见情绪）

### ✅ 预警通知
1. 打开预警页面
2. 查看预警统计
3. 查看预警列表
4. 查看预约详情（如有）

## 五、Demo版功能说明

### 当前模式
- **isDemo**: `true`（在`common.js`和`GlobalConfig.js`中配置）

### Demo版特性
1. **模拟数据**：所有接口返回模拟数据，不实际存储
2. **AI分析**：返回模拟分析结果，标注"Demo版AI分析结果"
3. **预约接口**：返回模拟预约数据，标注"Demo版模拟数据"
4. **数据隔离**：使用`demo-user`作为默认用户ID

### 切换到正式版
1. 修改`mental-health-frontend/src/utils/common.js`：
   ```javascript
   export const systemConfig = {
     debug: false,
     timeout: 5000,
     isDemo: false  // 改为false
   }
   ```

2. 修改`mental-health-backend/config/GlobalConfig.js`：
   ```javascript
   const systemConfig = {
     debug: false,
     timeout: 5000,
     isDemo: false  // 改为false
   }
   ```

3. 确保Dify API密钥正确配置（在`emotionAnalyzeService.js`中）

## 六、常见问题

### Q1: 后端启动失败，提示找不到模块
**A**: 确保已运行`npm install`安装所有依赖

### Q2: 前端无法连接后端
**A**: 
1. 检查后端是否已启动（端口8000）
2. 检查`vite.config.js`中的代理配置
3. 检查浏览器控制台错误信息

### Q3: 接口返回401未授权
**A**: Demo版允许无token访问，如仍报错，检查：
1. `server.js`中的`authenticateToken`中间件是否正确配置
2. 请求头是否包含正确的Authorization格式

### Q4: 情绪数据未保存
**A**: Demo版不实际保存数据，但会返回模拟数据。切换到正式版后才会真实保存。

### Q5: 预警未触发
**A**: 预警触发条件：
- emotionTag为"低落"、"焦虑"或"烦躁"
- 且emotionScore < 60

确保满足以上条件。

## 七、文件结构检查

### 后端文件（必须存在）
```
mental-health-backend/
├── config/
│   └── GlobalConfig.js          ✅
├── routes/
│   ├── emotionRoutes.js        ✅
│   └── aiRoutes.js             ✅
├── services/
│   ├── emotionService.js       ✅
│   ├── emotionAnalyzeService.js ✅
│   └── alertService.js         ✅
├── data/
│   └── emotions.json           ✅ (自动创建)
├── server.js                   ✅
└── package.json                ✅
```

### 前端文件（必须存在）
```
mental-health-frontend/
├── src/
│   ├── api/
│   │   └── emotion.js          ✅
│   ├── utils/
│   │   └── common.js           ✅
│   └── views/
│       └── EmotionMonitor/
│           ├── Collect.vue     ✅
│           ├── Archive.vue     ✅
│           └── Alert.vue       ✅
```

## 八、接口测试示例

### 1. 情绪数据提交
```bash
curl -X POST http://localhost:8000/api/emotion/submit \
  -H "Content-Type: application/json" \
  -H "X-User-Id: test-user-123" \
  -d '{
    "dataType": "text",
    "content": "今天心情很低落，工作压力很大",
    "timestamp": 1702195200000
  }'
```

### 2. 情绪历史查询
```bash
curl "http://localhost:8000/api/emotion/history?startTime=1702108800000&endTime=1702195200000" \
  -H "X-User-Id: test-user-123"
```

### 3. AI情绪分析
```bash
curl -X POST http://localhost:8000/api/ai/emotion-analyze \
  -H "Content-Type: application/json" \
  -d '{
    "content": "最近总是焦虑不安",
    "dataType": "text"
  }'
```

## 九、开发调试

### 后端调试
1. 查看控制台输出
2. 检查`data/emotions.json`文件（正式版）
3. 使用Postman或curl测试接口

### 前端调试
1. 打开浏览器开发者工具（F12）
2. 查看Network标签页的API请求
3. 查看Console标签页的错误信息
4. 检查Vue DevTools（如已安装）

## 十、下一步

1. ✅ 完成模块1开发（已完成）
2. ⏳ 等待模块5实现正式版预约接口
3. ⏳ 模块3/模块4调用情绪历史接口
4. ⏳ 切换到正式版并接入真实Dify API

---

**快速启动完成！如有问题，请参考详细文档：**
- `MODULE1_DEVELOPMENT_SUMMARY.md` - 开发总结
- `MODULE1_TEST_REPORT.md` - 自测报告
