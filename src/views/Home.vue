<template>
  <div class="home">
    <!-- 移动端导航 -->
    <MobileNav />
    
    <!-- 头部导航 -->
    <header class="header">
      <div class="container">
        <div class="header-content">
          <div class="logo">
            <div class="logo-icon">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path d="M16 2L20 8H28L24 14L28 20H20L16 26L12 20H4L8 14L4 8H12L16 2Z" fill="currentColor"/>
              </svg>
            </div>
            <span class="logo-text">AI工具集</span>
          </div>
          
          <div class="header-right">
            <nav class="nav">
              <a href="#" class="nav-link active">常用</a>
              <a href="#" class="nav-link">搜索</a>
              <a href="#" class="nav-link">社区</a>
              <a href="#" class="nav-link">图片</a>
              <a href="#" class="nav-link">生活</a>
            </nav>
            
            <div class="user-actions">
              <button v-if="!isAuthenticated" @click="goToLogin" class="login-btn">
                登录
              </button>
              <div v-else class="user-menu">
                <button @click="toggleUserMenu" class="user-btn">
                  <img 
                    :src="user?.avatar || defaultAvatar" 
                    :alt="user?.username"
                    class="user-avatar"
                  />
                  <span class="user-name">{{ user?.username }}</span>
                  <ChevronDown class="chevron-icon" :size="16" />
                </button>
                
                <!-- 用户下拉菜单 -->
                <div v-if="showUserMenu" class="user-dropdown">
                  <div class="user-info">
                    <img 
                      :src="user?.avatar || defaultAvatar" 
                      :alt="user?.username"
                      class="dropdown-avatar"
                    />
                    <div class="user-details">
                      <h4 class="dropdown-username">{{ user?.username }}</h4>
                      <p class="dropdown-email">{{ user?.email }}</p>
                    </div>
                  </div>
                  
                  <div class="dropdown-divider"></div>
                  
                  <div class="dropdown-menu">
                    <router-link to="/profile" class="dropdown-item" @click="closeUserMenu">
                      <User class="menu-icon" :size="16" />
                      <span>个人中心</span>
                    </router-link>
                    <router-link to="/favorites" class="dropdown-item" @click="closeUserMenu">
                      <Heart class="menu-icon" :size="16" />
                      <span>我的收藏</span>
                    </router-link>
                    <router-link to="/history" class="dropdown-item" @click="closeUserMenu">
                      <History class="menu-icon" :size="16" />
                      <span>使用历史</span>
                    </router-link>
                    <router-link to="/ratings" class="dropdown-item" @click="closeUserMenu">
                      <Star class="menu-icon" :size="16" />
                      <span>我的评分</span>
                    </router-link>
                    
                    <div class="dropdown-divider"></div>
                    
                    <router-link to="/submit-tool" class="dropdown-item" @click="closeUserMenu">
                      <Plus class="menu-icon" :size="16" />
                      <span>提交工具</span>
                    </router-link>
                    
                    <div class="dropdown-divider"></div>
                    
                    <router-link 
                      v-if="isAdmin"
                      to="/admin/dashboard" 
                      class="dropdown-item" 
                      @click="closeUserMenu"
                    >
                      <BarChart class="menu-icon" :size="16" />
                      <span>管理仪表板</span>
                    </router-link>
                    <router-link 
                      v-if="isAdmin"
                      to="/admin/tools" 
                      class="dropdown-item" 
                      @click="closeUserMenu"
                    >
                      <Settings class="menu-icon" :size="16" />
                      <span>工具审核</span>
                    </router-link>
                    
                    <div v-if="isAdmin" class="dropdown-divider"></div>
                    
                    <button @click="handleLogout" class="dropdown-item logout-item">
                      <LogOut class="menu-icon" :size="16" />
                      <span>退出登录</span>
                    </button>
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
        <!-- 搜索区域 -->
        <section class="search-section">
          <div class="search-container">
            <h1 class="search-title">站内AI工具搜索</h1>
            <div class="search-bar">
              <input 
                type="text" 
                placeholder="搜索AI工具..." 
                v-model="searchQuery"
                @keyup.enter="handleSearch"
                @input="onSearchInput"
                @focus="showSuggestions = true"
                @blur="hideSuggestions"
                class="search-input"
                ref="searchInput"
              />
              <button @click="handleSearch" class="search-btn">
                <Search class="search-icon" />
              </button>
              
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
            <div class="search-options">
              <button 
                v-for="option in searchOptions" 
                :key="option"
                :class="['search-option', { active: selectedSearchOption === option }]"
                @click="selectedSearchOption = option"
              >
                {{ option }}
              </button>
            </div>
          </div>
        </section>

        <!-- AI快讯卡片 -->
        <section class="ai-news-section">
          <AINewsCard />
        </section>

        <!-- 快速访问卡片 -->
        <section class="quick-access">
          <div class="quick-access-grid">
            <div 
              v-for="card in quickAccessCards" 
              :key="card.id"
              class="quick-access-card"
              :style="{ backgroundColor: card.color }"
              @click="navigateToCard(card)"
            >
              <div class="card-icon">
                <component :is="card.icon" class="icon" />
              </div>
              <div class="card-content">
                <h3 class="card-title">{{ card.title }}</h3>
                <p class="card-description">{{ card.description }}</p>
                <div v-if="card.badge" class="card-badge">{{ card.badge }}</div>
              </div>
            </div>
          </div>
        </section>

        <!-- 新闻预览 -->
        <section class="news-preview">
          <div class="news-grid">
            <div 
              v-for="news in newsItems" 
              :key="news.id"
              class="news-card"
              @click="navigateToNews(news)"
            >
              <div class="news-image">
                <div class="news-placeholder">
                  <component :is="getNewsIcon(news.category)" class="news-icon" />
                </div>
              </div>
              <div class="news-content">
                <h3 class="news-title">{{ news.title }}</h3>
                <p class="news-description">{{ news.description }}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- 特色横幅 -->
        <section class="featured-banners">
          <div class="banner jimumeng-banner">
            <div class="banner-content">
              <div class="banner-icon">
                <Play class="icon" />
              </div>
              <div class="banner-text">
                <h3>即梦AI 文生视频/图生视频,每天免费用</h3>
                <button class="banner-btn">点我体验</button>
              </div>
            </div>
          </div>
          
          <div class="banner wawa-banner">
            <div class="banner-content">
              <div class="banner-icon">
                <Heart class="icon" />
              </div>
              <div class="banner-text">
                <h3>蛙蛙写作 AI一键生成小说</h3>
                <p>番茄、晋江大大都在用的写作辅助工具</p>
                <button class="banner-btn">免费使用</button>
              </div>
            </div>
          </div>
        </section>

        <!-- 热门工具 -->
        <section class="popular-tools">
          <div class="section-header">
            <h2 class="section-title">
              <Flame class="title-icon" />
              热门工具
            </h2>
          </div>
          
          <div class="tools-grid">
            <ScrollReveal 
              v-for="(tool, index) in popularTools" 
              :key="tool.id"
              :delay="index * 100"
              data-animation="fade"
            >
              <EnhancedToolCard 
                :tool="tool"
                @click="navigateToTool"
                @favorite="handleFavorite"
                @share="handleShare"
              />
            </ScrollReveal>
          </div>
        </section>
      </div>
    </div>

    <!-- 侧边栏导航 -->
    <aside class="sidebar">
      <nav class="sidebar-nav">
        <div 
          v-for="category in categories" 
          :key="category.id"
          class="nav-item"
          @click="navigateToCategory(category)"
        >
          <div class="nav-icon" :style="{ backgroundColor: category.color + '20', color: category.color }">
            <component :is="category.icon" class="icon" />
          </div>
          <span class="nav-text">{{ category.name }}</span>
          <div v-if="category.subcategories" class="nav-arrow">
            <ChevronRight class="arrow-icon" />
          </div>
        </div>
      </nav>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Search, 
  TrendingUp, 
  Users, 
  Star, 
  BookOpen, 
  Briefcase,
  Play,
  Heart,
  Flame,
  ChevronRight,
  ChevronDown,
  PenTool,
  Image,
  Video,
  Bot,
  MessageCircle,
  Code,
  Palette,
  Music,
  Layers,
  GraduationCap,
  Cpu,
  Award,
  Shield,
  ShoppingCart,
  FileText,
  Smartphone,
  Scissors,
  Mic,
  Volume2,
  Globe,
  Settings,
  BarChart,
  Clock,
  User,
  History,
  LogOut,
  Plus
} from 'lucide-vue-next'
import { categories } from '@/data/categories'
import { aiTools, quickAccessCards, newsItems } from '@/data/tools'
import MobileNav from '@/components/MobileNav.vue'
import EnhancedToolCard from '@/components/EnhancedToolCard.vue'
import ScrollReveal from '@/components/ScrollReveal.vue'
import AINewsCard from '@/components/AINewsCard.vue'
import { useToast } from '@/composables/useToast'
import { useAuth } from '@/composables/useAuth'
import { useAdmin } from '@/composables/useAdmin'
import EnhancedSearch from '@/components/EnhancedSearch.vue'

const router = useRouter()
const { success, error } = useToast()
const { user, isAuthenticated, logout } = useAuth()
const { isAdmin } = useAdmin()

// 响应式数据
const searchQuery = ref('')
const selectedSearchOption = ref('站内')
const showUserMenu = ref(false)
const defaultAvatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'

// 搜索选项
const searchOptions = ['站内', 'Bing', '百度', 'Google', 'Perplexity']

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

// 计算属性
const popularTools = computed(() => 
  aiTools.filter(tool => tool.isPopular).slice(0, 12)
)

// 方法
const handleSearch = () => {
  if (searchQuery.value.trim()) {
    // 添加到搜索历史
    addToHistory(searchQuery.value.trim())
    
    router.push({
      name: 'Search',
      query: { q: searchQuery.value }
    })
  }
  showSuggestions.value = false
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
  handleSearch()
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

// 处理收藏
const handleFavorite = (tool: any, favorited: boolean) => {
  if (favorited) {
    success(`${tool.name} 已添加到收藏`)
  } else {
    success(`${tool.name} 已从收藏中移除`)
  }
}

// 处理分享
const handleShare = (tool: any) => {
  success(`${tool.name} 分享链接已复制到剪贴板`)
}

// 用户菜单相关方法
const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const closeUserMenu = () => {
  showUserMenu.value = false
}

const goToLogin = () => {
  router.push('/login')
}

const handleLogout = () => {
  logout()
  success('已退出登录')
  closeUserMenu()
}

const navigateToCard = (card: any) => {
  console.log('Navigate to card:', card)
  
  // 根据卡片类型进行不同的导航
  switch (card.id) {
    case 'ai-news':
      // AI快讯 - 跳转到AI快讯页面
      router.push('/ai-news')
      break
    case 'free-community':
      // 免费社群 - 跳转到社区页面或相关分类
      router.push({
        name: 'Category',
        params: { id: 'chat' }
      })
      break
    case 'latest-projects':
      // 最新项目 - 跳转到项目页面或搜索最新工具
      router.push({
        name: 'Search',
        query: { q: '最新', sort: 'newest' }
      })
      break
    case 'popular-tutorials':
      // 热门教程 - 跳转到学习相关分类
      router.push({
        name: 'Category',
        params: { id: 'learning' }
      })
      break
    case 'office-tools':
      // 办公不求人 - 跳转到办公工具分类
      router.push({
        name: 'Category',
        params: { id: 'office' }
      })
      break
    default:
      // 如果有URL，直接跳转
      if (card.url) {
        if (card.url.startsWith('http')) {
          // 外部链接
          window.open(card.url, '_blank')
        } else {
          // 内部路由
          router.push(card.url)
        }
      }
      break
  }
}

const navigateToNews = (news: any) => {
  console.log('Navigate to news:', news)
  
  // 新闻导航逻辑
  if (news.url) {
    if (news.url.startsWith('http')) {
      // 外部链接
      window.open(news.url, '_blank')
    } else {
      // 内部路由
      router.push(news.url)
    }
  } else {
    // 如果没有URL，跳转到搜索页面显示相关新闻
    router.push({
      name: 'Search',
      query: { q: news.title, category: 'news' }
    })
  }
}

const navigateToTool = (tool: any) => {
  router.push({
    name: 'ToolDetail',
    params: { id: tool.id }
  })
}

const navigateToCategory = (category: any) => {
  router.push({
    name: 'Category',
    params: { id: category.id }
  })
}

const getNewsIcon = (category: string) => {
  const iconMap: Record<string, string> = {
    'AI工具': 'Bot',
    'AI模型': 'Cpu',
    'AI技术': 'Code',
    '公司动态': 'Briefcase'
  }
  return iconMap[category] || 'Bot'
}

onMounted(() => {
  console.log('Home page mounted')
  
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
.home {
  display: flex;
  min-height: 100vh;
  background-color: var(--bg-secondary);
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background-color: var(--bg-primary);
  border-bottom: 1px solid var(--border-color);
  z-index: 1000;
  height: 60px;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--primary-color);
}

.logo-icon {
  width: 32px;
  height: 32px;
  color: var(--primary-color);
}

.nav {
  display: flex;
  gap: 2rem;
}

.nav-link {
  color: var(--text-secondary);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.nav-link:hover,
.nav-link.active {
  color: var(--primary-color);
}

.main-content {
  flex: 1;
  margin-left: 250px;
  padding-top: 80px;
}

.sidebar {
  position: fixed;
  left: 0;
  top: 60px;
  width: 250px;
  height: calc(100vh - 60px);
  background-color: var(--bg-primary);
  border-right: 1px solid var(--border-color);
  overflow-y: auto;
}

.sidebar-nav {
  padding: 1rem 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.nav-item:hover {
  background-color: var(--bg-tertiary);
}

.nav-item:hover .nav-icon {
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.nav-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.nav-icon .icon {
  width: 18px;
  height: 18px;
}

.nav-text {
  flex: 1;
  font-weight: 500;
}

.nav-arrow {
  width: 16px;
  height: 16px;
  color: var(--text-muted);
}

.search-section {
  padding: 2rem 0;
  text-align: center;
}

.search-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
}

.search-container {
  max-width: 600px;
  margin: 0 auto;
  position: relative;
}

.search-bar {
  position: relative;
  margin-bottom: 1rem;
}

.search-input {
  width: 100%;
  padding: 1rem 3rem 1rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-lg);
  font-size: 1rem;
  background-color: var(--bg-primary);
  transition: border-color 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.search-btn {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  padding: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.search-btn:hover {
  background-color: var(--primary-hover);
}

.search-options {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.search-option {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background-color: var(--bg-primary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.search-option:hover,
.search-option.active {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.ai-news-section {
  margin: 2rem 0;
}

.quick-access {
  margin: 2rem 0;
}

.quick-access-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.quick-access-card {
  padding: 1.5rem;
  border-radius: var(--radius-lg);
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.quick-access-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.quick-access-card:active {
  transform: translateY(-2px);
}

.card-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 1rem;
}

.card-content {
  text-align: left;
}

.card-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.card-description {
  font-size: 0.875rem;
  opacity: 0.9;
  margin-bottom: 0.5rem;
}

.card-badge {
  display: inline-block;
  background-color: rgba(255, 255, 255, 0.2);
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 500;
}

.news-preview {
  margin: 2rem 0;
}

.news-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.news-card {
  background-color: var(--bg-primary);
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid var(--border-color);
}

.news-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--primary-color);
}

.news-card:active {
  transform: translateY(0);
}

.news-image {
  width: 100%;
  height: 120px;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.news-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.news-icon {
  width: 48px;
  height: 48px;
  color: white;
}

.news-content {
  padding: 1rem;
}

.news-title {
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.news-description {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.featured-banners {
  margin: 2rem 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.banner {
  padding: 1.5rem;
  border-radius: var(--radius-lg);
  color: white;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.banner:hover {
  transform: translateY(-2px);
}

.jimumeng-banner {
  background: linear-gradient(135deg, #1e40af, #3b82f6);
}

.wawa-banner {
  background: linear-gradient(135deg, #10b981, #34d399);
}

.banner-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.banner-icon {
  width: 48px;
  height: 48px;
}

.banner-text h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.banner-text p {
  font-size: 0.875rem;
  opacity: 0.9;
  margin-bottom: 1rem;
}

.banner-btn {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-md);
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.banner-btn:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

.popular-tools {
  margin: 2rem 0;
}

.section-header {
  margin-bottom: 1.5rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
}

.title-icon {
  width: 24px;
  height: 24px;
  color: var(--warning-color);
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.tool-card {
  background-color: var(--bg-primary);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid var(--border-color);
}

.tool-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.tool-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 1rem;
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

.tool-name {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.tool-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.tool-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.free-badge {
  background-color: var(--success-color);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 500;
}

.user-count {
  font-size: 0.75rem;
  color: var(--text-muted);
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
    display: none;
  }
  
  .main-content {
    margin-left: 0;
    padding-top: 60px; /* 为移动端导航留出空间 */
  }
  
  .sidebar {
    display: none;
  }
  
  .search-section {
    padding: 1rem 0;
  }
  
  .search-title {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }
  
  .search-options {
    flex-wrap: wrap;
    gap: 0.25rem;
  }
  
  .search-option {
    padding: 0.375rem 0.75rem;
    font-size: 0.875rem;
  }
  
  .quick-access-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }
  
  .quick-access-card {
    padding: 1rem;
  }
  
  .card-title {
    font-size: 1rem;
  }
  
  .card-description {
    font-size: 0.75rem;
  }
  
  .news-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  
  .news-card {
    margin-bottom: 0.5rem;
  }
  
  .featured-banners {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  
  .banner {
    padding: 1rem;
  }
  
  .banner-text h3 {
    font-size: 1rem;
  }
  
  .banner-text p {
    font-size: 0.75rem;
  }
  
  .tools-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  
  .tool-card {
    padding: 1rem;
  }
  
  .tool-name {
    font-size: 0.875rem;
  }
  
  .tool-description {
    font-size: 0.75rem;
  }
  
  .search-suggestions {
    max-height: 300px;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 0.5rem;
  }
  
  .quick-access-grid {
    grid-template-columns: 1fr;
  }
  
  .search-title {
    font-size: 1.25rem;
  }
  
  .search-input {
    padding: 0.75rem 2.5rem 0.75rem 0.75rem;
    font-size: 0.875rem;
  }
  
  .search-btn {
    padding: 0.75rem;
  }
  
  .quick-access-card {
    padding: 0.75rem;
  }
  
  .card-icon {
    width: 36px;
    height: 36px;
    margin-bottom: 0.75rem;
  }
  
  .card-title {
    font-size: 0.875rem;
  }
  
  .card-description {
    font-size: 0.6875rem;
  }
  
  .banner-content {
    gap: 0.75rem;
  }
  
  .banner-icon {
    width: 36px;
    height: 36px;
  }
  
  .banner-text h3 {
    font-size: 0.875rem;
  }
  
  .banner-text p {
    font-size: 0.6875rem;
  }
  
  .banner-btn {
    padding: 0.375rem 0.75rem;
    font-size: 0.75rem;
  }
}

/* 用户菜单样式 */
.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-actions {
  position: relative;
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
  transform: translateY(-1px);
}

.user-menu {
  position: relative;
}

.user-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: none;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 120px;
}

.user-btn:hover {
  background-color: var(--bg-tertiary);
  border-color: var(--border-hover);
}

.user-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
}

.user-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chevron-icon {
  color: var(--text-muted);
  transition: transform 0.2s ease;
}

.user-btn:hover .chevron-icon {
  transform: rotate(180deg);
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  min-width: 280px;
  z-index: 1000;
  overflow: hidden;
  animation: dropdownFadeIn 0.2s ease-out;
}

@keyframes dropdownFadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--bg-secondary);
}

.dropdown-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--border-color);
}

.user-details {
  flex: 1;
  min-width: 0;
}

.dropdown-username {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dropdown-email {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dropdown-divider {
  height: 1px;
  background-color: var(--border-color);
  margin: 0;
}

.dropdown-menu {
  padding: 0.5rem 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
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

.dropdown-item:hover {
  background-color: var(--bg-tertiary);
}

.logout-item {
  color: var(--error-color);
}

.logout-item:hover {
  background-color: rgba(239, 68, 68, 0.1);
}

.menu-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

/* 移动端用户菜单适配 */
@media (max-width: 768px) {
  .header-right {
    display: none;
  }
}
</style>
