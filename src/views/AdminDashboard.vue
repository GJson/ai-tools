<template>
  <div class="admin-dashboard">
    <div class="container">
      <!-- 页面头部 -->
      <header class="page-header">
        <div class="header-content">
          <div class="header-info">
            <h1 class="page-title">管理员仪表板</h1>
            <p class="page-description">系统数据统计和管理</p>
          </div>
          <div class="header-actions">
            <button @click="refreshData" class="btn btn-primary" :disabled="isLoading">
              <RefreshCw class="btn-icon" :size="16" :class="{ spinning: isLoading }" />
              刷新数据
            </button>
          </div>
        </div>
      </header>

      <!-- 概览统计 -->
      <div v-if="overview" class="overview-section">
        <h2 class="section-title">系统概览</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon users">
              <Users class="icon" :size="24" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ overview.totalUsers }}</div>
              <div class="stat-label">总用户数</div>
              <div class="stat-change positive">+{{ overview.today.newUsers }} 今日</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon tools">
              <Wrench class="icon" :size="24" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ overview.totalTools }}</div>
              <div class="stat-label">总工具数</div>
              <div class="stat-change positive">+{{ overview.today.newTools }} 今日</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon pending">
              <Clock class="icon" :size="24" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ overview.pendingTools }}</div>
              <div class="stat-label">待审核</div>
              <div class="stat-change warning">需要处理</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon comments">
              <MessageSquare class="icon" :size="24" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ overview.totalComments }}</div>
              <div class="stat-label">总评论数</div>
              <div class="stat-change positive">+{{ overview.today.newComments }} 今日</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 图表区域 -->
      <div class="charts-section">
        <div class="charts-grid">
          <!-- 用户增长趋势 -->
          <div class="chart-card">
            <h3 class="chart-title">用户增长趋势</h3>
            <div class="chart-container">
              <div class="chart-placeholder">
                <TrendingUp class="chart-icon" :size="48" />
                <p class="chart-text">用户增长图表</p>
                <p class="chart-description">最近30天用户注册趋势</p>
              </div>
            </div>
          </div>
          
          <!-- 工具增长趋势 -->
          <div class="chart-card">
            <h3 class="chart-title">工具增长趋势</h3>
            <div class="chart-container">
              <div class="chart-placeholder">
                <BarChart3 class="chart-icon" :size="48" />
                <p class="chart-text">工具增长图表</p>
                <p class="chart-description">最近30天工具提交趋势</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 分类分布 -->
      <div v-if="overview && overview.distributions.categories.length > 0" class="distribution-section">
        <h2 class="section-title">工具分类分布</h2>
        <div class="category-chart">
          <div
            v-for="category in overview.distributions.categories"
            :key="category.category"
            class="category-item"
          >
            <div class="category-info">
              <span class="category-name">{{ category.category }}</span>
              <span class="category-count">{{ category.count }} 个工具</span>
            </div>
            <div class="category-bar">
              <div 
                class="category-fill" 
                :style="{ width: getCategoryPercentage(category.count) + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 标签页导航 -->
      <div class="tabs-section">
        <div class="tabs-nav">
          <button 
            v-for="tab in tabs" 
            :key="tab.key"
            @click="activeTab = tab.key"
            class="tab-btn"
            :class="{ active: activeTab === tab.key }"
          >
            <component :is="tab.icon" class="tab-icon" :size="16" />
            {{ tab.label }}
            <span v-if="tab.count !== undefined" class="tab-count">{{ tab.count }}</span>
          </button>
        </div>
      </div>

      <!-- 标签页内容 -->
      <div class="tab-content">
        <!-- 用户管理 -->
        <div v-if="activeTab === 'users'" class="tab-panel">
          <div class="panel-header">
            <div class="panel-filters">
              <input
                v-model="userFilters.search"
                @input="loadUsers"
                type="text"
                placeholder="搜索用户..."
                class="filter-input"
              />
              <select v-model="userFilters.sortBy" @change="loadUsers" class="filter-select">
                <option value="created_at">注册时间</option>
                <option value="last_login_at">最后登录</option>
                <option value="submittedTools">提交工具数</option>
              </select>
            </div>
          </div>
          
          <div class="data-table">
            <div class="table-header">
              <div class="table-cell">用户</div>
              <div class="table-cell">邮箱</div>
              <div class="table-cell">提交工具</div>
              <div class="table-cell">评论数</div>
              <div class="table-cell">注册时间</div>
              <div class="table-cell">操作</div>
            </div>
            
            <div v-if="isLoading" class="loading-row">
              <div class="loading-spinner"></div>
              <span>加载中...</span>
            </div>
            
            <div v-else-if="users.length === 0" class="empty-row">
              <span>暂无用户数据</span>
            </div>
            
            <div v-else class="table-body">
              <div v-for="user in users" :key="user.id" class="table-row">
                <div class="table-cell">
                  <div class="user-info">
                    <div class="user-avatar">{{ user.username.charAt(0) }}</div>
                    <div class="user-details">
                      <div class="username">{{ user.username }}</div>
                      <div class="user-role">{{ user.role || 'user' }}</div>
                    </div>
                  </div>
                </div>
                <div class="table-cell">{{ user.email }}</div>
                <div class="table-cell">{{ user.submittedTools || 0 }}</div>
                <div class="table-cell">{{ user.commentsCount || 0 }}</div>
                <div class="table-cell">{{ formatDate(user.created_at) }}</div>
                <div class="table-cell">
                  <div class="action-buttons">
                    <button @click="toggleUserStatus(user)" class="action-btn" :class="{ danger: user.is_active }">
                      {{ user.is_active ? '禁用' : '启用' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 工具管理 -->
        <div v-if="activeTab === 'tools'" class="tab-panel">
          <div class="panel-header">
            <div class="panel-filters">
              <input
                v-model="toolFilters.search"
                @input="loadTools"
                type="text"
                placeholder="搜索工具..."
                class="filter-input"
              />
              <select v-model="toolFilters.status" @change="loadTools" class="filter-select">
                <option value="">全部状态</option>
                <option value="pending">待审核</option>
                <option value="approved">已通过</option>
                <option value="rejected">已拒绝</option>
              </select>
              <select v-model="toolFilters.category" @change="loadTools" class="filter-select">
                <option value="">全部分类</option>
                <option v-for="category in categories" :key="category" :value="category">
                  {{ category }}
                </option>
              </select>
            </div>
          </div>
          
          <div class="data-table">
            <div class="table-header">
              <div class="table-cell">工具名称</div>
              <div class="table-cell">分类</div>
              <div class="table-cell">状态</div>
              <div class="table-cell">提交者</div>
              <div class="table-cell">评分</div>
              <div class="table-cell">操作</div>
            </div>
            
            <div v-if="isLoading" class="loading-row">
              <div class="loading-spinner"></div>
              <span>加载中...</span>
            </div>
            
            <div v-else-if="tools.length === 0" class="empty-row">
              <span>暂无工具数据</span>
            </div>
            
            <div v-else class="table-body">
              <div v-for="tool in tools" :key="tool.id" class="table-row">
                <div class="table-cell">
                  <div class="tool-info">
                    <div class="tool-name">{{ tool.name }}</div>
                    <div class="tool-description">{{ tool.description.substring(0, 50) }}...</div>
                  </div>
                </div>
                <div class="table-cell">{{ tool.category }}</div>
                <div class="table-cell">
                  <span class="status-badge" :class="tool.status">
                    {{ getStatusText(tool.status) }}
                  </span>
                </div>
                <div class="table-cell">{{ tool.submittedByUsername }}</div>
                <div class="table-cell">
                  <div class="rating">
                    <Star class="star-icon" :size="14" />
                    <span>{{ tool.averageRating?.toFixed(1) || '0.0' }}</span>
                  </div>
                </div>
                <div class="table-cell">
                  <div class="action-buttons">
                    <button @click="approveTool(tool)" v-if="tool.status === 'pending'" class="action-btn success">
                      通过
                    </button>
                    <button @click="rejectTool(tool)" v-if="tool.status === 'pending'" class="action-btn danger">
                      拒绝
                    </button>
                    <button @click="viewTool(tool)" class="action-btn">
                      查看
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 评论管理 -->
        <div v-if="activeTab === 'comments'" class="tab-panel">
          <div class="panel-header">
            <div class="panel-filters">
              <input
                v-model="commentFilters.search"
                @input="loadComments"
                type="text"
                placeholder="搜索评论..."
                class="filter-input"
              />
              <select v-model="commentFilters.status" @change="loadComments" class="filter-select">
                <option value="all">全部</option>
                <option value="pending">待审核</option>
                <option value="approved">已通过</option>
              </select>
            </div>
          </div>
          
          <div class="data-table">
            <div class="table-header">
              <div class="table-cell">评论内容</div>
              <div class="table-cell">用户</div>
              <div class="table-cell">工具</div>
              <div class="table-cell">状态</div>
              <div class="table-cell">时间</div>
              <div class="table-cell">操作</div>
            </div>
            
            <div v-if="isLoading" class="loading-row">
              <div class="loading-spinner"></div>
              <span>加载中...</span>
            </div>
            
            <div v-else-if="comments.length === 0" class="empty-row">
              <span>暂无评论数据</span>
            </div>
            
            <div v-else class="table-body">
              <div v-for="comment in comments" :key="comment.id" class="table-row">
                <div class="table-cell">
                  <div class="comment-content">{{ comment.content.substring(0, 100) }}...</div>
                </div>
                <div class="table-cell">{{ comment.username }}</div>
                <div class="table-cell">{{ comment.toolName }}</div>
                <div class="table-cell">
                  <span class="status-badge" :class="{ approved: comment.isApproved, pending: !comment.isApproved }">
                    {{ comment.isApproved ? '已通过' : '待审核' }}
                  </span>
                </div>
                <div class="table-cell">{{ formatDate(comment.createdAt) }}</div>
                <div class="table-cell">
                  <div class="action-buttons">
                    <button @click="approveComment(comment)" v-if="!comment.isApproved" class="action-btn success">
                      通过
                    </button>
                    <button @click="rejectComment(comment)" v-if="comment.isApproved" class="action-btn danger">
                      拒绝
                    </button>
                    <button @click="deleteComment(comment)" class="action-btn danger">
                      删除
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 系统活动 -->
        <div v-if="activeTab === 'activity'" class="tab-panel">
          <div class="panel-header">
            <div class="panel-filters">
              <select v-model="activityFilters.action" @change="loadActivity" class="filter-select">
                <option value="">全部行为</option>
                <option value="view">浏览</option>
                <option value="search">搜索</option>
                <option value="favorite">收藏</option>
                <option value="rating">评分</option>
                <option value="comment">评论</option>
              </select>
              <input
                v-model="activityFilters.startDate"
                @change="loadActivity"
                type="date"
                class="filter-input"
              />
              <input
                v-model="activityFilters.endDate"
                @change="loadActivity"
                type="date"
                class="filter-input"
              />
            </div>
          </div>
          
          <div class="activity-list">
            <div v-if="isLoading" class="loading-state">
              <div class="loading-spinner"></div>
              <span>加载中...</span>
            </div>
            
            <div v-else-if="activities.length === 0" class="empty-state">
              <span>暂无活动记录</span>
            </div>
            
            <div v-else class="activity-items">
              <div v-for="activity in activities" :key="activity.id" class="activity-item">
                <div class="activity-icon">
                  <component :is="getActionIcon(activity.action)" class="icon" :size="16" />
                </div>
                <div class="activity-content">
                  <div class="activity-header">
                    <span class="activity-user">{{ activity.username }}</span>
                    <span class="activity-time">{{ formatTime(activity.createdAt) }}</span>
                  </div>
                  <div class="activity-description">
                    {{ getActivityDescription(activity) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { 
  RefreshCw, 
  Users, 
  Wrench, 
  Clock, 
  MessageSquare, 
  TrendingUp, 
  BarChart3, 
  Star,
  Eye,
  Search,
  Heart,
  ThumbsUp,
  FileText
} from 'lucide-vue-next'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'
import { useAdmin } from '@/composables/useAdmin'

const router = useRouter()
const { apiRequest } = useAuth()
const { success, error } = useToast()
const { isAdmin } = useAdmin()

// 响应式数据
const overview = ref<any>(null)
const users = ref<any[]>([])
const tools = ref<any[]>([])
const comments = ref<any[]>([])
const activities = ref<any[]>([])
const categories = ref<string[]>([])
const isLoading = ref(false)
const activeTab = ref('users')

// 筛选条件
const userFilters = ref({
  search: '',
  sortBy: 'created_at'
})

const toolFilters = ref({
  search: '',
  status: '',
  category: ''
})

const commentFilters = ref({
  search: '',
  status: 'all'
})

const activityFilters = ref({
  action: '',
  startDate: '',
  endDate: ''
})

// 标签页配置
const tabs = ref([
  { key: 'users', label: '用户管理', icon: Users, count: overview.value?.totalUsers },
  { key: 'tools', label: '工具管理', icon: Wrench, count: overview.value?.pendingTools },
  { key: 'comments', label: '评论管理', icon: MessageSquare, count: overview.value?.totalComments },
  { key: 'activity', label: '系统活动', icon: Activity, count: activities.value.length }
])

// 方法
const loadOverview = async () => {
  try {
    const response = await apiRequest('/admin/dashboard/overview')
    
    if (response.success) {
      overview.value = response.data
      categories.value = response.data.distributions.categories.map((c: any) => c.category)
    }
  } catch (err) {
    error('加载概览数据失败')
  }
}

const loadUsers = async () => {
  try {
    isLoading.value = true
    const params = new URLSearchParams(userFilters.value)
    const response = await apiRequest(`/admin/dashboard/users?${params}`)
    
    if (response.success) {
      users.value = response.data.users
    }
  } catch (err) {
    error('加载用户数据失败')
  } finally {
    isLoading.value = false
  }
}

const loadTools = async () => {
  try {
    isLoading.value = true
    const params = new URLSearchParams(toolFilters.value)
    const response = await apiRequest(`/admin/dashboard/tools?${params}`)
    
    if (response.success) {
      tools.value = response.data.tools
    }
  } catch (err) {
    error('加载工具数据失败')
  } finally {
    isLoading.value = false
  }
}

const loadComments = async () => {
  try {
    isLoading.value = true
    const params = new URLSearchParams(commentFilters.value)
    const response = await apiRequest(`/admin/dashboard/comments?${params}`)
    
    if (response.success) {
      comments.value = response.data.comments
    }
  } catch (err) {
    error('加载评论数据失败')
  } finally {
    isLoading.value = false
  }
}

const loadActivity = async () => {
  try {
    isLoading.value = true
    const params = new URLSearchParams(activityFilters.value)
    const response = await apiRequest(`/admin/dashboard/activity?${params}`)
    
    if (response.success) {
      activities.value = response.data.activities
    }
  } catch (err) {
    error('加载活动数据失败')
  } finally {
    isLoading.value = false
  }
}

const refreshData = async () => {
  isLoading.value = true
  try {
    await loadOverview()
    await loadUsers()
    await loadTools()
    await loadComments()
    await loadActivity()
    success('数据刷新成功')
  } catch (err) {
    error('数据刷新失败')
  } finally {
    isLoading.value = false
  }
}

const getCategoryPercentage = (count: number) => {
  if (!overview.value) return 0
  const total = overview.value.distributions.categories.reduce((sum: number, cat: any) => sum + cat.count, 0)
  return total > 0 ? (count / total) * 100 : 0
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已拒绝'
  }
  return statusMap[status] || status
}

const getActionIcon = (action: string) => {
  const icons: Record<string, any> = {
    view: Eye,
    search: Search,
    favorite: Heart,
    unfavorite: Heart,
    rating: Star,
    comment: MessageSquare,
    download: FileText
  }
  return icons[action] || FileText
}

const getActivityDescription = (activity: any) => {
  if (activity.action === 'view' && activity.toolName) {
    return `浏览了工具 "${activity.toolName}"`
  } else if (activity.action === 'search' && activity.targetName) {
    return `搜索了 "${activity.targetName}"`
  } else if (activity.action === 'favorite' && activity.toolName) {
    return `收藏了工具 "${activity.toolName}"`
  } else if (activity.action === 'rating' && activity.toolName) {
    return `对工具 "${activity.toolName}" 进行了评分`
  } else if (activity.action === 'comment' && activity.toolName) {
    return `评论了工具 "${activity.toolName}"`
  }
  return '执行了操作'
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  
  return date.toLocaleDateString('zh-CN')
}

const toggleUserStatus = async (user: any) => {
  try {
    const action = user.is_active ? 'deactivate' : 'activate'
    const response = await apiRequest('/admin/dashboard/batch', {
      method: 'POST',
      body: JSON.stringify({
        action,
        type: 'users',
        ids: [user.id]
      })
    })
    
    if (response.success) {
      success(response.message)
      await loadUsers()
    } else {
      error(response.error || '操作失败')
    }
  } catch (err) {
    error('网络错误，请稍后重试')
  }
}

const approveTool = async (tool: any) => {
  try {
    const response = await apiRequest('/admin/dashboard/batch', {
      method: 'POST',
      body: JSON.stringify({
        action: 'approve',
        type: 'tools',
        ids: [tool.id]
      })
    })
    
    if (response.success) {
      success('工具审核通过')
      await loadTools()
      await loadOverview()
    } else {
      error(response.error || '操作失败')
    }
  } catch (err) {
    error('网络错误，请稍后重试')
  }
}

const rejectTool = async (tool: any) => {
  try {
    const response = await apiRequest('/admin/dashboard/batch', {
      method: 'POST',
      body: JSON.stringify({
        action: 'reject',
        type: 'tools',
        ids: [tool.id]
      })
    })
    
    if (response.success) {
      success('工具已拒绝')
      await loadTools()
      await loadOverview()
    } else {
      error(response.error || '操作失败')
    }
  } catch (err) {
    error('网络错误，请稍后重试')
  }
}

const viewTool = (tool: any) => {
  router.push(`/tool/${tool.id}`)
}

const approveComment = async (comment: any) => {
  try {
    const response = await apiRequest('/admin/dashboard/batch', {
      method: 'POST',
      body: JSON.stringify({
        action: 'approve',
        type: 'comments',
        ids: [comment.id]
      })
    })
    
    if (response.success) {
      success('评论审核通过')
      await loadComments()
    } else {
      error(response.error || '操作失败')
    }
  } catch (err) {
    error('网络错误，请稍后重试')
  }
}

const rejectComment = async (comment: any) => {
  try {
    const response = await apiRequest('/admin/dashboard/batch', {
      method: 'POST',
      body: JSON.stringify({
        action: 'reject',
        type: 'comments',
        ids: [comment.id]
      })
    })
    
    if (response.success) {
      success('评论已拒绝')
      await loadComments()
    } else {
      error(response.error || '操作失败')
    }
  } catch (err) {
    error('网络错误，请稍后重试')
  }
}

const deleteComment = async (comment: any) => {
  if (!confirm('确定要删除这条评论吗？')) return
  
  try {
    const response = await apiRequest('/admin/dashboard/batch', {
      method: 'POST',
      body: JSON.stringify({
        action: 'delete',
        type: 'comments',
        ids: [comment.id]
      })
    })
    
    if (response.success) {
      success('评论已删除')
      await loadComments()
    } else {
      error(response.error || '操作失败')
    }
  } catch (err) {
    error('网络错误，请稍后重试')
  }
}

// 监听标签页切换
watch(() => activeTab.value, (newTab) => {
  if (newTab === 'users') loadUsers()
  else if (newTab === 'tools') loadTools()
  else if (newTab === 'comments') loadComments()
  else if (newTab === 'activity') loadActivity()
})

// 初始化
onMounted(() => {
  if (isAdmin.value) {
    loadOverview()
    loadUsers()
  } else {
    router.push('/')
  }
})
</script>

<style scoped>
.admin-dashboard {
  min-height: 100vh;
  background-color: var(--bg-secondary);
  padding: 2rem 0;
}

.page-header {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.header-info h1 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.header-info p {
  color: var(--text-secondary);
  font-size: 1rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.overview-section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  transition: all 0.2s ease;
}

.stat-card:hover {
  box-shadow: var(--shadow-sm);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-icon.users {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.tools {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.pending {
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
  color: #d97706;
}

.stat-icon.comments {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
  color: #059669;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
}

.stat-change {
  font-size: 0.75rem;
  font-weight: 500;
}

.stat-change.positive {
  color: var(--success-color);
}

.stat-change.warning {
  color: var(--warning-color);
}

.charts-section {
  margin-bottom: 2rem;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1rem;
}

.chart-card {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
}

.chart-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.chart-container {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
}

.chart-icon {
  margin-bottom: 0.5rem;
}

.chart-text {
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.chart-description {
  font-size: 0.75rem;
}

.distribution-section {
  margin-bottom: 2rem;
}

.category-chart {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.category-item:last-child {
  margin-bottom: 0;
}

.category-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 200px;
}

.category-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
}

.category-count {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.category-bar {
  flex: 1;
  height: 8px;
  background-color: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.category-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s ease;
}

.tabs-section {
  margin-bottom: 1rem;
}

.tabs-nav {
  display: flex;
  gap: 0.5rem;
  border-bottom: 1px solid var(--border-color);
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
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
  background-color: var(--bg-tertiary);
  color: var(--text-muted);
  padding: 0.125rem 0.375rem;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
}

.tab-content {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.tab-panel {
  padding: 1.5rem;
}

.panel-header {
  margin-bottom: 1.5rem;
}

.panel-filters {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-input,
.filter-select {
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.875rem;
  min-width: 150px;
}

.filter-input:focus,
.filter-select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.data-table {
  width: 100%;
}

.table-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr;
  gap: 1rem;
  padding: 1rem;
  background-color: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-color);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
}

.table-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  align-items: center;
}

.table-row:hover {
  background-color: var(--bg-tertiary);
}

.table-cell {
  font-size: 0.875rem;
  color: var(--text-primary);
}

.loading-row,
.empty-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 2rem;
  color: var(--text-secondary);
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--border-color);
  border-top: 2px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.user-info {
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

.user-details {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.username {
  font-weight: 500;
  color: var(--text-primary);
}

.user-role {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.tool-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.tool-name {
  font-weight: 500;
  color: var(--text-primary);
}

.tool-description {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.pending {
  background-color: rgba(245, 158, 11, 0.1);
  color: #d97706;
}

.status-badge.approved {
  background-color: rgba(34, 197, 94, 0.1);
  color: #059669;
}

.status-badge.rejected {
  background-color: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.rating {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.star-icon {
  color: #fbbf24;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.375rem 0.75rem;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
}

.action-btn:hover {
  background-color: var(--border-color);
}

.action-btn.success {
  background-color: var(--success-color);
  color: white;
}

.action-btn.success:hover {
  background-color: #059669;
}

.action-btn.danger {
  background-color: var(--error-color);
  color: white;
}

.action-btn.danger:hover {
  background-color: #dc2626;
}

.comment-content {
  font-size: 0.875rem;
  color: var(--text-primary);
  line-height: 1.4;
}

.activity-list {
  max-height: 600px;
  overflow-y: auto;
}

.loading-state,
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 3rem;
  color: var(--text-secondary);
}

.activity-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background-color: var(--bg-tertiary);
  border-radius: var(--radius-md);
}

.activity-icon {
  width: 32px;
  height: 32px;
  background-color: var(--primary-color);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
}

.activity-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.25rem;
}

.activity-user {
  font-weight: 500;
  color: var(--text-primary);
}

.activity-time {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.activity-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.btn-icon.spinning {
  animation: spin 1s linear infinite;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .charts-grid {
    grid-template-columns: 1fr;
  }
  
  .tabs-nav {
    flex-wrap: wrap;
  }
  
  .tab-btn {
    flex: 1;
    min-width: 120px;
  }
  
  .table-header,
  .table-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  
  .table-cell {
    padding: 0.5rem 0;
  }
  
  .panel-filters {
    flex-direction: column;
  }
  
  .filter-input,
  .filter-select {
    min-width: auto;
  }
}
</style>