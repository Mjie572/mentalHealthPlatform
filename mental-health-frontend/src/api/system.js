/**
 * 成员E：系统集成 + 界面引导智能助手模块 API
 * 接口调用模板
 */

import request from './request'

// 智能助手对话
export const chatWithAssistant = (data) => {
  return request({
    url: '/system/assistant/chat',
    method: 'post',
    data
  })
}

// 获取系统配置
export const getSystemConfig = () => {
  return request({
    url: '/system/config',
    method: 'get'
  })
}

// 使用示例：
// import { chatWithAssistant } from '@/api/system'
// const response = await chatWithAssistant({ message: '如何使用情绪监控功能？' })

