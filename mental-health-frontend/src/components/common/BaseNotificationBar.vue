<template>
  <div v-if="notifications.length > 0" class="notification-bar">
    <div
      v-for="(notification, index) in notifications"
      :key="index"
      class="notification-item"
      :class="notification.type"
    >
      <span class="notification-icon">{{ getIcon(notification.type) }}</span>
      <span class="notification-message">{{ notification.message }}</span>
      <button class="notification-close" @click="removeNotification(index)">×</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const notifications = ref([
  // 示例通知，实际使用时由各模块调用
  // { type: 'warning', message: '检测到情绪波动，建议进行放松练习' }
])

const getIcon = (type) => {
  const icons = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌'
  }
  return icons[type] || icons.info
}

const removeNotification = (index) => {
  notifications.value.splice(index, 1)
}

// 暴露方法供外部调用
defineExpose({
  addNotification: (notification) => {
    notifications.value.push(notification)
  },
  removeNotification,
  clearAll: () => {
    notifications.value = []
  }
})
</script>

<style scoped>
.notification-bar {
  position: fixed;
  top: 60px;
  left: 240px;
  right: 0;
  z-index: 99;
  padding: 12px 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.notification-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  animation: slideIn 0.3s ease-out;
}

.notification-item.info {
  border-left: 4px solid #1890ff;
}

.notification-item.success {
  border-left: 4px solid #52c41a;
}

.notification-item.warning {
  border-left: 4px solid #faad14;
}

.notification-item.error {
  border-left: 4px solid #ff4d4f;
}

.notification-icon {
  font-size: 18px;
}

.notification-message {
  flex: 1;
  font-size: 14px;
  color: var(--text-primary);
}

.notification-close {
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 20px;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.3s;
}

.notification-close:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

@keyframes slideIn {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .notification-bar {
    left: 0;
  }
}
</style>

