<template>
  <div class="mobile-search-page">
    <!-- 搜索头部 -->
    <div class="search-header">
      <div class="search-container">
        <button @click="goBack" class="back-btn">
          <ArrowLeft class="back-icon" :size="20" />
        </button>
        
        <div class="search-input-container">
          <Search class="search-icon" :size="18" />
          <input
            v-model="searchQuery"
            @keyup.enter="handleSearch"
            @input="onSearchInput"
            type="text"
            placeholder="搜索AI工具..."
            class="search-input"
            ref="searchInput"
            autofocus
          />
          <button 
            v-if="searchQuery" 
            @click="clearSearch" 
            class="clear-btn"
          >
            <X class="clear-icon" :size="16" />
          </button>
        </div>
        
        <button @click="handleSearch" class="search-btn">
          搜索
        </button>
      </div>
    </div>

    <!-- 搜索建议 -->
    <div v-if="showSuggestions && !hasSearched" class="suggestions-section">
      <!-- 搜索历史 -->
      <div v-if="searchHistory.length > 0" class="suggestions-group">
        <div class="group-header">
          <Clock class="group-icon" :size="16" />
          <span class="group-title">搜索历史</span>
          <button @click="clearHistory" class="clear-history-btn">清除</button>
        </div>
        <div class="suggestions-list">
          <div 
            v-for="(item, index) in searchHistory.slice(0, 8)" 
            :key="index"
            class="suggestion-item"
            @click="selectSuggestion(item)"
          >
            <Clock class="suggestion-icon" :size="14" />
            <span class="suggestion-text">{{ item }}</span>
            <button @click.stop="removeFromHistory(item)" class="remove-btn">×</button>
          </div>
        </div>
      </div>
      
      <!-- 热门搜索 -->
      <div class="suggestions-group">
        <div class="group-header">
          <TrendingUp class="group-icon" :size="16" />
          <span class="group-title">热门搜索</span>
        </div>
        <div class="suggestions-list">
          <div 
            v-for="(term, index) in popularSearches" 
            :key="index"
            class="suggestion-item"
            @click="selectSuggestion(term)"
          >
            <TrendingUp class="suggestion-icon" :size="14" />
            <span class="suggestion-text">{{ term }}</span>
          </div>
        </div>
      </div>
      
      <!-- 搜索建议 -->
      <div v-if="searchSuggestions.length > 0" class="suggestions-group">
        <div class="group-header">
          <Search class="group-icon" :size="16" />
          <span class="group-title">搜索建议</span>
        </div>
        <div class="suggestions-list">
          <div 
            v-for="(suggestion, index) in searchSuggestions.slice(0, 10)" 
            :key="index"
            class="suggestion-item"
            @click="selectSuggestion(suggestion)"
          >
            <Search class="suggestion-icon" :size="14" />
            <span class="suggestion-text">{{ suggestion }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 搜索结果 -->
    <div v-if="hasSearched" class="results-section">
      <!-- 结果头部 -->
      <div class="results-header">
        <div class="results-info">
          <h2 class="results-title">搜索结果</h2>
          <p class="results-count">找到 {{ totalResults }} 个相关工具</p>
        </div>
        
        <div class="filter-toggle">
          <button @click="toggleFilters" class="filter-btn">
            <Filter class="filter-icon" :size="16" />
            筛选
          </button>
        </div>
      </div>
      
      <!-- 筛选器 -->
      <div v-if="showFilters" class="filters-section">
        <div class="filter-group">
          <h4 class="filter-title">分类</h4>
          <div class="filter-options">
            <button 
              v-for="category in categories" 
              :key="category"
              @click="toggleCategory(category)"
              class="filter-option"
              :class="{ active: selectedCategories.includes(category) }"
            >
              {{ category }}
            </button>
          </div>
        </div>
        
        <div class="filter-group">
          <h4 class="filter-title">价格</h4>
          <div class="filter-options">
            <button 
              v-for="pricing in pricingOptions" 
              :key="pricing"
              @click="togglePricing(pricing)"
              class="filter-option"
              :class="{ active: selectedPricing.includes(pricing) }"
            >
              {{ pricing }}
            </button>
          </div>
        </div>
        
        <div class="filter-actions">
          <button @click="clearFilters" class="clear-filters-btn">清除筛选</button>
          <button @click="applyFilters" class="apply-filters-btn">应用筛选</button>
        </div>
      </div>
      
      <!-- 排序选项 -->
      <div class="sort-section">
        <div class="sort-options">
          <button 
            v-for="option in sortOptions" 
            :key="option.value"
            @click="setSortBy(option.value)"
            class="sort-option"
            :class="{ active: sortBy === option.value }"
          >
            {{ option.label }}
          </button>
        </div>
      </div>
      
      <!-- 工具列表 -->
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p class="loading-text">搜索中...</p>
      </div>
      
      <div v-else-if="filteredTools.length === 0" class="empty-state">
        <Search class="empty-icon" :size="48" />
        <h3 class="empty-title">未找到相关工具</h3>
        <p class="empty-description">尝试使用其他关键词或调整筛选条件</p>
        <button @click="clearFilters" class="retry-btn">清除筛选</button>
      </div>
      
      <div v-else class="tools-list">
        <MobileToolCard
          v-for="tool in paginatedTools"
          :key="tool.id"
          :tool="tool"
          @click="navigateToTool"
          @favorite="handleFavorite"
          @share="handleShare"
        />
      </div>
      
      <!-- 分页 -->
      <div v-if="totalPages > 1" class="pagination">
        <button 
          @click="previousPage" 
          :disabled="currentPage === 1"
          class="page-btn"
        >
          <ChevronLeft class="page-icon" :size="16" />
          上一页
        </button>
        
        <div class="page-info">
          {{ currentPage }} / {{ totalPages }}
        </div>
        
        <button 
          @click="nextPage" 
          :disabled="currentPage === totalPages"
          class="page-btn"
        >
          下一页
          <ChevronRight class="page-icon" :size="16" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { 
  ArrowLeft, 
  Search, 
  X, 
  Clock, 
  TrendingUp, 
  Filter,
  ChevronLeft,
  ChevronRight
} from 'lucide-vue-next'
import MobileToolCard from '@/components/MobileToolCard.vue'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const route = useRoute()
const { isAuthenticated } = useAuth()
const { success } = useToast()

// 响应式数据
const searchQuery = ref('')
const searchSuggestions = ref<string[]>([])
const searchHistory = ref<string[]>([])
const showSuggestions = ref(true)
const hasSearched = ref(false)
const isLoading = ref(false)
const showFilters = ref(false)
const searchInput = ref<HTMLInputElement>()

// 搜索结果
const tools = ref<any[]>([])
const totalResults = ref(0)
const currentPage = ref(1)
const itemsPerPage = 10

// 筛选和排序
const selectedCategories = ref<string[]>([])
const selectedPricing = ref<string[]>([])
const sortBy = ref('relevance')

// 选项数据
const categories = ref([
  'AI聊天', 'AI绘画', 'AI视频', 'AI编程', 'AI设计', 
  'AI音乐', 'AI写作', 'AI办公', 'AI学习', 'AI模型'
])

const pricingOptions = ref(['免费', '免费试用', '付费', '订阅', '开源'])

const sortOptions = ref([
  { value: 'relevance', label: '相关度' },
  { value: 'rating', label: '评分' },
  { value: 'popularity', label: '热度' },
  { value: 'newest', label: '最新' },
  { value: 'name', label: '名称' }
])

const popularSearches = ref([
  'ChatGPT', 'AI写作', 'AI绘画', '免费工具', 'AI编程',
  'AI视频', 'AI办公', 'AI设计', 'AI音乐', 'AI学习'
])

// 计算属性
const filteredTools = computed(() => {
  let filtered = [...tools.value]
  
  // 分类筛选
  if (selectedCategories.value.length > 0) {
    filtered = filtered.filter(tool => 
      selectedCategories.value.includes(tool.category)
    )
  }
  
  // 价格筛选
  if (selectedPricing.value.length > 0) {
    filtered = filtered.filter(tool => 
      selectedPricing.value.includes(tool.pricing)
    )
  }
  
  // 排序
  switch (sortBy.value) {
    case 'rating':
      filtered.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
      break
    case 'popularity':
      filtered.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
      break
    case 'newest':
      filtered.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      break
    case 'name':
      filtered.sort((a, b) => a.name.localeCompare(b.name))
      break
    default: // relevance
      // 保持原始顺序（相关度排序）
      break
  }
  
  return filtered
})

const totalPages = computed(() => 
  Math.ceil(filteredTools.value.length / itemsPerPage)
)

const paginatedTools = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredTools.value.slice(start, end)
})

// 方法
const goBack = () => {
  router.back()
}

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    addToHistory(searchQuery.value.trim())
    performSearch()
  }
}

const performSearch = async () => {
  try {
    isLoading.value = true
    hasSearched.value = true
    showSuggestions.value = false
    
    // 模拟搜索API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 这里应该调用实际的搜索API
    // const response = await apiRequest(`/search?q=${encodeURIComponent(searchQuery.value)}`)
    
    // 模拟搜索结果
    tools.value = generateMockResults()
    totalResults.value = tools.value.length
    currentPage.value = 1
    
  } catch (error) {
    console.error('Search error:', error)
  } finally {
    isLoading.value = false
  }
}

const generateMockResults = () => {
  // 模拟生成搜索结果
  const mockTools = []
  for (let i = 1; i <= 25; i++) {
    mockTools.push({
      id: `tool-${i}`,
      name: `AI工具 ${i}`,
      shortDescription: `这是一个功能强大的AI工具，可以帮助您完成各种任务。`,
      category: categories.value[Math.floor(Math.random() * categories.value.length)],
      tags: ['AI', '工具', '智能'],
      pricing: pricingOptions.value[Math.floor(Math.random() * pricingOptions.value.length)],
      averageRating: Math.random() * 2 + 3, // 3-5星
      ratingCount: Math.floor(Math.random() * 100),
      favoriteCount: Math.floor(Math.random() * 50),
      viewCount: Math.floor(Math.random() * 1000),
      isNew: Math.random() > 0.8,
      url: `https://example.com/tool-${i}`
    })
  }
  return mockTools
}

const onSearchInput = () => {
  if (searchQuery.value.trim()) {
    generateSuggestions()
  } else {
    searchSuggestions.value = []
  }
}

const generateSuggestions = () => {
  const query = searchQuery.value.trim()
  if (!query) {
    searchSuggestions.value = []
    return
  }
  
  // 基于工具名称和标签生成建议
  const suggestions = new Set<string>()
  
  // 这里可以添加更多搜索建议逻辑
  searchSuggestions.value = Array.from(suggestions).slice(0, 10)
}

const selectSuggestion = (suggestion: string) => {
  searchQuery.value = suggestion
  handleSearch()
}

const clearSearch = () => {
  searchQuery.value = ''
  searchSuggestions.value = []
  showSuggestions.value = true
  hasSearched.value = false
  tools.value = []
  totalResults.value = 0
}

const addToHistory = (query: string) => {
  const history = searchHistory.value.filter(item => item !== query)
  history.unshift(query)
  searchHistory.value = history.slice(0, 10)
  localStorage.setItem('ai-tools-search-history', JSON.stringify(searchHistory.value))
}

const removeFromHistory = (query: string) => {
  searchHistory.value = searchHistory.value.filter(item => item !== query)
  localStorage.setItem('ai-tools-search-history', JSON.stringify(searchHistory.value))
}

const clearHistory = () => {
  searchHistory.value = []
  localStorage.removeItem('ai-tools-search-history')
}

const toggleFilters = () => {
  showFilters.value = !showFilters.value
}

const toggleCategory = (category: string) => {
  const index = selectedCategories.value.indexOf(category)
  if (index > -1) {
    selectedCategories.value.splice(index, 1)
  } else {
    selectedCategories.value.push(category)
  }
}

const togglePricing = (pricing: string) => {
  const index = selectedPricing.value.indexOf(pricing)
  if (index > -1) {
    selectedPricing.value.splice(index, 1)
  } else {
    selectedPricing.value.push(pricing)
  }
}

const clearFilters = () => {
  selectedCategories.value = []
  selectedPricing.value = []
  currentPage.value = 1
}

const applyFilters = () => {
  showFilters.value = false
  currentPage.value = 1
}

const setSortBy = (value: string) => {
  sortBy.value = value
  currentPage.value = 1
}

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const navigateToTool = (tool: any) => {
  router.push({
    name: 'ToolDetail',
    params: { id: tool.id }
  })
}

const handleFavorite = (tool: any, favorited: boolean) => {
  if (favorited) {
    success(`${tool.name} 已添加到收藏`)
  } else {
    success(`${tool.name} 已从收藏中移除`)
  }
}

const handleShare = (tool: any) => {
  success(`${tool.name} 分享链接已复制到剪贴板`)
}

// 监听路由查询参数
watch(() => route.query.q, (newQuery) => {
  if (newQuery && typeof newQuery === 'string') {
    searchQuery.value = newQuery
    handleSearch()
  }
}, { immediate: true })

// 初始化
onMounted(() => {
  // 加载搜索历史
  const savedHistory = localStorage.getItem('ai-tools-search-history')
  if (savedHistory) {
    try {
      searchHistory.value = JSON.parse(savedHistory)
    } catch (error) {
      console.error('Failed to load search history:', error)
    }
  }
  
  // 聚焦搜索输入框
  setTimeout(() => {
    searchInput.value?.focus()
  }, 100)
})
</script>

<style scoped>
.mobile-search-page {
  min-height: 100vh;
  background-color: var(--bg-secondary);
  padding-top: 60px; /* 为移动端导航留出空间 */
}

.search-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background-color: var(--bg-primary);
  border-bottom: 1px solid var(--border-color);
  z-index: 1000;
  padding: 0.75rem 1rem;
}

.search-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  height: 100%;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: none;
  border: none;
  color: var(--text-primary);
  cursor: pointer;
  border-radius: var(--radius-md);
  transition: background-color 0.2s ease;
}

.back-btn:hover {
  background-color: var(--bg-tertiary);
}

.search-input-container {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  color: var(--text-muted);
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: 0.75rem 2.5rem 0.75rem 2.5rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-size: 1rem;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.clear-btn {
  position: absolute;
  right: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: var(--bg-tertiary);
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.clear-btn:hover {
  background: var(--border-color);
  color: var(--text-primary);
}

.search-btn {
  padding: 0.75rem 1rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.search-btn:hover {
  background: var(--primary-hover);
}

.suggestions-section {
  padding: 1rem;
  background-color: var(--bg-primary);
  border-bottom: 1px solid var(--border-color);
}

.suggestions-group {
  margin-bottom: 1.5rem;
}

.suggestions-group:last-child {
  margin-bottom: 0;
}

.group-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.group-icon {
  width: 16px;
  height: 16px;
}

.clear-history-btn {
  margin-left: auto;
  padding: 0.25rem 0.5rem;
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 0.75rem;
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
}

.clear-history-btn:hover {
  background-color: var(--border-color);
  color: var(--text-primary);
}

.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.suggestion-item:hover {
  background-color: var(--bg-tertiary);
}

.suggestion-icon {
  width: 14px;
  height: 14px;
  color: var(--text-muted);
  flex-shrink: 0;
}

.suggestion-text {
  flex: 1;
  color: var(--text-primary);
  font-size: 0.875rem;
}

.remove-btn {
  width: 20px;
  height: 20px;
  border: none;
  background: none;
  color: var(--text-muted);
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  line-height: 1;
  transition: all 0.2s ease;
}

.remove-btn:hover {
  background-color: var(--error-color);
  color: white;
}

.results-section {
  padding: 1rem;
}

.results-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.results-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
}

.results-count {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
}

.filter-toggle {
  display: flex;
  align-items: center;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  cursor: pointer;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.filter-btn:hover {
  background: var(--border-color);
}

.filter-icon {
  width: 16px;
  height: 16px;
}

.filters-section {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1rem;
  margin-bottom: 1rem;
}

.filter-group {
  margin-bottom: 1.5rem;
}

.filter-group:last-child {
  margin-bottom: 0;
}

.filter-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.75rem 0;
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.filter-option {
  padding: 0.5rem 0.75rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  cursor: pointer;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.filter-option:hover {
  background: var(--bg-tertiary);
}

.filter-option.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.filter-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.clear-filters-btn {
  flex: 1;
  padding: 0.75rem;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  cursor: pointer;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.clear-filters-btn:hover {
  background: var(--border-color);
}

.apply-filters-btn {
  flex: 1;
  padding: 0.75rem;
  background: var(--primary-color);
  border: none;
  color: white;
  cursor: pointer;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.apply-filters-btn:hover {
  background: var(--primary-hover);
}

.sort-section {
  margin-bottom: 1rem;
}

.sort-options {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.sort-option {
  padding: 0.5rem 0.75rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  cursor: pointer;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.sort-option:hover {
  background: var(--bg-tertiary);
}

.sort-option.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  color: var(--text-secondary);
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border-color);
  border-top: 3px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 0.875rem;
  margin: 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
  color: var(--text-secondary);
}

.empty-icon {
  margin-bottom: 1rem;
  color: var(--text-muted);
}

.empty-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.empty-description {
  font-size: 0.875rem;
  margin: 0 0 1.5rem 0;
  line-height: 1.4;
}

.retry-btn {
  padding: 0.75rem 1.5rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.retry-btn:hover {
  background: var(--primary-hover);
}

.tools-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
  padding: 1rem 0;
}

.page-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  cursor: pointer;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.page-btn:hover:not(:disabled) {
  background: var(--bg-tertiary);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.page-icon {
  width: 16px;
  height: 16px;
}

/* 触摸优化 */
@media (hover: none) and (pointer: coarse) {
  .suggestion-item,
  .filter-option,
  .sort-option,
  .page-btn {
    min-height: 44px;
  }
  
  .back-btn,
  .clear-btn,
  .search-btn {
    min-width: 44px;
    min-height: 44px;
  }
}

/* 小屏幕优化 */
@media (max-width: 480px) {
  .search-header {
    padding: 0.5rem;
  }
  
  .search-container {
    gap: 0.5rem;
  }
  
  .search-input {
    font-size: 0.875rem;
    padding: 0.625rem 2rem 0.625rem 2rem;
  }
  
  .search-btn {
    padding: 0.625rem 0.75rem;
    font-size: 0.8125rem;
  }
  
  .results-section {
    padding: 0.75rem;
  }
  
  .filter-options {
    gap: 0.375rem;
  }
  
  .filter-option {
    padding: 0.375rem 0.625rem;
    font-size: 0.8125rem;
  }
  
  .sort-options {
    gap: 0.375rem;
  }
  
  .sort-option {
    padding: 0.375rem 0.625rem;
    font-size: 0.8125rem;
  }
}
</style>