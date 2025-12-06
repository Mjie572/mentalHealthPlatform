<template>
  <div class="assistant-button" @click="handleClick">
    <span class="assistant-icon">🤖</span>
    <span class="assistant-text">智能助手</span>
  </div>
</template>

<script setup>
// 成员E开发：界面引导智能助手
// 点击悬浮球唤醒全局助手浮框
const handleClick = () => {
  const event = new CustomEvent('assistant:open', { detail: { source: 'floating-button' } })
  window.dispatchEvent(event)
}
</script>

<style scoped>
.assistant-button {
  position: fixed;
  bottom: 80px;
  right: 24px;
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  transition: all 0.3s;
  z-index: 99;
}

.assistant-button:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.assistant-icon {
  font-size: 36px;
}

.assistant-text {
  font-size: 14px;
  color: #fff;
  font-weight: 500;
}

@media (max-width: 768px) {
  .assistant-button {
    width: 80px;
    height: 80px;
    bottom: 70px;
    right: 16px;
  }
  
  .assistant-icon {
    font-size: 28px;
  }
  
  .assistant-text {
    font-size: 12px;
  }
}
</style>

