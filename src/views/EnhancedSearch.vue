<template>
  <div class="enhanced-search-page">
    <!-- 头部 -->
    <header class="header">
      <div class="container">
        <div class="header-content">
          <button @click="goBack" class="back-btn" type="button">
            <ArrowLeft class="back-icon" />
            返回
          </button>
          <h1 class="page-title">智能搜索</h1>
        </div>
      </div>
    </header>

    <div class="main-content">
      <div class="container">
        <!-- 搜索框 -->
        <div class="search-section">
          <EnhancedSearch
            ref="searchRef"
            :placeholder="'搜索AI工具、分类、标签、评论...'"
            :auto-focus="true"
            :show-filters="true"
            @search="handleSearch"
            @suggestion-select="handleSuggestionSelect"
          />
        </div>

        <!-- 搜索结果 -->
        <div v-if="searchResults.length > 0" class="results-section">
          <div class="results-header">
            <h2 class="results-title">搜索结果</h2>
            <div class="results-meta">
              <span class="results-count">找到 {{ totalResults }} 个结果</span>
              <span class="search-time">用时 {{ searchTime }}ms</span>
            </div>
          </div>

          <!-- 结果分类 -->
          <div class="results-tabs">
            <button
              v-for="tab in resultTabs"
              :key="tab.key"
              @click="activeTab = tab.key"
              class="tab-btn"
              :class="{ active: activeTab === tab.key }"
            >
              {{ tab.label }}
              <span class="tab-count">({{ tab.count }})</span>
            </button>
          </div>

          <!-- 结果列表 -->
          <div class="results-content">
            <!-- 工具结果 -->
            <div v-if="activeTab === 'tools' && toolResults.length > 0" class="results-grid">
              <div
                v-for="tool in toolResults"
                :key="tool.id"
                class="result-card tool-card"
                @click="navigateToTool(tool)"
              >
                <div class="card-header">
                  <div class="tool-icon">
                    <Bot class="icon" :size="24" />
                  </div>
                  <div class="tool-info">
                    <h3 class="tool-name">{{ tool.title }}</h3>
                    <p class="tool-description">{{ tool.description }}</p>
                    <div class="tool-meta">
                      <span class="tool-category">{{ tool.category }}</span>
                      <div v-if="tool.rating" class="tool-rating">
                        <Star class="rating-icon" :size="14" />
                        <span>{{ tool.rating }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="card-footer">
                  <div class="tool-tags">
                    <span
                      v-for="tag in tool.tags?.slice(0, 3)"
                      :key="tag"
                      class="tag"
                    >
                      {{ tag }}
                    </span>
                  </div>
                  <div class="tool-pricing">
                    <span class="pricing-badge" :class="getPricingClass(tool.pricing)">
                      {{ getPricingText(tool.pricing) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 分类结果 -->
            <div v-if="activeTab === 'categories' && categoryResults.length > 0" class="results-grid">
              <div
                v-for="category in categoryResults"
                :key="category.id"
                class="result-card category-card"
                @click="navigateToCategory(category)"
              >
                <div class="card-header">
                  <div class="category-icon">
                    <Folder class="icon" :size="24" />
                  </div>
                  <div class="category-info">
                    <h3 class="category-name">{{ category.title }}</h3>
                    <p class="category-description">{{ category.description }}</p>
                  </div>
                </div>
                <div class="card-footer">
                  <ArrowRight class="action-icon" :size="16" />
                </div>
              </div>
            </div>

            <!-- 标签结果 -->
            <div v-if="activeTab === 'tags' && tagResults.length > 0" class="results-grid">
              <div
                v-for="tag in tagResults"
                :key="tag.id"
                class="result-card tag-card"
                @click="searchByTag(tag)"
              >
                <div class="card-header">
                  <div class="tag-icon">
                    <Tag class="icon" :size="24" />
                  </div>
                  <div class="tag-info">
                    <h3 class="tag-name">{{ tag.title }}</h3>
                    <p class="tag-description">{{ tag.description }}</p>
                  </div>
                </div>
                <div class="card-footer">
                  <ArrowRight class="action-icon" :size="16" />
                </div>
              </div>
            </div>

            <!-- 评论结果 -->
            <div v-if="activeTab === 'comments' && commentResults.length > 0" class="results-list">
              <div
                v-for="comment in commentResults"
                :key="comment.id"
                class="result-card comment-card"
                @click="navigateToComment(comment)"
              >
                <div class="comment-header">
                  <div class="comment-user">
                    <div class="user-avatar">
                      {{ comment.username?.charAt(0) || 'U' }}
                    </div>
                    <div class="user-info">
                      <div class="username">{{ comment.username || '匿名用户' }}</div>
                      <div class="comment-time">{{ formatTime(comment.createdAt) }}</div>
                    </div>
                  </div>
                  <div class="comment-tool">
                    来自: {{ comment.toolName }}
                  </div>
                </div>
                <div class="comment-content">
                  <p class="comment-text">{{ comment.title }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else-if="hasSearched && searchResults.length === 0" class="empty-state">
          <Search class="empty-icon" :size="48" />
          <h3 class="empty-title">未找到相关结果</h3>
          <p class="empty-description">
            尝试使用不同的关键词或检查拼写是否正确
          </p>
          <div class="empty-actions">
            <button @click="clearSearch" class="retry-btn">
              重新搜索
            </button>
          </div>
        </div>

        <!-- 搜索建议 -->
        <div v-if="!hasSearched" class="search-suggestions">
          <h3 class="suggestions-title">热门搜索</h3>
          <div class="suggestions-grid">
            <button
              v-for="suggestion in popularQueries"
              :key="suggestion.query"
              @click="searchByQuery(suggestion.query)"
              class="suggestion-chip"
            >
              {{ suggestion.query }}
              <span class="suggestion-count">{{ suggestion.searchCount }}</span>
            </button>
          </div>
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
  Bot, 
  Folder, 
  Tag, 
  Star, 
  ArrowRight, 
  Search 
} from 'lucide-vue-next'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'
import EnhancedSearch from '@/components/EnhancedSearch.vue'

const router = useRouter()
const { apiRequest } = useAuth()
const { success, error } = useToast()

// 响应式数据
const searchRef = ref()
const searchResults = ref<any[]>([])
const totalResults = ref(0)
const searchTime = ref(0)
const hasSearched = ref(false)
const activeTab = ref('tools')
const popularQueries = ref<any[]>([])

// 计算属性
const toolResults = computed(() => 
  searchResults.value.filter(result => result.type === 'tool')
)

const categoryResults = computed(() => 
  searchResults.value.filter(result => result.type === 'category')
)

const tagResults = computed(() => 
  searchResults.value.filter(result => result.type === 'tag')
)

const commentResults = computed(() => 
  searchResults.value.filter(result => result.type === 'comment')
)

const resultTabs = computed(() => [
  { key: 'tools', label: '工具', count: toolResults.value.length },
  { key: 'categories', label: '分类', count: categoryResults.value.length },
  { key: 'tags', label: '标签', count: tagResults.value.length },
  { key: 'comments', label: '评论', count: commentResults.value.length }
])

// 方法
const goBack = () => {
  router.back()
}

const handleSearch = async (query: string, filters: any) => {
  try {
    hasSearched.value = true
    
    const params = new URLSearchParams({
      q: query,
      ...filters
    })
    
    const response = await apiRequest(`/search?${params}`)
    
    if (response.success) {
      searchResults.value = response.data.results
      totalResults.value = response.data.total
      
      // 记录搜索日志
      await logSearch(query, response.data.results.length, filters)
      
      // 设置默认激活标签
      if (toolResults.value.length > 0) {
        activeTab.value = 'tools'
      } else if (categoryResults.value.length > 0) {
        activeTab.value = 'categories'
      } else if (tagResults.value.length > 0) {
        activeTab.value = 'tags'
      } else if (commentResults.value.length > 0) {
        activeTab.value = 'comments'
      }
    } else {
      error(response.error || '搜索失败')
    }
  } catch (err) {
    error('网络错误，请稍后重试')
  }
}

const handleSuggestionSelect = (suggestion: any) => {
  // 建议选择后的处理逻辑
  console.log('选择建议:', suggestion)
}

const navigateToTool = (tool: any) => {
  router.push(`/tool/${tool.id}`)
}

const navigateToCategory = (category: any) => {
  router.push(`/category/${category.id}`)
}

const searchByTag = (tag: any) => {
  searchRef.value?.setQuery(tag.title)
  handleSearch(tag.title, { type: 'tools' })
}

const searchByQuery = (query: string) => {
  searchRef.value?.setQuery(query)
  handleSearch(query, {})
}

const navigateToComment = (comment: any) => {
  router.push(`/tool/${comment.toolId}#comment-${comment.id}`)
}

const clearSearch = () => {
  searchRef.value?.clear()
  searchResults.value = []
  totalResults.value = 0
  hasSearched.value = false
  activeTab.value = 'tools'
}

const getPricingClass = (pricing: string) => {
  const classMap: Record<string, string> = {
    free: 'pricing-free',
    freemium: 'pricing-freemium',
    paid: 'pricing-paid'
  }
  return classMap[pricing] || 'pricing-unknown'
}

const getPricingText = (pricing: string) => {
  const textMap: Record<string, string> = {
    free: '免费',
    freemium: '免费+付费',
    paid: '付费'
  }
  return textMap[pricing] || '未知'
}

const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (minutes < 1) {
    return '刚刚'
  } else if (minutes < 60) {
    return `${minutes}分钟前`
  } else if (hours < 24) {
    return `${hours}小时前`
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return date.toLocaleDateString('zh-CN')
  }
}

const logSearch = async (query: string, resultsCount: number, filters: any) => {
  try {
    await apiRequest('/search/log', {
      method: 'POST',
      body: JSON.stringify({
        query,
        resultsCount,
        filters
      })
    })
  } catch (err) {
    // 搜索日志记录失败不影响用户体验
    console.error('记录搜索日志失败:', err)
  }
}

const loadPopularQueries = async () => {
  try {
    const response = await apiRequest('/search/stats')
    if (response.success) {
      popularQueries.value = response.data.popularQueries || []
    }
  } catch (err) {
    console.error('加载热门搜索失败:', err)
  }
}

// 初始化
onMounted(() => {
  loadPopularQueries()
})
</script>

<style scoped>
.enhanced-search-page {
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
  gap: 1rem;
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

.main-content {
  padding: 2rem 0;
}

.search-section {
  margin-bottom: 2rem;
}

.results-section {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
}

.results-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.results-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.results-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.results-count {
  font-weight: 500;
}

.results-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 2px solid transparent;
  font-size: 0.875rem;
  font-weight: 500;
}

.tab-btn:hover {
  color: var(--text-primary);
  background-color: var(--bg-tertiary);
}

.tab-btn.active {
  color: var(--primary-color);
  border-bottom-color: var(--primary-color);
}

.tab-count {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.results-content {
  min-height: 200px;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.result-card {
  background-color: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.result-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--border-hover);
}

.card-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.tool-icon,
.category-icon,
.tag-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.tool-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.category-icon {
  background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
}

.tag-icon {
  background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
}

.tool-info,
.category-info,
.tag-info {
  flex: 1;
  min-width: 0;
}

.tool-name,
.category-name,
.tag-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tool-description,
.category-description,
.tag-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.4;
  margin: 0 0 0.5rem 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.tool-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.tool-category {
  font-size: 0.75rem;
  color: var(--text-muted);
  background-color: var(--bg-primary);
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
}

.tool-rating {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.rating-icon {
  color: #fbbf24;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tool-tags {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
}

.tag {
  font-size: 0.75rem;
  color: var(--text-secondary);
  background-color: var(--bg-primary);
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
}

.pricing-badge {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
}

.pricing-free {
  background-color: #d1fae5;
  color: #065f46;
}

.pricing-freemium {
  background-color: #fef3c7;
  color: #92400e;
}

.pricing-paid {
  background-color: #fee2e2;
  color: #991b1b;
}

.action-icon {
  color: var(--text-muted);
}

/* 评论卡片样式 */
.comment-card {
  background-color: var(--bg-primary);
}

.comment-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.comment-user {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 32px;
  height: 32px;
  background-color: var(--primary-color);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.username {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
}

.comment-time {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.comment-tool {
  font-size: 0.75rem;
  color: var(--text-muted);
  background-color: var(--bg-tertiary);
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
}

.comment-content {
  margin-top: 0.5rem;
}

.comment-text {
  font-size: 0.875rem;
  color: var(--text-primary);
  line-height: 1.5;
  margin: 0;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
}

.empty-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 1rem;
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
  color: var(--text-secondary);
  margin: 0 0 1.5rem 0;
}

.empty-actions {
  display: flex;
  justify-content: center;
}

.retry-btn {
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

.retry-btn:hover {
  background-color: var(--primary-hover);
}

/* 搜索建议 */
.search-suggestions {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
}

.suggestions-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
}

.suggestions-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.suggestion-chip {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.suggestion-chip:hover {
  background-color: var(--border-color);
  transform: translateY(-1px);
}

.suggestion-count {
  font-size: 0.75rem;
  color: var(--text-muted);
  background-color: var(--bg-primary);
  padding: 0.125rem 0.375rem;
  border-radius: var(--radius-sm);
}

/* 移动端优化 */
@media (max-width: 768px) {
  .main-content {
    padding: 1rem 0;
  }
  
  .results-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .results-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
  
  .results-tabs {
    flex-wrap: wrap;
  }
  
  .tab-btn {
    padding: 0.5rem 0.75rem;
    font-size: 0.8125rem;
  }
  
  .results-grid {
    grid-template-columns: 1fr;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .tool-icon,
  .category-icon,
  .tag-icon {
    width: 40px;
    height: 40px;
  }
  
  .comment-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .suggestions-grid {
    flex-direction: column;
  }
  
  .suggestion-chip {
    justify-content: space-between;
  }
}
</style>