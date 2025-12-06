/**
 * 成员B：多维解压服务模块 API
 * 接口调用模板
 */

import request from './request'

// 获取小游戏列表
export const getGames = (params) => {
  return request({
    url: '/decompress/games',
    method: 'get',
    params
  })
}

// 开始游戏
export const startGame = (data) => {
  return request({
    url: '/decompress/games/start',
    method: 'post',
    data
  })
}

// 获取题库
export const getQuestionnaire = (params) => {
  return request({
    url: '/decompress/questionnaire',
    method: 'get',
    params
  })
}

// 提交问卷
export const submitQuestionnaire = (data) => {
  return request({
    url: '/decompress/questionnaire/submit',
    method: 'post',
    data
  })
}

// 使用示例：
// import { getGames } from '@/api/decompress'
// const games = await getGames({ type: 'relax' })

