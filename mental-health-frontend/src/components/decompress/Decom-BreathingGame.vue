<template>
  <div class="decom-breathing-game">
    <div class="game-header">
      <h3>呼吸引导游戏</h3>
      <p class="game-desc">跟随节奏，深呼吸放松身心</p>
    </div>
    
    <div class="breathing-circle" :class="{ 'breathing-in': isBreathingIn, 'breathing-out': isBreathingOut }">
      <div class="circle-inner">
        <span class="breathing-text">{{ breathingText }}</span>
        <span class="breathing-count">{{ countdown }}</span>
      </div>
    </div>
    
    <div class="game-controls">
      <button 
        v-if="!isPlaying" 
        @click="startGame" 
        class="btn-start"
      >
        开始
      </button>
      <button 
        v-else 
        @click="stopGame" 
        class="btn-stop"
      >
        暂停
      </button>
      <button 
        v-if="isPlaying || hasPlayed" 
        @click="resetGame" 
        class="btn-reset"
      >
        重置
      </button>
    </div>
    
    <div class="game-settings">
      <label>
        <span>呼吸时长（秒）：</span>
        <select v-model="breathDuration" :disabled="isPlaying">
          <option :value="3">3秒</option>
          <option :value="4">4秒</option>
          <option :value="5">5秒</option>
          <option :value="6">6秒</option>
        </select>
      </label>
    </div>
    
    <div v-if="gameStats.totalCycles > 0" class="game-stats">
      <p>已完成循环：{{ gameStats.totalCycles }} 次</p>
      <p>总时长：{{ gameStats.totalTime }} 秒</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { completeGame } from '@/api/decompress'
import { useGlobalState } from '@/store'
import { updatePoints } from '@/api/decompress'

const globalState = useGlobalState()
const currentUserId = computed(() => globalState.currentUserId)

// 游戏状态
const isPlaying = ref(false)
const isBreathingIn = ref(false)
const isBreathingOut = ref(false)
const countdown = ref(0)
const breathingText = ref('准备开始')
const breathDuration = ref(4)
const hasPlayed = ref(false)

// 游戏统计
const gameStats = ref({
  totalCycles: 0,
  totalTime: 0,
  startTime: null
})

let timer = null
let timeUpdateTimer = null
let currentPhase = 'idle' // 'idle' | 'in' | 'hold' | 'out'

// 开始游戏
const startGame = async () => {
  // 兼容性处理：检查用户ID
  if (!currentUserId.value) {
    alert('用户未登录，请先登录')
    return
  }
  
  isPlaying.value = true
  hasPlayed.value = true
  gameStats.value.startTime = Date.now()
  currentPhase = 'in'
  breathingCycle()
  
  // 开始计时
  timeUpdateTimer = setInterval(() => {
    if (gameStats.value.startTime) {
      gameStats.value.totalTime = Math.floor((Date.now() - gameStats.value.startTime) / 1000)
    }
  }, 1000)
}

// 呼吸循环
const breathingCycle = () => {
  if (!isPlaying.value) return
  
  if (currentPhase === 'in') {
    // 吸气阶段
    isBreathingIn.value = true
    isBreathingOut.value = false
    breathingText.value = '吸气'
    countdown.value = breathDuration.value
    countDown(() => {
      currentPhase = 'hold'
      breathingCycle()
    })
  } else if (currentPhase === 'hold') {
    // 屏息阶段
    isBreathingIn.value = false
    isBreathingOut.value = false
    breathingText.value = '屏息'
    countdown.value = 2
    countDown(() => {
      currentPhase = 'out'
      breathingCycle()
    })
  } else if (currentPhase === 'out') {
    // 呼气阶段
    isBreathingIn.value = false
    isBreathingOut.value = true
    breathingText.value = '呼气'
    countdown.value = breathDuration.value
    countDown(() => {
      gameStats.value.totalCycles++
      currentPhase = 'in'
      breathingCycle()
    })
  }
}

// 倒计时
const countDown = (callback) => {
  if (countdown.value > 0) {
    timer = setTimeout(() => {
      countdown.value--
      countDown(callback)
    }, 1000)
  } else {
    callback()
  }
}

// 停止游戏
const stopGame = () => {
  isPlaying.value = false
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
  if (timeUpdateTimer) {
    clearInterval(timeUpdateTimer)
    timeUpdateTimer = null
  }
}

// 重置游戏
const resetGame = async () => {
  stopGame()
  isBreathingIn.value = false
  isBreathingOut.value = false
  countdown.value = 0
  breathingText.value = '准备开始'
  currentPhase = 'idle'
  
  // 如果游戏时长超过30秒，记录完成并奖励积分
  if (gameStats.value.totalTime >= 30) {
    try {
      await completeGame({
        userId: currentUserId.value,
        gameType: 'breathing',
        duration: gameStats.value.totalTime,
        cycles: gameStats.value.totalCycles
      })
      
      // 奖励积分（完成一次呼吸游戏奖励5积分）
      await updatePoints({
        userId: currentUserId.value,
        points: 5,
        source: 'game_breathing',
        description: '完成呼吸引导游戏'
      })
    } catch (error) {
      console.error('游戏完成记录失败:', error)
    }
  }
  
  gameStats.value = {
    totalCycles: 0,
    totalTime: 0,
    startTime: null
  }
  hasPlayed.value = false
}

onUnmounted(() => {
  if (timer) clearTimeout(timer)
  if (timeUpdateTimer) clearInterval(timeUpdateTimer)
})
</script>

<style scoped>
.decom-breathing-game {
  text-align: center;
  padding: 20px;
}

.game-header h3 {
  font-size: 24px;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.game-desc {
  color: var(--text-secondary);
  margin-bottom: 32px;
}

.breathing-circle {
  width: 300px;
  height: 300px;
  margin: 0 auto 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-light), var(--secondary-light));
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
  position: relative;
}

.breathing-circle.breathing-in {
  animation: breatheIn 4s ease-in-out infinite;
}

.breathing-circle.breathing-out {
  animation: breatheOut 4s ease-in-out infinite;
}

.circle-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.breathing-text {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
}

.breathing-count {
  font-size: 48px;
  font-weight: bold;
  color: var(--primary-color);
}

@keyframes breatheIn {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.3); }
}

@keyframes breatheOut {
  0%, 100% { transform: scale(1.3); }
  50% { transform: scale(1); }
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

.btn-start {
  background: var(--primary-color);
  color: white;
}

.btn-start:hover {
  background: var(--primary-dark);
}

.btn-stop {
  background: var(--warning-color);
  color: white;
}

.btn-reset {
  background: var(--text-secondary);
  color: white;
}

.game-settings {
  margin-bottom: 24px;
}

.game-settings label {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
}

.game-settings select {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
}

.game-stats {
  background: var(--bg-hover);
  padding: 16px;
  border-radius: var(--border-radius-md);
  margin-top: 24px;
}

.game-stats p {
  margin: 4px 0;
  color: var(--text-secondary);
}
</style>

