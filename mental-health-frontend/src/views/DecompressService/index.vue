<template>
  <div class="module-decompress">
    <div class="module-header">
      <h2 class="module-title">多维解压服务</h2>
      <p class="module-desc">成员B开发：前端 + Dify 为主，含小游戏、题库页面</p>
    </div>

    <div class="function-list">
      <div
        class="function-item"
        @click="$router.push('/decompress/games')"
      >
        <div class="function-icon">🎮</div>
        <div class="function-content">
          <h3 class="function-title">解压小游戏</h3>
          <p class="function-desc">成员B开发：对接小游戏功能</p>
        </div>
        <span class="function-arrow">›</span>
      </div>

      <div
        class="function-item"
        @click="$router.push('/decompress/questionnaire')"
      >
        <div class="function-icon">📋</div>
        <div class="function-content">
          <h3 class="function-title">解压题库</h3>
          <p class="function-desc">成员B开发：对接题库页面</p>
        </div>
        <span class="function-arrow">›</span>
      </div>
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
// 成员B：多维解压服务模块首页
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

