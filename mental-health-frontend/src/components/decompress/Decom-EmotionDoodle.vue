<template>
  <div class="emotion-doodle">
    <div class="doodle-header">
      <h3>情绪涂鸦板</h3>
      <p class="doodle-subtitle">不用在意画得如何，随意涂画释放情绪吧</p>
    </div>
    
    <!-- 工具栏 -->
    <div class="toolbar">
      <!-- 颜色选择器 -->
      <div class="tool-group">
        <label class="tool-label">颜色</label>
        <div class="color-picker">
          <button
            v-for="color in colors"
            :key="color.value"
            :class="['color-btn', { active: currentColor === color.value }]"
            :style="{ backgroundColor: color.value }"
            :title="color.name"
            @click="selectColor(color.value)"
          ></button>
        </div>
      </div>
      
      <!-- 画笔粗细 -->
      <div class="tool-group">
        <label class="tool-label">粗细</label>
        <div class="brush-size">
          <input
            type="range"
            v-model="brushSize"
            min="2"
            max="30"
            class="brush-slider"
          />
          <span class="brush-size-display">{{ brushSize }}px</span>
        </div>
      </div>
      
      <!-- 清空按钮 -->
      <div class="tool-group">
        <button
          @click="clearCanvas"
          class="btn-clear"
          type="button"
        >
          🗑️ 一键清空画布
        </button>
      </div>
    </div>
    
    <!-- 画布区域 -->
    <div class="canvas-container">
      <canvas
        ref="canvasRef"
        @mousedown="startDrawing"
        @mousemove="draw"
        @mouseup="stopDrawing"
        @mouseleave="stopDrawing"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="stopDrawing"
      ></canvas>
    </div>
    
    <!-- 操作按钮 -->
    <div class="action-buttons">
      <button
        @click="saveDoodle"
        class="btn-save"
        type="button"
        :disabled="!hasDrawing"
      >
        💾 保存当前作品
      </button>
      <button
        @click="resetDoodle"
        class="btn-reset"
        type="button"
      >
        🎨 重新创作
      </button>
    </div>
    
    <!-- 保存提示 -->
    <div v-if="saveMessage" class="save-message" :class="{ success: saveSuccess }">
      {{ saveMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { completeGame } from '@/api/decompress'
import { useGlobalState } from '@/store'

const globalState = useGlobalState()
const currentUserId = computed(() => globalState.currentUserId)

const canvasRef = ref(null)
const currentColor = ref('#FFB6C1') // 默认柔和粉色
const brushSize = ref(8) // 默认画笔粗细
const isDrawing = ref(false)
const hasDrawing = ref(false) // 是否有绘画内容
const saveMessage = ref('')
const saveSuccess = ref(false)

// 柔和色系颜色配置
const colors = [
  { name: '柔和粉', value: '#FFB6C1' },
  { name: '淡紫色', value: '#DDA0DD' },
  { name: '浅蓝色', value: '#87CEEB' },
  { name: '薄荷绿', value: '#98FB98' },
  { name: '淡黄色', value: '#FFFACD' },
  { name: '浅橙色', value: '#FFE4B5' },
  { name: '淡红色', value: '#FFC0CB' },
  { name: '浅灰色', value: '#D3D3D3' },
  { name: '淡绿色', value: '#90EE90' },
  { name: '天蓝色', value: '#B0E0E6' }
]

let ctx = null
let lastX = 0
let lastY = 0

// 初始化画布
const initCanvas = () => {
  if (!canvasRef.value) return
  
  const canvas = canvasRef.value
  ctx = canvas.getContext('2d')
  
  // 设置画布尺寸（响应式）
  const container = canvas.parentElement
  const containerWidth = container.clientWidth
  const containerHeight = Math.max(400, window.innerHeight * 0.5)
  
  canvas.width = containerWidth
  canvas.height = containerHeight
  
  // 设置画布背景为白色
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  
  // 设置画笔样式
  ctx.strokeStyle = currentColor.value
  ctx.lineWidth = brushSize.value
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  
  // 尝试从本地存储恢复
  loadFromLocalStorage()
}

// 选择颜色
const selectColor = (color) => {
  currentColor.value = color
  if (ctx) {
    ctx.strokeStyle = color
  }
}

// 开始绘画
const startDrawing = (e) => {
  isDrawing.value = true
  const rect = canvasRef.value.getBoundingClientRect()
  lastX = e.clientX - rect.left
  lastY = e.clientY - rect.top
}

// 绘画中
const draw = (e) => {
  if (!isDrawing.value || !ctx) return
  
  const rect = canvasRef.value.getBoundingClientRect()
  const currentX = e.clientX - rect.left
  const currentY = e.clientY - rect.top
  
  ctx.beginPath()
  ctx.moveTo(lastX, lastY)
  ctx.lineTo(currentX, currentY)
  ctx.stroke()
  
  lastX = currentX
  lastY = currentY
  hasDrawing.value = true
}

// 停止绘画
const stopDrawing = () => {
  if (isDrawing.value) {
    isDrawing.value = false
    // 自动保存到本地存储
    saveToLocalStorage()
  }
}

// 触摸事件处理（移动端支持）
const handleTouchStart = (e) => {
  e.preventDefault()
  const touch = e.touches[0]
  const mouseEvent = new MouseEvent('mousedown', {
    clientX: touch.clientX,
    clientY: touch.clientY
  })
  canvasRef.value.dispatchEvent(mouseEvent)
}

const handleTouchMove = (e) => {
  e.preventDefault()
  const touch = e.touches[0]
  const mouseEvent = new MouseEvent('mousemove', {
    clientX: touch.clientX,
    clientY: touch.clientY
  })
  canvasRef.value.dispatchEvent(mouseEvent)
}

// 清空画布
const clearCanvas = () => {
  if (!ctx || !canvasRef.value) return
  
  if (confirm('确定要清空画布吗？')) {
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, canvasRef.value.width, canvasRef.value.height)
    hasDrawing.value = false
    saveToLocalStorage()
  }
}

// 保存作品到本地存储
const saveDoodle = () => {
  if (!canvasRef.value || !hasDrawing.value) {
    saveMessage.value = '请先进行涂鸦创作'
    saveSuccess.value = false
    setTimeout(() => {
      saveMessage.value = ''
    }, 2000)
    return
  }
  
  try {
    const dataURL = canvasRef.value.toDataURL('image/png')
    const timestamp = new Date().toISOString()
    const key = `doodle_${currentUserId.value || 'guest'}_${timestamp}`
    
    localStorage.setItem(key, dataURL)
    
    // 保存作品列表（最多保存10个）
    const doodleList = JSON.parse(localStorage.getItem('doodle_list') || '[]')
    doodleList.unshift({
      key,
      timestamp,
      preview: dataURL.substring(0, 100) // 预览数据
    })
    
    // 只保留最近10个
    if (doodleList.length > 10) {
      const removed = doodleList.splice(10)
      removed.forEach(item => {
        localStorage.removeItem(item.key)
      })
    }
    
    localStorage.setItem('doodle_list', JSON.stringify(doodleList))
    
    saveMessage.value = '作品已保存到本地'
    saveSuccess.value = true
    
    // 提交游戏完成记录
    if (currentUserId.value) {
      completeGame({
        userId: currentUserId.value,
        gameType: 'emotion_doodle',
        score: 10, // 完成涂鸦获得10积分
        duration: 0
      }).catch(err => {
        console.error('提交游戏记录失败:', err)
      })
    }
    
    setTimeout(() => {
      saveMessage.value = ''
    }, 3000)
  } catch (error) {
    console.error('保存作品失败:', error)
    saveMessage.value = '保存失败，请重试'
    saveSuccess.value = false
    setTimeout(() => {
      saveMessage.value = ''
    }, 2000)
  }
}

// 重新创作
const resetDoodle = () => {
  if (hasDrawing.value && !confirm('确定要重新创作吗？当前作品将丢失')) {
    return
  }
  
  clearCanvas()
  saveMessage.value = ''
}

// 保存到本地存储（自动保存）
const saveToLocalStorage = () => {
  if (!canvasRef.value) return
  
  try {
    const dataURL = canvasRef.value.toDataURL('image/png')
    const key = `doodle_autosave_${currentUserId.value || 'guest'}`
    localStorage.setItem(key, dataURL)
  } catch (error) {
    console.warn('自动保存失败:', error)
  }
}

// 从本地存储加载（自动恢复）
const loadFromLocalStorage = () => {
  if (!canvasRef.value || !ctx) return
  
  try {
    const key = `doodle_autosave_${currentUserId.value || 'guest'}`
    const dataURL = localStorage.getItem(key)
    
    if (dataURL) {
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0)
        hasDrawing.value = true
      }
      img.src = dataURL
    }
  } catch (error) {
    console.warn('加载自动保存失败:', error)
  }
}

// 监听画笔粗细变化
watch(brushSize, (newSize) => {
  if (ctx) {
    ctx.lineWidth = newSize
  }
})

// 监听颜色变化
watch(currentColor, (newColor) => {
  if (ctx) {
    ctx.strokeStyle = newColor
  }
})

// 监听窗口大小变化
const handleResize = () => {
  if (canvasRef.value) {
    initCanvas()
  }
}

onMounted(() => {
  initCanvas()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  // 保存当前状态
  if (hasDrawing.value) {
    saveToLocalStorage()
  }
})
</script>

<style scoped>
.emotion-doodle {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.doodle-header {
  text-align: center;
  margin-bottom: 24px;
}

.doodle-header h3 {
  font-size: 24px;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.doodle-subtitle {
  font-size: 14px;
  color: var(--text-secondary);
  font-style: italic;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: var(--bg-hover);
  border-radius: var(--border-radius-md);
  margin-bottom: 20px;
}

.tool-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.tool-label {
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 500;
  min-width: 40px;
}

.color-picker {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.color-btn {
  width: 32px;
  height: 32px;
  border: 2px solid transparent;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.color-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.color-btn.active {
  border-color: var(--text-primary);
  transform: scale(1.15);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.brush-size {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 200px;
}

.brush-slider {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: var(--border-color);
  outline: none;
  -webkit-appearance: none;
}

.brush-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--primary-color);
  cursor: pointer;
}

.brush-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--primary-color);
  cursor: pointer;
  border: none;
}

.brush-size-display {
  font-size: 14px;
  color: var(--text-primary);
  min-width: 45px;
  text-align: right;
}

.btn-clear {
  padding: 8px 16px;
  background: #ff4d4f;
  color: white;
  border: none;
  border-radius: var(--border-radius-md);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-clear:hover {
  background: #ff7875;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(255, 77, 79, 0.3);
}

.canvas-container {
  width: 100%;
  background: #f5f5f5;
  border-radius: var(--border-radius-md);
  padding: 16px;
  margin-bottom: 20px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

canvas {
  display: block;
  width: 100%;
  height: 500px;
  background: white;
  border-radius: var(--border-radius-sm);
  cursor: crosshair;
  touch-action: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.action-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-bottom: 16px;
}

.btn-save,
.btn-reset {
  padding: 12px 24px;
  border: none;
  border-radius: var(--border-radius-md);
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-save {
  background: var(--primary-color);
  color: white;
}

.btn-save:hover:not(:disabled) {
  background: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(82, 196, 26, 0.3);
}

.btn-save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-reset {
  background: var(--bg-hover);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-reset:hover {
  background: var(--border-color);
  transform: translateY(-2px);
}

.save-message {
  text-align: center;
  padding: 12px;
  border-radius: var(--border-radius-md);
  font-size: 14px;
  margin-top: 12px;
  animation: fadeIn 0.3s ease;
}

.save-message.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.save-message:not(.success) {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .tool-group {
    justify-content: space-between;
  }
  
  .brush-size {
    min-width: auto;
  }
  
  canvas {
    height: 400px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .btn-save,
  .btn-reset {
    width: 100%;
  }
}
</style>

