<template>
  <div class="auth-page">
    <h2>账号中心</h2>
    <div class="card">
      <p>当前用户：{{ username || '未登录' }}</p>
      <div class="actions">
        <button class="btn btn-outline" @click="logout">退出登录</button>
        <router-link class="btn btn-outline" to="/system/login">切换账号</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const username = ref('')

onMounted(() => {
  username.value = localStorage.getItem('username') || sessionStorage.getItem('username') || ''
  const token = localStorage.getItem('token') || sessionStorage.getItem('token')
  if (!token) {
    // 未登录，跳转登录页
    router.replace('/system/login')
  }
})

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('username')
  sessionStorage.removeItem('token')
  sessionStorage.removeItem('username')
  alert('已退出')
  router.replace('/system/login')
}
</script>

<style scoped>
.auth-page { max-width: 520px; margin: 40px auto; }
.card { background: var(--bg-white); padding: 24px; border-radius: 12px; box-shadow: var(--shadow-sm); border: 1px solid var(--border-light); }
.actions { display: flex; gap: 12px; margin-top: 12px; }
.btn { padding: 8px 12px; border-radius: 8px; }
.btn-outline { background: transparent; border: 1px solid var(--border-light); color: var(--text-primary); }
</style>