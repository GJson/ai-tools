<!-- genAI_main_start -->
<template>
  <div class="favorites-page">
    <!-- 头部导航 -->
    <header class="header">
      <div class="container">
        <div class="header-content">
          <button @click="goBack" class="back-btn" type="button">
            <ArrowLeft class="back-icon" />
            返回
          </button>
          <h1 class="page-title">我的收藏</h1>
          <div class="header-actions">
            <button @click="clearAllFavorites" class="clear-btn" v-if="favoriteTools.length > 0">
              <Trash2 class="clear-icon" :size="20" />
            </button>
          </div>
        </div>
      </div>
    </header>

    <div class="main-content">
      <div class="container">
        <!-- 收藏统计 -->
        <div v-if="isAuthenticated" class="stats-card">
          <div class="stat-item">
            <Heart class="stat-icon" :size="24" />
            <div class="stat-content">
              <div class="stat-value">{{ favoriteTools.length }}</div>
              <div class="stat-label">收藏工具</div>
            </div>
          </div>
          <div class="stat-item">
            <Grid class="stat-icon" :size="24" />
            <div class="stat-content">
              <div class="stat-value">{{ categoryStats.length }}</div>
              <div class="stat-label">涉及分类</div>
            </div>
          </div>
        </div>

        <!-- 收藏列表 -->
        <div v-if="favoriteTools.length > 0" class="favorites-grid">
          <div 
            v-for="tool in favoriteTools" 
            :key="tool.id"
            class="favorite-card"
            @click="navigateToTool(tool)"
          >
            <div class="tool-header">
              <div class="tool-icon">
                <component :is="tool.icon" class="tool-icon-svg" />
              </div>
              <div class="tool-info">
                <h3 class="tool-name">{{ tool.name }}</h3>
                <p class="tool-category">{{ getCategoryName(tool.category) }}</p>
              </div>
              <button 
                @click.stop="removeFavorite(tool.id)"
                class="remove-btn"
              >
                <X class="remove-icon" :size="16" />
              </button>
            </div>
            
            <p class="tool-description">{{ tool.shortDescription }}</p>
            
            <div class="tool-tags">
              <span 
                v-for="tag in tool.tags.slice(0, 3)" 
                :key="tag"
                class="tag"
              >
                {{ tag }}
              </span>
              <span v-if="tool.tags.length > 3" class="more-tags">
                +{{ tool.tags.length - 3 }}
              </span>
            </div>
            
            <div class="tool-footer">
              <div class="tool-rating">
                <Star class="star-icon" :size="14" />
                <span>{{ tool.rating || '4.5' }}</span>
              </div>
              <div class="tool-visits">
                <Eye class="visit-icon" :size="14" />
                <span>{{ tool.visitCount || '0' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="empty-state">
          <Heart class="empty-icon" :size="64" />
          <h3 class="empty-title">还没有收藏任何工具</h3>
          <p class="empty-description">发现喜欢的AI工具，点击收藏按钮保存起来</p>
          <router-link to="/" class="browse-btn">
            <Search class="browse-icon" :size="16" />
            去发现工具
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  ArrowLeft, 
  Trash2, 
  Heart, 
  Grid, 
  X, 
  Star, 
  Eye, 
  Search
} from 'lucide-vue-next'
import { useAuth } from '@/composables/useAuth'
import { useFavorites } from '@/composables/useFavorites'
import { useToast } from '@/composables/useToast'
import { categories } from '@/data/categories'
import { aiTools } from '@/data/tools'

const router = useRouter()
const { isAuthenticated } = useAuth()
const { favorites, getFavoriteTools, removeFavorite, clearAllFavorites: clearFavorites } = useFavorites()
const { success, error } = useToast()

// 计算属性
const favoriteTools = computed(() => getFavoriteTools(aiTools))

const categoryStats = computed(() => {
  const categories = new Set(favoriteTools.value.map(tool => tool.category))
  return Array.from(categories)
})

// 方法
const goBack = () => {
  router.push('/profile')
}

const getCategoryName = (categoryId: string) => {
  const category = categories.find(cat => cat.id === categoryId)
  return category?.name || categoryId
}

const navigateToTool = (tool: any) => {
  router.push({
    name: 'ToolDetail',
    params: { id: tool.id }
  })
}

const clearAllFavorites = async () => {
  if (confirm('确定要清空所有收藏吗？此操作不可撤销。')) {
    try {
      await clearFavorites()
      success('已清空所有收藏')
    } catch (err) {
      error('清空收藏失败')
    }
  }
}

onMounted(() => {
  if (!isAuthenticated.value) {
    router.push('/login')
  }
})
</script>

<style scoped>
.favorites-page {
  min-height: 100vh;
  background-color: var(--bg-secondary);
}

.header {
  background-color: var(--bg-primary);
  border-bottom: 1px solid var(--border-color);
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: none;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background-color: var(--bg-tertiary);
  border-color: var(--border-hover);
}

.back-icon {
  width: 16px;
  height: 16px;
}

.page-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.clear-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: none;
  color: var(--text-muted);
  cursor: pointer;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.clear-btn:hover {
  background-color: var(--error-color);
  color: white;
}

.clear-icon {
  width: 20px;
  height: 20px;
}

.main-content {
  padding: 2rem 0;
}

.stats-card {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  margin-bottom: 2rem;
  display: flex;
  gap: 2rem;
  box-shadow: var(--shadow-sm);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.favorite-card {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-sm);
}

.favorite-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--primary-color);
}

.tool-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.tool-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.tool-icon-svg {
  width: 24px;
  height: 24px;
  color: white;
}

.tool-info {
  flex: 1;
  min-width: 0;
}

.tool-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tool-category {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
}

.remove-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  color: var(--text-muted);
  cursor: pointer;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.remove-btn:hover {
  background-color: var(--error-color);
  color: white;
}

.remove-icon {
  width: 16px;
  height: 16px;
}

.tool-description {
  color: var(--text-secondary);
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0 0 1rem 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.tool-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tag {
  padding: 0.25rem 0.5rem;
  background-color: var(--bg-tertiary);
  color: var(--text-secondary);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  border: 1px solid var(--border-color);
}

.more-tags {
  padding: 0.25rem 0.5rem;
  background-color: var(--primary-color);
  color: white;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
}

.tool-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.tool-rating,
.tool-visits {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--text-muted);
  font-size: 0.875rem;
}

.star-icon,
.visit-icon {
  width: 14px;
  height: 14px;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-muted);
}

.empty-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 1.5rem;
  color: var(--border-color);
}

.empty-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.empty-description {
  font-size: 0.875rem;
  margin: 0 0 2rem 0;
  line-height: 1.5;
}

.browse-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: var(--primary-color);
  color: white;
  text-decoration: none;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.browse-btn:hover {
  background-color: var(--primary-hover);
  transform: translateY(-1px);
}

.browse-icon {
  width: 16px;
  height: 16px;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .main-content {
    padding: 1rem 0;
  }
  
  .stats-card {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }
  
  .favorites-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .favorite-card {
    padding: 1rem;
  }
  
  .tool-header {
    gap: 0.75rem;
  }
  
  .tool-icon {
    width: 40px;
    height: 40px;
  }
  
  .tool-icon-svg {
    width: 20px;
    height: 20px;
  }
}
</style>
<!-- genAI_main_end -->