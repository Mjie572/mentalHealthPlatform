/**
 * 成员A：AI情绪监控与预警模块 API
 * 接口调用模板
 */

import request from './request'

// 情绪采集接口
export const collectEmotion = (data) => {
  return request({
    url: '/emotion/collect',
    method: 'post',
    data
  })
}

// 获取情绪档案
export const getEmotionArchive = (params) => {
  return request({
    url: '/emotion/archive',
    method: 'get',
    params
  })
}

// 获取预警信息
export const getEmotionAlerts = (params) => {
  return request({
    url: '/emotion/alerts',
    method: 'get',
    params
  })
}

// 使用示例：
// import { collectEmotion } from '@/api/emotion'
// const result = await collectEmotion({ mood: 'happy', score: 8 })

