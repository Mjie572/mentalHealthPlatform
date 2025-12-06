/**
 * 统一API请求封装
 * 包含请求拦截、响应拦截
 * 各模块接口文件放在 api/ 目录（如 api/emotion.js、api/decompress.js）
 */

import axios from 'axios'

// 简单的消息提示函数（可替换为实际使用的UI库）
const showMessage = (message, type = 'error') => {
  console[type === 'error' ? 'error' : 'log'](message)
  // TODO: 替换为实际的消息提示组件
  // 例如：使用 BaseNotificationBar 组件
}

// 创建axios实例
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 在发送请求之前做些什么
    // 例如：添加token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    // 对请求错误做些什么
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    // 对响应数据做点什么
    const res = response.data
    
    // 根据后端返回的数据结构进行处理
    // Demo版格式：{ code: 200, msg: "Demo版模拟数据", data: {...} }
    if (res && typeof res === 'object') {
      // 如果返回的是Demo版格式
      if (res.code !== undefined) {
        if (res.code !== 200) {
          // 处理业务错误
          showMessage(res.msg || res.message || '请求失败', 'error')
          return Promise.reject(new Error(res.msg || res.message || '请求失败'))
        }
        // 返回data字段（Demo版格式）
        return res
      }
      // 如果直接返回数据，包装成统一格式
      return { code: 200, msg: 'success', data: res }
    }
    
    return res
  },
  (error) => {
    // 对响应错误做点什么
    console.error('响应错误:', error)
    
    // 处理HTTP错误
    if (error.response) {
      switch (error.response.status) {
        case 401:
          showMessage('未授权，请重新登录', 'error')
          // 可以跳转到登录页
          // router.push('/login')
          break
        case 403:
          showMessage('拒绝访问', 'error')
          break
        case 404:
          showMessage('请求的资源不存在', 'error')
          break
        case 500:
          showMessage('服务器错误', 'error')
          break
        default:
          showMessage(error.response.data?.message || '请求失败', 'error')
      }
    } else {
      showMessage('网络错误，请检查网络连接', 'error')
    }
    
    return Promise.reject(error)
  }
)

export default service

