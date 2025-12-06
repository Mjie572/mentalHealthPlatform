# 模块5/模块3/模块4接口实现总结

## ✅ 实现完成情况

### 模块5：专业咨询预约接口（正式版）

#### 已实现的接口

1. **创建预约** - `POST /api/professional/book`
   - ✅ 自动匹配咨询师（根据emotionTag）
   - ✅ 自动推荐时间段（默认明天下午2-3点）
   - ✅ 数据持久化存储
   - ✅ 支持Demo版和正式版

2. **查询预约列表** - `GET /api/professional/appointments`
   - ✅ 支持按状态筛选（pending/confirmed/cancelled）
   - ✅ 数据隔离（按userId）

3. **取消预约** - `POST /api/professional/appointments/:appointmentId/cancel`
   - ✅ 状态验证
   - ✅ 数据更新

4. **确认预约** - `POST /api/professional/appointments/:appointmentId/confirm`
   - ✅ 状态验证
   - ✅ 数据更新

#### 文件结构

```
mental-health-backend/
├── routes/
│   └── professionalRoutes.js      # 模块5路由
├── services/
│   └── professionalService.js     # 模块5服务
└── data/
    └── appointments.json          # 预约数据存储
```

---

### 模块3/模块4：情绪历史接口调用

#### 已实现的接口

1. **情绪历史查询（通用）** - `GET /api/emotion/history`
   - ✅ 支持模块3/模块4调用
   - ✅ 支持指定userId参数（跨用户查询）
   - ✅ 支持时间范围查询
   - ✅ 返回格式化数据

2. **模块3专用接口** - `GET /api/module/emotion-for-recommendation`
   - ✅ 返回格式化的情绪数据
   - ✅ 支持limit参数控制返回数量
   - ✅ 便于推荐算法使用

3. **模块4专用接口** - `GET /api/module/emotion-stats-for-report`
   - ✅ 返回情绪统计数据
   - ✅ 包含分布、趋势、平均分数等
   - ✅ 便于报告生成

#### 文件结构

```
mental-health-backend/
├── routes/
│   ├── emotionRoutes.js              # 情绪历史接口（已更新支持模块3/4）
│   └── moduleIntegrationRoutes.js   # 模块集成路由
├── services/
│   └── moduleIntegrationService.js  # 模块集成服务
```

---

## 📋 接口详细说明

### 模块5接口

#### 1. 创建预约

**请求**:
```http
POST /api/professional/book
Content-Type: application/json
X-User-Id: user-123

{
  "emotionTag": "焦虑",
  "consultantId": "C001",  // 可选
  "timeSlot": "2024-12-11 14:00-15:00"  // 可选
}
```

**响应**:
```json
{
  "code": 200,
  "msg": "预约成功",
  "data": {
    "appointmentId": "APT-1702195200000",
    "consultantId": "C001",
    "consultantName": "模拟咨询师A",
    "emotionTag": "焦虑",
    "timeSlot": "2024-12-11 14:00-15:00",
    "status": "pending",
    "createdAt": "2024-12-10T10:00:00.000Z"
  }
}
```

#### 2. 查询预约列表

**请求**:
```http
GET /api/professional/appointments?status=pending
X-User-Id: user-123
```

**响应**:
```json
{
  "code": 200,
  "msg": "查询成功",
  "data": [
    {
      "id": "...",
      "appointmentId": "APT-1702195200000",
      "userId": "user-123",
      "consultantId": "C001",
      "consultantName": "模拟咨询师A",
      "emotionTag": "焦虑",
      "timeSlot": "2024-12-11 14:00-15:00",
      "status": "pending",
      "createdAt": "2024-12-10T10:00:00.000Z"
    }
  ]
}
```

---

### 模块3/模块4接口

#### 1. 情绪历史查询（通用）

**请求**:
```http
GET /api/emotion/history?userId=user-123&startTime=1702108800000&endTime=1702195200000
X-User-Id: user-123
```

**响应**:
```json
{
  "code": 200,
  "msg": "情绪历史查询成功",
  "data": [
    {
      "id": "...",
      "userId": "user-123",
      "dataType": "text",
      "content": "今天心情很好",
      "timestamp": 1702195200000,
      "emotionTag": "愉悦",
      "emotionScore": 85,
      "aiAnalysis": "AI分析结果...",
      "createdAt": "2024-12-10T10:00:00.000Z"
    }
  ]
}
```

#### 2. 模块3专用接口

**请求**:
```http
GET /api/module/emotion-for-recommendation?userId=user-123&limit=10
X-User-Id: user-123
```

**响应**:
```json
{
  "code": 200,
  "msg": "查询成功",
  "data": [
    {
      "emotionTag": "愉悦",
      "emotionScore": 85,
      "timestamp": 1702195200000,
      "dataType": "text"
    }
  ]
}
```

#### 3. 模块4专用接口

**请求**:
```http
GET /api/module/emotion-stats-for-report?userId=user-123&startTime=1702108800000&endTime=1702195200000
X-User-Id: user-123
```

**响应**:
```json
{
  "code": 200,
  "msg": "查询成功",
  "data": {
    "totalRecords": 20,
    "averageScore": 72.5,
    "emotionDistribution": {
      "愉悦": 8,
      "焦虑": 5,
      "平静": 7
    },
    "trend": [
      {
        "date": "2024-12-10",
        "count": 3,
        "averageScore": 75
      }
    ],
    "timeRange": {
      "startTime": 1702108800000,
      "endTime": 1702195200000
    }
  }
}
```

---

## 🔧 技术实现

### 模块5服务层

**文件**: `mental-health-backend/services/professionalService.js`

**核心功能**:
- `createAppointment()` - 创建预约
- `getUserAppointments()` - 查询用户预约
- `updateAppointmentStatus()` - 更新预约状态

### 模块集成服务层

**文件**: `mental-health-backend/services/moduleIntegrationService.js`

**核心功能**:
- `getEmotionDataForRecommendation()` - 为模块3提供推荐数据
- `getEmotionStatsForReport()` - 为模块4提供统计数据

### 数据存储

- **预约数据**: `data/appointments.json`
- **情绪数据**: `data/emotions.json`

---

## 🧪 测试方法

### 测试模块5

```bash
# 创建预约
curl -X POST http://localhost:8000/api/professional/book \
  -H "Content-Type: application/json" \
  -H "X-User-Id: test-user-123" \
  -d '{"emotionTag": "焦虑"}'

# 查询预约列表
curl "http://localhost:8000/api/professional/appointments?status=pending" \
  -H "X-User-Id: test-user-123"
```

### 测试模块3/模块4

```bash
# 情绪历史查询
curl "http://localhost:8000/api/emotion/history?userId=test-user-123" \
  -H "X-User-Id: test-user-123"

# 模块3专用接口
curl "http://localhost:8000/api/module/emotion-for-recommendation?userId=test-user-123&limit=10" \
  -H "X-User-Id: test-user-123"

# 模块4专用接口
curl "http://localhost:8000/api/module/emotion-stats-for-report?userId=test-user-123" \
  -H "X-User-Id: test-user-123"
```

### 运行完整测试

```bash
cd mental-health-backend
node test-module-integration.js
```

---

## 📝 使用示例

### 模块1调用模块5

```javascript
// 在alertService.js中
const professionalService = require('./professionalService')
const result = await professionalService.createAppointment({
  userId,
  emotionTag: '焦虑',
  consultantId: null,  // 自动匹配
  timeSlot: null       // 自动推荐
})
```

### 模块3调用情绪历史

```javascript
// 获取用户最近的情绪数据
const response = await axios.get('/api/module/emotion-for-recommendation', {
  params: {
    userId: 'user-123',
    limit: 10
  }
})

// 使用数据进行推荐
const emotionData = response.data.data
// 根据emotionTag和emotionScore进行内容推荐
```

### 模块4调用情绪统计

```javascript
// 获取情绪统计数据用于生成报告
const response = await axios.get('/api/module/emotion-stats-for-report', {
  params: {
    userId: 'user-123',
    startTime: 1702108800000,
    endTime: 1702195200000
  }
})

// 使用统计数据生成报告
const stats = response.data.data
// 使用totalRecords, averageScore, emotionDistribution, trend等数据
```

---

## ⚠️ 注意事项

1. **服务重启**: 添加新路由后需要重启后端服务
2. **数据隔离**: 所有接口都通过userId实现数据隔离
3. **认证要求**: 所有接口都需要认证（JWT Token或X-User-Id Header）
4. **错误处理**: 所有接口都有完善的错误处理

---

## ✅ 完成状态

- [x] 模块5预约接口（正式版）
- [x] 模块5预约管理接口（查询、取消、确认）
- [x] 情绪历史接口支持模块3/模块4调用
- [x] 模块3专用推荐接口
- [x] 模块4专用统计接口
- [x] 数据持久化存储
- [x] 错误处理和验证

---

**最后更新**: 2024-12-10  
**状态**: ✅ 已完成

