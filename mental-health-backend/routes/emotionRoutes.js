/**
 * 模块1：AI情绪监控与预警模块 - 路由文件
 * 成员A开发：情绪数据采集接口、情绪档案查询接口
 * 文件命名规范：emotionRoutes.js（便于5人分工合并）
 */

const express = require('express')
const router = express.Router()
const fs = require('fs')
const path = require('path')
const { v4: uuidv4 } = require('uuid')
const GlobalConfig = require('../config/GlobalConfig')
const emotionService = require('../services/emotionService')
const emotionAnalyzeService = require('../services/emotionAnalyzeService')
const alertService = require('../services/alertService')

const DATA_DIR = path.join(__dirname, '../data')
const EMOTION_FILE = path.join(DATA_DIR, 'emotions.json')

// 确保数据目录和文件存在
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR)
if (!fs.existsSync(EMOTION_FILE)) fs.writeFileSync(EMOTION_FILE, '[]')

/**
 * 统一响应格式
 */
const send = (res, code, data = null, msg = 'ok') => {
  res.json({ code, msg, data })
}

/**
 * 获取当前用户ID（从JWT token或session）
 */
const getCurrentUserId = (req) => {
  // 优先从JWT token获取
  if (req.user && req.user.uid) {
    return req.user.uid
  }
  // 从session获取
  if (req.session && req.session.userId) {
    return req.session.userId
  }
  // 从请求头获取（Demo版兼容）
  const userId = req.headers['x-user-id']
  return userId || GlobalConfig.getCurrentUserId() || ''
}

/**
 * 情绪数据提交接口
 * 请求地址：/api/emotion/submit
 * 请求方式：POST
 * 参数（body）：dataType（String）、content（String）、timestamp（Long）
 * 错误码：400（参数错误）、500（AI分析失败）、1001（Demo专用）
 */
router.post('/submit', async (req, res) => {
  try {
    const { dataType, content, timestamp } = req.body
    const userId = getCurrentUserId(req)

    // 参数验证
    if (!dataType || !content) {
      return send(res, 400, null, '参数错误：缺少dataType或content')
    }

    if (!['text', 'voice', 'behavior'].includes(dataType)) {
      return send(res, 400, null, '参数错误：dataType必须是text/voice/behavior之一')
    }

    // Demo版检查
    if (GlobalConfig.systemConfig.isDemo) {
      // Demo版返回模拟数据
      const mockEmotionTag = GlobalConfig.emotionCommonTags[Math.floor(Math.random() * GlobalConfig.emotionCommonTags.length)]
      const mockResult = {
        id: uuidv4(),
        userId: userId || 'demo-user',
        dataType,
        content,
        timestamp: timestamp || Date.now(),
        emotionTag: mockEmotionTag,
        emotionScore: Math.floor(Math.random() * 40) + 60, // 60-100
        aiAnalysis: 'Demo版AI分析结果：检测到情绪波动，建议关注心理健康',
        createdAt: new Date().toISOString()
      }

      // 模拟存储（实际Demo版不存储）
      return send(res, 200, mockResult, 'Demo版模拟数据：情绪数据提交成功')
    }

    // 正式版逻辑：调用AI分析
    const aiResult = await emotionAnalyzeService.analyzeEmotion(content, dataType)
    if (!aiResult || !aiResult.success) {
      return send(res, 500, null, 'AI分析失败：' + (aiResult?.error || '未知错误'))
    }

    // 存储情绪档案
    const emotionRecord = {
      id: uuidv4(),
      userId,
      dataType,
      content,
      timestamp: timestamp || Date.now(),
      emotionTag: aiResult.emotionTag,
      emotionScore: aiResult.emotionScore,
      aiAnalysis: aiResult.analysis,
      createdAt: new Date().toISOString()
    }

    const emotions = JSON.parse(fs.readFileSync(EMOTION_FILE, 'utf-8') || '[]')
    emotions.push(emotionRecord)
    fs.writeFileSync(EMOTION_FILE, JSON.stringify(emotions, null, 2), 'utf-8')

    // 检查是否需要预警
    const alertResult = await alertService.checkAndAlert(emotionRecord, userId)
    if (alertResult && alertResult.needAlert) {
      emotionRecord.alertInfo = alertResult
    }

    return send(res, 200, emotionRecord, '情绪数据提交成功')
  } catch (error) {
    console.error('情绪数据提交错误:', error)
    return send(res, 500, null, '服务器错误：' + error.message)
  }
})

/**
 * 情绪数据查询接口
 * 请求地址：/api/emotion/history
 * 请求方式：GET
 * 参数：startTime（Long）、endTime（Long）、userId（可选，模块3/模块4调用时可指定）
 * 共享模块：模块3（内容推荐）、模块4（报告生成）
 * 
 * 使用说明：
 * - 模块3/模块4可以调用此接口获取用户情绪历史数据
 * - 如果不指定userId，默认使用当前登录用户
 * - 支持时间范围查询
 */
router.get('/history', (req, res) => {
  try {
    // 支持模块3/模块4指定userId查询
    const requestedUserId = req.query.userId
    const userId = requestedUserId || getCurrentUserId(req)
    const { startTime, endTime } = req.query

    // Demo版检查
    if (GlobalConfig.systemConfig.isDemo) {
      // Demo版返回模拟历史数据
      const mockHistory = []
      const now = Date.now()
      for (let i = 0; i < 10; i++) {
        const mockTag = GlobalConfig.emotionCommonTags[Math.floor(Math.random() * GlobalConfig.emotionCommonTags.length)]
        mockHistory.push({
          id: uuidv4(),
          userId: userId || 'demo-user',
          dataType: ['text', 'voice', 'behavior'][Math.floor(Math.random() * 3)],
          content: `Demo版模拟情绪数据 ${i + 1}`,
          timestamp: now - (i * 86400000), // 每天一条
          emotionTag: mockTag,
          emotionScore: Math.floor(Math.random() * 40) + 60,
          aiAnalysis: 'Demo版AI分析结果',
          createdAt: new Date(now - (i * 86400000)).toISOString()
        })
      }

      // 时间范围过滤
      let filteredHistory = mockHistory
      if (startTime) {
        filteredHistory = filteredHistory.filter(item => item.timestamp >= parseInt(startTime))
      }
      if (endTime) {
        filteredHistory = filteredHistory.filter(item => item.timestamp <= parseInt(endTime))
      }

      return send(res, 200, filteredHistory, 'Demo版模拟数据：情绪历史查询成功')
    }

    // 正式版逻辑：从文件读取
    const emotions = JSON.parse(fs.readFileSync(EMOTION_FILE, 'utf-8') || '[]')
    let userEmotions = emotions.filter(e => e.userId === userId)

    // 时间范围过滤
    if (startTime) {
      userEmotions = userEmotions.filter(e => e.timestamp >= parseInt(startTime))
    }
    if (endTime) {
      userEmotions = userEmotions.filter(e => e.timestamp <= parseInt(endTime))
    }

    // 按时间倒序排列
    userEmotions.sort((a, b) => b.timestamp - a.timestamp)

    // 返回格式化的数据，便于模块3/模块4使用
    const formattedData = userEmotions.map(record => ({
      id: record.id,
      userId: record.userId,
      dataType: record.dataType,
      content: record.content,
      timestamp: record.timestamp,
      emotionTag: record.emotionTag,
      emotionScore: record.emotionScore,
      aiAnalysis: record.aiAnalysis,
      createdAt: record.createdAt
    }))

    return send(res, 200, formattedData, '情绪历史查询成功')
  } catch (error) {
    console.error('情绪历史查询错误:', error)
    return send(res, 500, null, '服务器错误：' + error.message)
  }
})

module.exports = router



