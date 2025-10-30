<template>
  <div 
    ref="containerRef"
    class="lazy-load-container"
    :style="{ height: placeholderHeight }"
  >
    <div v-if="isVisible" class="lazy-content">
      <slot />
    </div>
    <div v-else class="lazy-placeholder">
      <div v-if="showSkeleton" class="skeleton-loader">
        <div class="skeleton-line" v-for="i in skeletonLines" :key="i"></div>
      </div>
      <div v-else class="loading-placeholder">
        <div class="loading-spinner"></div>
        <span v-if="loadingText" class="loading-text">{{ loadingText }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'

interface Props {
  threshold?: number
  rootMargin?: string
  placeholderHeight?: string
  showSkeleton?: boolean
  skeletonLines?: number
  loadingText?: string
  once?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  threshold: 0.1,
  rootMargin: '50px',
  placeholderHeight: '200px',
  showSkeleton: false,
  skeletonLines: 3,
  loadingText: '加载中...',
  once: true
})

const containerRef = ref<HTMLElement>()
const isVisible = ref(false)
const observer = ref<IntersectionObserver | null>(null)

const setupObserver = () => {
  if (!containerRef.value) return
  
  observer.value = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          isVisible.value = true
          
          if (props.once && observer.value) {
            observer.value.unobserve(entry.target)
            observer.value.disconnect()
            observer.value = null
          }
        } else if (!props.once) {
          isVisible.value = false
        }
      })
    },
    {
      threshold: props.threshold,
      rootMargin: props.rootMargin
    }
  )
  
  observer.value.observe(containerRef.value)
}

const cleanupObserver = () => {
  if (observer.value) {
    observer.value.disconnect()
    observer.value = null
  }
}

onMounted(() => {
  setupObserver()
})

onUnmounted(() => {
  cleanupObserver()
})

// 监听props变化，重新设置observer
watch(
  () => [props.threshold, props.rootMargin, props.once],
  () => {
    cleanupObserver()
    setupObserver()
  }
)
</script>

<style scoped>
.lazy-load-container {
  position: relative;
  overflow: hidden;
}

.lazy-content {
  animation: fadeIn 0.3s ease-in-out;
}

.lazy-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: var(--bg-tertiary);
  border-radius: var(--radius-md);
}

.skeleton-loader {
  width: 100%;
  padding: 1rem;
}

.skeleton-line {
  height: 1rem;
  background: linear-gradient(90deg, var(--bg-secondary) 25%, var(--bg-tertiary) 50%, var(--bg-secondary) 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: var(--radius-sm);
  margin-bottom: 0.75rem;
}

.skeleton-line:last-child {
  margin-bottom: 0;
}

.skeleton-line:nth-child(1) {
  width: 100%;
}

.skeleton-line:nth-child(2) {
  width: 80%;
}

.skeleton-line:nth-child(3) {
  width: 60%;
}

.loading-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  color: var(--text-muted);
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid var(--border-color);
  border-top: 2px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  font-size: 0.875rem;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes skeleton-loading {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 移动端优化 */
@media (max-width: 768px) {
  .skeleton-loader {
    padding: 0.75rem;
  }
  
  .skeleton-line {
    height: 0.875rem;
    margin-bottom: 0.5rem;
  }
  
  .loading-spinner {
    width: 20px;
    height: 20px;
  }
  
  .loading-text {
    font-size: 0.8125rem;
  }
}

/* 减少动画模式 */
@media (prefers-reduced-motion: reduce) {
  .lazy-content {
    animation: none;
  }
  
  .skeleton-line {
    animation: none;
    background: var(--bg-secondary);
  }
  
  .loading-spinner {
    animation: none;
    border: 2px solid var(--primary-color);
  }
}
</style>