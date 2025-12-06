# 模块1：AI情绪监控与预警模块

## 📋 模块概述

模块1是心理健康智能平台的核心模块之一，负责情绪数据的采集、AI分析、预警和档案管理。本模块严格遵循全局共享规范、跨模块接口标准及Demo版扩展规则，适配5人团队分工协作模式。

## 🎯 核心功能

1. **情绪数据采集**：支持text/voice/behavior三类数据类型
2. **AI情绪分析**：通过Dify情绪监控师智能体进行情绪分析
3. **情绪预警**：重度情绪自动触发专业咨询预约
4. **情绪档案**：存储和查询用户情绪历史数据

## 📁 文件结构

```
模块1文件结构
├── 后端文件（Node.js + Express）
│   ├── config/
│   │   └── GlobalConfig.js          # 全局共享变量定义
│   ├── routes/
│   │   ├── emotionRoutes.js         # 情绪数据路由
│   │   └── aiRoutes.js               # AI智能体中转路由
│   ├── services/
│   │   ├── emotionService.js        # 情绪数据服务
│   │   ├── emotionAnalyzeService.js # Dify智能体分析服务
│   │   └── alertService.js          # 预警逻辑服务
│   └── data/
│       └── emotions.json             # 情绪数据存储（自动创建）
│
└── 前端文件（Vue 3）
    ├── src/
    │   ├── api/
    │   │   └── emotion.js            # 情绪相关API调用
    │   ├── utils/
    │   │   └── common.js             # 全局共享变量定义
    │   └── views/
    │       └── EmotionMonitor/
    │           ├── Collect.vue       # 情绪采集页面
    │           ├── Archive.vue       # 情绪档案页面
    │           └── Alert.vue         # 预警页面
```

## 🚀 快速开始

### 1. 后端启动

```bash
cd mental-health-backend
npm install
npm start
```

后端服务将在 `http://localhost:8000` 启动

### 2. 前端启动

```bash
cd mental-health-frontend
npm install
npm run dev
```

前端应用将在 `http://localhost:63334` 启动

### 3. 访问模块1页面

- 情绪采集：`http://localhost:63334/emotion/collect`
- 情绪档案：`http://localhost:63334/emotion/archive`
- 预警页面：`http://localhost:63334/emotion/alert`

详细启动指南请参考：[MODULE1_QUICK_START.md](./MODULE1_QUICK_START.md)

## 🔌 核心接口

### 模块1提供的接口

#### 1. 情绪数据提交
```http
POST /api/emotion/submit
Content-Type: application/json

{
  "dataType": "text|voice|behavior",
  "content": "情绪内容",
  "timestamp": 1702195200000
}
```

#### 2. 情绪历史查询
```http
GET /api/emotion/history?startTime=1702108800000&endTime=1702195200000
```

#### 3. AI情绪分析（中转）
```http
POST /api/ai/emotion-analyze
Content-Type: application/json

{
  "content": "情绪内容",
  "dataType": "text|voice|behavior"
}
```

### 模块1调用的外部接口

#### 1. 用户信息接口
```http
GET /api/user/info?userId=xxx
```

#### 2. 专业咨询预约接口（模块5）
```http
POST /api/professional/book
Content-Type: application/json

{
  "consultantId": "C001",
  "emotionTag": "低落",
  "timeSlot": "2024-12-10 14:00-15:00"
}
```

## 📚 全局变量规范

### 前端（common.js）
- `currentUserId`：当前用户ID
- `userRole`：用户角色
- `systemConfig`：系统配置（含isDemo开关）
- `emotionCommonTags`：统一情绪分类标准
- `demoConsultantList`：模拟咨询师列表（Demo专用）
- `demoAppointmentStatus`：预约状态枚举（Demo专用）

### 后端（GlobalConfig.js）
- 所有前端变量在后端均有对应定义
- 错误码统一维护：`ErrorCode.DEMO_NOT_SUPPORTED = 1001`

详细规范请参考：[MODULE1_DEVELOPMENT_SUMMARY.md](./MODULE1_DEVELOPMENT_SUMMARY.md)

## 🎨 Demo版功能

当前版本为Demo版（`isDemo: true`），具有以下特性：

1. **模拟数据**：所有接口返回模拟数据，不实际存储
2. **AI分析**：返回模拟分析结果，标注"Demo版AI分析结果"
3. **预约接口**：返回模拟预约数据，标注"Demo版模拟数据"
4. **数据隔离**：使用`demo-user`作为默认用户ID

切换到正式版：修改`common.js`和`GlobalConfig.js`中的`isDemo`为`false`

## 👥 团队协作

### 成员A负责
- 模块1所有核心功能开发
- 情绪数据采集、AI分析、预警逻辑
- 前端页面实现

### 其他成员协作点
- **模块5**：需要实现`/api/professional/book`接口的正式版逻辑
- **模块3/模块4**：可以调用`/api/emotion/history`获取情绪数据

详细分工请参考：[MODULE1_DEVELOPMENT_SUMMARY.md](./MODULE1_DEVELOPMENT_SUMMARY.md)

## 📖 文档索引

- [快速启动指南](./MODULE1_QUICK_START.md) - 环境配置和启动步骤
- [开发总结](./MODULE1_DEVELOPMENT_SUMMARY.md) - 详细开发文档
- [自测报告](./MODULE1_TEST_REPORT.md) - 完整测试报告
- [完成检查清单](./MODULE1_CHECKLIST.md) - 功能完成度检查

## ✅ 测试结果

- **测试通过率**：100%（20/20个测试场景）
- **功能完整性**：100%
- **代码质量**：无linter错误
- **无未完成项**

详细测试报告请参考：[MODULE1_TEST_REPORT.md](./MODULE1_TEST_REPORT.md)

## 🔧 技术栈

### 后端
- Node.js + Express
- JWT认证
- 文件存储（JSON）

### 前端
- Vue 3
- Vue Router
- Axios

### AI服务
- Dify情绪监控师智能体
- API密钥：`app-E60XsJdpfPZGWvb2f4rkhmTU`

## 📝 开发规范

1. **文件命名**：按功能拆分，命名规范统一
2. **代码注释**：完整标注成员负责和功能说明
3. **错误处理**：完善的异常处理和错误码
4. **Demo版规则**：通过isDemo开关控制模拟/正式逻辑

## 🐛 常见问题

### Q: 后端启动失败
**A**: 确保已运行`npm install`安装所有依赖

### Q: 前端无法连接后端
**A**: 检查后端是否已启动（端口8000），检查vite.config.js中的代理配置

### Q: 接口返回401未授权
**A**: Demo版允许无token访问，如仍报错，检查server.js中的认证中间件

### Q: 情绪数据未保存
**A**: Demo版不实际保存数据，但会返回模拟数据。切换到正式版后才会真实保存。

更多问题请参考：[MODULE1_QUICK_START.md](./MODULE1_QUICK_START.md)

## 📅 版本信息

- **版本**：v1.0
- **开发完成时间**：2024-12-10
- **开发人员**：成员A
- **状态**：✅ 已完成并交付

## 📞 联系方式

如有问题或需要协助，请联系模块1开发负责人：成员A

---

**✅ 模块1开发完成，所有功能已实现并通过自测，可以交付使用！**

