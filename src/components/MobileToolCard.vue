<template>
  <div class="mobile-tool-card" @click="handleClick">
    <div class="card-header">
      <div class="tool-icon">
        <component :is="getToolIcon(tool.category)" class="icon" :size="20" />
      </div>
      <div class="tool-meta">
        <div class="tool-name">{{ tool.name }}</div>
        <div class="tool-category">{{ tool.category }}</div>
      </div>
      <div class="tool-actions">
        <button 
          v-if="isAuthenticated"
          @click.stop="toggleFavorite"
          class="action-btn favorite-btn"
          :class="{ active: isFavorited }"
        >
          <Heart class="action-icon" :size="16" :fill="isFavorited ? 'currentColor' : 'none'" />
        </button>
        <button @click.stop="handleShare" class="action-btn share-btn">
          <Share class="action-icon" :size="16" />
        </button>
      </div>
    </div>
    
    <div class="card-content">
      <p class="tool-description">{{ tool.shortDescription }}</p>
      
      <div class="tool-tags">
        <span 
          v-for="tag in tool.tags.slice(0, 3)" 
          :key="tag"
          class="tag"
        >
          {{ tag }}
        </span>
        <span v-if="tool.tags.length > 3" class="tag more">
          +{{ tool.tags.length - 3 }}
        </span>
      </div>
      
      <div class="tool-stats">
        <div class="stat">
          <Star class="stat-icon" :size="14" />
          <span class="stat-value">{{ tool.averageRating?.toFixed(1) || '0.0' }}</span>
          <span class="stat-label">({{ tool.ratingCount || 0 }})</span>
        </div>
        <div class="stat">
          <Heart class="stat-icon" :size="14" />
          <span class="stat-value">{{ tool.favoriteCount || 0 }}</span>
        </div>
        <div class="stat">
          <Eye class="stat-icon" :size="14" />
          <span class="stat-value">{{ formatNumber(tool.viewCount || 0) }}</span>
        </div>
      </div>
    </div>
    
    <div class="card-footer">
      <div class="pricing-info">
        <span 
          class="pricing-badge"
          :class="getPricingClass(tool.pricing)"
        >
          {{ getPricingText(tool.pricing) }}
        </span>
        <span v-if="tool.isNew" class="new-badge">新</span>
      </div>
      
      <button class="visit-btn">
        <ExternalLink class="btn-icon" :size="14" />
        访问
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Heart, 
  Share, 
  Star, 
  Eye, 
  ExternalLink,
  Bot,
  Image,
  Video,
  Code,
  Palette,
  Music,
  FileText,
  Briefcase,
  GraduationCap,
  Cpu,
  MessageCircle,
  Layers,
  Award,
  Shield,
  ShoppingCart,
  Smartphone,
  Scissors,
  Mic,
  Volume2,
  Globe
} from 'lucide-vue-next'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'

interface Tool {
  id: string
  name: string
  shortDescription: string
  category: string
  tags: string[]
  pricing: string
  averageRating?: number
  ratingCount?: number
  favoriteCount?: number
  viewCount?: number
  isNew?: boolean
  url?: string
}

const props = defineProps<{
  tool: Tool
}>()

const emit = defineEmits<{
  click: [tool: Tool]
  favorite: [tool: Tool, favorited: boolean]
  share: [tool: Tool]
}>()

const router = useRouter()
const { isAuthenticated } = useAuth()
const { success } = useToast()

// 响应式数据
const isFavorited = ref(false)

// 方法
const handleClick = () => {
  emit('click', props.tool)
  router.push({
    name: 'ToolDetail',
    params: { id: props.tool.id }
  })
}

const toggleFavorite = () => {
  isFavorited.value = !isFavorited.value
  emit('favorite', props.tool, isFavorited.value)
  
  if (isFavorited.value) {
    success(`${props.tool.name} 已添加到收藏`)
  } else {
    success(`${props.tool.name} 已从收藏中移除`)
  }
}

const handleShare = () => {
  emit('share', props.tool)
  
  if (navigator.share) {
    navigator.share({
      title: props.tool.name,
      text: props.tool.shortDescription,
      url: window.location.origin + `/tool/${props.tool.id}`
    }).catch(console.error)
  } else {
    // 降级到复制链接
    const url = window.location.origin + `/tool/${props.tool.id}`
    navigator.clipboard.writeText(url).then(() => {
      success('链接已复制到剪贴板')
    }).catch(() => {
      success('分享功能暂不可用')
    })
  }
}

const getToolIcon = (category: string) => {
  const iconMap: Record<string, any> = {
    'AI聊天': Bot,
    'AI绘画': Image,
    'AI视频': Video,
    'AI编程': Code,
    'AI设计': Palette,
    'AI音乐': Music,
    'AI写作': FileText,
    'AI办公': Briefcase,
    'AI学习': GraduationCap,
    'AI模型': Cpu,
    'AI社区': MessageCircle,
    'AI工具': Layers,
    'AI奖项': Award,
    'AI安全': Shield,
    'AI购物': ShoppingCart,
    'AI移动': Smartphone,
    'AI剪辑': Scissors,
    'AI语音': Mic,
    'AI音频': Volume2,
    'AI网站': Globe
  }
  return iconMap[category] || Bot
}

const getPricingClass = (pricing: string) => {
  const pricingMap: Record<string, string> = {
    '免费': 'free',
    '免费试用': 'trial',
    '付费': 'paid',
    '订阅': 'subscription',
    '开源': 'open-source'
  }
  return pricingMap[pricing] || 'unknown'
}

const getPricingText = (pricing: string) => {
  return pricing || '未知'
}

const formatNumber = (num: number) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}
</script>

<style scoped>
.mobile-tool-card {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1rem;
  margin-bottom: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.mobile-tool-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--primary-color);
}

.mobile-tool-card:active {
  transform: translateY(0);
}

.card-header {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.tool-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.tool-meta {
  flex: 1;
  min-width: 0;
}

.tool-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.tool-category {
  font-size: 0.75rem;
  color: var(--text-muted);
  background-color: var(--bg-tertiary);
  padding: 0.125rem 0.5rem;
  border-radius: var(--radius-sm);
  display: inline-block;
}

.tool-actions {
  display: flex;
  gap: 0.25rem;
  flex-shrink: 0;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: var(--bg-tertiary);
  color: var(--text-muted);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: var(--border-color);
  color: var(--text-primary);
}

.favorite-btn.active {
  background: var(--error-color);
  color: white;
}

.favorite-btn.active:hover {
  background: #dc2626;
}

.action-icon {
  width: 16px;
  height: 16px;
}

.card-content {
  margin-bottom: 0.75rem;
}

.tool-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.4;
  margin-bottom: 0.75rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.tool-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin-bottom: 0.75rem;
}

.tag {
  font-size: 0.6875rem;
  color: var(--text-muted);
  background-color: var(--bg-tertiary);
  padding: 0.125rem 0.375rem;
  border-radius: var(--radius-sm);
  white-space: nowrap;
}

.tag.more {
  background-color: var(--primary-color);
  color: white;
}

.tool-stats {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.stat-icon {
  width: 14px;
  height: 14px;
}

.stat-value {
  font-weight: 500;
  color: var(--text-primary);
}

.stat-label {
  color: var(--text-muted);
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border-color);
}

.pricing-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pricing-badge {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
}

.pricing-badge.free {
  background-color: var(--success-color);
  color: white;
}

.pricing-badge.trial {
  background-color: var(--warning-color);
  color: white;
}

.pricing-badge.paid {
  background-color: var(--primary-color);
  color: white;
}

.pricing-badge.subscription {
  background-color: var(--info-color);
  color: white;
}

.pricing-badge.open-source {
  background-color: var(--text-muted);
  color: white;
}

.pricing-badge.unknown {
  background-color: var(--bg-tertiary);
  color: var(--text-muted);
}

.new-badge {
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--error-color);
  background-color: rgba(239, 68, 68, 0.1);
  padding: 0.125rem 0.375rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--error-color);
}

.visit-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.visit-btn:hover {
  background: var(--primary-hover);
  transform: translateY(-1px);
}

.visit-btn:active {
  transform: translateY(0);
}

.btn-icon {
  width: 14px;
  height: 14px;
}

/* 触摸优化 */
@media (hover: none) and (pointer: coarse) {
  .mobile-tool-card {
    min-height: 120px; /* 确保足够的触摸区域 */
  }
  
  .action-btn {
    min-width: 44px;
    min-height: 44px;
  }
  
  .visit-btn {
    min-height: 44px;
    padding: 0.75rem 1rem;
  }
}

/* 小屏幕优化 */
@media (max-width: 480px) {
  .mobile-tool-card {
    padding: 0.75rem;
    margin-bottom: 0.5rem;
  }
  
  .tool-name {
    font-size: 0.875rem;
  }
  
  .tool-description {
    font-size: 0.8125rem;
  }
  
  .tool-stats {
    gap: 0.75rem;
  }
  
  .stat {
    font-size: 0.6875rem;
  }
  
  .visit-btn {
    font-size: 0.6875rem;
    padding: 0.5rem 0.625rem;
  }
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .mobile-tool-card {
    background-color: var(--bg-primary);
    border-color: var(--border-color);
  }
  
  .tool-icon {
    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  }
}

/* 高对比度模式 */
@media (prefers-contrast: high) {
  .mobile-tool-card {
    border-width: 2px;
  }
  
  .action-btn {
    border: 1px solid var(--border-color);
  }
  
  .visit-btn {
    border: 2px solid var(--primary-color);
  }
}

/* 减少动画模式 */
@media (prefers-reduced-motion: reduce) {
  .mobile-tool-card,
  .action-btn,
  .visit-btn {
    transition: none;
  }
  
  .mobile-tool-card:hover {
    transform: none;
  }
}
</style>