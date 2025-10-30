<template>
  <div class="favorites-page">
    <!-- 头部导航 -->
    <header class="header">
      <div class="container">
        <div class="header-content">
          <button @click="goBack" class="back-btn" type="button">
            <ArrowLeft class="back-icon" />
            返回
          </button>
          <h1 class="page-title">我的收藏</h1>
          <div class="header-actions">
            <button @click="showCreateFolderModal = true" class="action-btn primary">
              <FolderPlus class="btn-icon" :size="16" />
              新建
            </button>
            <button @click="toggleViewMode" class="action-btn">
              <component :is="viewMode === 'grid' ? List : Grid3X3" class="btn-icon" :size="16" />
              {{ viewMode === 'grid' ? '列表' : '网格' }}
            </button>
          </div>
        </div>
      </div>
    </header>

    <div class="main-content">
      <div class="container">
        <!-- 页面描述 -->
        <div class="page-description">
          <p>管理您收藏的AI工具</p>
        </div>

      <!-- 统计信息 -->
      <div v-if="stats" class="stats-section">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">
              <Heart class="icon" :size="20" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.totalFavorites }}</div>
              <div class="stat-label">总收藏数</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <Folder class="icon" :size="20" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.categoriesCount }}</div>
              <div class="stat-label">分类数量</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <Star class="icon" :size="20" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.avgRating.toFixed(1) }}</div>
              <div class="stat-label">平均评分</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 筛选和排序 -->
      <div class="filters-section">
        <div class="filters-row">
          <div class="filter-group">
            <label class="filter-label">分类筛选</label>
            <select v-model="filters.category" @change="loadFavorites" class="filter-select">
              <option value="">全部分类</option>
              <option v-for="category in categories" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
          </div>
          
          <div class="filter-group">
            <label class="filter-label">排序方式</label>
            <select v-model="filters.sortBy" @change="loadFavorites" class="filter-select">
              <option value="createdAt">收藏时间</option>
              <option value="name">工具名称</option>
              <option value="averageRating">评分</option>
              <option value="viewCount">浏览量</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label class="filter-label">排序顺序</label>
            <select v-model="filters.order" @change="loadFavorites" class="filter-select">
              <option value="DESC">降序</option>
              <option value="ASC">升序</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 收藏夹列表 -->
      <div v-if="folders.length > 0" class="folders-section">
        <h2 class="section-title">收藏夹</h2>
        <div class="folders-grid">
          <div
            v-for="folder in folders"
            :key="folder.id"
            class="folder-card"
            @click="selectFolder(folder)"
          >
            <div class="folder-header">
              <div class="folder-icon" :style="{ backgroundColor: folder.color }">
                <Folder class="icon" :size="20" />
              </div>
              <div class="folder-actions">
                <button @click.stop="editFolder(folder)" class="action-btn">
                  <Edit class="btn-icon" :size="14" />
                </button>
                <button @click.stop="deleteFolder(folder)" class="action-btn delete">
                  <Trash2 class="btn-icon" :size="14" />
                </button>
              </div>
            </div>
            <div class="folder-content">
              <h3 class="folder-name">{{ folder.name }}</h3>
              <p v-if="folder.description" class="folder-description">{{ folder.description }}</p>
              <div class="folder-stats">
                <span class="folder-count">{{ folder.favoritesCount }} 个收藏</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 收藏列表 -->
      <div class="favorites-section">
        <div class="section-header">
          <h2 class="section-title">
            {{ selectedFolder ? selectedFolder.name : '所有收藏' }}
          </h2>
          <div class="section-actions">
            <button v-if="selectedFavorites.length > 0" @click="showBatchActions = true" class="btn btn-outline">
              <MoreHorizontal class="btn-icon" :size="16" />
              批量操作 ({{ selectedFavorites.length }})
            </button>
          </div>
        </div>

        <!-- 加载状态 -->
        <div v-if="isLoading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>加载中...</p>
        </div>

        <!-- 空状态 -->
        <div v-else-if="favorites.length === 0" class="empty-state">
          <div class="empty-icon">
            <Heart class="icon" :size="48" />
          </div>
          <h3 class="empty-title">暂无收藏</h3>
          <p class="empty-description">
            {{ selectedFolder ? '该收藏夹中还没有收藏任何工具' : '您还没有收藏任何工具' }}
          </p>
          <button @click="$router.push('/')" class="btn btn-primary">
            <Search class="btn-icon" :size="16" />
            去发现工具
          </button>
        </div>

        <!-- 收藏列表 -->
        <div v-else class="favorites-container">
          <div :class="['favorites-grid', `favorites-grid--${viewMode}`]">
            <div
              v-for="favorite in favorites"
              :key="favorite.id"
              class="favorite-item"
              :class="{ 'favorite-item--selected': selectedFavorites.includes(favorite.id) }"
            >
              <div class="favorite-checkbox" v-if="showBatchActions">
                <input
                  type="checkbox"
                  :value="favorite.id"
                  v-model="selectedFavorites"
                  class="checkbox"
                />
              </div>
              
              <div class="favorite-content" @click="viewTool(favorite)">
                <div class="favorite-header">
                  <div class="tool-logo">
                    <img v-if="favorite.logo" :src="favorite.logo" :alt="favorite.name" />
                    <div v-else class="logo-placeholder">
                      {{ favorite.name.charAt(0) }}
                    </div>
                  </div>
                  <div class="tool-info">
                    <h3 class="tool-name">{{ favorite.name }}</h3>
                    <p class="tool-description">{{ favorite.description }}</p>
                  </div>
                </div>
                
                <div class="favorite-meta">
                  <div class="tool-category">{{ favorite.category }}</div>
                  <div class="tool-rating" v-if="favorite.averageRating > 0">
                    <Star class="star-icon" :size="14" />
                    <span>{{ favorite.averageRating.toFixed(1) }}</span>
                  </div>
                </div>
                
                <div class="favorite-stats">
                  <div class="stat">
                    <Eye class="stat-icon" :size="14" />
                    <span>{{ favorite.viewCount || 0 }}</span>
                  </div>
                  <div class="stat">
                    <Heart class="stat-icon" :size="14" />
                    <span>{{ favorite.favoriteCount || 0 }}</span>
                  </div>
                  <div class="stat">
                    <Calendar class="stat-icon" :size="14" />
                    <span>{{ formatDate(favorite.createdAt) }}</span>
                  </div>
                </div>
              </div>
              
              <div class="favorite-actions">
                <button @click="viewTool(favorite)" class="action-btn">
                  <ExternalLink class="btn-icon" :size="14" />
                </button>
                <button @click="removeFavorite(favorite)" class="action-btn delete">
                  <Trash2 class="btn-icon" :size="14" />
                </button>
              </div>
            </div>
          </div>
          
          <!-- 加载更多 -->
          <div v-if="hasMore" class="load-more">
            <button @click="loadMore" :disabled="isLoadingMore" class="btn btn-outline">
              <RefreshCw class="btn-icon" :size="16" :class="{ spinning: isLoadingMore }" />
              {{ isLoadingMore ? '加载中...' : '加载更多' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    </div>

    <!-- 创建收藏夹模态框 -->
    <Modal v-model:visible="showCreateFolderModal" title="创建收藏夹" size="md">
      <div class="create-folder-form">
        <div class="form-group">
          <label class="form-label">收藏夹名称</label>
          <input
            v-model="newFolder.name"
            type="text"
            class="form-input"
            placeholder="请输入收藏夹名称"
            maxlength="50"
          />
        </div>
        
        <div class="form-group">
          <label class="form-label">描述（可选）</label>
          <textarea
            v-model="newFolder.description"
            class="form-textarea"
            placeholder="请输入收藏夹描述"
            maxlength="200"
            rows="3"
          ></textarea>
        </div>
        
        <div class="form-group">
          <label class="form-label">颜色</label>
          <div class="color-picker">
            <button
              v-for="color in folderColors"
              :key="color"
              @click="newFolder.color = color"
              class="color-option"
              :class="{ active: newFolder.color === color }"
              :style="{ backgroundColor: color }"
            ></button>
          </div>
        </div>
      </div>
      
      <template #footer>
        <button @click="showCreateFolderModal = false" class="btn btn-outline">取消</button>
        <button @click="createFolder" class="btn btn-primary" :disabled="!newFolder.name">
          创建
        </button>
      </template>
    </Modal>

    <!-- 编辑收藏夹模态框 -->
    <Modal v-model:visible="showEditFolderModal" title="编辑收藏夹" size="md">
      <div class="edit-folder-form">
        <div class="form-group">
          <label class="form-label">收藏夹名称</label>
          <input
            v-model="editingFolder.name"
            type="text"
            class="form-input"
            placeholder="请输入收藏夹名称"
            maxlength="50"
          />
        </div>
        
        <div class="form-group">
          <label class="form-label">描述（可选）</label>
          <textarea
            v-model="editingFolder.description"
            class="form-textarea"
            placeholder="请输入收藏夹描述"
            maxlength="200"
            rows="3"
          ></textarea>
        </div>
        
        <div class="form-group">
          <label class="form-label">颜色</label>
          <div class="color-picker">
            <button
              v-for="color in folderColors"
              :key="color"
              @click="editingFolder.color = color"
              class="color-option"
              :class="{ active: editingFolder.color === color }"
              :style="{ backgroundColor: color }"
            ></button>
          </div>
        </div>
      </div>
      
      <template #footer>
        <button @click="showEditFolderModal = false" class="btn btn-outline">取消</button>
        <button @click="updateFolder" class="btn btn-primary" :disabled="!editingFolder.name">
          保存
        </button>
      </template>
    </Modal>

    <!-- 批量操作模态框 -->
    <Modal v-model:visible="showBatchActions" title="批量操作" size="md">
      <div class="batch-actions-form">
        <div class="form-group">
          <label class="form-label">选择操作</label>
          <select v-model="batchAction" class="form-select">
            <option value="move">移动到收藏夹</option>
            <option value="remove">删除收藏</option>
          </select>
        </div>
        
        <div v-if="batchAction === 'move'" class="form-group">
          <label class="form-label">目标收藏夹</label>
          <select v-model="batchTargetFolder" class="form-select">
            <option value="">选择收藏夹</option>
            <option v-for="folder in folders" :key="folder.id" :value="folder.id">
              {{ folder.name }}
            </option>
          </select>
        </div>
      </div>
      
      <template #footer>
        <button @click="showBatchActions = false" class="btn btn-outline">取消</button>
        <button @click="executeBatchAction" class="btn btn-primary" :disabled="!batchAction">
          执行
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { 
  ArrowLeft,
  Heart, 
  Folder, 
  FolderPlus, 
  Star, 
  Edit, 
  Trash2, 
  MoreHorizontal, 
  Search, 
  ExternalLink, 
  Eye, 
  Calendar, 
  RefreshCw, 
  List, 
  Grid3X3 
} from 'lucide-vue-next'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'
import Modal from '@/components/Modal.vue'

const router = useRouter()
const { user, isAuthenticated, apiRequest } = useAuth()
const { success, error } = useToast()

// 响应式数据
const favorites = ref<any[]>([])
const folders = ref<any[]>([])
const stats = ref<any>(null)
const selectedFolder = ref<any>(null)
const selectedFavorites = ref<string[]>([])
const viewMode = ref<'grid' | 'list'>('grid')
const isLoading = ref(false)
const isLoadingMore = ref(false)
const hasMore = ref(true)
const offset = ref(0)

// 筛选和排序
const filters = ref({
  category: '',
  sortBy: 'createdAt',
  order: 'DESC'
})

const categories = ref<string[]>([])

// 模态框状态
const showCreateFolderModal = ref(false)
const showEditFolderModal = ref(false)
const showBatchActions = ref(false)

// 表单数据
const newFolder = ref({
  name: '',
  description: '',
  color: '#6366f1'
})

const editingFolder = ref({
  id: 0,
  name: '',
  description: '',
  color: '#6366f1'
})

const batchAction = ref('move')
const batchTargetFolder = ref('')

// 收藏夹颜色选项
const folderColors = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316',
  '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6'
]

// 方法
const goBack = () => {
  router.push('/')
}

const loadFavorites = async (reset = true) => {
  if (!isAuthenticated.value) return
  
  try {
    isLoading.value = true
    if (reset) {
      offset.value = 0
      favorites.value = []
    }
    
    const params = new URLSearchParams({
      offset: offset.value.toString(),
      limit: '20',
      ...filters.value
    })
    
    const response = await apiRequest(`/favorites?${params}`)
    
    if (response.success) {
      if (reset) {
        favorites.value = response.data.favorites
      } else {
        favorites.value.push(...response.data.favorites)
      }
      
      hasMore.value = response.data.favorites.length === 20
      offset.value += response.data.favorites.length
      
      // 提取分类
      const newCategories = [...new Set(response.data.favorites.map((f: any) => f.category))]
      categories.value = [...new Set([...categories.value, ...newCategories])]
    }
  } catch (err) {
    error('加载收藏失败')
  } finally {
    isLoading.value = false
  }
}

const loadMore = async () => {
  if (isLoadingMore.value || !hasMore.value) return
  
  try {
    isLoadingMore.value = true
    await loadFavorites(false)
  } finally {
    isLoadingMore.value = false
  }
}

const loadFolders = async () => {
  if (!isAuthenticated.value) return
  
  try {
    const response = await apiRequest('/favorite-folders')
    
    if (response.success) {
      folders.value = response.data.folders
    }
  } catch (err) {
    console.error('加载收藏夹失败:', err)
  }
}

const loadStats = async () => {
  if (!isAuthenticated.value) return
  
  try {
    const response = await apiRequest('/favorites/stats')
    
    if (response.success) {
      stats.value = response.data
    }
  } catch (err) {
    console.error('加载统计失败:', err)
  }
}

const selectFolder = (folder: any) => {
  selectedFolder.value = folder
  selectedFavorites.value = []
  loadFavorites()
}

const viewTool = (favorite: any) => {
  router.push(`/tool/${favorite.toolId}`)
}

const removeFavorite = async (favorite: any) => {
  if (!confirm('确定要取消收藏这个工具吗？')) return
  
  try {
    const response = await apiRequest(`/favorites/${favorite.id}`, {
      method: 'DELETE'
    })
    
    if (response.success) {
      success('已取消收藏')
      await loadFavorites()
      await loadStats()
    } else {
      error(response.error || '取消收藏失败')
    }
  } catch (err) {
    error('网络错误，请稍后重试')
  }
}

const createFolder = async () => {
  if (!newFolder.value.name) return
  
  try {
    const response = await apiRequest('/favorite-folders', {
      method: 'POST',
      body: JSON.stringify(newFolder.value)
    })
    
    if (response.success) {
      success('收藏夹创建成功')
      showCreateFolderModal.value = false
      newFolder.value = { name: '', description: '', color: '#6366f1' }
      await loadFolders()
    } else {
      error(response.error || '创建收藏夹失败')
    }
  } catch (err) {
    error('网络错误，请稍后重试')
  }
}

const editFolder = (folder: any) => {
  editingFolder.value = { ...folder }
  showEditFolderModal.value = true
}

const updateFolder = async () => {
  if (!editingFolder.value.name) return
  
  try {
    const response = await apiRequest(`/favorite-folders/${editingFolder.value.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: editingFolder.value.name,
        description: editingFolder.value.description,
        color: editingFolder.value.color
      })
    })
    
    if (response.success) {
      success('收藏夹更新成功')
      showEditFolderModal.value = false
      await loadFolders()
    } else {
      error(response.error || '更新收藏夹失败')
    }
  } catch (err) {
    error('网络错误，请稍后重试')
  }
}

const deleteFolder = async (folder: any) => {
  if (!confirm('确定要删除这个收藏夹吗？删除后无法恢复。')) return
  
  try {
    const response = await apiRequest(`/favorite-folders/${folder.id}`, {
      method: 'DELETE'
    })
    
    if (response.success) {
      success('收藏夹删除成功')
      await loadFolders()
      if (selectedFolder.value?.id === folder.id) {
        selectedFolder.value = null
        await loadFavorites()
      }
    } else {
      error(response.error || '删除收藏夹失败')
    }
  } catch (err) {
    error('网络错误，请稍后重试')
  }
}

const executeBatchAction = async () => {
  if (selectedFavorites.value.length === 0) return
  
  try {
    if (batchAction.value === 'remove') {
      // 批量删除
      for (const favoriteId of selectedFavorites.value) {
        await apiRequest(`/favorites/${favoriteId}`, { method: 'DELETE' })
      }
      success(`已删除 ${selectedFavorites.value.length} 个收藏`)
    } else if (batchAction.value === 'move' && batchTargetFolder.value) {
      // 批量移动
      const response = await apiRequest('/favorites/batch', {
        method: 'POST',
        body: JSON.stringify({
          action: 'move',
          toolIds: selectedFavorites.value,
          targetFolderId: batchTargetFolder.value
        })
      })
      
      if (response.success) {
        success(response.message)
      } else {
        error(response.error || '批量操作失败')
      }
    }
    
    showBatchActions.value = false
    selectedFavorites.value = []
    await loadFavorites()
    await loadStats()
  } catch (err) {
    error('批量操作失败')
  }
}

const toggleViewMode = () => {
  viewMode.value = viewMode.value === 'grid' ? 'list' : 'grid'
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

// 防止重复加载的标志
let isDataLoaded = false

// 初始化数据加载函数
const initializeData = async () => {
  if (isAuthenticated.value && !isDataLoaded) {
    isDataLoaded = true
    await Promise.all([
      loadFavorites(),
      loadFolders(),
      loadStats()
    ])
  }
}

// 监听登录状态
watch(() => isAuthenticated.value, (newValue) => {
  if (newValue) {
    initializeData()
  } else {
    // 用户登出时重置标志
    isDataLoaded = false
  }
})

// 初始化
onMounted(() => {
  initializeData()
})
</script>

<style scoped>
.favorites-page {
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
  position: relative;
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
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
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

.action-btn {
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
  font-size: 0.875rem;
}

.action-btn:hover {
  background-color: var(--bg-tertiary);
  border-color: var(--border-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.action-btn.primary {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.action-btn.primary:hover {
  background-color: var(--primary-hover);
  border-color: var(--primary-hover);
}

.main-content {
  padding: 2rem 0;
}

.page-description {
  margin-bottom: 2rem;
}

.page-description p {
  color: var(--text-secondary);
  font-size: 1rem;
  margin: 0;
}

.stats-section {
  margin-bottom: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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
}

.stat-icon {
  width: 48px;
  height: 48px;
  background-color: var(--primary-color);
  color: white;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.filters-section {
  margin-bottom: 2rem;
}

.filters-row {
  display: flex;
  gap: 1rem;
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

.filter-select {
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.875rem;
}

.folders-section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.folders-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.folder-card {
  padding: 1.5rem;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.2s ease;
}

.folder-card:hover {
  box-shadow: var(--shadow-sm);
  transform: translateY(-2px);
}

.folder-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.folder-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.folder-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: var(--radius-sm);
  background-color: var(--bg-tertiary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  background-color: var(--border-color);
  color: var(--text-primary);
}

.action-btn.delete:hover {
  background-color: var(--error-color);
  color: white;
}

.folder-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.folder-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 0.75rem;
}

.folder-stats {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.favorites-section {
  margin-bottom: 2rem;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.section-actions {
  display: flex;
  gap: 1rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: var(--text-secondary);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border-color);
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
}

.empty-icon {
  color: var(--border-color);
  margin-bottom: 1rem;
}

.empty-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.empty-description {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}

.favorites-container {
  margin-bottom: 2rem;
}

.favorites-grid {
  display: grid;
  gap: 1rem;
}

.favorites-grid--grid {
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}

.favorites-grid--list {
  grid-template-columns: 1fr;
}

.favorite-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  transition: all 0.2s ease;
  position: relative;
}

.favorite-item:hover {
  box-shadow: var(--shadow-sm);
}

.favorite-item--selected {
  border-color: var(--primary-color);
  background-color: rgba(99, 102, 241, 0.05);
}

.favorite-checkbox {
  flex-shrink: 0;
}

.checkbox {
  width: 16px;
  height: 16px;
  accent-color: var(--primary-color);
}

.favorite-content {
  flex: 1;
  cursor: pointer;
}

.favorite-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.tool-logo {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  overflow: hidden;
  flex-shrink: 0;
}

.tool-logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.logo-placeholder {
  width: 100%;
  height: 100%;
  background-color: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.25rem;
}

.tool-info {
  flex: 1;
}

.tool-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.tool-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

.favorite-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.tool-category {
  padding: 0.25rem 0.5rem;
  background-color: var(--bg-tertiary);
  color: var(--text-secondary);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
}

.tool-rating {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.star-icon {
  color: #fbbf24;
}

.favorite-stats {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--text-muted);
  font-size: 0.75rem;
}

.stat-icon {
  color: var(--text-muted);
}

.favorite-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.load-more {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.btn-icon.spinning {
  animation: spin 1s linear infinite;
}

/* 表单样式 */
.create-folder-form,
.edit-folder-form,
.batch-actions-form {
  padding: 1rem 0;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.875rem;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.color-picker {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.color-option {
  width: 32px;
  height: 32px;
  border: 2px solid transparent;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
}

.color-option:hover {
  transform: scale(1.1);
}

.color-option.active {
  border-color: var(--text-primary);
  box-shadow: 0 0 0 2px var(--primary-color);
}

/* 移动端优化 */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .header-actions {
    width: 100%;
    justify-content: flex-start;
  }
  
  .action-btn {
    flex: 1;
    justify-content: center;
  }
  
  .filters-row {
    flex-direction: column;
  }
  
  .filter-group {
    min-width: auto;
  }
  
  .folders-grid {
    grid-template-columns: 1fr;
  }
  
  .favorites-grid--grid {
    grid-template-columns: 1fr;
  }
  
  .favorite-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .favorite-header {
    width: 100%;
  }
  
  .favorite-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>