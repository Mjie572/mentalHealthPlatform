<template>
  <div class="system-assistant page">
    <div class="page-header">
      <h2>界面引导智能助手</h2>
      <p>心小导</p>
    </div>

    <div class="chat-container">
      <div class="chat-window">
        <div v-for="(msg, idx) in messages" :key="idx" :class="['message', msg.role]">
          <div class="bubble">{{ msg.content }}</div>
        </div>
        <div v-if="loading" class="message bot"><div class="bubble">正在思考...</div></div>
      </div>
      <div class="input-bar">
        <input v-model="input" class="input" type="text" placeholder="请输入你的问题..." @keydown.enter="handleSend"/>
        <button class="btn primary" :disabled="loading" @click="handleSend">发送</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { createDifyClient } from '@/api/dify.js'

const input = ref('')
const messages = ref([])
const loading = ref(false)
const conversationId = ref(null)

const difyClient = createDifyClient({ initialBaseURL: '/v1', initialApiKey: 'app-MuJVvt9C7n5ee2LAygf2wQUC' })

// 获取当前用户ID（用户名），未登录则为 guest
const getCurrentUserId = () => localStorage.getItem('username') || sessionStorage.getItem('username') || 'guest'

let currentStreamStopFunction = null;

const sendMessage = (queryText, isInitial = false) => {
  if (!isInitial && !queryText.trim()) return;

  if (currentStreamStopFunction) {
    currentStreamStopFunction();
    currentStreamStopFunction = null;
  }

  if (!isInitial) {
    messages.value.push({ role: 'user', content: queryText });
    input.value = '';
  }

  loading.value = true;
  let botMessageIndex = messages.value.length;
  messages.value.push({ role: 'bot', content: '' }); // Placeholder for bot's streaming response

  currentStreamStopFunction = difyClient.sendChatStream({
    query: queryText,
    inputs: {},
    conversation_id: conversationId.value,
    user: getCurrentUserId(),
    onMessage: (data) => {
      if (data.event === 'agent_message' || data.event === 'message') {
        messages.value[botMessageIndex].content += data.answer;
      } else if (data.event === 'message_end') {
        if (data.conversation_id) {
          conversationId.value = data.conversation_id;
        }
      }
    },
    onComplete: () => {
      loading.value = false;
      currentStreamStopFunction = null;
      // If the bot message is empty after completion (e.g., no content received), remove it
      if (messages.value[botMessageIndex].content === '') {
        messages.value.pop();
      }
    },
    onError: (err) => {
      loading.value = false;
      currentStreamStopFunction = null;
      const errorMessage = '请求失败：' + (err?.message || '未知错误');
      messages.value[botMessageIndex] = { role: 'bot error', content: errorMessage }; // Replace with error message
    }
  });
};

onMounted(() => {
  sendMessage('你好', true); // Send an initial greeting from the bot
});

const handleSend = () => {
  sendMessage(input.value);
};
</script>

<style scoped>
.page {
  max-width: 960px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.page-header h2 {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
}

.btn {
  height: 32px;
  padding: 0 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  background: #fff;
  color: var(--text-secondary);
  cursor: pointer;
}

.btn.primary { background: var(--primary-color); color: #fff; border: none; }
.btn.danger { background: var(--error-color); color: #fff; border: none; }
.btn:disabled { opacity: .6; cursor: not-allowed; }

.chat-container {
  background: #fff;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  padding: 12px;
}

.chat-window {
  min-height: 240px;
  max-height: 520px;
  overflow: auto;
  padding: 8px 4px;
}

.message { display: flex; margin: 8px 0; }
.message .bubble {
  max-width: 85%;
  padding: 10px 12px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.5;
}
.message.user { justify-content: flex-end; }
.message.user .bubble { background: var(--primary-light); color: #fff; }
.message.bot { justify-content: flex-start; }
.message.bot .bubble { background: var(--bg-soft); color: var(--text-primary); border: 1px solid var(--border-color); }
.message.bot.error .bubble { background: var(--error-light); color: #fff; }

.input-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}
.input { flex: 1; height: 36px; border: 1px solid var(--border-color); border-radius: var(--border-radius-md); padding: 0 10px; outline: none; }
.input:focus { border-color: var(--primary-color); box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.15); }
</style>

