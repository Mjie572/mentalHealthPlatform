<template>
  <div class="module-personalized">
    <div class="module-header">
      <h2 class="module-title">个性化心理方案与数据</h2>
      <p class="module-desc">成员D开发：后端 + 数据可视化，需报告展示页面</p>
    </div>

    <div class="function-list">
      <div
        class="function-item"
        @click="$router.push('/personalized/plan')"
      >
        <div class="function-icon">📋</div>
        <div class="function-content">
          <h3 class="function-title">个性化方案</h3>
          <p class="function-desc">成员D开发：对接个性化方案功能</p>
        </div>
        <span class="function-arrow">›</span>
      </div>

      <div
        class="function-item"
        @click="$router.push('/personalized/report')"
      >
        <div class="function-icon">📊</div>
        <div class="function-content">
          <h3 class="function-title">数据报告</h3>
          <p class="function-desc">成员D开发：对接数据可视化与报告展示</p>
        </div>
        <span class="function-arrow">›</span>
      </div>
    </div>

    <div class="dev-tips">
      <h4>开发提示</h4>
      <ul>
        <li>本模块路由前缀：/personalized</li>
        <li>组件命名规范：Pers-xxx.vue（如 Pers-Report.vue）</li>
        <li>API接口文件：api/personalized.js</li>
        <li>样式文件：personalized-styles.css（模块内样式隔离）</li>
        <li>数据可视化建议使用 ECharts 或 Chart.js</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
// 成员D：个性化心理方案与数据模块首页
</script>

<style scoped>
.module-personalized {
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
  background: #e6f7ff;
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
  background: #e6f7ff;
  border-radius: var(--border-radius-lg);
  padding: 20px;
  border-left: 4px solid var(--info-color);
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
  color: var(--info-color);
}
</style>

