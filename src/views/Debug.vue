<template>
  <div class="debug-page">
    <h1>调试页面 - 样式测试</h1>
    
    <div class="debug-section">
      <h2>CSS变量测试</h2>
      <div class="color-test">
        <div class="color-box primary">主色</div>
        <div class="color-box secondary">次色</div>
        <div class="color-box success">成功色</div>
        <div class="color-box warning">警告色</div>
      </div>
    </div>

    <div class="debug-section">
      <h2>图标测试</h2>
      <div class="icon-test">
        <div class="icon-item">
          <Bot class="icon" />
          <span>Bot</span>
        </div>
        <div class="icon-item">
          <Search class="icon" />
          <span>Search</span>
        </div>
        <div class="icon-item">
          <Star class="icon" />
          <span>Star</span>
        </div>
      </div>
    </div>

    <div class="debug-section">
      <h2>卡片测试</h2>
      <div class="card-test">
        <div class="test-card">
          <div class="card-icon">
            <Bot class="icon" />
          </div>
          <h3>测试卡片</h3>
          <p>这是一个测试卡片，用于验证样式是否正确加载。</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Bot, Search, Star } from 'lucide-vue-next'
</script>

<style scoped>
.debug-page {
  padding: 2rem;
  background-color: var(--bg-secondary);
  min-height: 100vh;
}

.debug-section {
  margin-bottom: 2rem;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
}

h1 {
  color: var(--text-primary);
  margin-bottom: 2rem;
  font-size: 2rem;
}

h2 {
  color: var(--text-primary);
  margin-bottom: 1rem;
  font-size: 1.25rem;
}

.color-test {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.color-box {
  padding: 1rem;
  border-radius: var(--radius-md);
  color: white;
  font-weight: 600;
  min-width: 100px;
  text-align: center;
}

.color-box.primary {
  background-color: var(--primary-color);
}

.color-box.secondary {
  background-color: var(--secondary-color);
}

.color-box.success {
  background-color: var(--success-color);
}

.color-box.warning {
  background-color: var(--warning-color);
}

.icon-test {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background-color: var(--bg-tertiary);
}

.icon-item .icon {
  width: 32px;
  height: 32px;
  color: var(--primary-color);
}

.icon-item span {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.card-test {
  display: flex;
  justify-content: center;
}

.test-card {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
  max-width: 400px;
  transition: all 0.2s ease;
}

.test-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.card-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.card-icon .icon {
  width: 24px;
  height: 24px;
  color: white;
}

.test-card h3 {
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  font-size: 1.125rem;
}

.test-card p {
  color: var(--text-secondary);
  line-height: 1.5;
}
</style>
