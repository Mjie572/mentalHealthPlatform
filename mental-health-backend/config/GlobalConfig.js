/**
 * 全局共享变量定义（后端）
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
let currentUserId = ''

/**
 * 用户角色
 * 类型：String
 * 默认值："user"
 * 使用场景：权限控制（管理员/用户/咨询师）
 * 定义位置：前端store/后端数据库
 */
let userRole = 'user'

/**
 * 系统配置
 * 类型：Object
 * 默认值：{debug: false, timeout: 5000, isDemo: true}
 * 使用场景：系统配置（含Demo开关）
 * 定义位置：前端config/后端application.yml
 * 扩展要求：新增isDemo字段（Demo版专用）
 */
const systemConfig = {
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
const emotionCommonTags = ['愉悦', '焦虑', '平静', '烦躁', '低落']

/**
 * 模拟咨询师列表（Demo专用）
 * 类型：Array
 * 默认值：见下方
 * 使用场景：模拟咨询师列表
 * 定义位置：前端common.js/后端GlobalConfig.java
 * 标注：Demo专用
 */
const demoConsultantList = [
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
const demoAppointmentStatus = ['pending', 'confirmed', 'cancelled']

/**
 * 错误码定义
 */
const ErrorCode = {
  SUCCESS: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
  DEMO_NOT_SUPPORTED: 1001 // Demo专用错误码
}

module.exports = {
  getCurrentUserId: () => currentUserId,
  setCurrentUserId: (userId) => { currentUserId = userId || '' },
  getUserRole: () => userRole,
  setUserRole: (role) => { userRole = role || 'user' },
  systemConfig,
  emotionCommonTags,
  demoConsultantList,
  demoAppointmentStatus,
  ErrorCode
}



