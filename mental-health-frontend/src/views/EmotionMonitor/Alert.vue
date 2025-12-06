<template>
  <div class="emotion-alert">
    <div class="page-header">
      <h2>预警通知组件</h2>
      <p>成员A开发：对接预警系统，显示重度情绪预警信息</p>
    </div>

    <div class="alert-container">
      <!-- 预警统计 -->
      <div class="alert-stats">
        <div class="stat-card high-alert">
          <div class="stat-icon">⚠️</div>
          <div class="stat-content">
            <div class="stat-value">{{ highAlerts.length }}</div>
            <div class="stat-label">重度预警</div>
          </div>
        </div>
        <div class="stat-card total-alert">
          <div class="stat-icon">📊</div>
          <div class="stat-content">
            <div class="stat-value">{{ allAlerts.length }}</div>
            <div class="stat-label">总预警数</div>
          </div>
        </div>
      </div>

      <!-- 预警列表 -->
      <div v-if="allAlerts.length > 0" class="alert-list">
        <div
          v-for="alert in allAlerts"
          :key="alert.id"
          :class="['alert-item', { 'high-level': alert.level === 'high' }]"
        >
          <div class="alert-header">
            <div class="alert-level">
              <span class="level-icon">{{ alert.level === 'high' ? '🔴' : '🟡' }}</span>
              <span class="level-text">{{ alert.level === 'high' ? '重度预警' : '一般预警' }}</span>
            </div>
            <div class="alert-time">
              {{ formatTime(alert.timestamp) }}
            </div>
          </div>
          <div class="alert-content">
            <div class="alert-message">
              {{ alert.message }}
            </div>
            <div class="alert-details">
              <div class="detail-item">
                <span class="detail-label">情绪标签：</span>
                <span
                  class="detail-value emotion-tag"
                  :class="getEmotionClass(alert.emotionTag)"
                >
                  {{ alert.emotionTag }}
                </span>
              </div>
              <div class="detail-item">
                <span class="detail-label">情绪分数：</span>
                <span class="detail-value">{{ alert.emotionScore }} / 100</span>
              </div>
            </div>
          </div>
          <div v-if="alert.appointment" class="appointment-section">
            <div class="appointment-header">
              <span class="appointment-icon">👨‍⚕️</span>
              <span class="appointment-title">已推荐专业咨询</span>
            </div>
            <div class="appointment-details">
              <div class="appointment-item">
                <span class="appointment-label">咨询师：</span>
                <span class="appointment-value">{{ alert.appointment.consultantName }}</span>
              </div>
              <div class="appointment-item">
                <span class="appointment-label">预约ID：</span>
                <span class="appointment-value">{{ alert.appointment.appointmentId }}</span>
              </div>
              <div v-if="alert.appointment.timeSlot" class="appointment-item">
                <span class="appointment-label">时间：</span>
                <span class="appointment-value">{{ alert.appointment.timeSlot }}</span>
              </div>
              <div class="appointment-item">
                <span class="appointment-label">状态：</span>
                <span class="appointment-status" :class="getStatusClass(alert.appointment.status)">
                  {{ getStatusText(alert.appointment.status) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-state">
        <p>✅ 暂无预警信息</p>
        <p class="empty-hint">您的情绪状态良好，继续保持！</p>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <p>加载中...</p>
      </div>

      <!-- 错误提示 -->
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getEmotionHistory } from '@/api/emotion'
import { formatDate } from '@/utils/index'

// 数据状态
const loading = ref(false)
const allAlerts = ref([])
const errorMessage = ref('')

// 重度预警列表
const highAlerts = computed(() => {
  return allAlerts.value.filter(alert => alert.level === 'high')
})

// 获取情绪样式类
const getEmotionClass = (tag) => {
  const classMap = {
    '愉悦': 'emotion-positive',
    '平静': 'emotion-neutral',
    '焦虑': 'emotion-warning',
    '烦躁': 'emotion-warning',
    '低落': 'emotion-danger'
  }
  return classMap[tag] || 'emotion-neutral'
}

// 获取状态样式类
const getStatusClass = (status) => {
  const classMap = {
    'pending': 'status-pending',
    'confirmed': 'status-confirmed',
    'cancelled': 'status-cancelled'
  }
  return classMap[status] || 'status-pending'
}

// 获取状态文本
const getStatusText = (status) => {
  const textMap = {
    'pending': '待确认',
    'confirmed': '已确认',
    'cancelled': '已取消'
  }
  return textMap[status] || status
}

// 格式化时间
const formatTime = (timestamp) => {
  if (!timestamp) return '-'
  const date = new Date(timestamp)
  return formatDate(date, 'YYYY-MM-DD HH:mm:ss')
}

// 加载预警数据
const loadAlerts = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    // 从情绪历史中提取预警信息
    const response = await getEmotionHistory()

    if (response.code === 200) {
      const history = response.data || []
      
      // 筛选出有预警信息的记录
      allAlerts.value = history
        .filter(item => item.alertInfo && item.alertInfo.needAlert)
        .map(item => ({
          id: item.id,
          level: item.alertInfo.level || 'normal',
          message: item.alertInfo.message || '检测到情绪波动',
          emotionTag: item.emotionTag,
          emotionScore: item.emotionScore,
          timestamp: item.timestamp,
          appointment: item.alertInfo.appointment
        }))
        .sort((a, b) => b.timestamp - a.timestamp) // 按时间倒序
    } else {
      errorMessage.value = response.msg || '查询失败'
      allAlerts.value = []
    }
  } catch (error) {
    console.error('预警数据加载错误:', error)
    errorMessage.value = error.message || '网络错误，请稍后重试'
    allAlerts.value = []
  } finally {
    loading.value = false
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadAlerts()
})
</script>

<style scoped>
.emotion-alert {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.page-header {
  margin-bottom: 32px;
}

.page-header h2 {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.page-header p {
  font-size: 14px;
  color: var(--text-secondary);
}

.alert-container {
  background: #fff;
  border-radius: var(--border-radius-lg);
  padding: 32px;
  box-shadow: var(--shadow-sm);
}

.alert-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  border-radius: var(--border-radius-md);
  border-left: 4px solid;
}

.stat-card.high-alert {
  background: #ffebee;
  border-color: #c62828;
}

.stat-card.total-alert {
  background: var(--primary-light);
  border-color: var(--primary-color);
}

.stat-icon {
  font-size: 40px;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: var(--text-secondary);
}

.alert-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.alert-item {
  padding: 20px;
  background: #f9f9f9;
  border-radius: var(--border-radius-md);
  border-left: 4px solid var(--primary-color);
  transition: all 0.3s;
}

.alert-item.high-level {
  background: #fff3e0;
  border-left-color: #ff9800;
}

.alert-item:hover {
  box-shadow: var(--shadow-sm);
  transform: translateX(4px);
}

.alert-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.alert-level {
  display: flex;
  align-items: center;
  gap: 8px;
}

.level-icon {
  font-size: 20px;
}

.level-text {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.alert-time {
  font-size: 12px;
  color: var(--text-secondary);
}

.alert-content {
  margin-bottom: 16px;
}

.alert-message {
  font-size: 15px;
  color: var(--text-primary);
  font-weight: 500;
  margin-bottom: 12px;
  padding: 12px;
  background: #fff;
  border-radius: var(--border-radius-sm);
}

.alert-details {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-label {
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 500;
}

.detail-value {
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 600;
}

.emotion-tag {
  padding: 4px 12px;
  border-radius: var(--border-radius-sm);
}

.appointment-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 2px solid var(--border-color);
}

.appointment-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.appointment-icon {
  font-size: 20px;
}

.appointment-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--primary-color);
}

.appointment-details {
  padding: 12px;
  background: #fff;
  border-radius: var(--border-radius-sm);
}

.appointment-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.appointment-item:last-child {
  margin-bottom: 0;
}

.appointment-label {
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 500;
  min-width: 80px;
}

.appointment-value {
  font-size: 14px;
  color: var(--text-primary);
}

.appointment-status {
  padding: 4px 12px;
  border-radius: var(--border-radius-sm);
  font-size: 14px;
  font-weight: 600;
}

.status-pending {
  background: #fff3e0;
  color: #f57c00;
}

.status-confirmed {
  background: #e8f5e9;
  color: #2e7d32;
}

.status-cancelled {
  background: #ffebee;
  color: #c62828;
}

.emotion-positive {
  background: #e8f5e9;
  color: #2e7d32;
}

.emotion-neutral {
  background: #e3f2fd;
  color: #1976d2;
}

.emotion-warning {
  background: #fff3e0;
  color: #f57c00;
}

.emotion-danger {
  background: #ffebee;
  color: #c62828;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);
}

.empty-hint {
  margin-top: 8px;
  font-size: 14px;
}

.error-message {
  padding: 16px;
  background: #ffebee;
  color: #c62828;
  border-radius: var(--border-radius-md);
  border-left: 4px solid #c62828;
  margin-top: 16px;
}
</style>
