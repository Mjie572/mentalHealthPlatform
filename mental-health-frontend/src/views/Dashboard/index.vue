<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1 class="page-title">仪表盘</h1>
    </div>

    <!-- 欢迎横幅 -->
    <div class="welcome-banner">
      <div class="welcome-content">
        <h2 class="welcome-title">早上好,心灵旅行者</h2>
        <p class="welcome-subtitle">欢迎回到心灵花园 ✨</p>
        <p class="welcome-message">今天也要好好爱自己。已连续打卡7天,你做得很棒!</p>
        <div class="welcome-actions">
          <button class="btn btn-primary">记录心情</button>
          <button class="btn btn-secondary">开始放松</button>
        </div>
      </div>
      <div class="welcome-decoration">🌸</div>
    </div>

    <!-- 关键指标卡片 -->
    <div class="metrics-grid">
      <div class="metric-card metric-green">
        <div class="metric-icon">😊</div>
        <div class="metric-content">
          <div class="metric-value">4.2</div>
          <div class="metric-label">平均心情</div>
          <div class="metric-period">本周</div>
        </div>
      </div>
      <div class="metric-card metric-pink">
        <div class="metric-icon">🔥</div>
        <div class="metric-content">
          <div class="metric-value">7天</div>
          <div class="metric-label">连续打卡</div>
          <div class="metric-hint">再坚持3天解锁勋章</div>
        </div>
      </div>
      <div class="metric-card metric-yellow">
        <div class="metric-icon">⭐</div>
        <div class="metric-content">
          <div class="metric-value">42</div>
          <div class="metric-label">活动参与</div>
          <div class="metric-period">本月</div>
        </div>
      </div>
      <div class="metric-card metric-light-green">
        <div class="metric-icon">📈</div>
        <div class="metric-content">
          <div class="metric-value">+18%</div>
          <div class="metric-label">情绪改善</div>
          <div class="metric-period">较上月</div>
        </div>
      </div>
    </div>

    <!-- 今日任务和AI诊疗 -->
    <div class="content-grid">
      <div class="tasks-section">
        <div class="section-header">
          <h3 class="section-title">今日任务</h3>
          <span class="section-subtitle">4项任务·2已完成</span>
        </div>
        <div class="task-list">
          <div class="task-item completed">
            <input type="checkbox" checked disabled />
            <span class="task-text">早晨冥想 10分钟</span>
            <span class="task-time">07:00</span>
          </div>
          <div class="task-item completed">
            <input type="checkbox" checked disabled />
            <span class="task-text">记录今日心情</span>
            <span class="task-time">21:00</span>
          </div>
          <div class="task-item">
            <input type="checkbox" disabled />
            <span class="task-text">感恩日记书写</span>
            <span class="task-time">20:00</span>
          </div>
          <div class="task-item">
            <input type="checkbox" disabled />
            <span class="task-text">睡前放松练习</span>
            <span class="task-time">22:00</span>
          </div>
        </div>
      </div>

      <div class="ai-section">
        <div class="ai-card">
          <div class="ai-icon">🤖</div>
          <h4 class="ai-title">AI诊疗</h4>
          <p class="ai-desc">24小时倾听陪伴</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 仪表盘页面
</script>

<style scoped>
.dashboard {
  max-width: 1400px;
  margin: 0 auto;
}

.dashboard-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
}

.welcome-banner {
  position: relative;
  background: linear-gradient(135deg, var(--primary-light), #e6f7ff);
  border-radius: var(--border-radius-lg);
  padding: 32px;
  margin-bottom: 24px;
  overflow: hidden;
}

.welcome-content {
  position: relative;
  z-index: 1;
}

.welcome-title {
  font-size: 28px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.welcome-subtitle {
  font-size: 18px;
  color: var(--text-secondary);
  margin-bottom: 16px;
}

.welcome-message {
  font-size: 16px;
  color: var(--text-primary);
  margin-bottom: 24px;
}

.welcome-actions {
  display: flex;
  gap: 12px;
}

.welcome-decoration {
  position: absolute;
  top: 20px;
  right: 40px;
  font-size: 80px;
  opacity: 0.3;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: var(--border-radius-md);
  font-size: 14px;
  cursor: pointer;
  transition: all var(--transition-base);
}

.btn-primary {
  background: var(--primary-color);
  color: #fff;
}

.btn-primary:hover {
  background: var(--primary-dark);
}

.btn-secondary {
  background: #fff;
  color: var(--primary-color);
  border: 1px solid var(--primary-color);
}

.btn-secondary:hover {
  background: var(--primary-light);
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.metric-card {
  background: #fff;
  border-radius: var(--border-radius-lg);
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-base);
}

.metric-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.metric-green {
  border-left: 4px solid var(--primary-color);
}

.metric-pink {
  border-left: 4px solid var(--secondary-color);
}

.metric-yellow {
  border-left: 4px solid var(--accent-color);
}

.metric-light-green {
  border-left: 4px solid #95de64;
}

.metric-icon {
  font-size: 36px;
}

.metric-content {
  flex: 1;
}

.metric-value {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.metric-label {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 2px;
}

.metric-period,
.metric-hint {
  font-size: 12px;
  color: var(--text-secondary);
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.tasks-section,
.ai-section {
  background: #fff;
  border-radius: var(--border-radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-sm);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.section-subtitle {
  font-size: 12px;
  color: var(--text-secondary);
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: var(--border-radius-md);
  transition: all var(--transition-base);
}

.task-item:hover {
  background: var(--bg-hover);
}

.task-item.completed .task-text {
  text-decoration: line-through;
  color: var(--text-secondary);
}

.task-text {
  flex: 1;
  font-size: 14px;
  color: var(--text-primary);
}

.task-time {
  font-size: 12px;
  color: var(--text-secondary);
}

.ai-card {
  text-align: center;
  padding: 32px;
}

.ai-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.ai-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.ai-desc {
  font-size: 14px;
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
  
  .metrics-grid {
    grid-template-columns: 1fr;
  }
}
</style>

