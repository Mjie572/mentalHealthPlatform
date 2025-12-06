/**
 * 成员D：个性化心理方案与数据模块 API
 * 包含dify API调用功能
 */

import request from './request'
import axios from 'axios'

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

// Dify API调用 - 执行workflow
export const executeDifyWorkflow = async (workflowId, inputs, customConfig = {}) => {
  try {
    // 使用传入的自定义配置或默认配置
    const baseURL = customConfig.baseURL || import.meta.env.VITE_DIFY_API_BASE_URL || 'http://localhost/v1'
    const apiKey = customConfig.apiKey || import.meta.env.VITE_DIFY_API_KEY || 'app-PH0D2DOOijRpNw7zVk5vPRaa'
    
    const response = await axios.post(
      `${baseURL}/workflows/${workflowId}/run`,
      {
        inputs,
        response_mode: 'blocking'
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    )
    return response.data
  } catch (error) {
    console.error('Dify API调用失败:', error)
    throw error
  }
}

// 使用示例：
// import { executeDifyWorkflow } from '@/api/personalized'
// const result = await executeDifyWorkflow('workflow-id', { user_id: '123', emotion_data: {...} })

