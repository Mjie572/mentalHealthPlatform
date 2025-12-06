/**
 * Express 服务器主入口
 * 仅注册积极赋能模块路由，不修改其他模块配置
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import positiveRouter from './routes/positive.js';

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件配置
app.use(cors()); // 允许跨域请求
app.use(express.json()); // 解析 JSON 请求体
app.use(express.urlencoded({ extended: true })); // 解析 URL 编码请求体

// 仅注册积极赋能模块路由
// 路由前缀: /positive
app.use('/positive', positiveRouter);

// 健康检查接口（可选）
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: '服务器运行正常' });
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    code: 404,
    msg: '接口不存在',
    data: null
  });
});

// 全局错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    code: 500,
    msg: '服务器内部错误',
    data: null
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log(`积极赋能模块接口: POST http://localhost:${PORT}/positive/content`);
  console.log(`环境变量检查:`);
  console.log(`  - DIFY_API_BASE_URL: ${process.env.DIFY_API_BASE_URL || '未设置'}`);
  console.log(`  - DIFY_API_KEY: ${process.env.DIFY_API_KEY ? '已设置' : '未设置'}`);
});

