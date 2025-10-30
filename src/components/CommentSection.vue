<template>
  <div class="comment-section">
    <!-- 评论统计 -->
    <div class="comment-stats">
      <div class="stats-row">
        <div class="stat-item">
          <Star class="stat-icon" :size="20" />
          <span class="stat-value">{{ ratingStats.averageRating || 0 }}</span>
          <span class="stat-label">平均评分</span>
        </div>
        <div class="stat-item">
          <MessageCircle class="stat-icon" :size="20" />
          <span class="stat-value">{{ ratingStats.totalRatings || 0 }}</span>
          <span class="stat-label">评论数量</span>
        </div>
      </div>
    </div>

    <!-- 评论表单 -->
    <div v-if="isAuthenticated" class="comment-form">
      <div class="form-header">
        <h3 class="form-title">发表评论</h3>
        <div class="form-options">
          <label class="checkbox-label">
            <input 
              v-model="newComment.isAnonymous" 
              type="checkbox" 
              class="checkbox-input"
            />
            <span class="checkbox-text">匿名评论</span>
          </label>
        </div>
      </div>
      
      <form @submit.prevent="submitComment" class="form">
        <div class="form-group">
          <label class="form-label">评分</label>
          <div class="rating-input">
            <button
              v-for="star in 5"
              :key="star"
              type="button"
              @click="newComment.rating = star"
              class="star-btn"
              :class="{ active: star <= newComment.rating }"
            >
              <Star :size="20" />
            </button>
            <span class="rating-text">
              {{ newComment.rating ? `${newComment.rating}星` : '请选择评分' }}
            </span>
          </div>
        </div>
        
        <div class="form-group">
          <label class="form-label">评论内容</label>
          <textarea
            v-model="newComment.content"
            class="form-textarea"
            placeholder="请分享您使用该工具的感受..."
            rows="4"
            maxlength="1000"
            required
          ></textarea>
          <div class="char-count">{{ newComment.content.length }}/1000</div>
        </div>
        
        <div class="form-actions">
          <button 
            type="submit" 
            class="submit-btn"
            :disabled="!newComment.content.trim() || isSubmitting"
          >
            <Send class="btn-icon" :size="16" />
            {{ isSubmitting ? '提交中...' : '发表评论' }}
          </button>
        </div>
      </form>
    </div>

    <!-- 登录提示 -->
    <div v-else class="login-prompt">
      <div class="prompt-content">
        <MessageCircle class="prompt-icon" :size="32" />
        <p class="prompt-text">请先登录后发表评论</p>
        <button @click="goToLogin" class="login-btn">立即登录</button>
      </div>
    </div>

    <!-- 评论列表 -->
    <div class="comments-list">
      <div class="list-header">
        <h3 class="list-title">用户评论</h3>
        <div class="list-actions">
          <select v-model="sortBy" @change="loadComments" class="sort-select">
            <option value="newest">最新</option>
            <option value="oldest">最早</option>
            <option value="rating">评分</option>
            <option value="likes">点赞数</option>
          </select>
        </div>
      </div>
      
      <div v-if="isLoading" class="loading-state">
        <LoadingSpinner :size="24" />
        <p>加载评论中...</p>
      </div>
      
      <div v-else-if="comments.length === 0" class="empty-state">
        <MessageCircle class="empty-icon" :size="32" />
        <p>暂无评论，快来发表第一条评论吧！</p>
      </div>
      
      <div v-else class="comments">
        <CommentItem
          v-for="comment in comments"
          :key="comment.id"
          :comment="comment"
          @reply="handleReply"
          @like="handleLike"
          @report="handleReport"
          @edit="handleEdit"
          @delete="handleDelete"
        />
      </div>
      
      <!-- 加载更多 -->
      <div v-if="hasMore" class="load-more">
        <button @click="loadMore" class="load-more-btn" :disabled="isLoadingMore">
          <RefreshCw class="btn-icon" :size="16" :class="{ spinning: isLoadingMore }" />
          {{ isLoadingMore ? '加载中...' : '加载更多' }}
        </button>
      </div>
    </div>

    <!-- 回复模态框 -->
    <Modal v-model:visible="showReplyModal" title="回复评论" size="md">
      <div class="reply-form">
        <div class="reply-to">
          <span class="reply-label">回复：</span>
          <span class="reply-user">{{ replyToUser }}</span>
        </div>
        <textarea
          v-model="replyContent"
          class="reply-textarea"
          placeholder="请输入回复内容..."
          rows="3"
          maxlength="500"
        ></textarea>
        <div class="char-count">{{ replyContent.length }}/500</div>
      </div>
      
      <template #footer>
        <button @click="showReplyModal = false" class="cancel-btn">取消</button>
        <button @click="submitReply" class="submit-btn" :disabled="!replyContent.trim()">
          回复
        </button>
      </template>
    </Modal>

    <!-- 编辑模态框 -->
    <Modal v-model:visible="showEditModal" title="编辑评论" size="md">
      <div class="edit-form">
        <div class="form-group">
          <label class="form-label">评分</label>
          <div class="rating-input">
            <button
              v-for="star in 5"
              :key="star"
              type="button"
              @click="editComment.rating = star"
              class="star-btn"
              :class="{ active: star <= editComment.rating }"
            >
              <Star :size="20" />
            </button>
          </div>
        </div>
        
        <div class="form-group">
          <label class="form-label">评论内容</label>
          <textarea
            v-model="editComment.content"
            class="form-textarea"
            rows="4"
            maxlength="1000"
          ></textarea>
          <div class="char-count">{{ editComment.content.length }}/1000</div>
        </div>
      </div>
      
      <template #footer>
        <button @click="showEditModal = false" class="cancel-btn">取消</button>
        <button @click="updateComment" class="submit-btn" :disabled="!editComment.content.trim()">
          保存
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Star, 
  MessageCircle, 
  Send, 
  RefreshCw 
} from 'lucide-vue-next'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'
import CommentItem from '@/components/CommentItem.vue'
import Modal from '@/components/Modal.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

interface Props {
  toolId: string
}

const props = defineProps<Props>()

const router = useRouter()
const { user, isAuthenticated, apiRequest } = useAuth()
const { success, error } = useToast()

// 响应式数据
const isLoading = ref(false)
const isLoadingMore = ref(false)
const comments = ref<any[]>([])
const ratingStats = ref({
  averageRating: 0,
  totalRatings: 0
})
const sortBy = ref('newest')
const hasMore = ref(true)
const currentPage = ref(1)
const pageSize = 10

const showReplyModal = ref(false)
const replyContent = ref('')
const replyToUser = ref('')
const replyToCommentId = ref<number | null>(null)

const showEditModal = ref(false)
const editComment = ref({
  id: 0,
  content: '',
  rating: 0
})

const isSubmitting = ref(false)
const newComment = reactive({
  content: '',
  rating: 0,
  isAnonymous: false
})

// 方法
const loadComments = async (reset = true) => {
  try {
    if (reset) {
      isLoading.value = true
      currentPage.value = 1
      comments.value = []
    } else {
      isLoadingMore.value = true
    }
    
    const params = new URLSearchParams({
      limit: pageSize.toString(),
      offset: ((currentPage.value - 1) * pageSize).toString(),
      includeReplies: 'true'
    })
    
    const response = await apiRequest(`/comments/tool/${props.toolId}?${params}`)
    
    if (response.success) {
      const newComments = response.data.comments
      
      if (reset) {
        comments.value = newComments
      } else {
        comments.value.push(...newComments)
      }
      
      ratingStats.value = response.data.ratingStats
      hasMore.value = newComments.length === pageSize
      
      if (!reset) {
        currentPage.value++
      }
    } else {
      error(response.error || '加载评论失败')
    }
  } catch (err) {
    error('网络错误，请稍后重试')
  } finally {
    isLoading.value = false
    isLoadingMore.value = false
  }
}

const loadMore = () => {
  currentPage.value++
  loadComments(false)
}

const submitComment = async () => {
  if (!newComment.content.trim()) return
  
  try {
    isSubmitting.value = true
    
    const response = await apiRequest('/comments', {
      method: 'POST',
      body: JSON.stringify({
        toolId: props.toolId,
        content: newComment.content.trim(),
        rating: newComment.rating || null,
        isAnonymous: newComment.isAnonymous
      })
    })
    
    if (response.success) {
      success('评论发表成功')
      
      // 重置表单
      newComment.content = ''
      newComment.rating = 0
      newComment.isAnonymous = false
      
      // 重新加载评论
      await loadComments()
    } else {
      error(response.error || '发表评论失败')
    }
  } catch (err) {
    error('网络错误，请稍后重试')
  } finally {
    isSubmitting.value = false
  }
}

const handleReply = (comment: any) => {
  replyToUser.value = comment.username
  replyToCommentId.value = comment.id
  replyContent.value = ''
  showReplyModal.value = true
}

const submitReply = async () => {
  if (!replyContent.value.trim() || !replyToCommentId.value) return
  
  try {
    const response = await apiRequest('/comments', {
      method: 'POST',
      body: JSON.stringify({
        toolId: props.toolId,
        content: replyContent.value.trim(),
        parentId: replyToCommentId.value
      })
    })
    
    if (response.success) {
      success('回复成功')
      showReplyModal.value = false
      replyContent.value = ''
      replyToCommentId.value = null
      
      // 重新加载评论
      await loadComments()
    } else {
      error(response.error || '回复失败')
    }
  } catch (err) {
    error('网络错误，请稍后重试')
  }
}

const handleLike = async (comment: any, action: 'like' | 'dislike') => {
  try {
    const response = await apiRequest(`/comments/${comment.id}/like`, {
      method: 'POST',
      body: JSON.stringify({ action })
    })
    
    if (response.success) {
      // 更新本地评论数据
      const commentIndex = comments.value.findIndex(c => c.id === comment.id)
      if (commentIndex !== -1) {
        comments.value[commentIndex].likeCount = response.data.likeCount
        comments.value[commentIndex].dislikeCount = response.data.dislikeCount
      }
    } else {
      error(response.error || '操作失败')
    }
  } catch (err) {
    error('网络错误，请稍后重试')
  }
}

const handleReport = (comment: any) => {
  const reason = prompt('请输入举报原因：')
  if (reason && reason.trim()) {
    reportComment(comment.id, reason.trim())
  }
}

const reportComment = async (commentId: number, reason: string) => {
  try {
    const response = await apiRequest(`/comments/${commentId}/report`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    })
    
    if (response.success) {
      success('举报已提交')
    } else {
      error(response.error || '举报失败')
    }
  } catch (err) {
    error('网络错误，请稍后重试')
  }
}

const handleEdit = (comment: any) => {
  editComment.value = {
    id: comment.id,
    content: comment.content,
    rating: comment.rating || 0
  }
  showEditModal.value = true
}

const updateComment = async () => {
  if (!editComment.value.content.trim()) return
  
  try {
    const response = await apiRequest(`/comments/${editComment.value.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        content: editComment.value.content.trim(),
        rating: editComment.value.rating || null
      })
    })
    
    if (response.success) {
      success('评论更新成功')
      showEditModal.value = false
      
      // 重新加载评论
      await loadComments()
    } else {
      error(response.error || '更新失败')
    }
  } catch (err) {
    error('网络错误，请稍后重试')
  }
}

const handleDelete = async (comment: any) => {
  if (!confirm('确定要删除这条评论吗？')) return
  
  try {
    const response = await apiRequest(`/comments/${comment.id}`, {
      method: 'DELETE'
    })
    
    if (response.success) {
      success('评论删除成功')
      
      // 重新加载评论
      await loadComments()
    } else {
      error(response.error || '删除失败')
    }
  } catch (err) {
    error('网络错误，请稍后重试')
  }
}

const goToLogin = () => {
  router.push('/login')
}

// 监听工具ID变化
watch(() => props.toolId, () => {
  if (props.toolId) {
    loadComments()
  }
})

// 初始化
onMounted(() => {
  if (props.toolId) {
    loadComments()
  }
})
</script>

<style scoped>
.comment-section {
  background-color: var(--bg-primary);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  margin-top: 2rem;
}

.comment-stats {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.stats-row {
  display: flex;
  gap: 2rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stat-icon {
  color: var(--primary-color);
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.comment-form {
  background-color: var(--bg-tertiary);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.form-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.form-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox-input {
  width: 16px;
  height: 16px;
}

.checkbox-text {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.rating-input {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.star-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--border-color);
  transition: color 0.2s ease;
  padding: 0.25rem;
}

.star-btn:hover {
  color: #fbbf24;
}

.star-btn.active {
  color: #fbbf24;
}

.rating-text {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-left: 0.5rem;
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
  min-height: 100px;
}

.form-textarea:focus {
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

.form-actions {
  display: flex;
  justify-content: flex-end;
}

.submit-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
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

.submit-btn:hover:not(:disabled) {
  background-color: var(--primary-hover);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-icon {
  width: 16px;
  height: 16px;
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

.comments-list {
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

.sort-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-muted);
}

.empty-icon {
  width: 32px;
  height: 32px;
  margin: 0 auto 1rem;
  color: var(--border-color);
}

.comments {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.load-more {
  text-align: center;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.load-more-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: none;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
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

/* 回复和编辑模态框样式 */
.reply-form,
.edit-form {
  padding: 1rem 0;
}

.reply-to {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background-color: var(--bg-tertiary);
  border-radius: var(--radius-md);
}

.reply-label {
  font-size: 0.875rem;
  color: var(--text-muted);
}

.reply-user {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
}

.reply-textarea {
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

.reply-textarea:focus {
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
  .comment-section {
    padding: 1rem;
  }
  
  .stats-row {
    flex-direction: column;
    gap: 1rem;
  }
  
  .form-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .list-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}
</style>