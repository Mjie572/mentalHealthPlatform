# 心理健康智能平台 - 后端API

基于 Node.js + Express 的后端服务

## 技术栈

- **运行环境**: Node.js (ES Modules)
- **框架**: Express.js
- **HTTP客户端**: 原生 fetch (用于Dify API调用)
- **CORS**: cors 中间件

## 安装依赖

```bash
cd mental-health-backend
npm install
```

## 启动服务

```bash
# 开发模式
npm run dev

# 或直接运行
node server.js
```

服务将在 `http://localhost:8000` 启动

## API接口

### 基础信息
- `GET /` - API基本信息

### 小游戏相关
- `GET /api/decompress/games` - 获取小游戏列表
- `POST /api/decompress/games/start` - 开始游戏
- `POST /api/decompress/games/complete` - 完成游戏

### 心理题库相关
- `GET /api/decompress/questionnaire/list` - 获取题库列表
- `GET /api/decompress/questionnaire/:question_id` - 获取题目详情
- `POST /api/decompress/questionnaire/submit` - 提交答题
- `GET /api/decompress/questionnaire/result/:result_id` - 获取答题结果

### Dify心理顾问
- `POST /api/ai/dify/chat` - 调用Dify心理顾问
- `GET /api/ai/dify/history` - 获取对话历史

### 打卡与积分
- `POST /api/decompress/checkin` - 活动打卡
- `GET /api/decompress/checkin/records` - 获取打卡记录
- `GET /api/points/info` - 获取积分信息
- `GET /api/points/history` - 获取积分变动记录
- `GET /api/points/rules` - 获取积分规则

### 跨模块接口
- `POST /api/points/update` - 积分更新（供其他模块调用）
- `GET /api/user/info` - 获取用户信息
- `GET /api/emotion/history` - 获取情绪数据历史

## 响应格式

所有接口遵循Demo版响应格式：

```json
{
  "code": 200,
  "msg": "Demo版模拟数据",
  "data": { ... }
}
```

错误响应：

```json
{
  "code": 1001,
  "msg": "Demo版错误：错误描述",
  "data": null
}
```

## 环境变量

- `PORT` - 服务端口（默认：8000）

## 注意事项

1. 当前为Demo版本，所有数据存储在内存中，重启服务后数据会丢失
2. 生产环境需要连接数据库持久化数据
3. Dify API调用需要配置相应的API密钥（正式版）
4. CORS配置在生产环境应限制具体域名

