/**
 * 模块集成路由
 * 提供跨模块数据访问接口
 * 文件命名规范：moduleIntegrationRoutes.js（便于5人分工合并）
 */

const express = require('express')
const router = express.Router()
const moduleIntegrationService = require('../services/moduleIntegrationService')
const GlobalConfig = require('../config/GlobalConfig')

/**
 * 统一响应格式
 */
const send = (res, code, data = null, msg = 'ok') => {
  res.json({ code, msg, data })
}

/**
 * 获取当前用户ID
 */
const getCurrentUserId = (req) => {
  if (req.user && req.user.uid) {
    return req.user.uid
  }
  if (req.session && req.session.userId) {
    return req.session.userId
  }
  const userId = req.headers['x-user-id']
  return userId || GlobalConfig.getCurrentUserId() || ''
}

/**
 * 模块3：内容推荐 - 获取情绪数据接口
 * 请求地址：/api/module/emotion-for-recommendation
 * 请求方式：GET
 * 参数：userId（可选）、limit（可选，默认10）
 */
router.get('/emotion-for-recommendation', (req, res) => {
  try {
    const requestedUserId = req.query.userId
    const userId = requestedUserId || getCurrentUserId(req)
    const limit = parseInt(req.query.limit) || 10

    if (!userId) {
      return send(res, 401, null, '未登录或缺少userId参数')
    }

    const data = moduleIntegrationService.getEmotionDataForRecommendation(userId, limit)

    return send(res, 200, data, '查询成功')
  } catch (error) {
    console.error('获取推荐用情绪数据错误:', error)
    return send(res, 500, null, '服务器错误：' + error.message)
  }
})

/**
 * 模块4：报告生成 - 获取情绪统计数据接口
 * 请求地址：/api/module/emotion-stats-for-report
 * 请求方式：GET
 * 参数：userId（可选）、startTime（可选）、endTime（可选）
 */
router.get('/emotion-stats-for-report', (req, res) => {
  try {
    const requestedUserId = req.query.userId
    const userId = requestedUserId || getCurrentUserId(req)
    const startTime = req.query.startTime ? parseInt(req.query.startTime) : null
    const endTime = req.query.endTime ? parseInt(req.query.endTime) : null

    if (!userId) {
      return send(res, 401, null, '未登录或缺少userId参数')
    }

    const stats = moduleIntegrationService.getEmotionStatsForReport(userId, startTime, endTime)

    return send(res, 200, stats, '查询成功')
  } catch (error) {
    console.error('获取报告用情绪统计错误:', error)
    return send(res, 500, null, '服务器错误：' + error.message)
  }
})

module.exports = router

