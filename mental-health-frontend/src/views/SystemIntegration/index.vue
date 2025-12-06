<template>
  <div class="module-system">
    <div class="module-header">
      <h2 class="module-title">系统集成 + 界面引导智能助手</h2>
      <p class="module-desc">成员E开发：全栈，负责框架整合与智能助手组件</p>
    </div>

    <div class="function-list">
      <div
        class="function-item"
        @click="$router.push('/system/assistant')"
      >
        <div class="function-icon">🤖</div>
        <div class="function-content">
          <h3 class="function-title">界面引导智能助手</h3>
          <p class="function-desc">成员E开发：实现智能助手交互逻辑</p>
        </div>
        <span class="function-arrow">›</span>
      </div>

      <div class="function-item">
        <div class="function-icon">🔗</div>
        <div class="function-content">
          <h3 class="function-title">系统集成管理</h3>
          <p class="function-desc">成员E开发：负责框架整合与模块协调</p>
        </div>
      </div>
    </div>

    <div class="dev-tips">
      <h4>开发提示</h4>
      <ul>
        <li>本模块路由前缀：/system</li>
        <li>组件命名规范：Syst-xxx.vue（如 Syst-Assistant.vue）</li>
        <li>API接口文件：api/system.js</li>
        <li>样式文件：system-styles.css（模块内样式隔离）</li>
        <li>智能助手按钮位置：components/common/BaseAssistantButton.vue</li>
        <li>负责全局框架整合与各模块协调</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
// 成员E：系统集成 + 界面引导智能助手模块首页
</script>

<style scoped>
.module-system {
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
  background: #f0f0f0;
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
  background: #f0f0f0;
  border-radius: var(--border-radius-lg);
  padding: 20px;
  border-left: 4px solid #595959;
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
  color: #595959;
}
</style>

