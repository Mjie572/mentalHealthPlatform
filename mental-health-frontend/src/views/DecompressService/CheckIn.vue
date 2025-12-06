<template>
  <div class="decompress-checkin">
    <div class="page-header">
      <h2>活动打卡</h2>
      <p>坚持打卡，积累积分，养成健康习惯</p>
    </div>
    
    <div class="checkin-container">
      <!-- 打卡区域 -->
      <div class="checkin-card">
        <div class="checkin-header">
          <h3>今日打卡</h3>
          <div class="checkin-date">{{ formatDate(new Date(), 'YYYY-MM-DD') }}</div>
        </div>
        
        <!-- 心理健康活动列表 -->
        <div v-if="!todayCheckIn" class="activities-section">
          <h4 class="activities-title">选择今日心理健康活动</h4>
          <div class="activities-list">
            <div
              v-for="activity in mentalHealthActivities"
              :key="activity.id"
              class="activity-item"
              :class="{ selected: selectedActivity?.id === activity.id }"
              @click="selectedActivity = activity"
            >
              <div class="activity-icon">{{ activity.icon }}</div>
              <div class="activity-info">
                <div class="activity-name">{{ activity.name }}</div>
                <div class="activity-desc">{{ activity.description }}</div>
              </div>
              <div class="activity-points">+{{ activity.points }}积分</div>
            </div>
          </div>
        </div>
        
        <div class="checkin-status" v-if="todayCheckIn">
          <div class="status-success">
            <span class="status-icon">✅</span>
            <span class="status-text">今日已打卡</span>
          </div>
          <div class="checkin-time">
            打卡时间：{{ formatTime(todayCheckIn.checkInTime) }}
          </div>
          <div v-if="todayCheckIn.activityName" class="checkin-activity">
            活动：{{ todayCheckIn.activityName }}
          </div>
        </div>
        
        <div class="checkin-status" v-else>
          <div class="status-pending">
            <span class="status-icon">⏰</span>
            <span class="status-text">今日未打卡</span>
          </div>
          <button 
            @click="doCheckIn" 
            :disabled="checking || !selectedActivity" 
            class="btn-checkin"
          >
            {{ checking ? '打卡中...' : selectedActivity ? `打卡：${selectedActivity.name}` : '请先选择活动' }}
          </button>
        </div>
        
        <!-- 连续打卡天数 -->
        <div class="streak-info">
          <div class="streak-item">
            <span class="streak-label">连续打卡</span>
            <span class="streak-value">{{ streakDays }} 天</span>
          </div>
          <div class="streak-item">
            <span class="streak-label">总打卡天数</span>
            <span class="streak-value">{{ totalCheckInDays }} 天</span>
          </div>
        </div>
      </div>
      
      <!-- 积分信息 -->
      <div class="points-card">
        <div class="points-header">
          <h3>我的积分</h3>
          <button @click="showRules = !showRules" class="btn-rules">
            {{ showRules ? '隐藏规则' : '查看规则' }}
          </button>
        </div>
        
        <div class="points-display">
          <span class="points-value">{{ pointsInfo.totalPoints || 0 }}</span>
          <span class="points-label">积分</span>
        </div>
        
        <!-- 积分规则 -->
        <div v-if="showRules" class="points-rules">
          <h4>积分规则</h4>
          <ul>
            <li v-for="rule in pointsRules" :key="rule.action">
              <span class="rule-action">{{ rule.action }}</span>
              <span class="rule-points">+{{ rule.points }} 积分</span>
            </li>
          </ul>
        </div>
      </div>
      
      <!-- 打卡记录 -->
      <div class="records-card">
        <div class="records-header">
          <h3>打卡记录</h3>
          <select v-model="recordFilter" @change="loadCheckInRecords" class="filter-select">
            <option value="week">最近一周</option>
            <option value="month">最近一月</option>
            <option value="all">全部</option>
          </select>
        </div>
        
        <div class="records-list">
          <div
            v-for="record in checkInRecords"
            :key="record.id"
            class="record-item"
          >
            <div class="record-info">
              <div class="record-date">{{ formatDate(record.checkInTime, 'YYYY-MM-DD') }}</div>
              <div class="record-time">{{ formatTime(record.checkInTime) }}</div>
              <div v-if="record.activityName" class="record-activity">{{ record.activityName }}</div>
            </div>
            <div class="record-points">+{{ record.points }} 积分</div>
          </div>
          
          <div v-if="checkInRecords.length === 0 && !recordsLoading" class="empty-records">
            暂无打卡记录
          </div>
        </div>
      </div>
      
      <!-- 积分变动记录 -->
      <div class="points-history-card">
        <div class="history-header">
          <h3>积分变动记录</h3>
        </div>
        
        <div class="history-list">
          <div
            v-for="history in pointsHistory"
            :key="history.id"
            class="history-item"
          >
            <div class="history-info">
              <div class="history-action">{{ history.description }}</div>
              <div class="history-time">{{ formatTime(history.createTime) }}</div>
            </div>
            <div class="history-points" :class="history.points > 0 ? 'positive' : 'negative'">
              {{ history.points > 0 ? '+' : '' }}{{ history.points }}
            </div>
          </div>
          
          <div v-if="pointsHistory.length === 0 && !historyLoading" class="empty-history">
            暂无积分变动记录
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { checkIn, getCheckInRecords, getPointsInfo, getPointsHistory, getPointsRules } from '@/api/decompress'
import { useGlobalState, useCrossModuleState, setActiveTaskCount } from '@/store'
import { formatDate } from '@/utils'

const globalState = useGlobalState()
const crossModuleState = useCrossModuleState()
const currentUserId = computed(() => globalState.currentUserId)

// 状态
const checking = ref(false)
const todayCheckIn = ref(null)
const streakDays = ref(0)
const totalCheckInDays = ref(0)
const checkInRecords = ref([])
const recordsLoading = ref(false)
const recordFilter = ref('week')

const pointsInfo = ref({ totalPoints: 0 })
const pointsHistory = ref([])
const historyLoading = ref(false)
const pointsRules = ref([])
const showRules = ref(false)

// 心理健康活动列表
const mentalHealthActivities = ref([
  {
    id: 1,
    name: '深呼吸练习',
    description: '进行5分钟深呼吸，缓解压力',
    icon: '🧘',
    points: 10,
    type: 'breathing'
  },
  {
    id: 2,
    name: '情绪日记',
    description: '记录今日情绪，了解自己',
    icon: '📝',
    points: 10,
    type: 'diary'
  },
  {
    id: 3,
    name: '运动锻炼',
    description: '进行30分钟运动，释放压力',
    icon: '🏃',
    points: 15,
    type: 'exercise'
  },
  {
    id: 4,
    name: '冥想放松',
    description: '进行10分钟冥想，平静内心',
    icon: '🧘‍♀️',
    points: 15,
    type: 'meditation'
  },
  {
    id: 5,
    name: '感恩记录',
    description: '记录3件值得感恩的事',
    icon: '🙏',
    points: 10,
    type: 'gratitude'
  },
  {
    id: 6,
    name: '社交互动',
    description: '与朋友或家人交流30分钟',
    icon: '👥',
    points: 10,
    type: 'social'
  }
])

const selectedActivity = ref(null)

// 加载今日打卡状态
const loadTodayCheckIn = async () => {
  if (!currentUserId.value) return
  
  try {
    const response = await getCheckInRecords({
      userId: currentUserId.value,
      startDate: formatDate(new Date(), 'YYYY-MM-DD'),
      endDate: formatDate(new Date(), 'YYYY-MM-DD')
    })
    
    if (response.data && response.data.length > 0) {
      todayCheckIn.value = response.data[0]
    } else {
      todayCheckIn.value = null
    }
  } catch (error) {
    console.error('加载今日打卡状态失败，使用本地存储:', error)
    // Demo版：从本地存储加载
    const localRecords = JSON.parse(localStorage.getItem(`checkin_${currentUserId.value}`) || '[]')
    const today = formatDate(new Date(), 'YYYY-MM-DD')
    const todayRecord = localRecords.find(record => formatDate(record.checkInTime, 'YYYY-MM-DD') === today)
    
    if (todayRecord) {
      todayCheckIn.value = todayRecord
    } else {
      todayCheckIn.value = null
    }
  }
}

// 执行打卡
const doCheckIn = async () => {
  // 兼容性处理：检查用户ID
  if (!currentUserId.value) {
    alert('用户未登录，请先登录')
    return
  }
  
  if (!selectedActivity.value) {
    alert('请先选择心理健康活动')
    return
  }
  
  checking.value = true
  try {
    const response = await checkIn({
      userId: currentUserId.value,
      checkInTime: new Date().toISOString(),
      activityId: selectedActivity.value.id,
      activityName: selectedActivity.value.name,
      activityType: selectedActivity.value.type,
      points: selectedActivity.value.points
    })
    
    // 更新今日打卡状态
    todayCheckIn.value = {
      id: response.data?.id || Date.now(),
      checkInTime: new Date().toISOString(),
      points: response.data?.points || selectedActivity.value.points,
      activityName: response.data?.activityName || selectedActivity.value.name
    }
    
    // 清空选择
    selectedActivity.value = null
    
    // 立即更新所有数据
    await Promise.all([
      loadPointsInfo(),
      loadCheckInRecords(), // 这会重新计算连续天数
      loadPointsHistory()
    ])
    
    // 更新任务数（打卡完成，任务数-1）
    const currentTaskCount = crossModuleState.activeTaskCount
    if (currentTaskCount > 0) {
      setActiveTaskCount(currentTaskCount - 1)
    }
    
    alert(`打卡成功！完成"${todayCheckIn.value.activityName}"，获得 ${todayCheckIn.value.points} 积分`)
  } catch (error) {
    console.error('打卡失败:', error)
    // Demo版：如果后端不可用，使用本地存储模拟
    const points = selectedActivity.value.points
    const checkInTime = new Date().toISOString()
    const today = formatDate(new Date(), 'YYYY-MM-DD')
    
    // 保存到本地存储（Demo版）
    const localRecords = JSON.parse(localStorage.getItem(`checkin_${currentUserId.value}`) || '[]')
    const newRecord = {
      id: Date.now(),
      userId: currentUserId.value,
      checkInTime: checkInTime,
      date: today,
      points: points,
      activityId: selectedActivity.value.id,
      activityName: selectedActivity.value.name,
      activityType: selectedActivity.value.type
    }
    localRecords.push(newRecord)
    localStorage.setItem(`checkin_${currentUserId.value}`, JSON.stringify(localRecords))
    
    // 更新积分（本地存储）
    const localPoints = JSON.parse(localStorage.getItem(`points_${currentUserId.value}`) || '{"totalPoints": 0, "history": []}')
    localPoints.totalPoints = (localPoints.totalPoints || 0) + points
    localPoints.history.push({
      id: Date.now(),
      points: points,
      source: 'checkin',
      description: `完成${selectedActivity.value.name}`,
      createTime: checkInTime
    })
    localStorage.setItem(`points_${currentUserId.value}`, JSON.stringify(localPoints))
    
    // 更新今日打卡状态
    todayCheckIn.value = {
      id: newRecord.id,
      checkInTime: checkInTime,
      points: points,
      activityName: selectedActivity.value.name
    }
    
    // 清空选择
    selectedActivity.value = null
    
    // 立即更新所有数据
    pointsInfo.value.totalPoints = localPoints.totalPoints
    await Promise.all([
      loadCheckInRecords(), // 这会重新计算连续天数
      loadPointsHistory()
    ])
    
    alert(`打卡成功！完成"${todayCheckIn.value.activityName}"，获得 ${points} 积分（Demo版本地数据）`)
  } finally {
    checking.value = false
  }
}

// 加载打卡记录
const loadCheckInRecords = async () => {
  if (!currentUserId.value) return
  
  recordsLoading.value = true
  try {
    const now = new Date()
    let startDate = formatDate(now, 'YYYY-MM-DD')
    
    if (recordFilter.value === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      startDate = formatDate(weekAgo, 'YYYY-MM-DD')
    } else if (recordFilter.value === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      startDate = formatDate(monthAgo, 'YYYY-MM-DD')
    } else {
      // 全部：使用一个很早的日期
      startDate = '2020-01-01'
    }
    
    let allRecords = []
    
    try {
      const response = await getCheckInRecords({
        userId: currentUserId.value,
        startDate: startDate,
        endDate: formatDate(now, 'YYYY-MM-DD')
      })
      checkInRecords.value = response.data || []
      
      // 获取所有记录用于计算连续天数
      if (recordFilter.value !== 'all') {
        const allResponse = await getCheckInRecords({
          userId: currentUserId.value,
          startDate: '2020-01-01',
          endDate: formatDate(now, 'YYYY-MM-DD')
        })
        allRecords = allResponse.data || []
      } else {
        allRecords = checkInRecords.value
      }
    } catch (error) {
      console.error('加载打卡记录失败，使用本地存储:', error)
      // Demo版：从本地存储加载
      const localRecords = JSON.parse(localStorage.getItem(`checkin_${currentUserId.value}`) || '[]')
      allRecords = localRecords
      
      // 根据筛选条件过滤
      checkInRecords.value = localRecords.filter(record => {
        const recordDate = formatDate(record.checkInTime, 'YYYY-MM-DD')
        return startDate <= recordDate && recordDate <= formatDate(now, 'YYYY-MM-DD')
      }).sort((a, b) => new Date(b.checkInTime) - new Date(a.checkInTime))
    }
    
    // 计算连续打卡天数和总打卡天数（使用所有记录）
    calculateStreakDaysFromRecords(allRecords)
  } catch (error) {
    console.error('加载打卡记录失败:', error)
    checkInRecords.value = []
    streakDays.value = 0
    totalCheckInDays.value = 0
  } finally {
    recordsLoading.value = false
  }
}

// 从记录计算连续打卡天数（使用传入的记录数组）
const calculateStreakDaysFromRecords = (records) => {
  if (records.length === 0) {
    streakDays.value = 0
    totalCheckInDays.value = 0
    return
  }
  
  // 获取所有唯一的打卡日期
  const uniqueDates = new Set()
  records.forEach(record => {
    const date = formatDate(record.checkInTime, 'YYYY-MM-DD')
    uniqueDates.add(date)
  })
  
  // 计算总打卡天数
  totalCheckInDays.value = uniqueDates.size
  
  // 按日期排序（从新到旧）
  const sortedDates = Array.from(uniqueDates).sort((a, b) => {
    return new Date(b) - new Date(a)
  })
  
  // 计算连续打卡天数
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = formatDate(today, 'YYYY-MM-DD')
  
  // 如果今天打卡了，从今天开始计算；否则从昨天开始
  let currentDate = new Date(today)
  if (!sortedDates.includes(todayStr)) {
    currentDate.setDate(currentDate.getDate() - 1)
  }
  
  let streak = 0
  
  // 从当前日期往前检查连续打卡
  for (let i = 0; i < sortedDates.length; i++) {
    const dateStr = sortedDates[i]
    const recordDate = new Date(dateStr)
    recordDate.setHours(0, 0, 0, 0)
    
    const expectedDate = new Date(currentDate)
    expectedDate.setHours(0, 0, 0, 0)
    
    // 计算日期差
    const diffTime = expectedDate - recordDate
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    // 如果日期匹配（差值为0），说明连续
    if (diffDays === 0) {
      streak++
      // 移动到前一天继续检查
      currentDate.setDate(currentDate.getDate() - 1)
    } else {
      // 如果不连续，停止计算
      break
    }
  }
  
  streakDays.value = streak
}


// 加载积分信息
const loadPointsInfo = async () => {
  if (!currentUserId.value) return
  
  try {
    const response = await getPointsInfo({
      userId: currentUserId.value
    })
    pointsInfo.value = response.data || { totalPoints: 0 }
  } catch (error) {
    console.error('加载积分信息失败，使用本地存储:', error)
    // Demo版：从本地存储加载
    const localPoints = JSON.parse(localStorage.getItem(`points_${currentUserId.value}`) || '{"totalPoints": 0, "history": []}')
    pointsInfo.value = { totalPoints: localPoints.totalPoints || 0 }
  }
}

// 加载积分历史
const loadPointsHistory = async () => {
  if (!currentUserId.value) return
  
  historyLoading.value = true
  try {
    const response = await getPointsHistory({
      userId: currentUserId.value,
      limit: 20
    })
    
    pointsHistory.value = response.data || []
  } catch (error) {
    console.error('加载积分历史失败，使用本地存储:', error)
    // Demo版：从本地存储加载
    const localPoints = JSON.parse(localStorage.getItem(`points_${currentUserId.value}`) || '{"totalPoints": 0, "history": []}')
    pointsHistory.value = (localPoints.history || []).slice(-20).reverse() // 最新的在前
  } finally {
    historyLoading.value = false
  }
}

// 加载积分规则
const loadPointsRules = async () => {
  try {
    const response = await getPointsRules()
    pointsRules.value = response.data || getDefaultRules()
  } catch (error) {
    console.error('加载积分规则失败:', error)
    pointsRules.value = getDefaultRules()
  }
}

// 默认积分规则（Demo版）
const getDefaultRules = () => {
  return [
    { action: '每日打卡', points: 10 },
    { action: '完成呼吸游戏', points: 5 },
    { action: '完成数字消消乐', points: 10 },
    { action: '完成心理测试', points: 15 },
    { action: '连续打卡7天', points: 50 },
    { action: '连续打卡30天', points: 200 }
  ]
}

// 格式化时间
const formatTime = (timestamp) => {
  return formatDate(new Date(timestamp), 'HH:mm:ss')
}

// 初始化
onMounted(async () => {
  // 并行加载所有数据，提高加载速度
  await Promise.all([
    loadCheckInRecords(), // 先加载打卡记录（用于计算连续天数）
    loadTodayCheckIn(),   // 加载今日打卡状态
    loadPointsInfo(),     // 加载积分信息
    loadPointsHistory(),  // 加载积分历史
    loadPointsRules()     // 加载积分规则
  ])
})
</script>

<style scoped>
.decompress-checkin {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.page-header {
  margin-bottom: 32px;
}

.page-header h2 {
  font-size: 28px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.page-header p {
  font-size: 14px;
  color: var(--text-secondary);
}

.checkin-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.checkin-card, .points-card, .records-card, .points-history-card {
  background: var(--bg-white);
  border-radius: var(--border-radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-sm);
}

.records-card, .points-history-card {
  grid-column: 1 / -1;
}

.checkin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
}

.checkin-header h3 {
  font-size: 20px;
  color: var(--text-primary);
}

.checkin-date {
  font-size: 14px;
  color: var(--text-secondary);
}

.checkin-status {
  text-align: center;
  margin-bottom: 24px;
}

.status-success, .status-pending {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 12px;
}

.status-icon {
  font-size: 24px;
}

.status-text {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.checkin-time {
  font-size: 14px;
  color: var(--text-secondary);
  margin-top: 8px;
}

.checkin-activity {
  font-size: 14px;
  color: var(--primary-color);
  margin-top: 8px;
  font-weight: 500;
}

.activities-section {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--border-color);
}

.activities-title {
  font-size: 16px;
  color: var(--text-primary);
  margin-bottom: 16px;
  font-weight: 600;
}

.activities-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: all var(--transition-base);
  background: var(--bg-white);
}

.activity-item:hover {
  border-color: var(--primary-color);
  background: var(--primary-light);
}

.activity-item.selected {
  border-color: var(--primary-color);
  background: var(--primary-light);
}

.activity-icon {
  font-size: 32px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-hover);
  border-radius: var(--border-radius-md);
  flex-shrink: 0;
}

.activity-info {
  flex: 1;
}

.activity-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.activity-desc {
  font-size: 12px;
  color: var(--text-secondary);
}

.activity-points {
  font-size: 14px;
  font-weight: 600;
  color: var(--primary-color);
  flex-shrink: 0;
}

.btn-checkin {
  padding: 12px 32px;
  border: none;
  border-radius: var(--border-radius-md);
  background: var(--primary-color);
  color: white;
  font-size: 16px;
  cursor: pointer;
  transition: all var(--transition-base);
}

.btn-checkin:hover:not(:disabled) {
  background: var(--primary-dark);
}

.btn-checkin:disabled {
  background: var(--text-disabled);
  cursor: not-allowed;
}

.streak-info {
  display: flex;
  justify-content: space-around;
  padding-top: 24px;
  border-top: 1px solid var(--border-color);
}

.streak-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.streak-label {
  font-size: 14px;
  color: var(--text-secondary);
}

.streak-value {
  font-size: 24px;
  font-weight: bold;
  color: var(--primary-color);
}

.points-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
}

.points-header h3 {
  font-size: 20px;
  color: var(--text-primary);
}

.btn-rules {
  padding: 6px 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  background: var(--bg-white);
  color: var(--text-primary);
  font-size: 14px;
  cursor: pointer;
}

.points-display {
  text-align: center;
  margin-bottom: 24px;
}

.points-value {
  font-size: 48px;
  font-weight: bold;
  color: var(--primary-color);
  margin-right: 8px;
}

.points-label {
  font-size: 18px;
  color: var(--text-secondary);
}

.points-rules {
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
}

.points-rules h4 {
  font-size: 16px;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.points-rules ul {
  list-style: none;
  padding: 0;
}

.points-rules li {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid var(--border-light);
}

.rule-action {
  font-size: 14px;
  color: var(--text-primary);
}

.rule-points {
  font-size: 14px;
  color: var(--primary-color);
  font-weight: 600;
}

.records-header, .history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
}

.records-header h3, .history-header h3 {
  font-size: 20px;
  color: var(--text-primary);
}

.filter-select {
  padding: 6px 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  font-size: 14px;
}

.records-list, .history-list {
  max-height: 400px;
  overflow-y: auto;
}

.record-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-light);
}

.record-info {
  flex: 1;
}

.record-date {
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 600;
  margin-bottom: 4px;
}

.record-time {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 2px;
}

.record-activity {
  font-size: 12px;
  color: var(--primary-color);
  font-weight: 500;
}

.record-points {
  font-size: 14px;
  color: var(--primary-color);
  font-weight: 600;
  margin-left: 16px;
  flex-shrink: 0;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-light);
}

.history-info {
  flex: 1;
}

.history-action {
  font-size: 14px;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.history-time {
  font-size: 12px;
  color: var(--text-secondary);
}

.history-points {
  font-size: 16px;
  font-weight: 600;
  margin-left: 16px;
}

.history-points.positive {
  color: var(--success-color);
}

.history-points.negative {
  color: var(--error-color);
}

.empty-records, .empty-history {
  text-align: center;
  padding: 40px;
  color: var(--text-secondary);
}
</style>

