<template>
  <div class="personalized-plan">
    <div class="page-header">
      <h2>个性化方案</h2>
      <p>基于AI分析生成的周心理健康维护计划</p>
    </div>

    <div class="plan-content" v-if="plan">
      <!-- 左侧：5张卡片布局 -->
      <div class="cards-section">
        <div
          class="card"
          v-for="(card, index) in plan.report_data"
          :key="index"
          :class="`card-${card.action_type || index}` + (card.completed ? ' completed' : '')"
        >
          <div class="card-header">
            <div class="card-controls">
              <h3>{{ card.title }}</h3>
              <div class="card-checkbox">
                <input
                  type="checkbox"
                  v-model="card.completed"
                  @change="updateCardStatus(index)"
                />
              </div>
            </div>
            <span class="card-icon">{{ getCardIcon(card.action_type) }}</span>
          </div>
          <div class="card-content">
            <p>{{ card.detail }}</p>
          </div>
        </div>
      </div>

      <!-- 右侧：交互式待办清单 -->
      <div class="tasks-section">
        <div class="task-list-card">
          <div class="card-header">
            <h3>今日待办清单</h3>
            <span class="date">{{ currentDate }}</span>
          </div>
          <div class="dailyTasks">
            <div
              class="task-item"
              v-for="(task, taskIndex) in dailyTasks"
              :key="taskIndex"
              :class="{ completed: task.completed }"
              @click="toggleTask(taskIndex)"
            >
              <div class="task-checkbox">
                <input
                  type="checkbox"
                  v-model="task.completed"
                  @change="updateTaskStatus(taskIndex)"
                />
              </div>
              <div class="task-content">
                <span class="task-text">{{ task.text }}</span>
              </div>
              <div class="task-animation" v-if="task.completed">
                ✅
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 一键生成今日方案按钮 -->
    <div class="generate-section" v-if="plan">
      <button class="generate-btn" @click="generateTodayPlan">
        <span class="icon">✨</span> 一键生成今日方案
      </button>
    </div>

    <div class="loading-container" v-if="loading">
      <div class="loading-spinner">🔄</div>
      <p>正在生成个性化方案...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { executeDifyWorkflow, getPersonalizedPlan } from '@/api/personalized'

const loading = ref(false)
const plan = ref(null)
const currentDate = computed(() => {
  const today = new Date()
  return today.toISOString().split('T')[0]
})

// 今日待办清单
const dailyTasks = ref([])

// 模拟周计划数据 - 符合用户要求的输出格式
const mockPlan = {
  plan: {
    report_data: [
      {
        title: "深呼吸放松",
        detail: "每天花5分钟进行深呼吸练习，吸气时数到4，屏住呼吸数到4，然后呼气数到6。这有助于降低压力水平。",
        action_type: "meditation",
        completed: false
      },
      {
        title: "规律运动",
        detail: "每周至少进行150分钟中等强度运动，如快走或游泳。运动能释放内啡肽，改善情绪和睡眠质量。",
        action_type: "exercise",
        completed: false
      },
      {
        title: "建立睡眠习惯",
        detail: "保持固定的作息时间，睡前1小时避免使用电子设备。舒适的睡眠环境和睡前放松有助于提高睡眠质量。",
        action_type: "sleep",
        completed: false
      },
      {
        title: "感恩日记",
        detail: "每天记录3件让你感激的事情。这个简单练习可以帮助转移注意力，培养积极心态。",
        action_type: "journaling",
        completed: false
      },
      {
        title: "社交联系",
        detail: "每周至少与朋友或家人进行一次有意义的交流。良好的人际关系是心理健康的重要保护因素。",
        action_type: "social",
        completed: false
      }
    ],
    count: 5,
    status: "success"
  }
}

// 加载方案
const loadPlan = async () => {
  loading.value = true
  try {
    // 尝试调用API获取方案
    // const response = await getPersonalizedPlan()
    // plan.value = response.data
    
    // 使用模拟数据
    await new Promise(resolve => setTimeout(resolve, 1000))
    plan.value = mockPlan.plan
    // 初始化待办清单
    initDailyTasks()
  } catch (error) {
    console.error('加载方案失败:', error)
    // 加载失败时使用模拟数据
    plan.value = mockPlan.plan
    initDailyTasks()
  } finally {
    loading.value = false
  }
}

// 初始化待办清单
const initDailyTasks = () => {
  dailyTasks.value = [
    { text: '完成第一个卡片任务', completed: false },
    { text: '检查所有卡片内容', completed: false },
    { text: '记录完成情况', completed: false }
  ]
}

// 一键生成今日方案
const generateTodayPlan = async () => {
  loading.value = true
  try {
    // 调用Dify API生成今日方案 - 使用用户提供的配置
    const response = await executeDifyWorkflow(
      'mental-health-plan', // workflow ID
      {
        user_id: '123',
        emotion_data: {
          date: currentDate.value,
          current_mood: '平静',
          stress_level: '中等'
        }
      },
      {
        baseURL: 'http://localhost/v1',
        apiKey: 'app-G5SGifTMdXfUmGNu9rnGMuJF'
      }
    )
    
    // 处理API响应，将内容分配到卡片中
    if (response && response.plan) {
      plan.value = response.plan
    } else {
      throw new Error('API返回格式不正确')
    }
  } catch (error) {
    console.error('生成今日方案失败:', error)
    // API失败时使用Mock数据
    plan.value = mockPlan.plan
  } finally {
    // 重置待办清单
    initDailyTasks()
    loading.value = false
  }
}

// 根据任务类型获取卡片图标
const getCardIcon = (actionType) => {
  const icons = {
    meditation: '🧘',
    exercise: '🏃',
    sleep: '😴',
    journaling: '�',
    social: '👥',
    default: '✨'
  }
  return icons[actionType] || icons.default
}

// 切换任务状态
const toggleTask = (taskIndex) => {
  const task = dailyTasks.value[taskIndex]
  task.completed = !task.completed
  updateTaskStatus(taskIndex)
}

// 更新任务状态
const updateTaskStatus = (taskIndex) => {
  const task = dailyTasks.value[taskIndex]
  console.log(`任务${task.text}状态更新为：${task.completed ? '已完成' : '未完成'}`)
  // 这里可以调用API更新任务状态
}

// 更新卡片完成状态
const updateCardStatus = (cardIndex) => {
  const card = plan.value.report_data[cardIndex]
  console.log(`卡片任务${card.title}状态更新为：${card.completed ? '已完成' : '未完成'}`)
  // 这里可以调用API更新卡片状态
}

onMounted(() => {
  loadPlan()
})
</script>

<style scoped>
.personalized-plan {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h2 {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.page-header p {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 4px 0 0 0;
}

/* 主内容布局 */
.plan-content {
  display: flex;
  gap: 24px;
  margin-bottom: 32px;
}

/* 左侧卡片区域 */
.cards-section {
  flex: 3;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

/* 右侧任务区域 */
.tasks-section {
  flex: 1;
  min-width: 320px;
}

.card {
  background: #fff;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  padding: 24px;
  transition: all var(--transition-base);
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
}

.card-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex: 1;
  gap: 12px;
}

.card-checkbox input {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--primary-color);
}

.card.completed {
  opacity: 0.8;
  background-color: #f6ffed;
  border-left: 4px solid var(--success-color);
}

.card.completed .card-content p {
  text-decoration: line-through;
  color: var(--text-secondary);
}

.card-checkbox input {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--primary-color);
}

.card.completed {
  opacity: 0.8;
  background-color: #f6ffed;
  border-left: 4px solid var(--success-color);
}

.card.completed .card-content p {
  text-decoration: line-through;
  color: var(--text-secondary);
}

.card-header h3 {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.date {
  font-size: 14px;
  color: var(--primary-color);
  font-weight: 500;
}

.week-range {
  font-size: 12px;
  color: var(--text-secondary);
}

/* 任务列表 */
.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 12px;
  border-radius: var(--border-radius-md);
  transition: all var(--transition-base);
  background: #f9f9f9;
}

.task-item:hover {
  background: #f0f0f0;
  transform: translateX(4px);
}

.task-item.completed {
  opacity: 0.7;
  background: #f6ffed;
}

.task-item.completed .task-text {
  text-decoration: line-through;
  color: var(--text-secondary);
}

.task-checkbox input {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--primary-color);
}

.task-content {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.task-icon {
  font-size: 18px;
  width: 24px;
  text-align: center;
}

.task-text {
  font-size: 14px;
  color: var(--text-primary);
  flex: 1;
  transition: all var(--transition-base);
}

/* 周计划概览 */
.weekly-overview {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.overview-day {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  border-radius: var(--border-radius-md);
  transition: all var(--transition-base);
  background: #f9f9f9;
}

.overview-day:hover {
  background: #f0f0f0;
}

.overview-day.active {
  background: var(--primary-color);
  color: white;
  transform: scale(1.05);
}

.overview-day.active .day-label,
.overview-day.active .day-date,
.overview-day.active .day-task-count span {
  color: white;
}

.day-label {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.day-date {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.day-task-count span {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

/* 一键生成按钮 */
.generate-section {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}

.generate-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 32px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-color-hover));
  color: #fff;
  border: none;
  border-radius: var(--border-radius-lg);
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all var(--transition-base);
  box-shadow: var(--shadow-md);
}

.generate-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.generate-btn:active {
  transform: translateY(0);
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  background: #fff;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
}

.loading-spinner {
  font-size: 48px;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .card {
    background: rgba(30, 30, 30, 0.8);
    color: white;
  }
  
  .task-item {
    background: rgba(50, 50, 50, 0.8);
  }
  
  .task-item:hover {
    background: rgba(70, 70, 70, 0.8);
  }
  
  .task-item.completed {
    background: rgba(52, 131, 28, 0.3);
  }
  
  .overview-day {
    background: rgba(50, 50, 50, 0.8);
  }
  
  .overview-day:hover {
    background: rgba(70, 70, 70, 0.8);
  }
  
  .overview-day.active {
    background: var(--primary-color);
  }
  
  .day-label,
  .day-task-count span {
    color: #d0d0d0;
  }
  
  .day-date {
    color: #999;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .personalized-plan {
    padding: 15px;
  }
  
  .page-header h2 {
    font-size: 2rem;
  }
  
  .plan-cards-container {
    grid-template-columns: 1fr;
  }
  
  .generate-btn {
    padding: 12px 30px;
    font-size: 1rem;
  }
}
</style>

