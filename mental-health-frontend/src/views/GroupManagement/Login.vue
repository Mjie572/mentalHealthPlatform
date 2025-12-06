<template>
  <div class="auth-page">
    <h2 class="page-title">登录</h2>
    <form class="form" @submit.prevent="login">
      <div class="field">
        <input v-model.trim="username" placeholder="用户名或邮箱" />
      </div>
      <div class="field password-field">
        <input :type="showPassword ? 'text' : 'password'" v-model="password" placeholder="密码" />
        <button type="button" class="eye" @click="showPassword = !showPassword">{{ showPassword ? '🙈' : '👁️' }}</button>
      </div>
      <div class="row">
        <label class="checkbox">
          <input type="checkbox" v-model="rememberMe" /> 记住我
        </label>
        <button type="button" class="link" @click="handleForgot">忘记密码？</button>
      </div>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      <button class="btn-primary" type="submit" :disabled="loading">{{ loading ? '登录中...' : '登录' }}</button>
    </form>
    <div class="links">
      <router-link to="/system/register">没有账号？去注册</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import request from '@/api/request.js'

const router = useRouter()
const route = useRoute()

const username = ref('')
const password = ref('')
const showPassword = ref(false)
const rememberMe = ref(true)
const loading = ref(false)
const errorMessage = ref('')

const isEmail = (val) => /.+@.+\..+/.test(val)

const validate = () => {
  errorMessage.value = ''
  if (!username.value) {
    errorMessage.value = '请输入用户名或邮箱'
    return false
  }
  if (username.value.includes('@') && !isEmail(username.value)) {
    errorMessage.value = '邮箱格式不正确'
    return false
  }
  if (!password.value || password.value.length < 6) {
    errorMessage.value = '密码长度至少6位'
    return false
  }
  return true
}

const handleForgot = () => {
  alert('请联系管理员或使用预留邮箱进行密码找回（示例流程）')
}

const login = async () => {
  if (!validate()) return
  loading.value = true
  try {
    const resp = await request({
      method: 'POST',
      url: '/auth/login',
      data: { usernameOrEmail: username.value, password: password.value }
    })
    const { token, user } = resp.data || {}
    if (!token || !user?.username) throw new Error('登录响应异常')
    if (rememberMe.value) {
      localStorage.setItem('token', token)
      localStorage.setItem('username', user.username)
      sessionStorage.removeItem('token')
      sessionStorage.removeItem('username')
      localStorage.setItem('rememberMe', '1')
    } else {
      sessionStorage.setItem('token', token)
      sessionStorage.setItem('username', user.username)
      localStorage.removeItem('token')
      localStorage.removeItem('username')
      localStorage.removeItem('rememberMe')
    }
    const redirect = route.query.redirect || '/system/account'
    alert('登录成功')
    router.replace(redirect)
  } catch (e) {
    errorMessage.value = e?.message || '登录失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  const prefill = route.query.prefill
  if (prefill && typeof prefill === 'string') {
    username.value = prefill
  }
})
</script>

<style scoped>
.auth-page { max-width: 560px; margin: 40px auto; background: var(--soft-gradient); backdrop-filter: blur(4px); padding: 32px; border-radius: 16px; box-shadow: var(--shadow-md); }
.page-title { font-size: 24px; font-weight: 700; color: var(--text-primary); margin-bottom: 16px; }
.form { display: flex; flex-direction: column; gap: 16px; }
.field { display: flex; align-items: center; }
.password-field { position: relative; }
input { width: 100%; padding: 12px 14px; border: 1px solid var(--border-color); border-radius: 6px; transition: border-color .2s ease, box-shadow .2s ease; }
input:focus { border-color: var(--primary-color); box-shadow: 0 0 0 3px rgba(82,196,26,.12); outline: none; }
.eye { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); border: none; background: transparent; cursor: pointer; font-size: 14px; }
.row { display: flex; align-items: center; justify-content: space-between; }
.checkbox { display: flex; align-items: center; gap: 8px; color: var(--text-secondary); }
.error { color: var(--error-color); font-size: 13px; }
.btn-primary { padding: 12px 16px; background: linear-gradient(135deg, var(--primary-color), var(--accent-color)); color: #fff; border: none; border-radius: 8px; font-weight: 600; box-shadow: var(--shadow-sm); transition: filter .2s ease, transform .06s ease; }
.btn-primary:hover { filter: brightness(1.04); }
.btn-primary:active { transform: translateY(1px); }
.links { margin-top: 12px; }
.link { background: none; border: none; color: var(--text-secondary); cursor: pointer; }
</style>