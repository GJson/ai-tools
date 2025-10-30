<!-- genAI_main_start -->
<template>
  <div class="history-page">
    <!-- 头部导航 -->
    <header class="header">
      <div class="container">
        <div class="header-content">
          <button @click="goBack" class="back-btn" type="button">
            <ArrowLeft class="back-icon" />
            返回
          </button>
          <h1 class="page-title">使用历史</h1>
          <div class="header-actions">
            <button @click="clearAllHistory" class="clear-btn" v-if="historyItems.length > 0">
              <Trash2 class="clear-icon" :size="20" />
            </button>
          </div>
        </div>
      </div>
    </header>

    <div class="main-content">
      <div class="container">
        <!-- 历史统计 -->
        <div v-if="isAuthenticated" class="stats-card">
          <div class="stat-item">
            <History class="stat-icon" :size="24" />
            <div class="stat-content">
              <div class="stat-value">{{ visitStats.totalVisits }}</div>
              <div class="stat-label">总访问次数</div>
            </div>
          </div>
          <div class="stat-item">
            <Eye class="stat-icon" :size="24" />
            <div class="stat-content">
              <div class="stat-value">{{ visitStats.uniqueTools }}</div>
              <div class="stat-label">使用工具数</div>
            </div>
          </div>
          <div class="stat-item">
            <TrendingUp class="stat-icon" :size="24" />
            <div class="stat-content">
              <div class="stat-value">{{ mostUsedTool?.name || '无' }}</div>
              <div class="stat-label">最常用工具</div>
            </div>
          </div>
        </div>

        <!-- 筛选器 -->
        <div v-if="historyItems.length > 0" class="filters">
          <div class="filter-group">
            <label class="filter-label">时间范围：</label>
            <select v-model="timeFilter" class="filter-select">
              <option value="all">全部时间</option>
              <option value="today">今天</option>
              <option value="week">本周</option>
              <option value="month">本月</option>
            </select>
          </div>
          <div class="filter-group">
            <label class="filter-label">排序方式：</label>
            <select v-model="sortBy" class="filter-select">
              <option value="recent">最近访问</option>
              <option value="frequent">访问频率</option>
              <option value="name">工具名称</option>
            </select>
          </div>
        </div>

        <!-- 历史列表 -->
        <div v-if="filteredHistory.length > 0" class="history-list">
          <div 
            v-for="item in filteredHistory" 
            :key="item.toolId"
            class="history-item"
            @click="navigateToTool(item.toolId)"
          >
            <div class="tool-icon">
              <component :is="getToolIcon(item.toolId)" class="tool-icon-svg" />
            </div>
            
            <div class="tool-info">
              <h3 class="tool-name">{{ item.toolName }}</h3>
              <p class="tool-category">{{ getCategoryName(item.toolCategory) }}</p>
              <div class="tool-meta">
                <span class="visit-time">{{ formatRelativeTime(item.visitedAt) }}</span>
                <span class="visit-count">
                  <Eye class="visit-icon" :size="12" />
                  {{ item.visitCount }}次
                </span>
              </div>
            </div>
            
            <div class="tool-actions">
              <button 
                @click.stop="removeFromHistory(item.toolId)"
                class="remove-btn"
                title="从历史记录中移除"
              >
                <X class="remove-icon" :size="16" />
              </button>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="empty-state">
          <History class="empty-icon" :size="64" />
          <h3 class="empty-title">还没有使用记录</h3>
          <p class="empty-description">开始使用AI工具，这里会记录您的使用历史</p>
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
  History, 
  Eye, 
  TrendingUp, 
  X, 
  Search
} from 'lucide-vue-next'
import { useAuth } from '@/composables/useAuth'
import { useHistory } from '@/composables/useHistory'
import { useToast } from '@/composables/useToast'
import { categories } from '@/data/categories'
import { aiTools } from '@/data/tools'

const router = useRouter()
const { isAuthenticated } = useAuth()
const { 
  getRecentTools, 
  getVisitStats, 
  clearAllHistory: clearHistory,
  removeFromHistory: removeHistoryItem
} = useHistory()
const { success, error } = useToast()

// 响应式数据
const timeFilter = ref('all')
const sortBy = ref('recent')

// 计算属性
const historyItems = computed(() => getRecentTools(100)) // 获取最近100条记录
const visitStats = computed(() => getVisitStats())

const mostUsedTool = computed(() => {
  if (historyItems.value.length === 0) return null
  
  const toolCounts = historyItems.value.reduce((acc, item) => {
    acc[item.toolId] = (acc[item.toolId] || 0) + item.visitCount
    return acc
  }, {} as Record<string, number>)
  
  const mostUsedId = Object.entries(toolCounts).reduce((a, b) => 
    toolCounts[a[0]] > toolCounts[b[0]] ? a : b
  )[0]
  
  return aiTools.find(tool => tool.id === mostUsedId)
})

const filteredHistory = computed(() => {
  let filtered = [...historyItems.value]
  
  // 时间筛选
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
  
  switch (timeFilter.value) {
    case 'today':
      filtered = filtered.filter(item => new Date(item.visitedAt) >= today)
      break
    case 'week':
      filtered = filtered.filter(item => new Date(item.visitedAt) >= weekAgo)
      break
    case 'month':
      filtered = filtered.filter(item => new Date(item.visitedAt) >= monthAgo)
      break
  }
  
  // 排序
  switch (sortBy.value) {
    case 'recent':
      filtered.sort((a, b) => new Date(b.visitedAt).getTime() - new Date(a.visitedAt).getTime())
      break
    case 'frequent':
      filtered.sort((a, b) => b.visitCount - a.visitCount)
      break
    case 'name':
      filtered.sort((a, b) => a.toolName.localeCompare(b.toolName))
      break
  }
  
  return filtered
})

// 方法
const goBack = () => {
  router.push('/profile')
}

const getCategoryName = (categoryId: string) => {
  const category = categories.find(cat => cat.id === categoryId)
  return category?.name || categoryId
}

const getToolIcon = (toolId: string) => {
  const tool = aiTools.find(t => t.id === toolId)
  return tool?.icon || 'Bot'
}

const navigateToTool = (toolId: string) => {
  router.push({
    name: 'ToolDetail',
    params: { id: toolId }
  })
}

const formatRelativeTime = (dateString: string) => {
  const now = new Date()
  const date = new Date(dateString)
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
  
  if (diffInMinutes < 1) return '刚刚'
  if (diffInMinutes < 60) return `${diffInMinutes}分钟前`
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}小时前`
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays}天前`
  
  return date.toLocaleDateString('zh-CN')
}

const clearAllHistory = async () => {
  if (confirm('确定要清空所有使用历史吗？此操作不可撤销。')) {
    try {
      await clearHistory()
      success('已清空所有使用历史')
    } catch (err) {
      error('清空历史失败')
    }
  }
}

const removeFromHistory = async (toolId: string) => {
  try {
    await removeHistoryItem(toolId)
    success('已从历史记录中移除')
  } catch (err) {
    error('移除失败')
  }
}

onMounted(() => {
  if (!isAuthenticated.value) {
    router.push('/login')
  }
})
</script>

<style scoped>
.history-page {
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
  flex: 1;
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

.filters {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  margin-bottom: 2rem;
  display: flex;
  gap: 2rem;
  box-shadow: var(--shadow-sm);
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.filter-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
}

.filter-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.875rem;
  cursor: pointer;
  min-width: 120px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.history-item {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: var(--shadow-sm);
}

.history-item:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
  border-color: var(--primary-color);
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
  margin: 0 0 0.5rem 0;
}

.tool-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.visit-time {
  font-size: 0.8125rem;
  color: var(--text-muted);
}

.visit-count {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.8125rem;
  color: var(--text-muted);
}

.visit-icon {
  width: 12px;
  height: 12px;
}

.tool-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
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
  
  .filters {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }
  
  .filter-group {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .filter-select {
    width: 100%;
  }
  
  .history-item {
    padding: 1rem;
    flex-direction: column;
    align-items: flex-start;
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
  
  .tool-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
  
  .tool-actions {
    align-self: flex-end;
  }
}
</style>
<!-- genAI_main_end -->