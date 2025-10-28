<template>
  <div class="mobile-nav">
    <!-- 移动端顶部导航栏 -->
    <header class="mobile-header">
      <div class="mobile-header-content">
        <button @click="toggleMenu" class="menu-toggle" :class="{ active: isMenuOpen }">
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
        </button>
        
        <div class="mobile-logo">
          <div class="logo-icon">
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
              <path d="M16 2L20 8H28L24 14L28 20H20L16 26L12 20H4L8 14L4 8H12L16 2Z" fill="currentColor"/>
            </svg>
          </div>
          <span class="logo-text">AI工具集</span>
        </div>
        
        <div class="mobile-header-actions">
          <button @click="toggleSearch" class="search-toggle">
            <Search class="search-icon" />
          </button>
          <button @click="toggleUserMenu" class="user-toggle">
            <User class="user-icon" />
          </button>
        </div>
      </div>
    </header>

    <!-- 移动端侧边菜单 -->
    <div v-if="isMenuOpen" class="mobile-menu-overlay" @click="closeMenu">
      <div class="mobile-menu" @click.stop>
        <div class="mobile-menu-header">
          <h3>AI工具分类</h3>
          <button @click="closeMenu" class="close-btn">
            <X class="close-icon" />
          </button>
        </div>
        
        <nav class="mobile-menu-nav">
          <div 
            v-for="category in categories" 
            :key="category.id"
            class="mobile-nav-item"
            @click="navigateToCategory(category)"
          >
            <div class="mobile-nav-icon" :style="{ backgroundColor: category.color + '20', color: category.color }">
              <component :is="category.icon" class="icon" />
            </div>
            <div class="mobile-nav-content">
              <span class="mobile-nav-text">{{ category.name }}</span>
              <span class="mobile-nav-count">{{ category.toolCount }}个工具</span>
            </div>
            <ChevronRight class="mobile-nav-arrow" />
          </div>
        </nav>
      </div>
    </div>

    <!-- 移动端搜索框 -->
    <div v-if="isSearchOpen" class="mobile-search-overlay" @click="closeSearch">
      <div class="mobile-search" @click.stop>
        <div class="mobile-search-header">
          <div class="mobile-search-bar">
            <Search class="search-icon" />
            <input 
              type="text" 
              placeholder="搜索AI工具..." 
              v-model="searchQuery"
              @keyup.enter="performSearch"
              @input="onSearchInput"
              @focus="showSuggestions = true"
              @blur="hideSuggestions"
              class="mobile-search-input"
              ref="searchInput"
            />
            <button @click="performSearch" class="mobile-search-btn">搜索</button>
          </div>
          <button @click="closeSearch" class="close-search-btn">
            <X class="close-icon" />
          </button>
        </div>
        
        <!-- 移动端搜索建议 -->
        <div v-if="showSuggestions && (searchSuggestions.length > 0 || searchHistory.length > 0)" class="mobile-search-suggestions">
          <!-- 搜索历史 -->
          <div v-if="searchHistory.length > 0 && !searchQuery.trim()" class="mobile-suggestions-section">
            <div class="mobile-suggestions-header">
              <Clock class="suggestions-icon" />
              <span>搜索历史</span>
              <button @click="clearHistory" class="clear-history-btn">清除</button>
            </div>
            <div class="mobile-suggestions-list">
              <div 
                v-for="(item, index) in searchHistory.slice(0, 5)" 
                :key="index"
                class="mobile-suggestion-item"
                @click="selectSuggestion(item)"
              >
                <Clock class="suggestion-icon" />
                <span>{{ item }}</span>
                <button @click.stop="removeFromHistory(item)" class="remove-btn">×</button>
              </div>
            </div>
          </div>
          
          <!-- 热门搜索 -->
          <div v-if="!searchQuery.trim()" class="mobile-suggestions-section">
            <div class="mobile-suggestions-header">
              <TrendingUp class="suggestions-icon" />
              <span>热门搜索</span>
            </div>
            <div class="mobile-suggestions-list">
              <div 
                v-for="(term, index) in popularSearches" 
                :key="index"
                class="mobile-suggestion-item"
                @click="selectSuggestion(term)"
              >
                <TrendingUp class="suggestion-icon" />
                <span>{{ term }}</span>
              </div>
            </div>
          </div>
          
          <!-- 搜索建议 -->
          <div v-if="searchSuggestions.length > 0" class="mobile-suggestions-section">
            <div class="mobile-suggestions-header">
              <Search class="suggestions-icon" />
              <span>搜索建议</span>
            </div>
            <div class="mobile-suggestions-list">
              <div 
                v-for="(suggestion, index) in searchSuggestions.slice(0, 8)" 
                :key="index"
                class="mobile-suggestion-item"
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

    <!-- 移动端用户菜单 -->
    <div v-if="isUserMenuOpen" class="mobile-user-overlay" @click="closeUserMenu">
      <div class="mobile-user-menu" @click.stop>
        <div class="mobile-user-header">
          <div v-if="isAuthenticated" class="user-info">
            <img 
              :src="user?.avatar || defaultAvatar" 
              :alt="user?.username"
              class="user-avatar"
            />
            <div class="user-details">
              <h4 class="user-name">{{ user?.username }}</h4>
              <p class="user-email">{{ user?.email }}</p>
            </div>
          </div>
          <div v-else class="user-info">
            <div class="user-avatar">
              <User class="avatar-icon" :size="24" />
            </div>
            <div class="user-details">
              <h4 class="user-name">未登录</h4>
              <p class="user-email">点击登录享受更多功能</p>
            </div>
          </div>
          <button @click="closeUserMenu" class="close-btn">
            <X class="close-icon" />
          </button>
        </div>
        
        <nav class="mobile-user-nav">
          <div v-if="isAuthenticated" class="user-menu-items">
            <router-link to="/profile" class="user-menu-item" @click="closeUserMenu">
              <User class="menu-icon" :size="20" />
              <span>个人中心</span>
            </router-link>
            <router-link to="/favorites" class="user-menu-item" @click="closeUserMenu">
              <Heart class="menu-icon" :size="20" />
              <span>我的收藏</span>
            </router-link>
            <router-link to="/history" class="user-menu-item" @click="closeUserMenu">
              <History class="menu-icon" :size="20" />
              <span>使用历史</span>
            </router-link>
            <router-link to="/ratings" class="user-menu-item" @click="closeUserMenu">
              <Star class="menu-icon" :size="20" />
              <span>我的评分</span>
            </router-link>
            <div class="menu-divider"></div>
            <button @click="handleLogout" class="user-menu-item logout-item">
              <LogOut class="menu-icon" :size="20" />
              <span>退出登录</span>
            </button>
          </div>
          <div v-else class="user-menu-items">
            <router-link to="/login" class="user-menu-item" @click="closeUserMenu">
              <LogIn class="menu-icon" :size="20" />
              <span>登录</span>
            </router-link>
            <router-link to="/register" class="user-menu-item" @click="closeUserMenu">
              <UserPlus class="menu-icon" :size="20" />
              <span>注册</span>
            </router-link>
          </div>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Search, 
  X, 
  ChevronRight,
  Clock,
  TrendingUp,
  User,
  Heart,
  History,
  Star,
  LogIn,
  LogOut,
  UserPlus
} from 'lucide-vue-next'
import { categories } from '@/data/categories'
import { aiTools } from '@/data/tools'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const { user, isAuthenticated, logout } = useAuth()
const { success } = useToast()

// 响应式数据
const isMenuOpen = ref(false)
const isSearchOpen = ref(false)
const isUserMenuOpen = ref(false)
const searchQuery = ref('')
const showSuggestions = ref(false)
const searchSuggestions = ref<string[]>([])
const searchHistory = ref<string[]>([])
const searchInput = ref<HTMLInputElement>()

const defaultAvatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'

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

// 方法
const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
  if (isMenuOpen.value) {
    isSearchOpen.value = false
  }
}

const closeMenu = () => {
  isMenuOpen.value = false
}

const toggleSearch = () => {
  isSearchOpen.value = !isSearchOpen.value
  if (isSearchOpen.value) {
    isMenuOpen.value = false
    isUserMenuOpen.value = false
    // 延迟聚焦搜索框
    setTimeout(() => {
      searchInput.value?.focus()
    }, 100)
  }
}

const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value
  if (isUserMenuOpen.value) {
    isMenuOpen.value = false
    isSearchOpen.value = false
  }
}

const closeUserMenu = () => {
  isUserMenuOpen.value = false
}

const handleLogout = () => {
  logout()
  success('已退出登录')
  closeUserMenu()
}

const closeSearch = () => {
  isSearchOpen.value = false
}

const navigateToCategory = (category: any) => {
  router.push({
    name: 'Category',
    params: { id: category.id }
  })
  closeMenu()
}

// 搜索相关方法
const performSearch = () => {
  if (searchQuery.value.trim()) {
    addToHistory(searchQuery.value.trim())
    router.push({
      name: 'Search',
      query: { q: searchQuery.value }
    })
  }
  closeSearch()
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
  
  const suggestions = new Set<string>()
  
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
  
  categories.forEach(category => {
    if (category.name.toLowerCase().includes(query.toLowerCase())) {
      suggestions.add(category.name)
    }
  })
  
  searchSuggestions.value = Array.from(suggestions).slice(0, 10)
}

const selectSuggestion = (suggestion: string) => {
  searchQuery.value = suggestion
  showSuggestions.value = false
  performSearch()
}

const hideSuggestions = () => {
  setTimeout(() => {
    showSuggestions.value = false
  }, 200)
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

onMounted(() => {
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
.mobile-nav {
  display: none;
}

.mobile-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background-color: var(--bg-primary);
  border-bottom: 1px solid var(--border-color);
  z-index: 1000;
  height: 60px;
}

.mobile-header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  padding: 0 1rem;
}

.menu-toggle {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.hamburger-line {
  width: 20px;
  height: 2px;
  background-color: var(--text-primary);
  margin: 2px 0;
  transition: all 0.3s ease;
  transform-origin: center;
}

.menu-toggle.active .hamburger-line:nth-child(1) {
  transform: rotate(45deg) translate(5px, 5px);
}

.menu-toggle.active .hamburger-line:nth-child(2) {
  opacity: 0;
}

.menu-toggle.active .hamburger-line:nth-child(3) {
  transform: rotate(-45deg) translate(7px, -6px);
}

.mobile-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--primary-color);
}

.logo-icon {
  width: 24px;
  height: 24px;
  color: var(--primary-color);
}

.search-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-primary);
}

.search-icon {
  width: 20px;
  height: 20px;
}

.mobile-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1001;
  display: flex;
  justify-content: flex-start;
}

.mobile-menu {
  width: 280px;
  height: 100%;
  background-color: var(--bg-primary);
  overflow-y: auto;
  animation: slideInLeft 0.3s ease-out;
}

@keyframes slideInLeft {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}

.mobile-menu-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.mobile-menu-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-muted);
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
}

.close-btn:hover {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
}

.close-icon {
  width: 18px;
  height: 18px;
}

.mobile-menu-nav {
  padding: 0.5rem 0;
}

.mobile-nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-bottom: 1px solid var(--border-color);
}

.mobile-nav-item:hover {
  background-color: var(--bg-tertiary);
}

.mobile-nav-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
}

.mobile-nav-icon .icon {
  width: 20px;
  height: 20px;
}

.mobile-nav-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.mobile-nav-text {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 0.875rem;
}

.mobile-nav-count {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.mobile-nav-arrow {
  width: 16px;
  height: 16px;
  color: var(--text-muted);
}

.mobile-search-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1002;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 80px;
}

.mobile-search {
  width: 90%;
  max-width: 500px;
  background-color: var(--bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  animation: slideInDown 0.3s ease-out;
}

@keyframes slideInDown {
  from {
    transform: translateY(-50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.mobile-search-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.mobile-search-bar {
  flex: 1;
  display: flex;
  align-items: center;
  background-color: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.mobile-search-bar .search-icon {
  padding: 0.75rem;
  color: var(--text-muted);
}

.mobile-search-input {
  flex: 1;
  padding: 0.75rem 0;
  border: none;
  outline: none;
  background: transparent;
  font-size: 1rem;
}

.mobile-search-btn {
  padding: 0.75rem 1rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.mobile-search-btn:hover {
  background-color: var(--primary-hover);
}

.close-search-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-muted);
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
}

.close-search-btn:hover {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
}

.mobile-search-suggestions {
  max-height: 400px;
  overflow-y: auto;
}

.mobile-suggestions-section {
  border-bottom: 1px solid var(--border-color);
}

.mobile-suggestions-section:last-child {
  border-bottom: none;
}

.mobile-suggestions-header {
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

.mobile-suggestions-list {
  padding: 0.5rem 0;
}

.mobile-suggestion-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  position: relative;
}

.mobile-suggestion-item:hover {
  background-color: var(--bg-tertiary);
}

.suggestion-icon {
  width: 16px;
  height: 16px;
  color: var(--text-muted);
  flex-shrink: 0;
}

.mobile-suggestion-item span {
  flex: 1;
  color: var(--text-primary);
  font-size: 0.875rem;
}

.remove-btn {
  width: 24px;
  height: 24px;
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

/* 用户菜单样式 */
.mobile-header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.user-toggle {
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

.user-toggle:hover {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
}

.user-icon {
  width: 20px;
  height: 20px;
}

.mobile-user-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 1rem;
}

.mobile-user-menu {
  background-color: var(--bg-primary);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  width: 100%;
  max-width: 400px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: var(--shadow-xl);
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.mobile-user-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  position: relative;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-tertiary);
}

.avatar-icon {
  color: var(--text-muted);
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-email {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mobile-user-nav {
  padding: 1rem 0;
}

.user-menu-items {
  display: flex;
  flex-direction: column;
}

.user-menu-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  color: var(--text-primary);
  text-decoration: none;
  transition: background-color 0.2s ease;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  font-size: 0.875rem;
}

.user-menu-item:hover {
  background-color: var(--bg-tertiary);
}

.logout-item {
  color: var(--error-color);
}

.logout-item:hover {
  background-color: rgba(239, 68, 68, 0.1);
}

.menu-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.menu-divider {
  height: 1px;
  background-color: var(--border-color);
  margin: 0.5rem 0;
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
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

.close-btn:hover {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
}

.close-icon {
  width: 18px;
  height: 18px;
}

/* 移动端显示 */
@media (max-width: 768px) {
  .mobile-nav {
    display: block;
  }
}
</style>
