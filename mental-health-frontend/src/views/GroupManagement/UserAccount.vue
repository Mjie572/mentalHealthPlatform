<template>
  <div class="user-account-management">
    <div class="page-header">
      <h2>用户账户管理</h2>
      <p>管理您的账户信息、登录、注册和切换。</p>
    </div>

    <div class="actions entry-list">
      <router-link to="/system/login" class="entry-item">
        <span class="icon">🔑</span>
        <span class="text">登录</span>
      </router-link>
      <router-link to="/system/register" class="entry-item">
        <span class="icon">🆕</span>
        <span class="text">注册</span>
      </router-link>
      <router-link to="/system/account" class="entry-item">
        <span class="icon">👤</span>
        <span class="text">切换账号</span>
      </router-link>
      <button class="entry-item" @click="handleLogout">
        <span class="icon">🚪</span>
        <span class="text">登出</span>
      </button>
    </div>

    <div class="tips">
      <p>说明：此页面提供用户账户相关的操作入口。</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isLoggedIn = ref(false)
const currentUser = ref('')

onMounted(() => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token')
  isLoggedIn.value = !!token
  currentUser.value = localStorage.getItem('username') || sessionStorage.getItem('username') || ''
})

const handleLogout = () => {
  // 统一登出清理
  localStorage.removeItem('token')
  localStorage.removeItem('username')
  sessionStorage.removeItem('token')
  sessionStorage.removeItem('username')
  alert('您已成功登出！')
  router.push('/system/login')
}
</script>

<style scoped>
.user-account-management { max-width: 1000px; margin: 0 auto; }
.page-header { margin-bottom: 16px; }
.entry-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; }
.entry-item { display: flex; align-items: center; gap: 10px; padding: 12px 14px; background: var(--bg-white); border: 1px solid var(--border-light); border-radius: 10px; text-decoration: none; color: var(--text-primary); box-shadow: var(--shadow-sm); }
.entry-item:hover { box-shadow: var(--shadow-md); transform: translateY(-1px); }
.icon { width: 32px; height: 32px; display: inline-flex; align-items: center; justify-content: center; border-radius: 8px; background: var(--secondary-light); }
.text { font-size: 14px; }
.tips { margin-top: 16px; color: var(--text-secondary); }
</style>