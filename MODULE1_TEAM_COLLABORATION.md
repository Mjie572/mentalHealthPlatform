# 模块1：AI情绪监控与预警模块 - 团队协作说明

## 一、代码拆分点（便于5人分工合并）

### 1.1 后端代码拆分

#### 成员A负责的文件：
1. **routes/emotionRoutes.js**
   - 情绪数据提交接口（/api/emotion/submit）
   - 情绪历史查询接口（/api/emotion/history）
   - 文件位置：`mental-health-backend/routes/emotionRoutes.js`

2. **routes/aiRoutes.js**
   - Dify智能体中转接口（/api/ai/emotion-analyze）
   - 文件位置：`mental-health-backend/routes/aiRoutes.js`

3. **services/emotionAnalyzeService.js**
   - Dify情绪监控师智能体调用逻辑
   - 文件位置：`mental-health-backend/services/emotionAnalyzeService.js`

4. **services/alertService.js**
   - 情绪预警规则逻辑
   - 模块5预约接口调用
   - 文件位置：`mental-health-backend/services/alertService.js`

5. **services/emotionService.js**
   - 情绪档案存储与查询业务逻辑
   - 文件位置：`mental-health-backend/services/emotionService.js`

6. **config/GlobalConfig.js**
   - 全局共享变量定义（后端）
   - 文件位置：`mental-health-backend/config/GlobalConfig.js`

#### 其他成员需要修改的文件：
- **server.js**：已注册模块1路由，其他模块按相同方式添加
- **package.json**：已添加axios依赖，其他模块按需添加

### 1.2 前端代码拆分

#### 成员A负责的文件：
1. **api/emotion.js**
   - 情绪数据提交API
   - 情绪历史查询API
   - AI情绪分析API
   - 文件位置：`mental-health-frontend/src/api/emotion.js`

2. **views/EmotionMonitor/Collect.vue**
   - 情绪采集页面
   - 文件位置：`mental-health-frontend/src/views/EmotionMonitor/Collect.vue`

3. **views/EmotionMonitor/Archive.vue**
   - 情绪档案可视化页面
   - 文件位置：`mental-health-frontend/src/views/EmotionMonitor/Archive.vue`

4. **views/EmotionMonitor/Alert.vue**
   - 预警通知组件页面
   - 文件位置：`mental-health-frontend/src/views/EmotionMonitor/Alert.vue`

5. **utils/common.js**
   - 全局共享变量定义（前端）
   - 文件位置：`mental-health-frontend/src/utils/common.js`

## 二、合并冲突预防

### 2.1 全局变量管理
- **前端**：所有全局变量定义在 `utils/common.js`
- **后端**：所有全局变量定义在 `config/GlobalConfig.js`
- **规则**：新增全局变量必须在这两个文件中统一注册，并标注依赖关系

### 2.2 接口路径规范
- 模块1接口前缀：`/api/emotion/*` 和 `/api/ai/*`
- 其他模块按相同规范：`/api/{module-name}/*`
- 避免路径冲突

### 2.3 文件命名规范
- 后端路由：`{module}Routes.js`
- 后端服务：`{module}Service.js` 或 `{module}{Function}Service.js`
- 前端API：`{module}.js`
- 前端页面：`{ModuleName}.vue`

### 2.4 数据文件隔离
- 模块1数据文件：`data/emotions.json`
- 其他模块使用独立数据文件，避免冲突

## 三、跨模块依赖说明

### 3.1 模块1调用的外部接口

#### 用户信息接口（/api/user/info）
- **提供模块**：用户管理模块
- **调用位置**：`services/emotionService.js`（如需要）
- **状态**：已在server.js中实现占位接口
- **合并注意**：如果用户管理模块实现真实接口，需确保接口规范一致

#### 专业咨询预约接口（/api/professional/book）
- **提供模块**：模块5
- **调用位置**：`services/alertService.js` 的 `callProfessionalBooking` 函数
- **状态**：已在server.js中实现占位接口
- **合并注意**：
  1. 模块5实现真实接口后，确保接口路径和参数格式一致
  2. 如果模块5接口URL不同，需修改 `alertService.js` 中的 `module5BaseUrl`
  3. 异常处理已添加，模块5接口不可用时不影响主流程

### 3.2 模块1提供的接口（供其他模块调用）

#### 情绪历史查询接口（/api/emotion/history）
- **调用模块**：模块3（内容推荐）、模块4（报告生成）
- **接口规范**：已按统一规范实现，可直接调用
- **合并注意**：确保currentUserId正确传递，实现数据隔离

## 四、Demo版切换说明

### 4.1 切换位置
- **前端**：`utils/common.js` 中的 `systemConfig.isDemo`
- **后端**：`config/GlobalConfig.js` 中的 `systemConfig.isDemo`

### 4.2 切换步骤
1. 同时修改前端和后端的 `isDemo` 字段
2. 重启后端服务
3. 刷新前端页面
4. 测试所有接口功能

### 4.3 正式版配置
- 将 `isDemo` 设置为 `false`
- 确保Dify API密钥正确配置
- 确保模块5预约接口已实现
- 测试真实API调用

## 五、代码合并检查清单

### 5.1 合并前检查
- [ ] 所有文件命名符合规范
- [ ] 全局变量已在common.js/GlobalConfig.js中注册
- [ ] 接口路径不与其他模块冲突
- [ ] 数据文件路径不冲突
- [ ] 异常处理已添加

### 5.2 合并后测试
- [ ] 模块1所有接口正常
- [ ] 跨模块接口调用正常
- [ ] Demo版功能正常
- [ ] 前端页面正常显示
- [ ] 无控制台错误

## 六、常见问题处理

### 6.1 路由注册失败
- **问题**：`Cannot find module './routes/emotionRoutes'`
- **解决**：确保routes目录存在，文件路径正确

### 6.2 全局变量未定义
- **问题**：`currentUserId is not defined`
- **解决**：确保在文件顶部导入 `import { currentUserId } from '@/utils/common'`

### 6.3 跨模块接口调用失败
- **问题**：模块5接口返回404
- **解决**：
  1. 检查模块5接口是否已实现
  2. 检查接口路径是否正确
  3. 检查异常处理是否生效（不影响主流程）

### 6.4 Demo版数据不显示
- **问题**：前端页面显示空数据
- **解决**：
  1. 检查systemConfig.isDemo是否为true
  2. 检查API返回的msg是否包含"Demo版模拟数据"
  3. 检查前端是否正确处理Demo版数据

## 七、版本控制建议

### 7.1 Git分支策略
- 主分支：`main` 或 `master`
- 功能分支：`feature/module1-emotion-monitor`
- 合并前：确保所有测试通过

### 7.2 提交信息规范
```
feat(module1): 实现情绪数据采集接口
fix(module1): 修复情绪预警逻辑bug
docs(module1): 更新团队协作说明文档
```

## 八、联系方式

- **模块1负责人**：成员A
- **问题反馈**：通过Git Issue或团队沟通工具
- **文档更新**：合并代码时同步更新本文档

---

**最后更新**：2024-12-10  
**文档版本**：v1.0

