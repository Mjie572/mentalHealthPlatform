# 多维解压服务模块 - 完整代码合并说明

## 一、模块概述

**模块名称**: 多维解压服务模块  
**开发人员**: 成员B  
**模块职责**: 解压小游戏、心理健康自测、Dify心理顾问、活动打卡与积分体系  
**技术栈**: Vue 3 + FastAPI

## 二、文件清单

### 2.1 新增文件

#### 前端文件

**核心组件**:
- `src/store/index.js` - **全局状态管理（公共依赖）** ⚠️ 高冲突风险
- `src/api/decompress.js` - 解压服务模块API接口
- `src/api/crossModule.js` - **跨模块接口封装** ⚠️ 新增文件

**游戏组件**:
- `src/components/decompress/Decom-BreathingGame.vue` - 呼吸引导游戏
- `src/components/decompress/Decom-NumberGame.vue` - 数字消消乐游戏
- `src/components/decompress/Decom-ColorMatchGame.vue` - 色彩匹配游戏
- `src/components/decompress/Decom-RelaxMusicGame.vue` - 放松音乐游戏
- `src/components/decompress/Decom-PuzzleGame.vue` - 益智拼图游戏

**页面组件**:
- `src/views/DecompressService/index.vue` - 模块首页
- `src/views/DecompressService/Games.vue` - 游戏列表页
- `src/views/DecompressService/Questionnaire.vue` - 心理健康自测页
- `src/views/DecompressService/Advisor.vue` - Dify心理顾问页
- `src/views/DecompressService/CheckIn.vue` - 活动打卡页

#### 后端文件

- `mental-health-backend/main.py` - FastAPI后端主文件（包含所有接口）
- `mental-health-backend/requirements.txt` - Python依赖文件

#### 文档文件

- `TEST_REPORT.md` - 自测报告（已存在，可更新）
- `MERGE_GUIDE.md` - 合并说明（已存在，可更新）
- `COMPREHENSIVE_TEST_REPORT.md` - **完整自测报告** ⭐ 新增
- `COMPREHENSIVE_MERGE_GUIDE.md` - **完整合并说明** ⭐ 新增
- `FEATURE_IMPLEMENTATION.md` - 功能实现总结（已存在）
- `START_GUIDE.md` - 启动指南（已存在）

### 2.2 修改的现有文件

- `src/router/index.js` - 新增路由：`/decompress/advisor`、`/decompress/checkin`
- `src/views/DecompressService/index.vue` - 更新功能入口（已修复点击问题）

## 三、公共依赖规范说明

### 3.1 全局共享变量（必须使用）

#### currentUserId（用户隔离）
- **定义位置**: `src/store/index.js`
- **使用位置**: 所有API调用、数据查询
- **兼容性处理**: 所有使用处都检查是否为空
- **合并注意**: 如果其他模块已定义，需要合并到同一个store

#### userRole（权限控制）
- **定义位置**: `src/store/index.js`
- **使用位置**: 权限检查（当前模块未使用，预留）
- **合并注意**: 如果其他模块已定义，需要合并

#### systemConfig（系统配置）
- **定义位置**: `src/store/index.js`
- **关键属性**: `debug: true`（Demo版标识）
- **使用位置**: 控制Demo/正式版逻辑
- **合并注意**: 确保`debug`属性一致

#### emotionCommonTags（统一情绪标签）
- **定义位置**: `src/store/index.js`
- **使用位置**: Dify对接时传递情绪标签
- **默认值**: `['焦虑', '压力', '抑郁', '愤怒', '恐惧', '快乐', '平静', '兴奋', '满足', '疲惫']`
- **合并注意**: 如果其他模块已定义，需要统一标签列表

### 3.2 跨模块变量（必须使用）

#### latestEmotionScore（关联情绪评分）
- **定义位置**: `src/store/index.js`
- **使用位置**: Dify对接时传递情绪评分
- **来源**: 模块A（情绪监控）
- **合并注意**: 如果模块A未实现，使用`null`作为默认值

#### userPreference（适配用户偏好）
- **定义位置**: `src/store/index.js`
- **使用位置**: 适配用户偏好（当前模块未使用，预留）
- **来源**: 模块D（个性化方案）
- **合并注意**: 如果模块D未实现，使用默认值

#### activeTaskCount（未完成任务数）
- **定义位置**: `src/store/index.js`
- **使用位置**: 打卡完成后更新（减1）
- **更新逻辑**: 打卡成功 → `decrementActiveTaskCount()`
- **合并注意**: 确保更新逻辑与其他模块一致

### 3.3 跨模块接口

#### 提供的接口（供其他模块调用）

**接口1: POST /api/points/update**
- **用途**: 积分更新接口（供模块C调用）
- **提供位置**: `main.py` 和 `src/api/crossModule.js`
- **请求参数**:
  ```json
  {
    "userId": "string",
    "points": "number",
    "source": "string",
    "description": "string"
  }
  ```
- **响应格式**:
  ```json
  {
    "code": 200,
    "msg": "Demo版模拟数据",
    "data": {
      "success": true,
      "totalPoints": "number",
      "addedPoints": "number"
    }
  }
  ```
- **合并注意**: 确保路径 `/api/points/update` 未被其他模块占用

#### 调用的接口（调用其他模块）

**接口1: GET /api/user/info**
- **用途**: 获取用户信息（调用模块D）
- **调用位置**: `src/api/crossModule.js`
- **封装函数**: `getUserInfo(userId)`
- **依赖说明**: 如果模块D未实现，使用Demo数据

**接口2: GET /api/emotion/history**
- **用途**: 获取情绪数据历史（调用模块A）
- **调用位置**: `src/api/crossModule.js`
- **封装函数**: `getEmotionHistory(params)`
- **依赖说明**: 如果模块A未实现，使用Demo数据

### 3.4 Dify对接规范

**统一路径**: `/api/ai/dify/chat`  
**中转方式**: 后端中转，前端不暴露密钥  
**关联变量**: 
- `currentUserId` - 用户标识
- `emotionCommonTags` - 统一情绪标签
- `latestEmotionScore` - 最新情绪评分

**请求参数**:
```json
{
  "userId": "string",
  "message": "string",
  "emotionTags": ["string"],
  "emotionScore": "number|null",
  "conversationHistory": [{"role": "string", "content": "string"}]
}
```

## 四、合并冲突风险评估

### 4.1 高冲突风险文件 ⚠️

#### src/store/index.js
- **冲突原因**: 其他模块可能也需要定义全局状态
- **冲突类型**: 文件内容合并
- **解决方案**:
  1. 如果其他模块已创建store，需要合并两个文件
  2. 合并时保留所有模块的全局变量定义
  3. 统一导出方式
  4. 确保变量名不冲突（使用模块前缀）

**合并示例**:
```javascript
// 如果模块A已有store，合并方式：
const globalState = reactive({
  // 模块A的变量
  emotionData: ...,
  // 模块B的变量（本模块）
  currentUserId: ...,
  emotionCommonTags: ...,
  // 其他模块的变量...
})
```

### 4.2 中冲突风险文件 ⚠️

#### src/router/index.js
- **冲突原因**: 所有模块共享路由文件
- **冲突类型**: 路由路径冲突
- **解决方案**:
  1. 检查路由路径是否冲突
  2. 本模块路由前缀：`/decompress`
  3. 新增路由：
     - `/decompress` - 模块首页
     - `/decompress/games` - 游戏列表
     - `/decompress/questionnaire` - 心理健康自测
     - `/decompress/advisor` - Dify顾问
     - `/decompress/checkin` - 活动打卡

#### mental-health-backend/main.py
- **冲突原因**: 所有模块共享后端服务
- **冲突类型**: API路径冲突
- **解决方案**:
  1. 本模块API前缀：`/api/decompress/*`、`/api/ai/*`、`/api/points/*`
  2. 检查路径是否与其他模块冲突
  3. 跨模块接口路径：
     - `/api/points/update` - 供模块C调用
     - `/api/user/info` - 调用模块D
     - `/api/emotion/history` - 调用模块A

### 4.3 低冲突风险文件 ✅

#### 组件文件
- **冲突原因**: 使用模块前缀 `Decom-`
- **解决方案**: 其他模块使用各自前缀，不会冲突
  - 模块A: `Emo-xxx.vue`
  - 模块B: `Decom-xxx.vue`（本模块）
  - 模块C: `Posi-xxx.vue`
  - 模块D: `Pers-xxx.vue`
  - 模块E: `Syst-xxx.vue`

#### API文件
- **冲突原因**: 每个模块有独立的API文件
- **解决方案**: 无需合并，各模块独立维护
  - `api/emotion.js` - 模块A
  - `api/decompress.js` - 模块B（本模块）
  - `api/positive.js` - 模块C
  - `api/personalized.js` - 模块D

## 五、合并步骤指南

### 5.1 前端合并步骤

#### 步骤1: 检查store/index.js
```bash
# 检查是否已存在store文件
ls src/store/index.js

# 如果已存在，需要手动合并
# 合并原则：
# 1. 保留所有模块的全局变量
# 2. 统一导出方式
# 3. 确保变量名不冲突
```

#### 步骤2: 合并路由配置
```javascript
// 在 src/router/index.js 中添加本模块路由
{
  path: 'decompress',
  name: 'DecompressService',
  component: () => import('@/views/DecompressService/index.vue')
},
// ... 其他路由
```

#### 步骤3: 检查API路径冲突
```bash
# 检查是否有路径冲突
grep -r "/api/decompress" src/api/
grep -r "/api/ai" src/api/
grep -r "/api/points" src/api/
```

#### 步骤4: 安装依赖（如需要）
```bash
cd mentalHealthPlatform/mental-health-frontend
npm install
```

### 5.2 后端合并步骤

#### 步骤1: 检查API路径冲突
```bash
# 检查main.py中的API路径
grep -n "@app\." mental-health-backend/main.py

# 确认以下路径未被占用：
# - /api/decompress/*
# - /api/ai/*
# - /api/points/*
```

#### 步骤2: 合并main.py
```python
# 如果其他模块已有main.py，需要合并
# 合并原则：
# 1. 保留所有模块的API路由
# 2. 统一工具函数（如get_demo_response）
# 3. 确保路径不冲突
```

#### 步骤3: 安装依赖
```bash
cd mental-health-backend
pip install -r requirements.txt
```

#### 步骤4: 启动测试
```bash
python main.py
# 或
uvicorn main:app --reload --port 8000
```

## 六、依赖关系图

```
多维解压服务模块（模块B）
│
├── 依赖模块A（情绪监控）
│   └── 调用接口：GET /api/emotion/history
│
├── 依赖模块D（个性化方案）
│   └── 调用接口：GET /api/user/info
│
└── 被模块C依赖（积极情绪赋能）
    └── 提供接口：POST /api/points/update
```

## 七、合并检查清单

### 7.1 前端合并检查

- [ ] 确认 `src/store/index.js` 是否与其他模块冲突
- [ ] 确认路由路径 `/decompress/*` 未被占用
- [ ] 确认组件命名 `Decom-*` 无冲突
- [ ] 确认API接口路径无冲突
- [ ] 确认 `src/api/crossModule.js` 已创建
- [ ] 测试所有功能是否正常
- [ ] 测试公共变量访问是否正常
- [ ] 测试跨模块接口调用是否正常

### 7.2 后端合并检查

- [ ] 确认API路径 `/api/decompress/*`、`/api/ai/*`、`/api/points/*` 无冲突
- [ ] 确认跨模块接口路径正确
- [ ] 确认Demo版响应格式统一（code/msg/data）
- [ ] 确认错误码1001已定义
- [ ] 安装依赖：`pip install -r requirements.txt`
- [ ] 启动后端：`uvicorn main:app --reload`
- [ ] 测试所有接口是否正常

### 7.3 公共依赖检查

- [ ] 确认 `currentUserId` 变量定义位置一致
- [ ] 确认 `emotionCommonTags` 定义一致
- [ ] 确认 `systemConfig` 结构一致
- [ ] 确认 `systemConfig.debug` 标识正确
- [ ] 确认跨模块变量访问方式一致
- [ ] 确认 `activeTaskCount` 更新逻辑一致

## 八、合并后测试

### 8.1 必须测试项

1. ✅ **解压小游戏功能**
   - 游戏列表正常显示
   - 游戏可以正常启动和完成
   - 积分奖励正确

2. ✅ **心理健康自测功能**
   - 题库列表正常显示
   - 90题量表可以正常答题
   - 测试报告正确生成

3. ✅ **Dify心理顾问功能**
   - 欢迎语正常显示
   - 消息可以正常发送和接收
   - 情绪标签正确传递

4. ✅ **活动打卡功能**
   - 活动列表正常显示
   - 打卡功能正常
   - 积分正确累加
   - 连续天数正确计算

5. ✅ **跨模块接口**
   - `/api/points/update` 可以正常调用
   - `/api/user/info` 可以正常调用
   - `/api/emotion/history` 可以正常调用

6. ✅ **公共变量访问**
   - `currentUserId` 正常访问
   - `emotionCommonTags` 正常访问
   - `activeTaskCount` 正常更新

### 8.2 建议测试项

1. 与其他模块集成测试
2. 性能测试
3. 兼容性测试
4. 安全性测试

## 九、Demo版说明

### 9.1 Demo版标识

- ✅ 所有API返回的 `msg` 字段包含 "Demo版模拟数据"
- ✅ `systemConfig.debug = true` 时使用Demo数据
- ✅ 错误码：1001（Demo版专用错误码，已定义）

### 9.2 Demo版数据存储

- **游戏记录**: 内存存储（`game_records`），重启后清空
- **题库数据**: 硬编码在 `main.py` 中（包含90题量表）
- **打卡记录**: 内存存储（`checkin_records`），重启后清空
- **积分数据**: 内存存储（`points_data`），重启后清空
- **Dify对话**: 内存存储（`dify_conversations`），重启后清空

### 9.3 正式版迁移指南

#### 步骤1: 连接真实数据库
```python
# 替换内存存储为数据库操作
# 使用SQLAlchemy或类似ORM框架
from sqlalchemy import create_engine
engine = create_engine('postgresql://...')
```

#### 步骤2: 实现真实Dify API调用
```python
# 在 call_dify_advisor 函数中
import requests
dify_response = requests.post(
    f"{DIFY_API_URL}/chat-messages",
    headers={"Authorization": f"Bearer {DIFY_API_KEY}"},
    json={...}
)
```

#### 步骤3: 调用真实跨模块接口
```python
# 替换Demo数据为真实API调用
# 使用httpx或requests调用其他模块接口
```

#### 步骤4: 关闭Demo模式
```javascript
// 在 store/index.js 中
systemConfig: {
  debug: false, // 关闭Demo模式
  ...
}
```

## 十、代码质量保证

### 10.1 代码规范

- ✅ 命名规范：驼峰式，模块前缀（`Decom-`）
- ✅ 代码注释：关键逻辑都有注释
- ✅ 错误处理：完善的try-catch和兼容性检查
- ✅ 代码结构：按功能模块清晰拆分

### 10.2 公共依赖合规性

- ✅ 100%符合公共依赖规范
- ✅ 所有全局变量正确使用
- ✅ 所有跨模块变量正确使用
- ✅ 所有跨模块接口正确实现

### 10.3 团队协作规范

- ✅ 代码结构清晰，易于合并
- ✅ 变量命名不冲突
- ✅ 接口路径不冲突
- ✅ 兼容性处理完善

## 十一、联系与支持

如合并过程中遇到问题，请参考：
1. `COMPREHENSIVE_TEST_REPORT.md` - 完整测试报告
2. `MERGE_GUIDE.md` - 基础合并说明
3. `FEATURE_IMPLEMENTATION.md` - 功能实现总结

---

**文档版本**: v1.0  
**最后更新**: 2025-01-XX  
**维护人员**: 多维解压服务模块开发

