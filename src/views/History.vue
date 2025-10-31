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
            <button @click="exportHistory" class="action-btn">
              <Download class="btn-icon" :size="16" />
              导出
            </button>
            <button @click="showClearModal = true" class="action-btn">
              <Trash2 class="btn-icon" :size="16" />
              清除
            </button>
          </div>
        </div>
      </div>
    </header>

    <div class="main-content">
      <div class="container">
        <!-- 页面描述 -->
        <div class="page-description">
          <p>查看您的浏览和操作记录</p>
        </div>

      <!-- 统计概览 -->
      <div v-if="stats" class="stats-section">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">
              <Activity class="icon" :size="20" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.totalActions }}</div>
              <div class="stat-label">总操作数</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <Calendar class="icon" :size="20" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.activeDays }}</div>
              <div class="stat-label">活跃天数</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <Eye class="icon" :size="20" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.viewCount }}</div>
              <div class="stat-label">浏览次数</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <Search class="icon" :size="20" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.searchCount }}</div>
              <div class="stat-label">搜索次数</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 筛选和排序 -->
      <div class="filters-section">
        <div class="filters-row">
          <div class="filter-group">
            <label class="filter-label">行为类型</label>
            <select v-model="filters.action" @change="loadHistory" class="filter-select">
              <option value="">全部行为</option>
              <option value="view">浏览</option>
              <option value="search">搜索</option>
              <option value="favorite">收藏</option>
              <option value="rating">评分</option>
              <option value="comment">评论</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label class="filter-label">目标类型</label>
            <select v-model="filters.targetType" @change="loadHistory" class="filter-select">
              <option value="">全部类型</option>
              <option value="tool">工具</option>
              <option value="page">页面</option>
              <option value="search">搜索</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label class="filter-label">时间范围</label>
            <select v-model="filters.period" @change="loadHistory" class="filter-select">
              <option value="7">最近7天</option>
              <option value="30">最近30天</option>
              <option value="90">最近90天</option>
              <option value="365">最近一年</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 图表区域 -->
      <div v-if="stats && stats.dailyActivity.length > 0" class="chart-section">
        <h2 class="section-title">活动趋势</h2>
        <div class="chart-container">
          <div class="chart-placeholder">
            <BarChart3 class="chart-icon" :size="48" />
            <p class="chart-text">活动趋势图表</p>
            <p class="chart-description">显示您最近{{ filters.period }}天的使用情况</p>
          </div>
        </div>
      </div>

      <!-- 热门工具 -->
      <div v-if="stats && stats.topTools.length > 0" class="top-tools-section">
        <h2 class="section-title">最常访问的工具</h2>
        <div class="top-tools-grid">
          <div
            v-for="tool in stats.topTools"
            :key="tool.targetId"
            class="tool-card"
            @click="viewTool(tool.targetId)"
          >
            <div class="tool-logo">
              <img v-if="tool.toolLogo" :src="tool.toolLogo" :alt="tool.toolName" />
              <div v-else class="logo-placeholder">
                {{ tool.toolName?.charAt(0) || 'T' }}
              </div>
            </div>
            <div class="tool-info">
              <h3 class="tool-name">{{ tool.toolName }}</h3>
              <p class="tool-category">{{ tool.toolCategory }}</p>
              <div class="tool-stats">
                <span class="visit-count">{{ tool.visitCount }} 次访问</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 热门搜索 -->
      <div v-if="stats && stats.topSearches.length > 0" class="top-searches-section">
        <h2 class="section-title">热门搜索</h2>
        <div class="search-tags">
          <span
            v-for="search in stats.topSearches"
            :key="search.searchQuery"
            class="search-tag"
            @click="searchQuery(search.searchQuery)"
          >
            {{ search.searchQuery }}
            <span class="search-count">({{ search.searchCount }})</span>
          </span>
        </div>
      </div>

      <!-- 历史记录列表 -->
      <div class="history-section">
        <div class="section-header">
          <h2 class="section-title">历史记录</h2>
          <div class="section-actions">
            <button @click="loadHistory" class="btn btn-outline">
              <RefreshCw class="btn-icon" :size="16" />
              刷新
            </button>
          </div>
        </div>

        <!-- 加载状态 -->
        <div v-if="isLoading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>加载中...</p>
        </div>

        <!-- 空状态 -->
        <div v-else-if="history.length === 0" class="empty-state">
          <div class="empty-icon">
            <History class="icon" :size="48" />
          </div>
          <h3 class="empty-title">暂无历史记录</h3>
          <p class="empty-description">开始使用AI工具，您的操作记录将显示在这里</p>
          <button @click="$router.push('/')" class="btn btn-primary">
            <Search class="btn-icon" :size="16" />
            去发现工具
          </button>
        </div>

        <!-- 历史记录列表 -->
        <div v-else class="history-container">
          <div class="history-list">
            <div
              v-for="item in history"
              :key="item.id"
              class="history-item"
            >
              <div class="history-icon">
                <component :is="getActionIcon(item.action)" class="icon" :size="20" />
              </div>
              
              <div class="history-content">
                <div class="history-header">
                  <h3 class="history-title">{{ getActionTitle(item) }}</h3>
                  <span class="history-time">{{ formatTime(item.createdAt) }}</span>
                </div>
                
                <div class="history-details">
                  <p class="history-description">{{ getActionDescription(item) }}</p>
                  
                  <div v-if="item.metadata" class="history-metadata">
                    <div v-if="item.action === 'search' && item.metadata.query" class="metadata-item">
                      <Search class="metadata-icon" :size="14" />
                      <span>搜索: "{{ item.metadata.query }}"</span>
                    </div>
                    <div v-if="item.action === 'rating' && item.metadata.rating" class="metadata-item">
                      <Star class="metadata-icon" :size="14" />
                      <span>评分: {{ item.metadata.rating }}星</span>
                    </div>
                    <div v-if="item.action === 'comment' && item.metadata.commentLength" class="metadata-item">
                      <MessageSquare class="metadata-icon" :size="14" />
                      <span>评论长度: {{ item.metadata.commentLength }}字符</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="history-actions">
                <button v-if="item.targetType === 'tool'" @click="viewTool(item.targetId)" class="action-btn">
                  <ExternalLink class="btn-icon" :size="14" />
                </button>
                <button @click="removeHistoryItem(item)" class="action-btn delete">
                  <Trash2 class="btn-icon" :size="14" />
                </button>
              </div>
            </div>
          </div>
          
          <!-- 加载更多 -->
          <div v-if="hasMore" class="load-more">
            <button @click="loadMore" :disabled="isLoadingMore" class="btn btn-outline">
              <RefreshCw class="btn-icon" :size="16" :class="{ spinning: isLoadingMore }" />
              {{ isLoadingMore ? '加载中...' : '加载更多' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    </div>

    <!-- 清除历史模态框 -->
    <Modal v-model:visible="showClearModal" title="清除历史记录" size="md">
      <div class="clear-history-form">
        <div class="form-group">
          <label class="form-label">清除范围</label>
          <select v-model="clearOptions.action" class="form-select">
            <option value="">全部行为</option>
            <option value="view">浏览记录</option>
            <option value="search">搜索记录</option>
            <option value="favorite">收藏记录</option>
            <option value="rating">评分记录</option>
            <option value="comment">评论记录</option>
          </select>
        </div>
        
        <div class="form-group">
          <label class="form-label">时间范围</label>
          <select v-model="clearOptions.beforeDate" class="form-select">
            <option value="">全部时间</option>
            <option value="7">7天前</option>
            <option value="30">30天前</option>
            <option value="90">90天前</option>
          </select>
        </div>
        
        <div class="warning-message">
          <AlertTriangle class="warning-icon" :size="16" />
          <p>此操作不可撤销，确定要清除选中的历史记录吗？</p>
        </div>
      </div>
      
      <template #footer>
        <button @click="showClearModal = false" class="btn btn-outline">取消</button>
        <button @click="clearHistory" class="btn btn-danger" :disabled="!clearOptions.action && !clearOptions.beforeDate">
          清除
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { 
  ArrowLeft,
  Download, 
  Trash2, 
  Activity, 
  Calendar, 
  Eye, 
  Search, 
  BarChart3, 
  History, 
  RefreshCw, 
  ExternalLink, 
  Star, 
  MessageSquare, 
  AlertTriangle,
  Heart,
  ThumbsUp,
  FileText
} from 'lucide-vue-next'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'
import Modal from '@/components/Modal.vue'

const router = useRouter()
const { user, isAuthenticated, apiRequest } = useAuth()
const { success, error } = useToast()

// 响应式数据
const history = ref<any[]>([])
const stats = ref<any>(null)
const isLoading = ref(false)
const isLoadingMore = ref(false)
const hasMore = ref(true)
const offset = ref(0)

// 筛选条件
const filters = ref({
  action: '',
  targetType: '',
  period: '30'
})

// 模态框状态
const showClearModal = ref(false)
const clearOptions = ref({
  action: '',
  beforeDate: ''
})

// 方法
const goBack = () => {
  router.push('/')
}

const loadHistory = async (reset = true) => {
  if (!isAuthenticated.value) return
  
  try {
    isLoading.value = true
    if (reset) {
      offset.value = 0
      history.value = []
    }
    
    const params = new URLSearchParams({
      offset: offset.value.toString(),
      limit: '50',
      ...filters.value
    })
    
    const response = await apiRequest(`/history?${params}`)
    
    if (response.success) {
      if (reset) {
        history.value = response.data.history
      } else {
        history.value.push(...response.data.history)
      }
      
      hasMore.value = response.data.history.length === 50
      offset.value += response.data.history.length
    }
  } catch (err) {
    error('加载历史记录失败')
  } finally {
    isLoading.value = false
  }
}

const loadMore = async () => {
  if (isLoadingMore.value || !hasMore.value) return
  
  try {
    isLoadingMore.value = true
    await loadHistory(false)
  } finally {
    isLoadingMore.value = false
  }
}

const loadStats = async () => {
  if (!isAuthenticated.value) return
  
  try {
    const response = await apiRequest(`/history/stats?period=${filters.value.period}`)
    
    if (response.success) {
      stats.value = response.data
    }
  } catch (err) {
    console.error('加载统计失败:', err)
  }
}

const getActionIcon = (action: string) => {
  const icons: Record<string, any> = {
    view: Eye,
    search: Search,
    favorite: Heart,
    unfavorite: Heart,
    rating: Star,
    comment: MessageSquare,
    download: Download
  }
  return icons[action] || FileText
}

const getActionTitle = (item: any) => {
  const titles: Record<string, string> = {
    view: '浏览',
    search: '搜索',
    favorite: '收藏',
    unfavorite: '取消收藏',
    rating: '评分',
    comment: '评论',
    download: '下载'
  }
  
  const title = titles[item.action] || '操作'
  
  if (item.targetType === 'tool' && item.toolName) {
    return `${title} - ${item.toolName}`
  } else if (item.targetType === 'page' && item.targetName) {
    return `${title} - ${item.targetName}`
  } else if (item.targetType === 'search' && item.targetName) {
    return `${title} - "${item.targetName}"`
  }
  
  return title
}

const getActionDescription = (item: any) => {
  if (item.targetType === 'tool' && item.toolDescription) {
    return item.toolDescription
  } else if (item.targetType === 'page' && item.targetName) {
    return `访问了 ${item.targetName} 页面`
  } else if (item.targetType === 'search' && item.targetName) {
    return `搜索了 "${item.targetName}"`
  }
  
  return '操作记录'
}

const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  
  return date.toLocaleDateString('zh-CN')
}

const viewTool = (toolId: number) => {
  router.push(`/tool/${toolId}`)
}

const searchQuery = (query: string) => {
  router.push(`/search?q=${encodeURIComponent(query)}`)
}

const removeHistoryItem = async (item: any) => {
  if (!confirm('确定要删除这条历史记录吗？')) return
  
  try {
    const response = await apiRequest('/history', {
      method: 'DELETE',
      body: JSON.stringify({
        action: item.action,
        targetType: item.targetType,
        beforeDate: item.createdAt
      })
    })
    
    if (response.success) {
      success('历史记录已删除')
      await loadHistory()
      await loadStats()
    } else {
      error(response.error || '删除失败')
    }
  } catch (err) {
    error('网络错误，请稍后重试')
  }
}

const clearHistory = async () => {
  try {
    const response = await apiRequest('/history', {
      method: 'DELETE',
      body: JSON.stringify(clearOptions.value)
    })
    
    if (response.success) {
      success(response.message)
      showClearModal.value = false
      clearOptions.value = { action: '', beforeDate: '' }
      await loadHistory()
      await loadStats()
    } else {
      error(response.error || '清除失败')
    }
  } catch (err) {
    error('网络错误，请稍后重试')
  }
}

const exportHistory = async () => {
  try {
    const response = await apiRequest('/history/export?format=csv')
    
    if (response.success) {
      // 创建下载链接
      const blob = new Blob([response], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `user_history_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      success('历史记录导出成功')
    } else {
      error('导出失败')
    }
  } catch (err) {
    error('网络错误，请稍后重试')
  }
}

// 监听筛选条件变化
watch(() => filters.value, () => {
  loadHistory()
  loadStats()
}, { deep: true })

// 防止重复加载的标志
let isDataLoaded = false

// 初始化数据加载函数
const initializeData = async () => {
  if (isAuthenticated.value && !isDataLoaded) {
    isDataLoaded = true
    await Promise.all([
      loadHistory(),
      loadStats()
    ])
  }
}

// 监听登录状态
watch(() => isAuthenticated.value, (newValue) => {
  if (newValue) {
    initializeData()
  } else {
    // 用户登出时重置标志
    isDataLoaded = false
  }
})

// 初始化
onMounted(() => {
  initializeData()
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
  position: relative;
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
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
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

.header-actions .action-btn {
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
  font-size: 0.875rem;
  white-space: nowrap;
}

.header-actions .action-btn:hover {
  background-color: var(--bg-tertiary);
  border-color: var(--border-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.main-content {
  padding: 2rem 0;
}

.page-description {
  margin-bottom: 2rem;
}

.page-description p {
  color: var(--text-secondary);
  font-size: 1rem;
  margin: 0;
}

.stats-section {
  margin-bottom: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
}

.stat-icon {
  width: 48px;
  height: 48px;
  background-color: var(--primary-color);
  color: white;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.filters-section {
  margin-bottom: 2rem;
}

.filters-row {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 150px;
}

.filter-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
}

.filter-select {
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.875rem;
}

.chart-section,
.top-tools-section,
.top-searches-section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.chart-container {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 2rem;
}

.chart-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: var(--text-muted);
}

.chart-icon {
  margin-bottom: 1rem;
}

.chart-text {
  font-size: 1.125rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.chart-description {
  font-size: 0.875rem;
}

.top-tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.tool-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.2s ease;
}

.tool-card:hover {
  box-shadow: var(--shadow-sm);
  transform: translateY(-2px);
}

.tool-logo {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  overflow: hidden;
  flex-shrink: 0;
}

.tool-logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.logo-placeholder {
  width: 100%;
  height: 100%;
  background-color: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.125rem;
}

.tool-info {
  flex: 1;
}

.tool-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.tool-category {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.tool-stats {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.search-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.search-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 1rem;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.search-tag:hover {
  background-color: var(--bg-tertiary);
  border-color: var(--border-hover);
}

.search-count {
  color: var(--text-muted);
  font-size: 0.75rem;
}

.history-section {
  margin-bottom: 2rem;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.section-actions {
  display: flex;
  gap: 1rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: var(--text-secondary);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border-color);
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
}

.empty-icon {
  color: var(--border-color);
  margin-bottom: 1rem;
}

.empty-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.empty-description {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}

.history-container {
  margin-bottom: 2rem;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.history-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  transition: all 0.2s ease;
}

.history-item:hover {
  box-shadow: var(--shadow-sm);
}

.history-icon {
  width: 40px;
  height: 40px;
  background-color: var(--bg-tertiary);
  color: var(--text-secondary);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.history-content {
  flex: 1;
}

.history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.history-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.history-time {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.history-details {
  margin-bottom: 0.5rem;
}

.history-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.4;
  margin: 0 0 0.5rem 0;
}

.history-metadata {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.metadata-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.metadata-icon {
  color: var(--text-muted);
}

.history-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.history-actions .action-btn {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: var(--radius-sm);
  background-color: var(--bg-tertiary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  min-width: unset;
}

.history-actions .action-btn:hover {
  background-color: var(--border-color);
  color: var(--text-primary);
}

.history-actions .action-btn.delete:hover {
  background-color: var(--error-color);
  color: white;
}

.load-more {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.btn-icon.spinning {
  animation: spin 1s linear infinite;
}

/* 表单样式 */
.clear-history-form {
  padding: 1rem 0;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.form-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.875rem;
}

.form-select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.warning-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background-color: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: var(--radius-md);
  color: var(--error-color);
  font-size: 0.875rem;
}

.warning-icon {
  flex-shrink: 0;
}

.btn-danger {
  background-color: var(--error-color);
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background-color: #dc2626;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .header-actions {
    width: 100%;
    justify-content: flex-start;
  }
  
  .header-actions .action-btn {
    flex: 1;
    justify-content: center;
  }
  
  .filters-row {
    flex-direction: column;
  }
  
  .filter-group {
    min-width: auto;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .top-tools-grid {
    grid-template-columns: 1fr;
  }
  
  .history-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .history-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
  
  .history-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>