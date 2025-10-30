<template>
  <div class="mobile-nav">
    <!-- 顶部导航栏 -->
    <header class="mobile-header">
      <div class="header-content">
        <button @click="toggleSidebar" class="menu-btn">
          <Menu v-if="!sidebarOpen" class="menu-icon" :size="24" />
          <X v-else class="menu-icon" :size="24" />
        </button>
        
        <div class="logo">
          <div class="logo-icon">
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
              <path d="M16 2L20 8H28L24 14L28 20H20L16 26L12 20H4L8 14L4 8H12L16 2Z" fill="currentColor"/>
            </svg>
          </div>
          <span class="logo-text">AI工具集</span>
        </div>
        
        <div class="header-actions">
          <button @click="toggleSearch" class="search-btn">
            <Search class="search-icon" :size="20" />
          </button>
          <button v-if="isAuthenticated" @click="toggleUserMenu" class="user-btn">
            <img 
              :src="user?.avatar || defaultAvatar" 
              :alt="user?.username"
              class="user-avatar"
            />
          </button>
          <button v-else @click="goToLogin" class="login-btn">
            登录
          </button>
        </div>
      </div>
    </header>

    <!-- 搜索栏 -->
    <div v-if="showSearch" class="mobile-search">
      <div class="search-container">
        <input
          v-model="searchQuery"
          @keyup.enter="handleSearch"
          @input="onSearchInput"
          type="text"
          placeholder="搜索AI工具..."
          class="search-input"
          ref="searchInput"
        />
        <button @click="handleSearch" class="search-submit">
          <Search class="search-icon" :size="18" />
        </button>
        <button @click="toggleSearch" class="search-cancel">
          <X class="cancel-icon" :size="18" />
        </button>
      </div>
      
      <!-- 搜索建议 -->
      <div v-if="searchSuggestions.length > 0 || searchHistory.length > 0" class="search-suggestions">
        <div v-if="searchHistory.length > 0 && !searchQuery.trim()" class="suggestions-section">
          <div class="suggestions-header">
            <Clock class="suggestions-icon" :size="16" />
            <span>搜索历史</span>
            <button @click="clearHistory" class="clear-btn">清除</button>
          </div>
          <div class="suggestions-list">
            <div 
              v-for="(item, index) in searchHistory.slice(0, 5)" 
              :key="index"
              class="suggestion-item"
              @click="selectSuggestion(item)"
            >
              <Clock class="suggestion-icon" :size="14" />
              <span>{{ item }}</span>
              <button @click.stop="removeFromHistory(item)" class="remove-btn">×</button>
            </div>
          </div>
        </div>
        
        <div v-if="searchSuggestions.length > 0" class="suggestions-section">
          <div class="suggestions-header">
            <Search class="suggestions-icon" :size="16" />
            <span>搜索建议</span>
          </div>
          <div class="suggestions-list">
            <div 
              v-for="(suggestion, index) in searchSuggestions.slice(0, 8)" 
              :key="index"
              class="suggestion-item"
              @click="selectSuggestion(suggestion)"
            >
              <Search class="suggestion-icon" :size="14" />
              <span>{{ suggestion }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 侧边栏 -->
    <div v-if="sidebarOpen" class="mobile-sidebar" @click="closeSidebar">
      <div class="sidebar-content" @click.stop>
        <div class="sidebar-header">
          <div class="user-info" v-if="isAuthenticated">
            <img 
              :src="user?.avatar || defaultAvatar" 
              :alt="user?.username"
              class="user-avatar"
            />
            <div class="user-details">
              <h3 class="username">{{ user?.username }}</h3>
              <p class="user-email">{{ user?.email }}</p>
            </div>
          </div>
          <div v-else class="login-prompt">
            <button @click="goToLogin" class="login-btn">
              <User class="btn-icon" :size="16" />
              登录
            </button>
          </div>
        </div>
        
        <nav class="sidebar-nav">
          <div class="nav-section">
            <h4 class="nav-title">主要功能</h4>
            <div class="nav-items">
              <router-link to="/" class="nav-item" @click="closeSidebar">
                <Home class="nav-icon" :size="18" />
                <span>首页</span>
              </router-link>
              <router-link to="/search" class="nav-item" @click="closeSidebar">
                <Search class="nav-icon" :size="18" />
                <span>搜索</span>
              </router-link>
              <router-link to="/ai-news" class="nav-item" @click="closeSidebar">
                <Newspaper class="nav-icon" :size="18" />
                <span>AI快讯</span>
              </router-link>
            </div>
          </div>
          
          <div v-if="isAuthenticated" class="nav-section">
            <h4 class="nav-title">个人中心</h4>
            <div class="nav-items">
              <router-link to="/profile" class="nav-item" @click="closeSidebar">
                <User class="nav-icon" :size="18" />
                <span>个人中心</span>
              </router-link>
              <router-link to="/favorites" class="nav-item" @click="closeSidebar">
                <Heart class="nav-icon" :size="18" />
                <span>我的收藏</span>
              </router-link>
              <router-link to="/history" class="nav-item" @click="closeSidebar">
                <History class="nav-icon" :size="18" />
                <span>使用历史</span>
              </router-link>
              <router-link to="/ratings" class="nav-item" @click="closeSidebar">
                <Star class="nav-icon" :size="18" />
                <span>我的评分</span>
              </router-link>
            </div>
          </div>
          
          <div v-if="isAuthenticated" class="nav-section">
            <h4 class="nav-title">工具管理</h4>
            <div class="nav-items">
              <router-link to="/submit-tool" class="nav-item" @click="closeSidebar">
                <Plus class="nav-icon" :size="18" />
                <span>提交工具</span>
              </router-link>
            </div>
          </div>
          
          <div v-if="isAdmin" class="nav-section">
            <h4 class="nav-title">管理功能</h4>
            <div class="nav-items">
              <router-link to="/admin/dashboard" class="nav-item" @click="closeSidebar">
                <BarChart class="nav-icon" :size="18" />
                <span>管理仪表板</span>
              </router-link>
              <router-link to="/admin/tools" class="nav-item" @click="closeSidebar">
                <Settings class="nav-icon" :size="18" />
                <span>工具审核</span>
              </router-link>
            </div>
          </div>
          
          <div class="nav-section">
            <h4 class="nav-title">工具分类</h4>
            <div class="nav-items">
              <div 
                v-for="category in categories" 
                :key="category.id"
                class="nav-item"
                @click="navigateToCategory(category); closeSidebar()"
              >
                <component :is="category.icon" class="nav-icon" :size="18" />
                <span>{{ category.name }}</span>
              </div>
            </div>
          </div>
          
          <div v-if="isAuthenticated" class="nav-section">
            <button @click="handleLogout" class="logout-btn">
              <LogOut class="btn-icon" :size="16" />
              退出登录
            </button>
          </div>
        </nav>
      </div>
    </div>

    <!-- 底部导航栏 -->
    <nav class="bottom-nav">
      <router-link to="/" class="nav-tab" :class="{ active: $route.name === 'Home' }">
        <Home class="tab-icon" :size="20" />
        <span class="tab-label">首页</span>
      </router-link>
      
      <router-link to="/search" class="nav-tab" :class="{ active: $route.name === 'EnhancedSearch' }">
        <Search class="tab-icon" :size="20" />
        <span class="tab-label">搜索</span>
      </router-link>
      
      <router-link to="/ai-news" class="nav-tab" :class="{ active: $route.name === 'AINews' }">
        <Newspaper class="tab-icon" :size="20" />
        <span class="tab-label">快讯</span>
      </router-link>
      
      <router-link v-if="isAuthenticated" to="/favorites" class="nav-tab" :class="{ active: $route.name === 'Favorites' }">
        <Heart class="tab-icon" :size="20" />
        <span class="tab-label">收藏</span>
      </router-link>
      
      <router-link v-if="isAuthenticated" to="/profile" class="nav-tab" :class="{ active: $route.name === 'Profile' }">
        <User class="tab-icon" :size="20" />
        <span class="tab-label">我的</span>
      </router-link>
      
      <button v-else @click="goToLogin" class="nav-tab">
        <User class="tab-icon" :size="20" />
        <span class="tab-label">登录</span>
      </button>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { 
  Menu, 
  X, 
  Search, 
  Home, 
  User, 
  Heart, 
  History, 
  Star, 
  Plus, 
  BarChart, 
  Settings, 
  LogOut, 
  Clock, 
  Newspaper
} from 'lucide-vue-next'
import { categories } from '@/data/categories'
import { useAuth } from '@/composables/useAuth'
import { useAdmin } from '@/composables/useAdmin'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const route = useRoute()
const { user, isAuthenticated, logout } = useAuth()
const { isAdmin } = useAdmin()
const { success } = useToast()

// 响应式数据
const sidebarOpen = ref(false)
const showSearch = ref(false)
const searchQuery = ref('')
const searchSuggestions = ref<string[]>([])
const searchHistory = ref<string[]>([])
const searchInput = ref<HTMLInputElement>()
const defaultAvatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'

// 方法
const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
  if (sidebarOpen.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

const closeSidebar = () => {
  sidebarOpen.value = false
  document.body.style.overflow = ''
}

const toggleSearch = () => {
  showSearch.value = !showSearch.value
  if (showSearch.value) {
    setTimeout(() => {
      searchInput.value?.focus()
    }, 100)
  }
}

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    addToHistory(searchQuery.value.trim())
    router.push({
      name: 'EnhancedSearch',
      query: { q: searchQuery.value }
    })
    showSearch.value = false
    searchQuery.value = ''
  }
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
  searchSuggestions.value = Array.from(suggestions).slice(0, 8)
}

const selectSuggestion = (suggestion: string) => {
  searchQuery.value = suggestion
  handleSearch()
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

const navigateToCategory = (category: any) => {
  router.push({
    name: 'Category',
    params: { id: category.id }
  })
}

const goToLogin = () => {
  router.push('/login')
  closeSidebar()
}

const handleLogout = () => {
  logout()
  success('已退出登录')
  closeSidebar()
}

// 监听路由变化，关闭侧边栏
watch(() => route.path, () => {
  closeSidebar()
  showSearch.value = false
})

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
  
  // 监听屏幕尺寸变化
  const handleResize = () => {
    if (window.innerWidth > 768) {
      closeSidebar()
      showSearch.value = false
    }
  }
  
  window.addEventListener('resize', handleResize)
  
  // 清理事件监听器
  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    document.body.style.overflow = ''
  })
})

// 导入 onUnmounted
import { onUnmounted } from 'vue'
</script>

<style scoped>
.mobile-nav {
  position: relative;
  z-index: 1000;
}

.mobile-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background-color: var(--bg-primary);
  border-bottom: 1px solid var(--border-color);
  z-index: 1001;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 1rem;
}

.menu-btn {
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

.menu-btn:hover {
  background-color: var(--bg-tertiary);
}

.logo {
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

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.search-btn,
.user-btn {
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

.search-btn:hover,
.user-btn:hover {
  background-color: var(--bg-tertiary);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.login-btn {
  padding: 0.5rem 1rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.login-btn:hover {
  background: var(--primary-hover);
}

.mobile-search {
  position: fixed;
  top: 60px;
  left: 0;
  right: 0;
  background-color: var(--bg-primary);
  border-bottom: 1px solid var(--border-color);
  z-index: 1000;
  padding: 1rem;
}

.search-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.search-input {
  flex: 1;
  padding: 0.75rem;
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

.search-submit,
.search-cancel {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.search-cancel {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.search-submit:hover {
  background: var(--primary-hover);
}

.search-cancel:hover {
  background: var(--border-color);
}

.search-suggestions {
  margin-top: 1rem;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  max-height: 300px;
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

.clear-btn {
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

.clear-btn:hover {
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

.mobile-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1002;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.sidebar-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 280px;
  height: 100%;
  background-color: var(--bg-primary);
  border-right: 1px solid var(--border-color);
  overflow-y: auto;
  animation: slideIn 0.2s ease-out;
}

@keyframes slideIn {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}

.sidebar-header {
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--border-color);
}

.user-details {
  flex: 1;
  min-width: 0;
}

.username {
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

.login-prompt {
  text-align: center;
}

.login-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.login-btn:hover {
  background: var(--primary-hover);
}

.sidebar-nav {
  padding: 1rem 0;
}

.nav-section {
  margin-bottom: 1.5rem;
}

.nav-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 0.5rem 0;
  padding: 0 1rem;
}

.nav-items {
  display: flex;
  flex-direction: column;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: var(--text-primary);
  text-decoration: none;
  transition: background-color 0.2s ease;
  cursor: pointer;
  font-size: 0.875rem;
}

.nav-item:hover {
  background-color: var(--bg-tertiary);
}

.nav-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  color: var(--error-color);
  cursor: pointer;
  font-size: 0.875rem;
  transition: background-color 0.2s ease;
  margin: 0 1rem;
  border-radius: var(--radius-md);
}

.logout-btn:hover {
  background-color: rgba(239, 68, 68, 0.1);
}

.btn-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background-color: var(--bg-primary);
  border-top: 1px solid var(--border-color);
  display: flex;
  z-index: 1000;
}

.nav-tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  color: var(--text-muted);
  text-decoration: none;
  transition: color 0.2s ease;
  padding: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
}

.nav-tab.active {
  color: var(--primary-color);
}

.nav-tab:hover {
  color: var(--text-primary);
}

.tab-icon {
  width: 20px;
  height: 20px;
}

.tab-label {
  font-size: 0.75rem;
  font-weight: 500;
}

/* 桌面端隐藏移动端导航 */
@media (min-width: 769px) {
  .mobile-nav {
    display: none;
  }
}

/* 移动端优化 */
@media (max-width: 768px) {
  .mobile-nav {
    display: block;
  }
  
  .header-content {
    padding: 0 0.75rem;
  }
  
  .logo-text {
    font-size: 1rem;
  }
  
  .mobile-search {
    padding: 0.75rem;
  }
  
  .search-input {
    font-size: 0.875rem;
  }
  
  .sidebar-content {
    width: 260px;
  }
  
  .nav-item {
    padding: 0.625rem 0.75rem;
    font-size: 0.8125rem;
  }
  
  .nav-icon {
    width: 16px;
    height: 16px;
  }
}

@media (max-width: 480px) {
  .header-content {
    padding: 0 0.5rem;
  }
  
  .logo-text {
    font-size: 0.875rem;
  }
  
  .mobile-search {
    padding: 0.5rem;
  }
  
  .sidebar-content {
    width: 240px;
  }
  
  .nav-item {
    padding: 0.5rem;
    font-size: 0.75rem;
  }
  
  .tab-label {
    font-size: 0.6875rem;
  }
}

/* 触摸优化 */
@media (hover: none) and (pointer: coarse) {
  .nav-item,
  .suggestion-item,
  .menu-btn,
  .search-btn,
  .user-btn {
    min-height: 44px; /* iOS 推荐的最小触摸目标 */
  }
  
  .nav-tab {
    min-height: 60px;
  }
}
</style>