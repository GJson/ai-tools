<template>
  <div class="admin-tools-page">
    <!-- 头部导航 -->
    <header class="header">
      <div class="container">
        <div class="header-content">
          <button @click="goBack" class="back-btn" type="button">
            <ArrowLeft class="back-icon" />
            返回
          </button>
          <h1 class="page-title">工具审核管理</h1>
          <div class="header-actions">
            <button @click="refreshData" class="refresh-btn" :disabled="isLoading">
              <RefreshCw class="refresh-icon" :size="20" :class="{ 'spinning': isLoading }" />
              刷新
            </button>
          </div>
        </div>
      </div>
    </header>

    <div class="main-content">
      <div class="container">
        <!-- 统计卡片 -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon pending">
              <Clock class="icon" :size="24" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.pendingTools || 0 }}</div>
              <div class="stat-label">待审核</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon approved">
              <CheckCircle class="icon" :size="24" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.approvedTools || 0 }}</div>
              <div class="stat-label">已通过</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon rejected">
              <XCircle class="icon" :size="24" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.rejectedTools || 0 }}</div>
              <div class="stat-label">已拒绝</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon total">
              <BarChart class="icon" :size="24" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.totalTools || 0 }}</div>
              <div class="stat-label">总工具数</div>
            </div>
          </div>
        </div>

        <!-- 筛选和搜索 -->
        <div class="filters-section">
          <div class="filters-row">
            <div class="filter-group">
              <label class="filter-label">状态筛选</label>
              <select v-model="filters.status" class="filter-select" @change="loadTools">
                <option value="">全部状态</option>
                <option value="pending">待审核</option>
                <option value="approved">已通过</option>
                <option value="rejected">已拒绝</option>
              </select>
            </div>
            
            <div class="filter-group">
              <label class="filter-label">分类筛选</label>
              <select v-model="filters.category" class="filter-select" @change="loadTools">
                <option value="">全部分类</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                  {{ cat.name }}
                </option>
              </select>
            </div>
            
            <div class="filter-group">
              <label class="filter-label">搜索工具</label>
              <input
                v-model="filters.search"
                type="text"
                class="filter-input"
                placeholder="搜索工具名称..."
                @input="onSearchInput"
              />
            </div>
            
            <button @click="clearFilters" class="clear-filters-btn">
              <X class="clear-icon" :size="16" />
              清除筛选
            </button>
          </div>
        </div>

        <!-- 工具列表 -->
        <div class="tools-section">
          <div class="section-header">
            <h2 class="section-title">工具列表</h2>
            <div class="section-actions">
              <span class="results-count">共 {{ totalTools }} 个工具</span>
            </div>
          </div>
          
          <div v-if="isLoading" class="loading-state">
            <LoadingSpinner :size="32" />
            <p>加载中...</p>
          </div>
          
          <div v-else-if="tools.length === 0" class="empty-state">
            <Package class="empty-icon" :size="48" />
            <p>暂无工具数据</p>
          </div>
          
          <div v-else class="tools-grid">
            <div 
              v-for="tool in tools" 
              :key="tool.id"
              class="tool-card"
              :class="`tool-card--${tool.status}`"
            >
              <div class="tool-header">
                <div class="tool-icon">
                  <Bot class="icon" :size="24" />
                </div>
                <div class="tool-info">
                  <h3 class="tool-name">{{ tool.name }}</h3>
                  <p class="tool-category">{{ getCategoryName(tool.category) }}</p>
                  <div class="tool-meta">
                    <span class="tool-status" :class="`status--${tool.status}`">
                      {{ getStatusText(tool.status) }}
                    </span>
                    <span class="tool-date">{{ formatDate(tool.createdAt) }}</span>
                  </div>
                </div>
                <div class="tool-actions">
                  <button @click="viewTool(tool)" class="action-btn view-btn">
                    <Eye class="btn-icon" :size="16" />
                    查看
                  </button>
                  <button 
                    v-if="tool.status === 'pending'"
                    @click="approveTool(tool)" 
                    class="action-btn approve-btn"
                  >
                    <Check class="btn-icon" :size="16" />
                    通过
                  </button>
                  <button 
                    v-if="tool.status === 'pending'"
                    @click="rejectTool(tool)" 
                    class="action-btn reject-btn"
                  >
                    <X class="btn-icon" :size="16" />
                    拒绝
                  </button>
                </div>
              </div>
              
              <div class="tool-content">
                <p class="tool-description">{{ tool.description }}</p>
                
                <div v-if="tool.tags && tool.tags.length > 0" class="tool-tags">
                  <span 
                    v-for="tag in tool.tags.slice(0, 5)" 
                    :key="tag"
                    class="tag"
                  >
                    {{ tag }}
                  </span>
                  <span v-if="tool.tags.length > 5" class="tag-more">
                    +{{ tool.tags.length - 5 }}
                  </span>
                </div>
                
                <div class="tool-details">
                  <div class="detail-item">
                    <span class="detail-label">网站：</span>
                    <a :href="tool.website" target="_blank" class="detail-link">
                      {{ tool.website }}
                    </a>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">定价：</span>
                    <span class="detail-value">{{ getPricingText(tool.pricing) }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">提交者：</span>
                    <span class="detail-value">{{ tool.submittedByUsername || '未知' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 分页 -->
          <div v-if="totalPages > 1" class="pagination">
            <button 
              @click="changePage(currentPage - 1)"
              :disabled="currentPage <= 1"
              class="page-btn"
            >
              <ChevronLeft class="btn-icon" :size="16" />
              上一页
            </button>
            
            <div class="page-numbers">
              <button 
                v-for="page in visiblePages" 
                :key="page"
                @click="changePage(page)"
                :class="['page-number', { active: page === currentPage }]"
              >
                {{ page }}
              </button>
            </div>
            
            <button 
              @click="changePage(currentPage + 1)"
              :disabled="currentPage >= totalPages"
              class="page-btn"
            >
              下一页
              <ChevronRight class="btn-icon" :size="16" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 工具详情模态框 -->
    <Modal v-model:visible="showToolDetail" title="工具详情" size="xl">
      <div v-if="selectedTool" class="tool-detail">
        <div class="detail-header">
          <div class="detail-icon">
            <Bot class="icon" :size="32" />
          </div>
          <div class="detail-info">
            <h2 class="detail-name">{{ selectedTool.name }}</h2>
            <div class="detail-meta">
              <span class="detail-category">{{ getCategoryName(selectedTool.category) }}</span>
              <span class="detail-status" :class="`status--${selectedTool.status}`">
                {{ getStatusText(selectedTool.status) }}
              </span>
              <span class="detail-date">{{ formatDate(selectedTool.createdAt) }}</span>
            </div>
          </div>
        </div>
        
        <div class="detail-content">
          <div class="detail-section">
            <h3 class="section-title">工具描述</h3>
            <p class="section-content">{{ selectedTool.description }}</p>
          </div>
          
          <div v-if="selectedTool.features && selectedTool.features.length > 0" class="detail-section">
            <h3 class="section-title">主要功能</h3>
            <ul class="features-list">
              <li v-for="feature in selectedTool.features" :key="feature" class="feature-item">
                {{ feature }}
              </li>
            </ul>
          </div>
          
          <div v-if="selectedTool.tags && selectedTool.tags.length > 0" class="detail-section">
            <h3 class="section-title">标签</h3>
            <div class="tags-list">
              <span v-for="tag in selectedTool.tags" :key="tag" class="tag">
                {{ tag }}
              </span>
            </div>
          </div>
          
          <div class="detail-section">
            <h3 class="section-title">基本信息</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">官方网站</span>
                <a :href="selectedTool.website" target="_blank" class="info-link">
                  {{ selectedTool.website }}
                </a>
              </div>
              <div class="info-item">
                <span class="info-label">定价模式</span>
                <span class="info-value">{{ getPricingText(selectedTool.pricing) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">提交者</span>
                <span class="info-value">{{ selectedTool.submittedByUsername || '未知' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">联系邮箱</span>
                <span class="info-value">{{ selectedTool.contactEmail || '未提供' }}</span>
              </div>
            </div>
          </div>
          
          <div v-if="selectedTool.notes" class="detail-section">
            <h3 class="section-title">备注信息</h3>
            <p class="section-content">{{ selectedTool.notes }}</p>
          </div>
          
          <div v-if="selectedTool.screenshots && selectedTool.screenshots.length > 0" class="detail-section">
            <h3 class="section-title">截图演示</h3>
            <div class="screenshots-grid">
              <div 
                v-for="(screenshot, index) in selectedTool.screenshots" 
                :key="index"
                class="screenshot-item"
              >
                <img :src="screenshot.url" :alt="screenshot.name" class="screenshot-img" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <template #footer>
        <div class="modal-actions">
          <button @click="showToolDetail = false" class="cancel-btn">关闭</button>
          <div v-if="selectedTool && selectedTool.status === 'pending'" class="review-actions">
            <button @click="approveTool(selectedTool)" class="approve-btn">
              <Check class="btn-icon" :size="16" />
              通过审核
            </button>
            <button @click="rejectTool(selectedTool)" class="reject-btn">
              <X class="btn-icon" :size="16" />
              拒绝审核
            </button>
          </div>
        </div>
      </template>
    </Modal>

    <!-- 拒绝审核模态框 -->
    <Modal v-model:visible="showRejectModal" title="拒绝审核" size="md">
      <div class="reject-form">
        <p class="reject-text">请说明拒绝此工具的原因：</p>
        <textarea
          v-model="rejectReason"
          class="reject-textarea"
          placeholder="请输入拒绝原因..."
          rows="4"
          maxlength="500"
        ></textarea>
        <div class="char-count">{{ rejectReason.length }}/500</div>
      </div>
      
      <template #footer>
        <button @click="showRejectModal = false" class="cancel-btn">取消</button>
        <button @click="confirmReject" class="reject-btn" :disabled="!rejectReason.trim()">
          确认拒绝
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  ArrowLeft, 
  RefreshCw, 
  Clock, 
  CheckCircle, 
  XCircle, 
  BarChart,
  X,
  Eye,
  Check,
  Package,
  Bot,
  ChevronLeft,
  ChevronRight
} from 'lucide-vue-next'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'
import { categories } from '@/data/categories'
import Modal from '@/components/Modal.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const router = useRouter()
const { apiRequest } = useAuth()
const { success, error } = useToast()

// 响应式数据
const isLoading = ref(false)
const tools = ref<any[]>([])
const stats = ref({
  totalTools: 0,
  pendingTools: 0,
  approvedTools: 0,
  rejectedTools: 0
})
const totalTools = ref(0)
const currentPage = ref(1)
const pageSize = 10
const totalPages = computed(() => Math.ceil(totalTools.value / pageSize))

const showToolDetail = ref(false)
const selectedTool = ref<any>(null)
const showRejectModal = ref(false)
const rejectReason = ref('')
const toolToReject = ref<any>(null)

const filters = reactive({
  status: '',
  category: '',
  search: ''
})

// 搜索防抖
let searchTimeout: NodeJS.Timeout

// 计算属性
const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

// 方法
const goBack = () => {
  router.push('/')
}

const refreshData = async () => {
  await Promise.all([
    loadStats(),
    loadTools()
  ])
}

const loadStats = async () => {
  try {
    const response = await apiRequest('/tools/admin/stats')
    if (response.success) {
      stats.value = response.data
    }
  } catch (err) {
    console.error('加载统计信息失败:', err)
  }
}

const loadTools = async () => {
  try {
    isLoading.value = true
    
    const params = new URLSearchParams({
      limit: pageSize.toString(),
      offset: ((currentPage.value - 1) * pageSize).toString()
    })
    
    if (filters.status) params.append('status', filters.status)
    if (filters.category) params.append('category', filters.category)
    if (filters.search) params.append('search', filters.search)
    
    const response = await apiRequest(`/tools/admin/pending?${params}`)
    
    if (response.success) {
      tools.value = response.data.tools
      totalTools.value = response.data.total
    } else {
      error(response.error || '加载工具列表失败')
    }
  } catch (err) {
    error('网络错误，请稍后重试')
  } finally {
    isLoading.value = false
  }
}

const onSearchInput = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    loadTools()
  }, 500)
}

const clearFilters = () => {
  filters.status = ''
  filters.category = ''
  filters.search = ''
  currentPage.value = 1
  loadTools()
}

const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    loadTools()
  }
}

const viewTool = (tool: any) => {
  selectedTool.value = tool
  showToolDetail.value = true
}

const approveTool = async (tool: any) => {
  try {
    const response = await apiRequest(`/tools/${tool.id}/review`, {
      method: 'PUT',
      body: JSON.stringify({
        status: 'approved'
      })
    })
    
    if (response.success) {
      success('工具审核通过')
      await refreshData()
      if (showToolDetail.value) {
        showToolDetail.value = false
      }
    } else {
      error(response.error || '审核失败')
    }
  } catch (err) {
    error('网络错误，请稍后重试')
  }
}

const rejectTool = (tool: any) => {
  toolToReject.value = tool
  rejectReason.value = ''
  showRejectModal.value = true
}

const confirmReject = async () => {
  if (!toolToReject.value || !rejectReason.value.trim()) return
  
  try {
    const response = await apiRequest(`/tools/${toolToReject.value.id}/review`, {
      method: 'PUT',
      body: JSON.stringify({
        status: 'rejected',
        rejectedReason: rejectReason.value.trim()
      })
    })
    
    if (response.success) {
      success('工具已拒绝')
      showRejectModal.value = false
      toolToReject.value = null
      rejectReason.value = ''
      await refreshData()
      if (showToolDetail.value) {
        showToolDetail.value = false
      }
    } else {
      error(response.error || '拒绝失败')
    }
  } catch (err) {
    error('网络错误，请稍后重试')
  }
}

const getCategoryName = (categoryId: string) => {
  const category = categories.find(cat => cat.id === categoryId)
  return category?.name || categoryId
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已拒绝'
  }
  return statusMap[status] || status
}

const getPricingText = (pricing: string) => {
  const pricingMap: Record<string, string> = {
    free: '免费',
    freemium: '免费+付费',
    paid: '付费',
    trial: '试用'
  }
  return pricingMap[pricing] || pricing
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

// 初始化
onMounted(() => {
  refreshData()
})
</script>

<style scoped>
.admin-tools-page {
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
  justify-content: space-between;
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

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
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

.refresh-btn:hover:not(:disabled) {
  background-color: var(--primary-hover);
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.refresh-icon {
  width: 20px;
  height: 20px;
}

.refresh-icon.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.main-content {
  padding: 2rem 0;
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
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-icon.pending {
  background: linear-gradient(135deg, #f59e0b, #f97316);
}

.stat-icon.approved {
  background: linear-gradient(135deg, #10b981, #34d399);
}

.stat-icon.rejected {
  background: linear-gradient(135deg, #ef4444, #f87171);
}

.stat-icon.total {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
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

.filters-section {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  margin-bottom: 2rem;
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
  min-width: 150px;
}

.filter-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
}

.filter-select,
.filter-input {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: all 0.2s ease;
}

.filter-select:focus,
.filter-input:focus {
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

.clear-icon {
  width: 16px;
  height: 16px;
}

.tools-section {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.results-count {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.loading-state,
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

.tools-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.tool-card {
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  transition: all 0.2s ease;
}

.tool-card:hover {
  box-shadow: var(--shadow-md);
}

.tool-card--pending {
  border-left: 4px solid #f59e0b;
}

.tool-card--approved {
  border-left: 4px solid #10b981;
}

.tool-card--rejected {
  border-left: 4px solid #ef4444;
}

.tool-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.tool-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.tool-icon .icon {
  width: 24px;
  height: 24px;
}

.tool-info {
  flex: 1;
  min-width: 0;
}

.tool-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tool-category {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0 0 0.5rem 0;
}

.tool-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.tool-status {
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 500;
}

.status--pending {
  background-color: #fef3c7;
  color: #92400e;
}

.status--approved {
  background-color: #d1fae5;
  color: #065f46;
}

.status--rejected {
  background-color: #fee2e2;
  color: #991b1b;
}

.tool-date {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.tool-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: var(--radius-md);
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.view-btn {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.view-btn:hover {
  background-color: var(--border-color);
}

.approve-btn {
  background-color: #10b981;
  color: white;
}

.approve-btn:hover {
  background-color: #059669;
}

.reject-btn {
  background-color: #ef4444;
  color: white;
}

.reject-btn:hover {
  background-color: #dc2626;
}

.btn-icon {
  width: 16px;
  height: 16px;
}

.tool-content {
  margin-top: 1rem;
}

.tool-description {
  color: var(--text-primary);
  line-height: 1.6;
  margin-bottom: 1rem;
}

.tool-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tag {
  padding: 0.25rem 0.5rem;
  background-color: var(--bg-tertiary);
  color: var(--text-secondary);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
}

.tag-more {
  padding: 0.25rem 0.5rem;
  background-color: var(--border-color);
  color: var(--text-muted);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
}

.tool-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.detail-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-weight: 500;
}

.detail-value {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.detail-link {
  font-size: 0.75rem;
  color: var(--primary-color);
  text-decoration: none;
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.detail-link:hover {
  text-decoration: underline;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.page-btn {
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

.page-btn:hover:not(:disabled) {
  background-color: var(--bg-tertiary);
  border-color: var(--border-hover);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 0.25rem;
}

.page-number {
  width: 40px;
  height: 40px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: none;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-number:hover {
  background-color: var(--bg-tertiary);
  border-color: var(--border-hover);
}

.page-number.active {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

/* 工具详情模态框样式 */
.tool-detail {
  padding: 1rem 0;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.detail-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.detail-icon .icon {
  width: 32px;
  height: 32px;
}

.detail-info {
  flex: 1;
}

.detail-name {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.detail-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.detail-category {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.detail-status {
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 500;
}

.detail-date {
  font-size: 0.875rem;
  color: var(--text-muted);
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.detail-section {
  background-color: var(--bg-tertiary);
  padding: 1rem;
  border-radius: var(--radius-md);
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.75rem 0;
}

.section-content {
  color: var(--text-primary);
  line-height: 1.6;
  margin: 0;
}

.features-list {
  margin: 0;
  padding-left: 1.25rem;
}

.feature-item {
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-muted);
}

.info-value {
  font-size: 0.875rem;
  color: var(--text-primary);
}

.info-link {
  font-size: 0.875rem;
  color: var(--primary-color);
  text-decoration: none;
  word-break: break-all;
}

.info-link:hover {
  text-decoration: underline;
}

.screenshots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.screenshot-item {
  aspect-ratio: 1;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.screenshot-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.modal-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.review-actions {
  display: flex;
  gap: 0.75rem;
}

.cancel-btn {
  padding: 0.5rem 1rem;
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  background-color: var(--border-color);
}

/* 拒绝审核模态框样式 */
.reject-form {
  padding: 1rem 0;
}

.reject-text {
  font-size: 0.875rem;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.reject-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  resize: vertical;
  min-height: 100px;
}

.reject-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.char-count {
  text-align: right;
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 0.5rem;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .main-content {
    padding: 1rem 0;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .filters-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-group {
    min-width: auto;
  }
  
  .tool-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .tool-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .tool-details {
    grid-template-columns: 1fr;
  }
  
  .detail-header {
    flex-direction: column;
    text-align: center;
  }
  
  .detail-meta {
    justify-content: center;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .review-actions {
    width: 100%;
    justify-content: center;
  }
}
</style>