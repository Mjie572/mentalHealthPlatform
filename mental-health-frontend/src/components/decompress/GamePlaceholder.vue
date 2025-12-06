<template>
  <div class="game-placeholder">
    <div class="placeholder-icon">🎮</div>
    <h3 class="placeholder-title">小游戏占位组件</h3>
    <p class="placeholder-desc">在此组件中实现小游戏交互逻辑</p>
    <div class="placeholder-note">
      <p>组件位置：components/decompress/GamePlaceholder.vue</p>
      <p>命名规范：Decom-xxx.vue</p>
    </div>
  </div>
</template>

<script setup>
// 小游戏占位组件
// 当前仅保留基础结构与注释，无具体业务逻辑
// TODO: 实现小游戏交互功能
</script>

<style scoped>
.game-placeholder {
  text-align: center;
  padding: 40px;
}

.placeholder-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.placeholder-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.placeholder-desc {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 24px;
}

.placeholder-note {
  background: var(--bg-hover);
  border-radius: var(--border-radius-md);
  padding: 16px;
  text-align: left;
}

.placeholder-note p {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 4px;
}
</style>

