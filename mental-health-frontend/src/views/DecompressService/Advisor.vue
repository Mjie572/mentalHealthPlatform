<template>
  <div class="decompress-advisor">
    <div class="page-header">
      <h2>心理顾问咨询</h2>
      <p>AI智能心理顾问，为您提供专业的心理支持</p>
    </div>
    
    <div class="advisor-container">
      <!-- 对话区域 -->
      <div class="chat-area">
        <div class="chat-messages" ref="messagesContainer">
          <!-- 欢迎语（仅在消息为空时显示） -->
          <div v-if="messages.length === 0 && !loading" class="welcome-message">
            <div class="welcome-avatar">🤖</div>
            <div class="welcome-content">
              <h3>欢迎使用AI心理顾问</h3>
              <p>我是您的专属心理顾问，可以为您提供：</p>
              <ul>
                <li>情绪疏导与压力缓解建议</li>
                <li>心理健康知识科普</li>
                <li>日常心理问题咨询</li>
                <li>个性化心理支持</li>
              </ul>
              <p class="welcome-tip">您可以直接输入问题，或点击下方的快捷问题开始咨询</p>
            </div>
          </div>
          
          <div
            v-for="(message, index) in messages"
            :key="index"
            :class="['message-item', message.role, { error: message.error }]"
            v-show="!message.streaming || message.role !== 'assistant'"
          >
            <div class="message-avatar">
              <span v-if="message.role === 'user'">👤</span>
              <span v-else>🤖</span>
            </div>
            <div class="message-content">
              <div class="message-text" :class="{ error: message.error }">
                {{ message.content }}
                <span v-if="message.streaming" class="typing-cursor">▊</span>
              </div>
              <div class="message-time">{{ formatTime(message.timestamp) }}</div>
            </div>
          </div>
          
          <!-- 流式消息显示（实时更新） -->
          <template
            v-for="(message, index) in messages"
            :key="`streaming-${index}`"
          >
            <div
              v-if="message.streaming && message.role === 'assistant'"
              class="message-item assistant"
            >
              <div class="message-avatar">🤖</div>
              <div class="message-content">
                <div class="message-text typing">
                  {{ message.content || '正在思考中...' }}
                  <span class="typing-cursor">▊</span>
                </div>
              </div>
            </div>
          </template>
        </div>
        
        <!-- 输入区域 -->
        <div class="chat-input-area">
          <div class="quick-questions" v-if="messages.length === 0">
            <p class="quick-title">快速提问：</p>
            <div class="quick-buttons">
              <button
                v-for="question in quickQuestions"
                :key="question"
                @click="sendQuickQuestion(question)"
                class="quick-btn"
              >
                {{ question }}
              </button>
            </div>
          </div>
          
          <div class="input-wrapper">
            <textarea
              v-model="inputMessage"
              @keydown.enter.exact.prevent="sendMessage"
              @keydown.shift.enter.exact="inputMessage += '\n'"
              placeholder="输入您的问题..."
              class="message-input"
              rows="3"
            ></textarea>
            <button
              @click="sendMessage"
              :disabled="!inputMessage.trim() || loading"
              class="send-btn"
            >
              发送
            </button>
          </div>
        </div>
      </div>
      
      <!-- 侧边栏：情绪标签和上下文信息 -->
      <div class="sidebar">
        <div class="sidebar-section">
          <h3>当前情绪标签</h3>
          <div class="emotion-tags">
            <span
              v-for="tag in currentEmotionTags"
              :key="tag"
              class="emotion-tag"
            >
              {{ tag }}
            </span>
          </div>
        </div>
        
        <div class="sidebar-section">
          <h3>用户信息</h3>
          <div class="user-info">
            <p>用户ID: {{ currentUserId }}</p>
            <p v-if="latestEmotionScore !== null">
              最近情绪评分: {{ latestEmotionScore }}
            </p>
          </div>
        </div>
        
        <div class="sidebar-section">
          <h3>对话历史</h3>
          <button @click="loadHistory" class="btn-load-history">加载历史</button>
          <div v-if="historyLoading" class="loading-text">加载中...</div>
        </div>
        
        <div class="sidebar-section" v-if="currentConversationId">
          <h3>当前会话</h3>
          <div class="conversation-info">
            <p class="conversation-id">会话ID: {{ currentConversationId.substring(0, 20) }}...</p>
            <button @click="clearConversation" class="btn-clear-conversation">新建会话</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { callDifyAdvisor, getDifyHistory } from '@/api/decompress'
import { useGlobalState, useCrossModuleState, setCurrentUserId } from '@/store'
import { formatDate } from '@/utils'

const route = useRoute()
const globalState = useGlobalState()
const crossModuleState = useCrossModuleState()

const currentUserId = computed(() => globalState.currentUserId)
const emotionCommonTags = computed(() => globalState.emotionCommonTags)
const latestEmotionScore = computed(() => crossModuleState.latestEmotionScore)

// 状态
const messages = ref([])
const inputMessage = ref('')
const loading = ref(false)
const historyLoading = ref(false)
const messagesContainer = ref(null)
const currentConversationId = ref(null) // 当前会话ID（用于会话持久化）

// 当前情绪标签（可从路由参数或全局状态获取）
const currentEmotionTags = ref([])

// 常见问题快捷按钮
const quickQuestions = [
  '缓解焦虑的方法',
  '如何应对压力',
  '改善睡眠质量',
  '保持积极心态',
  '情绪管理技巧',
  '放松训练指导'
]

// 初始化情绪标签和会话ID
onMounted(() => {
  // 从路由参数获取
  if (route.query.emotionTags) {
    currentEmotionTags.value = route.query.emotionTags.split(',')
  } else {
    // 使用全局情绪标签
    currentEmotionTags.value = [...emotionCommonTags.value]
  }
  
  // 从localStorage恢复会话ID（会话持久化）
  const savedConversationId = localStorage.getItem(`dify_conversation_${currentUserId.value}`);
  if (savedConversationId) {
    currentConversationId.value = savedConversationId;
  }
  
  // 如果有问题结果，添加到上下文
  if (route.query.questionResult) {
    try {
      const result = JSON.parse(route.query.questionResult)
      messages.value.push({
        role: 'system',
        content: `根据您的测试结果（得分：${result.score}/${result.totalScore}），我将为您提供针对性的建议。`,
        timestamp: Date.now()
      })
    } catch (e) {
      console.error('解析问题结果失败:', e)
    }
  }
})

// 发送快速问题
const sendQuickQuestion = (question) => {
  inputMessage.value = question
  sendMessage()
}

// 发送消息（Streaming流式模式）
const sendMessage = async () => {
  if (!inputMessage.value.trim() || loading.value) return
  
  // 兼容性处理：如果用户ID为空，自动生成（确保始终有用户ID）
  if (!currentUserId.value) {
    // 生成唯一用户标识
    const generatedUserId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    // 更新全局状态
    setCurrentUserId(generatedUserId);
    console.log('自动生成用户ID:', generatedUserId);
  }
  
  const userMessage = inputMessage.value.trim()
  inputMessage.value = ''
  
  // 添加用户消息到界面
  messages.value.push({
    role: 'user',
    content: userMessage,
    timestamp: Date.now()
  })
  
  // 添加一个空的助手消息占位符（用于流式更新）
  const assistantMessageIndex = messages.value.length
  messages.value.push({
    role: 'assistant',
    content: '',
    timestamp: Date.now(),
    streaming: true // 标记为流式消息
  })
  
  // 滚动到底部
  await nextTick()
  scrollToBottom()
  
  // 调用Dify API（Streaming流式模式）
  // 通过后端中转，避免前端直接暴露密钥
  // 关联currentUserId传递用户标识，适配emotionCommonTags统一情绪标签
  loading.value = true
  
  try {
    await callDifyAdvisor(
      {
        userId: currentUserId.value, // 关联currentUserId传递用户标识
        message: userMessage,
        emotionTags: currentEmotionTags.value.length > 0 ? currentEmotionTags.value : emotionCommonTags.value, // 适配emotionCommonTags统一情绪标签
        emotionScore: latestEmotionScore.value, // 关联latestEmotionScore
        conversationId: currentConversationId.value // 会话ID（用于会话持久化）
      },
      // onMessage: 实时接收消息块
      (chunk, fullAnswer) => {
        // 实时更新助手消息内容
        if (messages.value[assistantMessageIndex]) {
          messages.value[assistantMessageIndex].content = fullAnswer
          messages.value[assistantMessageIndex].streaming = true
        }
        // 实时滚动到底部
        scrollToBottom()
      },
      // onError: 错误处理
      (error) => {
        console.error('调用Dify API失败:', error)
        // 更新助手消息为错误提示
        if (messages.value[assistantMessageIndex]) {
          messages.value[assistantMessageIndex].content = error.message || '咨询服务暂不可用，请稍后重试'
          messages.value[assistantMessageIndex].streaming = false
          messages.value[assistantMessageIndex].error = true
        }
      },
      // onEnd: 消息结束
      (result) => {
        // 更新完整的助手消息
        if (messages.value[assistantMessageIndex]) {
          // 只有在有完整回复时才更新，否则保持流式更新后的内容
          if (result.fullAnswer && result.fullAnswer.trim()) {
            messages.value[assistantMessageIndex].content = result.fullAnswer
            messages.value[assistantMessageIndex].error = false
          } else if (!messages.value[assistantMessageIndex].content || !messages.value[assistantMessageIndex].content.trim()) {
            // 如果既没有result.fullAnswer，也没有流式更新的内容，说明出错了
            // 检查是否有错误信息（从onError回调中设置）
            if (!messages.value[assistantMessageIndex].error) {
              messages.value[assistantMessageIndex].content = '抱歉，未能获取到回复。请检查Dify服务是否正常运行。'
              messages.value[assistantMessageIndex].error = true
            }
          }
          messages.value[assistantMessageIndex].streaming = false
        }
        
        // 保存会话ID（会话持久化）
        if (result.conversationId) {
          currentConversationId.value = result.conversationId
          localStorage.setItem(`dify_conversation_${currentUserId.value}`, result.conversationId)
        }
        
        loading.value = false
        scrollToBottom()
      }
    )
  } catch (error) {
    console.error('调用Dify API失败:', error)
    // 更新助手消息为错误提示
    if (messages.value[assistantMessageIndex]) {
      messages.value[assistantMessageIndex].content = error.message || '咨询服务暂不可用，请稍后重试'
      messages.value[assistantMessageIndex].streaming = false
      messages.value[assistantMessageIndex].error = true
    }
    loading.value = false
    await nextTick()
    scrollToBottom()
  }
}

// 获取模拟回复（Demo版）
const getMockResponse = (userMessage) => {
  const responses = [
    '我理解您的感受。建议您尝试深呼吸，放松身心。',
    '压力是正常的，重要的是找到适合自己的缓解方式。可以尝试运动、听音乐或与朋友交流。',
    '睡眠问题可能与压力有关。建议保持规律的作息时间，睡前避免使用电子设备。',
    '保持积极心态需要时间和练习。可以尝试记录每天的小确幸，培养感恩的习惯。'
  ]
  return responses[Math.floor(Math.random() * responses.length)]
}

// 加载历史记录
const loadHistory = async () => {
  if (!currentUserId.value) return
  
  historyLoading.value = true
  try {
    const response = await getDifyHistory({
      userId: currentUserId.value,
      limit: 20
    })
    
    // 根据新的响应格式处理
    const historyData = response.data?.data || response.data || []
    
    if (historyData.length > 0) {
      messages.value = historyData.map(msg => ({
        role: msg.role || 'assistant',
        content: msg.content || msg.message || msg.answer || '',
        timestamp: msg.timestamp ? new Date(msg.timestamp).getTime() : Date.now()
      }))
    }
  } catch (error) {
    console.error('加载历史记录失败:', error)
  } finally {
    historyLoading.value = false
  }
}

// 滚动到底部
const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// 格式化时间
const formatTime = (timestamp) => {
  return formatDate(new Date(timestamp), 'HH:mm')
}

// 清除当前会话（新建会话）
const clearConversation = () => {
  currentConversationId.value = null
  localStorage.removeItem(`dify_conversation_${currentUserId.value}`)
  messages.value = []
}
</script>

<style scoped>
.decompress-advisor {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
  min-height: calc(100vh - 200px);
  display: flex;
  flex-direction: column;
}

.page-header {
  margin-bottom: 24px;
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

.advisor-container {
  display: flex;
  gap: 24px;
  height: calc(100vh - 200px);
}

.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--bg-white);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.message-item.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  background: var(--bg-hover);
  flex-shrink: 0;
}

.message-content {
  flex: 1;
  max-width: 70%;
}

.message-item.user .message-content {
  text-align: right;
}

.message-text {
  padding: 12px 16px;
  border-radius: var(--border-radius-md);
  background: var(--bg-hover);
  color: var(--text-primary);
  word-wrap: break-word;
}

.message-item.user .message-text {
  background: var(--primary-color);
  color: white;
}

.message-item.assistant .message-text {
  background: var(--bg-hover);
}

.welcome-message {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  padding: 24px;
  background: var(--primary-light);
  border-radius: var(--border-radius-lg);
  margin-bottom: 16px;
}

.welcome-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  background: var(--primary-color);
  flex-shrink: 0;
}

.welcome-content {
  flex: 1;
}

.welcome-content h3 {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.welcome-content p {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 8px;
}

.welcome-content ul {
  list-style: none;
  padding: 0;
  margin: 12px 0;
}

.welcome-content li {
  font-size: 14px;
  color: var(--text-secondary);
  padding: 6px 0;
  padding-left: 20px;
  position: relative;
}

.welcome-content li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: var(--primary-color);
  font-weight: bold;
}

.welcome-tip {
  font-size: 13px;
  color: var(--text-secondary);
  font-style: italic;
  margin-top: 12px;
}

.message-text.typing {
  font-style: italic;
  color: var(--text-secondary);
}

.message-time {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 4px;
}

.chat-input-area {
  padding: 16px;
  border-top: 1px solid var(--border-color);
  background: var(--bg-white);
}

.quick-questions {
  margin-bottom: 16px;
}

.quick-title {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.quick-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.quick-btn {
  padding: 8px 16px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  background: var(--bg-white);
  color: var(--text-primary);
  font-size: 14px;
  cursor: pointer;
  transition: all var(--transition-base);
}

.quick-btn:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.input-wrapper {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.message-input {
  flex: 1;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  font-size: 14px;
  resize: none;
  font-family: inherit;
}

.message-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.send-btn {
  padding: 12px 24px;
  border: none;
  border-radius: var(--border-radius-md);
  background: var(--primary-color);
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all var(--transition-base);
}

.send-btn:hover:not(:disabled) {
  background: var(--primary-dark);
}

.send-btn:disabled {
  background: var(--text-disabled);
  cursor: not-allowed;
}

.sidebar {
  width: 300px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sidebar-section {
  background: var(--bg-white);
  border-radius: var(--border-radius-lg);
  padding: 20px;
  box-shadow: var(--shadow-sm);
}

.sidebar-section h3 {
  font-size: 16px;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.emotion-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.emotion-tag {
  padding: 6px 12px;
  background: var(--primary-light);
  color: var(--primary-color);
  border-radius: var(--border-radius-sm);
  font-size: 12px;
}

.user-info {
  font-size: 14px;
  color: var(--text-secondary);
}

.user-info p {
  margin: 4px 0;
}

.btn-load-history {
  padding: 8px 16px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  background: var(--bg-white);
  color: var(--text-primary);
  font-size: 14px;
  cursor: pointer;
  transition: all var(--transition-base);
}

.btn-load-history:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.loading-text {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 8px;
}

.typing-cursor {
  display: inline-block;
  animation: blink 1s infinite;
  color: var(--primary-color);
  margin-left: 2px;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.message-item.error .message-text {
  color: #ff4d4f;
  border-left: 3px solid #ff4d4f;
  padding-left: 13px;
}

.conversation-info {
  font-size: 14px;
  color: var(--text-secondary);
}

.conversation-id {
  font-size: 12px;
  word-break: break-all;
  margin-bottom: 8px;
  color: var(--text-secondary);
}

.btn-clear-conversation {
  padding: 6px 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  background: var(--bg-white);
  color: var(--text-primary);
  font-size: 12px;
  cursor: pointer;
  transition: all var(--transition-base);
  width: 100%;
}

.btn-clear-conversation:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}
</style>

