<template>
  <div class="module-emotion">
    <div class="module-header">
      <h2 class="module-title">AI情绪监控与预警</h2>
      <p class="module-desc">成员A开发：对接情绪采集接口、情绪数据展示、预警系统</p>
    </div>

    <div class="function-list">
      <div
        class="function-item"
        @click="$router.push('/emotion/collect')"
      >
        <div class="function-icon">📝</div>
        <div class="function-content">
          <h3 class="function-title">情绪采集入口</h3>
          <p class="function-desc">成员A开发：对接情绪采集接口</p>
        </div>
        <span class="function-arrow">›</span>
      </div>

      <div
        class="function-item"
        @click="$router.push('/emotion/archive')"
      >
        <div class="function-icon">📊</div>
        <div class="function-content">
          <h3 class="function-title">情绪档案可视化</h3>
          <p class="function-desc">成员A开发：对接情绪数据展示</p>
        </div>
        <span class="function-arrow">›</span>
      </div>

      <div
        class="function-item"
        @click="$router.push('/emotion/alert')"
      >
        <div class="function-icon">⚠️</div>
        <div class="function-content">
          <h3 class="function-title">预警通知组件</h3>
          <p class="function-desc">成员A开发：对接预警系统</p>
        </div>
        <span class="function-arrow">›</span>
      </div>
    </div>

    <div class="dev-tips">
      <h4>开发提示</h4>
      <ul>
        <li>本模块路由前缀：/emotion</li>
        <li>组件命名规范：Emo-xxx.vue（如 Emo-Collect.vue）</li>
        <li>API接口文件：api/emotion.js</li>
        <li>样式文件：emotion-styles.css（模块内样式隔离）</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
// 成员A：AI情绪监控与预警模块首页
</script>

<style scoped>
.module-emotion {
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
  transition: all var(--transition-base);
}

.function-item:hover {
  box-shadow: var(--shadow-md);
  transform: translateX(4px);
}

.function-icon {
  font-size: 36px;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-light);
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
  background: var(--primary-light);
  border-radius: var(--border-radius-lg);
  padding: 20px;
  border-left: 4px solid var(--primary-color);
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
  color: var(--primary-color);
}
</style>

