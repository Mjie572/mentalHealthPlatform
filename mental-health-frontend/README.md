# 心理健康智能平台 - 前端 UI 框架

## 项目简介

本项目是基于 Vue 3 + Vite 开发的心理健康智能平台前端 UI 框架，为 5 人分工团队提供统一、可扩展的基础架构，方便各成员在对应模块内独立开发，减少后续代码合并冲突。

## 技术栈

- **框架**: Vue 3 (Composition API)
- **构建工具**: Vite
- **路由**: Vue Router 4
- **HTTP 客户端**: Axios
- **样式**: CSS Variables + Scoped CSS

## 项目结构

```
mental-health-frontend/
├── src/
│   ├── api/                    # API 接口文件
│   │   ├── request.js          # 统一请求封装
│   │   ├── emotion.js          # 成员A：情绪监控模块 API
│   │   ├── decompress.js       # 成员B：解压服务模块 API
│   │   ├── positive.js         # 成员C：积极赋能模块 API
│   │   ├── personalized.js     # 成员D：个性化方案模块 API
│   │   └── system.js           # 成员E：系统集成模块 API
│   ├── components/             # 组件目录
│   │   ├── common/             # 公共组件（所有模块共享）
│   │   │   ├── BaseNotificationBar.vue    # 全局通知栏
│   │   │   ├── BaseLoading.vue           # 加载组件
│   │   │   ├── BaseModal.vue              # 弹窗组件
│   │   │   └── BaseAssistantButton.vue    # 智能助手按钮（成员E开发）
│   │   ├── decompress/         # 成员B：解压服务模块组件
│   │   │   └── GamePlaceholder.vue        # 小游戏占位组件
│   │   └── positive/           # 成员C：积极赋能模块组件
│   │       └── DiaryPlaceholder.vue       # 感恩日记占位组件
│   ├── layouts/                # 布局组件
│   │   └── MainLayout.vue     # 主布局（顶部导航、侧边菜单、底部功能栏）
│   ├── router/                 # 路由配置
│   │   └── index.js            # 路由表（统一管理）
│   ├── styles/                 # 样式文件
│   │   ├── variables.css       # 全局 CSS 变量（色彩、字号、间距等）
│   │   └── common.css          # 全局公共样式
│   ├── utils/                  # 工具函数
│   │   └── index.js            # 公共工具函数（日期格式化、防抖节流等）
│   ├── views/                  # 页面目录
│   │   ├── Dashboard/          # 仪表盘
│   │   ├── EmotionMonitor/     # 成员A：AI情绪监控与预警模块
│   │   ├── DecompressService/  # 成员B：多维解压服务模块
│   │   ├── PositiveEmpowerment/# 成员C：积极情绪赋能模块
│   │   ├── PersonalizedPlan/   # 成员D：个性化心理方案与数据模块
│   │   └── SystemIntegration/  # 成员E：系统集成 + 界面引导智能助手模块
│   ├── App.vue                 # 根组件
│   └── main.js                 # 入口文件
├── index.html                  # HTML 模板
├── package.json                # 项目配置
├── vite.config.js             # Vite 配置
└── README.md                  # 使用说明文档
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

项目将在 `http://localhost:51731` 启动

### 构建生产版本

```bash
npm run build
```

## 模块分工

### 成员A：AI情绪监控与预警模块

- **路由前缀**: `/emotion`
- **组件命名**: `Emo-xxx.vue`（如 `Emo-Collect.vue`）
- **API 文件**: `api/emotion.js`
- **样式文件**: `emotion-styles.css`（模块内样式隔离）
- **页面位置**: `views/EmotionMonitor/`
- **核心功能**:
  - 情绪采集入口 (`/emotion/collect`)
  - 情绪档案可视化 (`/emotion/archive`)
  - 预警通知组件 (`/emotion/alert`)

### 成员B：多维解压服务模块

- **路由前缀**: `/decompress`
- **组件命名**: `Decom-xxx.vue`（如 `Decom-GamePlaceholder.vue`）
- **API 文件**: `api/decompress.js`
- **样式文件**: `decompress-styles.css`（模块内样式隔离）
- **页面位置**: `views/DecompressService/`
- **组件位置**: `components/decompress/`
- **核心功能**:
  - 解压小游戏 (`/decompress/games`)
  - 解压题库 (`/decompress/questionnaire`)

### 成员C：积极情绪赋能模块

- **路由前缀**: `/positive`
- **组件命名**: `Posi-xxx.vue`（如 `Posi-DiaryPlaceholder.vue`）
- **API 文件**: `api/positive.js`
- **样式文件**: `positive-styles.css`（模块内样式隔离）
- **页面位置**: `views/PositiveEmpowerment/`
- **组件位置**: `components/positive/`
- **核心功能**:
  - 内容推送 (`/positive/content`)
  - 感恩日记 (`/positive/diary`)

### 成员D：个性化心理方案与数据模块

- **路由前缀**: `/personalized`
- **组件命名**: `Pers-xxx.vue`（如 `Pers-Report.vue`）
- **API 文件**: `api/personalized.js`
- **样式文件**: `personalized-styles.css`（模块内样式隔离）
- **页面位置**: `views/PersonalizedPlan/`
- **核心功能**:
  - 个性化方案 (`/personalized/plan`)
  - 数据报告 (`/personalized/report`)
- **建议**: 使用 ECharts 或 Chart.js 进行数据可视化

### 成员E：系统集成 + 界面引导智能助手模块

- **路由前缀**: `/system`
- **组件命名**: `Syst-xxx.vue`（如 `Syst-Assistant.vue`）
- **API 文件**: `api/system.js`
- **样式文件**: `system-styles.css`（模块内样式隔离）
- **页面位置**: `views/SystemIntegration/`
- **智能助手按钮**: `components/common/BaseAssistantButton.vue`
- **核心功能**:
  - 界面引导智能助手 (`/system/assistant`)
  - 系统集成管理

## 开发规范

### 1. 组件命名规范

- **公共组件**: 统一使用 `Base` 前缀（如 `BaseButton.vue`、`BaseModal.vue`）
- **模块私有组件**: 使用模块缩写前缀
  - 情绪监控: `Emo-xxx.vue`
  - 解压服务: `Decom-xxx.vue`
  - 积极赋能: `Posi-xxx.vue`
  - 个性方案: `Pers-xxx.vue`
  - 系统集成: `Syst-xxx.vue`

### 2. 样式隔离

- **全局样式**: 仅放在 `styles/common.css`
- **CSS 变量**: 统一在 `styles/variables.css` 定义
- **模块样式**: 使用 Scoped CSS，样式文件命名 `模块名-styles.css`
- **禁止**: 模块内重复定义全局样式变量

### 3. 路由扩展

路由表统一在 `router/index.js` 管理。成员开发子页面时：

1. 在对应模块路由下扩展，无需修改全局路由结构
2. 路由路径遵循 `/模块前缀/子页面` 规则
3. 示例：在情绪监控模块下添加新页面

```javascript
{
  path: 'emotion/new-page',  // 注意：不需要加前导斜杠
  name: 'EmotionNewPage',
  component: () => import('@/views/EmotionMonitor/NewPage.vue')
}
```

### 4. API 接口调用

#### 统一请求封装

所有 API 请求必须通过 `api/request.js` 封装的 axios 实例：

```javascript
import request from '@/api/request'

// GET 请求
const data = await request({
  url: '/api/endpoint',
  method: 'get',
  params: { id: 1 }
})

// POST 请求
const result = await request({
  url: '/api/endpoint',
  method: 'post',
  data: { name: 'test' }
})
```

#### 模块 API 文件

各模块的接口文件放在 `api/` 目录，命名规则：`模块名.js`

```javascript
// api/emotion.js
import request from './request'

export const collectEmotion = (data) => {
  return request({
    url: '/emotion/collect',
    method: 'post',
    data
  })
}
```

#### 在组件中使用

```vue
<script setup>
import { collectEmotion } from '@/api/emotion'

const handleSubmit = async () => {
  try {
    const result = await collectEmotion({ mood: 'happy', score: 8 })
    console.log(result)
  } catch (error) {
    console.error(error)
  }
}
</script>
```

### 5. 公共依赖引用

#### CSS 变量

所有模块必须引用全局 CSS 变量：

```vue
<style scoped>
/* 在组件中直接使用 CSS 变量 */
.my-component {
  color: var(--text-primary);
  background: var(--bg-color);
  padding: var(--spacing-md);
  border-radius: var(--border-radius-md);
}
</style>
```

#### 工具函数

使用公共工具函数，禁止重复定义：

```vue
<script setup>
import { formatDate, debounce } from '@/utils'

const formattedDate = formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss')

const handleSearch = debounce(() => {
  // 搜索逻辑
}, 300)
</script>
```

### 6. 公共组件使用

#### 通知栏

```vue
<template>
  <BaseNotificationBar ref="notificationBar" />
</template>

<script setup>
import { ref } from 'vue'
import BaseNotificationBar from '@/components/common/BaseNotificationBar.vue'

const notificationBar = ref(null)

// 添加通知
notificationBar.value?.addNotification({
  type: 'warning',
  message: '检测到情绪波动，建议进行放松练习'
})
</script>
```

#### 加载组件

```vue
<template>
  <BaseLoading :visible="loading" :text="加载中..." />
</template>

<script setup>
import { ref } from 'vue'
import BaseLoading from '@/components/common/BaseLoading.vue'

const loading = ref(false)
</script>
```

#### 弹窗组件

```vue
<template>
  <BaseModal
    v-model:visible="modalVisible"
    title="提示"
    @confirm="handleConfirm"
  >
    <p>这是弹窗内容</p>
  </BaseModal>
</template>

<script setup>
import { ref } from 'vue'
import BaseModal from '@/components/common/BaseModal.vue'

const modalVisible = ref(false)

const handleConfirm = () => {
  console.log('确认')
  modalVisible.value = false
}
</script>
```

## 响应式适配

框架已支持 PC / 平板 / 手机端自适应：

- **PC 端** (> 1024px): 完整布局（侧边栏 + 主内容区）
- **平板端** (769px - 1024px): 自适应布局
- **手机端** (≤ 768px): 隐藏侧边栏，底部导航栏为主要导航

成员开发模块内页面时无需额外处理适配逻辑，基础布局已处理。

## 环境变量

创建 `.env` 文件配置 API 基础地址：

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

## 注意事项

1. **代码合并友好**: 
   - 各模块独立开发，避免修改其他模块文件
   - 使用 Scoped CSS 避免样式冲突
   - 组件命名遵循规范，避免命名冲突

2. **公共资源**:
   - 禁止在模块内重复定义全局样式变量
   - 禁止重复实现公共工具函数
   - 公共组件统一放在 `components/common/`

3. **路由管理**:
   - 新增路由必须在 `router/index.js` 中统一添加
   - 遵循路由路径规范，避免路径冲突

4. **API 请求**:
   - 必须使用 `api/request.js` 封装的请求方法
   - 模块 API 文件统一放在 `api/` 目录

## 开发流程

1. **克隆项目**: `git clone <repository-url>`
2. **安装依赖**: `npm install`
3. **启动开发**: `npm run dev`
4. **选择模块**: 根据分工选择对应模块进行开发
5. **遵循规范**: 严格按照命名规范和代码规范开发
6. **测试验证**: 确保功能正常，无报错
7. **提交代码**: 提交前检查是否影响其他模块

## 常见问题

### Q: 如何添加新的路由？

A: 在 `router/index.js` 中对应模块的路由下添加新路由配置。

### Q: 如何修改全局样式？

A: 修改 `styles/common.css` 或 `styles/variables.css`，不要在其他地方修改。

### Q: 如何添加新的公共组件？

A: 在 `components/common/` 目录下创建，命名使用 `Base` 前缀。

### Q: 如何调用后端 API？

A: 在对应模块的 API 文件中定义接口函数，然后在组件中导入使用。

## 联系方式

如有问题，请联系项目负责人或查看项目文档。

---

**祝开发顺利！** 🎉

