<template>
  <div class="rating-system">
    <!-- 评分显示 -->
    <div class="rating-display">
      <div class="rating-overview">
        <div class="rating-score">
          <span class="score-value">{{ averageRating || 0 }}</span>
          <div class="rating-stars">
            <div class="stars-container">
              <Star
                v-for="i in 5"
                :key="i"
                class="star"
                :class="{
                  'star-filled': i <= Math.floor(averageRating || 0),
                  'star-half': i === Math.ceil(averageRating || 0) && (averageRating || 0) % 1 !== 0
                }"
                :size="20"
              />
            </div>
            <span class="rating-text">{{ getRatingText(averageRating || 0) }}</span>
          </div>
        </div>
        <div class="rating-stats">
          <div class="total-ratings">{{ totalRatings || 0 }} 个评分</div>
          <div v-if="ratingDistribution" class="rating-breakdown">
            <div
              v-for="i in 5"
              :key="i"
              class="rating-bar-item"
            >
              <span class="bar-label">{{ 6 - i }}星</span>
              <div class="rating-bar">
                <div
                  class="rating-bar-fill"
                  :style="{ width: getBarWidth(6 - i) }"
                ></div>
              </div>
              <span class="bar-count">{{ getRatingCount(6 - i) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 用户评分 -->
    <div v-if="isAuthenticated" class="user-rating">
      <div class="rating-header">
        <h3 class="rating-title">您的评分</h3>
        <div v-if="userRating" class="current-rating">
          当前评分: {{ userRating.rating }}星
        </div>
      </div>
      
      <div class="rating-input">
        <div class="stars-input">
          <button
            v-for="i in 5"
            :key="i"
            @click="setRating(i)"
            @mouseenter="hoverRating = i"
            @mouseleave="hoverRating = 0"
            class="star-btn"
            :class="{
              'star-btn-filled': i <= (hoverRating || userRating?.rating || 0),
              'star-btn-hover': hoverRating > 0 && i <= hoverRating
            }"
          >
            <Star :size="24" />
          </button>
        </div>
        <div class="rating-actions">
          <button
            v-if="userRating"
            @click="updateRating"
            class="action-btn update-btn"
            :disabled="isSubmitting"
          >
            <Edit class="btn-icon" :size="16" />
            {{ isSubmitting ? '更新中...' : '更新评分' }}
          </button>
          <button
            v-else
            @click="submitRating"
            class="action-btn submit-btn"
            :disabled="!selectedRating || isSubmitting"
          >
            <Star class="btn-icon" :size="16" />
            {{ isSubmitting ? '提交中...' : '提交评分' }}
          </button>
          <button
            v-if="userRating"
            @click="deleteRating"
            class="action-btn delete-btn"
            :disabled="isSubmitting"
          >
            <Trash2 class="btn-icon" :size="16" />
            删除评分
          </button>
        </div>
      </div>
      
      <div v-if="selectedRating > 0" class="rating-feedback">
        <textarea
          v-model="ratingComment"
          class="rating-textarea"
          :placeholder="`请分享您对${toolName}的${selectedRating}星评价...`"
          rows="3"
          maxlength="500"
        ></textarea>
        <div class="char-count">{{ ratingComment.length }}/500</div>
      </div>
    </div>

    <!-- 登录提示 -->
    <div v-else class="login-prompt">
      <div class="prompt-content">
        <Star class="prompt-icon" :size="32" />
        <p class="prompt-text">请先登录后评分</p>
        <button @click="goToLogin" class="login-btn">立即登录</button>
      </div>
    </div>

    <!-- 评分列表 -->
    <div v-if="recentRatings.length > 0" class="ratings-list">
      <div class="list-header">
        <h3 class="list-title">用户评分</h3>
        <button @click="loadMoreRatings" class="load-more-btn" :disabled="isLoadingMore">
          <RefreshCw class="btn-icon" :size="16" :class="{ spinning: isLoadingMore }" />
          {{ isLoadingMore ? '加载中...' : '加载更多' }}
        </button>
      </div>
      
      <div class="ratings">
        <div
          v-for="rating in recentRatings"
          :key="rating.id"
          class="rating-item"
        >
          <div class="rating-user">
            <div class="user-avatar">
              {{ rating.username?.charAt(0) || 'U' }}
            </div>
            <div class="user-info">
              <div class="username">{{ rating.username || '匿名用户' }}</div>
              <div class="rating-meta">
                <div class="rating-stars">
                  <Star
                    v-for="i in 5"
                    :key="i"
                    class="star"
                    :class="{ 'star-filled': i <= rating.rating }"
                    :size="14"
                  />
                </div>
                <span class="rating-date">{{ formatDate(rating.createdAt) }}</span>
              </div>
            </div>
          </div>
          
          <div v-if="rating.comment" class="rating-comment">
            <p class="comment-text">{{ rating.comment }}</p>
          </div>
          
          <div class="rating-actions">
            <button
              v-if="canEditRating(rating)"
              @click="editUserRating(rating)"
              class="action-btn edit-btn"
            >
              <Edit class="btn-icon" :size="14" />
              编辑
            </button>
            <button
              v-if="canDeleteRating(rating)"
              @click="deleteUserRating(rating)"
              class="action-btn delete-btn"
            >
              <Trash2 class="btn-icon" :size="14" />
              删除
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑评分模态框 -->
    <Modal v-model:visible="showEditModal" title="编辑评分" size="md">
      <div class="edit-rating-form">
        <div class="form-group">
          <label class="form-label">评分</label>
          <div class="stars-input">
            <button
              v-for="i in 5"
              :key="i"
              @click="editRating.rating = i"
              class="star-btn"
              :class="{ 'star-btn-filled': i <= editRating.rating }"
            >
              <Star :size="24" />
            </button>
          </div>
        </div>
        
        <div class="form-group">
          <label class="form-label">评价内容</label>
          <textarea
            v-model="editRating.comment"
            class="form-textarea"
            rows="3"
            maxlength="500"
            placeholder="请分享您的评价..."
          ></textarea>
          <div class="char-count">{{ editRating.comment.length }}/500</div>
        </div>
      </div>
      
      <template #footer>
        <button @click="showEditModal = false" class="cancel-btn">取消</button>
        <button @click="saveEditRating" class="submit-btn" :disabled="!editRating.rating">
          保存
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Star, 
  Edit, 
  Trash2, 
  RefreshCw 
} from 'lucide-vue-next'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'
import Modal from '@/components/Modal.vue'

interface Props {
  toolId: string
  toolName?: string
}

const props = defineProps<Props>()

const router = useRouter()
const { user, isAuthenticated, apiRequest } = useAuth()
const { success, error } = useToast()

// 响应式数据
const averageRating = ref(0)
const totalRatings = ref(0)
const ratingDistribution = ref<Record<number, number>>({})
const userRating = ref<any>(null)
const recentRatings = ref<any[]>([])
const selectedRating = ref(0)
const hoverRating = ref(0)
const ratingComment = ref('')
const isSubmitting = ref(false)
const isLoadingMore = ref(false)
const showEditModal = ref(false)
const editRating = ref({
  id: 0,
  rating: 0,
  comment: ''
})

// 计算属性
const canEditRating = (rating: any) => {
  return user.value && user.value.id === rating.userId
}

const canDeleteRating = (rating: any) => {
  return user.value && user.value.id === rating.userId
}

// 方法
const loadRatingData = async () => {
  try {
    const response = await apiRequest(`/ratings/tool/${props.toolId}`)
    
    if (response.success) {
      averageRating.value = response.data.averageRating
      totalRatings.value = response.data.totalRatings
      ratingDistribution.value = response.data.ratingDistribution || {}
      userRating.value = response.data.userRating
      recentRatings.value = response.data.recentRatings || []
    }
  } catch (err) {
    console.error('加载评分数据失败:', err)
  }
}

const setRating = (rating: number) => {
  selectedRating.value = rating
}

const submitRating = async () => {
  if (!selectedRating.value) return
  
  try {
    isSubmitting.value = true
    
    const response = await apiRequest('/ratings', {
      method: 'POST',
      body: JSON.stringify({
        toolId: props.toolId,
        rating: selectedRating.value,
        comment: ratingComment.value.trim() || null
      })
    })
    
    if (response.success) {
      success('评分提交成功')
      selectedRating.value = 0
      ratingComment.value = ''
      await loadRatingData()
    } else {
      error(response.error || '评分提交失败')
    }
  } catch (err) {
    error('网络错误，请稍后重试')
  } finally {
    isSubmitting.value = false
  }
}

const updateRating = async () => {
  if (!userRating.value) return
  
  try {
    isSubmitting.value = true
    
    const response = await apiRequest(`/ratings/${userRating.value.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        rating: selectedRating.value,
        comment: ratingComment.value.trim() || null
      })
    })
    
    if (response.success) {
      success('评分更新成功')
      await loadRatingData()
    } else {
      error(response.error || '评分更新失败')
    }
  } catch (err) {
    error('网络错误，请稍后重试')
  } finally {
    isSubmitting.value = false
  }
}

const deleteRating = async () => {
  if (!userRating.value || !confirm('确定要删除您的评分吗？')) return
  
  try {
    isSubmitting.value = true
    
    const response = await apiRequest(`/ratings/${userRating.value.id}`, {
      method: 'DELETE'
    })
    
    if (response.success) {
      success('评分删除成功')
      selectedRating.value = 0
      ratingComment.value = ''
      await loadRatingData()
    } else {
      error(response.error || '评分删除失败')
    }
  } catch (err) {
    error('网络错误，请稍后重试')
  } finally {
    isSubmitting.value = false
  }
}

const editUserRating = (rating: any) => {
  editRating.value = {
    id: rating.id,
    rating: rating.rating,
    comment: rating.comment || ''
  }
  showEditModal.value = true
}

const saveEditRating = async () => {
  try {
    const response = await apiRequest(`/ratings/${editRating.value.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        rating: editRating.value.rating,
        comment: editRating.value.comment.trim() || null
      })
    })
    
    if (response.success) {
      success('评分更新成功')
      showEditModal.value = false
      await loadRatingData()
    } else {
      error(response.error || '评分更新失败')
    }
  } catch (err) {
    error('网络错误，请稍后重试')
  }
}

const deleteUserRating = async (rating: any) => {
  if (!confirm('确定要删除这条评分吗？')) return
  
  try {
    const response = await apiRequest(`/ratings/${rating.id}`, {
      method: 'DELETE'
    })
    
    if (response.success) {
      success('评分删除成功')
      await loadRatingData()
    } else {
      error(response.error || '评分删除失败')
    }
  } catch (err) {
    error('网络错误，请稍后重试')
  }
}

const loadMoreRatings = async () => {
  try {
    isLoadingMore.value = true
    
    const response = await apiRequest(`/ratings/tool/${props.toolId}?offset=${recentRatings.value.length}`)
    
    if (response.success) {
      recentRatings.value.push(...(response.data.recentRatings || []))
    }
  } catch (err) {
    error('加载更多评分失败')
  } finally {
    isLoadingMore.value = false
  }
}

const getRatingText = (rating: number) => {
  if (rating >= 4.5) return '优秀'
  if (rating >= 4) return '很好'
  if (rating >= 3) return '一般'
  if (rating >= 2) return '较差'
  return '很差'
}

const getBarWidth = (starCount: number) => {
  const count = ratingDistribution.value[starCount] || 0
  const total = totalRatings.value || 1
  return `${(count / total) * 100}%`
}

const getRatingCount = (starCount: number) => {
  return ratingDistribution.value[starCount] || 0
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

const goToLogin = () => {
  router.push('/login')
}

// 监听用户评分变化
watch(() => userRating.value, (newRating) => {
  if (newRating) {
    selectedRating.value = newRating.rating
    ratingComment.value = newRating.comment || ''
  }
})

// 初始化
onMounted(() => {
  loadRatingData()
})
</script>

<style scoped>
.rating-system {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.rating-display {
  margin-bottom: 2rem;
}

.rating-overview {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
}

.rating-score {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 120px;
}

.score-value {
  font-size: 3rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;
  margin-bottom: 0.5rem;
}

.rating-stars {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.stars-container {
  display: flex;
  gap: 0.25rem;
}

.star {
  color: var(--border-color);
  transition: color 0.2s ease;
}

.star-filled {
  color: #fbbf24;
}

.star-half {
  background: linear-gradient(90deg, #fbbf24 50%, var(--border-color) 50%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.rating-text {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.rating-stats {
  flex: 1;
}

.total-ratings {
  font-size: 1rem;
  color: var(--text-primary);
  font-weight: 500;
  margin-bottom: 1rem;
}

.rating-breakdown {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.rating-bar-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.bar-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  min-width: 30px;
}

.rating-bar {
  flex: 1;
  height: 8px;
  background-color: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.rating-bar-fill {
  height: 100%;
  background-color: #fbbf24;
  transition: width 0.3s ease;
}

.bar-count {
  font-size: 0.875rem;
  color: var(--text-muted);
  min-width: 20px;
  text-align: right;
}

.user-rating {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background-color: var(--bg-tertiary);
  border-radius: var(--radius-lg);
}

.rating-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.rating-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.current-rating {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.rating-input {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.stars-input {
  display: flex;
  gap: 0.5rem;
}

.star-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--border-color);
  transition: all 0.2s ease;
  padding: 0.25rem;
  border-radius: var(--radius-sm);
}

.star-btn:hover {
  color: #fbbf24;
  background-color: var(--bg-primary);
}

.star-btn-filled {
  color: #fbbf24;
}

.star-btn-hover {
  color: #fbbf24;
}

.rating-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.submit-btn {
  background-color: var(--primary-color);
  color: white;
}

.submit-btn:hover:not(:disabled) {
  background-color: var(--primary-hover);
}

.update-btn {
  background-color: #10b981;
  color: white;
}

.update-btn:hover:not(:disabled) {
  background-color: #059669;
}

.delete-btn {
  background-color: #ef4444;
  color: white;
}

.delete-btn:hover:not(:disabled) {
  background-color: #dc2626;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-icon {
  width: 16px;
  height: 16px;
}

.rating-feedback {
  margin-top: 1rem;
}

.rating-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  resize: vertical;
  min-height: 80px;
}

.rating-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.char-count {
  text-align: right;
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 0.25rem;
}

.login-prompt {
  text-align: center;
  padding: 3rem 1rem;
  background-color: var(--bg-tertiary);
  border-radius: var(--radius-lg);
  margin-bottom: 2rem;
}

.prompt-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.prompt-icon {
  color: var(--border-color);
}

.prompt-text {
  font-size: 1rem;
  color: var(--text-secondary);
  margin: 0;
}

.login-btn {
  padding: 0.75rem 1.5rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.login-btn:hover {
  background-color: var(--primary-hover);
}

.ratings-list {
  margin-top: 2rem;
}

.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.list-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.load-more-btn {
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

.load-more-btn:hover:not(:disabled) {
  background-color: var(--bg-tertiary);
  border-color: var(--border-hover);
}

.load-more-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-icon.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.ratings {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.rating-item {
  padding: 1rem;
  background-color: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  transition: all 0.2s ease;
}

.rating-item:hover {
  box-shadow: var(--shadow-sm);
}

.rating-user {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.user-avatar {
  width: 40px;
  height: 40px;
  background-color: var(--primary-color);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
}

.user-info {
  flex: 1;
}

.username {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.rating-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.rating-stars {
  display: flex;
  gap: 0.125rem;
}

.rating-date {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.rating-comment {
  margin-bottom: 0.75rem;
}

.comment-text {
  font-size: 0.875rem;
  color: var(--text-primary);
  line-height: 1.5;
  margin: 0;
}

.rating-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.edit-btn {
  background-color: #10b981;
  color: white;
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
}

.edit-btn:hover {
  background-color: #059669;
}

.delete-btn {
  background-color: #ef4444;
  color: white;
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
}

.delete-btn:hover {
  background-color: #dc2626;
}

/* 编辑评分模态框样式 */
.edit-rating-form {
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

.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  resize: vertical;
  min-height: 80px;
}

.form-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
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

/* 移动端优化 */
@media (max-width: 768px) {
  .rating-overview {
    flex-direction: column;
    gap: 1rem;
  }
  
  .rating-score {
    align-items: center;
  }
  
  .rating-actions {
    flex-direction: column;
  }
  
  .action-btn {
    width: 100%;
    justify-content: center;
  }
  
  .rating-user {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .rating-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}
</style>