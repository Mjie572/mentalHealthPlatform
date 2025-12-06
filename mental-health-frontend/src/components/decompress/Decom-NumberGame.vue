<template>
  <div class="decom-number-game">
    <div class="game-header">
      <h3>数字消消乐</h3>
      <p class="game-desc">点击相同数字消除，清空所有数字即可获胜</p>
    </div>
    
    <div class="game-info">
      <div class="info-item">
        <span>得分：</span>
        <strong>{{ score }}</strong>
      </div>
      <div class="info-item">
        <span>剩余：</span>
        <strong>{{ remainingCount }}</strong>
      </div>
      <div class="info-item">
        <span>时间：</span>
        <strong>{{ formatTime(gameTime) }}</strong>
      </div>
    </div>
    
    <div class="game-board" :class="{ 'game-over': isGameOver, 'game-win': isGameWin }">
      <div
        v-for="(cell, index) in gameBoard"
        :key="index"
        class="game-cell"
        :class="{ 'selected': selectedCells.includes(index), 'matched': matchedCells.includes(index) }"
        @click="handleCellClick(index)"
      >
        {{ cell }}
      </div>
    </div>
    
    <div class="game-controls">
      <button @click="startNewGame" class="btn-new-game">新游戏</button>
      <button v-if="isPlaying" @click="pauseGame" class="btn-pause">暂停</button>
      <button v-if="isPaused" @click="resumeGame" class="btn-resume">继续</button>
    </div>
    
    <div v-if="isGameWin" class="game-result win">
      <h3>🎉 恭喜完成！</h3>
      <p>得分：{{ score }}</p>
      <p>用时：{{ formatTime(gameTime) }}</p>
    </div>
    
    <div v-if="isGameOver" class="game-result over">
      <h3>游戏结束</h3>
      <p>最终得分：{{ score }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { completeGame } from '@/api/decompress'
import { useGlobalState } from '@/store'
import { updatePoints } from '@/api/decompress'

const globalState = useGlobalState()
const currentUserId = computed(() => globalState.currentUserId)

// 游戏配置
const BOARD_SIZE = 6
const GAME_TIME_LIMIT = 300 // 5分钟

// 游戏状态
const gameBoard = ref([])
const selectedCells = ref([])
const matchedCells = ref([])
const score = ref(0)
const remainingCount = ref(0)
const gameTime = ref(0)
const isPlaying = ref(false)
const isPaused = ref(false)
const isGameOver = ref(false)
const isGameWin = ref(false)

let gameTimer = null

// 初始化游戏（组件挂载时自动初始化）
const initGame = () => {
  // 生成数字数组（1-9，每个数字出现4次）
  const numbers = []
  for (let i = 1; i <= 9; i++) {
    for (let j = 0; j < 4; j++) {
      numbers.push(i)
    }
  }
  
  // 打乱数组
  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]]
  }
  
  // 填充游戏板（6x6 = 36个格子，但只有36个数字，所以填满）
  gameBoard.value = numbers.slice(0, BOARD_SIZE * BOARD_SIZE)
  selectedCells.value = []
  matchedCells.value = []
  score.value = 0
  remainingCount.value = gameBoard.value.length
  gameTime.value = 0
  isGameOver.value = false
  isGameWin.value = false
}

// 处理单元格点击
const handleCellClick = (index) => {
  if (!isPlaying.value || isPaused.value || isGameOver.value || isGameWin.value) return
  if (matchedCells.value.includes(index)) return // 已匹配的不能点击
  
  if (selectedCells.value.includes(index)) {
    // 取消选择
    selectedCells.value = selectedCells.value.filter(i => i !== index)
  } else if (selectedCells.value.length < 2) {
    // 选择单元格
    selectedCells.value.push(index)
    
    // 如果选择了两个相同的数字，消除它们
    if (selectedCells.value.length === 2) {
      const [idx1, idx2] = selectedCells.value
      if (gameBoard.value[idx1] === gameBoard.value[idx2]) {
        // 匹配成功
        matchedCells.value.push(idx1, idx2)
        score.value += 10
        remainingCount.value -= 2
        selectedCells.value = []
        
        // 检查是否获胜
        if (remainingCount.value === 0) {
          winGame()
        }
      } else {
        // 匹配失败，延迟后清除选择
        setTimeout(() => {
          selectedCells.value = []
        }, 500)
      }
    }
  }
}

// 获胜
const winGame = async () => {
  isPlaying.value = false
  isGameWin.value = true
  if (gameTimer) {
    clearInterval(gameTimer)
    gameTimer = null
  }
  
  // 记录游戏完成
  try {
    await completeGame({
      userId: currentUserId.value,
      gameType: 'number',
      score: score.value,
      duration: gameTime.value,
      result: 'win'
    })
    
    // 奖励积分（完成游戏奖励10积分，根据得分额外奖励）
    const bonusPoints = Math.floor(score.value / 10)
    await updatePoints({
      userId: currentUserId.value,
      points: 10 + bonusPoints,
      source: 'game_number',
      description: `完成数字消消乐，得分${score.value}`
    })
  } catch (error) {
    console.error('游戏完成记录失败:', error)
  }
}

// 开始新游戏
const startNewGame = () => {
  initGame()
  isPlaying.value = true
  isPaused.value = false
  isGameOver.value = false
  isGameWin.value = false
  
  // 开始计时
  gameTimer = setInterval(() => {
    gameTime.value++
    if (gameTime.value >= GAME_TIME_LIMIT) {
      gameOver()
    }
  }, 1000)
}

// 暂停游戏
const pauseGame = () => {
  isPaused.value = true
  if (gameTimer) {
    clearInterval(gameTimer)
    gameTimer = null
  }
}

// 继续游戏
const resumeGame = () => {
  isPaused.value = false
  gameTimer = setInterval(() => {
    gameTime.value++
    if (gameTime.value >= GAME_TIME_LIMIT) {
      gameOver()
    }
  }, 1000)
}

// 游戏结束
const gameOver = () => {
  isPlaying.value = false
  isGameOver.value = true
  if (gameTimer) {
    clearInterval(gameTimer)
    gameTimer = null
  }
}

// 格式化时间
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

// 组件挂载时初始化游戏
onMounted(() => {
  initGame()
})

onUnmounted(() => {
  if (gameTimer) {
    clearInterval(gameTimer)
  }
})
</script>

<style scoped>
.decom-number-game {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}

.game-header h3 {
  font-size: 24px;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.game-desc {
  color: var(--text-secondary);
  margin-bottom: 24px;
}

.game-info {
  display: flex;
  justify-content: space-around;
  margin-bottom: 24px;
  padding: 16px;
  background: var(--bg-hover);
  border-radius: var(--border-radius-md);
}

.info-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.info-item span {
  font-size: 14px;
  color: var(--text-secondary);
}

.info-item strong {
  font-size: 20px;
  color: var(--primary-color);
}

.game-board {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
  margin-bottom: 24px;
  padding: 16px;
  background: var(--bg-white);
  border-radius: var(--border-radius-lg);
}

.game-cell {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-light);
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius-md);
  font-size: 20px;
  font-weight: bold;
  color: var(--text-primary);
  cursor: pointer;
  transition: all var(--transition-base);
}

.game-cell:hover:not(.matched) {
  background: var(--primary-color);
  color: white;
  transform: scale(1.05);
}

.game-cell.selected {
  background: var(--secondary-color);
  color: white;
  border-color: var(--secondary-color);
}

.game-cell.matched {
  background: var(--text-disabled);
  color: var(--text-disabled);
  cursor: not-allowed;
  opacity: 0.5;
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
  transition: all var(--transition-base);
}

.btn-new-game {
  background: var(--primary-color);
  color: white;
}

.btn-pause, .btn-resume {
  background: var(--warning-color);
  color: white;
}

.game-result {
  text-align: center;
  padding: 24px;
  border-radius: var(--border-radius-lg);
  margin-top: 24px;
}

.game-result.win {
  background: var(--success-color);
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
  margin: 4px 0;
}
</style>

