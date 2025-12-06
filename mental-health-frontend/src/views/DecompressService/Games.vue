<template>
  <div class="decompress-games">
    <div class="page-header">
      <h2>解压小游戏</h2>
      <p>成员B开发：对接小游戏功能</p>
    </div>
    <div class="placeholder-content">
      <DecomGamePlaceholder />
    </div>
  </div>
</template>

<script setup>
import DecomGamePlaceholder from '@/components/decompress/GamePlaceholder.vue'
</script>

<style scoped>
.decompress-games {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h2 {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.page-header p {
  font-size: 14px;
  color: var(--text-secondary);
}

.placeholder-content {
  background: #fff;
  border-radius: var(--border-radius-lg);
  padding: 60px;
  box-shadow: var(--shadow-sm);
}
</style>

