<template>
  <div class="test-component">
    <h2>样式测试组件</h2>
    <div class="test-card">
      <div class="test-icon">
        <Bot class="icon" />
      </div>
      <h3>测试标题</h3>
      <p>这是一个测试卡片，用于验证样式是否正确加载。</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Bot } from 'lucide-vue-next'
</script>

<style scoped>
.test-component {
  padding: 2rem;
  background-color: var(--bg-secondary);
  min-height: 100vh;
}

.test-card {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
  max-width: 400px;
}

.test-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.test-icon .icon {
  width: 24px;
  height: 24px;
  color: white;
}

h2 {
  color: var(--text-primary);
  margin-bottom: 1rem;
}

h3 {
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

p {
  color: var(--text-secondary);
}
</style>
