<template>
  <div class="search">
    <!-- 头部 -->
    <header class="header">
      <div class="container">
        <div class="header-content">
          <button @click.prevent="goBack" class="back-btn" type="button">
            <ArrowLeft class="back-icon" />
            返回
          </button>
          <div class="search-container">
            <div class="search-bar">
              <Search class="search-icon" />
              <input 
                type="text" 
                placeholder="搜索AI工具..." 
                v-model="searchQuery"
                @keyup.enter="performSearch"
                @input="onSearchInput"
                @focus="showSuggestions = true"
                @blur="hideSuggestions"
                class="search-input"
                ref="searchInput"
              />
              <button @click="performSearch" class="search-btn">搜索</button>
            </div>
            
            <!-- 搜索建议下拉框 -->
            <div v-if="showSuggestions && (searchSuggestions.length > 0 || searchHistory.length > 0)" class="search-suggestions">
              <!-- 搜索历史 -->
              <div v-if="searchHistory.length > 0 && !searchQuery.trim()" class="suggestions-section">
                <div class="suggestions-header">
                  <Clock class="suggestions-icon" />
                  <span>搜索历史</span>
                  <button @click="clearHistory" class="clear-history-btn">清除</button>
                </div>
                <div class="suggestions-list">
                  <div 
                    v-for="(item, index) in searchHistory.slice(0, 5)" 
                    :key="index"
                    class="suggestion-item"
                    @click="selectSuggestion(item)"
                  >
                    <Clock class="suggestion-icon" />
                    <span>{{ item }}</span>
                    <button @click.stop="removeFromHistory(item)" class="remove-btn">×</button>
                  </div>
                </div>
              </div>
              
              <!-- 热门搜索 -->
              <div v-if="!searchQuery.trim()" class="suggestions-section">
                <div class="suggestions-header">
                  <TrendingUp class="suggestions-icon" />
                  <span>热门搜索</span>
                </div>
                <div class="suggestions-list">
                  <div 
                    v-for="(term, index) in popularSearches" 
                    :key="index"
                    class="suggestion-item"
                    @click="selectSuggestion(term)"
                  >
                    <TrendingUp class="suggestion-icon" />
                    <span>{{ term }}</span>
                  </div>
                </div>
              </div>
              
              <!-- 搜索建议 -->
              <div v-if="searchSuggestions.length > 0" class="suggestions-section">
                <div class="suggestions-header">
                  <Search class="suggestions-icon" />
                  <span>搜索建议</span>
                </div>
                <div class="suggestions-list">
                  <div 
                    v-for="(suggestion, index) in searchSuggestions.slice(0, 8)" 
                    :key="index"
                    class="suggestion-item"
                    @click="selectSuggestion(suggestion)"
                  >
                    <Search class="suggestion-icon" />
                    <span>{{ suggestion }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <div class="main-content">
      <div class="container">
        <!-- 搜索筛选器 -->
        <section class="filters-section">
          <div class="filters">
            <div class="filter-group">
              <label class="filter-label">分类：</label>
              <select v-model="filters.category" class="filter-select">
                <option value="">全部分类</option>
                <option v-for="category in categories" :key="category.id" :value="category.id">
                  {{ category.name }}
                </option>
              </select>
            </div>
            
            <div class="filter-group">
              <label class="filter-label">价格：</label>
              <div class="filter-options">
                <button 
                  :class="['filter-btn', { active: filters.isFree === true }]"
                  @click="toggleFilter('isFree', true)"
                >
                  免费
                </button>
                <button 
                  :class="['filter-btn', { active: filters.isFree === false }]"
                  @click="toggleFilter('isFree', false)"
                >
                  付费
                </button>
              </div>
            </div>
            
            <div class="filter-group">
              <label class="filter-label">排序：</label>
              <select v-model="sortBy" class="filter-select">
                <option value="relevance">相关性</option>
                <option value="rating">评分</option>
                <option value="name">名称</option>
                <option value="userCount">用户数</option>
                <option value="createdAt">最新</option>
              </select>
            </div>
          </div>
        </section>

        <!-- 搜索结果 -->
        <section class="results-section">
          <div class="results-header">
            <h2 class="results-title">
              搜索结果
              <span class="results-count">({{ filteredTools.length }} 个结果)</span>
            </h2>
            <div class="view-options">
              <button 
                :class="['view-btn', { active: viewMode === 'grid' }]"
                @click="viewMode = 'grid'"
              >
                <Grid class="view-icon" />
              </button>
              <button 
                :class="['view-btn', { active: viewMode === 'list' }]"
                @click="viewMode = 'list'"
              >
                <List class="view-icon" />
              </button>
            </div>
          </div>

          <!-- 搜索结果列表 -->
          <div v-if="filteredTools.length > 0" class="results-content">
            <div :class="['results-grid', { 'list-view': viewMode === 'list' }]">
              <div 
                v-for="tool in paginatedTools" 
                :key="tool.id"
                class="tool-card"
                @click="navigateToTool(tool)"
              >
                <div class="tool-header">
                  <div class="tool-icon">
                    <component :is="tool.icon" class="tool-icon-svg" />
                  </div>
                  <div class="tool-badges">
                    <span v-if="tool.isFree" class="badge free">免费</span>
                    <span v-if="tool.isPopular" class="badge popular">热门</span>
                    <span v-if="tool.isFeatured" class="badge featured">推荐</span>
                  </div>
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
                      <Star class="star-icon" />
                      <span>{{ tool.rating }}</span>
                    </div>
                    <div v-if="tool.userCount" class="user-count">
                      <Users class="users-icon" />
                      <span>{{ tool.userCount }}</span>
                    </div>
                    <div class="category">
                      <Tag class="category-icon" />
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
              </div>
            </div>

            <!-- 分页 -->
            <div v-if="totalPages > 1" class="pagination">
              <button 
                :disabled="currentPage === 1"
                @click="currentPage--"
                class="page-btn"
              >
                上一页
              </button>
              
              <div class="page-numbers">
                <button 
                  v-for="page in visiblePages" 
                  :key="page"
                  :class="['page-number', { active: page === currentPage }]"
                  @click="currentPage = page"
                >
                  {{ page }}
                </button>
              </div>
              
              <button 
                :disabled="currentPage === totalPages"
                @click="currentPage++"
                class="page-btn"
              >
                下一页
              </button>
            </div>
          </div>

          <!-- 无结果 -->
          <div v-else class="no-results">
            <div class="no-results-content">
              <Search class="no-results-icon" />
              <h3>未找到相关工具</h3>
              <p>尝试使用不同的关键词或调整筛选条件</p>
              <button @click="clearFilters" class="clear-filters-btn">
                清除筛选条件
              </button>
            </div>
          </div>
        </section>
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
  Star, 
  Users, 
  Tag, 
  Grid, 
  List,
  Clock,
  TrendingUp
} from 'lucide-vue-next'
import { categories } from '@/data/categories'
import { aiTools } from '@/data/tools'
import Fuse from 'fuse.js'
import type { AITool } from '@/types'

const router = useRouter()
const route = useRoute()

// 响应式数据
const searchQuery = ref('')
const filters = ref({
  category: '',
  isFree: null as boolean | null
})
const sortBy = ref('relevance')
const viewMode = ref<'grid' | 'list'>('grid')
const currentPage = ref(1)
const pageSize = 12

// 搜索建议相关
const showSuggestions = ref(false)
const searchSuggestions = ref<string[]>([])
const searchHistory = ref<string[]>([])
const searchInput = ref<HTMLInputElement>()

// 热门搜索词
const popularSearches = ref([
  'ChatGPT',
  'AI写作',
  'AI绘画',
  '免费工具',
  'AI编程',
  'AI视频',
  'AI办公',
  'AI设计'
])

// 创建Fuse搜索实例
const fuse = new Fuse(aiTools, {
  keys: [
    { name: 'name', weight: 0.3 },
    { name: 'description', weight: 0.2 },
    { name: 'shortDescription', weight: 0.2 },
    { name: 'tags', weight: 0.2 },
    { name: 'features', weight: 0.1 }
  ],
  threshold: 0.3,
  includeScore: true
})

// 计算属性
const filteredTools = computed(() => {
  let results = aiTools

  // 搜索过滤
  if (searchQuery.value.trim()) {
    const searchResults = fuse.search(searchQuery.value)
    results = searchResults.map(result => result.item)
  }

  // 分类过滤
  if (filters.value.category) {
    results = results.filter(tool => tool.category === filters.value.category)
  }

  // 价格过滤
  if (filters.value.isFree !== null) {
    results = results.filter(tool => tool.isFree === filters.value.isFree)
  }

  // 排序
  results = [...results].sort((a, b) => {
    switch (sortBy.value) {
      case 'relevance':
        // 搜索相关性排序（如果有搜索词）
        if (searchQuery.value.trim()) {
          const aScore = fuse.search(searchQuery.value).find(r => r.item.id === a.id)?.score || 1
          const bScore = fuse.search(searchQuery.value).find(r => r.item.id === b.id)?.score || 1
          return aScore - bScore
        }
        return 0
      case 'rating':
        return b.rating - a.rating
      case 'name':
        return a.name.localeCompare(b.name)
      case 'userCount':
        return parseInt(b.userCount || '0') - parseInt(a.userCount || '0')
      case 'createdAt':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      default:
        return 0
    }
  })

  return results
})

const totalPages = computed(() => Math.ceil(filteredTools.value.length / pageSize))

const paginatedTools = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredTools.value.slice(start, end)
})

const visiblePages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  const delta = 2
  
  let start = Math.max(1, current - delta)
  let end = Math.min(total, current + delta)
  
  if (end - start < delta * 2) {
    if (start === 1) {
      end = Math.min(total, start + delta * 2)
    } else {
      start = Math.max(1, end - delta * 2)
    }
  }
  
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})

// 方法
const goBack = () => {
  console.log('返回按钮被点击')
  // 尝试多种返回方法
  try {
    router.back()
  } catch (error) {
    console.log('router.back() 失败，尝试其他方法')
    try {
      router.go(-1)
    } catch (error2) {
      console.log('router.go(-1) 失败，使用原生方法')
      window.history.back()
    }
  }
}

const performSearch = () => {
  currentPage.value = 1
  showSuggestions.value = false
  
  // 添加到搜索历史
  if (searchQuery.value.trim()) {
    addToHistory(searchQuery.value.trim())
  }
  
  // 搜索逻辑已在计算属性中处理
}

// 搜索输入处理
const onSearchInput = () => {
  if (searchQuery.value.trim()) {
    generateSuggestions()
  } else {
    searchSuggestions.value = []
  }
}

// 生成搜索建议
const generateSuggestions = () => {
  const query = searchQuery.value.trim()
  if (!query) {
    searchSuggestions.value = []
    return
  }
  
  // 基于工具名称和标签生成建议
  const suggestions = new Set<string>()
  
  // 从工具名称中提取建议
  aiTools.forEach(tool => {
    if (tool.name.toLowerCase().includes(query.toLowerCase())) {
      suggestions.add(tool.name)
    }
    if (tool.shortDescription.toLowerCase().includes(query.toLowerCase())) {
      suggestions.add(tool.shortDescription)
    }
    tool.tags.forEach(tag => {
      if (tag.toLowerCase().includes(query.toLowerCase())) {
        suggestions.add(tag)
      }
    })
  })
  
  // 从分类中提取建议
  categories.forEach(category => {
    if (category.name.toLowerCase().includes(query.toLowerCase())) {
      suggestions.add(category.name)
    }
  })
  
  searchSuggestions.value = Array.from(suggestions).slice(0, 10)
}

// 选择搜索建议
const selectSuggestion = (suggestion: string) => {
  searchQuery.value = suggestion
  showSuggestions.value = false
  performSearch()
}

// 隐藏建议
const hideSuggestions = () => {
  // 延迟隐藏，让点击事件先执行
  setTimeout(() => {
    showSuggestions.value = false
  }, 200)
}

// 搜索历史管理
const addToHistory = (query: string) => {
  // 移除重复项
  const history = searchHistory.value.filter(item => item !== query)
  // 添加到开头
  history.unshift(query)
  // 限制历史记录数量
  searchHistory.value = history.slice(0, 10)
  // 保存到localStorage
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

const toggleFilter = (key: keyof typeof filters.value, value: boolean) => {
  if (filters.value[key] === value) {
    filters.value[key] = null
  } else {
    filters.value[key] = value
  }
  currentPage.value = 1
}

const getCategoryName = (categoryId: string) => {
  const category = categories.find(cat => cat.id === categoryId)
  return category?.name || categoryId
}

const navigateToTool = (tool: AITool) => {
  router.push({
    name: 'ToolDetail',
    params: { id: tool.id }
  })
}

const clearFilters = () => {
  searchQuery.value = ''
  filters.value = {
    category: '',
    isFree: null
  }
  sortBy.value = 'relevance'
  currentPage.value = 1
}

// 监听器
watch([searchQuery, filters, sortBy], () => {
  currentPage.value = 1
})

// 生命周期
onMounted(() => {
  // 从URL参数获取搜索词
  const query = route.query.q as string
  if (query) {
    searchQuery.value = query
  }
  
  // 加载搜索历史
  const savedHistory = localStorage.getItem('ai-tools-search-history')
  if (savedHistory) {
    try {
      searchHistory.value = JSON.parse(savedHistory)
    } catch (error) {
      console.error('Failed to load search history:', error)
    }
  }
})
</script>

<style scoped>
.search {
  min-height: 100vh;
  background-color: var(--bg-secondary);
}

.header {
  background-color: var(--bg-primary);
  border-bottom: 1px solid var(--border-color);
  padding: 1rem 0;
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
  background-color: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background-color: var(--border-color);
  color: var(--text-primary);
}

.search-container {
  flex: 1;
  max-width: 600px;
  position: relative;
}

.search-bar {
  position: relative;
  display: flex;
  align-items: center;
  background-color: var(--bg-primary);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.search-icon {
  position: absolute;
  left: 1rem;
  width: 20px;
  height: 20px;
  color: var(--text-muted);
}

.search-input {
  flex: 1;
  padding: 1rem 1rem 1rem 3rem;
  border: none;
  outline: none;
  font-size: 1rem;
  background-color: transparent;
}

.search-input:focus {
  outline: none;
}

.search-btn {
  padding: 1rem 1.5rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.search-btn:hover {
  background-color: var(--primary-hover);
}

.main-content {
  padding: 2rem 0;
}

.filters-section {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.filters {
  display: flex;
  gap: 2rem;
  align-items: center;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-label {
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
}

.filter-select {
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

.filter-options {
  display: flex;
  gap: 0.5rem;
}

.filter-btn {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background-color: var(--bg-primary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-btn:hover,
.filter-btn.active {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
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
}

.results-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.results-count {
  color: var(--text-muted);
  font-weight: 400;
}

.view-options {
  display: flex;
  gap: 0.5rem;
}

.view-btn {
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background-color: var(--bg-primary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.view-btn:hover,
.view-btn.active {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.results-grid.list-view {
  grid-template-columns: 1fr;
}

.tool-card {
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tool-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.tool-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.tool-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
}

.tool-icon-svg {
  width: 24px;
  height: 24px;
  color: white;
}

.tool-badges {
  display: flex;
  gap: 0.5rem;
}

.badge {
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 500;
}

.badge.free {
  background-color: var(--success-color);
  color: white;
}

.badge.popular {
  background-color: var(--warning-color);
  color: white;
}

.badge.featured {
  background-color: var(--primary-color);
  color: white;
}

.tool-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.tool-description {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin-bottom: 1rem;
  line-height: 1.5;
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

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
}

.page-btn {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background-color: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.page-btn:hover:not(:disabled) {
  background-color: var(--bg-tertiary);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 0.5rem;
}

.page-number {
  width: 40px;
  height: 40px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background-color: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-number:hover,
.page-number.active {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.no-results {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
}

.no-results-content {
  text-align: center;
}

.no-results-icon {
  width: 64px;
  height: 64px;
  color: var(--text-muted);
  margin-bottom: 1rem;
}

.no-results-content h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.no-results-content p {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}

.clear-filters-btn {
  padding: 0.75rem 1.5rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.clear-filters-btn:hover {
  background-color: var(--primary-hover);
}

/* 搜索建议样式 */
.search-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-top: none;
  border-radius: 0 0 var(--radius-lg) var(--radius-lg);
  box-shadow: var(--shadow-lg);
  z-index: 1000;
  max-height: 400px;
  overflow-y: auto;
}

.suggestions-section {
  border-bottom: 1px solid var(--border-color);
}

.suggestions-section:last-child {
  border-bottom: none;
}

.suggestions-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
  background-color: var(--bg-tertiary);
}

.suggestions-icon {
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
  padding: 0.5rem 0;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  position: relative;
}

.suggestion-item:hover {
  background-color: var(--bg-tertiary);
}

.suggestion-icon {
  width: 16px;
  height: 16px;
  color: var(--text-muted);
  flex-shrink: 0;
}

.suggestion-item span {
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

@media (max-width: 768px) {
  .header {
    padding: 0.75rem 0;
  }
  
  .header-content {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .back-btn {
    align-self: flex-start;
    padding: 0.375rem 0.75rem;
    font-size: 0.875rem;
  }
  
  .search-container {
    width: 100%;
    max-width: none;
  }
  
  .search-input {
    padding: 0.75rem 2.5rem 0.75rem 0.75rem;
    font-size: 0.875rem;
  }
  
  .search-btn {
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
  }
  
  .main-content {
    padding: 1rem 0;
  }
  
  .filters-section {
    padding: 1rem;
    margin-bottom: 1rem;
  }
  
  .filters {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .filter-group {
    width: 100%;
  }
  
  .filter-options {
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .filter-btn {
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
  }
  
  .filter-select {
    width: 100%;
    padding: 0.5rem;
  }
  
  .results-section {
    padding: 1rem;
  }
  
  .results-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .results-title {
    font-size: 1.125rem;
  }
  
  .results-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .tool-card {
    padding: 1rem;
  }
  
  .tool-header {
    margin-bottom: 0.75rem;
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
    margin-bottom: 0.75rem;
  }
  
  .tool-features {
    margin-bottom: 0.75rem;
  }
  
  .feature-tag {
    font-size: 0.6875rem;
    padding: 0.1875rem 0.375rem;
  }
  
  .tool-meta {
    gap: 0.75rem;
    margin-bottom: 0.75rem;
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
  
  .pagination {
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .page-btn {
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
  }
  
  .page-number {
    width: 36px;
    height: 36px;
    font-size: 0.875rem;
  }
  
  .search-suggestions {
    max-height: 300px;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 0.5rem;
  }
  
  .header {
    padding: 0.5rem 0;
  }
  
  .search-input {
    padding: 0.625rem 2.25rem 0.625rem 0.625rem;
    font-size: 0.8125rem;
  }
  
  .search-btn {
    padding: 0.625rem 0.75rem;
    font-size: 0.8125rem;
  }
  
  .filters-section {
    padding: 0.75rem;
  }
  
  .filter-btn {
    padding: 0.375rem 0.625rem;
    font-size: 0.8125rem;
  }
  
  .results-section {
    padding: 0.75rem;
  }
  
  .tool-card {
    padding: 0.75rem;
  }
  
  .tool-icon {
    width: 36px;
    height: 36px;
  }
  
  .tool-icon-svg {
    width: 18px;
    height: 18px;
  }
  
  .tool-name {
    font-size: 0.875rem;
  }
  
  .tool-description {
    font-size: 0.75rem;
  }
  
  .feature-tag {
    font-size: 0.625rem;
    padding: 0.125rem 0.25rem;
  }
  
  .rating,
  .user-count,
  .category {
    font-size: 0.75rem;
  }
  
  .tag {
    font-size: 0.625rem;
    padding: 0.125rem 0.25rem;
  }
}
</style>
