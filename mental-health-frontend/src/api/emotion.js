/**
 * 模块1：AI情绪监控与预警模块 API
 * 成员A开发：情绪数据采集接口、情绪档案查询接口
 * 文件命名规范：emotion.js（便于5人分工合并）
 */

import request from './request'

/**
 * 情绪数据提交接口
 * 请求地址：/api/emotion/submit
 * 请求方式：POST
 * 参数（body）：dataType（String）、content（String）、timestamp（Long）
 */
export const submitEmotion = (data) => {
  return request({
    url: '/emotion/submit',
    method: 'post',
    data: {
      dataType: data.dataType, // text/voice/behavior
      content: data.content,
      timestamp: data.timestamp || Date.now()
    }
  })
}

/**
 * 情绪数据查询接口
 * 请求地址：/api/emotion/history
 * 请求方式：GET
 * 参数：startTime（Long）、endTime（Long）
 * 共享模块：模块3（内容推荐）、模块4（报告生成）
 */
export const getEmotionHistory = (params = {}) => {
  return request({
    url: '/emotion/history',
    method: 'get',
    params: {
      startTime: params.startTime,
      endTime: params.endTime
    }
  })
}

/**
 * AI情绪分析接口（直接调用，不推荐，建议通过submit接口）
 * 请求地址：/api/ai/emotion-analyze
 * 请求方式：POST
 * 参数（body）：content（String）、dataType（String）
 */
export const analyzeEmotion = (data) => {
  return request({
    url: '/ai/emotion-analyze',
    method: 'post',
    data: {
      content: data.content,
      dataType: data.dataType // text/voice/behavior
    }
  })
}

// 兼容旧接口名称（保留）
export const collectEmotion = submitEmotion
export const getEmotionArchive = getEmotionHistory

