/**
 * 统一API请求封装
 * 包含请求拦截、响应拦截
 * 各模块接口文件放在 api/ 目录（如 api/emotion.js、api/decompress.js）
 */

import axios from 'axios'
import router from '@/router/index.js'

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
    // 例如：添加token（支持 localStorage 与 sessionStorage）
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
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
    // 示例：如果后端返回 { code: 200, data: {...}, message: '...' }
    if (res.code && res.code !== 200) {
      // 处理业务错误
      showMessage(res.message || '请求失败', 'error')
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    
    return res
  },
  (error) => {
    // 对响应错误做点什么
    console.error('响应错误:', error)
    
    // 处理HTTP错误
    if (error.response) {
      switch (error.response.status) {
        case 401: {
          showMessage('未授权，请重新登录', 'error')
          // 清理本地登录状态
          localStorage.removeItem('token')
          localStorage.removeItem('username')
          sessionStorage.removeItem('token')
          sessionStorage.removeItem('username')
          // 重定向到登录页，带上当前路径作为redirect
          const currentPath = router.currentRoute.value.fullPath
          if (!currentPath.startsWith('/system/login')) {
            router.replace({ path: '/system/login', query: { redirect: currentPath } })
          }
          break
        }
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

