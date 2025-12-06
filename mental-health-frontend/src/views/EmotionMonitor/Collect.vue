<template>
  <div class="emotion-collect">
    <div class="page-header">
      <h2>情绪采集</h2>
      <p>成员A开发：对接情绪采集接口，支持text/voice/behavior三类数据类型</p>
    </div>

    <div class="collect-container">
      <!-- 数据类型选择 -->
      <div class="data-type-section">
        <h3>选择数据类型</h3>
        <div class="data-type-buttons">
          <button
            v-for="type in dataTypes"
            :key="type.value"
            :class="['type-btn', { active: formData.dataType === type.value }]"
            @click="formData.dataType = type.value"
          >
            <span class="type-icon">{{ type.icon }}</span>
            <span class="type-label">{{ type.label }}</span>
          </button>
        </div>
      </div>

      <!-- 内容输入 -->
      <div class="content-section">
        <h3>输入情绪内容</h3>
        <textarea
          v-model="formData.content"
          class="content-input"
          placeholder="请输入您的情绪描述、语音转文字内容或行为记录..."
          rows="8"
        ></textarea>
      </div>

      <!-- 提交按钮 -->
      <div class="submit-section">
        <button
          class="submit-btn"
          :disabled="!canSubmit || submitting"
          @click="handleSubmit"
        >
          <span v-if="submitting">分析中...</span>
          <span v-else>提交并分析情绪</span>
        </button>
      </div>

      <!-- 分析结果 -->
      <div v-if="analysisResult" class="result-section">
        <h3>分析结果</h3>
        <div class="result-card">
          <div class="result-item">
            <span class="result-label">情绪标签：</span>
            <span class="result-value emotion-tag" :class="getEmotionClass(analysisResult.emotionTag)">
              {{ analysisResult.emotionTag }}
            </span>
          </div>
          <div class="result-item">
            <span class="result-label">情绪分数：</span>
            <span class="result-value">{{ analysisResult.emotionScore }} / 100</span>
          </div>
          <div class="result-item">
            <span class="result-label">AI分析：</span>
            <p class="result-analysis">{{ analysisResult.aiAnalysis }}</p>
          </div>
          <div v-if="analysisResult.alertInfo && analysisResult.alertInfo.needAlert" class="alert-info">
            <div class="alert-badge">⚠️ 重度预警</div>
            <p class="alert-message">{{ analysisResult.alertInfo.message }}</p>
            <div v-if="analysisResult.alertInfo.appointment" class="appointment-info">
              <p>已为您推荐咨询师：{{ analysisResult.alertInfo.appointment.consultantName }}</p>
              <p>预约ID：{{ analysisResult.alertInfo.appointment.appointmentId }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 错误提示 -->
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { submitEmotion } from '@/api/emotion'
import { currentUserId, systemConfig } from '@/utils/common'

// 数据类型选项
const dataTypes = [
  { value: 'text', label: '文本', icon: '📝' },
  { value: 'voice', label: '语音', icon: '🎤' },
  { value: 'behavior', label: '行为', icon: '👤' }
]

// 表单数据
const formData = ref({
  dataType: 'text',
  content: '',
  timestamp: Date.now()
})

// 提交状态
const submitting = ref(false)
const analysisResult = ref(null)
const errorMessage = ref('')

// 是否可以提交
const canSubmit = computed(() => {
  return formData.value.dataType && formData.value.content.trim().length > 0
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

// 提交情绪数据
const handleSubmit = async () => {
  if (!canSubmit.value || submitting.value) return

  submitting.value = true
  errorMessage.value = ''
  analysisResult.value = null

  try {
    const response = await submitEmotion({
      dataType: formData.value.dataType,
      content: formData.value.content.trim(),
      timestamp: Date.now()
    })

    if (response.code === 200) {
      analysisResult.value = {
        emotionTag: response.data.emotionTag,
        emotionScore: response.data.emotionScore,
        aiAnalysis: response.data.aiAnalysis,
        alertInfo: response.data.alertInfo
      }

      // 清空表单（可选）
      // formData.value.content = ''
    } else {
      errorMessage.value = response.msg || '提交失败'
    }
  } catch (error) {
    console.error('情绪提交错误:', error)
    errorMessage.value = error.message || '网络错误，请稍后重试'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.emotion-collect {
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

.collect-container {
  background: #fff;
  border-radius: var(--border-radius-lg);
  padding: 32px;
  box-shadow: var(--shadow-sm);
}

.data-type-section,
.content-section,
.submit-section,
.result-section {
  margin-bottom: 32px;
}

.data-type-section h3,
.content-section h3,
.result-section h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.data-type-buttons {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.type-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 24px;
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius-md);
  background: #fff;
  cursor: pointer;
  transition: all 0.3s;
}

.type-btn:hover {
  border-color: var(--primary-color);
  background: var(--primary-light);
}

.type-btn.active {
  border-color: var(--primary-color);
  background: var(--primary-color);
  color: #fff;
}

.type-icon {
  font-size: 32px;
}

.type-label {
  font-size: 14px;
  font-weight: 500;
}

.content-input {
  width: 100%;
  padding: 16px;
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius-md);
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.3s;
}

.content-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.submit-btn {
  width: 100%;
  padding: 16px;
  background: var(--primary-color);
  color: #fff;
  border: none;
  border-radius: var(--border-radius-md);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.submit-btn:hover:not(:disabled) {
  background: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.submit-btn:disabled {
  background: var(--text-disabled);
  cursor: not-allowed;
  opacity: 0.6;
}

.result-card {
  padding: 24px;
  background: var(--primary-light);
  border-radius: var(--border-radius-md);
  border-left: 4px solid var(--primary-color);
}

.result-item {
  margin-bottom: 16px;
}

.result-item:last-child {
  margin-bottom: 0;
}

.result-label {
  font-weight: 600;
  color: var(--text-primary);
  margin-right: 8px;
}

.result-value {
  color: var(--text-secondary);
}

.emotion-tag {
  display: inline-block;
  padding: 4px 12px;
  border-radius: var(--border-radius-sm);
  font-weight: 600;
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

.result-analysis {
  margin-top: 8px;
  padding: 12px;
  background: #fff;
  border-radius: var(--border-radius-sm);
  color: var(--text-secondary);
  line-height: 1.6;
}

.alert-info {
  margin-top: 16px;
  padding: 16px;
  background: #fff3e0;
  border-radius: var(--border-radius-sm);
  border-left: 4px solid #ff9800;
}

.alert-badge {
  display: inline-block;
  padding: 4px 12px;
  background: #ff9800;
  color: #fff;
  border-radius: var(--border-radius-sm);
  font-weight: 600;
  margin-bottom: 8px;
}

.alert-message {
  color: var(--text-primary);
  font-weight: 500;
  margin-bottom: 8px;
}

.appointment-info {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #ffcc80;
}

.appointment-info p {
  margin: 4px 0;
  color: var(--text-secondary);
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
