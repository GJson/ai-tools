<template>
  <div 
    ref="containerRef"
    class="lazy-image-container"
    :style="{ 
      width: width,
      height: height,
      backgroundColor: placeholderColor
    }"
  >
    <img
      v-if="isLoaded"
      :src="src"
      :alt="alt"
      :class="['lazy-image', { 'loaded': isLoaded }]"
      :style="{
        width: '100%',
        height: '100%',
        objectFit: objectFit
      }"
      @load="handleLoad"
      @error="handleError"
    />
    <div v-else class="lazy-image-placeholder">
      <div v-if="showSkeleton" class="skeleton-image">
        <div class="skeleton-shape"></div>
      </div>
      <div v-else class="loading-placeholder">
        <div class="loading-spinner"></div>
        <span v-if="loadingText" class="loading-text">{{ loadingText }}</span>
      </div>
    </div>
    
    <!-- 错误状态 -->
    <div v-if="hasError" class="error-placeholder">
      <div class="error-icon">
        <Image class="icon" :size="24" />
      </div>
      <span v-if="errorText" class="error-text">{{ errorText }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { Image } from 'lucide-vue-next'

interface Props {
  src: string
  alt?: string
  width?: string
  height?: string
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down' | 'none'
  placeholderColor?: string
  showSkeleton?: boolean
  loadingText?: string
  errorText?: string
  threshold?: number
  rootMargin?: string
  once?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  alt: '',
  width: '100%',
  height: '200px',
  objectFit: 'cover',
  placeholderColor: 'var(--bg-tertiary)',
  showSkeleton: true,
  loadingText: '加载中...',
  errorText: '加载失败',
  threshold: 0.1,
  rootMargin: '50px',
  once: true
})

const emit = defineEmits<{
  load: [event: Event]
  error: [event: Event]
  visible: []
}>()

const containerRef = ref<HTMLElement>()
const isLoaded = ref(false)
const hasError = ref(false)
const isVisible = ref(false)
const observer = ref<IntersectionObserver | null>(null)

// 设置Intersection Observer
const setupObserver = () => {
  if (!containerRef.value) return
  
  observer.value = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          isVisible.value = true
          emit('visible')
          
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

// 清理Observer
const cleanupObserver = () => {
  if (observer.value) {
    observer.value.disconnect()
    observer.value = null
  }
}

// 图片加载成功
const handleLoad = (event: Event) => {
  isLoaded.value = true
  hasError.value = false
  emit('load', event)
}

// 图片加载失败
const handleError = (event: Event) => {
  hasError.value = true
  isLoaded.value = false
  emit('error', event)
}

// 重新加载
const reload = () => {
  hasError.value = false
  isLoaded.value = false
  isVisible.value = false
  setupObserver()
}

// 监听src变化
watch(() => props.src, () => {
  hasError.value = false
  isLoaded.value = false
  isVisible.value = false
  nextTick(() => {
    setupObserver()
  })
})

onMounted(() => {
  setupObserver()
})

onUnmounted(() => {
  cleanupObserver()
})

// 暴露方法
defineExpose({
  reload
})
</script>

<style scoped>
.lazy-image-container {
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
}

.lazy-image {
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
}

.lazy-image.loaded {
  opacity: 1;
}

.lazy-image-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-tertiary);
}

.skeleton-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.skeleton-shape {
  width: 60%;
  height: 60%;
  background: linear-gradient(90deg, var(--bg-secondary) 25%, var(--bg-tertiary) 50%, var(--bg-secondary) 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: var(--radius-sm);
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

.error-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: var(--text-muted);
  background-color: var(--bg-tertiary);
}

.error-icon {
  color: var(--text-muted);
}

.error-text {
  font-size: 0.875rem;
  text-align: center;
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
  .loading-spinner {
    width: 20px;
    height: 20px;
  }
  
  .loading-text,
  .error-text {
    font-size: 0.8125rem;
  }
  
  .skeleton-shape {
    width: 50%;
    height: 50%;
  }
}

/* 减少动画模式 */
@media (prefers-reduced-motion: reduce) {
  .lazy-image {
    transition: none;
  }
  
  .skeleton-shape {
    animation: none;
    background: var(--bg-secondary);
  }
  
  .loading-spinner {
    animation: none;
    border: 2px solid var(--primary-color);
  }
}

/* 高对比度模式 */
@media (prefers-contrast: high) {
  .lazy-image-container {
    border: 2px solid var(--border-color);
  }
  
  .error-placeholder {
    border: 2px solid var(--error-color);
  }
}
</style>