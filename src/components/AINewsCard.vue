<!-- genAI_main_start -->
<template>
  <div class="ai-news-card" @click="navigateToNews">
    <div class="news-card-content">
      <div class="news-header">
        <div class="news-icon">
          <Zap class="icon" :size="24" />
        </div>
        <div class="news-title">
          <h3>AI快讯</h3>
          <p>每日快讯</p>
        </div>
      </div>
      <div class="news-badge">
        <span class="badge-text">NEW</span>
      </div>
    </div>
    <div class="news-preview">
      <p class="preview-text">{{ latestNews?.title || '获取最新AI资讯...' }}</p>
      <div class="news-meta">
        <Clock class="meta-icon" :size="12" />
        <span class="meta-text">{{ formatTime(latestNews?.publishedAt) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Zap, Clock } from 'lucide-vue-next'
import { newsService } from '@/services/newsService'

const router = useRouter()
const latestNews = ref<any>(null)

const navigateToNews = () => {
  router.push('/ai-news')
}

const formatTime = (dateString?: string) => {
  if (!dateString) return '刚刚'
  const date = new Date(dateString)
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
  
  if (diffInMinutes < 1) return '刚刚'
  if (diffInMinutes < 60) return `${diffInMinutes}分钟前`
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}小时前`
  
  return date.toLocaleDateString('zh-CN')
}

onMounted(async () => {
  try {
    const news = await newsService.getLatestAINews()
    latestNews.value = news[0] // 获取最新的一条新闻
  } catch (error) {
    console.error('Failed to load AI news:', error)
  }
})
</script>

<style scoped>
.ai-news-card {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  min-height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.ai-news-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4);
}

.ai-news-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%);
  transform: translateX(-100%);
  transition: transform 0.6s ease;
}

.ai-news-card:hover::before {
  transform: translateX(100%);
}

.news-card-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.news-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.news-icon {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.news-icon .icon {
  color: white;
}

.news-title h3 {
  color: white;
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0 0 0.25rem 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.news-title p {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.875rem;
  margin: 0;
  font-weight: 500;
}

.news-badge {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 0.375rem 0.75rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.badge-text {
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.news-preview {
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-md);
  padding: 1rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.preview-text {
  color: white;
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0 0 0.75rem 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.news-meta {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.meta-icon {
  color: rgba(255, 255, 255, 0.8);
  width: 12px;
  height: 12px;
}

.meta-text {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.75rem;
  font-weight: 500;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .ai-news-card {
    padding: 1rem;
    min-height: 100px;
  }
  
  .news-header {
    gap: 0.75rem;
  }
  
  .news-icon {
    width: 40px;
    height: 40px;
  }
  
  .news-icon .icon {
    width: 20px;
    height: 20px;
  }
  
  .news-title h3 {
    font-size: 1.125rem;
  }
  
  .news-title p {
    font-size: 0.8125rem;
  }
  
  .news-preview {
    padding: 0.75rem;
  }
  
  .preview-text {
    font-size: 0.8125rem;
  }
}
</style>
<!-- genAI_main_end -->