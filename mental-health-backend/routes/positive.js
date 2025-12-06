/**
 * 积极赋能模块路由
 * 仅处理本模块相关路由，不涉及其他模块
 */

import express from 'express';
import { getEncourageText } from '../controllers/positiveController.js';

const router = express.Router();

/**
 * POST /positive/content
 * 获取鼓励语句
 * 请求体: { "userMood": "用户输入的情绪/状态" }
 * 响应: { "code": 200, "msg": "success", "data": { "encourageText": "机器人返回的鼓励语句" } }
 */
router.post('/content', getEncourageText);

export default router;

