<template>
  <BaseModal
    :visible="visible"
    title="心小导 · 智能助手"
    :position="'bottom-right'"
    :overlayTransparent="true"
    :closeOnClickOverlay="false"
    :showFooter="false"
    :width="'360px'"
    :maxHeight="'60vh'"
    @close="handleClose"
  >
    <div class="assistant-floating">
      <div class="header">
        <div class="left">
          <span class="status-dot"></span>
          <span class="title">随时为你提供支持</span>
        </div>
        <div class="actions">
          <button v-if="loading" class="btn text" @click="stopGenerating">停止生成</button>
          <button class="btn text" :disabled="loading" @click="clearConversation">清空会话</button>
        </div>
      </div>

      <div class="suggestions" aria-label="快捷问题">
        <button
          v-for="(sug, sidx) in suggestions"
          :key="sidx"
          class="chip"
          :disabled="loading"
          @click="handleSuggestion(sug)"
        >{{ sug }}</button>
      </div>

      <div class="chat-window">
        <div v-for="(msg, idx) in messages" :key="idx" :class="['message', msg.role]">
          <div class="avatar" aria-hidden="true">{{ msg.role === 'user' ? '🙂' : '🤖' }}</div>
          <div class="bubble">
            <div class="content">{{ msg.content }}</div>
            <div v-if="msg.time" class="meta">{{ msg.time }}</div>
          </div>
        </div>
        <div v-if="loading" class="message bot"><div class="avatar">🤖</div><div class="bubble"><div class="content">正在思考...</div></div></div>
      </div>

      <div class="input-bar">
        <input
          v-model="input"
          class="input"
          type="text"
          placeholder="请输入你的问题..."
          @keydown.enter="handleSend"
        />
        <button class="send" :disabled="loading" @click="handleSend">发送</button>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import BaseModal from '@/components/common/BaseModal.vue'
import { createDifyClient } from '@/api/dify.js'

const visible = ref(false)
const input = ref('')
const messages = ref([])
const loading = ref(false)
const conversationId = ref(null)

const suggestions = [
  '情绪监控',
  '多维解压',
  '压力自测',
  '使用指南',
]

const difyClient = createDifyClient({ initialBaseURL: '/v1', initialApiKey: 'app-MuJVvt9C7n5ee2LAygf2wQUC' })

// 获取当前用户ID（用户名），未登录则为 guest
const getCurrentUserId = () => localStorage.getItem('username') || sessionStorage.getItem('username') || 'guest'

let currentStreamStopFunction = null;

const formatTime = (d = new Date()) => {
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const openHandler = (e) => {
  visible.value = true
  const src = e?.detail?.source
  const gid = e?.detail?.groupId
  if (src || gid) {
    const info = `助手已唤醒${src ? `（来源：${src}）` : ''}${gid ? `，群组ID：${gid}` : ''}`
    messages.value.push({ role: 'bot', content: info, time: formatTime() })
  }
}

const handleClose = () => {
  visible.value = false
}

const stopGenerating = () => {
  if (currentStreamStopFunction) {
    currentStreamStopFunction();
    currentStreamStopFunction = null;
  }
  loading.value = false;
}

const clearConversation = () => {
  stopGenerating();
  messages.value = [];
  conversationId.value = null;
}

const sendMessage = (queryText, isInitial = false) => {
  if (!isInitial && !queryText.trim()) return;

  if (currentStreamStopFunction) {
    currentStreamStopFunction();
    currentStreamStopFunction = null;
  }

  if (!isInitial) {
    messages.value.push({ role: 'user', content: queryText, time: formatTime() });
    input.value = '';
  }

  loading.value = true;
  let botMessageIndex = messages.value.length;
  messages.value.push({ role: 'bot', content: '', time: formatTime() }); // Placeholder for bot's streaming response

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
      if (messages.value[botMessageIndex]?.content === '') {
        messages.value.splice(botMessageIndex, 1);
      }
    },
    onError: (err) => {
      loading.value = false;
      currentStreamStopFunction = null;
      const errorMessage = '请求失败：' + (err?.message || '未知错误');
      messages.value[botMessageIndex] = { role: 'bot error', content: errorMessage, time: formatTime() }; // Replace with error message
    }
  });
};

const handleSuggestion = (text) => {
  if (loading.value) return;
  sendMessage(text);
}

onMounted(() => {
  window.addEventListener('assistant:open', openHandler);
  sendMessage('你好', true); // 初始问候
});

onBeforeUnmount(() => {
  window.removeEventListener('assistant:open', openHandler)
  stopGenerating();
})

const handleSend = () => {
  sendMessage(input.value);
};
</script>

<style scoped>
.assistant-floating {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 100%;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-color);
}
.header .left { display: flex; align-items: center; gap: 8px; }
.header .actions { display: flex; align-items: center; gap: 8px; }

.btn.text { height: 28px; padding: 0 8px; border: 1px solid var(--border-color); border-radius: var(--border-radius-sm); background: #fff; color: var(--text-secondary); }
.btn.text:disabled { opacity: .6; cursor: not-allowed; }
.btn.text:hover { background: var(--bg-soft); }

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--success-color);
  box-shadow: 0 0 0 3px rgba(82, 196, 26, 0.15);
}

.title { font-size: 13px; color: var(--text-secondary); }

.suggestions { display: flex; flex-wrap: wrap; gap: 6px; margin: 8px 0; }
.chip { height: 24px; padding: 0 8px; border: 1px solid var(--border-color); border-radius: 999px; background: #fff; color: var(--text-secondary); font-size: 12px; cursor: pointer; }
.chip:hover { background: var(--bg-soft); }
.chip:disabled { opacity: .5; cursor: not-allowed; }

.chat-window {
  flex: 1;
  min-height: 160px;
  max-height: 42vh;
  overflow: auto;
  padding: 8px 4px;
}

.message { display: flex; gap: 8px; margin: 8px 0; }
.message .avatar { width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: var(--bg-soft); border: 1px solid var(--border-color); font-size: 14px; }
.message .bubble { max-width: 85%; padding: 8px 10px; border-radius: 10px; font-size: 13px; line-height: 1.5; display: inline-flex; flex-direction: column; gap: 4px; }
.message .bubble .meta { font-size: 12px; color: var(--text-secondary); }
.message.user { justify-content: flex-end; }
.message.user .avatar { order: 2; }
.message.user .bubble { background: var(--primary-light); color: #fff; }
.message.bot { justify-content: flex-start; }
.message.bot .bubble { background: var(--bg-soft); color: var(--text-primary); border: 1px solid var(--border-color); }
.message.bot.error .bubble { background: var(--error-light); color: #fff; }

.input-bar { display: flex; align-items: center; gap: 8px; margin-top: 8px; }
.input { flex: 1; height: 32px; border: 1px solid var(--border-color); border-radius: var(--border-radius-md); padding: 0 10px; outline: none; font-size: 13px; }
.input:focus { border-color: var(--primary-color); box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.15); }

.send { height: 32px; padding: 0 10px; border: none; border-radius: var(--border-radius-md); background: var(--primary-color); color: #fff; cursor: pointer; }
.send:hover { filter: brightness(1.05); }
.send:disabled { opacity: .6; cursor: not-allowed; }
</style>