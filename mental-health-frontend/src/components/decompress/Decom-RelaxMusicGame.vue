<template>
  <div class="relax-music-game">
    <div class="game-info">
      <h3>放松音乐体验</h3>
      <p>选择您喜欢的音乐类型，配合简单的互动，帮助您进入放松状态</p>
    </div>
    
    <div class="music-selection">
      <h4>选择音乐类型</h4>
      <div class="music-types">
        <div
          v-for="music in musicTypes"
          :key="music.id"
          class="music-card"
          :class="{ active: selectedMusic?.id === music.id }"
          @click="selectMusic(music)"
        >
          <div class="music-icon">{{ music.icon }}</div>
          <div class="music-name">{{ music.name }}</div>
          <div class="music-desc">{{ music.description }}</div>
        </div>
      </div>
    </div>
    
    <div v-if="selectedMusic" class="music-player">
      <div class="player-header">
        <h4>{{ selectedMusic.name }}</h4>
        <p>{{ selectedMusic.description }}</p>
      </div>
      
      <div class="player-controls">
        <button
          @click="togglePlay"
          class="btn-play"
          :disabled="isLoading || loadError"
        >
          <span v-if="isLoading">⏳ 加载中...</span>
          <span v-else-if="loadError">⚠️ 加载失败</span>
          <span v-else>{{ isPlaying ? '⏸️ 暂停' : '▶️ 继续' }}</span>
        </button>
        <button
          @click="completeSession"
          class="btn-complete"
        >
          完成体验
        </button>
      </div>
      
      <!-- 播放状态提示 -->
      <div v-if="isLoading" class="loading-hint">
        <p>正在加载音乐，请稍候...</p>
      </div>
      <div v-if="loadError" class="error-hint">
        <p>⚠️ 音乐加载失败，但您可以继续体验放松过程</p>
      </div>
      
      <div class="relax-tips">
        <h5>放松提示</h5>
        <ul>
          <li>找一个安静舒适的环境</li>
          <li>闭上眼睛，深呼吸</li>
          <li>让音乐引导您进入放松状态</li>
          <li>感受身体的每一个部位逐渐放松</li>
        </ul>
      </div>
      
      <div class="timer">
        <span>体验时长：{{ formatTime(playTime) }}</span>
      </div>
    </div>
    
    <div v-if="completed" class="completion-message">
      <h3>🎉 体验完成！</h3>
      <p>您已完成 {{ formatTime(playTime) }} 的放松音乐体验</p>
      <p>希望您感到更加放松和舒适</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { completeGame } from '@/api/decompress'
import { useGlobalState } from '@/store'

const globalState = useGlobalState()
const currentUserId = computed(() => globalState.currentUserId)

const selectedMusic = ref(null)
const isPlaying = ref(false)
const playTime = ref(0)
const completed = ref(false)
const audioElement = ref(null) // HTML5 Audio元素
const isLoading = ref(false) // 音乐加载状态
const loadError = ref(false) // 加载错误状态
const retryCount = ref(0) // 重试次数
const currentAudioUrlIndex = ref(0) // 当前尝试的音频URL索引

let timer = null
let loadTimeout = null // 加载超时定时器

// 音乐类型配置
// 注意：实际部署时，建议将音频文件放在项目的public目录或CDN上
// 示例：audioUrl: '/audio/nature.mp3' 或 'https://your-cdn.com/audio/nature.mp3'
const musicTypes = [
  {
    id: 'nature',
    icon: '🌲',
    name: '自然之声',
    description: '鸟鸣、流水、风声等自然声音，帮助您回归自然',
    // 使用多个备用音频资源（按优先级排序）
    audioUrls: [
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',  // 主资源
      '/audio/nature.mp3',  // 本地备用资源1
      'https://archive.org/download/testmp3testfile/mpthreetest.mp3'  // 备用资源2
    ]
  },
  {
    id: 'meditation',
    icon: '🧘',
    name: '冥想音乐',
    description: '舒缓的冥想音乐，帮助您进入深度放松状态',
    audioUrls: [
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      '/audio/meditation.mp3',
      'https://archive.org/download/testmp3testfile/mpthreetest.mp3'
    ]
  },
  {
    id: 'piano',
    icon: '🎹',
    name: '钢琴曲',
    description: '轻柔的钢琴曲，缓解压力，提升心情',
    audioUrls: [
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
      '/audio/piano.mp3',
      'https://archive.org/download/testmp3testfile/mpthreetest.mp3'
    ]
  },
  {
    id: 'ocean',
    icon: '🌊',
    name: '海浪声',
    description: '海浪拍打的声音，带来宁静与平和',
    audioUrls: [
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
      '/audio/ocean.mp3',
      'https://archive.org/download/testmp3testfile/mpthreetest.mp3'
    ]
  }
]

// 加载音频（带重试机制）
const loadAudio = async (music, urlIndex = 0, retryAttempt = 0) => {
  const maxRetries = 2; // 最多重试2次
  const maxUrlIndex = music.audioUrls.length - 1; // 最大URL索引
  
  // 如果所有URL都尝试过了，显示错误
  if (urlIndex > maxUrlIndex) {
    console.error('所有音频资源都加载失败:', music.name);
    loadError.value = true;
    isLoading.value = false;
    if (loadTimeout) {
      clearTimeout(loadTimeout);
      loadTimeout = null;
    }
    return;
  }
  
  const audioUrl = music.audioUrls[urlIndex];
  console.log(`尝试加载音频 (${urlIndex + 1}/${music.audioUrls.length}):`, audioUrl, `重试次数: ${retryAttempt}`);
  
  try {
    // 清理之前的音频元素
    if (audioElement.value) {
      try {
        audioElement.value.pause();
        audioElement.value.src = '';
      } catch (e) {
        console.warn('清理音频元素时出错:', e);
      }
      audioElement.value = null;
    }
    
    // 清理超时定时器
    if (loadTimeout) {
      clearTimeout(loadTimeout);
    }
    
    const audio = new Audio(audioUrl);
    
    // 设置音频属性，确保流畅播放
    audio.loop = true; // 循环播放
    audio.preload = 'auto'; // 预加载
    audio.volume = 0.7; // 音量（0-1）
    audio.crossOrigin = 'anonymous'; // 允许跨域（如果需要）
    
    // 设置加载超时（15秒）
    loadTimeout = setTimeout(() => {
      console.warn('音频加载超时:', audioUrl);
      audio.pause();
      audio.src = '';
      
      // 尝试下一个URL或重试
      if (retryAttempt < maxRetries) {
        console.log(`重试加载 (${retryAttempt + 1}/${maxRetries}):`, audioUrl);
        loadAudio(music, urlIndex, retryAttempt + 1);
      } else if (urlIndex < maxUrlIndex) {
        console.log('尝试下一个音频URL');
        loadAudio(music, urlIndex + 1, 0);
      } else {
        loadError.value = true;
        isLoading.value = false;
      }
    }, 15000);
    
    // 加载成功处理
    const handleLoadedData = () => {
      console.log('音乐加载完成:', music.name, audioUrl);
      if (loadTimeout) {
        clearTimeout(loadTimeout);
        loadTimeout = null;
      }
      isLoading.value = false;
      retryCount.value = 0;
      currentAudioUrlIndex.value = urlIndex;
      
      // 自动开始播放
      audio.play().then(() => {
        isPlaying.value = true;
        startTimer();
      }).catch(err => {
        console.error('播放失败:', err);
        // 如果播放失败，尝试下一个URL
        if (urlIndex < maxUrlIndex) {
          loadAudio(music, urlIndex + 1, 0);
        } else if (retryAttempt < maxRetries) {
          loadAudio(music, urlIndex, retryAttempt + 1);
        } else {
          loadError.value = true;
          isLoading.value = false;
        }
      });
    };
    
    // 加载错误处理
    const handleError = (e) => {
      console.error('音乐加载错误:', e, audioUrl);
      if (loadTimeout) {
        clearTimeout(loadTimeout);
        loadTimeout = null;
      }
      
      // 如果还有重试次数，重试当前URL
      if (retryAttempt < maxRetries) {
        console.log(`重试加载 (${retryAttempt + 1}/${maxRetries}):`, audioUrl);
        setTimeout(() => {
          loadAudio(music, urlIndex, retryAttempt + 1);
        }, 1000); // 延迟1秒后重试
      } else if (urlIndex < maxUrlIndex) {
        // 尝试下一个URL
        console.log('尝试下一个音频URL');
        loadAudio(music, urlIndex + 1, 0);
      } else {
        // 所有资源都失败
        loadError.value = true;
        isLoading.value = false;
      }
    };
    
    // 监听播放结束（虽然设置了循环，但以防万一）
    audio.addEventListener('ended', () => {
      if (audio.loop && isPlaying.value) {
        audio.currentTime = 0;
        audio.play().catch(err => {
          console.error('重新播放失败:', err);
        });
      }
    });
    
    // 监听播放事件
    audio.addEventListener('play', () => {
      console.log('音乐开始播放');
      isPlaying.value = true;
    });
    
    audio.addEventListener('pause', () => {
      console.log('音乐已暂停');
      isPlaying.value = false;
    });
    
    // 监听缓冲事件
    audio.addEventListener('waiting', () => {
      console.log('音频缓冲中...');
    });
    
    audio.addEventListener('canplay', () => {
      console.log('音频可以播放');
    });
    
    audio.addEventListener('canplaythrough', () => {
      console.log('音频已完全加载，可以流畅播放');
    });
    
    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('error', handleError);
    
    audioElement.value = audio;
    
    // 如果音频已经可以播放，直接播放
    if (audio.readyState >= 2) {
      audio.play().then(() => {
        isPlaying.value = true;
        isLoading.value = false;
        if (loadTimeout) {
          clearTimeout(loadTimeout);
          loadTimeout = null;
        }
        startTimer();
      }).catch(err => {
        console.error('播放失败:', err);
        if (urlIndex < maxUrlIndex) {
          loadAudio(music, urlIndex + 1, 0);
        } else if (retryAttempt < maxRetries) {
          loadAudio(music, urlIndex, retryAttempt + 1);
        } else {
          loadError.value = true;
          isLoading.value = false;
        }
      });
    }
    
  } catch (error) {
    console.error('创建音频对象失败:', error);
    if (loadTimeout) {
      clearTimeout(loadTimeout);
      loadTimeout = null;
    }
    
    // 尝试下一个URL或重试
    if (retryAttempt < maxRetries) {
      setTimeout(() => {
        loadAudio(music, urlIndex, retryAttempt + 1);
      }, 1000);
    } else if (urlIndex < maxUrlIndex) {
      loadAudio(music, urlIndex + 1, 0);
    } else {
      loadError.value = true;
      isLoading.value = false;
    }
  }
}

const selectMusic = async (music) => {
  console.log('选择音乐:', music.name);
  
  // 如果正在播放其他音乐，先停止
  if (audioElement.value) {
    audioElement.value.pause();
    audioElement.value.src = '';
    audioElement.value = null;
  }
  
  // 清理超时定时器
  if (loadTimeout) {
    clearTimeout(loadTimeout);
    loadTimeout = null;
  }
  
  // 如果选择的是同一首音乐且正在播放，则暂停
  if (selectedMusic.value?.id === music.id && isPlaying.value) {
    togglePlay();
    return;
  }
  
  selectedMusic.value = music
  isPlaying.value = false
  playTime.value = 0
  completed.value = false
  isLoading.value = true
  loadError.value = false
  retryCount.value = 0
  currentAudioUrlIndex.value = 0
  
  // 开始加载音频（从第一个URL开始，重试次数为0）
  loadAudio(music, 0, 0);
}


const startTimer = () => {
  if (timer) clearInterval(timer);
  timer = setInterval(() => {
    playTime.value++
  }, 1000);
}

const togglePlay = () => {
  if (!audioElement.value) {
    console.warn('音频元素不存在');
    return;
  }
  
  if (isPlaying.value) {
    // 暂停播放
    audioElement.value.pause();
    isPlaying.value = false;
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  } else {
    // 继续播放
    audioElement.value.play().then(() => {
      isPlaying.value = true;
      startTimer();
    }).catch(err => {
      console.error('播放失败:', err);
      loadError.value = true;
      alert('播放失败，请检查网络连接或重试。');
    });
  }
}

const completeSession = () => {
  // 停止播放
  if (audioElement.value) {
    audioElement.value.pause();
    audioElement.value.currentTime = 0;
  }
  
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  
  completed.value = true
  isPlaying.value = false
  
  // 提交游戏完成记录
  if (currentUserId.value && selectedMusic.value) {
    completeGame({
      userId: currentUserId.value,
      gameType: 'relax_music',
      score: Math.floor(playTime.value / 10), // 每10秒1分
      duration: playTime.value
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

onUnmounted(() => {
  // 清理定时器
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  
  // 清理加载超时定时器
  if (loadTimeout) {
    clearTimeout(loadTimeout);
    loadTimeout = null;
  }
  
  // 清理音频资源
  if (audioElement.value) {
    audioElement.value.pause();
    audioElement.value.src = '';
    // 移除所有事件监听器
    audioElement.value.removeEventListener('loadeddata', () => {});
    audioElement.value.removeEventListener('error', () => {});
    audioElement.value = null;
  }
})
</script>

<style scoped>
.relax-music-game {
  text-align: center;
  padding: 20px;
}

.game-info {
  margin-bottom: 32px;
}

.game-info h3 {
  font-size: 24px;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.game-info p {
  font-size: 14px;
  color: var(--text-secondary);
}

.music-selection {
  margin-bottom: 32px;
}

.music-selection h4 {
  font-size: 18px;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.music-types {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.music-card {
  padding: 20px;
  background: var(--bg-white);
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  cursor: pointer;
  transition: all 0.3s ease;
}

.music-card:hover {
  border-color: var(--primary-color);
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

.music-card.active {
  border-color: var(--primary-color);
  background: var(--primary-light);
}

.music-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.music-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.music-desc {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.5;
}

.music-player {
  background: var(--bg-white);
  border-radius: var(--border-radius-lg);
  padding: 32px;
  box-shadow: var(--shadow-sm);
}

.player-header {
  margin-bottom: 24px;
}

.player-header h4 {
  font-size: 20px;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.player-header p {
  font-size: 14px;
  color: var(--text-secondary);
}

.player-controls {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-bottom: 32px;
}

.btn-play,
.btn-complete {
  padding: 12px 24px;
  border: none;
  border-radius: var(--border-radius-md);
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-play {
  background: var(--primary-color);
  color: white;
}

.btn-complete {
  background: var(--success-color);
  color: white;
}

.relax-tips {
  text-align: left;
  background: var(--bg-hover);
  padding: 20px;
  border-radius: var(--border-radius-md);
  margin-bottom: 24px;
}

.relax-tips h5 {
  font-size: 16px;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.relax-tips ul {
  list-style: none;
  padding: 0;
}

.relax-tips li {
  font-size: 14px;
  color: var(--text-secondary);
  padding: 6px 0;
  padding-left: 20px;
  position: relative;
}

.relax-tips li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: var(--primary-color);
}

.timer {
  font-size: 18px;
  color: var(--primary-color);
  font-weight: 600;
}

.completion-message {
  background: var(--success-color);
  color: white;
  padding: 32px;
  border-radius: var(--border-radius-lg);
  margin-top: 24px;
}

.completion-message h3 {
  font-size: 24px;
  margin-bottom: 12px;
}

.completion-message p {
  font-size: 16px;
  margin: 8px 0;
}

.loading-hint,
.error-hint {
  padding: 12px;
  border-radius: var(--border-radius-md);
  margin-bottom: 16px;
  font-size: 14px;
}

.loading-hint {
  background: var(--primary-light);
  color: var(--primary-color);
}

.error-hint {
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffc107;
}

.btn-play:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>

