<template>
  <div class="home">
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
          
          <nav class="nav">
            <a href="#" class="nav-link active">常用</a>
            <a href="#" class="nav-link">搜索</a>
            <a href="#" class="nav-link">社区</a>
            <a href="#" class="nav-link">图片</a>
            <a href="#" class="nav-link">生活</a>
          </nav>
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
                class="search-input"
              />
              <button @click="handleSearch" class="search-btn">
                <Search class="search-icon" />
              </button>
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
            <div 
              v-for="tool in popularTools" 
              :key="tool.id"
              class="tool-card"
              @click="navigateToTool(tool)"
            >
              <div class="tool-icon">
                <component :is="tool.icon" class="tool-icon-svg" />
              </div>
              <div class="tool-content">
                <h3 class="tool-name">{{ tool.name }}</h3>
                <p class="tool-description">{{ tool.shortDescription }}</p>
                <div class="tool-meta">
                  <span v-if="tool.isFree" class="free-badge">免费</span>
                  <span v-if="tool.userCount" class="user-count">{{ tool.userCount }}</span>
                </div>
              </div>
            </div>
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
  BarChart
} from 'lucide-vue-next'
import { categories } from '@/data/categories'
import { aiTools, quickAccessCards, newsItems } from '@/data/tools'

const router = useRouter()

// 响应式数据
const searchQuery = ref('')
const selectedSearchOption = ref('站内')

// 搜索选项
const searchOptions = ['站内', 'Bing', '百度', 'Google', 'Perplexity']

// 计算属性
const popularTools = computed(() => 
  aiTools.filter(tool => tool.isPopular).slice(0, 12)
)

// 方法
const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({
      name: 'Search',
      query: { q: searchQuery.value }
    })
  }
}

const navigateToCard = (card: any) => {
  console.log('Navigate to card:', card)
  // 实现导航逻辑
}

const navigateToNews = (news: any) => {
  console.log('Navigate to news:', news)
  // 实现新闻导航逻辑
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
  transition: transform 0.2s ease;
}

.quick-access-card:hover {
  transform: translateY(-4px);
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
  transition: transform 0.2s ease;
}

.news-card:hover {
  transform: translateY(-2px);
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

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
  }
  
  .sidebar {
    display: none;
  }
  
  .quick-access-grid {
    grid-template-columns: 1fr;
  }
  
  .tools-grid {
    grid-template-columns: 1fr;
  }
}
</style>
