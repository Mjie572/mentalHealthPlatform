/**
 * 模块1：情绪数据服务
 * 成员A开发：情绪档案存储与查询业务逻辑
 * 文件命名规范：emotionService.js（便于5人分工合并）
 */

const fs = require('fs')
const path = require('path')

const DATA_DIR = path.join(__dirname, '../data')
const EMOTION_FILE = path.join(DATA_DIR, 'emotions.json')

/**
 * 保存情绪记录
 * @param {Object} emotionRecord - 情绪记录
 */
function saveEmotionRecord(emotionRecord) {
  try {
    const emotions = loadEmotionRecords()
    emotions.push(emotionRecord)
    fs.writeFileSync(EMOTION_FILE, JSON.stringify(emotions, null, 2), 'utf-8')
    return true
  } catch (error) {
    console.error('保存情绪记录错误:', error)
    return false
  }
}

/**
 * 加载所有情绪记录
 * @returns {Array} 情绪记录列表
 */
function loadEmotionRecords() {
  try {
    if (!fs.existsSync(EMOTION_FILE)) {
      return []
    }
    const content = fs.readFileSync(EMOTION_FILE, 'utf-8')
    return content ? JSON.parse(content) : []
  } catch (error) {
    console.error('加载情绪记录错误:', error)
    return []
  }
}

/**
 * 根据用户ID查询情绪记录
 * @param {String} userId - 用户ID
 * @param {Number} startTime - 开始时间戳（可选）
 * @param {Number} endTime - 结束时间戳（可选）
 * @returns {Array} 情绪记录列表
 */
function getEmotionRecordsByUser(userId, startTime = null, endTime = null) {
  try {
    const emotions = loadEmotionRecords()
    let userEmotions = emotions.filter(e => e.userId === userId)

    if (startTime) {
      userEmotions = userEmotions.filter(e => e.timestamp >= startTime)
    }
    if (endTime) {
      userEmotions = userEmotions.filter(e => e.timestamp <= endTime)
    }

    // 按时间倒序排列
    userEmotions.sort((a, b) => b.timestamp - a.timestamp)

    return userEmotions
  } catch (error) {
    console.error('查询情绪记录错误:', error)
    return []
  }
}

module.exports = {
  saveEmotionRecord,
  loadEmotionRecords,
  getEmotionRecordsByUser
}



