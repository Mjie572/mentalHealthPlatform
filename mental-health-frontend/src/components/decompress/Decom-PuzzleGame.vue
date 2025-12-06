<template>
  <div class="puzzle-game">
    <div class="game-info">
      <div class="info-item">
        <span class="info-label">步数</span>
        <span class="info-value">{{ moves }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">时间</span>
        <span class="info-value">{{ formatTime(timeElapsed) }}</span>
      </div>
    </div>
    
    <div class="puzzle-container">
      <div class="puzzle-grid" :style="{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }">
        <div
          v-for="(tile, index) in puzzle"
          :key="index"
          class="puzzle-tile"
          :class="{ empty: tile === 0, correct: tile === index + 1 }"
          @click="moveTile(index)"
        >
          <span v-if="tile !== 0">{{ tile }}</span>
        </div>
      </div>
    </div>
    
    <div class="game-controls">
      <button @click="startNewGame" class="btn-new-game">新游戏</button>
      <button v-if="!gameStarted" @click="startGame" class="btn-start">开始</button>
      <button v-else-if="!paused" @click="pauseGame" class="btn-pause">暂停</button>
      <button v-else @click="resumeGame" class="btn-resume">继续</button>
    </div>
    
    <div v-if="gameWon" class="game-result win">
      <h3>🎉 恭喜完成！</h3>
      <p>步数：{{ moves }}</p>
      <p>时间：{{ formatTime(timeElapsed) }}</p>
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

const gridSize = 3
const puzzle = ref([])
const moves = ref(0)
const timeElapsed = ref(0)
const gameStarted = ref(false)
const paused = ref(false)
const gameWon = ref(false)

let timer = null

const initializePuzzle = () => {
  const numbers = Array.from({ length: gridSize * gridSize - 1 }, (_, i) => i + 1)
  numbers.push(0) // 空白格
  puzzle.value = numbers
}

const shufflePuzzle = () => {
  // 简单的随机打乱
  for (let i = 0; i < 100; i++) {
    const emptyIndex = puzzle.value.indexOf(0)
    const neighbors = getNeighbors(emptyIndex)
    if (neighbors.length > 0) {
      const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)]
      swapTiles(emptyIndex, randomNeighbor)
    }
  }
  moves.value = 0
}

const getNeighbors = (index) => {
  const row = Math.floor(index / gridSize)
  const col = index % gridSize
  const neighbors = []
  
  if (row > 0) neighbors.push(index - gridSize) // 上
  if (row < gridSize - 1) neighbors.push(index + gridSize) // 下
  if (col > 0) neighbors.push(index - 1) // 左
  if (col < gridSize - 1) neighbors.push(index + 1) // 右
  
  return neighbors
}

const swapTiles = (index1, index2) => {
  [puzzle.value[index1], puzzle.value[index2]] = [puzzle.value[index2], puzzle.value[index1]]
}

const moveTile = (index) => {
  if (!gameStarted.value || paused.value || gameWon.value) return
  
  const emptyIndex = puzzle.value.indexOf(0)
  const neighbors = getNeighbors(emptyIndex)
  
  if (neighbors.includes(index)) {
    swapTiles(emptyIndex, index)
    moves.value++
    checkWin()
  }
}

const checkWin = () => {
  for (let i = 0; i < puzzle.value.length - 1; i++) {
    if (puzzle.value[i] !== i + 1) {
      return
    }
  }
  gameWon.value = true
  if (timer) clearInterval(timer)
  
  // 提交游戏完成记录
  if (currentUserId.value) {
    completeGame({
      userId: currentUserId.value,
      gameType: 'puzzle',
      score: Math.max(0, 1000 - moves.value * 10 - timeElapsed.value),
      duration: timeElapsed.value
    }).catch(err => {
      console.error('提交游戏记录失败:', err)
    })
  }
}

const startGame = () => {
  gameStarted.value = true
  paused.value = false
  gameWon.value = false
  timeElapsed.value = 0
  moves.value = 0
  shufflePuzzle()
  startTimer()
}

const startNewGame = () => {
  initializePuzzle()
  startGame()
}

const pauseGame = () => {
  paused.value = true
  if (timer) clearInterval(timer)
}

const resumeGame = () => {
  paused.value = false
  startTimer()
}

const startTimer = () => {
  timer = setInterval(() => {
    timeElapsed.value++
  }, 1000)
}

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

onMounted(() => {
  initializePuzzle()
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.puzzle-game {
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

.puzzle-container {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.puzzle-grid {
  display: grid;
  gap: 4px;
  background: var(--border-color);
  padding: 4px;
  border-radius: var(--border-radius-md);
  max-width: 400px;
  width: 100%;
}

.puzzle-tile {
  aspect-ratio: 1;
  background: var(--primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 4px;
}

.puzzle-tile:hover:not(.empty) {
  background: var(--primary-color);
  color: white;
  transform: scale(1.05);
}

.puzzle-tile.empty {
  background: transparent;
  cursor: default;
}

.puzzle-tile.correct {
  background: var(--success-color);
  color: white;
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

.game-result h3 {
  font-size: 24px;
  margin-bottom: 12px;
}

.game-result p {
  font-size: 16px;
  margin: 8px 0;
}

.btn-restart {
  margin-top: 16px;
  padding: 10px 20px;
  background: white;
  color: var(--text-primary);
  border: none;
  border-radius: var(--border-radius-md);
  font-size: 14px;
  cursor: pointer;
}
</style>

