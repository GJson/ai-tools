<template>
  <div 
    class="enhanced-tool-card" 
    :class="{ 'enhanced-tool-card--loading': loading }"
    @click="handleClick"
  >
    <!-- 加载状态 -->
    <div v-if="loading" class="card-loading">
      <SkeletonCard />
    </div>
    
    <!-- 正常状态 -->
    <template v-else>
      <div class="tool-header">
        <div class="tool-icon">
          <component :is="tool.icon" class="tool-icon-svg" />
        </div>
        <div class="tool-badges">
          <span v-if="tool.isFree" class="badge badge--free">免费</span>
          <span v-if="tool.isPopular" class="badge badge--popular">热门</span>
          <span v-if="tool.isFeatured" class="badge badge--featured">推荐</span>
        </div>
        <button 
          v-if="showFavorite" 
          @click.stop="toggleFavorite"
          class="favorite-btn"
          :class="{ 'favorite-btn--active': isFavorited }"
        >
          <Heart v-if="isFavorited" class="favorite-icon" :size="16" />
          <Heart v-else class="favorite-icon" :size="16" />
        </button>
      </div>
      
      <div class="tool-content">
        <h3 class="tool-name">{{ tool.name }}</h3>
        <p class="tool-description">{{ tool.description }}</p>
        
        <div class="tool-features">
          <span 
            v-for="feature in tool.features.slice(0, 3)" 
            :key="feature"
            class="feature-tag"
          >
            {{ feature }}
          </span>
        </div>
        
        <div class="tool-meta">
          <div class="rating">
            <Star class="star-icon" :size="14" />
            <span>{{ tool.rating }}</span>
          </div>
          <div v-if="tool.userCount" class="user-count">
            <Users class="users-icon" :size="14" />
            <span>{{ tool.userCount }}</span>
          </div>
          <div class="category">
            <Tag class="category-icon" :size="14" />
            <span>{{ getCategoryName(tool.category) }}</span>
          </div>
        </div>
        
        <div class="tool-tags">
          <span 
            v-for="tag in tool.tags.slice(0, 4)" 
            :key="tag"
            class="tag"
          >
            {{ tag }}
          </span>
        </div>
      </div>
      
      <!-- 悬停操作 -->
      <div class="tool-actions">
        <button @click.stop="visitTool" class="action-btn action-btn--primary">
          访问工具
        </button>
        <button @click.stop="shareTool" class="action-btn action-btn--secondary">
          分享
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Heart, Star, Users, Tag } from 'lucide-vue-next'
import { categories } from '@/data/categories'
import SkeletonCard from './SkeletonCard.vue'
import type { AITool } from '@/types'

interface Props {
  tool: AITool
  loading?: boolean
  showFavorite?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  showFavorite: true
})

const emit = defineEmits<{
  click: [tool: AITool]
  favorite: [tool: AITool, favorited: boolean]
  share: [tool: AITool]
}>()

const router = useRouter()

// 收藏状态
const isFavorited = ref(false)

const getCategoryName = (categoryId: string) => {
  const category = categories.find(cat => cat.id === categoryId)
  return category?.name || categoryId
}

const handleClick = () => {
  if (!props.loading) {
    emit('click', props.tool)
    router.push({
      name: 'ToolDetail',
      params: { id: props.tool.id }
    })
  }
}

const toggleFavorite = () => {
  isFavorited.value = !isFavorited.value
  emit('favorite', props.tool, isFavorited.value)
}

const visitTool = () => {
  if (props.tool.url) {
    window.open(props.tool.url, '_blank')
  }
}

const shareTool = () => {
  emit('share', props.tool)
  // 简单的分享功能
  if (navigator.share) {
    navigator.share({
      title: props.tool.name,
      text: props.tool.description,
      url: props.tool.url || window.location.href
    })
  } else {
    // 降级到复制链接
    navigator.clipboard.writeText(props.tool.url || window.location.href)
  }
}
</script>

<style scoped>
.enhanced-tool-card {
  position: relative;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
}

.enhanced-tool-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--primary-color);
}

.enhanced-tool-card--loading {
  cursor: default;
}

.enhanced-tool-card--loading:hover {
  transform: none;
  box-shadow: var(--shadow-sm);
  border-color: var(--border-color);
}

.card-loading {
  pointer-events: none;
}

.tool-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  position: relative;
}

.tool-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  transition: transform 0.2s ease;
}

.enhanced-tool-card:hover .tool-icon {
  transform: scale(1.1);
}

.tool-icon-svg {
  width: 24px;
  height: 24px;
  color: white;
}

.tool-badges {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.badge {
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.badge--free {
  background-color: var(--success-color);
  color: white;
}

.badge--popular {
  background-color: var(--warning-color);
  color: white;
}

.badge--featured {
  background-color: var(--primary-color);
  color: white;
}

.favorite-btn {
  position: absolute;
  top: 0;
  right: 0;
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  cursor: pointer;
  color: var(--text-muted);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.favorite-btn:hover {
  background-color: var(--bg-tertiary);
  color: var(--error-color);
}

.favorite-btn--active {
  color: var(--error-color);
}

.favorite-icon {
  transition: transform 0.2s ease;
}

.favorite-btn:hover .favorite-icon {
  transform: scale(1.1);
}

.tool-content {
  margin-bottom: 1rem;
}

.tool-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.tool-description {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin-bottom: 1rem;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.tool-features {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.feature-tag {
  background-color: var(--bg-tertiary);
  color: var(--text-secondary);
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 500;
}

.tool-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.rating,
.user-count,
.category {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.star-icon {
  color: var(--warning-color);
}

.tool-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  background-color: var(--bg-tertiary);
  color: var(--text-muted);
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
}

.tool-actions {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: var(--bg-primary);
  border-top: 1px solid var(--border-color);
  padding: 1rem 1.5rem;
  display: flex;
  gap: 0.75rem;
  opacity: 0;
  transform: translateY(100%);
  transition: all 0.3s ease;
}

.enhanced-tool-card:hover .tool-actions {
  opacity: 1;
  transform: translateY(0);
}

.action-btn {
  flex: 1;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn--primary {
  background-color: var(--primary-color);
  color: white;
}

.action-btn--primary:hover {
  background-color: var(--primary-hover);
  transform: translateY(-1px);
}

.action-btn--secondary {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.action-btn--secondary:hover {
  background-color: var(--border-color);
  transform: translateY(-1px);
}

/* 移动端优化 */
@media (max-width: 768px) {
  .enhanced-tool-card {
    padding: 1rem;
  }
  
  .tool-icon {
    width: 40px;
    height: 40px;
  }
  
  .tool-icon-svg {
    width: 20px;
    height: 20px;
  }
  
  .tool-name {
    font-size: 1rem;
  }
  
  .tool-description {
    font-size: 0.8125rem;
  }
  
  .feature-tag {
    font-size: 0.6875rem;
    padding: 0.1875rem 0.375rem;
  }
  
  .rating,
  .user-count,
  .category {
    font-size: 0.8125rem;
  }
  
  .tag {
    font-size: 0.6875rem;
    padding: 0.1875rem 0.375rem;
  }
  
  .tool-actions {
    padding: 0.75rem 1rem;
    position: static;
    opacity: 1;
    transform: none;
    margin-top: 1rem;
  }
  
  .action-btn {
    padding: 0.75rem 1rem;
    font-size: 0.8125rem;
  }
}
</style>
