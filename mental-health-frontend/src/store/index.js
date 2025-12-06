/**
 * 全局状态管理 - 公共依赖规范
 * 严格遵循项目框架文档中的公共依赖规范
 * 
 * 全局共享变量：
 * - currentUserId: 用户隔离
 * - userRole: 权限控制
 * - systemConfig: 系统配置（包含debug模式）
 * - emotionCommonTags: 统一情绪标签
 * 
 * 跨模块变量：
 * - latestEmotionScore: 关联情绪评分
 * - userPreference: 适配用户偏好
 * - activeTaskCount: 未完成任务数（关联积分/勋章）
 */

import { reactive, readonly } from 'vue'

// ========== 全局共享状态 ==========
const globalState = reactive({
  // 用户隔离（必须）
  currentUserId: localStorage.getItem('currentUserId') || 'demo_user_001',
  
  // 权限控制（可选）
  userRole: localStorage.getItem('userRole') || 'user',
  
  // 系统配置（必须，包含debug模式）
  systemConfig: {
    debug: true, // Demo版标识
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
    difyApiUrl: '/api/ai',
    version: '1.0.0'
  },
  
  // 统一情绪标签（Dify对接使用）
  emotionCommonTags: [
    '焦虑', '压力', '抑郁', '愤怒', '恐惧',
    '快乐', '平静', '兴奋', '满足', '疲惫'
  ]
})

// ========== 跨模块状态 ==========
const crossModuleState = reactive({
  // 最新情绪评分（关联情绪监控模块）
  latestEmotionScore: null,
  
  // 用户偏好（适配个性化方案模块）
  userPreference: {
    theme: 'light',
    language: 'zh-CN',
    notification: true
  },
  
  // 未完成任务数（关联积分/勋章系统）
  activeTaskCount: parseInt(localStorage.getItem('activeTaskCount') || '0', 10)
})

// ========== 全局状态更新函数 ==========

/**
 * 设置当前用户ID
 * @param {string} userId - 用户ID
 */
export const setCurrentUserId = (userId) => {
  if (!userId) {
    console.warn('currentUserId不能为空')
    return
  }
  globalState.currentUserId = userId
  localStorage.setItem('currentUserId', userId)
}

/**
 * 设置用户角色
 * @param {string} role - 用户角色
 */
export const setUserRole = (role) => {
  globalState.userRole = role
  localStorage.setItem('userRole', role)
}

/**
 * 更新系统配置
 * @param {object} config - 配置对象
 */
export const updateSystemConfig = (config) => {
  Object.assign(globalState.systemConfig, config)
}

/**
 * 设置情绪标签
 * @param {string[]} tags - 情绪标签数组
 */
export const setEmotionCommonTags = (tags) => {
  if (Array.isArray(tags)) {
    globalState.emotionCommonTags = [...tags]
  }
}

// ========== 跨模块状态更新函数 ==========

/**
 * 更新最新情绪评分
 * @param {number|null} score - 情绪评分
 */
export const setLatestEmotionScore = (score) => {
  crossModuleState.latestEmotionScore = score
}

/**
 * 更新用户偏好
 * @param {object} preference - 偏好对象
 */
export const updateUserPreference = (preference) => {
  Object.assign(crossModuleState.userPreference, preference)
}

/**
 * 更新未完成任务数（打卡完成后调用）
 * @param {number} count - 任务数
 */
export const setActiveTaskCount = (count) => {
  if (typeof count !== 'number' || count < 0) {
    console.warn('activeTaskCount必须是大于等于0的数字')
    return
  }
  crossModuleState.activeTaskCount = count
  localStorage.setItem('activeTaskCount', count.toString())
}

/**
 * 增加任务数
 * @param {number} increment - 增加的数量（默认1）
 */
export const incrementActiveTaskCount = (increment = 1) => {
  setActiveTaskCount(crossModuleState.activeTaskCount + increment)
}

/**
 * 减少任务数（打卡完成后调用）
 * @param {number} decrement - 减少的数量（默认1）
 */
export const decrementActiveTaskCount = (decrement = 1) => {
  const newCount = Math.max(0, crossModuleState.activeTaskCount - decrement)
  setActiveTaskCount(newCount)
}

// ========== 导出只读状态（防止直接修改） ==========

/**
 * 获取全局状态（只读）
 * @returns {Readonly} 全局状态对象
 */
export const useGlobalState = () => readonly(globalState)

/**
 * 获取跨模块状态（只读）
 * @returns {Readonly} 跨模块状态对象
 */
export const useCrossModuleState = () => readonly(crossModuleState)

// ========== 兼容性检查函数 ==========

/**
 * 检查公共依赖是否已初始化
 * @returns {object} 检查结果
 */
export const checkPublicDependencies = () => {
  const issues = []
  
  if (!globalState.currentUserId) {
    issues.push('currentUserId未初始化')
  }
  
  if (!globalState.systemConfig) {
    issues.push('systemConfig未初始化')
  }
  
  if (!Array.isArray(globalState.emotionCommonTags) || globalState.emotionCommonTags.length === 0) {
    issues.push('emotionCommonTags未初始化或为空')
  }
  
  return {
    isValid: issues.length === 0,
    issues
  }
}

