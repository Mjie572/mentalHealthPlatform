/**
 * 全局共享变量定义（前端）
 * 所有模块必须引用此文件，禁止重复定义
 * 标注依赖关系，便于团队协作
 */

/**
 * 当前用户ID
 * 类型：String
 * 默认值：""
 * 使用场景：数据隔离（情绪档案等关联用户ID）
 * 定义位置：前端store/后端session
 */
export let currentUserId = localStorage.getItem('currentUserId') || sessionStorage.getItem('currentUserId') || ''

/**
 * 用户角色
 * 类型：String
 * 默认值："user"
 * 使用场景：权限控制（管理员/用户/咨询师）
 * 定义位置：前端store/后端数据库
 */
export let userRole = localStorage.getItem('userRole') || sessionStorage.getItem('userRole') || 'user'

/**
 * 系统配置
 * 类型：Object
 * 默认值：{debug: false, timeout: 30000, isDemo: false}
 * 使用场景：系统配置（含Demo开关）
 * 定义位置：前端config/后端application.yml
 * 扩展要求：新增isDemo字段（Demo版专用）
 * 当前状态：正式版，已接入真实Dify API
 */
export const systemConfig = {
  debug: false,
  timeout: 30000, // 增加超时时间以支持Dify API调用
  isDemo: false // 正式版：已接入真实Dify API
}

/**
 * 统一情绪分类标准
 * 类型：Array
 * 默认值：["愉悦","焦虑","平静","烦躁","低落"]
 * 使用场景：统一情绪分类标准
 * 定义位置：前端store/后端枚举类
 */
export const emotionCommonTags = ['愉悦', '焦虑', '平静', '烦躁', '低落']

/**
 * 模拟咨询师列表（Demo专用）
 * 类型：Array
 * 默认值：见下方
 * 使用场景：模拟咨询师列表
 * 定义位置：前端common.js/后端GlobalConfig.java
 * 标注：Demo专用
 */
export const demoConsultantList = [
  {
    id: 'C001',
    name: '模拟咨询师A',
    tag: ['焦虑', '低落']
  },
  {
    id: 'C002',
    name: '模拟咨询师B',
    tag: ['烦躁', '抑郁']
  }
]

/**
 * 预约状态枚举（Demo专用）
 * 类型：Enum
 * 默认值：["pending","confirmed","cancelled"]
 * 使用场景：预约状态枚举
 * 定义位置：前端common.js/后端GlobalConfig.java
 * 标注：Demo专用
 */
export const demoAppointmentStatus = ['pending', 'confirmed', 'cancelled']

/**
 * 更新当前用户ID
 * @param {String} userId - 用户ID
 */
export const setCurrentUserId = (userId) => {
  currentUserId = userId || ''
  localStorage.setItem('currentUserId', currentUserId)
  sessionStorage.setItem('currentUserId', currentUserId)
}

/**
 * 更新用户角色
 * @param {String} role - 用户角色
 */
export const setUserRole = (role) => {
  userRole = role || 'user'
  localStorage.setItem('userRole', userRole)
  sessionStorage.setItem('userRole', userRole)
}

