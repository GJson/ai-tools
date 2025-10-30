<!-- genAI_main_start -->
<template>
  <div class="ai-news-detail-page">
    <!-- 头部导航 -->
    <header class="header">
      <div class="container">
        <div class="header-content">
          <button @click="goBack" class="back-btn" type="button">
            <ArrowLeft class="back-icon" />
            返回
          </button>
          <h1 class="page-title">AI快讯详情</h1>
          <div class="header-actions">
            <button @click="shareNews" class="action-btn" title="分享">
              <Share2 class="action-icon" :size="20" />
            </button>
            <button @click="bookmarkNews" class="action-btn" title="收藏">
              <Bookmark class="action-icon" :size="20" />
            </button>
          </div>
        </div>
      </div>
    </header>

    <div class="main-content">
      <div class="container">
        <!-- 加载状态 -->
        <div v-if="isLoading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>正在加载快讯详情...</p>
        </div>

        <!-- 快讯详情 -->
        <div v-else-if="newsItem" class="news-detail">
          <!-- 快讯头部 -->
          <div class="news-header">
            <div class="news-meta">
              <span class="news-category">{{ newsItem.category }}</span>
              <span class="news-time">{{ formatTime(newsItem.publishedAt) }}</span>
              <span class="news-read-time">{{ newsItem.readTime }}分钟阅读</span>
              <span v-if="newsItem.isHot" class="hot-badge">
                <Flame class="hot-icon" :size="12" />
                热门
              </span>
            </div>
            
            <h1 class="news-title">{{ newsItem.title }}</h1>
            
            <div class="news-source">
              <Newspaper class="source-icon" :size="16" />
              <span>{{ newsItem.source }}</span>
            </div>
          </div>

          <!-- 快讯内容 -->
          <div class="news-content">
            <div class="content-text">
              <p v-for="(paragraph, index) in contentParagraphs" :key="index" class="paragraph">
                {{ paragraph }}
              </p>
            </div>
          </div>

          <!-- 快讯标签 -->
          <div class="news-tags">
            <h3 class="tags-title">相关标签</h3>
            <div class="tags-list">
              <span 
                v-for="tag in newsItem.tags" 
                :key="tag"
                class="tag"
              >
                {{ tag }}
              </span>
            </div>
          </div>

          <!-- 相关快讯 -->
          <div class="related-news">
            <h3 class="related-title">相关快讯</h3>
            <div class="related-list">
              <div 
                v-for="related in relatedNews" 
                :key="related.id"
                class="related-item"
                @click="navigateToNews(related.id)"
              >
                <div class="related-meta">
                  <span class="related-category">{{ related.category }}</span>
                  <span class="related-time">{{ formatTime(related.publishedAt) }}</span>
                </div>
                <h4 class="related-title-text">{{ related.title }}</h4>
                <p class="related-summary">{{ related.summary }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 错误状态 -->
        <div v-else class="error-state">
          <AlertCircle class="error-icon" :size="64" />
          <h3 class="error-title">快讯不存在</h3>
          <p class="error-description">该快讯可能已被删除或不存在</p>
          <button @click="goBack" class="back-home-btn">返回快讯列表</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { 
  ArrowLeft, 
  Share2, 
  Bookmark, 
  Flame, 
  Newspaper, 
  AlertCircle
} from 'lucide-vue-next'
import { newsService, type AINewsItem } from '@/services/newsService'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const route = useRoute()
const { success, error } = useToast()

// 响应式数据
const newsItem = ref<AINewsItem | null>(null)
const relatedNews = ref<AINewsItem[]>([])
const isLoading = ref(false)

// 计算属性
const contentParagraphs = computed(() => {
  if (!newsItem.value) return []
  return newsItem.value.content.split('\n').filter(p => p.trim())
})

// 方法
const goBack = () => {
  router.push('/ai-news')
}

const loadNewsDetail = async () => {
  const newsId = route.params.id as string
  if (!newsId) {
    router.push('/ai-news')
    return
  }

  isLoading.value = true
  try {
    const news = await newsService.getAINewsById(newsId)
    if (news) {
      newsItem.value = news
      await loadRelatedNews(news.category)
    }
  } catch (err) {
    error('加载快讯详情失败')
  } finally {
    isLoading.value = false
  }
}

const loadRelatedNews = async (category: string) => {
  try {
    const allNews = await newsService.getLatestAINews()
    relatedNews.value = allNews
      .filter(news => news.category === category && news.id !== newsItem.value?.id)
      .slice(0, 3)
  } catch (err) {
    console.error('Failed to load related news:', err)
  }
}

const shareNews = () => {
  if (!newsItem.value) return
  
  if (navigator.share) {
    navigator.share({
      title: newsItem.value.title,
      text: newsItem.value.summary,
      url: window.location.href
    })
  } else {
    navigator.clipboard.writeText(`${newsItem.value.title}\n${newsItem.value.summary}\n${window.location.href}`)
    success('链接已复制到剪贴板')
  }
}

const bookmarkNews = () => {
  if (!newsItem.value) return
  success('已添加到收藏')
}

const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
  
  if (diffInMinutes < 1) return '刚刚'
  if (diffInMinutes < 60) return `${diffInMinutes}分钟前`
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}小时前`
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays}天前`
  
  return date.toLocaleDateString('zh-CN')
}

const navigateToNews = (newsId: string) => {
  router.push(`/ai-news/${newsId}`)
}

onMounted(() => {
  loadNewsDetail()
})
</script>

<style scoped>
.ai-news-detail-page {
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

.action-btn {
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

.action-btn:hover {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
}

.action-icon {
  width: 20px;
  height: 20px;
}

.main-content {
  padding: 2rem 0;
}

.loading-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-muted);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-color);
  border-top: 3px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.news-detail {
  max-width: 800px;
  margin: 0 auto;
}

.news-header {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: var(--shadow-sm);
}

.news-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.news-category {
  background-color: var(--primary-color);
  color: white;
  padding: 0.375rem 0.75rem;
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  font-weight: 500;
}

.news-time {
  color: var(--text-muted);
  font-size: 0.875rem;
}

.news-read-time {
  color: var(--text-muted);
  font-size: 0.875rem;
}

.hot-badge {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background-color: var(--error-color);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 500;
}

.hot-icon {
  width: 12px;
  height: 12px;
}

.news-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
  line-height: 1.3;
}

.news-source {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-muted);
  font-size: 0.875rem;
}

.source-icon {
  width: 16px;
  height: 16px;
}

.news-content {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: var(--shadow-sm);
}

.content-text {
  line-height: 1.8;
}

.paragraph {
  color: var(--text-primary);
  font-size: 1rem;
  margin: 0 0 1.5rem 0;
  text-align: justify;
}

.paragraph:last-child {
  margin-bottom: 0;
}

.news-tags {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: var(--shadow-sm);
}

.tags-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.tag {
  padding: 0.5rem 1rem;
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  border: 1px solid var(--border-color);
  transition: all 0.2s ease;
}

.tag:hover {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.related-news {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
}

.related-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 1.5rem 0;
}

.related-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.related-item {
  padding: 1rem;
  background-color: var(--bg-tertiary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.related-item:hover {
  background-color: var(--bg-primary);
  border-color: var(--primary-color);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.related-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.related-category {
  background-color: var(--primary-color);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 500;
}

.related-time {
  color: var(--text-muted);
  font-size: 0.8125rem;
}

.related-title-text {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
  line-height: 1.4;
}

.related-summary {
  color: var(--text-secondary);
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.error-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-muted);
}

.error-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 1.5rem;
  color: var(--border-color);
}

.error-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.error-description {
  font-size: 0.875rem;
  margin: 0 0 2rem 0;
  line-height: 1.5;
}

.back-home-btn {
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

.back-home-btn:hover {
  background-color: var(--primary-hover);
  transform: translateY(-1px);
}

/* 移动端优化 */
@media (max-width: 768px) {
  .main-content {
    padding: 1rem 0;
  }
  
  .news-header {
    padding: 1.5rem;
  }
  
  .news-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .news-title {
    font-size: 1.5rem;
  }
  
  .news-content {
    padding: 1.5rem;
  }
  
  .paragraph {
    font-size: 0.9375rem;
  }
  
  .news-tags,
  .related-news {
    padding: 1rem;
  }
  
  .tags-list {
    gap: 0.5rem;
  }
  
  .tag {
    padding: 0.375rem 0.75rem;
    font-size: 0.8125rem;
  }
  
  .related-item {
    padding: 0.75rem;
  }
  
  .related-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>
<!-- genAI_main_end -->