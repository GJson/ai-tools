<template>
  <div class="comment-item" :class="{ 'is-reply': comment.parentId }">
    <!-- 评论头部 -->
    <div class="comment-header">
      <div class="user-info">
        <div class="avatar">
          <img 
            v-if="comment.userAvatar" 
            :src="comment.userAvatar" 
            :alt="comment.username"
            class="avatar-img"
          />
          <div v-else class="avatar-placeholder">
            {{ comment.username.charAt(0).toUpperCase() }}
          </div>
        </div>
        <div class="user-details">
          <div class="username">{{ comment.username }}</div>
          <div class="comment-meta">
            <span class="comment-date">{{ formatDate(comment.createdAt) }}</span>
            <span v-if="comment.rating" class="comment-rating">
              <Star class="rating-icon" :size="14" />
              {{ comment.rating }}星
            </span>
          </div>
        </div>
      </div>
      
      <div class="comment-actions">
        <button @click="toggleLike('like')" class="action-btn like-btn" :class="{ active: userLiked }">
          <ThumbsUp class="btn-icon" :size="16" />
          {{ comment.likeCount }}
        </button>
        <button @click="toggleLike('dislike')" class="action-btn dislike-btn" :class="{ active: userDisliked }">
          <ThumbsDown class="btn-icon" :size="16" />
          {{ comment.dislikeCount }}
        </button>
        <button @click="handleReply" class="action-btn reply-btn">
          <MessageCircle class="btn-icon" :size="16" />
          回复
        </button>
        <div class="more-actions">
          <button @click="toggleMoreActions" class="more-btn">
            <MoreHorizontal class="btn-icon" :size="16" />
          </button>
          <div v-if="showMoreActions" class="more-menu">
            <button @click="handleReport" class="menu-item report-item">
              <Flag class="menu-icon" :size="14" />
              举报
            </button>
            <button 
              v-if="canEdit" 
              @click="handleEdit" 
              class="menu-item edit-item"
            >
              <Edit class="menu-icon" :size="14" />
              编辑
            </button>
            <button 
              v-if="canDelete" 
              @click="handleDelete" 
              class="menu-item delete-item"
            >
              <Trash2 class="menu-icon" :size="14" />
              删除
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 评论内容 -->
    <div class="comment-content">
      <p class="comment-text">{{ comment.content }}</p>
    </div>

    <!-- 回复列表 -->
    <div v-if="comment.replies && comment.replies.length > 0" class="replies">
      <CommentItem
        v-for="reply in comment.replies"
        :key="reply.id"
        :comment="reply"
        @reply="$emit('reply', $event)"
        @like="$emit('like', $event, 'like')"
        @report="$emit('report', $event)"
        @edit="$emit('edit', $event)"
        @delete="$emit('delete', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  MessageCircle, 
  MoreHorizontal,
  Flag,
  Edit,
  Trash2
} from 'lucide-vue-next'
import { useAuth } from '@/composables/useAuth'

interface Props {
  comment: {
    id: number
    uuid: string
    toolId: number
    userId: number
    parentId?: number
    content: string
    rating?: number
    isAnonymous: boolean
    likeCount: number
    dislikeCount: number
    reportCount: number
    isApproved: boolean
    isActive: boolean
    createdAt: string
    updatedAt?: string
    username: string
    userAvatar?: string
    replies?: any[]
  }
}

const props = defineProps<Props>()

const emit = defineEmits<{
  reply: [comment: any]
  like: [comment: any, action: 'like' | 'dislike']
  report: [comment: any]
  edit: [comment: any]
  delete: [comment: any]
}>()

const { user } = useAuth()

// 响应式数据
const showMoreActions = ref(false)
const userLiked = ref(false) // 这里应该从API获取用户是否已点赞
const userDisliked = ref(false) // 这里应该从API获取用户是否已踩

// 计算属性
const canEdit = computed(() => {
  return user.value && user.value.id === props.comment.userId
})

const canDelete = computed(() => {
  return user.value && user.value.id === props.comment.userId
})

// 方法
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (minutes < 1) {
    return '刚刚'
  } else if (minutes < 60) {
    return `${minutes}分钟前`
  } else if (hours < 24) {
    return `${hours}小时前`
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return date.toLocaleDateString('zh-CN')
  }
}

const toggleLike = (action: 'like' | 'dislike') => {
  if (action === 'like') {
    userLiked.value = !userLiked.value
    if (userLiked.value) {
      userDisliked.value = false
    }
  } else {
    userDisliked.value = !userDisliked.value
    if (userDisliked.value) {
      userLiked.value = false
    }
  }
  
  emit('like', props.comment, action)
}

const handleReply = () => {
  emit('reply', props.comment)
}

const handleReport = () => {
  emit('report', props.comment)
}

const handleEdit = () => {
  emit('edit', props.comment)
}

const handleDelete = () => {
  emit('delete', props.comment)
}

const toggleMoreActions = () => {
  showMoreActions.value = !showMoreActions.value
}

// 点击外部关闭更多操作菜单
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  if (!target.closest('.more-actions')) {
    showMoreActions.value = false
  }
}

// 监听点击事件
if (typeof window !== 'undefined') {
  document.addEventListener('click', handleClickOutside)
}
</script>

<style scoped>
.comment-item {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1rem;
  margin-bottom: 1rem;
  transition: all 0.2s ease;
}

.comment-item:hover {
  box-shadow: var(--shadow-sm);
}

.comment-item.is-reply {
  margin-left: 2rem;
  margin-bottom: 0.5rem;
  background-color: var(--bg-tertiary);
  border-left: 3px solid var(--primary-color);
}

.comment-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.username {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.comment-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.comment-date {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.comment-rating {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.rating-icon {
  color: #fbbf24;
}

.comment-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: none;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background-color: var(--bg-tertiary);
  border-color: var(--border-hover);
  color: var(--text-primary);
}

.action-btn.active {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.like-btn.active {
  background-color: #10b981;
  border-color: #10b981;
}

.dislike-btn.active {
  background-color: #ef4444;
  border-color: #ef4444;
}

.btn-icon {
  width: 16px;
  height: 16px;
}

.more-actions {
  position: relative;
}

.more-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: none;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.more-btn:hover {
  background-color: var(--bg-tertiary);
  border-color: var(--border-hover);
  color: var(--text-primary);
}

.more-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  z-index: 10;
  min-width: 120px;
  margin-top: 0.25rem;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.5rem 0.75rem;
  background: none;
  border: none;
  color: var(--text-primary);
  font-size: 0.75rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.menu-item:hover {
  background-color: var(--bg-tertiary);
}

.menu-item.report-item:hover {
  background-color: #fef2f2;
  color: #dc2626;
}

.menu-item.edit-item:hover {
  background-color: #f0f9ff;
  color: #2563eb;
}

.menu-item.delete-item:hover {
  background-color: #fef2f2;
  color: #dc2626;
}

.menu-icon {
  width: 14px;
  height: 14px;
}

.comment-content {
  margin-bottom: 0.75rem;
}

.comment-text {
  color: var(--text-primary);
  line-height: 1.6;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.replies {
  margin-top: 0.75rem;
  padding-left: 1rem;
  border-left: 2px solid var(--border-color);
}

/* 移动端优化 */
@media (max-width: 768px) {
  .comment-item.is-reply {
    margin-left: 1rem;
  }
  
  .comment-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .comment-actions {
    width: 100%;
    justify-content: flex-start;
    flex-wrap: wrap;
  }
  
  .action-btn {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
  }
  
  .more-actions {
    margin-left: auto;
  }
  
  .replies {
    padding-left: 0.5rem;
  }
}
</style>