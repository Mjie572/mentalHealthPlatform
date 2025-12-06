# 快速启动指南

## 第一步：安装依赖

```bash
cd mental-health-frontend
npm install
```

## 第二步：启动开发服务器

```bash
npm run dev
```

项目将在 `http://localhost:51731` 启动，浏览器会自动打开。

## 第三步：选择你的模块

根据你的分工，进入对应的模块目录开始开发：

### 成员A：AI情绪监控与预警
- 进入：`src/views/EmotionMonitor/`
- 开发页面：`Collect.vue`, `Archive.vue`, `Alert.vue`
- API文件：`src/api/emotion.js`

### 成员B：多维解压服务
- 进入：`src/views/DecompressService/`
- 开发页面：`Games.vue`, `Questionnaire.vue`
- 组件：`src/components/decompress/GamePlaceholder.vue`
- API文件：`src/api/decompress.js`

### 成员C：积极情绪赋能
- 进入：`src/views/PositiveEmpowerment/`
- 开发页面：`Content.vue`, `Diary.vue`
- 组件：`src/components/positive/DiaryPlaceholder.vue`
- API文件：`src/api/positive.js`

### 成员D：个性化心理方案
- 进入：`src/views/PersonalizedPlan/`
- 开发页面：`Plan.vue`, `Report.vue`
- API文件：`src/api/personalized.js`
- 建议：使用 ECharts 或 Chart.js 进行数据可视化

### 成员E：系统集成
- 进入：`src/views/SystemIntegration/`
- 开发页面：`Assistant.vue`
- 组件：`src/components/common/BaseAssistantButton.vue`
- API文件：`src/api/system.js`

## 常用命令

```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 开发提示

1. **查看路由**: 所有路由配置在 `src/router/index.js`
2. **使用公共组件**: 在 `src/components/common/` 目录
3. **引用样式变量**: 在组件中使用 `var(--变量名)`
4. **调用API**: 使用对应模块的 API 文件中的函数

## 遇到问题？

查看 `README.md` 获取详细的使用说明和开发规范。

