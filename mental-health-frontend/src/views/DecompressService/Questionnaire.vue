<template>
  <div class="decompress-questionnaire">
    <div class="page-header">
      <h2>心理健康自测</h2>
      <p>通过专业心理测试，全面了解您的心理健康状况</p>
    </div>
    
    <!-- 题库列表 -->
    <div v-if="!selectedQuestion" class="question-list">
      <div
        v-for="question in questionList"
        :key="question.id"
        class="question-item"
        @click="selectQuestion(question.id)"
      >
        <div class="question-info">
          <h3>{{ question.title }}</h3>
          <p>{{ question.description }}</p>
          <div class="question-meta">
            <span>题目数：{{ question.questionCount }}</span>
            <span>预计时长：{{ question.duration }}分钟</span>
          </div>
        </div>
        <span class="question-arrow">›</span>
      </div>
      
      <div v-if="questionList.length === 0 && !loading" class="empty-state">
        <p>暂无题库</p>
      </div>
    </div>
    
    <!-- 题目详情 -->
    <div v-else class="question-detail">
      <div class="question-header">
        <button @click="backToList" class="btn-back">← 返回列表</button>
        <h3>{{ selectedQuestion.title }}</h3>
        <div class="question-progress">
          进度：{{ currentQuestionIndex + 1 }} / {{ selectedQuestion.questions.length }}
        </div>
      </div>
      
      <div v-if="!showResult" class="question-content">
        <div
          v-for="(question, index) in selectedQuestion.questions"
          v-show="index === currentQuestionIndex"
          :key="question.id"
          class="question-card"
        >
          <h4 class="question-title">{{ question.title }}</h4>
          <p v-if="question.description" class="question-desc">{{ question.description }}</p>
          
          <div class="options-list">
            <label
              v-for="option in question.options"
              :key="option.value"
              class="option-item"
              :class="{ selected: answers[question.id] === option.value }"
            >
              <input
                type="radio"
                :name="`question-${question.id}`"
                :value="option.value"
                v-model="answers[question.id]"
              />
              <span>{{ option.label }}</span>
            </label>
          </div>
        </div>
        
        <div class="question-actions">
          <button
            v-if="currentQuestionIndex > 0"
            @click="prevQuestion"
            class="btn-prev"
          >
            上一题
          </button>
          <button
            v-if="currentQuestionIndex < selectedQuestion.questions.length - 1"
            @click="nextQuestion"
            class="btn-next"
          >
            下一题
          </button>
          <button
            v-if="currentQuestionIndex === selectedQuestion.questions.length - 1"
            @click="submitAnswers"
            class="btn-submit"
            :disabled="!canSubmit"
          >
            提交答案
          </button>
        </div>
      </div>
      
      <!-- 答题结果 -->
      <div v-else class="question-result">
        <div class="result-header">
          <h3>答题结果</h3>
        </div>
        <div class="result-content">
          <div class="result-score">
            <span class="score-label">得分：</span>
            <span class="score-value">{{ result.score }}</span>
            <span class="score-total">/ {{ result.totalScore }}</span>
          </div>
          <div class="result-analysis">
            <h4>结果分析</h4>
            <p>{{ result.analysis }}</p>
          </div>
          <div class="result-suggestions">
            <h4>建议</h4>
            <ul>
              <li v-for="(suggestion, index) in result.suggestions" :key="index">
                {{ suggestion }}
              </li>
            </ul>
          </div>
        </div>
        <div class="result-actions">
          <button @click="backToList" class="btn-back-list">返回列表</button>
          <button @click="viewDifyAdvisor" class="btn-advisor">咨询心理顾问</button>
        </div>
      </div>
    </div>
    
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <p>加载中...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getQuestionBankList, getQuestionDetail, submitQuestionnaire, getQuestionResult } from '@/api/decompress'
import { useGlobalState } from '@/store'
import { updatePoints } from '@/api/decompress'

const router = useRouter()
const globalState = useGlobalState()
const currentUserId = computed(() => globalState.currentUserId)

// 状态
const loading = ref(false)
const questionList = ref([])
const selectedQuestion = ref(null)
const currentQuestionIndex = ref(0)
const answers = ref({})
const showResult = ref(false)
const result = ref(null)

// 计算属性
const canSubmit = computed(() => {
  if (!selectedQuestion.value) return false
  return selectedQuestion.value.questions.every(q => answers.value[q.id] !== undefined)
})

// 默认题库数据（包含90题心理健康自测量表）
const defaultQuestionList = [
  {
    id: 1,
    title: '压力评估测试',
    description: '评估你当前的压力水平',
    questionCount: 5,
    duration: 5
  },
  {
    id: 2,
    title: '焦虑自评量表',
    description: '了解你的焦虑程度',
    questionCount: 7,
    duration: 7
  },
  {
    id: 3,
    title: '心理健康自测量表',
    description: '全面评估您的心理健康状况，包含90个专业问题（基于SCL-90量表）',
    questionCount: 90,
    duration: 20
  }
]

// 获取题库列表
const fetchQuestionList = async () => {
  loading.value = true
  try {
    const response = await getQuestionBankList({
      userId: currentUserId.value
    })
    // 如果后端返回了数据，使用后端数据；否则使用默认数据
    questionList.value = (response.data && response.data.length > 0) ? response.data : defaultQuestionList
  } catch (error) {
    console.error('获取题库列表失败，使用默认数据:', error)
    // Demo版：使用默认模拟数据（包含90题量表）
    questionList.value = defaultQuestionList
  } finally {
    loading.value = false
  }
}

// 选择题目
const selectQuestion = async (questionId) => {
  // 兼容性处理：检查用户ID
  if (!currentUserId.value) {
    alert('用户未登录，请先登录')
    return
  }
  
  loading.value = true
  try {
    const response = await getQuestionDetail(questionId)
    console.log('获取题目详情响应:', response)
    
    // 兼容性处理：检查响应数据格式
    // 响应拦截器已经处理了 { code, msg, data } 格式，直接返回 response
    let questionData = null
    
    // 检查响应格式：可能是 { code, msg, data } 或直接是 data
    if (response && response.data) {
      questionData = response.data
    } else if (response && response.code === 200 && response.data) {
      questionData = response.data
    } else if (response && typeof response === 'object' && !response.code) {
      // 如果没有code字段，可能是直接返回的数据
      questionData = response
    }
    
    console.log('解析后的题目数据:', questionData)
    
    // 验证数据格式
    if (!questionData) {
      throw new Error('响应数据为空')
    }
    
    if (!questionData.questions || !Array.isArray(questionData.questions) || questionData.questions.length === 0) {
      console.error('题目数据格式错误:', {
        hasQuestions: !!questionData.questions,
        isArray: Array.isArray(questionData.questions),
        length: questionData.questions?.length
      })
      throw new Error('题目数据格式不正确：questions字段缺失或为空')
    }
    
    // 数据验证通过，设置题目
    selectedQuestion.value = questionData
    currentQuestionIndex.value = 0
    answers.value = {}
    showResult.value = false
    
    console.log('题目加载成功，题目数:', questionData.questions.length)
  } catch (error) {
    console.error('获取题目详情失败:', error)
    console.error('错误详情:', {
      message: error.message,
      stack: error.stack,
      response: error.response
    })
    alert('获取题目失败：' + (error.message || '未知错误') + '。请确保后端服务正常运行。')
  } finally {
    loading.value = false
  }
}

// 上一题
const prevQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
  }
}

// 下一题
const nextQuestion = () => {
  if (currentQuestionIndex.value < selectedQuestion.value.questions.length - 1) {
    currentQuestionIndex.value++
  }
}

// 提交答案
const submitAnswers = async () => {
  if (!canSubmit.value) {
    alert('请完成所有题目')
    return
  }
  
  loading.value = true
  try {
    const response = await submitQuestionnaire({
      userId: currentUserId.value,
      questionId: selectedQuestion.value.id,
      answers: answers.value
    })
    
    // 获取结果（兼容性处理）
    let resultData = null
    if (response && response.data) {
      if (response.data.resultId) {
        // 如果有resultId，获取详细结果
        try {
          const resultResponse = await getQuestionResult(response.data.resultId)
          resultData = resultResponse.data?.result || resultResponse.data || response.data.result
        } catch (e) {
          console.error('获取详细结果失败，使用提交返回的结果:', e)
          resultData = response.data.result || response.data
        }
      } else {
        resultData = response.data.result || response.data
      }
    } else if (response && response.result) {
      resultData = response.result
    }
    
    if (resultData) {
      result.value = resultData
    } else {
      throw new Error('无法获取测试结果')
    }
    
    showResult.value = true
    
    // 奖励积分（完成心理测试奖励15积分）
    try {
      await updatePoints({
        userId: currentUserId.value,
        points: 15,
        source: 'questionnaire',
        description: `完成${selectedQuestion.value.title}`
      })
    } catch (error) {
      console.error('积分更新失败:', error)
    }
  } catch (error) {
    console.error('提交答案失败:', error)
    alert('提交失败，请重试')
  } finally {
    loading.value = false
  }
}

// 返回列表
const backToList = () => {
  selectedQuestion.value = null
  currentQuestionIndex.value = 0
  answers.value = {}
  showResult.value = false
  result.value = null
}

// 咨询心理顾问
const viewDifyAdvisor = () => {
  // 跳转到Dify顾问页面，传递情绪标签和结果
  const emotionTags = globalState.emotionCommonTags.join(',')
  router.push({
    path: '/decompress/advisor',
    query: {
      emotionTags: emotionTags,
      questionResult: JSON.stringify(result.value)
    }
  })
}

// 初始化
onMounted(() => {
  fetchQuestionList()
})
</script>

<style scoped>
.decompress-questionnaire {
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

.question-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.question-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background: var(--bg-white);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: all var(--transition-base);
}

.question-item:hover {
  box-shadow: var(--shadow-md);
  transform: translateX(4px);
}

.question-info h3 {
  font-size: 18px;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.question-info p {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.question-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: var(--text-secondary);
}

.question-arrow {
  font-size: 24px;
  color: var(--text-secondary);
}

.question-detail {
  background: var(--bg-white);
  border-radius: var(--border-radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-sm);
}

.question-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
}

.btn-back {
  background: transparent;
  border: none;
  color: var(--primary-color);
  cursor: pointer;
  font-size: 14px;
  margin-bottom: 12px;
}

.question-header h3 {
  font-size: 20px;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.question-progress {
  font-size: 14px;
  color: var(--text-secondary);
}

.question-card {
  margin-bottom: 24px;
}

.question-title {
  font-size: 18px;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.question-desc {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 20px;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: all var(--transition-base);
}

.option-item:hover {
  border-color: var(--primary-color);
  background: var(--primary-light);
}

.option-item.selected {
  border-color: var(--primary-color);
  background: var(--primary-light);
}

.option-item input[type="radio"] {
  cursor: pointer;
}

.question-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 32px;
}

.question-actions button {
  padding: 12px 24px;
  border: none;
  border-radius: var(--border-radius-md);
  font-size: 16px;
  cursor: pointer;
  transition: all var(--transition-base);
}

.btn-prev {
  background: var(--text-secondary);
  color: white;
}

.btn-next, .btn-submit {
  background: var(--primary-color);
  color: white;
}

.btn-submit:disabled {
  background: var(--text-disabled);
  cursor: not-allowed;
}

.question-result {
  text-align: center;
}

.result-header h3 {
  font-size: 24px;
  color: var(--text-primary);
  margin-bottom: 24px;
}

.result-score {
  margin-bottom: 32px;
}

.score-label {
  font-size: 18px;
  color: var(--text-secondary);
}

.score-value {
  font-size: 48px;
  font-weight: bold;
  color: var(--primary-color);
  margin: 0 8px;
}

.score-total {
  font-size: 24px;
  color: var(--text-secondary);
}

.result-analysis, .result-suggestions {
  text-align: left;
  margin-bottom: 24px;
  padding: 20px;
  background: var(--bg-hover);
  border-radius: var(--border-radius-md);
}

.result-analysis h4, .result-suggestions h4 {
  font-size: 16px;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.result-analysis p {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
}

.result-suggestions ul {
  list-style: none;
  padding: 0;
}

.result-suggestions li {
  font-size: 14px;
  color: var(--text-secondary);
  padding: 8px 0;
  padding-left: 20px;
  position: relative;
}

.result-suggestions li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: var(--primary-color);
}

.result-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 32px;
}

.result-actions button {
  padding: 12px 24px;
  border: none;
  border-radius: var(--border-radius-md);
  font-size: 16px;
  cursor: pointer;
  transition: all var(--transition-base);
}

.btn-back-list {
  background: var(--text-secondary);
  color: white;
}

.btn-advisor {
  background: var(--primary-color);
  color: white;
}

.empty-state, .loading-state {
  text-align: center;
  padding: 60px;
  color: var(--text-secondary);
}
</style>
