# 心理健康平台后端 - 积极赋能模块

## 项目说明

本后端服务仅包含**积极赋能模块**的接口实现，对接 Dify 鼓励语句机器人。

## 模块信息

- **模块名称**: 积极情绪赋能模块
- **路由前缀**: `/positive`
- **接口路径**: `POST /positive/content`
- **开发范围**: 仅开发本模块，不涉及其他模块

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并填入真实的 Dify API 配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
DIFY_API_BASE_URL=http://localhost/v1
DIFY_API_KEY=your_real_dify_api_key_here
PORT=3000
```

**重要**: 请将 `your_real_dify_api_key_here` 替换为真实的 Dify API Key。

### 3. 启动服务器

```bash
# 开发模式（自动重启）
npm run dev

# 生产模式
npm start
```

服务器将在 `http://localhost:3000` 启动。

## 接口文档

### POST /positive/content

获取鼓励语句接口。

#### 请求

- **URL**: `/positive/content`
- **方法**: `POST`
- **Content-Type**: `application/json`

**请求体**:
```json
{
  "userMood": "用户输入的情绪/状态"
}
```

**示例**:
```json
{
  "userMood": "今天心情有点低落"
}
```

#### 响应

**成功响应** (200):
```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "encourageText": "机器人返回的鼓励语句"
  }
}
```

**失败响应** (500):
```json
{
  "code": 500,
  "msg": "鼓励语句生成失败，请稍后再试",
  "data": null
}
```

## 测试方法

### 使用 Postman 测试

1. **创建新请求**
   - 方法: `POST`
   - URL: `http://localhost:3000/positive/content`

2. **设置请求头**
   - `Content-Type`: `application/json`

3. **设置请求体** (Body -> raw -> JSON)
   ```json
   {
     "userMood": "今天心情有点低落"
   }
   ```

4. **发送请求**

5. **预期响应**
   ```json
   {
     "code": 200,
     "msg": "success",
     "data": {
       "encourageText": "没有无法治愈的伤痛..."
     }
   }
   ```

### 使用 curl 测试

```bash
curl -X POST http://localhost:3000/positive/content \
  -H "Content-Type: application/json" \
  -d '{"userMood": "今天心情有点低落"}'
```

### 使用 Node.js 测试脚本

创建 `test.js` 文件：

```javascript
import axios from 'axios';

const testEncourageText = async () => {
  try {
    const response = await axios.post('http://localhost:3000/positive/content', {
      userMood: '今天心情有点低落'
    });
    console.log('成功响应:', response.data);
  } catch (error) {
    console.error('请求失败:', error.response?.data || error.message);
  }
};

testEncourageText();
```

运行测试：
```bash
node test.js
```

## 项目结构

```
mental-health-backend/
├── controllers/          # 控制器目录
│   └── positiveController.js  # 积极赋能模块控制器
├── routes/               # 路由目录
│   └── positive.js      # 积极赋能模块路由
├── .env                  # 环境变量（不提交到 Git）
├── .env.example          # 环境变量示例
├── .gitignore           # Git 忽略文件
├── package.json         # 项目配置
├── server.js            # 服务器主入口
└── README.md            # 本文件
```

## 技术栈

- **Node.js**: JavaScript 运行时
- **Express**: Web 框架
- **Axios**: HTTP 客户端（用于调用 Dify API）
- **dotenv**: 环境变量管理
- **cors**: 跨域资源共享

## 注意事项

1. **环境变量安全**: `.env` 文件包含敏感信息，已添加到 `.gitignore`，请勿提交到版本控制。

2. **Dify API 配置**: 确保 Dify 服务已启动，且 API Key 正确配置。

3. **错误处理**: 所有异常情况统一返回 500 错误，错误信息为 "鼓励语句生成失败，请稍后再试"。

4. **模块隔离**: 本后端仅包含积极赋能模块代码，不涉及其他模块。

## 故障排查

### 问题: 接口返回 500 错误

**可能原因**:
1. Dify API Key 未正确配置
2. Dify 服务未启动
3. Dify API URL 配置错误
4. 网络连接问题

**解决方法**:
1. 检查 `.env` 文件中的 `DIFY_API_KEY` 是否正确
2. 确认 Dify 服务是否运行在 `http://localhost/v1`
3. 查看服务器控制台日志，定位具体错误

### 问题: 请求超时

**可能原因**:
1. Dify API 响应时间过长
2. 网络延迟

**解决方法**:
1. 检查 Dify 服务状态
2. 在 `controllers/positiveController.js` 中调整 `timeout` 值（当前为 30000ms）

## 开发规范

- 仅修改本模块相关文件（`routes/positive.js`、`controllers/positiveController.js`）
- 不修改其他模块的路由、控制器或配置
- 遵循项目统一的错误响应格式
- 使用环境变量存储敏感信息，禁止硬编码

