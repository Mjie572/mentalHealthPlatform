/**
 * 成员C：积极情绪赋能模块 API
 * 接口调用模板
 */

import request from './request'

// 获取内容推送列表
export const getContentList = (params) => {
  return request({
    url: '/positive/content',
    method: 'get',
    params
  })
}

// 获取日记列表
export const getDiaryList = (params) => {
  return request({
    url: '/positive/diary',
    method: 'get',
    params
  })
}

// 创建日记
export const createDiary = (data) => {
  return request({
    url: '/positive/diary',
    method: 'post',
    data
  })
}

// 更新日记
export const updateDiary = (id, data) => {
  return request({
    url: `/positive/diary/${id}`,
    method: 'put',
    data
  })
}

// 使用示例：
// import { createDiary } from '@/api/positive'
// const result = await createDiary({ content: '今天很开心...', date: '2025-12-06' })


export const postPositiveContent = async (data) => {
  const base = import.meta.env.VITE_API_BASE_URL || '/api'
  const url = (base.endsWith('/') ? base.slice(0, -1) : base) + '/positive/content'
  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data || {})
    })
    const json = await resp.json()
    return json
  } catch (e) {
    return request({
      url: '/positive/content',
      method: 'post',
      data
    })
  }
}

