/**
 * 模块集成服务
 * 提供跨模块数据访问接口
 * 文件命名规范：moduleIntegrationService.js（便于5人分工合并）
 */

const emotionService = require('./emotionService')
const fs = require('fs')
const path = require('path')

const DATA_DIR = path.join(__dirname, '../data')
const APPOINTMENT_FILE = path.join(DATA_DIR, 'appointments.json')

/**
 * 为模块3（内容推荐）提供情绪数据
 * @param {String} userId - 用户ID
 * @param {Number} limit - 返回记录数限制
 * @returns {Array} 情绪历史记录
 */
function getEmotionDataForRecommendation(userId, limit = 10) {
  try {
    const records = emotionService.getEmotionRecordsByUser(userId)
    
    // 返回最近的情绪记录，按时间倒序
    const recentRecords = records
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit)
    
    // 返回格式化的数据供推荐算法使用
    return recentRecords.map(record => ({
      emotionTag: record.emotionTag,
      emotionScore: record.emotionScore,
      timestamp: record.timestamp,
      dataType: record.dataType
    }))
  } catch (error) {
    console.error('获取推荐用情绪数据错误:', error)
    return []
  }
}

/**
 * 为模块4（报告生成）提供情绪统计数据
 * @param {String} userId - 用户ID
 * @param {Number} startTime - 开始时间戳
 * @param {Number} endTime - 结束时间戳
 * @returns {Object} 情绪统计数据
 */
function getEmotionStatsForReport(userId, startTime = null, endTime = null) {
  try {
    const records = emotionService.getEmotionRecordsByUser(userId, startTime, endTime)
    
    if (records.length === 0) {
      return {
        totalRecords: 0,
        averageScore: 0,
        emotionDistribution: {},
        trend: []
      }
    }

    // 计算平均分数
    const totalScore = records.reduce((sum, r) => sum + (r.emotionScore || 0), 0)
    const averageScore = totalScore / records.length

    // 情绪分布统计
    const emotionDistribution = {}
    records.forEach(record => {
      const tag = record.emotionTag || '未知'
      emotionDistribution[tag] = (emotionDistribution[tag] || 0) + 1
    })

    // 趋势数据（按日期分组）
    const trend = {}
    records.forEach(record => {
      const date = new Date(record.timestamp).toISOString().split('T')[0]
      if (!trend[date]) {
        trend[date] = { date, count: 0, totalScore: 0 }
      }
      trend[date].count++
      trend[date].totalScore += record.emotionScore || 0
    })

    const trendArray = Object.values(trend).map(item => ({
      date: item.date,
      count: item.count,
      averageScore: item.totalScore / item.count
    })).sort((a, b) => a.date.localeCompare(b.date))

    return {
      totalRecords: records.length,
      averageScore: Math.round(averageScore * 100) / 100,
      emotionDistribution,
      trend: trendArray,
      timeRange: {
        startTime: startTime || records[records.length - 1].timestamp,
        endTime: endTime || records[0].timestamp
      }
    }
  } catch (error) {
    console.error('获取报告用情绪统计错误:', error)
    return {
      totalRecords: 0,
      averageScore: 0,
      emotionDistribution: {},
      trend: []
    }
  }
}

/**
 * 获取用户预约信息（供模块1使用）
 * @param {String} userId - 用户ID
 * @param {String} status - 预约状态（可选）
 * @returns {Array} 预约列表
 */
function getUserAppointments(userId, status = null) {
  try {
    if (!fs.existsSync(APPOINTMENT_FILE)) {
      return []
    }

    const appointments = JSON.parse(fs.readFileSync(APPOINTMENT_FILE, 'utf-8') || '[]')
    let userAppointments = appointments.filter(a => a.userId === userId)

    if (status) {
      userAppointments = userAppointments.filter(a => a.status === status)
    }

    return userAppointments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  } catch (error) {
    console.error('获取用户预约信息错误:', error)
    return []
  }
}

module.exports = {
  getEmotionDataForRecommendation,
  getEmotionStatsForReport,
  getUserAppointments
}

