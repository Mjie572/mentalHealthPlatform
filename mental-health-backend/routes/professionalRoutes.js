/**
 * 模块5：专业咨询预约模块 - 路由文件
 * 成员E开发：专业咨询预约接口
 * 文件命名规范：professionalRoutes.js（便于5人分工合并）
 */

const express = require('express')
const router = express.Router()
const professionalService = require('../services/professionalService')
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
 * 专业咨询预约接口（正式版）
 * 请求地址：/api/professional/book
 * 请求方式：POST
 * 参数（body）：consultantId（可选）、emotionTag（String）、timeSlot（String）
 * 触发场景：模块1重度情绪预警时调用
 */
router.post('/book', async (req, res) => {
  try {
    const { consultantId, emotionTag, timeSlot } = req.body
    const userId = getCurrentUserId(req)

    if (!userId) {
      return send(res, 401, null, '未登录')
    }

    // 参数验证
    if (!emotionTag) {
      return send(res, 400, null, '参数错误：缺少emotionTag')
    }

    // Demo版逻辑
    if (GlobalConfig.systemConfig.isDemo) {
      const matchedConsultant = GlobalConfig.demoConsultantList.find(
        c => consultantId ? c.id === consultantId : c.tag.includes(emotionTag)
      ) || GlobalConfig.demoConsultantList[0]

      return send(res, 200, {
        appointmentId: `DEMO-${Date.now()}`,
        consultantId: matchedConsultant.id,
        consultantName: matchedConsultant.name,
        emotionTag: emotionTag || '焦虑',
        timeSlot: timeSlot || '2024-12-10 14:00-15:00',
        status: 'pending'
      }, 'Demo版模拟数据：预约成功')
    }

    // 正式版逻辑：调用预约服务
    const result = await professionalService.createAppointment({
      userId,
      emotionTag,
      consultantId,
      timeSlot
    })

    if (!result.success) {
      return send(res, 400, null, result.error || '预约失败')
    }

    return send(res, 200, {
      appointmentId: result.appointmentId,
      consultantId: result.consultantId,
      consultantName: result.consultantName,
      emotionTag: result.emotionTag,
      timeSlot: result.timeSlot,
      status: result.status,
      createdAt: result.createdAt
    }, '预约成功')
  } catch (error) {
    console.error('预约接口错误:', error)
    return send(res, 500, null, '服务器错误：' + error.message)
  }
})

/**
 * 查询预约列表
 * 请求地址：/api/professional/appointments
 * 请求方式：GET
 * 参数：status（可选，pending/confirmed/cancelled）
 */
router.get('/appointments', (req, res) => {
  try {
    const userId = getCurrentUserId(req)
    const { status } = req.query

    if (!userId) {
      return send(res, 401, null, '未登录')
    }

    // 调用服务查询预约列表
    const appointments = professionalService.getUserAppointments(userId, status)

    return send(res, 200, appointments, '查询成功')
  } catch (error) {
    console.error('查询预约列表错误:', error)
    return send(res, 500, null, '服务器错误：' + error.message)
  }
})

/**
 * 取消预约
 * 请求地址：/api/professional/appointments/:appointmentId/cancel
 * 请求方式：POST
 */
router.post('/appointments/:appointmentId/cancel', (req, res) => {
  try {
    const userId = getCurrentUserId(req)
    const { appointmentId } = req.params

    if (!userId) {
      return send(res, 401, null, '未登录')
    }

    // 调用服务更新预约状态
    const result = professionalService.updateAppointmentStatus(appointmentId, userId, 'cancelled')

    if (!result.success) {
      if (result.error === '预约不存在') {
        return send(res, 404, null, result.error)
      }
      return send(res, 400, null, result.error || '取消失败')
    }

    return send(res, 200, result.appointment, '取消成功')
  } catch (error) {
    console.error('取消预约错误:', error)
    return send(res, 500, null, '服务器错误：' + error.message)
  }
})

/**
 * 确认预约
 * 请求地址：/api/professional/appointments/:appointmentId/confirm
 * 请求方式：POST
 */
router.post('/appointments/:appointmentId/confirm', (req, res) => {
  try {
    const userId = getCurrentUserId(req)
    const { appointmentId } = req.params

    if (!userId) {
      return send(res, 401, null, '未登录')
    }

    // 调用服务更新预约状态
    const result = professionalService.updateAppointmentStatus(appointmentId, userId, 'confirmed')

    if (!result.success) {
      if (result.error === '预约不存在') {
        return send(res, 404, null, result.error)
      }
      return send(res, 400, null, result.error || '确认失败')
    }

    return send(res, 200, result.appointment, '确认成功')
  } catch (error) {
    console.error('确认预约错误:', error)
    return send(res, 500, null, '服务器错误：' + error.message)
  }
})

module.exports = router

