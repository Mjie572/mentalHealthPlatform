/**
 * 模块1：情绪预警服务
 * 成员A开发：情绪预警规则逻辑、调用模块5预约接口
 * 文件命名规范：alertService.js（便于5人分工合并）
 */

const axios = require('axios')
const GlobalConfig = require('../config/GlobalConfig')

/**
 * 检查情绪是否需要预警
 * @param {Object} emotionRecord - 情绪记录
 * @param {String} userId - 用户ID
 * @returns {Promise<Object>} 预警结果
 */
async function checkAndAlert(emotionRecord, userId) {
  try {
    const { emotionTag, emotionScore, severity } = emotionRecord

    // 预警规则：重度情绪（低落、焦虑、烦躁）且分数低于60
    const severeEmotions = ['低落', '焦虑', '烦躁']
    const needAlert = severeEmotions.includes(emotionTag) && emotionScore < 60

    if (!needAlert) {
      return {
        needAlert: false
      }
    }

    // 需要预警，调用模块5预约接口
    const appointmentResult = await callProfessionalBooking(emotionTag, userId)

    return {
      needAlert: true,
      level: 'high',
      emotionTag,
      emotionScore,
      message: '检测到重度情绪波动，已为您推荐专业咨询师',
      appointment: appointmentResult
    }
  } catch (error) {
    console.error('情绪预警检查错误:', error)
    return {
      needAlert: false,
      error: error.message
    }
  }
}

/**
 * 调用模块5专业咨询预约接口
 * 请求地址：/api/professional/book
 * 请求方式：POST
 * 参数（body）：consultantId（可选）、emotionTag（String）、timeSlot（String）
 * 触发场景：模块1重度情绪预警时调用
 */
async function callProfessionalBooking(emotionTag, userId) {
  try {
    // Demo版逻辑
    if (GlobalConfig.systemConfig.isDemo) {
      // 根据情绪标签匹配咨询师
      const matchedConsultant = GlobalConfig.demoConsultantList.find(
        consultant => consultant.tag.includes(emotionTag)
      ) || GlobalConfig.demoConsultantList[0]

      return {
        success: true,
        appointmentId: `DEMO-${Date.now()}`,
        consultantId: matchedConsultant.id,
        consultantName: matchedConsultant.name,
        emotionTag,
        timeSlot: '2024-12-10 14:00-15:00',
        status: 'pending',
        message: 'Demo版模拟数据：预约成功'
      }
    }

    // 正式版：调用模块5预约服务（内部调用）
    try {
      const professionalService = require('./professionalService')
      const result = await professionalService.createAppointment({
        userId,
        emotionTag,
        consultantId: null, // 自动匹配
        timeSlot: null // 自动推荐
      })

      if (result.success) {
        return {
          success: true,
          appointmentId: result.appointmentId,
          consultantId: result.consultantId,
          consultantName: result.consultantName,
          emotionTag: result.emotionTag,
          timeSlot: result.timeSlot,
          status: result.status
        }
      } else {
        throw new Error(result.error || '预约失败')
      }
    } catch (error) {
      // 模块5接口调用失败，返回错误但不影响主流程
      console.error('模块5预约接口调用失败:', error)
      return {
        success: false,
        error: error.message || '预约接口暂时不可用，请稍后重试'
      }
    }
  } catch (error) {
    console.error('专业咨询预约错误:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

module.exports = {
  checkAndAlert,
  callProfessionalBooking
}



