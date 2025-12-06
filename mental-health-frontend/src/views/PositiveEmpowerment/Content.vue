<template>
  <div class="positive-content">
    <div class="page-header">
      <h2>内容推送</h2>
      <p>成员C开发：对接内容推送功能</p>
    </div>

    <div class="card">
      <div class="form-row">
        <label for="mood">你的心情/状态</label>
        <input id="mood" v-model="userMood" type="text" placeholder="例如：最近有些焦虑，工作压力大" />
      </div>
      <div class="actions">
        <button class="btn-primary" :disabled="loading" @click="handleGenerate">
          {{ loading ? '生成中...' : '生成鼓励语句' }}
        </button>
        <!-- 新增：再次生成按钮，保留输入，重新生成 -->
        <button class="btn-secondary" :disabled="loading || !userMood.trim()" @click="handleRegenerate">
          再次生成
        </button>
      </div>
      <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
      <!-- 新增：复制成功提示 -->
      <div v-if="copyMessage" class="copy-message">{{ copyMessage }}</div>

      <div v-if="encourageText" class="result">
        <h3>为你生成的鼓励：</h3>
        <p class="text">{{ encourageText }}</p>
        <!-- 新增：结果区域的操作按钮 -->
        <div class="result-actions">
          <button class="btn-secondary" :disabled="!encourageText" @click="handleCopy">复制结果</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { postPositiveContent } from '@/api/positive'

const userMood = ref('')
const loading = ref(false)
const errorMessage = ref('')
const encourageText = ref('')
// 新增：复制提示消息
const copyMessage = ref('')
let copyTimer = null

const handleGenerate = async () => {
  errorMessage.value = ''
  // 首次生成时清空旧结果，避免误导
  encourageText.value = ''
  const mood = userMood.value.trim()
  if (!mood) {
    errorMessage.value = '请输入你的心情或状态'
    return
  }
  loading.value = true
  try {
    const res = await postPositiveContent({ userMood: mood })
    // 统一封装返回的是 { code, msg, data }
    encourageText.value = res?.data?.encourageText || ''
    if (!encourageText.value) {
      errorMessage.value = res?.msg || '生成失败，请稍后重试'
    }
  } catch (e) {
    errorMessage.value = e?.message || '生成失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

// 新增：再次生成，保留输入直接调用
const handleRegenerate = async () => {
  if (!userMood.value.trim()) {
    errorMessage.value = '请输入你的心情或状态'
    return
  }
  await handleGenerate()
}

// 新增：复制到剪贴板
const handleCopy = async () => {
  if (!encourageText.value) return
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(encourageText.value)
    } else {
      // 兼容处理
      const textarea = document.createElement('textarea')
      textarea.value = encourageText.value
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    copyMessage.value = '已复制到剪贴板'
    if (copyTimer) clearTimeout(copyTimer)
    copyTimer = setTimeout(() => { copyMessage.value = '' }, 2000)
  } catch (e) {
    errorMessage.value = '复制失败，请稍后重试'
  }
}
</script>

<style scoped>
.positive-content {
  max-width: 960px;
  margin: 0 auto;
}

.page-header { margin-bottom: 24px; }
.page-header h2 { font-size: 24px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px; }
.page-header p { font-size: 14px; color: var(--text-secondary); }

.card { background: #fff; border-radius: var(--border-radius-lg); padding: 24px; box-shadow: var(--shadow-sm); }
.form-row { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
label { font-size: 14px; color: var(--text-secondary); }
input { width: 100%; padding: 12px 14px; border: 1px solid var(--border-color); border-radius: 6px; transition: border-color .2s ease, box-shadow .2s ease; }
input:focus { border-color: var(--primary-color); box-shadow: 0 0 0 3px rgba(82,196,26,.12); outline: none; }
.actions { display: flex; gap: 12px; }
.btn-primary { padding: 10px 14px; background: linear-gradient(135deg, var(--primary-color), var(--accent-color)); color: #fff; border: none; border-radius: 8px; font-weight: 600; box-shadow: var(--shadow-sm); transition: filter .2s ease, transform .06s ease; }
.btn-primary:hover { filter: brightness(1.04); }
.btn-primary:active { transform: translateY(1px); }

/* 新增：次级按钮样式 */
.btn-secondary { padding: 10px 14px; background: #fff; color: var(--primary-color); border: 1px solid var(--border-color); border-radius: 8px; font-weight: 600; box-shadow: var(--shadow-sm); transition: background-color .2s ease, transform .06s ease; }
.btn-secondary:hover { background-color: #f8f8f8; }
.btn-secondary:active { transform: translateY(1px); }

.error { color: var(--error-color); font-size: 13px; margin-top: 10px; }
.copy-message { color: var(--success-color, #52c41a); font-size: 13px; margin-top: 10px; }
.result { margin-top: 20px; background: var(--soft-gradient); padding: 16px; border-radius: 10px; }
.result h3 { margin: 0 0 8px; font-size: 16px; color: var(--text-primary); }
.result .text { white-space: pre-wrap; color: var(--text-secondary); }
/* 新增：结果区域操作 */
.result-actions { margin-top: 12px; display: flex; gap: 12px; }
</style>

