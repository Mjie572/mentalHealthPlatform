<template>
  <div class="color-match-game">
    <div class="game-info">
      <div class="info-item">
        <span class="info-label">得分</span>
        <span class="info-value">{{ score }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">时间</span>
        <span class="info-value">{{ formatTime(timeLeft) }}</span>
      </div>
    </div>
    
    <div class="game-instructions">
      <p>点击与中心颜色相同的方块</p>
    </div>
    
    <div class="color-center">
      <div class="center-color" :style="{ backgroundColor: targetColor }"></div>
      <p class="center-label">目标颜色</p>
    </div>
    
    <div class="color-grid">
      <div
        v-for="(color, index) in colorGrid"
        :key="index"
        class="color-cell"
        :style="{ backgroundColor: color }"
        :class="{ correct: color === targetColor, wrong: selectedIndex === index && color !== targetColor }"
        @click="selectColor(index, color)"
      ></div>
    </div>
    
    <div class="game-controls">
      <button @click="startNewGame" class="btn-new-game">新游戏</button>
      <button v-if="!gameStarted" @click="startGame" class="btn-start">开始</button>
      <button v-else-if="!paused" @click="pauseGame" class="btn-pause">暂停</button>
      <button v-else @click="resumeGame" class="btn-resume">继续</button>
    </div>
    
    <div v-if="gameOver" class="game-result" :class="gameResultClass">
      <h3>{{ gameResultTitle }}</h3>
      <p>最终得分：{{ score }}</p>
      <button @click="startNewGame" class="btn-restart">再来一局</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { completeGame } from '@/api/decompress'
import { useGlobalState } from '@/store'

const globalState = useGlobalState()
const currentUserId = computed(() => globalState.currentUserId)

const gameStarted = ref(false)
const paused = ref(false)
const gameOver = ref(false)
const score = ref(0)
const timeLeft = ref(60)
const targetColor = ref('')
const colorGrid = ref([])
const selectedIndex = ref(-1)

let timer = null

const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2']

const gameResultClass = computed(() => {
  if (score.value >= 50) return 'win'
  if (score.value >= 30) return 'good'
  return 'over'
})

const gameResultTitle = computed(() => {
  if (score.value >= 50) return '太棒了！'
  if (score.value >= 30) return '不错！'
  return '继续加油！'
})

const generateColorGrid = () => {
  const grid = []
  const correctColor = colors[Math.floor(Math.random() * colors.length)]
  targetColor.value = correctColor
  
  // 生成4x4网格，其中一个是目标颜色
  for (let i = 0; i < 16; i++) {
    if (i === 8) {
      grid.push(correctColor)
    } else {
      grid.push(colors[Math.floor(Math.random() * colors.length)])
    }
  }
  
  // 打乱顺序
  for (let i = grid.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [grid[i], grid[j]] = [grid[j], grid[i]]
  }
  
  colorGrid.value = grid
}

const startGame = () => {
  gameStarted.value = true
  paused.value = false
  gameOver.value = false
  score.value = 0
  timeLeft.value = 60
  generateColorGrid()
  startTimer()
}

const startNewGame = () => {
  startGame()
}

const pauseGame = () => {
  paused.value = true
  clearInterval(timer)
}

const resumeGame = () => {
  paused.value = false
  startTimer()
}

const startTimer = () => {
  timer = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--
    } else {
      endGame()
    }
  }, 1000)
}

const selectColor = (index, color) => {
  if (!gameStarted.value || paused.value || gameOver.value) return
  
  selectedIndex.value = index
  
  if (color === targetColor.value) {
    score.value += 10
    setTimeout(() => {
      generateColorGrid()
      selectedIndex.value = -1
    }, 300)
  } else {
    score.value = Math.max(0, score.value - 5)
    setTimeout(() => {
      selectedIndex.value = -1
    }, 500)
  }
}

const endGame = () => {
  gameOver.value = true
  clearInterval(timer)
  
  // 提交游戏完成记录
  if (currentUserId.value) {
    completeGame({
      userId: currentUserId.value,
      gameType: 'color_match',
      score: score.value,
      duration: 60 - timeLeft.value
    }).catch(err => {
      console.error('提交游戏记录失败:', err)
    })
  }
}

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

onMounted(() => {
  generateColorGrid()
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.color-match-game {
  text-align: center;
}

.game-info {
  display: flex;
  justify-content: center;
  gap: 32px;
  margin-bottom: 24px;
}

.info-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.info-label {
  font-size: 14px;
  color: var(--text-secondary);
}

.info-value {
  font-size: 24px;
  font-weight: bold;
  color: var(--primary-color);
}

.game-instructions {
  margin-bottom: 24px;
  font-size: 16px;
  color: var(--text-primary);
}

.color-center {
  margin-bottom: 32px;
}

.center-color {
  width: 120px;
  height: 120px;
  margin: 0 auto 12px;
  border-radius: 50%;
  border: 4px solid var(--border-color);
  box-shadow: var(--shadow-md);
}

.center-label {
  font-size: 14px;
  color: var(--text-secondary);
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  max-width: 400px;
  margin: 0 auto 24px;
}

.color-cell {
  aspect-ratio: 1;
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 3px solid transparent;
}

.color-cell:hover {
  transform: scale(1.1);
  box-shadow: var(--shadow-md);
}

.color-cell.correct {
  border-color: var(--success-color);
  animation: correctPulse 0.5s;
}

.color-cell.wrong {
  border-color: var(--error-color);
  animation: wrongShake 0.5s;
}

@keyframes correctPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

@keyframes wrongShake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}

.game-controls {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 24px;
}

.game-controls button {
  padding: 12px 24px;
  border: none;
  border-radius: var(--border-radius-md);
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-new-game,
.btn-start {
  background: var(--primary-color);
  color: white;
}

.btn-pause,
.btn-resume {
  background: var(--warning-color);
  color: white;
}

.game-result {
  padding: 24px;
  border-radius: var(--border-radius-lg);
  margin-top: 24px;
}

.game-result.win {
  background: var(--success-color);
  color: white;
}

.game-result.good {
  background: var(--info-color);
  color: white;
}

.game-result.over {
  background: var(--error-color);
  color: white;
}

.game-result h3 {
  font-size: 24px;
  margin-bottom: 12px;
}

.game-result p {
  font-size: 16px;
  margin-bottom: 16px;
}

.btn-restart {
  padding: 10px 20px;
  background: white;
  color: var(--text-primary);
  border: none;
  border-radius: var(--border-radius-md);
  font-size: 14px;
  cursor: pointer;
}
</style>

