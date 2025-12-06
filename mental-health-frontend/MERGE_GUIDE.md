# 多维解压服务模块 - 代码合并说明

## 一、新增文件清单

### 前端文件
1. `src/store/index.js` - 全局状态管理（公共依赖）
2. `src/components/decompress/Decom-BreathingGame.vue` - 呼吸引导游戏组件
3. `src/components/decompress/Decom-NumberGame.vue` - 数字消消乐组件
4. `src/views/DecompressService/Games.vue` - 小游戏页面（已更新）
5. `src/views/DecompressService/Questionnaire.vue` - 心理题库页面（已更新）
6. `src/views/DecompressService/Advisor.vue` - Dify心理顾问页面（新增）
7. `src/views/DecompressService/CheckIn.vue` - 活动打卡页面（新增）
8. `src/api/decompress.js` - API接口文件（已扩展）

### 后端文件
1. `mental-health-backend/main.py` - FastAPI后端主文件
2. `mental-health-backend/requirements.txt` - Python依赖文件

## 二、修改的现有文件

1. `src/router/index.js` - 新增路由：advisor、checkin
2. `src/views/DecompressService/index.vue` - 新增功能入口

## 三、与其他模块的依赖点

### 3.1 调用的跨模块接口

#### 模块A（情绪监控）
- **接口**：`GET /api/emotion/history`
- **用途**：获取用户情绪历史数据
- **调用位置**：Dify顾问页面（可选，用于上下文）
- **依赖说明**：如果模块A未实现，本模块会使用Demo数据

#### 模块D（个性化方案）
- **接口**：`GET /api/user/info`
- **用途**：获取用户信息
- **调用位置**：各页面（可选）
- **依赖说明**：如果模块D未实现，本模块会使用Demo数据

### 3.2 提供的跨模块接口

#### 模块C（积极情绪赋能）
- **接口**：`POST /api/points/update`
- **用途**：更新用户积分
- **提供位置**：`src/api/decompress.js` 和 `main.py`
- **接口规范**：
  ```javascript
  {
    userId: string,
    points: number,
    source: string,
    description: string
  }
  ```
- **返回值**：
  ```javascript
  {
    code: 200,
    msg: "Demo版模拟数据",
    data: {
      success: true,
      totalPoints: number,
      addedPoints: number
    }
  }
  ```

### 3.3 共享的全局变量

#### 使用的全局变量
- `currentUserId` - 用户ID（必须）
- `userRole` - 用户角色（可选）
- `systemConfig` - 系统配置（必须）
- `emotionCommonTags` - 情绪标签（Dify对接使用）

#### 使用的跨模块变量
- `latestEmotionScore` - 最新情绪评分（Dify对接使用，可选）
- `userPreference` - 用户偏好（可选）
- `activeTaskCount` - 任务数（打卡完成后更新）

#### 提供的跨模块变量
- 无（本模块不提供跨模块变量）

## 四、合并时需注意的冲突点

### 4.1 全局状态管理（store/index.js）

**冲突风险**：⭐⭐⭐ 高

**原因**：其他模块可能也需要定义全局状态

**解决方案**：
1. 如果其他模块已创建store，需要合并两个文件
2. 合并时注意：
   - 保留所有模块的全局变量定义
   - 统一导出方式
   - 确保变量名不冲突

**合并步骤**：
```javascript
// 如果其他模块已有store，合并方式：
// 1. 保留所有全局变量定义
// 2. 合并导出函数
// 3. 确保变量名唯一性
```

### 4.2 API接口文件（api/decompress.js）

**冲突风险**：⭐ 低

**原因**：每个模块有独立的API文件

**解决方案**：无需合并，各模块独立维护

### 4.3 路由配置（router/index.js）

**冲突风险**：⭐⭐ 中

**原因**：所有模块共享路由文件

**解决方案**：
1. 检查路由路径是否冲突
2. 本模块路由前缀：`/decompress`
3. 新增路由：
   - `/decompress/advisor` - Dify顾问
   - `/decompress/checkin` - 活动打卡

### 4.4 组件命名

**冲突风险**：⭐ 低

**原因**：使用模块前缀 `Decom-`

**解决方案**：
- 本模块组件：`Decom-xxx.vue`
- 其他模块使用各自前缀，不会冲突

### 4.5 后端API路径

**冲突风险**：⭐⭐ 中

**原因**：所有模块共享后端服务

**解决方案**：
1. 本模块API前缀：`/api/decompress`、`/api/ai`、`/api/points`
2. 检查路径是否与其他模块冲突
3. 跨模块接口路径：
   - `/api/points/update` - 供模块C调用
   - `/api/user/info` - 调用模块D
   - `/api/emotion/history` - 调用模块A

## 五、合并检查清单

### 前端合并
- [ ] 确认 `src/store/index.js` 是否与其他模块冲突
- [ ] 确认路由路径 `/decompress/*` 未被占用
- [ ] 确认组件命名 `Decom-*` 无冲突
- [ ] 确认API接口路径无冲突
- [ ] 测试所有功能是否正常

### 后端合并
- [ ] 确认API路径 `/api/decompress/*`、`/api/ai/*`、`/api/points/*` 无冲突
- [ ] 确认跨模块接口路径正确
- [ ] 安装依赖：`pip install -r requirements.txt`
- [ ] 启动后端：`uvicorn main:app --reload`
- [ ] 测试所有接口是否正常

### 公共依赖检查
- [ ] 确认 `currentUserId` 变量定义位置一致
- [ ] 确认 `emotionCommonTags` 定义一致
- [ ] 确认 `systemConfig` 结构一致
- [ ] 确认跨模块变量访问方式一致

## 六、合并后测试

### 必须测试项
1. ✅ 解压小游戏功能正常
2. ✅ 心理题库功能正常
3. ✅ Dify对接功能正常（Demo版）
4. ✅ 打卡积分功能正常
5. ✅ 跨模块接口调用正常
6. ✅ 公共变量访问正常

### 建议测试项
1. 与其他模块集成测试
2. 性能测试
3. 兼容性测试

## 七、Demo版说明

### Demo版标识
- 所有API返回的 `msg` 字段包含 "Demo版模拟数据"
- `systemConfig.debug = true` 时使用Demo数据
- 错误码：1001（Demo版专用错误码，暂未使用）

### Demo版数据
- 游戏记录：内存存储，重启后清空
- 题库数据：硬编码在 `main.py` 中
- 打卡记录：内存存储
- 积分数据：内存存储
- Dify回复：随机选择模拟回复

### 正式版迁移
1. 连接真实数据库
2. 实现真实的Dify API调用
3. 移除Demo标识
4. 实现完整的错误处理

## 八、联系方式

如有合并问题，请联系：
- 开发者：多维解压服务模块
- 模块：多维解压服务

