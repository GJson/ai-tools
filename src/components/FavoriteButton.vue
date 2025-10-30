<template>
  <button
    @click="toggleFavorite"
    :disabled="isLoading"
    class="favorite-btn"
    :class="{
      'favorite-btn--active': isFavorited,
      'favorite-btn--loading': isLoading
    }"
  >
    <Heart 
      v-if="!isLoading" 
      class="favorite-icon" 
      :class="{ 'favorite-icon--filled': isFavorited }"
      :size="iconSize"
    />
    <Loader2 
      v-else 
      class="favorite-icon favorite-icon--spinning" 
      :size="iconSize"
    />
    <span v-if="showText" class="favorite-text">
      {{ isFavorited ? '已收藏' : '收藏' }}
    </span>
    <span v-if="showCount && favoriteCount > 0" class="favorite-count">
      {{ favoriteCount }}
    </span>
  </button>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Heart, Loader2 } from 'lucide-vue-next'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'
import { useHistory } from '@/composables/useHistory'

interface Props {
  toolId: string
  toolName?: string
  iconSize?: number
  showText?: boolean
  showCount?: boolean
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  iconSize: 16,
  showText: true,
  showCount: false,
  variant: 'default',
  size: 'md'
})

const { user, isAuthenticated, apiRequest } = useAuth()
const { success, error } = useToast()
const { trackFavorite, trackUnfavorite } = useHistory()

// 响应式数据
const isFavorited = ref(false)
const isLoading = ref(false)
const favoriteCount = ref(0)

// 计算属性
const buttonClasses = computed(() => {
  const classes = ['favorite-btn']
  
  if (isFavorited.value) classes.push('favorite-btn--active')
  if (isLoading.value) classes.push('favorite-btn--loading')
  classes.push(`favorite-btn--${props.variant}`)
  classes.push(`favorite-btn--${props.size}`)
  
  return classes
})

// 方法
const checkFavoriteStatus = async () => {
  if (!isAuthenticated.value) return
  
  try {
    const response = await apiRequest(`/favorites/check/${props.toolId}`)
    
    if (response.success) {
      isFavorited.value = response.data.isFavorited
    }
  } catch (err) {
    console.error('检查收藏状态失败:', err)
  }
}

const toggleFavorite = async () => {
  if (!isAuthenticated.value) {
    error('请先登录后再收藏')
    return
  }
  
  if (isLoading.value) return
  
  try {
    isLoading.value = true
    
    if (isFavorited.value) {
      // 取消收藏
      await removeFavorite()
    } else {
      // 添加收藏
      await addFavorite()
    }
  } catch (err) {
    error('操作失败，请稍后重试')
  } finally {
    isLoading.value = false
  }
}

const addFavorite = async () => {
  try {
    const response = await apiRequest('/favorites', {
      method: 'POST',
      body: JSON.stringify({
        toolId: props.toolId
      })
    })
    
    if (response.success) {
      isFavorited.value = true
      favoriteCount.value++
      success(`已收藏 ${props.toolName || '工具'}`)
      
      // 追踪收藏行为
      trackFavorite(parseInt(props.toolId), props.toolName || '')
      
      // 触发收藏事件
      emit('favorited', {
        toolId: props.toolId,
        toolName: props.toolName
      })
    } else {
      error(response.error || '收藏失败')
    }
  } catch (err) {
    error('网络错误，请稍后重试')
  }
}

const removeFavorite = async () => {
  try {
    // 先获取收藏ID
    const checkResponse = await apiRequest(`/favorites/check/${props.toolId}`)
    
    if (!checkResponse.success || !checkResponse.data.favorite) {
      error('收藏记录不存在')
      return
    }
    
    const response = await apiRequest(`/favorites/${checkResponse.data.favorite.id}`, {
      method: 'DELETE'
    })
    
    if (response.success) {
      isFavorited.value = false
      favoriteCount.value = Math.max(0, favoriteCount.value - 1)
      success('已取消收藏')
      
      // 追踪取消收藏行为
      trackUnfavorite(parseInt(props.toolId), props.toolName || '')
      
      // 触发取消收藏事件
      emit('unfavorited', {
        toolId: props.toolId,
        toolName: props.toolName
      })
    } else {
      error(response.error || '取消收藏失败')
    }
  } catch (err) {
    error('网络错误，请稍后重试')
  }
}

// 事件
const emit = defineEmits<{
  favorited: [data: { toolId: string; toolName?: string }]
  unfavorited: [data: { toolId: string; toolName?: string }]
}>()

// 监听用户登录状态
watch(() => isAuthenticated.value, (newValue) => {
  if (newValue) {
    checkFavoriteStatus()
  } else {
    isFavorited.value = false
  }
})

// 监听工具ID变化
watch(() => props.toolId, () => {
  if (isAuthenticated.value) {
    checkFavoriteStatus()
  }
})

// 初始化
onMounted(() => {
  if (isAuthenticated.value) {
    checkFavoriteStatus()
  }
})
</script>

<style scoped>
.favorite-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background: none;
  position: relative;
  overflow: hidden;
}

.favorite-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.favorite-btn--default {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.favorite-btn--default:hover:not(:disabled) {
  background-color: var(--border-color);
}

.favorite-btn--outline {
  background-color: transparent;
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.favorite-btn--outline:hover:not(:disabled) {
  background-color: var(--bg-tertiary);
}

.favorite-btn--ghost {
  background-color: transparent;
  color: var(--text-secondary);
  border: none;
}

.favorite-btn--ghost:hover:not(:disabled) {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
}

.favorite-btn--active {
  background-color: var(--error-color);
  color: white;
  border-color: var(--error-color);
}

.favorite-btn--active:hover:not(:disabled) {
  background-color: #dc2626;
  border-color: #dc2626;
}

.favorite-btn--sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
  gap: 0.375rem;
}

.favorite-btn--md {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  gap: 0.5rem;
}

.favorite-btn--lg {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  gap: 0.75rem;
}

.favorite-icon {
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.favorite-icon--filled {
  fill: currentColor;
}

.favorite-icon--spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.favorite-text {
  white-space: nowrap;
}

.favorite-count {
  background-color: rgba(255, 255, 255, 0.2);
  color: inherit;
  padding: 0.125rem 0.375rem;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 600;
  min-width: 1.25rem;
  text-align: center;
}

.favorite-btn--ghost .favorite-count {
  background-color: var(--bg-tertiary);
  color: var(--text-secondary);
}

.favorite-btn--active .favorite-count {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
}

/* 加载状态 */
.favorite-btn--loading {
  pointer-events: none;
}

.favorite-btn--loading::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { left: -100%; }
  100% { left: 100%; }
}

/* 移动端优化 */
@media (max-width: 768px) {
  .favorite-btn--sm {
    padding: 0.25rem 0.5rem;
    font-size: 0.6875rem;
  }
  
  .favorite-btn--md {
    padding: 0.375rem 0.75rem;
    font-size: 0.8125rem;
  }
  
  .favorite-btn--lg {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  }
  
  .favorite-text {
    display: none;
  }
  
  .favorite-btn {
    min-width: 2.5rem;
    justify-content: center;
  }
}

/* 无障碍支持 */
@media (prefers-reduced-motion: reduce) {
  .favorite-icon--spinning {
    animation: none;
  }
  
  .favorite-btn--loading::before {
    animation: none;
  }
}

/* 高对比度模式 */
@media (prefers-contrast: high) {
  .favorite-btn {
    border-width: 2px;
  }
  
  .favorite-btn--active {
    border-color: currentColor;
  }
}
</style>