<template>
  <div class="main-layout">
    <!-- 顶部导航栏 -->
    <header class="top-navbar">
      <div class="navbar-left">
        <div class="logo">
          <span class="logo-icon">💚</span>
          <span class="logo-text">心灵花园</span>
          <span class="logo-subtitle">Mind Garden</span>
        </div>
      </div>
      <div class="navbar-right">
        <div class="date-info">{{ currentDate }}</div>
        <div class="navbar-actions">
          <button class="icon-btn" @click="showNotifications">
            <span>🔔</span>
          </button>
          <button class="icon-btn" @click="showSettings">
            <span>⚙️</span>
          </button>
        </div>
      </div>
    </header>

    <div class="layout-content">
      <!-- 侧边菜单 -->
      <aside class="sidebar">
        <nav class="sidebar-nav">
          <router-link
            v-for="item in sidebarMenu"
            :key="item.path"
            :to="item.path"
            class="nav-item"
            :class="{ active: $route.path.startsWith(item.path) }"
          >
            <span class="nav-icon">{{ item.icon }}</span>
            <span class="nav-text">{{ item.label }}</span>
          </router-link>
        </nav>
        <div class="user-profile">
          <div class="profile-avatar">🍃</div>
          <div class="profile-info">
            <div class="profile-name">心灵旅行者</div>
            <div class="profile-level">等级 5</div>
          </div>
          <span class="profile-arrow">›</span>
        </div>
      </aside>

      <!-- 主内容区 -->
      <main class="main-content">
        <BaseNotificationBar />
        <router-view />
      </main>
    </div>

    <!-- 底部功能栏 -->
    <footer class="bottom-navbar">
      <div
        v-for="item in bottomMenu"
        :key="item.path"
        class="bottom-nav-item"
        :class="{ active: $route.path.startsWith(item.path) }"
        @click="navigateTo(item.path)"
      >
        <span class="bottom-nav-icon">{{ item.icon }}</span>
        <span class="bottom-nav-text">{{ item.label }}</span>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import BaseNotificationBar from '@/components/common/BaseNotificationBar.vue'

const router = useRouter()

const currentDate = computed(() => {
  const date = new Date()
  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const weekday = weekdays[date.getDay()]
  return `${year}年${month}月${day}日 ${weekday}`
})

const sidebarMenu = [
  { path: '/dashboard', label: '首页', icon: '🏠' },
  { path: '/emotion', label: '情绪监控', icon: '💚' },
  { path: '/decompress', label: '解压服务', icon: '⚡' },
  { path: '/positive', label: '情绪赋能', icon: '📅' },
  { path: '/personalized', label: '个性化方案', icon: '📊' },
  { path: '/system', label: '群组管理', icon: '👥' },
  { path: '/personalized/report', label: '数据报告', icon: '📈' }
]

const bottomMenu = [
  { path: '/emotion', label: '情绪监控', icon: '💚' },
  { path: '/decompress', label: '解压服务', icon: '⚡' },
  { path: '/positive', label: '积极赋能', icon: '📅' },
  { path: '/personalized', label: '个性方案', icon: '📊' },
  { path: '/system', label: '我的', icon: '👤' }
]

const navigateTo = (path) => {
  router.push(path)
}

const showNotifications = () => {
  // 预留：显示通知
  console.log('显示通知')
}

const showSettings = () => {
  // 预留：显示设置
  console.log('显示设置')
}
</script>

<style scoped>
.main-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--bg-color);
}

.top-navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  padding: 0 24px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  z-index: 100;
}

.navbar-left {
  display: flex;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-icon {
  font-size: 24px;
}

.logo-text {
  font-size: 20px;
  font-weight: 600;
  color: var(--primary-color);
}

.logo-subtitle {
  font-size: 12px;
  color: var(--text-secondary);
  margin-left: 4px;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.date-info {
  color: var(--text-primary);
  font-size: 14px;
}

.navbar-actions {
  display: flex;
  gap: 12px;
}

.icon-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: background 0.3s;
}

.icon-btn:hover {
  background: var(--bg-hover);
}

.layout-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sidebar {
  width: 240px;
  background: #fff;
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.sidebar-nav {
  flex: 1;
  padding: 16px 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 24px;
  color: var(--text-primary);
  text-decoration: none;
  transition: all 0.3s;
  cursor: pointer;
}

.nav-item:hover {
  background: var(--bg-hover);
}

.nav-item.active {
  background: var(--primary-light);
  color: var(--primary-color);
  font-weight: 500;
}

.nav-icon {
  font-size: 20px;
}

.nav-text {
  font-size: 14px;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid var(--border-color);
  cursor: pointer;
  transition: background 0.3s;
}

.user-profile:hover {
  background: var(--bg-hover);
}

.profile-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.profile-info {
  flex: 1;
}

.profile-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.profile-level {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 2px;
}

.profile-arrow {
  font-size: 20px;
  color: var(--text-secondary);
}

.main-content {
  flex: 1;
  overflow-y: auto;
  background: var(--bg-color);
  padding: 24px;
}

.bottom-navbar {
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 60px;
  background: #fff;
  border-top: 1px solid var(--border-color);
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.06);
  z-index: 100;
}

.bottom-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  flex: 1;
  padding: 8px;
  cursor: pointer;
  transition: all 0.3s;
  color: var(--text-secondary);
}

.bottom-nav-item:hover {
  background: var(--bg-hover);
}

.bottom-nav-item.active {
  color: var(--primary-color);
}

.bottom-nav-icon {
  font-size: 20px;
}

.bottom-nav-text {
  font-size: 12px;
}

@media (max-width: 768px) {
  .sidebar {
    display: none;
  }
  
  .main-content {
    padding: 16px;
  }
}
</style>

