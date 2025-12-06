<template>
  <div id="app">
    <router-view />
    <!-- 智能助手悬浮按钮（成员E开发） -->
    <BaseAssistantButton />
  </div>
</template>

<script setup>
import BaseAssistantButton from '@/components/common/BaseAssistantButton.vue'
</script>

<style scoped>
#app {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}
</style>

