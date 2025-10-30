<!-- genAI_main_start -->
<template>
  <div class="ratings-page">
    <!-- 头部导航 -->
    <header class="header">
      <div class="container">
        <div class="header-content">
          <button @click="goBack" class="back-btn" type="button">
            <ArrowLeft class="back-icon" />
            返回
          </button>
          <h1 class="page-title">我的评分</h1>
          <div class="header-actions">
            <button @click="clearAllRatings" class="clear-btn" v-if="userRatings.length > 0">
              <Trash2 class="clear-icon" :size="20" />
            </button>
          </div>
        </div>
      </div>
    </header>

    <div class="main-content">
      <div class="container">
        <!-- 评分统计 -->
        <div v-if="isAuthenticated" class="stats-card">
          <div class="stat-item">
            <Star class="stat-icon" :size="24" />
            <div class="stat-content">
              <div class="stat-value">{{ ratingStats.totalRatings }}</div>
              <div class="stat-label">评分工具</div>
            </div>
          </div>
          <div class="stat-item">
            <TrendingUp class="stat-icon" :size="24" />
            <div class="stat-content">
              <div class="stat-value">{{ averageRating.toFixed(1) }}</div>
              <div class="stat-label">平均评分</div>
            </div>
          </div>
          <div class="stat-item">
            <Heart class="stat-icon" :size="24" />
            <div class="stat-content">
              <div class="stat-value">{{ highRatedTools }}</div>
              <div class="stat-label">高分工具</div>
            </div>
          </div>
        </div>

        <!-- 筛选器 -->
        <div v-if="userRatings.length > 0" class="filters">
          <div class="filter-group">
            <label class="filter-label">评分范围：</label>
            <select v-model="ratingFilter" class="filter-select">
              <option value="all">全部评分</option>
              <option value="5">5星</option>
              <option value="4">4星及以上</option>
              <option value="3">3星及以上</option>
              <option value="2">2星及以上</option>
              <option value="1">1星及以上</option>
            </select>
          </div>
          <div class="filter-group">
            <label class="filter-label">排序方式：</label>
            <select v-model="sortBy" class="filter-select">
              <option value="recent">最近评分</option>
              <option value="rating">评分高低</option>
              <option value="name">工具名称</option>
            </select>
          </div>
        </div>

        <!-- 评分列表 -->
        <div v-if="filteredRatings.length > 0" class="ratings-list">
          <div 
            v-for="rating in filteredRatings" 
            :key="rating.toolId"
            class="rating-item"
            @click="navigateToTool(rating.toolId)"
          >
            <div class="tool-icon">
              <component :is="getToolIcon(rating.toolId)" class="tool-icon-svg" />
            </div>
            
            <div class="tool-info">
              <h3 class="tool-name">{{ getToolName(rating.toolId) }}</h3>
              <p class="tool-category">{{ getCategoryName(rating.toolCategory) }}</p>
              
              <div class="rating-display">
                <div class="stars">
                  <Star 
                    v-for="i in 5" 
                    :key="i"
                    class="star"
                    :class="{ 'star--filled': i <= rating.rating }"
                    :size="16"
                  />
                </div>
                <span class="rating-value">{{ rating.rating }}.0</span>
                <span class="rating-date">{{ formatDate(rating.ratedAt) }}</span>
              </div>
              
              <p v-if="rating.comment" class="rating-comment">{{ rating.comment }}</p>
            </div>
            
            <div class="rating-actions">
              <button 
                @click.stop="editRating(rating)"
                class="edit-btn"
                title="编辑评分"
              >
                <Edit class="edit-icon" :size="16" />
              </button>
              <button 
                @click.stop="removeRating(rating.toolId)"
                class="remove-btn"
                title="删除评分"
              >
                <X class="remove-icon" :size="16" />
              </button>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="empty-state">
          <Star class="empty-icon" :size="64" />
          <h3 class="empty-title">还没有评分任何工具</h3>
          <p class="empty-description">使用AI工具后，给它们评分帮助其他用户选择</p>
          <router-link to="/" class="browse-btn">
            <Search class="browse-icon" :size="16" />
            去发现工具
          </router-link>
        </div>
      </div>
    </div>

    <!-- 编辑评分模态框 -->
    <Modal v-model:visible="showEditModal" title="编辑评分" size="md">
      <div class="edit-rating-content">
        <div class="tool-info">
          <div class="tool-icon">
            <component :is="getToolIcon(editingRating?.toolId || '')" class="tool-icon-svg" />
          </div>
          <div class="tool-details">
            <h4 class="tool-name">{{ getToolName(editingRating?.toolId || '') }}</h4>
            <p class="tool-category">{{ getCategoryName(editingRating?.toolCategory || '') }}</p>
          </div>
        </div>
        
        <div class="rating-section">
          <label class="rating-label">评分：</label>
          <div class="star-rating">
            <button 
              v-for="i in 5" 
              :key="i"
              @click="newRating = i"
              class="star-btn"
              :class="{ 'star-btn--active': i <= newRating }"
            >
              <Star :size="24" />
            </button>
          </div>
          <span class="rating-text">{{ newRating }}星</span>
        </div>
        
        <div class="comment-section">
          <label class="comment-label">评价（可选）：</label>
          <textarea 
            v-model="newComment"
            placeholder="分享您对这个工具的使用体验..."
            class="comment-textarea"
            rows="3"
          ></textarea>
        </div>
      </div>
      
      <template #footer>
        <button @click="showEditModal = false" class="cancel-btn">取消</button>
        <button @click="saveRating" class="save-btn">保存</button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  ArrowLeft, 
  Trash2, 
  Star, 
  TrendingUp, 
  Heart, 
  Edit, 
  X, 
  Search
} from 'lucide-vue-next'
import { useAuth } from '@/composables/useAuth'
import { useRating } from '@/composables/useRating'
import { useToast } from '@/composables/useToast'
import { categories } from '@/data/categories'
import { aiTools } from '@/data/tools'
import Modal from '@/components/Modal.vue'

const router = useRouter()
const { isAuthenticated } = useAuth()
const { 
  userRatings, 
  getRatingStats, 
  clearAllRatings: clearRatings,
  removeRating: removeRatingItem,
  updateRating
} = useRating()
const { success, error } = useToast()

// 响应式数据
const ratingFilter = ref('all')
const sortBy = ref('recent')
const showEditModal = ref(false)
const editingRating = ref<any>(null)
const newRating = ref(5)
const newComment = ref('')

// 计算属性
const ratingStats = computed(() => getRatingStats())

const averageRating = computed(() => {
  if (userRatings.value.length === 0) return 0
  const total = userRatings.value.reduce((sum, rating) => sum + rating.rating, 0)
  return total / userRatings.value.length
})

const highRatedTools = computed(() => {
  return userRatings.value.filter(rating => rating.rating >= 4).length
})

const filteredRatings = computed(() => {
  let filtered = [...userRatings.value]
  
  // 评分筛选
  if (ratingFilter.value !== 'all') {
    const minRating = parseInt(ratingFilter.value)
    filtered = filtered.filter(rating => rating.rating >= minRating)
  }
  
  // 排序
  switch (sortBy.value) {
    case 'recent':
      filtered.sort((a, b) => new Date(b.ratedAt).getTime() - new Date(a.ratedAt).getTime())
      break
    case 'rating':
      filtered.sort((a, b) => b.rating - a.rating)
      break
    case 'name':
      filtered.sort((a, b) => getToolName(a.toolId).localeCompare(getToolName(b.toolId)))
      break
  }
  
  return filtered
})

// 方法
const goBack = () => {
  router.push('/profile')
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

const navigateToTool = (toolId: string) => {
  router.push({
    name: 'ToolDetail',
    params: { id: toolId }
  })
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

const editRating = (rating: any) => {
  editingRating.value = rating
  newRating.value = rating.rating
  newComment.value = rating.comment || ''
  showEditModal.value = true
}

const saveRating = async () => {
  if (!editingRating.value) return
  
  try {
    await updateRating(editingRating.value.toolId, newRating.value, newComment.value)
    success('评分已更新')
    showEditModal.value = false
  } catch (err) {
    error('更新评分失败')
  }
}

const clearAllRatings = async () => {
  if (confirm('确定要清空所有评分吗？此操作不可撤销。')) {
    try {
      await clearRatings()
      success('已清空所有评分')
    } catch (err) {
      error('清空评分失败')
    }
  }
}

const removeRating = async (toolId: string) => {
  if (confirm('确定要删除这个评分吗？')) {
    try {
      await removeRatingItem(toolId)
      success('评分已删除')
    } catch (err) {
      error('删除评分失败')
    }
  }
}

onMounted(() => {
  if (!isAuthenticated.value) {
    router.push('/login')
  }
})
</script>

<style scoped>
.ratings-page {
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

.clear-btn {
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

.clear-btn:hover {
  background-color: var(--error-color);
  color: white;
}

.clear-icon {
  width: 20px;
  height: 20px;
}

.main-content {
  padding: 2rem 0;
}

.stats-card {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  margin-bottom: 2rem;
  display: flex;
  gap: 2rem;
  box-shadow: var(--shadow-sm);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
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

.filters {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  margin-bottom: 2rem;
  display: flex;
  gap: 2rem;
  box-shadow: var(--shadow-sm);
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.filter-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
}

.filter-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.875rem;
  cursor: pointer;
  min-width: 120px;
}

.ratings-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.rating-item {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  box-shadow: var(--shadow-sm);
}

.rating-item:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
  border-color: var(--primary-color);
}

.tool-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.tool-icon-svg {
  width: 24px;
  height: 24px;
  color: white;
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
  margin: 0 0 0.75rem 0;
}

.rating-display {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.stars {
  display: flex;
  gap: 0.125rem;
}

.star {
  color: var(--border-color);
}

.star--filled {
  color: var(--warning-color);
}

.rating-value {
  font-size: 1rem;
  font-weight: 600;
  color: var(--primary-color);
}

.rating-date {
  font-size: 0.8125rem;
  color: var(--text-muted);
}

.rating-comment {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
  font-style: italic;
  background-color: var(--bg-tertiary);
  padding: 0.75rem;
  border-radius: var(--radius-md);
  border-left: 3px solid var(--primary-color);
}

.rating-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.edit-btn,
.remove-btn {
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

.edit-btn:hover {
  background-color: var(--primary-color);
  color: white;
}

.remove-btn:hover {
  background-color: var(--error-color);
  color: white;
}

.edit-icon,
.remove-icon {
  width: 16px;
  height: 16px;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-muted);
}

.empty-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 1.5rem;
  color: var(--border-color);
}

.empty-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.empty-description {
  font-size: 0.875rem;
  margin: 0 0 2rem 0;
  line-height: 1.5;
}

.browse-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
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

.browse-icon {
  width: 16px;
  height: 16px;
}

/* 编辑评分模态框样式 */
.edit-rating-content {
  padding: 1rem 0;
}

.tool-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background-color: var(--bg-tertiary);
  border-radius: var(--radius-md);
}

.tool-details {
  flex: 1;
}

.tool-details .tool-name {
  font-size: 1rem;
  margin: 0 0 0.25rem 0;
}

.tool-details .tool-category {
  font-size: 0.875rem;
  margin: 0;
}

.rating-section {
  margin-bottom: 1.5rem;
}

.rating-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
}

.star-rating {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.star-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: none;
  color: var(--border-color);
  cursor: pointer;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.star-btn:hover,
.star-btn--active {
  color: var(--warning-color);
  background-color: rgba(251, 191, 36, 0.1);
}

.rating-text {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.comment-section {
  margin-bottom: 1rem;
}

.comment-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
}

.comment-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.875rem;
  resize: vertical;
  min-height: 80px;
}

.comment-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
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
  
  .stats-card {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }
  
  .filters {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }
  
  .filter-group {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .filter-select {
    width: 100%;
  }
  
  .rating-item {
    padding: 1rem;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .tool-icon {
    width: 40px;
    height: 40px;
  }
  
  .tool-icon-svg {
    width: 20px;
    height: 20px;
  }
  
  .rating-actions {
    align-self: flex-end;
  }
  
  .edit-rating-content .tool-info {
    flex-direction: column;
    text-align: center;
  }
  
  .star-rating {
    justify-content: center;
  }
}
</style>
<!-- genAI_main_end -->