<template>
  <div
    v-if="visible"
    class="modal-overlay"
    :class="overlayClass"
    :style="overlayStyle"
    @click="handleOverlayClick"
  >
    <div class="modal-container" :style="containerStyle" @click.stop>
      <div class="modal-header" v-if="showHeader">
        <h3 class="modal-title">{{ title }}</h3>
        <button class="modal-close" @click="handleClose">×</button>
      </div>
      <div class="modal-body">
        <slot></slot>
      </div>
      <div v-if="showFooter" class="modal-footer">
        <slot name="footer">
          <button class="btn btn-secondary" @click="handleClose">取消</button>
          <button class="btn btn-primary" @click="handleConfirm">确认</button>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, default: '提示' },
  showFooter: { type: Boolean, default: true },
  showHeader: { type: Boolean, default: true },
  closeOnClickOverlay: { type: Boolean, default: true },
  // 新增：自定义尺寸与定位
  width: { type: String, default: '' }, // e.g. '360px'
  maxWidth: { type: String, default: '' },
  maxHeight: { type: String, default: '' },
  position: { // center | bottom-right | bottom-left | top-right | top-left
    type: String,
    default: 'center'
  },
  overlayTransparent: { type: Boolean, default: false }
})

const emit = defineEmits(['update:visible', 'close', 'confirm'])

const handleClose = () => {
  emit('update:visible', false)
  emit('close')
}

const handleConfirm = () => {
  emit('confirm')
}

const handleOverlayClick = () => {
  if (props.closeOnClickOverlay) {
    handleClose()
  }
}

const overlayClass = computed(() => {
  switch (props.position) {
    case 'bottom-right':
      return 'position-bottom-right'
    case 'bottom-left':
      return 'position-bottom-left'
    case 'top-right':
      return 'position-top-right'
    case 'top-left':
      return 'position-top-left'
    default:
      return 'position-center'
  }
})

const overlayStyle = computed(() => ({
  background: props.overlayTransparent ? 'transparent' : 'rgba(0, 0, 0, 0.5)',
  pointerEvents: props.overlayTransparent && !props.closeOnClickOverlay ? 'none' : 'auto'
}))

const containerStyle = computed(() => ({
  width: props.width || '90%',
  maxWidth: props.maxWidth || '600px',
  maxHeight: props.maxHeight || '80vh'
}))
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  z-index: 10000;
  animation: fadeIn 0.3s;
}

/* 定位变体 */
.position-center { align-items: center; justify-content: center; }
.position-bottom-right { align-items: flex-end; justify-content: flex-end; padding: 12px; }
.position-bottom-left { align-items: flex-end; justify-content: flex-start; padding: 12px; }
.position-top-right { align-items: flex-start; justify-content: flex-end; padding: 12px; }
.position-top-left { align-items: flex-start; justify-content: flex-start; padding: 12px; }

.modal-container {
  background: #fff;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  animation: slideUp 0.3s;
  pointer-events: auto; /* 在透明 overlay 场景下允许交互 */
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
}

.modal-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.modal-close {
  width: 28px;
  height: 28px;
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

.modal-close:hover { background: var(--bg-hover); color: var(--text-primary); }

.modal-body { flex: 1; padding: 12px; overflow-y: auto; }

.modal-footer { display: flex; justify-content: flex-end; gap: 8px; padding: 10px 12px; border-top: 1px solid var(--border-color); }

.btn { padding: 6px 12px; border: none; border-radius: 6px; font-size: 14px; cursor: pointer; transition: all 0.3s; }
.btn-primary { background: var(--primary-color); color: #fff; }
.btn-primary:hover { background: var(--primary-dark); }
.btn-secondary { background: var(--bg-hover); color: var(--text-primary); }
.btn-secondary:hover { background: var(--border-color); }

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { transform: translateY(12px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
</style>

