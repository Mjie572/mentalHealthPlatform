# 模块集成指南

## 一、模块5：专业咨询预约接口（正式版）

### 1.1 接口列表

#### 1. 创建预约
- **路径**: `POST /api/professional/book`
- **参数**:
  ```json
  {
    "consultantId": "C001",  // 可选，不提供则自动匹配
    "emotionTag": "焦虑",     // 必需
    "timeSlot": "2024-12-11 14:00-15:00"  // 可选，不提供则自动推荐
  }
  ```
- **返回**:
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
- **路径**: `GET /api/professional/appointments`
- **参数**: 
  - `status` (可选): pending/confirmed/cancelled
- **返回**: 预约列表数组

#### 3. 取消预约
- **路径**: `POST /api/professional/appointments/:appointmentId/cancel`
- **返回**: 更新后的预约信息

#### 4. 确认预约
- **路径**: `POST /api/professional/appointments/:appointmentId/confirm`
- **返回**: 更新后的预约信息

### 1.2 功能特性

- ✅ 自动匹配咨询师（根据emotionTag）
- ✅ 自动推荐时间段（默认明天下午2-3点）
- ✅ 预约状态管理（pending/confirmed/cancelled）
- ✅ 数据持久化存储

### 1.3 使用示例

```javascript
// 模块1调用示例
const response = await axios.post('/api/professional/book', {
  emotionTag: '焦虑',
  // consultantId 和 timeSlot 可选
}, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'X-User-Id': userId
  }
})
```

---

## 二、模块3/模块4：情绪历史接口调用

### 2.1 直接调用情绪历史接口

#### 接口信息
- **路径**: `GET /api/emotion/history`
- **参数**:
  - `userId` (可选): 指定用户ID，不提供则使用当前登录用户
  - `startTime` (可选): 开始时间戳
  - `endTime` (可选): 结束时间戳

#### 使用示例

**模块3（内容推荐）调用**:
```javascript
// 获取用户最近的情绪数据用于推荐
const response = await axios.get('/api/emotion/history', {
  params: {
    userId: 'user-123',  // 可选，不提供则使用当前用户
    // startTime 和 endTime 可选
  },
  headers: {
    'Authorization': `Bearer ${token}`
  }
})

// 返回格式
// {
//   code: 200,
//   msg: "情绪历史查询成功",
//   data: [
//     {
//       id: "...",
//       userId: "user-123",
//       emotionTag: "愉悦",
//       emotionScore: 85,
//       timestamp: 1702195200000,
//       ...
//     }
//   ]
// }
```

**模块4（报告生成）调用**:
```javascript
// 获取指定时间范围的情绪数据用于生成报告
const response = await axios.get('/api/emotion/history', {
  params: {
    userId: 'user-123',
    startTime: 1702108800000,  // 开始时间
    endTime: 1702195200000     // 结束时间
  },
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

### 2.2 专用集成接口

#### 模块3：内容推荐专用接口
- **路径**: `GET /api/module/emotion-for-recommendation`
- **参数**:
  - `userId` (可选): 用户ID
  - `limit` (可选): 返回记录数，默认10
- **返回**: 格式化的情绪数据，便于推荐算法使用

**使用示例**:
```javascript
const response = await axios.get('/api/module/emotion-for-recommendation', {
  params: {
    userId: 'user-123',
    limit: 10
  }
})

// 返回格式
// {
//   code: 200,
//   msg: "查询成功",
//   data: [
//     {
//       emotionTag: "愉悦",
//       emotionScore: 85,
//       timestamp: 1702195200000,
//       dataType: "text"
//     }
//   ]
// }
```

#### 模块4：报告生成专用接口
- **路径**: `GET /api/module/emotion-stats-for-report`
- **参数**:
  - `userId` (可选): 用户ID
  - `startTime` (可选): 开始时间戳
  - `endTime` (可选): 结束时间戳
- **返回**: 情绪统计数据，包含分布、趋势等

**使用示例**:
```javascript
const response = await axios.get('/api/module/emotion-stats-for-report', {
  params: {
    userId: 'user-123',
    startTime: 1702108800000,
    endTime: 1702195200000
  }
})

// 返回格式
// {
//   code: 200,
//   msg: "查询成功",
//   data: {
//     totalRecords: 20,
//     averageScore: 72.5,
//     emotionDistribution: {
//       "愉悦": 8,
//       "焦虑": 5,
//       "平静": 7
//     },
//     trend: [
//       {
//         date: "2024-12-10",
//         count: 3,
//         averageScore: 75
//       }
//     ],
//     timeRange: {
//       startTime: 1702108800000,
//       endTime: 1702195200000
//     }
//   }
// }
```

---

## 三、接口调用规范

### 3.1 认证要求

所有接口都需要认证：
- 方式1: JWT Token（推荐）
  ```
  Authorization: Bearer <token>
  ```
- 方式2: X-User-Id Header（Demo版兼容）
  ```
  X-User-Id: user-123
  ```

### 3.2 统一返回格式

所有接口返回统一格式：
```json
{
  "code": 200,        // 状态码：200成功，400参数错误，401未登录，404不存在，500服务器错误
  "msg": "操作成功",   // 提示信息
  "data": {}          // 业务数据
}
```

### 3.3 错误处理

- **401**: 未登录，需要提供有效的认证信息
- **400**: 参数错误，检查请求参数
- **404**: 资源不存在
- **500**: 服务器错误，查看服务器日志

---

## 四、数据存储

### 4.1 预约数据
- **文件**: `mental-health-backend/data/appointments.json`
- **格式**: JSON数组
- **字段**: id, appointmentId, userId, consultantId, consultantName, emotionTag, timeSlot, status, createdAt, updatedAt

### 4.2 情绪数据
- **文件**: `mental-health-backend/data/emotions.json`
- **格式**: JSON数组
- **字段**: id, userId, dataType, content, timestamp, emotionTag, emotionScore, aiAnalysis, createdAt

---

## 五、测试方法

### 5.1 测试模块5预约接口

```bash
# 创建预约
curl -X POST http://localhost:8000/api/professional/book \
  -H "Content-Type: application/json" \
  -H "X-User-Id: test-user-123" \
  -d '{
    "emotionTag": "焦虑"
  }'

# 查询预约列表
curl http://localhost:8000/api/professional/appointments?status=pending \
  -H "X-User-Id: test-user-123"

# 取消预约
curl -X POST http://localhost:8000/api/professional/appointments/APT-123/cancel \
  -H "X-User-Id: test-user-123"
```

### 5.2 测试模块3/模块4接口

```bash
# 查询情绪历史（模块3/模块4通用）
curl "http://localhost:8000/api/emotion/history?userId=test-user-123&startTime=1702108800000" \
  -H "X-User-Id: test-user-123"

# 模块3专用接口
curl "http://localhost:8000/api/module/emotion-for-recommendation?userId=test-user-123&limit=10" \
  -H "X-User-Id: test-user-123"

# 模块4专用接口
curl "http://localhost:8000/api/module/emotion-stats-for-report?userId=test-user-123" \
  -H "X-User-Id: test-user-123"
```

---

## 六、文件结构

```
mental-health-backend/
├── routes/
│   ├── professionalRoutes.js      # 模块5：预约路由
│   └── moduleIntegrationRoutes.js # 模块集成路由
├── services/
│   ├── professionalService.js     # 模块5：预约服务
│   └── moduleIntegrationService.js # 模块集成服务
└── data/
    └── appointments.json          # 预约数据存储
```

---

## 七、注意事项

1. **用户认证**: 所有接口都需要用户认证，确保数据隔离
2. **数据隔离**: 通过userId实现数据隔离，不同用户只能访问自己的数据
3. **错误处理**: 所有接口都有完善的错误处理，不会导致服务崩溃
4. **数据持久化**: 使用JSON文件存储，生产环境建议使用数据库

---

**最后更新**: 2024-12-10  
**状态**: ✅ 已完成

