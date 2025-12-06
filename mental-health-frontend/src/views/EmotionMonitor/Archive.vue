<template>
  <div class="emotion-archive">
    <div class="page-header">
      <h2>情绪档案可视化</h2>
      <p>成员A开发：对接情绪数据展示，支持时间范围查询</p>
    </div>

    <div class="archive-container">
      <!-- 查询条件 -->
      <div class="filter-section">
        <div class="filter-item">
          <label>开始时间：</label>
          <input
            v-model="filterForm.startTime"
            type="date"
            class="filter-input"
            @change="handleFilterChange"
          />
        </div>
        <div class="filter-item">
          <label>结束时间：</label>
          <input
            v-model="filterForm.endTime"
            type="date"
            class="filter-input"
            @change="handleFilterChange"
          />
        </div>
        <button class="filter-btn" @click="handleRefresh">
          🔄 刷新
        </button>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <p>加载中...</p>
      </div>

      <!-- 数据统计 -->
      <div v-if="!loading && emotionHistory.length > 0" class="stats-section">
        <div class="stat-card">
          <div class="stat-value">{{ emotionHistory.length }}</div>
          <div class="stat-label">总记录数</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ averageScore.toFixed(1) }}</div>
          <div class="stat-label">平均情绪分数</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ mostCommonTag }}</div>
          <div class="stat-label">最常见情绪</div>
        </div>
      </div>

      <!-- 情绪历史列表 -->
      <div v-if="!loading && emotionHistory.length > 0" class="history-list">
        <div
          v-for="item in emotionHistory"
          :key="item.id"
          class="history-item"
        >
          <div class="item-header">
            <div class="item-type">
              <span class="type-icon">{{ getTypeIcon(item.dataType) }}</span>
              <span class="type-label">{{ getTypeLabel(item.dataType) }}</span>
            </div>
            <div class="item-time">
              {{ formatTime(item.timestamp) }}
            </div>
          </div>
          <div class="item-content">
            <p class="content-text">{{ item.content }}</p>
          </div>
          <div class="item-result">
            <div class="result-tag">
              <span class="tag-label">情绪：</span>
              <span
                class="tag-value"
                :class="getEmotionClass(item.emotionTag)"
              >
                {{ item.emotionTag }}
              </span>
            </div>
            <div class="result-score">
              <span class="score-label">分数：</span>
              <span class="score-value">{{ item.emotionScore }} / 100</span>
            </div>
          </div>
          <div v-if="item.aiAnalysis" class="item-analysis">
            <p class="analysis-text">{{ item.aiAnalysis }}</p>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="!loading && emotionHistory.length === 0" class="empty-state">
        <p>📊 暂无情绪记录</p>
        <p class="empty-hint">请前往情绪采集页面提交您的情绪数据</p>
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
import { currentUserId } from '@/utils/common'

// 查询表单
const filterForm = ref({
  startTime: '',
  endTime: ''
})

// 数据状态
const loading = ref(false)
const emotionHistory = ref([])
const errorMessage = ref('')

// 统计数据
const averageScore = computed(() => {
  if (emotionHistory.value.length === 0) return 0
  const sum = emotionHistory.value.reduce((acc, item) => acc + (item.emotionScore || 0), 0)
  return sum / emotionHistory.value.length
})

const mostCommonTag = computed(() => {
  if (emotionHistory.value.length === 0) return '-'
  const tagCount = {}
  emotionHistory.value.forEach(item => {
    const tag = item.emotionTag || '未知'
    tagCount[tag] = (tagCount[tag] || 0) + 1
  })
  const sorted = Object.entries(tagCount).sort((a, b) => b[1] - a[1])
  return sorted.length > 0 ? sorted[0][0] : '-'
})

// 获取类型图标
const getTypeIcon = (type) => {
  const iconMap = {
    text: '📝',
    voice: '🎤',
    behavior: '👤'
  }
  return iconMap[type] || '📄'
}

// 获取类型标签
const getTypeLabel = (type) => {
  const labelMap = {
    text: '文本',
    voice: '语音',
    behavior: '行为'
  }
  return labelMap[type] || type
}

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

// 格式化时间
const formatTime = (timestamp) => {
  if (!timestamp) return '-'
  const date = new Date(timestamp)
  return formatDate(date, 'YYYY-MM-DD HH:mm:ss')
}

// 查询条件变化
const handleFilterChange = () => {
  loadHistory()
}

// 刷新数据
const handleRefresh = () => {
  loadHistory()
}

// 加载情绪历史
const loadHistory = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const params = {}
    if (filterForm.value.startTime) {
      params.startTime = new Date(filterForm.value.startTime).getTime()
    }
    if (filterForm.value.endTime) {
      // 结束时间设置为当天的23:59:59
      const endDate = new Date(filterForm.value.endTime)
      endDate.setHours(23, 59, 59, 999)
      params.endTime = endDate.getTime()
    }

    const response = await getEmotionHistory(params)

    if (response.code === 200) {
      emotionHistory.value = response.data || []
    } else {
      errorMessage.value = response.msg || '查询失败'
      emotionHistory.value = []
    }
  } catch (error) {
    console.error('情绪历史查询错误:', error)
    errorMessage.value = error.message || '网络错误，请稍后重试'
    emotionHistory.value = []
  } finally {
    loading.value = false
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadHistory()
})
</script>

<style scoped>
.emotion-archive {
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

.archive-container {
  background: #fff;
  border-radius: var(--border-radius-lg);
  padding: 32px;
  box-shadow: var(--shadow-sm);
}

.filter-section {
  display: flex;
  gap: 16px;
  align-items: flex-end;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--border-color);
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-item label {
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 500;
}

.filter-input {
  padding: 8px 12px;
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  font-size: 14px;
  transition: border-color 0.3s;
}

.filter-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.filter-btn {
  padding: 8px 16px;
  background: var(--primary-color);
  color: #fff;
  border: none;
  border-radius: var(--border-radius-sm);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.filter-btn:hover {
  background: var(--primary-dark);
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.stat-card {
  padding: 24px;
  background: var(--primary-light);
  border-radius: var(--border-radius-md);
  text-align: center;
}

.stat-value {
  font-size: 32px;
  font-weight: 600;
  color: var(--primary-color);
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: var(--text-secondary);
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.history-item {
  padding: 20px;
  background: #f9f9f9;
  border-radius: var(--border-radius-md);
  border-left: 4px solid var(--primary-color);
  transition: all 0.3s;
}

.history-item:hover {
  box-shadow: var(--shadow-sm);
  transform: translateX(4px);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.item-type {
  display: flex;
  align-items: center;
  gap: 8px;
}

.type-icon {
  font-size: 20px;
}

.type-label {
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 500;
}

.item-time {
  font-size: 12px;
  color: var(--text-secondary);
}

.item-content {
  margin-bottom: 12px;
}

.content-text {
  font-size: 14px;
  color: var(--text-primary);
  line-height: 1.6;
  padding: 12px;
  background: #fff;
  border-radius: var(--border-radius-sm);
}

.item-result {
  display: flex;
  gap: 24px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.result-tag,
.result-score {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tag-label,
.score-label {
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 500;
}

.tag-value {
  padding: 4px 12px;
  border-radius: var(--border-radius-sm);
  font-weight: 600;
  font-size: 14px;
}

.score-value {
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 600;
}

.item-analysis {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--border-color);
}

.analysis-text {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.6;
  font-style: italic;
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
