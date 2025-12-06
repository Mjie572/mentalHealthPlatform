<template>
  <div class="personalized-report">
    <div class="page-header">
      <h2>数据报告</h2>
      <p>心理健康状态分析与趋势</p>
      <div class="report-date">
        <span>报告周期：{{ reportDateRange }}</span>
        <button class="generate-btn" @click="generateReport">
          <span class="icon">📈</span> 生成最新报告
        </button>
      </div>
    </div>

    <div class="report-container" v-if="reportData">
      <!-- 报告概览 -->
      <div class="report-overview">
        <div class="overview-card">
          <div class="overview-icon">😊</div>
          <div class="overview-content">
            <h3>本周情绪状态</h3>
            <p class="overview-value">{{ reportData.emotionOverview.mainEmotion }}</p>
            <p class="overview-desc">相比上周{{ reportData.emotionOverview.change > 0 ? '上升' : '下降' }}{{ Math.abs(reportData.emotionOverview.change) }}%</p>
          </div>
        </div>

        <div class="overview-card">
          <div class="overview-icon">📊</div>
          <div class="overview-content">
            <h3>压力指数</h3>
            <p class="overview-value">{{ reportData.stressOverview.level }}</p>
            <p class="overview-desc">相比上周{{ reportData.stressOverview.change > 0 ? '上升' : '下降' }}{{ Math.abs(reportData.stressOverview.change) }}%</p>
          </div>
        </div>

        <div class="overview-card">
          <div class="overview-icon">💪</div>
          <div class="overview-content">
            <h3>干预效果</h3>
            <p class="overview-value">{{ reportData.interventionEffectiveness.evaluation }}</p>
            <p class="overview-desc">{{ reportData.interventionEffectiveness.score }}/100</p>
          </div>
        </div>

        <div class="overview-card">
          <div class="overview-icon">✅</div>
          <div class="overview-content">
            <h3>任务完成率</h3>
            <p class="overview-value">{{ reportData.taskCompletion.rate }}%</p>
            <p class="overview-desc">{{ reportData.taskCompletion.completed }}/{{ reportData.taskCompletion.total }} 个任务</p>
          </div>
        </div>
      </div>

      <!-- 情绪变化趋势 -->
      <div class="chart-section">
        <h3 class="section-title">情绪变化趋势</h3>
        <div class="chart-container">
          <!-- ECharts 图表容器 -->
          <div id="emotionTrendChart" ref="emotionTrendChart" class="chart"></div>
        </div>
      </div>

      <!-- 压力来源分析 -->
      <div class="chart-section">
        <h3 class="section-title">压力来源分析</h3>
        <div class="chart-container">
          <div id="stressSourceChart" ref="stressSourceChart" class="chart"></div>
        </div>
      </div>

      <!-- 干预效果评估 -->
      <div class="chart-section">
        <h3 class="section-title">干预效果评估</h3>
        <div class="chart-container">
          <div id="interventionEffectChart" ref="interventionEffectChart" class="chart"></div>
        </div>
      </div>

      <!-- 详细分析与建议 -->
      <div class="analysis-section">
        <h3 class="section-title">详细分析与建议</h3>
        <div class="analysis-content">
          <div class="analysis-item">
            <h4>🎯 主要发现</h4>
            <ul>
              <li v-for="(finding, index) in reportData.detailedAnalysis.findings" :key="index">
                {{ finding }}
              </li>
            </ul>
          </div>

          <div class="analysis-item">
            <h4>💡 改进建议</h4>
            <ul>
              <li v-for="(suggestion, index) in reportData.detailedAnalysis.suggestions" :key="index">
                {{ suggestion }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- 测试数据切换器 -->
    <div class="test-data-switcher" v-if="!loading">
      <label class="toggle-switch">
        <input type="checkbox" v-model="testMode" @change="toggleTestMode">
        <span class="slider">测试模式</span>
      </label>
      
      <div class="scenario-selector" v-if="testMode">
        <select v-model="currentTestScenario" @change="switchTestScenario">
          <option v-for="scenario in testScenarios" :key="scenario.key" :value="scenario.key">
            {{ scenario.name }}
          </option>
        </select>
      </div>
    </div>

    <div class="loading-container" v-if="loading">
      <div class="loading-spinner">🔄</div>
      <p>正在生成报告...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { getDataReport, executeDifyWorkflow } from '@/api/personalized'
import { chartTestData, generateReportData } from '@/utils/chartTestData'

const loading = ref(false)
const reportData = ref(null)
const reportDateRange = computed(() => {
  const today = new Date()
  const startDate = new Date(today)
  startDate.setDate(today.getDate() - 7)
  return `${formatDate(startDate)} - ${formatDate(today)}`
})

// 测试数据相关
const testMode = ref(false)
const currentTestScenario = ref('normalFluctuation')
const testScenarios = [
  { key: 'normalFluctuation', name: '正常波动' },
  { key: 'continuousImprovement', name: '持续改善' },
  { key: 'continuousDecline', name: '持续下降' },
  { key: 'extremeEmotions', name: '极端情绪' },
  { key: 'singleStressSource', name: '单一压力源' },
  { key: 'goodInterventionEffect', name: '良好干预效果' }
]

// 图表引用
const emotionTrendChart = ref(null)
const stressSourceChart = ref(null)
const interventionEffectChart = ref(null)

// 模拟报告数据
const mockReportData = {
  emotionOverview: {
    mainEmotion: '平静',
    change: 5
  },
  stressOverview: {
    level: '中等',
    change: -10
  },
  interventionEffectiveness: {
    evaluation: '良好',
    score: 78
  },
  taskCompletion: {
    rate: 65,
    completed: 13,
    total: 20
  },
  emotionTrend: {
    dates: ['11/24', '11/25', '11/26', '11/27', '11/28', '11/29', '11/30'],
    positive: [65, 70, 60, 75, 80, 78, 82],
    neutral: [25, 20, 25, 15, 12, 15, 10],
    negative: [10, 10, 15, 10, 8, 7, 8]
  },
  stressSources: [
    { name: '工作压力', value: 45 },
    { name: '人际关系', value: 25 },
    { name: '生活琐事', value: 15 },
    { name: '睡眠不足', value: 10 },
    { name: '其他', value: 5 }
  ],
  interventionEffect: {
    categories: ['冥想', '运动', '阅读', '游戏', '社交'],
    effectiveness: [85, 78, 72, 65, 80]
  },
  detailedAnalysis: {
    findings: [
      '周一和周二情绪波动较大，可能与工作压力有关',
      '周末情绪明显好转，显示休息和放松的重要性',
      '冥想干预效果显著，建议继续保持',
      '睡眠质量有待提高，建议调整作息时间'
    ],
    suggestions: [
      '继续坚持每日冥想10分钟的习惯',
      '每周增加2-3次户外运动，每次30分钟',
      '尝试减少晚间使用电子设备的时间',
      '可以考虑增加社交活动，多与朋友交流'
    ]
  }
}

// 格式化日期
const formatDate = (date) => {
  return `${date.getMonth() + 1}/${date.getDate()}`
}

// 加载报告数据
const loadReport = async () => {
  loading.value = true
  try {
    if (testMode.value) {
      // 使用测试数据
      await new Promise(resolve => setTimeout(resolve, 500))
      reportData.value = generateReportData(currentTestScenario.value)
    } else {
      // 尝试调用API获取报告
      // const response = await getDataReport()
      // reportData.value = response.data
      
      // 使用模拟数据
      await new Promise(resolve => setTimeout(resolve, 1500))
      reportData.value = mockReportData
    }
  } catch (error) {
    console.error('加载报告失败:', error)
    // 加载失败时使用模拟数据
    reportData.value = mockReportData
  } finally {
    loading.value = false
    // 绘制图表
    if (reportData.value) {
      drawCharts()
    }
  }
}

// 切换测试场景
const switchTestScenario = (scenarioKey) => {
  currentTestScenario.value = scenarioKey
  loadReport()
}

// 切换测试模式
const toggleTestMode = () => {
  testMode.value = !testMode.value
  loadReport()
}

// 生成最新报告
const generateReport = async () => {
  loading.value = true
  try {
    // 使用新的Dify配置调用API生成报告
    const response = await executeDifyWorkflow('mental-health-report', {
      user_id: '123',
      time_range: '7days'
    }, {
      baseURL: 'http://localhost/v1',
      apiKey: 'app-rtvcipKEBx382usrRb0eS4hC'
    })
    // 处理API响应
    if (response && response.report) {
      reportData.value = response.report
    } else {
      // API返回格式不正确时使用模拟数据
      throw new Error('API返回格式不正确')
    }
  } catch (error) {
    console.error('生成报告失败:', error)
    // 加载失败时使用模拟数据
    await new Promise(resolve => setTimeout(resolve, 1000))
    const newReport = JSON.parse(JSON.stringify(mockReportData))
    newReport.emotionOverview.mainEmotion = ['平静', '愉快', '积极'][Math.floor(Math.random() * 3)]
    newReport.stressOverview.level = ['低', '中等', '较高'][Math.floor(Math.random() * 3)]
    reportData.value = newReport
  } finally {
    loading.value = false
    // 绘制图表
    if (reportData.value) {
      drawCharts()
    }
  }
}

// 绘制图表
const drawCharts = () => {
  if (!reportData.value) return
  
  // 绘制情绪趋势图（简单模拟）
  if (emotionTrendChart.value) {
    drawEmotionTrendChart()
  }
  
  // 绘制压力来源图（简单模拟）
  if (stressSourceChart.value) {
    drawStressSourceChart()
  }
  
  // 绘制干预效果评估图（简单模拟）
  if (interventionEffectChart.value) {
    drawInterventionEffectChart()
  }
}

// 绘制情绪趋势图
const drawEmotionTrendChart = () => {
  const chart = emotionTrendChart.value
  chart.innerHTML = ''
  
  // 简单的柱状图模拟
  const chartData = reportData.value.emotionTrend
  const canvas = document.createElement('canvas')
  canvas.width = 600
  canvas.height = 300
  chart.appendChild(canvas)
  
  const ctx = canvas.getContext('2d')
  const barWidth = 40
  const barGap = 20
  const startX = 50
  const startY = 250
  const maxValue = 100
  const heightFactor = 200 / maxValue
  
  // 绘制坐标轴
  ctx.strokeStyle = '#ccc'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(startX, 20)
  ctx.lineTo(startX, startY)
  ctx.lineTo(canvas.width - 20, startY)
  ctx.stroke()
  
  // 绘制柱状图
  chartData.dates.forEach((date, index) => {
    const x = startX + index * (barWidth + barGap)
    
    // 负面情绪
    const negativeHeight = chartData.negative[index] * heightFactor
    ctx.fillStyle = '#ff6b6b'
    ctx.fillRect(x, startY - negativeHeight, barWidth / 3, negativeHeight)
    
    // 中性情绪
    const neutralHeight = chartData.neutral[index] * heightFactor
    ctx.fillStyle = '#ffd93d'
    ctx.fillRect(x + barWidth / 3, startY - neutralHeight - negativeHeight, barWidth / 3, neutralHeight)
    
    // 积极情绪
    const positiveHeight = chartData.positive[index] * heightFactor
    ctx.fillStyle = '#6bcb77'
    ctx.fillRect(x + barWidth * 2 / 3, startY - positiveHeight - neutralHeight - negativeHeight, barWidth / 3, positiveHeight)
    
    // 日期标签
    ctx.fillStyle = '#333'
    ctx.font = '12px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(date, x + barWidth / 2, startY + 20)
  })
  
  // 图例
  const legends = [
    { color: '#6bcb77', text: '积极' },
    { color: '#ffd93d', text: '中性' },
    { color: '#ff6b6b', text: '负面' }
  ]
  
  legends.forEach((legend, index) => {
    ctx.fillStyle = legend.color
    ctx.fillRect(50 + index * 100, 10, 20, 10)
    ctx.fillStyle = '#333'
    ctx.font = '12px Arial'
    ctx.textAlign = 'left'
    ctx.fillText(legend.text, 80 + index * 100, 20)
  })
}

// 绘制压力来源图
const drawStressSourceChart = () => {
  const chart = stressSourceChart.value
  chart.innerHTML = ''
  
  // 简单的饼图模拟
  const data = reportData.value.stressSources
  const canvas = document.createElement('canvas')
  canvas.width = 400
  canvas.height = 400
  chart.appendChild(canvas)
  
  const ctx = canvas.getContext('2d')
  const centerX = 200
  const centerY = 200
  const radius = 150
  
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7']
  let currentAngle = 0
  
  data.forEach((item, index) => {
    const sliceAngle = (item.value / 100) * 2 * Math.PI
    
    // 绘制扇形
    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle)
    ctx.closePath()
    ctx.fillStyle = colors[index % colors.length]
    ctx.fill()
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 2
    ctx.stroke()
    
    // 绘制标签
    const labelAngle = currentAngle + sliceAngle / 2
    const labelX = centerX + Math.cos(labelAngle) * (radius + 20)
    const labelY = centerY + Math.sin(labelAngle) * (radius + 20)
    
    ctx.fillStyle = '#333'
    ctx.font = '14px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(`${item.name} ${item.value}%`, labelX, labelY)
    
    currentAngle += sliceAngle
  })
}

// 绘制干预效果评估图
const drawInterventionEffectChart = () => {
  const chart = interventionEffectChart.value
  chart.innerHTML = ''
  
  // 简单的雷达图模拟
  const data = reportData.value.interventionEffect
  const canvas = document.createElement('canvas')
  canvas.width = 500
  canvas.height = 500
  chart.appendChild(canvas)
  
  const ctx = canvas.getContext('2d')
  const centerX = 250
  const centerY = 250
  const radius = 200
  
  const categories = data.categories
  const values = data.effectiveness
  const count = categories.length
  
  // 绘制雷达图网格
  ctx.strokeStyle = '#ccc'
  ctx.lineWidth = 1
  for (let level = 1; level <= 5; level++) {
    const levelRadius = (radius / 5) * level
    ctx.beginPath()
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * 2 * Math.PI - Math.PI / 2
      const x = centerX + Math.cos(angle) * levelRadius
      const y = centerY + Math.sin(angle) * levelRadius
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.closePath()
    ctx.stroke()
  }
  
  // 绘制轴线
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * 2 * Math.PI - Math.PI / 2
    const x = centerX + Math.cos(angle) * radius
    const y = centerY + Math.sin(angle) * radius
    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.lineTo(x, y)
    ctx.stroke()
    
    // 类别标签
    ctx.fillStyle = '#333'
    ctx.font = '14px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(categories[i], x, y + 20)
  }
  
  // 绘制数据区域
  ctx.beginPath()
  ctx.fillStyle = 'rgba(107, 203, 119, 0.5)'
  ctx.strokeStyle = '#6bcb77'
  ctx.lineWidth = 2
  
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * 2 * Math.PI - Math.PI / 2
    const valueRadius = (values[i] / 100) * radius
    const x = centerX + Math.cos(angle) * valueRadius
    const y = centerY + Math.sin(angle) * valueRadius
    
    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  }
  ctx.closePath()
  ctx.fill()
  ctx.stroke()
}

onMounted(() => {
  loadReport()
})
</script>

<style scoped>
.personalized-report {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h2 {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.page-header p {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 4px 0 0 0;
}

.report-date {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}

.report-date span {
  font-size: 14px;
  color: var(--text-secondary);
}

.generate-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: var(--primary-color);
  color: #fff;
  border: none;
  border-radius: var(--border-radius-md);
  cursor: pointer;
  font-size: 14px;
  transition: all var(--transition-base);
}

.generate-btn:hover {
  background: var(--primary-color-hover);
}

.report-container {
  background: #fff;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  padding: 24px;
}

/* 报告概览 */
.report-overview {
  display: flex;
  gap: 16px;
  margin-bottom: 32px;
  flex-wrap: wrap;
}

.overview-card {
  flex: 1 1 calc(25% - 16px);
  background: #f9f9f9;
  border-radius: var(--border-radius-md);
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 200px;
}

.overview-icon {
  font-size: 48px;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-sm);
}

.overview-content h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px 0;
}

.overview-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--primary-color);
  margin: 0 0 4px 0;
}

.overview-desc {
  font-size: 12px;
  color: var(--text-secondary);
  margin: 0;
}

/* 图表部分 */
.chart-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-color);
}

.chart-container {
  background: #f9f9f9;
  border-radius: var(--border-radius-md);
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.chart {
  width: 100%;
  height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 分析部分 */
.analysis-section {
  margin-top: 32px;
}

.analysis-content {
  display: flex;
  gap: 32px;
  flex-wrap: wrap;
}

.analysis-item {
  flex: 1 1 calc(50% - 16px);
  min-width: 300px;
}

.analysis-item h4 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 12px 0;
}

.analysis-item ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.analysis-item li {
  font-size: 14px;
  color: var(--text-primary);
  margin-bottom: 8px;
  padding-left: 20px;
  position: relative;
}

.analysis-item li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: var(--primary-color);
  font-weight: bold;
}

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

/* 测试数据切换器样式 */
.test-data-switcher {
  position: fixed;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.9);
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 15px;
}

.toggle-switch {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  font-size: 14px;
}

.toggle-switch input[type="checkbox"] {
  margin: 0;
}

.scenario-selector select {
  padding: 5px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  font-size: 14px;
}
</style>

