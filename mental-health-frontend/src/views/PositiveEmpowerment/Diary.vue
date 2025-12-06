<template>
  <div class="positive-diary">
    <div class="page-header">
      <h2>感恩日记</h2>
      <p>成员C开发：对接日记组件</p>
    </div>
    <div class="placeholder-content">
      <PosiDiaryPlaceholder />
    </div>
  </div>
</template>

<script setup>
import PosiDiaryPlaceholder from '@/components/positive/DiaryPlaceholder.vue'
</script>

<style scoped>
.positive-diary {
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

