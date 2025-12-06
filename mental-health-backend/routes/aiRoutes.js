/**
 * 模块1：AI智能体中转接口
 * 成员A开发：Dify情绪监控师智能体配置
 * 文件命名规范：aiRoutes.js（便于5人分工合并）
 * 
 * 所有Dify智能体调用需通过后端中转，统一封装在/api/ai/路径下
 * 避免密钥泄露
 */

const express = require('express')
const router = express.Router()
const emotionAnalyzeService = require('../services/emotionAnalyzeService')
const GlobalConfig = require('../config/GlobalConfig')

/**
 * 统一响应格式
 */
const send = (res, code, data = null, msg = 'ok') => {
  res.json({ code, msg, data })
}

/**
 * 情绪分析接口（中转Dify智能体）
 * 请求地址：/api/ai/emotion-analyze
 * 请求方式：POST
 * 参数（body）：content（String）、dataType（String）
 */
router.post('/emotion-analyze', async (req, res) => {
  try {
    const { content, dataType } = req.body

    // 参数验证
    if (!content) {
      return send(res, 400, null, '参数错误：缺少content')
    }

    if (!dataType || !['text', 'voice', 'behavior'].includes(dataType)) {
      return send(res, 400, null, '参数错误：dataType必须是text/voice/behavior之一')
    }

    // 调用情绪分析服务
    const result = await emotionAnalyzeService.analyzeEmotion(content, dataType)

    if (!result.success) {
      return send(res, 500, null, 'AI分析失败：' + (result.error || '未知错误'))
    }

    // Demo版添加备注
    const msg = GlobalConfig.systemConfig.isDemo 
      ? 'Demo版AI分析结果' 
      : 'AI分析成功'

    return send(res, 200, result, msg)
  } catch (error) {
    console.error('情绪分析接口错误:', error)
    return send(res, 500, null, '服务器错误：' + error.message)
  }
})

module.exports = router



