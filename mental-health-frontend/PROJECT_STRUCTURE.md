# 项目结构说明

## 完整目录树

```
mental-health-frontend/
├── src/
│   ├── api/                          # API 接口文件目录
│   │   ├── request.js                # 统一请求封装（请求/响应拦截器）
│   │   ├── emotion.js                # 成员A：情绪监控模块 API
│   │   ├── decompress.js             # 解压服务模块 API
│   │   ├── positive.js               # 成员C：积极赋能模块 API
│   │   ├── personalized.js           # 成员D：个性化方案模块 API
│   │   └── system.js                 # 成员E：系统集成模块 API
│   │
│   ├── components/                    # 组件目录
│   │   ├── common/                   # 公共组件（所有模块共享）
│   │   │   ├── BaseNotificationBar.vue    # 全局通知栏
│   │   │   ├── BaseLoading.vue            # 加载组件
│   │   │   ├── BaseModal.vue              # 弹窗组件
│   │   │   └── BaseAssistantButton.vue    # 智能助手按钮（成员E开发）
│   │   ├── decompress/               # 解压服务模块组件
│   │   │   └── GamePlaceholder.vue         # 小游戏占位组件
│   │   └── positive/                 # 成员C：积极赋能模块组件
│   │       └── DiaryPlaceholder.vue        # 感恩日记占位组件
│   │
│   ├── layouts/                      # 布局组件目录
│   │   └── MainLayout.vue            # 主布局（顶部导航、侧边菜单、底部功能栏）
│   │
│   ├── router/                       # 路由配置目录
│   │   └── index.js                  # 路由表（统一管理所有路由）
│   │
│   ├── styles/                       # 样式文件目录
│   │   ├── variables.css             # 全局 CSS 变量（色彩、字号、间距等）
│   │   └── common.css                # 全局公共样式
│   │
│   ├── utils/                        # 工具函数目录
│   │   └── index.js                  # 公共工具函数（日期格式化、防抖节流等）
│   │
│   ├── views/                        # 页面目录
│   │   ├── Dashboard/                # 仪表盘
│   │   │   └── index.vue
│   │   ├── EmotionMonitor/           # 成员A：AI情绪监控与预警模块
│   │   │   ├── index.vue             # 模块首页
│   │   │   ├── Collect.vue           # 情绪采集页面
│   │   │   ├── Archive.vue           # 情绪档案可视化页面
│   │   │   └── Alert.vue             # 预警通知页面
│   │   ├── DecompressService/        # 多维解压服务模块
│   │   │   ├── index.vue             # 模块首页
│   │   │   ├── Games.vue             # 解压小游戏页面
│   │   │   └── Questionnaire.vue     # 心理健康自测页面
│   │   ├── PositiveEmpowerment/      # 成员C：积极情绪赋能模块
│   │   │   ├── index.vue             # 模块首页
│   │   │   ├── Content.vue           # 内容推送页面
│   │   │   └── Diary.vue             # 感恩日记页面
│   │   ├── PersonalizedPlan/         # 成员D：个性化心理方案与数据模块
│   │   │   ├── index.vue             # 模块首页
│   │   │   ├── Plan.vue              # 个性化方案页面
│   │   │   └── Report.vue            # 数据报告页面
│   │   └── SystemIntegration/        # 成员E：系统集成 + 界面引导智能助手模块
│   │       ├── index.vue             # 模块首页
│   │       └── Assistant.vue         # 智能助手页面
│   │
│   ├── App.vue                       # 根组件
│   └── main.js                       # 入口文件
│
├── index.html                        # HTML 模板
├── package.json                      # 项目配置文件
├── vite.config.js                    # Vite 构建配置
├── README.md                         # 使用说明文档
└── PROJECT_STRUCTURE.md              # 项目结构说明（本文件）
```

## 模块对应关系

| 模块 | 成员 | 路由前缀 | 组件前缀 | 页面目录 | API文件 |
|------|------|----------|----------|----------|---------|
| AI情绪监控与预警 | A | `/emotion` | `Emo-` | `views/EmotionMonitor/` | `api/emotion.js` |
| 多维解压服务 | B | `/decompress` | `Decom-` | `views/DecompressService/` | `api/decompress.js` |
| 积极情绪赋能 | C | `/positive` | `Posi-` | `views/PositiveEmpowerment/` | `api/positive.js` |
| 个性化心理方案 | D | `/personalized` | `Pers-` | `views/PersonalizedPlan/` | `api/personalized.js` |
| 系统集成 | E | `/system` | `Syst-` | `views/SystemIntegration/` | `api/system.js` |

## 文件命名规范

### 组件命名
- **公共组件**: `Base` + 组件名（如 `BaseButton.vue`）
- **模块组件**: 模块前缀 + 组件名
  - 情绪监控: `Emo-Collect.vue`
  - 解压服务: `Decom-GamePlaceholder.vue`
  - 积极赋能: `Posi-DiaryPlaceholder.vue`
  - 个性方案: `Pers-Report.vue`
  - 系统集成: `Syst-Assistant.vue`

### 样式文件命名
- **全局样式**: `common.css`, `variables.css`
- **模块样式**: `模块名-styles.css`（如 `emotion-styles.css`）

### API 文件命名
- **统一请求**: `request.js`
- **模块 API**: `模块名.js`（如 `emotion.js`）

## 路由结构

```
/                           # 根路径，重定向到 /dashboard
├── /dashboard              # 仪表盘
├── /emotion                # 成员A：情绪监控模块
│   ├── /emotion/collect    # 情绪采集
│   ├── /emotion/archive    # 情绪档案
│   └── /emotion/alert      # 预警通知
├── /decompress             # 成员B：解压服务模块
│   ├── /decompress/games  # 解压小游戏
│   └── /decompress/questionnaire # 心理健康自测
├── /positive               # 成员C：积极赋能模块
│   ├── /positive/content  # 内容推送
│   └── /positive/diary    # 感恩日记
├── /personalized           # 成员D：个性化方案模块
│   ├── /personalized/plan # 个性化方案
│   └── /personalized/report # 数据报告
└── /system                # 成员E：系统集成模块
    └── /system/assistant  # 智能助手
```

## 开发注意事项

1. **模块隔离**: 各模块独立开发，避免修改其他模块文件
2. **样式隔离**: 使用 Scoped CSS，避免样式冲突
3. **命名规范**: 严格遵循组件命名规范，避免命名冲突
4. **路由管理**: 新增路由必须在 `router/index.js` 中统一添加
5. **公共资源**: 禁止重复定义全局样式变量和工具函数

