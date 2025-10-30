<!-- genAI_main_start -->
<template>
  <div class="ai-news-page">
    <!-- 头部导航 -->
    <header class="header">
      <div class="container">
        <div class="header-content">
          <button @click="goBack" class="back-btn" type="button">
            <ArrowLeft class="back-icon" />
            返回
          </button>
          <h1 class="page-title">AI快讯</h1>
          <div class="header-actions">
            <button @click="refreshNews" class="refresh-btn" :disabled="isLoading">
              <RefreshCw class="refresh-icon" :size="20" :class="{ 'spinning': isLoading }" />
            </button>
          </div>
        </div>
      </div>
    </header>

    <div class="main-content">
      <div class="container">
        <!-- 筛选器 -->
        <div class="filters">
          <div class="filter-group">
            <label class="filter-label">分类：</label>
            <select v-model="categoryFilter" class="filter-select" @change="filterNews">
              <option value="all">全部</option>
              <option value="技术突破">技术突破</option>
              <option value="硬件技术">硬件技术</option>
              <option value="基础设施">基础设施</option>
              <option value="行业动态">行业动态</option>
              <option value="企业动态">企业动态</option>
              <option value="创业投资">创业投资</option>
              <option value="行业分析">行业分析</option>
            </select>
          </div>
          <div class="filter-group">
            <label class="filter-label">排序：</label>
            <select v-model="sortBy" class="filter-select" @change="sortNews">
              <option value="latest">最新</option>
              <option value="hot">热门</option>
              <option value="readTime">阅读时间</option>
            </select>
          </div>
          <div class="filter-group">
            <label class="filter-label">搜索：</label>
            <div class="search-box">
              <Search class="search-icon" :size="16" />
              <input 
                v-model="searchQuery"
                @input="searchNews"
                placeholder="搜索AI快讯..."
                class="search-input"
              />
            </div>
          </div>
        </div>

        <!-- 加载状态 -->
        <div v-if="isLoading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>正在加载AI快讯...</p>
        </div>

        <!-- 新闻列表 -->
        <div v-else-if="filteredNews.length > 0" class="news-list">
          <div 
            v-for="news in filteredNews" 
            :key="news.id"
            class="news-item"
            @click="navigateToDetail(news.id)"
          >
            <div class="news-header">
              <div class="news-meta">
                <span class="news-category">{{ news.category }}</span>
                <span class="news-time">{{ formatTime(news.publishedAt) }}</span>
                <span class="news-read-time">{{ news.readTime }}分钟阅读</span>
              </div>
              <div v-if="news.isHot" class="hot-badge">
                <Flame class="hot-icon" :size="12" />
                热门
              </div>
            </div>
            
            <h3 class="news-title">{{ news.title }}</h3>
            <p class="news-summary">{{ news.summary }}</p>
            
            <div class="news-tags">
              <span 
                v-for="tag in news.tags.slice(0, 3)" 
                :key="tag"
                class="tag"
              >
                {{ tag }}
              </span>
              <span v-if="news.tags.length > 3" class="more-tags">
                +{{ news.tags.length - 3 }}
              </span>
            </div>
            
            <div class="news-footer">
              <div class="news-source">
                <Newspaper class="source-icon" :size="14" />
                <span>{{ news.source }}</span>
              </div>
              <div class="news-actions">
                <button @click.stop="shareNews(news)" class="action-btn" title="分享">
                  <Share2 class="action-icon" :size="14" />
                </button>
                <button @click.stop="bookmarkNews(news)" class="action-btn" title="收藏">
                  <Bookmark class="action-icon" :size="14" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="empty-state">
          <Newspaper class="empty-icon" :size="64" />
          <h3 class="empty-title">暂无相关快讯</h3>
          <p class="empty-description">尝试调整筛选条件或搜索关键词</p>
          <button @click="resetFilters" class="reset-btn">重置筛选</button>
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
  RefreshCw, 
  Search, 
  Flame, 
  Newspaper, 
  Share2, 
  Bookmark
} from 'lucide-vue-next'
import { newsService, type AINewsItem } from '@/services/newsService'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const { success, error } = useToast()

// 响应式数据
const newsList = ref<AINewsItem[]>([])
const isLoading = ref(false)
const categoryFilter = ref('all')
const sortBy = ref('latest')
const searchQuery = ref('')

// 计算属性
const filteredNews = computed(() => {
  let filtered = [...newsList.value]
  
  // 分类筛选
  if (categoryFilter.value !== 'all') {
    filtered = filtered.filter(news => news.category === categoryFilter.value)
  }
  
  // 搜索筛选
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(news => 
      news.title.toLowerCase().includes(query) ||
      news.summary.toLowerCase().includes(query) ||
      news.tags.some(tag => tag.toLowerCase().includes(query))
    )
  }
  
  // 排序
  switch (sortBy.value) {
    case 'latest':
      filtered.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      break
    case 'hot':
      filtered.sort((a, b) => {
        if (a.isHot && !b.isHot) return -1
        if (!a.isHot && b.isHot) return 1
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      })
      break
    case 'readTime':
      filtered.sort((a, b) => a.readTime - b.readTime)
      break
  }
  
  return filtered
})

// 方法
const goBack = () => {
  router.push('/')
}

const loadNews = async () => {
  isLoading.value = true
  try {
    const news = await newsService.getLatestAINews()
    newsList.value = news
  } catch (err) {
    error('加载AI快讯失败')
  } finally {
    isLoading.value = false
  }
}

const refreshNews = async () => {
  try {
    const news = await newsService.forceRefresh()
    newsList.value = news
    success('快讯已刷新')
  } catch (err) {
    error('刷新失败')
  }
}

const filterNews = () => {
  // 筛选逻辑在计算属性中处理
}

const sortNews = () => {
  // 排序逻辑在计算属性中处理
}

const searchNews = async () => {
  if (!searchQuery.value.trim()) {
    await loadNews()
    return
  }
  
  isLoading.value = true
  try {
    const results = await newsService.searchAINews(searchQuery.value)
    newsList.value = results
  } catch (err) {
    error('搜索失败')
  } finally {
    isLoading.value = false
  }
}

const navigateToDetail = (newsId: string) => {
  router.push(`/ai-news/${newsId}`)
}

const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
  
  if (diffInMinutes < 1) return '刚刚'
  if (diffInMinutes < 60) return `${diffInMinutes}分钟前`
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}小时前`
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays}天前`
  
  return date.toLocaleDateString('zh-CN')
}

const shareNews = (news: AINewsItem) => {
  if (navigator.share) {
    navigator.share({
      title: news.title,
      text: news.summary,
      url: window.location.origin + `/ai-news/${news.id}`
    })
  } else {
    // 复制到剪贴板
    navigator.clipboard.writeText(`${news.title}\n${news.summary}\n${window.location.origin}/ai-news/${news.id}`)
    success('链接已复制到剪贴板')
  }
}

const bookmarkNews = (news: AINewsItem) => {
  // 这里可以集成收藏功能
  success('已添加到收藏')
}

const resetFilters = () => {
  categoryFilter.value = 'all'
  sortBy.value = 'latest'
  searchQuery.value = ''
  loadNews()
}

onMounted(() => {
  loadNews()
})
</script>

<style scoped>
.ai-news-page {
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

.refresh-btn {
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

.refresh-btn:hover:not(:disabled) {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.refresh-icon {
  width: 20px;
  height: 20px;
}

.refresh-icon.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.main-content {
  padding: 2rem 0;
}

.filters {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  margin-bottom: 2rem;
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  box-shadow: var(--shadow-sm);
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 200px;
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

.search-box {
  position: relative;
  display: flex;
  align-items: center;
  background-color: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 0.5rem 0.75rem;
  min-width: 200px;
}

.search-icon {
  color: var(--text-muted);
  margin-right: 0.5rem;
}

.search-input {
  border: none;
  outline: none;
  background: transparent;
  color: var(--text-primary);
  font-size: 0.875rem;
  flex: 1;
}

.search-input::placeholder {
  color: var(--text-muted);
}

.loading-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-muted);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-color);
  border-top: 3px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

.news-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.news-item {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-sm);
}

.news-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--primary-color);
}

.news-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.news-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.news-category {
  background-color: var(--primary-color);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 500;
}

.news-time {
  color: var(--text-muted);
  font-size: 0.8125rem;
}

.news-read-time {
  color: var(--text-muted);
  font-size: 0.8125rem;
}

.hot-badge {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background-color: var(--error-color);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 500;
}

.hot-icon {
  width: 12px;
  height: 12px;
}

.news-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.75rem 0;
  line-height: 1.4;
}

.news-summary {
  color: var(--text-secondary);
  font-size: 0.875rem;
  line-height: 1.6;
  margin: 0 0 1rem 0;
}

.news-tags {
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

.news-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.news-source {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  color: var(--text-muted);
  font-size: 0.8125rem;
}

.source-icon {
  width: 14px;
  height: 14px;
}

.news-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.action-btn {
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
}

.action-btn:hover {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
}

.action-icon {
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

.reset-btn {
  padding: 0.75rem 1.5rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.reset-btn:hover {
  background-color: var(--primary-hover);
  transform: translateY(-1px);
}

/* 移动端优化 */
@media (max-width: 768px) {
  .main-content {
    padding: 1rem 0;
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
    min-width: auto;
  }
  
  .filter-select,
  .search-box {
    width: 100%;
    min-width: auto;
  }
  
  .news-item {
    padding: 1rem;
  }
  
  .news-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .news-meta {
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .news-title {
    font-size: 1.125rem;
  }
  
  .news-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .news-actions {
    align-self: flex-end;
  }
}
</style>
<!-- genAI_main_end -->