<template>
  <div class="module-system">
    <div class="module-header">
      <h2 class="module-title">用户账户与系统集成</h2>
      <p class="module-desc">统一入口：智能助手、登录/注册、账号中心与账户入口页</p>
    </div>
 
    <div class="function-list">
      <div
        class="function-item"
        @click="$router.push('/system/assistant')"
      >
        <div class="function-icon soft">
          <!-- 圆润卡通图标（心小导）占位 -->
          <span>🫶</span>
        </div>
        <div class="function-content">
          <h3 class="function-title">界面引导智能助手</h3>

        </div>
        <span class="function-arrow">›</span>
      </div>
      
      <div class="function-item" @click="$router.push('/system/login')">
        <div class="function-icon">
          <span>🔑</span>
        </div>
        <div class="function-content">
          <h3 class="function-title">用户登录</h3>
  
        </div>
        <span class="function-arrow">›</span>
      </div>
      
      <div class="function-item" @click="$router.push('/system/register')">
        <div class="function-icon">
          <span>🆕</span>
        </div>
        <div class="function-content">
          <h3 class="function-title">用户注册</h3>
         
        </div>
        <span class="function-arrow">›</span>
      </div>
      
      <div class="function-item" @click="$router.push('/system/account')">
        <div class="function-icon">
          <span>👤</span>
        </div>
        <div class="function-content">
          <h3 class="function-title">账号中心</h3>
          
        </div>
        <span class="function-arrow">›</span>
      </div>
      
      <div class="function-item" @click="$router.push('/system/user-account')">
        <div class="function-icon">
          <span>🧭</span>
        </div>
        <div class="function-content">
          <h3 class="function-title">账户入口页</h3>
       
        </div>
        <span class="function-arrow">›</span>
      </div>
    </div>

    
  </div>
</template>

<script setup>
// 成员E：系统集成 + 界面引导智能助手模块首页
</script>

<style scoped>
.module-system {
  max-width: 1100px;
  margin: 0 auto;
}

.module-header {
  margin-bottom: 24px;
}

.module-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 6px;
}

.module-desc {
  font-size: 14px;
  color: var(--text-secondary);
}

.function-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.function-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px;
  background: var(--bg-white);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
  cursor: pointer;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}

.function-item:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.function-icon {
  font-size: 30px;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--secondary-light);
  border-radius: var(--border-radius-md);
}

.function-icon.soft {
  background: var(--card-bg-gradient);
  border: 1px solid var(--border-light);
}

.function-content { flex: 1; }

.function-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.function-desc {
  font-size: 14px;
  color: var(--text-secondary);
}

.function-arrow {
  font-size: 24px;
  color: var(--text-secondary);
}

.dev-tips {
  background: var(--soft-gradient);
  border-radius: var(--border-radius-lg);
  padding: 18px;
  border-left: 4px solid var(--accent-color);
}

.dev-tips h4 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 10px;
}

.dev-tips ul { list-style: none; padding: 0; }
.dev-tips li { font-size: 14px; color: var(--text-secondary); padding: 6px 0; padding-left: 20px; position: relative; }
.dev-tips li::before { content: '•'; position: absolute; left: 0; color: var(--accent-color); }
</style>

