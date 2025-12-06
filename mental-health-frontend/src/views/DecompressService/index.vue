<template>
  <div class="module-decompress">
    <div class="module-header">
      <h2 class="module-title">多维解压服务</h2>
      <p class="module-desc">通过小游戏、心理测试等方式，帮助您缓解压力，保持心理健康</p>
    </div>

    <div class="function-list">
      <router-link
        to="/decompress/games"
        class="function-item"
      >
        <div class="function-icon">🎮</div>
        <div class="function-content">
          <h3 class="function-title">解压小游戏</h3>
          <p class="function-desc">通过轻松的小游戏缓解压力，放松心情</p>
        </div>
        <span class="function-arrow">›</span>
      </router-link>

      <router-link
        to="/decompress/questionnaire"
        class="function-item"
      >
        <div class="function-icon">📋</div>
        <div class="function-content">
          <h3 class="function-title">心理健康自测</h3>
          <p class="function-desc">通过专业心理测试，了解自己的心理状态</p>
        </div>
        <span class="function-arrow">›</span>
      </router-link>

      <router-link
        to="/decompress/advisor"
        class="function-item"
      >
        <div class="function-icon">🤖</div>
        <div class="function-content">
          <h3 class="function-title">心理顾问</h3>
          <p class="function-desc">AI智能心理顾问咨询</p>
        </div>
        <span class="function-arrow">›</span>
      </router-link>

      <router-link
        to="/decompress/checkin"
        class="function-item"
      >
        <div class="function-icon">📅</div>
        <div class="function-content">
          <h3 class="function-title">活动打卡</h3>
          <p class="function-desc">每日打卡，积累积分</p>
        </div>
        <span class="function-arrow">›</span>
      </router-link>
    </div>

    <div class="dev-tips">
      <h4>开发提示</h4>
      <ul>
        <li>本模块路由前缀：/decompress</li>
        <li>组件命名规范：Decom-xxx.vue（如 Decom-GamePlaceholder.vue）</li>
        <li>API接口文件：api/decompress.js</li>
        <li>样式文件：decompress-styles.css（模块内样式隔离）</li>
        <li>占位组件位置：components/decompress/GamePlaceholder.vue</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 确保路由正常工作
onMounted(() => {
  console.log('多维解压服务页面已加载')
  console.log('可用路由:', [
    '/decompress/games',
    '/decompress/questionnaire',
    '/decompress/advisor',
    '/decompress/checkin'
  ])
})
</script>

<style scoped>
.module-decompress {
  max-width: 1200px;
  margin: 0 auto;
}

.module-header {
  margin-bottom: 32px;
}

.module-title {
  font-size: 28px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.module-desc {
  font-size: 14px;
  color: var(--text-secondary);
}

.function-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 32px;
}

.function-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #fff;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: all 0.3s ease;
  user-select: none;
  -webkit-user-select: none;
  text-decoration: none;
  color: inherit;
  position: relative;
  z-index: 100;
  pointer-events: auto !important;
  width: 100%;
}

.function-item * {
  pointer-events: none;
}

.function-item:hover {
  box-shadow: var(--shadow-md);
  transform: translateX(4px);
  background: #fafafa;
}

.function-item:active {
  transform: translateX(2px);
  box-shadow: var(--shadow-sm);
  background: #f5f5f5;
}

.function-icon {
  font-size: 36px;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--secondary-light);
  border-radius: var(--border-radius-md);
}

.function-content {
  flex: 1;
}

.function-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.function-desc {
  font-size: 14px;
  color: var(--text-secondary);
}

.function-arrow {
  font-size: 24px;
  color: var(--text-secondary);
}

.dev-tips {
  background: var(--secondary-light);
  border-radius: var(--border-radius-lg);
  padding: 20px;
  border-left: 4px solid var(--secondary-color);
}

.dev-tips h4 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.dev-tips ul {
  list-style: none;
  padding: 0;
}

.dev-tips li {
  font-size: 14px;
  color: var(--text-secondary);
  padding: 6px 0;
  padding-left: 20px;
  position: relative;
}

.dev-tips li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: var(--secondary-color);
}
</style>

