<template>
  <div class="profile-page">
    <!-- 头部导航 -->
    <header class="header">
      <div class="container">
        <div class="header-content">
          <button @click="goBack" class="back-btn" type="button">
            <ArrowLeft class="back-icon" />
            返回
          </button>
          <h1 class="page-title">个人中心</h1>
          <div class="header-actions">
            <button @click="showSettings = true" class="settings-btn">
              <Settings class="settings-icon" :size="20" />
            </button>
          </div>
        </div>
      </div>
    </header>

    <div class="main-content">
      <div class="container">
        <!-- 用户信息卡片 -->
        <div class="profile-card">
          <div class="profile-header">
            <div class="avatar-container">
              <img 
                :src="user?.avatar || defaultAvatar" 
                :alt="user?.username"
                class="avatar"
              />
              <button @click="editAvatar = true" class="avatar-edit">
                <Camera class="camera-icon" :size="16" />
              </button>
            </div>
            <div class="profile-info">
              <h2 class="username">{{ user?.username || '未登录' }}</h2>
              <p class="email">{{ user?.email || '请先登录' }}</p>
              <div class="member-since">
                <Calendar class="calendar-icon" :size="14" />
                <span>加入时间：{{ formatDate(user?.createdAt) }}</span>
              </div>
            </div>
            <div class="profile-actions">
              <button v-if="!isAuthenticated" @click="goToLogin" class="login-btn">
                登录
              </button>
              <div v-else class="action-buttons">
                <button @click="editProfile = true" class="edit-btn">
                  编辑资料
                </button>
                <button @click="logout" class="logout-btn">
                  退出登录
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 统计信息 -->
        <div v-if="isAuthenticated" class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">
              <Heart class="icon" :size="24" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ favorites.length }}</div>
              <div class="stat-label">收藏工具</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">
              <History class="icon" :size="24" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ visitStats.uniqueTools }}</div>
              <div class="stat-label">使用工具</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">
              <Star class="icon" :size="24" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ ratingStats.totalRatings }}</div>
              <div class="stat-label">评分工具</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">
              <TrendingUp class="icon" :size="24" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ visitStats.totalVisits }}</div>
              <div class="stat-label">总访问次数</div>
            </div>
          </div>
        </div>

        <!-- 功能菜单 -->
        <div class="menu-sections">
          <!-- 我的收藏 -->
          <section v-if="isAuthenticated" class="menu-section">
            <div class="section-header">
              <h3 class="section-title">
                <Heart class="title-icon" :size="20" />
                我的收藏
              </h3>
              <router-link to="/favorites" class="view-all-link">
                查看全部
                <ChevronRight class="chevron-icon" :size="16" />
              </router-link>
            </div>
            <div v-if="favoriteTools.length > 0" class="favorite-tools">
              <div 
                v-for="tool in favoriteTools.slice(0, 3)" 
                :key="tool.id"
                class="favorite-tool"
                @click="navigateToTool(tool)"
              >
                <div class="tool-icon">
                  <component :is="tool.icon" class="tool-icon-svg" />
                </div>
                <div class="tool-info">
                  <h4 class="tool-name">{{ tool.name }}</h4>
                  <p class="tool-category">{{ getCategoryName(tool.category) }}</p>
                </div>
                <button 
                  @click.stop="removeFavorite(tool.id)"
                  class="remove-favorite"
                >
                  <X class="remove-icon" :size="16" />
                </button>
              </div>
            </div>
            <div v-else class="empty-state">
              <Heart class="empty-icon" :size="48" />
              <p class="empty-text">还没有收藏任何工具</p>
              <router-link to="/" class="browse-btn">去发现工具</router-link>
            </div>
          </section>

          <!-- 最近使用 -->
          <section v-if="isAuthenticated" class="menu-section">
            <div class="section-header">
              <h3 class="section-title">
                <History class="title-icon" :size="20" />
                最近使用
              </h3>
              <router-link to="/history" class="view-all-link">
                查看全部
                <ChevronRight class="chevron-icon" :size="16" />
              </router-link>
            </div>
            <div v-if="recentTools.length > 0" class="recent-tools">
              <div 
                v-for="item in recentTools.slice(0, 3)" 
                :key="item.toolId"
                class="recent-tool"
                @click="navigateToToolById(item.toolId)"
              >
                <div class="tool-icon">
                  <component :is="getToolIcon(item.toolId)" class="tool-icon-svg" />
                </div>
                <div class="tool-info">
                  <h4 class="tool-name">{{ item.toolName }}</h4>
                  <p class="tool-category">{{ getCategoryName(item.toolCategory) }}</p>
                  <p class="visit-time">{{ formatRelativeTime(item.visitedAt) }}</p>
                </div>
                <div class="visit-count">
                  <Eye class="visit-icon" :size="14" />
                  <span>{{ item.visitCount }}</span>
                </div>
              </div>
            </div>
            <div v-else class="empty-state">
              <History class="empty-icon" :size="48" />
              <p class="empty-text">还没有使用记录</p>
              <router-link to="/" class="browse-btn">去发现工具</router-link>
            </div>
          </section>

          <!-- 我的评分 -->
          <section v-if="isAuthenticated" class="menu-section">
            <div class="section-header">
              <h3 class="section-title">
                <Star class="title-icon" :size="20" />
                我的评分
              </h3>
              <router-link to="/ratings" class="view-all-link">
                查看全部
                <ChevronRight class="chevron-icon" :size="16" />
              </router-link>
            </div>
            <div v-if="userRatings.length > 0" class="rating-tools">
              <div 
                v-for="rating in userRatings.slice(0, 3)" 
                :key="rating.toolId"
                class="rating-tool"
                @click="navigateToToolById(rating.toolId)"
              >
                <div class="tool-icon">
                  <component :is="getToolIcon(rating.toolId)" class="tool-icon-svg" />
                </div>
                <div class="tool-info">
                  <h4 class="tool-name">{{ getToolName(rating.toolId) }}</h4>
                  <div class="rating-stars">
                    <Star 
                      v-for="i in 5" 
                      :key="i"
                      class="star"
                      :class="{ 'star--filled': i <= rating.rating }"
                      :size="14"
                    />
                  </div>
                  <p v-if="rating.comment" class="rating-comment">{{ rating.comment }}</p>
                </div>
                <div class="rating-value">{{ rating.rating }}</div>
              </div>
            </div>
            <div v-else class="empty-state">
              <Star class="empty-icon" :size="48" />
              <p class="empty-text">还没有评分任何工具</p>
              <router-link to="/" class="browse-btn">去发现工具</router-link>
            </div>
          </section>
        </div>
      </div>
    </div>

    <!-- 设置模态框 -->
    <Modal v-model:visible="showSettings" title="设置" size="md">
      <div class="settings-content">
        <div class="setting-item">
          <div class="setting-info">
            <h4 class="setting-title">通知设置</h4>
            <p class="setting-description">接收新工具推荐和更新通知</p>
          </div>
          <label class="toggle">
            <input type="checkbox" v-model="settings.notifications" />
            <span class="toggle-slider"></span>
          </label>
        </div>
        
        <div class="setting-item">
          <div class="setting-info">
            <h4 class="setting-title">主题设置</h4>
            <p class="setting-description">选择您喜欢的界面主题</p>
          </div>
          <select v-model="settings.theme" class="theme-select">
            <option value="light">浅色主题</option>
            <option value="dark">深色主题</option>
            <option value="auto">跟随系统</option>
          </select>
        </div>
        
        <div class="setting-item">
          <div class="setting-info">
            <h4 class="setting-title">语言设置</h4>
            <p class="setting-description">选择界面显示语言</p>
          </div>
          <select v-model="settings.language" class="language-select">
            <option value="zh">中文</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>
      
      <template #footer>
        <button @click="showSettings = false" class="cancel-btn">取消</button>
        <button @click="saveSettings" class="save-btn">保存</button>
      </template>
    </Modal>

    <!-- 编辑个人资料模态框 -->
    <ProfileEditModal 
      v-model:visible="editProfile" 
      @saved="handleProfileSaved"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  ArrowLeft, 
  Settings, 
  Camera, 
  Calendar, 
  Heart, 
  History, 
  Star, 
  TrendingUp,
  ChevronRight,
  X,
  Eye
} from 'lucide-vue-next'
import { useAuth } from '@/composables/useAuth'
import { useFavorites } from '@/composables/useFavorites'
import { useHistory } from '@/composables/useHistory'
import { useRating } from '@/composables/useRating'
import { useToast } from '@/composables/useToast'
import { categories } from '@/data/categories'
import { aiTools } from '@/data/tools'
import Modal from '@/components/Modal.vue'
import ProfileEditModal from '@/components/ProfileEditModal.vue'

const router = useRouter()
const { user, isAuthenticated, logout, updateUser } = useAuth()
const { favorites, getFavoriteTools, removeFavorite } = useFavorites()
const { getRecentTools, getVisitStats } = useHistory()
const { userRatings, getRatingStats } = useRating()
const { success, error } = useToast()

const showSettings = ref(false)
const editProfile = ref(false)
const defaultAvatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'

const settings = ref({
  notifications: true,
  theme: 'auto',
  language: 'zh'
})

// 计算属性
const favoriteTools = computed(() => {
  try {
    return getFavoriteTools ? getFavoriteTools(aiTools) : []
  } catch (error) {
    console.error("Error getting favorite tools:", error)
    return []
  }
})
const recentTools = computed(() => {
  try {
    return getRecentTools ? getRecentTools(3) : []
  } catch (error) {
    console.error("Error getting recent tools:", error)
    return []
  }
})
const visitStats = computed(() => {
  try {
    return getVisitStats ? getVisitStats() : { totalViews: 0, uniqueTools: 0, recentActivity: [] }
  } catch (error) {
    console.error("Error getting visit stats:", error)
    return { totalViews: 0, uniqueTools: 0, recentActivity: [] }
  }
})
const ratingStats = computed(() => {
  try {
    return getRatingStats ? getRatingStats() : { totalRatings: 0, averageRating: 0, ratingDistribution: [] }
  } catch (error) {
    console.error("Error getting rating stats:", error)
    return { totalRatings: 0, averageRating: 0, ratingDistribution: [] }
  }
})

// 方法
const goBack = () => {
  console.log('返回按钮被点击')
  // 直接返回首页，因为个人中心通常是从首页进入的
  router.push('/')
}

const goToLogin = () => {
  router.push('/login')
}

const getCategoryName = (categoryId: string) => {
  const category = categories.find(cat => cat.id === categoryId)
  return category?.name || categoryId
}

const getToolName = (toolId: string) => {
  const tool = aiTools.find(t => t.id === toolId)
  return tool?.name || '未知工具'
}

const getToolIcon = (toolId: string) => {
  const tool = aiTools.find(t => t.id === toolId)
  return tool?.icon || 'Bot'
}

const navigateToTool = (tool: any) => {
  router.push({
    name: 'ToolDetail',
    params: { id: tool.id }
  })
}

const navigateToToolById = (toolId: string) => {
  router.push({
    name: 'ToolDetail',
    params: { id: toolId }
  })
}

const formatDate = (dateString?: string) => {
  if (!dateString) return '未知'
  return new Date(dateString).toLocaleDateString('zh-CN')
}

const formatRelativeTime = (dateString: string) => {
  const now = new Date()
  const date = new Date(dateString)
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
  
  if (diffInMinutes < 1) return '刚刚'
  if (diffInMinutes < 60) return `${diffInMinutes}分钟前`
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}小时前`
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays}天前`
  
  return formatDate(dateString)
}

const saveSettings = () => {
  // 保存设置到localStorage
  localStorage.setItem('ai-tools-settings', JSON.stringify(settings.value))
  success('设置已保存')
  showSettings.value = false
}

const handleProfileSaved = (updatedUserData?: any) => {
  // 个人资料保存后的回调，更新显示的用户信息
  // 注意：不要重复显示成功提示，ProfileEditModal已经显示过了
  if (updatedUserData && updateUser) {
    // 使用useAuth提供的updateUser方法更新响应式的user对象
    updateUser(updatedUserData)
  }
  // 头像和其他信息会自动更新，因为user是响应式的
}

// 加载设置
onMounted(() => {
  const savedSettings = localStorage.getItem('ai-tools-settings')
  if (savedSettings) {
    try {
      settings.value = { ...settings.value, ...JSON.parse(savedSettings) }
    } catch (error) {
      console.error('Failed to load settings:', error)
    }
  }
})
</script>

<style scoped>
.profile-page {
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
  pointer-events: auto;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 101;
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
  position: relative;
  z-index: 10;
  pointer-events: auto;
}

.back-btn:hover {
  background-color: var(--bg-tertiary);
  border-color: var(--border-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.back-btn:active {
  transform: translateY(0);
  background-color: var(--border-color);
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

.settings-btn {
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

.settings-btn:hover {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
}

.settings-icon {
  width: 20px;
  height: 20px;
}

.main-content {
  padding: 2rem 0;
}

.profile-card {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: var(--shadow-sm);
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.avatar-container {
  position: relative;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--border-color);
}

.avatar-edit {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 28px;
  height: 28px;
  background-color: var(--primary-color);
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.avatar-edit:hover {
  background-color: var(--primary-hover);
  transform: scale(1.1);
}

.camera-icon {
  width: 16px;
  height: 16px;
}

.profile-info {
  flex: 1;
}

.username {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
}

.email {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin: 0 0 0.5rem 0;
}

.member-since {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-muted);
  font-size: 0.8125rem;
}

.calendar-icon {
  width: 14px;
  height: 14px;
}

.profile-actions {
  display: flex;
  gap: 0.75rem;
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
}

.edit-btn {
  padding: 0.5rem 1rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.edit-btn:hover {
  background-color: var(--primary-hover);
  transform: translateY(-1px);
}

.login-btn,
.logout-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.login-btn {
  background-color: var(--primary-color);
  color: white;
}

.login-btn:hover {
  background-color: var(--primary-hover);
}

.logout-btn {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.logout-btn:hover {
  background-color: var(--border-color);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.stat-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-icon .icon {
  width: 24px;
  height: 24px;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.menu-sections {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.menu-section {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.title-icon {
  width: 20px;
  height: 20px;
  color: var(--primary-color);
}

.view-all-link {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--primary-color);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: color 0.2s ease;
}

.view-all-link:hover {
  color: var(--primary-hover);
}

.chevron-icon {
  width: 16px;
  height: 16px;
}

.favorite-tools,
.recent-tools,
.rating-tools {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.favorite-tool,
.recent-tool,
.rating-tool {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background-color: var(--bg-tertiary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
}

.favorite-tool:hover,
.recent-tool:hover,
.rating-tool:hover {
  background-color: var(--border-color);
  transform: translateX(4px);
}

.tool-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.tool-icon-svg {
  width: 20px;
  height: 20px;
  color: white;
}

.tool-info {
  flex: 1;
  min-width: 0;
}

.tool-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tool-category {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin: 0;
}

.visit-time {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin: 0.25rem 0 0 0;
}

.rating-stars {
  display: flex;
  gap: 0.125rem;
  margin: 0.25rem 0;
}

.star {
  color: var(--border-color);
}

.star--filled {
  color: var(--warning-color);
}

.rating-comment {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin: 0.25rem 0 0 0;
  font-style: italic;
}

.visit-count {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--text-muted);
  font-size: 0.75rem;
}

.visit-icon {
  width: 14px;
  height: 14px;
}

.rating-value {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--primary-color);
}

.remove-favorite {
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

.remove-favorite:hover {
  background-color: var(--error-color);
  color: white;
}

.remove-icon {
  width: 16px;
  height: 16px;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-muted);
}

.empty-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 1rem;
  color: var(--border-color);
}

.empty-text {
  font-size: 0.875rem;
  margin: 0 0 1rem 0;
}

.browse-btn {
  display: inline-block;
  padding: 0.5rem 1rem;
  background-color: var(--primary-color);
  color: white;
  text-decoration: none;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.browse-btn:hover {
  background-color: var(--primary-hover);
  transform: translateY(-1px);
}

.settings-content {
  padding: 1rem 0;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0;
  border-bottom: 1px solid var(--border-color);
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-info {
  flex: 1;
}

.setting-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
}

.setting-description {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  margin: 0;
}

.toggle {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--border-color);
  transition: 0.3s;
  border-radius: 24px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

.toggle input:checked + .toggle-slider {
  background-color: var(--primary-color);
}

.toggle input:checked + .toggle-slider:before {
  transform: translateX(20px);
}

.theme-select,
.language-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.875rem;
  cursor: pointer;
}

.cancel-btn,
.save-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
  margin-right: 0.5rem;
}

.save-btn {
  background-color: var(--primary-color);
  color: white;
}

.save-btn:hover {
  background-color: var(--primary-hover);
}

/* 移动端优化 */
@media (max-width: 768px) {
  .main-content {
    padding: 1rem 0;
  }
  
  .profile-card {
    padding: 1.5rem;
  }
  
  .profile-header {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .stat-card {
    padding: 1rem;
  }
  
  .menu-section {
    padding: 1rem;
  }
  
  .favorite-tool,
  .recent-tool,
  .rating-tool {
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
}
</style>
