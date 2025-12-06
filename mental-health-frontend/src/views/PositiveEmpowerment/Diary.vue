<template>
  <div class="positive-diary">
    <div class="page-header">
      <h2>感恩日记</h2>
      <p>成员C开发：对接日记组件</p>
    </div>

    <div class="card">
      <!-- 创建/编辑表单 -->
      <div class="form-grid">
        <div class="form-row">
          <label for="date">日期</label>
          <input id="date" type="date" v-model="form.date" />
        </div>
        <div class="form-row">
          <label for="content">内容</label>
          <textarea id="content" rows="3" v-model="form.content" placeholder="写下今天的感恩时刻..." />
        </div>
        <div class="actions">
          <button class="btn-primary" :disabled="saving" @click="handleSave">{{ saving ? '保存中...' : (editingId ? '保存修改' : '保存日记') }}</button>
          <button class="btn-secondary" :disabled="saving" @click="handleReset">清空</button>
          <!-- 新增：根据日记生成鼓励话语 -->
          <button id="generate-encourage" class="btn-secondary" :disabled="encourageLoading || !form.content.trim()" @click="handleGenerateEncourage">
            {{ encourageLoading ? '生成中...' : '生成鼓励话语' }}
          </button>
        </div>
        <div v-if="encourageError" class="error">{{ encourageError }}</div>
        <div v-if="copyMessage" class="copy-message">{{ copyMessage }}</div>
      
        <!-- 新增：鼓励结果展示与复制 -->
        <div v-if="encourageText" class="result">
          <h3>为你生成的鼓励：</h3>
          <p class="text">{{ encourageText }}</p>
          <div class="result-actions">
            <button id="copy-encourage" class="btn-secondary" :disabled="!encourageText" @click="handleCopy">复制结果</button>
          </div>
        </div>
        <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
      </div>

      <!-- 列表展示 -->
      <div class="list">
        <div class="list-header">
          <h3>我的感恩记录</h3>
          <button class="btn-secondary" @click="fetchList" :disabled="loading">{{ loading ? '刷新中...' : '刷新列表' }}</button>
        </div>
        <div v-if="list.length === 0" class="empty">暂无记录，试着保存第一条吧</div>
        <ul v-else class="items">
          <li v-for="item in list" :key="item.id" class="item">
            <div class="item-main">
              <div class="item-date">{{ formatDate(item.date) }}</div>
              <div class="item-content">{{ item.content }}</div>
            </div>
            <div class="item-actions">
              <button class="btn-secondary" @click="startEdit(item)">编辑</button>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getDiaryList, createDiary, updateDiary, postPositiveContent } from '@/api/positive'

const list = ref([])
const loading = ref(false)
const saving = ref(false)
const errorMessage = ref('')
const editingId = ref(null)

const todayStr = new Date().toISOString().slice(0, 10)
const form = reactive({
  date: todayStr,
  content: ''
})

const fetchList = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    const res = await getDiaryList()
    // 统一返回 { code, msg, data }
    list.value = Array.isArray(res?.data) ? res.data : []
  } catch (e) {
    errorMessage.value = e?.message || '获取列表失败'
  } finally {
    loading.value = false
  }
}

const handleSave = async () => {
  if (!form.content.trim()) {
    errorMessage.value = '请填写日记内容'
    return
  }
  if (!form.date) {
    errorMessage.value = '请选择日期'
    return
  }
  saving.value = true
  errorMessage.value = ''
  try {
    if (editingId.value) {
      const res = await updateDiary(editingId.value, { content: form.content, date: form.date })
      // 更新本地列表
      const idx = list.value.findIndex(i => i.id === editingId.value)
      if (idx !== -1) list.value[idx] = { ...list.value[idx], ...res.data }
      editingId.value = null
    } else {
      const res = await createDiary({ content: form.content, date: form.date })
      list.value.unshift(res.data)
    }
    // 重置表单
    handleReset()
  } catch (e) {
    errorMessage.value = e?.message || '保存失败'
  } finally {
    saving.value = false
  }
}

const startEdit = (item) => {
  editingId.value = item.id
  form.date = item.date?.slice(0, 10) || todayStr
  form.content = item.content || ''
}

const handleReset = () => {
  editingId.value = null
  form.date = todayStr
  form.content = ''
}

const formatDate = (val) => {
  if (!val) return ''
  try {
    const d = new Date(val)
    return d.toLocaleDateString()
  } catch {
    return val
  }
}

onMounted(() => {
  fetchList()
})

const encourageText = ref('')
const encourageLoading = ref(false)
const encourageError = ref('')
const copyMessage = ref('')
let copyTimer = null

const handleGenerateEncourage = async () => {
  encourageError.value = ''
  encourageText.value = ''
  const mood = (form.content || '').trim()
  if (!mood) {
    encourageError.value = '请填写日记内容'
    return
  }
  encourageLoading.value = true
  try {
    const res = await postPositiveContent({ userMood: mood })
    encourageText.value = res?.data?.encourageText || ''
    if (!encourageText.value) {
      encourageError.value = res?.msg || '生成失败，请稍后重试'
    }
  } catch (e) {
    encourageError.value = e?.message || '生成失败，请稍后重试'
  } finally {
    encourageLoading.value = false
  }
}

const handleCopy = async () => {
  if (!encourageText.value) return
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(encourageText.value)
    } else {
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
    encourageError.value = '复制失败，请稍后重试'
  }
}
</script>

<style scoped>
.positive-diary {
  max-width: 960px;
  margin: 0 auto;
}

.page-header { margin-bottom: 24px; }
.page-header h2 { font-size: 24px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px; }
.page-header p { font-size: 14px; color: var(--text-secondary); }

.card { background: #fff; border-radius: var(--border-radius-lg); padding: 24px; box-shadow: var(--shadow-sm); }

/* 表单区域 */
.form-grid { display: grid; grid-template-columns: 1fr; gap: 16px; margin-bottom: 24px; }
.form-row { display: flex; flex-direction: column; gap: 8px; }
label { font-size: 14px; color: var(--text-secondary); }
input, textarea { width: 100%; padding: 12px 14px; border: 1px solid var(--border-color); border-radius: 6px; transition: border-color .2s ease, box-shadow .2s ease; }
input:focus, textarea:focus { border-color: var(--primary-color); box-shadow: 0 0 0 3px rgba(82,196,26,.12); outline: none; }

.actions { display: flex; gap: 12px; }
.btn-primary { padding: 10px 14px; background: linear-gradient(135deg, var(--primary-color), var(--accent-color)); color: #fff; border: none; border-radius: 8px; font-weight: 600; box-shadow: var(--shadow-sm); transition: filter .2s ease, transform .06s ease; }
.btn-primary:hover { filter: brightness(1.04); }
.btn-primary:active { transform: translateY(1px); }
.btn-secondary { padding: 10px 14px; background: #fff; color: var(--primary-color); border: 1px solid var(--border-color); border-radius: 8px; font-weight: 600; box-shadow: var(--shadow-sm); transition: background-color .2s ease, transform .06s ease; }
.btn-secondary:hover { background-color: #f8f8f8; }
.btn-secondary:active { transform: translateY(1px); }
.error { color: var(--error-color); font-size: 13px; }

/* 列表区域 */
.list { margin-top: 8px; }
.list-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.items { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px; }
.item { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; }
.item-main { flex: 1; }
.item-date { font-size: 13px; color: var(--text-secondary); margin-bottom: 6px; }
.item-content { color: var(--text-primary); }
.item-actions { display: flex; gap: 8px; }

.empty { color: var(--text-secondary); font-size: 13px; padding: 12px; background: #fafafa; border: 1px dashed var(--border-color); border-radius: 8px; }
.copy-message { color: var(--success-color, #52c41a); font-size: 13px; margin-top: 10px; }
.result { margin-top: 20px; background: var(--soft-gradient); padding: 16px; border-radius: 10px; }
.result h3 { margin: 0 0 8px; font-size: 16px; color: var(--text-primary); }
.result .text { white-space: pre-wrap; color: var(--text-secondary); }
.result-actions { margin-top: 12px; display: flex; gap: 12px; }
</style>

