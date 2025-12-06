/**
 * 模块5：专业咨询预约服务
 * 成员E开发：预约业务逻辑
 * 文件命名规范：professionalService.js（便于5人分工合并）
 */

const fs = require('fs')
const path = require('path')
const { v4: uuidv4 } = require('uuid')
const GlobalConfig = require('../config/GlobalConfig')

const DATA_DIR = path.join(__dirname, '../data')
const APPOINTMENT_FILE = path.join(DATA_DIR, 'appointments.json')

// 确保数据目录和文件存在
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR)
if (!fs.existsSync(APPOINTMENT_FILE)) fs.writeFileSync(APPOINTMENT_FILE, '[]')

/**
 * 创建预约
 * @param {Object} params - 预约参数
 * @param {String} params.userId - 用户ID
 * @param {String} params.emotionTag - 情绪标签
 * @param {String} params.consultantId - 咨询师ID（可选）
 * @param {String} params.timeSlot - 时间段（可选）
 * @returns {Promise<Object>} 预约结果
 */
async function createAppointment(params) {
  try {
    const { userId, emotionTag, consultantId, timeSlot } = params

    if (!userId || !emotionTag) {
      return {
        success: false,
        error: '缺少必要参数：userId或emotionTag'
      }
    }

    // 1. 匹配咨询师
    let selectedConsultant = null
    if (consultantId) {
      const consultantList = GlobalConfig.demoConsultantList // 实际应该从数据库获取
      selectedConsultant = consultantList.find(c => c.id === consultantId)
      if (!selectedConsultant) {
        return {
          success: false,
          error: '咨询师不存在'
        }
      }
    } else {
      // 根据emotionTag自动匹配
      const consultantList = GlobalConfig.demoConsultantList // 实际应该从数据库获取
      selectedConsultant = consultantList.find(c => c.tag.includes(emotionTag))
      if (!selectedConsultant) {
        selectedConsultant = consultantList[0] // 默认选择第一个
      }
    }

    // 2. 生成推荐时间段
    let appointmentTimeSlot = timeSlot
    if (!appointmentTimeSlot) {
      const now = new Date()
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(14, 0, 0, 0) // 明天下午2点
      const endTime = new Date(tomorrow)
      endTime.setHours(15, 0, 0, 0) // 明天下午3点
      appointmentTimeSlot = `${tomorrow.toISOString().split('T')[0]} 14:00-15:00`
    }

    // 3. 创建预约记录
    const appointment = {
      id: uuidv4(),
      appointmentId: `APT-${Date.now()}`,
      userId,
      consultantId: selectedConsultant.id,
      consultantName: selectedConsultant.name,
      emotionTag,
      timeSlot: appointmentTimeSlot,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // 4. 保存预约记录
    const appointments = JSON.parse(fs.readFileSync(APPOINTMENT_FILE, 'utf-8') || '[]')
    appointments.push(appointment)
    fs.writeFileSync(APPOINTMENT_FILE, JSON.stringify(appointments, null, 2), 'utf-8')

    return {
      success: true,
      appointmentId: appointment.appointmentId,
      consultantId: appointment.consultantId,
      consultantName: appointment.consultantName,
      emotionTag: appointment.emotionTag,
      timeSlot: appointment.timeSlot,
      status: appointment.status,
      createdAt: appointment.createdAt
    }
  } catch (error) {
    console.error('创建预约错误:', error)
    return {
      success: false,
      error: error.message || '创建预约失败'
    }
  }
}

/**
 * 查询用户预约列表
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
    console.error('查询用户预约列表错误:', error)
    return []
  }
}

/**
 * 更新预约状态
 * @param {String} appointmentId - 预约ID
 * @param {String} userId - 用户ID
 * @param {String} status - 新状态
 * @returns {Object} 更新结果
 */
function updateAppointmentStatus(appointmentId, userId, status) {
  try {
    if (!fs.existsSync(APPOINTMENT_FILE)) {
      return { success: false, error: '预约文件不存在' }
    }

    const appointments = JSON.parse(fs.readFileSync(APPOINTMENT_FILE, 'utf-8') || '[]')
    const appointment = appointments.find(a => a.appointmentId === appointmentId && a.userId === userId)

    if (!appointment) {
      return { success: false, error: '预约不存在' }
    }

    appointment.status = status
    appointment.updatedAt = new Date().toISOString()

    fs.writeFileSync(APPOINTMENT_FILE, JSON.stringify(appointments, null, 2), 'utf-8')

    return { success: true, appointment }
  } catch (error) {
    console.error('更新预约状态错误:', error)
    return { success: false, error: error.message }
  }
}

module.exports = {
  createAppointment,
  getUserAppointments,
  updateAppointmentStatus
}

