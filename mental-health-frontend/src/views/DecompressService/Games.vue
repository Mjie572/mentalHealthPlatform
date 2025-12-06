<template>
  <div class="decompress-games">
    <div class="page-header">
      <h2>解压小游戏</h2>
      <p>通过轻松的小游戏缓解压力，放松心情</p>
    </div>
    
    <!-- 游戏列表（当没有激活游戏时显示） -->
    <div v-if="!activeGame" class="games-list">
      <div
        v-for="game in gamesList"
        :key="game.id"
        class="game-card"
      >
        <div class="game-icon">{{ game.icon }}</div>
        <div class="game-info">
          <h3 class="game-title">{{ game.title }}</h3>
          <p class="game-desc">{{ game.description }}</p>
          <div class="game-meta">
            <span class="game-duration">⏱️ {{ game.duration }}分钟</span>
            <span class="game-points">🎁 +{{ game.points }}积分</span>
          </div>
        </div>
        <button
          @click.stop="startGame(game.id)"
          class="btn-start"
          type="button"
        >
          开始游玩
        </button>
      </div>
    </div>
    
    <!-- 游戏内容区域（点击开始游玩后显示） -->
    <div v-else class="game-content-wrapper">
      <div class="game-header">
        <button @click="backToList" class="btn-back" type="button">← 返回游戏列表</button>
        <h3>{{ activeGame.title }}</h3>
      </div>
      <div class="game-content">
        <DecomBreathingGame v-if="activeGame && activeGame.id === 'breathing'" />
        <DecomNumberGame v-else-if="activeGame && activeGame.id === 'number'" />
        <DecomColorMatchGame v-else-if="activeGame && activeGame.id === 'color'" />
        <DecomEmotionDoodle v-else-if="activeGame && activeGame.id === 'doodle'" />
        <DecomPuzzleGame v-else-if="activeGame && activeGame.id === 'puzzle'" />
        <div v-else class="game-error">
          <p>游戏加载失败，请重试</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import DecomBreathingGame from '@/components/decompress/Decom-BreathingGame.vue'
import DecomNumberGame from '@/components/decompress/Decom-NumberGame.vue'
import DecomColorMatchGame from '@/components/decompress/Decom-ColorMatchGame.vue'
import DecomEmotionDoodle from '@/components/decompress/Decom-EmotionDoodle.vue'
import DecomPuzzleGame from '@/components/decompress/Decom-PuzzleGame.vue'

const activeGame = ref(null)

// 游戏列表（3-5款轻量级解压游戏）
const gamesList = [
  {
    id: 'breathing',
    icon: '🌬️',
    title: '呼吸引导',
    description: '跟随引导进行深呼吸练习，帮助您放松身心，缓解焦虑和压力',
    duration: 5,
    points: 10
  },
  {
    id: 'number',
    icon: '🔢',
    title: '数字消消乐',
    description: '通过匹配数字来训练专注力，转移注意力，缓解压力',
    duration: 10,
    points: 15
  },
  {
    id: 'color',
    icon: '🎨',
    title: '色彩匹配',
    description: '通过颜色匹配游戏，放松视觉神经，提升心情',
    duration: 8,
    points: 12
  },
  {
    id: 'doodle',
    icon: '🎨',
    title: '情绪涂鸦',
    description: '通过自由涂鸦释放情绪，不用在意画得如何，随意涂画即可',
    duration: 5,
    points: 10
  },
  {
    id: 'puzzle',
    icon: '🧩',
    title: '益智拼图',
    description: '简单的拼图游戏，培养耐心，转移注意力，缓解压力',
    duration: 15,
    points: 20
  }
]

const startGame = (gameId) => {
  console.log('开始游戏:', gameId);
  const game = gamesList.find(game => game.id === gameId);
  if (game) {
    activeGame.value = game;
    console.log('游戏已激活:', activeGame.value);
    // 滚动到游戏内容区域
    setTimeout(() => {
      const gameContent = document.querySelector('.game-content-wrapper');
      if (gameContent) {
        gameContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  } else {
    console.error('未找到游戏:', gameId);
  }
}

const backToList = () => {
  console.log('返回游戏列表');
  activeGame.value = null;
  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 组件挂载时检查
onMounted(() => {
  console.log('游戏页面已加载，游戏列表:', gamesList.length);
  console.log('可用游戏:', gamesList.map(g => g.id));
})
</script>

<style scoped>
.decompress-games {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 32px;
}

.page-header h2 {
  font-size: 28px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.page-header p {
  font-size: 14px;
  color: var(--text-secondary);
}

.games-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.game-card {
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: var(--border-radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
  position: relative;
}

.game-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-4px);
}

.game-icon {
  font-size: 48px;
  text-align: center;
  margin-bottom: 16px;
}

.game-info {
  flex: 1;
  margin-bottom: 16px;
}

.game-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.game-desc {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 12px;
}

.game-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: var(--text-secondary);
}

.game-duration,
.game-points {
  display: flex;
  align-items: center;
  gap: 4px;
}

.btn-start {
  width: 100%;
  padding: 12px 24px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius-md);
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  z-index: 10;
  pointer-events: auto;
}

.btn-start:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(82, 196, 26, 0.3);
}

.btn-start:active {
  transform: translateY(0);
}

/* 游戏内容区域 */
.game-content-wrapper {
  background: var(--bg-white);
  border-radius: var(--border-radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-sm);
}

.game-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
}

.game-header h3 {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  flex: 1;
}

.btn-back {
  padding: 8px 16px;
  background: var(--bg-hover);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-back:hover {
  background: var(--border-color);
}

.game-content {
  min-height: 400px;
  position: relative;
}

.game-error {
  padding: 40px;
  text-align: center;
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .games-list {
    grid-template-columns: 1fr;
  }
}
</style>
