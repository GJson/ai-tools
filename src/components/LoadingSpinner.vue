<template>
  <div class="loading-spinner" :class="{ 'loading-overlay': overlay }">
    <div class="spinner-container">
      <div class="spinner" :style="{ width: size + 'px', height: size + 'px' }">
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
      </div>
      <p v-if="text" class="loading-text">{{ text }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  size?: number
  text?: string
  overlay?: boolean
}

withDefaults(defineProps<Props>(), {
  size: 40,
  text: '',
  overlay: false
})
</script>

<style scoped>
.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  z-index: 9999;
  padding: 0;
}

.spinner-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.spinner {
  position: relative;
  display: inline-block;
}

.spinner-ring {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 3px solid transparent;
  border-top: 3px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
}

.spinner-ring:nth-child(1) {
  animation-delay: -0.45s;
}

.spinner-ring:nth-child(2) {
  animation-delay: -0.3s;
}

.spinner-ring:nth-child(3) {
  animation-delay: -0.15s;
}

.loading-text {
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  margin: 0;
  text-align: center;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 深色模式支持 */
@media (prefers-color-scheme: dark) {
  .loading-overlay {
    background-color: rgba(0, 0, 0, 0.8);
  }
}
</style>
