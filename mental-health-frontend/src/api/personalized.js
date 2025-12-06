/**
 * 成员D：个性化心理方案与数据模块 API
 * 接口调用模板
 */

import request from './request'

// 获取个性化方案
export const getPersonalizedPlan = (params) => {
  return request({
    url: '/personalized/plan',
    method: 'get',
    params
  })
}

// 获取数据报告
export const getDataReport = (params) => {
  return request({
    url: '/personalized/report',
    method: 'get',
    params
  })
}

// 获取统计数据
export const getStatistics = (params) => {
  return request({
    url: '/personalized/statistics',
    method: 'get',
    params
  })
}

// 使用示例：
// import { getDataReport } from '@/api/personalized'
// const report = await getDataReport({ startDate: '2025-11-01', endDate: '2025-12-06' })

