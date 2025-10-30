<template>
  <div class="mobile-tool-detail">
    <!-- 头部导航 -->
    <header class="detail-header">
      <div class="header-content">
        <button @click="goBack" class="back-btn">
          <ArrowLeft class="back-icon" :size="20" />
        </button>
        
        <div class="header-actions">
          <button @click="toggleFavorite" class="action-btn" :class="{ active: isFavorited }">
            <Heart class="action-icon" :size="18" :fill="isFavorited ? 'currentColor' : 'none'" />
          </button>
          <button @click="handleShare" class="action-btn">
            <Share class="action-icon" :size="18" />
          </button>
        </div>
      </div>
    </header>

    <!-- 工具信息 -->
    <div v-if="tool" class="tool-info">
      <div class="tool-header">
        <div class="tool-icon">
          <component :is="getToolIcon(tool.category)" class="icon" :size="24" />
        </div>
        
        <div class="tool-meta">
          <h1 class="tool-name">{{ tool.name }}</h1>
          <div class="tool-category">{{ tool.category }}</div>
          <div class="tool-rating">
            <div class="rating-stars">
              <Star 
                v-for="i in 5" 
                :key="i"
                class="star"
                :size="16"
                :fill="i <= Math.floor(tool.averageRating || 0) ? 'currentColor' : 'none'"
              />
            </div>
            <span class="rating-value">{{ tool.averageRating?.toFixed(1) || '0.0' }}</span>
            <span class="rating-count">({{ tool.ratingCount || 0 }} 评价)</span>
          </div>
        </div>
      </div>
      
      <div class="tool-description">
        <h3 class="section-title">工具描述</h3>
        <p class="description-text">{{ tool.description }}</p>
      </div>
      
      <div class="tool-features">
        <h3 class="section-title">主要功能</h3>
        <ul class="features-list">
          <li v-for="feature in tool.features" :key="feature" class="feature-item">
            <Check class="feature-icon" :size="14" />
            <span>{{ feature }}</span>
          </li>
        </ul>
      </div>
      
      <div class="tool-tags">
        <h3 class="section-title">标签</h3>
        <div class="tags-list">
          <span v-for="tag in tool.tags" :key="tag" class="tag">
            {{ tag }}
          </span>
        </div>
      </div>
      
      <div class="tool-stats">
        <h3 class="section-title">使用统计</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <Eye class="stat-icon" :size="16" />
            <span class="stat-label">浏览</span>
            <span class="stat-value">{{ formatNumber(tool.viewCount || 0) }}</span>
          </div>
          <div class="stat-item">
            <Heart class="stat-icon" :size="16" />
            <span class="stat-label">收藏</span>
            <span class="stat-value">{{ formatNumber(tool.favoriteCount || 0) }}</span>
          </div>
          <div class="stat-item">
            <Star class="stat-icon" :size="16" />
            <span class="stat-label">评分</span>
            <span class="stat-value">{{ tool.averageRating?.toFixed(1) || '0.0' }}</span>
          </div>
          <div class="stat-item">
            <MessageSquare class="stat-icon" :size="16" />
            <span class="stat-label">评论</span>
            <span class="stat-value">{{ formatNumber(tool.commentCount || 0) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="action-buttons">
      <button @click="visitTool" class="visit-btn primary">
        <ExternalLink class="btn-icon" :size="16" />
        访问工具
      </button>
      <button v-if="isAuthenticated" @click="toggleFavorite" class="favorite-btn" :class="{ active: isFavorited }">
        <Heart class="btn-icon" :size="16" :fill="isFavorited ? 'currentColor' : 'none'" />
        {{ isFavorited ? '已收藏' : '收藏' }}
      </button>
    </div>

    <!-- 评分系统 -->
    <div v-if="isAuthenticated" class="rating-section">
      <h3 class="section-title">我的评分</h3>
      <div class="rating-input">
        <div class="rating-stars-input">
          <button 
            v-for="i in 5" 
            :key="i"
            @click="setRating(i)"
            class="star-btn"
            :class="{ active: i <= userRating }"
          >
            <Star class="star-icon" :size="20" :fill="i <= userRating ? 'currentColor' : 'none'" />
          </button>
        </div>
        <div class="rating-text">
          {{ getRatingText(userRating) }}
        </div>
      </div>
      
      <div class="rating-comment">
        <textarea
          v-model="ratingComment"
          placeholder="分享您的使用体验..."
          class="comment-input"
          rows="3"
        ></textarea>
        <button @click="submitRating" class="submit-rating-btn" :disabled="userRating === 0">
          提交评分
        </button>
      </div>
    </div>

    <!-- 评论区域 -->
    <div class="comments-section">
      <h3 class="section-title">用户评论</h3>
      
      <div v-if="isAuthenticated" class="comment-form">
        <textarea
          v-model="newComment"
          placeholder="写下您的评论..."
          class="comment-input"
          rows="3"
        ></textarea>
        <button @click="submitComment" class="submit-comment-btn" :disabled="!newComment.trim()">
          发表评论
        </button>
      </div>
      
      <div v-if="comments.length === 0" class="empty-comments">
        <MessageSquare class="empty-icon" :size="32" />
        <p class="empty-text">暂无评论，快来抢沙发吧！</p>
      </div>
      
      <div v-else class="comments-list">
        <div v-for="comment in comments" :key="comment.id" class="comment-item">
          <div class="comment-header">
            <div class="comment-user">
              <div class="user-avatar">{{ comment.username.charAt(0) }}</div>
              <div class="user-info">
                <div class="username">{{ comment.username }}</div>
                <div class="comment-time">{{ formatTime(comment.createdAt) }}</div>
              </div>
            </div>
            <div class="comment-rating">
              <Star 
                v-for="i in 5" 
                :key="i"
                class="star"
                :size="12"
                :fill="i <= comment.rating ? 'currentColor' : 'none'"
              />
            </div>
          </div>
          <div class="comment-content">
            {{ comment.content }}
          </div>
          <div class="comment-actions">
            <button @click="likeComment(comment)" class="action-btn" :class="{ active: comment.isLiked }">
              <ThumbsUp class="action-icon" :size="14" />
              {{ comment.likeCount || 0 }}
            </button>
            <button @click="replyComment(comment)" class="action-btn">
              <MessageSquare class="action-icon" :size="14" />
              回复
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p class="loading-text">加载中...</p>
    </div>

    <!-- 错误状态 -->
    <div v-if="error" class="error-state">
      <AlertCircle class="error-icon" :size="48" />
      <h3 class="error-title">加载失败</h3>
      <p class="error-description">{{ error }}</p>
      <button @click="loadTool" class="retry-btn">重试</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { 
  ArrowLeft, 
  Heart, 
  Share, 
  Star, 
  Eye, 
  MessageSquare, 
  ExternalLink, 
  Check,
  ThumbsUp,
  AlertCircle,
  Bot,
  Image,
  Video,
  Code,
  Palette,
  Music,
  FileText,
  Briefcase,
  GraduationCap,
  Cpu,
  Layers,
  Award,
  Shield,
  ShoppingCart,
  Smartphone,
  Scissors,
  Mic,
  Volume2,
  Globe
} from 'lucide-vue-next'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const route = useRoute()
const { user, isAuthenticated, apiRequest } = useAuth()
const { success, error: showError } = useToast()

// 响应式数据
const tool = ref<any>(null)
const isLoading = ref(false)
const error = ref('')
const isFavorited = ref(false)
const userRating = ref(0)
const ratingComment = ref('')
const newComment = ref('')
const comments = ref<any[]>([])

// 方法
const goBack = () => {
  router.back()
}

const loadTool = async () => {
  try {
    isLoading.value = true
    error.value = ''
    
    const toolId = route.params.id
    // 这里应该调用实际的API
    // const response = await apiRequest(`/tools/${toolId}`)
    
    // 模拟数据
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    tool.value = {
      id: toolId,
      name: 'ChatGPT',
      category: 'AI聊天',
      description: 'ChatGPT是由OpenAI开发的大型语言模型，能够进行自然语言对话，回答问题，协助写作，编程等多种任务。',
      features: [
        '自然语言对话',
        '文本生成和编辑',
        '代码编写和调试',
        '翻译和语言学习',
        '创意写作和头脑风暴'
      ],
      tags: ['AI', '聊天', '写作', '编程', '翻译'],
      averageRating: 4.5,
      ratingCount: 1250,
      viewCount: 50000,
      favoriteCount: 3200,
      commentCount: 89,
      url: 'https://chat.openai.com'
    }
    
    // 加载评论
    await loadComments()
    
  } catch (err) {
    error.value = '加载工具信息失败'
    console.error('Load tool error:', err)
  } finally {
    isLoading.value = false
  }
}

const loadComments = async () => {
  try {
    // 模拟评论数据
    comments.value = [
      {
        id: 1,
        username: '用户A',
        content: '非常好用的AI工具，回答质量很高，强烈推荐！',
        rating: 5,
        createdAt: new Date().toISOString(),
        likeCount: 12,
        isLiked: false
      },
      {
        id: 2,
        username: '用户B',
        content: '功能很强大，但有时候回答不够准确，需要仔细甄别。',
        rating: 4,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        likeCount: 8,
        isLiked: true
      }
    ]
  } catch (err) {
    console.error('Load comments error:', err)
  }
}

const toggleFavorite = async () => {
  if (!isAuthenticated.value) {
    router.push('/login')
    return
  }
  
  try {
    isFavorited.value = !isFavorited.value
    
    if (isFavorited.value) {
      success('已添加到收藏')
    } else {
      success('已从收藏中移除')
    }
  } catch (err) {
    showError('操作失败，请稍后重试')
  }
}

const handleShare = async () => {
  try {
    if (navigator.share) {
      await navigator.share({
        title: tool.value?.name,
        text: tool.value?.description,
        url: window.location.href
      })
    } else {
      await navigator.clipboard.writeText(window.location.href)
      success('链接已复制到剪贴板')
    }
  } catch (err) {
    console.error('Share error:', err)
  }
}

const visitTool = () => {
  if (tool.value?.url) {
    window.open(tool.value.url, '_blank')
  }
}

const getToolIcon = (category: string) => {
  const iconMap: Record<string, any> = {
    'AI聊天': Bot,
    'AI绘画': Image,
    'AI视频': Video,
    'AI编程': Code,
    'AI设计': Palette,
    'AI音乐': Music,
    'AI写作': FileText,
    'AI办公': Briefcase,
    'AI学习': GraduationCap,
    'AI模型': Cpu,
    'AI工具': Layers,
    'AI奖项': Award,
    'AI安全': Shield,
    'AI购物': ShoppingCart,
    'AI移动': Smartphone,
    'AI剪辑': Scissors,
    'AI语音': Mic,
    'AI音频': Volume2,
    'AI网站': Globe
  }
  return iconMap[category] || Bot
}

const formatNumber = (num: number) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
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

const setRating = (rating: number) => {
  userRating.value = rating
}

const getRatingText = (rating: number) => {
  const texts = ['', '很差', '一般', '还行', '很好', '优秀']
  return texts[rating] || ''
}

const submitRating = async () => {
  if (!isAuthenticated.value) {
    router.push('/login')
    return
  }
  
  try {
    // 这里应该调用实际的API
    success('评分提交成功')
    userRating.value = 0
    ratingComment.value = ''
  } catch (err) {
    showError('评分提交失败')
  }
}

const submitComment = async () => {
  if (!isAuthenticated.value) {
    router.push('/login')
    return
  }
  
  if (!newComment.value.trim()) return
  
  try {
    // 这里应该调用实际的API
    success('评论发表成功')
    newComment.value = ''
    await loadComments()
  } catch (err) {
    showError('评论发表失败')
  }
}

const likeComment = (comment: any) => {
  comment.isLiked = !comment.isLiked
  comment.likeCount = (comment.likeCount || 0) + (comment.isLiked ? 1 : -1)
}

const replyComment = (comment: any) => {
  // 实现回复功能
  console.log('Reply to comment:', comment.id)
}

// 初始化
onMounted(() => {
  loadTool()
})
</script>

<style scoped>
.mobile-tool-detail {
  min-height: 100vh;
  background-color: var(--bg-secondary);
  padding-bottom: 80px; /* 为底部操作按钮留出空间 */
}

.detail-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background-color: var(--bg-primary);
  border-bottom: 1px solid var(--border-color);
  z-index: 1000;
  padding: 0.75rem 1rem;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: none;
  border: none;
  color: var(--text-primary);
  cursor: pointer;
  border-radius: var(--radius-md);
  transition: background-color 0.2s ease;
}

.back-btn:hover {
  background-color: var(--bg-tertiary);
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--bg-tertiary);
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: var(--border-color);
  color: var(--text-primary);
}

.action-btn.active {
  background: var(--error-color);
  color: white;
}

.action-icon {
  width: 18px;
  height: 18px;
}

.tool-info {
  padding: 1rem;
  margin-top: 60px;
}

.tool-header {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.tool-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.tool-meta {
  flex: 1;
  min-width: 0;
}

.tool-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
}

.tool-category {
  font-size: 0.875rem;
  color: var(--text-muted);
  background-color: var(--bg-tertiary);
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  display: inline-block;
  margin-bottom: 0.5rem;
}

.tool-rating {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.rating-stars {
  display: flex;
  gap: 0.125rem;
}

.star {
  color: #fbbf24;
}

.rating-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
}

.rating-count {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.75rem 0;
}

.tool-description {
  margin-bottom: 1.5rem;
}

.description-text {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
}

.tool-features {
  margin-bottom: 1.5rem;
}

.features-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
  font-size: 0.875rem;
  color: var(--text-primary);
}

.feature-icon {
  color: var(--success-color);
  flex-shrink: 0;
}

.tool-tags {
  margin-bottom: 1.5rem;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  font-size: 0.75rem;
  color: var(--text-muted);
  background-color: var(--bg-tertiary);
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
}

.tool-stats {
  margin-bottom: 1.5rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 1rem;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
}

.stat-icon {
  color: var(--primary-color);
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.stat-value {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
}

.action-buttons {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: var(--bg-primary);
  border-top: 1px solid var(--border-color);
  padding: 1rem;
  display: flex;
  gap: 0.75rem;
  z-index: 1000;
}

.visit-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.visit-btn:hover {
  background: var(--primary-hover);
}

.favorite-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1rem;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.favorite-btn:hover {
  background: var(--border-color);
}

.favorite-btn.active {
  background: var(--error-color);
  color: white;
  border-color: var(--error-color);
}

.btn-icon {
  width: 16px;
  height: 16px;
}

.rating-section {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1rem;
  margin: 1rem;
}

.rating-input {
  margin-bottom: 1rem;
}

.rating-stars-input {
  display: flex;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
}

.star-btn {
  background: none;
  border: none;
  color: #d1d5db;
  cursor: pointer;
  transition: color 0.2s ease;
}

.star-btn.active {
  color: #fbbf24;
}

.star-icon {
  width: 20px;
  height: 20px;
}

.rating-text {
  font-size: 0.875rem;
  color: var(--text-secondary);
  text-align: center;
}

.rating-comment {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.comment-input {
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

.comment-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.submit-rating-btn,
.submit-comment-btn {
  padding: 0.75rem 1rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.submit-rating-btn:hover,
.submit-comment-btn:hover {
  background: var(--primary-hover);
}

.submit-rating-btn:disabled,
.submit-comment-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.comments-section {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1rem;
  margin: 1rem;
}

.comment-form {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.empty-comments {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: var(--text-muted);
}

.empty-icon {
  margin-bottom: 0.75rem;
}

.empty-text {
  font-size: 0.875rem;
  margin: 0;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.comment-item {
  padding: 1rem;
  background-color: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.comment-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.comment-user {
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

.user-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.username {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
}

.comment-time {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.comment-rating {
  display: flex;
  gap: 0.125rem;
}

.comment-content {
  font-size: 0.875rem;
  color: var(--text-primary);
  line-height: 1.5;
  margin-bottom: 0.75rem;
}

.comment-actions {
  display: flex;
  gap: 1rem;
}

.comment-actions .action-btn {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.375rem 0.75rem;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  color: var(--text-muted);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.comment-actions .action-btn:hover {
  background: var(--border-color);
  color: var(--text-primary);
}

.comment-actions .action-btn.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.comment-actions .action-icon {
  width: 14px;
  height: 14px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  color: var(--text-secondary);
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border-color);
  border-top: 3px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 0.875rem;
  margin: 0;
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
  color: var(--text-secondary);
}

.error-icon {
  color: var(--error-color);
  margin-bottom: 1rem;
}

.error-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.error-description {
  font-size: 0.875rem;
  margin: 0 0 1.5rem 0;
  line-height: 1.4;
}

.retry-btn {
  padding: 0.75rem 1.5rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.retry-btn:hover {
  background: var(--primary-hover);
}

/* 触摸优化 */
@media (hover: none) and (pointer: coarse) {
  .action-btn,
  .star-btn,
  .submit-rating-btn,
  .submit-comment-btn,
  .retry-btn {
    min-height: 44px;
  }
  
  .back-btn {
    min-width: 44px;
    min-height: 44px;
  }
}

/* 小屏幕优化 */
@media (max-width: 480px) {
  .tool-info {
    padding: 0.75rem;
  }
  
  .tool-header {
    gap: 0.75rem;
  }
  
  .tool-icon {
    width: 50px;
    height: 50px;
  }
  
  .tool-name {
    font-size: 1.125rem;
  }
  
  .stats-grid {
    gap: 0.75rem;
  }
  
  .stat-item {
    padding: 0.75rem;
  }
  
  .action-buttons {
    padding: 0.75rem;
    gap: 0.5rem;
  }
  
  .visit-btn,
  .favorite-btn {
    padding: 0.75rem;
    font-size: 0.8125rem;
  }
  
  .rating-section,
  .comments-section {
    margin: 0.75rem;
    padding: 0.75rem;
  }
}
</style>