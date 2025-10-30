<template>
  <div class="enhanced-search">
    <!-- 搜索输入框 -->
    <div class="search-container">
      <div class="search-input-wrapper">
        <Search class="search-icon" :size="20" />
        <input
          v-model="searchQuery"
          type="text"
          class="search-input"
          :placeholder="placeholder"
          @input="onSearchInput"
          @focus="onSearchFocus"
          @blur="onSearchBlur"
          @keydown="onKeyDown"
          ref="searchInputRef"
        />
        <button 
          v-if="searchQuery" 
          @click="clearSearch" 
          class="clear-btn"
        >
          <X class="clear-icon" :size="16" />
        </button>
        <button 
          @click="performSearch" 
          class="search-btn"
          :disabled="!searchQuery.trim()"
        >
          <Search class="search-btn-icon" :size="16" />
        </button>
      </div>
      
      <!-- 搜索建议下拉框 -->
      <div v-if="showSuggestions && suggestions.length > 0" class="suggestions-dropdown">
        <div class="suggestions-header">
          <span class="suggestions-title">搜索建议</span>
          <button @click="hideSuggestions" class="close-suggestions-btn">
            <X class="close-icon" :size="14" />
          </button>
        </div>
        
        <div class="suggestions-list">
          <div
            v-for="(suggestion, index) in suggestions"
            :key="suggestion.id || index"
            class="suggestion-item"
            :class="{ active: selectedIndex === index }"
            @click="selectSuggestion(suggestion)"
            @mouseenter="selectedIndex = index"
          >
            <div class="suggestion-content">
              <div class="suggestion-icon">
                <component 
                  :is="getSuggestionIcon(suggestion.type)" 
                  :size="16" 
                />
              </div>
              <div class="suggestion-text">
                <div class="suggestion-title">{{ suggestion.title }}</div>
                <div v-if="suggestion.description" class="suggestion-description">
                  {{ suggestion.description }}
                </div>
                <div v-if="suggestion.category" class="suggestion-meta">
                  <span class="suggestion-category">{{ suggestion.category }}</span>
                  <span v-if="suggestion.rating" class="suggestion-rating">
                    <Star class="rating-icon" :size="12" />
                    {{ suggestion.rating }}
                  </span>
                </div>
              </div>
            </div>
            <div class="suggestion-action">
              <ArrowRight class="action-icon" :size="14" />
            </div>
          </div>
        </div>
        
        <!-- 搜索历史 -->
        <div v-if="searchHistory.length > 0" class="search-history">
          <div class="history-header">
            <Clock class="history-icon" :size="14" />
            <span class="history-title">搜索历史</span>
            <button @click="clearHistory" class="clear-history-btn">
              <Trash2 class="clear-icon" :size="12" />
            </button>
          </div>
          <div class="history-list">
            <div
              v-for="(historyItem, index) in searchHistory.slice(0, 5)"
              :key="index"
              class="history-item"
              @click="selectHistoryItem(historyItem)"
            >
              <Clock class="history-item-icon" :size="12" />
              <span class="history-text">{{ historyItem.query }}</span>
              <span class="history-time">{{ formatTime(historyItem.timestamp) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 搜索过滤器 -->
    <div v-if="showFilters" class="search-filters">
      <div class="filters-row">
        <div class="filter-group">
          <label class="filter-label">类型</label>
          <select v-model="filters.type" class="filter-select">
            <option value="">全部</option>
            <option value="tools">工具</option>
            <option value="categories">分类</option>
            <option value="tags">标签</option>
            <option value="comments">评论</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label class="filter-label">分类</label>
          <select v-model="filters.category" class="filter-select">
            <option value="">全部分类</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">
              {{ cat.name }}
            </option>
          </select>
        </div>
        
        <div class="filter-group">
          <label class="filter-label">排序</label>
          <select v-model="filters.sortBy" class="filter-select">
            <option value="relevance">相关度</option>
            <option value="rating">评分</option>
            <option value="popularity">热度</option>
            <option value="newest">最新</option>
            <option value="oldest">最早</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label class="filter-label">价格</label>
          <select v-model="filters.pricing" class="filter-select">
            <option value="">全部价格</option>
            <option value="free">免费</option>
            <option value="freemium">免费+付费</option>
            <option value="paid">付费</option>
          </select>
        </div>
        
        <button @click="clearFilters" class="clear-filters-btn">
          <X class="btn-icon" :size="14" />
          清除筛选
        </button>
      </div>
    </div>
    
    <!-- 搜索统计 -->
    <div v-if="searchResults && searchResults.length > 0" class="search-stats">
      <div class="stats-content">
        <span class="results-count">
          找到 {{ totalResults }} 个结果
        </span>
        <span class="search-time">
          用时 {{ searchTime }}ms
        </span>
        <div class="search-actions">
          <button @click="toggleFilters" class="toggle-filters-btn">
            <Filter class="btn-icon" :size="14" />
            {{ showFilters ? '隐藏筛选' : '显示筛选' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Search, 
  X, 
  ArrowRight, 
  Clock, 
  Trash2, 
  Star, 
  Filter,
  Bot,
  Tag,
  Folder,
  MessageCircle
} from 'lucide-vue-next'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'
import { categories } from '@/data/categories'

interface Props {
  placeholder?: string
  autoFocus?: boolean
  showFilters?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '搜索AI工具、分类、标签...',
  autoFocus: false,
  showFilters: false
})

const emit = defineEmits<{
  search: [query: string, filters: any]
  suggestionSelect: [suggestion: any]
}>()

const router = useRouter()
const { apiRequest } = useAuth()
const { success, error } = useToast()

// 响应式数据
const searchQuery = ref('')
const searchInputRef = ref<HTMLInputElement>()
const showSuggestions = ref(false)
const suggestions = ref<any[]>([])
const selectedIndex = ref(-1)
const searchHistory = ref<any[]>([])
const searchResults = ref<any[]>([])
const totalResults = ref(0)
const searchTime = ref(0)
const showFilters = ref(props.showFilters)

const filters = reactive({
  type: '',
  category: '',
  sortBy: 'relevance',
  pricing: ''
})

// 搜索防抖
let searchTimeout: NodeJS.Timeout
let suggestionTimeout: NodeJS.Timeout

// 方法
const onSearchInput = () => {
  if (searchQuery.value.trim()) {
    // 防抖搜索建议
    clearTimeout(suggestionTimeout)
    suggestionTimeout = setTimeout(() => {
      loadSuggestions()
    }, 300)
  } else {
    suggestions.value = []
    showSuggestions.value = false
  }
}

const onSearchFocus = () => {
  if (searchQuery.value.trim()) {
    showSuggestions.value = true
  }
  loadSearchHistory()
}

const onSearchBlur = () => {
  // 延迟隐藏，让点击事件能够触发
  setTimeout(() => {
    showSuggestions.value = false
  }, 200)
}

const onKeyDown = (event: KeyboardEvent) => {
  if (!showSuggestions.value || suggestions.value.length === 0) {
    if (event.key === 'Enter') {
      performSearch()
    }
    return
  }

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      selectedIndex.value = Math.min(selectedIndex.value + 1, suggestions.value.length - 1)
      break
    case 'ArrowUp':
      event.preventDefault()
      selectedIndex.value = Math.max(selectedIndex.value - 1, -1)
      break
    case 'Enter':
      event.preventDefault()
      if (selectedIndex.value >= 0) {
        selectSuggestion(suggestions.value[selectedIndex.value])
      } else {
        performSearch()
      }
      break
    case 'Escape':
      hideSuggestions()
      break
  }
}

const loadSuggestions = async () => {
  try {
    const response = await apiRequest(`/search/suggestions?q=${encodeURIComponent(searchQuery.value)}`)
    
    if (response.success) {
      suggestions.value = response.data.suggestions
      showSuggestions.value = true
      selectedIndex.value = -1
    }
  } catch (err) {
    console.error('加载搜索建议失败:', err)
  }
}

const selectSuggestion = (suggestion: any) => {
  searchQuery.value = suggestion.title
  hideSuggestions()
  
  // 根据建议类型执行不同操作
  if (suggestion.type === 'tool') {
    router.push(`/tool/${suggestion.id}`)
  } else if (suggestion.type === 'category') {
    router.push(`/category/${suggestion.id}`)
  } else {
    // 其他类型，执行搜索
    performSearch()
  }
  
  emit('suggestionSelect', suggestion)
}

const selectHistoryItem = (historyItem: any) => {
  searchQuery.value = historyItem.query
  hideSuggestions()
  performSearch()
}

const performSearch = () => {
  if (!searchQuery.value.trim()) return
  
  const startTime = Date.now()
  
  // 保存搜索历史
  saveSearchHistory(searchQuery.value.trim())
  
  // 隐藏建议
  hideSuggestions()
  
  // 执行搜索
  emit('search', searchQuery.value.trim(), { ...filters })
  
  // 计算搜索时间
  searchTime.value = Date.now() - startTime
}

const clearSearch = () => {
  searchQuery.value = ''
  suggestions.value = []
  showSuggestions.value = false
  selectedIndex.value = -1
}

const hideSuggestions = () => {
  showSuggestions.value = false
  selectedIndex.value = -1
}

const toggleFilters = () => {
  showFilters.value = !showFilters.value
}

const clearFilters = () => {
  filters.type = ''
  filters.category = ''
  filters.sortBy = 'relevance'
  filters.pricing = ''
}

const getSuggestionIcon = (type: string) => {
  const iconMap: Record<string, any> = {
    tool: Bot,
    category: Folder,
    tag: Tag,
    comment: MessageCircle
  }
  return iconMap[type] || Search
}

const loadSearchHistory = () => {
  try {
    const history = localStorage.getItem('searchHistory')
    if (history) {
      searchHistory.value = JSON.parse(history)
    }
  } catch (err) {
    console.error('加载搜索历史失败:', err)
  }
}

const saveSearchHistory = (query: string) => {
  try {
    const history = [...searchHistory.value]
    
    // 移除重复项
    const existingIndex = history.findIndex(item => item.query === query)
    if (existingIndex >= 0) {
      history.splice(existingIndex, 1)
    }
    
    // 添加到开头
    history.unshift({
      query,
      timestamp: Date.now()
    })
    
    // 限制历史记录数量
    if (history.length > 20) {
      history.splice(20)
    }
    
    searchHistory.value = history
    localStorage.setItem('searchHistory', JSON.stringify(history))
  } catch (err) {
    console.error('保存搜索历史失败:', err)
  }
}

const clearHistory = () => {
  searchHistory.value = []
  localStorage.removeItem('searchHistory')
}

const formatTime = (timestamp: number) => {
  const now = Date.now()
  const diff = now - timestamp
  
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
    return new Date(timestamp).toLocaleDateString('zh-CN')
  }
}

// 暴露方法给父组件
defineExpose({
  focus: () => searchInputRef.value?.focus(),
  clear: clearSearch,
  setQuery: (query: string) => {
    searchQuery.value = query
  }
})

// 初始化
onMounted(() => {
  if (props.autoFocus) {
    nextTick(() => {
      searchInputRef.value?.focus()
    })
  }
})
</script>

<style scoped>
.enhanced-search {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.search-container {
  position: relative;
  width: 100%;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background-color: var(--bg-primary);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 0.75rem 1rem;
  transition: all 0.2s ease;
}

.search-input-wrapper:focus-within {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.search-icon {
  color: var(--text-muted);
  margin-right: 0.75rem;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  background: none;
  color: var(--text-primary);
  font-size: 1rem;
  line-height: 1.5;
}

.search-input::placeholder {
  color: var(--text-muted);
}

.clear-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
  margin-right: 0.5rem;
}

.clear-btn:hover {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
}

.search-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
}

.search-btn:hover:not(:disabled) {
  background-color: var(--primary-hover);
  transform: translateY(-1px);
}

.search-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.search-btn-icon {
  width: 16px;
  height: 16px;
}

.suggestions-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  z-index: 1000;
  margin-top: 0.5rem;
  max-height: 400px;
  overflow-y: auto;
}

.suggestions-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--bg-tertiary);
}

.suggestions-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
}

.close-suggestions-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
}

.close-suggestions-btn:hover {
  background-color: var(--border-color);
  color: var(--text-primary);
}

.suggestions-list {
  padding: 0.5rem 0;
}

.suggestion-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.suggestion-item:hover,
.suggestion-item.active {
  background-color: var(--bg-tertiary);
}

.suggestion-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  min-width: 0;
}

.suggestion-icon {
  color: var(--text-muted);
  flex-shrink: 0;
}

.suggestion-text {
  flex: 1;
  min-width: 0;
}

.suggestion-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.suggestion-description {
  font-size: 0.75rem;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.suggestion-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.suggestion-category {
  font-size: 0.75rem;
  color: var(--text-muted);
  background-color: var(--bg-tertiary);
  padding: 0.125rem 0.375rem;
  border-radius: var(--radius-sm);
}

.suggestion-rating {
  display: flex;
  align-items: center;
  gap: 0.125rem;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.rating-icon {
  color: #fbbf24;
}

.suggestion-action {
  color: var(--text-muted);
  flex-shrink: 0;
}

.action-icon {
  width: 14px;
  height: 14px;
}

.search-history {
  border-top: 1px solid var(--border-color);
  padding: 0.5rem 0;
}

.history-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  color: var(--text-muted);
  font-size: 0.75rem;
}

.history-icon {
  width: 14px;
  height: 14px;
}

.history-title {
  font-weight: 500;
}

.clear-history-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
  margin-left: auto;
}

.clear-history-btn:hover {
  background-color: var(--border-color);
  color: var(--text-primary);
}

.history-list {
  padding: 0;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.history-item:hover {
  background-color: var(--bg-tertiary);
}

.history-item-icon {
  color: var(--text-muted);
  flex-shrink: 0;
}

.history-text {
  flex: 1;
  font-size: 0.875rem;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.history-time {
  font-size: 0.75rem;
  color: var(--text-muted);
  flex-shrink: 0;
}

.search-filters {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1rem;
  margin-top: 1rem;
}

.filters-row {
  display: flex;
  gap: 1rem;
  align-items: end;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 120px;
}

.filter-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
}

.filter-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: all 0.2s ease;
}

.filter-select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.clear-filters-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: none;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  height: fit-content;
}

.clear-filters-btn:hover {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
}

.btn-icon {
  width: 14px;
  height: 14px;
}

.search-stats {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 0.75rem 1rem;
  margin-top: 1rem;
}

.stats-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.results-count {
  font-size: 0.875rem;
  color: var(--text-primary);
  font-weight: 500;
}

.search-time {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.search-actions {
  display: flex;
  gap: 0.5rem;
}

.toggle-filters-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: none;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.toggle-filters-btn:hover {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
}

/* 移动端优化 */
@media (max-width: 768px) {
  .enhanced-search {
    max-width: 100%;
  }
  
  .search-input-wrapper {
    padding: 0.625rem 0.75rem;
  }
  
  .search-input {
    font-size: 0.875rem;
  }
  
  .filters-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-group {
    min-width: auto;
  }
  
  .stats-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .search-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>