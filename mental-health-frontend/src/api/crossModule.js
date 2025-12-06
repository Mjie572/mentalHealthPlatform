/**
 * 跨模块接口调用封装
 * 集中维护跨模块接口地址/参数规则，便于后续统一修改
 * 
 * 调用的跨模块接口：
 * - /api/user/info - 用户信息接口（模块D）
 * - /api/emotion/history - 情绪数据查询接口（模块A）
 * 
 * 提供的跨模块接口：
 * - /api/points/update - 积分更新接口（供模块C调用）
 */

import request from './request'

// ========== 调用的跨模块接口 ==========

/**
 * 获取用户信息（调用模块D）
 * @param {string} userId - 用户ID
 * @returns {Promise} 用户信息
 */
export const getUserInfo = (userId) => {
  if (!userId) {
    return Promise.reject(new Error('userId不能为空'))
  }
  return request({
    url: '/user/info',
    method: 'get',
    params: { userId }
  })
}

/**
 * 获取情绪数据历史（调用模块A）
 * @param {object} params - 查询参数
 * @param {string} params.userId - 用户ID
 * @param {number} params.limit - 查询数量限制
 * @returns {Promise} 情绪历史数据
 */
export const getEmotionHistory = (params) => {
  if (!params || !params.userId) {
    return Promise.reject(new Error('userId不能为空'))
  }
  return request({
    url: '/emotion/history',
    method: 'get',
    params: {
      userId: params.userId,
      limit: params.limit || 10
    }
  })
}

// ========== 提供的跨模块接口 ==========

/**
 * 积分更新接口（供模块C调用）
 * @param {object} data - 积分更新数据
 * @param {string} data.userId - 用户ID
 * @param {number} data.points - 积分变动值（正数为增加，负数为减少）
 * @param {string} data.source - 积分来源（如'positive_content'、'positive_diary'）
 * @param {string} data.description - 积分变动描述
 * @returns {Promise} 更新结果
 */
export const updatePoints = (data) => {
  if (!data || !data.userId) {
    return Promise.reject(new Error('userId不能为空'))
  }
  if (typeof data.points !== 'number') {
    return Promise.reject(new Error('points必须是数字'))
  }
  if (!data.source) {
    return Promise.reject(new Error('source不能为空'))
  }
  return request({
    url: '/points/update',
    method: 'post',
    data: {
      userId: data.userId,
      points: data.points,
      source: data.source,
      description: data.description || `来自${data.source}的积分变动`
    }
  })
}

