<template>
  <div class="auth-page">
    <h2 class="page-title">注册</h2>
    <form class="form" @submit.prevent="register">
      <div class="field">
        <input v-model.trim="username" placeholder="用户名" />
      </div>
      <div class="field">
        <input v-model.trim="email" placeholder="邮箱" />
      </div>
      <div class="field">
        <input v-model="password" type="password" placeholder="密码（至少6位）" />
      </div>
      <div class="field">
        <input v-model="confirm" type="password" placeholder="确认密码" />
      </div>
      <label class="checkbox">
        <input type="checkbox" v-model="agree" /> 我已阅读并同意《用户协议》和《隐私政策》
      </label>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      <button class="btn-primary" type="submit" :disabled="loading">{{ loading ? '注册中...' : '注册' }}</button>
    </form>
    <div class="links">
      <router-link to="/system/login">已有账号？去登录</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import request from '@/api/request.js'

const router = useRouter()

const username = ref('')
const email = ref('')
const password = ref('')
const confirm = ref('')
const agree = ref(true)
const loading = ref(false)
const errorMessage = ref('')

const isEmail = (val) => /.+@.+\..+/.test(val)

const validate = () => {
  errorMessage.value = ''
  if (!username.value) { errorMessage.value = '请输入用户名'; return false }
  if (!email.value || !isEmail(email.value)) { errorMessage.value = '请输入有效邮箱'; return false }
  if (!password.value || password.value.length < 6) { errorMessage.value = '密码长度至少6位'; return false }
  if (confirm.value !== password.value) { errorMessage.value = '两次输入的密码不一致'; return false }
  if (!agree.value) { errorMessage.value = '请勾选同意协议'; return false }
  return true
}

const register = async () => {
  if (!validate()) return
  loading.value = true
  try {
    const resp = await request({
      method: 'POST',
      url: '/auth/register',
      data: { username: username.value, email: email.value, password: password.value }
    })
    // 后端返回 { code, data: { id, username, email }, message }
    const { code, data, message } = resp || {}
    if (code !== 200 || !data?.username) throw new Error(message || '注册响应异常')
    alert('注册成功，请使用该账号登录')
    router.replace({ path: '/system/login', query: { prefill: username.value }})
  } catch (e) {
    errorMessage.value = e?.message || '注册失败，请稍后重试'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page { max-width: 560px; margin: 40px auto; background: var(--soft-gradient); backdrop-filter: blur(4px); padding: 32px; border-radius: 16px; box-shadow: var(--shadow-md); }
.page-title { font-size: 24px; font-weight: 700; color: var(--text-primary); margin-bottom: 16px; }
.form { display: flex; flex-direction: column; gap: 14px; }
.field { display: flex; align-items: center; }
input { width: 100%; padding: 12px 14px; border: 1px solid var(--border-color); border-radius: 6px; transition: border-color .2s ease, box-shadow .2s ease; }
input:focus { border-color: var(--primary-color); box-shadow: 0 0 0 3px rgba(82,196,26,.12); outline: none; }
.checkbox { display: flex; align-items: center; gap: 8px; color: var(--text-secondary); font-size: 12px; }
.error { color: var(--error-color); font-size: 13px; }
.btn-primary { padding: 12px 16px; background: linear-gradient(135deg, var(--primary-color), var(--accent-color)); color: #fff; border: none; border-radius: 8px; font-weight: 600; box-shadow: var(--shadow-sm); transition: filter .2s ease, transform .06s ease; }
.btn-primary:hover { filter: brightness(1.04); }
.btn-primary:active { transform: translateY(1px); }
.links { margin-top: 12px; }
</style>