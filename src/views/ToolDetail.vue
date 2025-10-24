<template>
  <div class="tool-detail" v-if="tool">
    <!-- 头部 -->
    <header class="header">
      <div class="container">
        <div class="header-content">
          <button @click.prevent="goBack" class="back-btn" type="button">
            <ArrowLeft class="back-icon" />
            返回
          </button>
          <div class="header-title">
            <div class="tool-icon">
              <component :is="tool.icon" class="tool-icon-svg" />
            </div>
            <div class="title-content">
              <h1>{{ tool.name }}</h1>
              <p>{{ tool.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </header>

    <div class="main-content">
      <div class="container">
        <div class="detail-grid">
          <!-- 左侧内容 -->
          <div class="left-content">
            <!-- 工具信息卡片 -->
            <div class="info-card">
              <div class="card-header">
                <div class="tool-badges">
                  <span v-if="tool.isFree" class="badge free">免费</span>
                  <span v-if="tool.isPopular" class="badge popular">热门</span>
                  <span v-if="tool.isFeatured" class="badge featured">推荐</span>
                </div>
                <div class="rating">
                  <Star class="star-icon" />
                  <span>{{ tool.rating }}</span>
                </div>
              </div>
              
              <div class="tool-meta">
                <div class="meta-item" v-if="tool.userCount">
                  <Users class="meta-icon" />
                  <span>{{ tool.userCount }} 用户</span>
                </div>
                <div class="meta-item">
                  <Calendar class="meta-icon" />
                  <span>{{ formatDate(tool.createdAt) }}</span>
                </div>
                <div class="meta-item" v-if="tool.pricing">
                  <DollarSign class="meta-icon" />
                  <span>{{ tool.pricing.free ? '免费' : tool.pricing.price || '付费' }}</span>
                </div>
              </div>
              
              <div class="action-buttons">
                <a :href="tool.url" target="_blank" class="btn btn-primary">
                  <ExternalLink class="btn-icon" />
                  访问工具
                </a>
                <button class="btn btn-secondary" @click="toggleFavorite">
                  <Heart class="btn-icon" :class="{ filled: isFavorite }" />
                  {{ isFavorite ? '已收藏' : '收藏' }}
                </button>
              </div>
            </div>

            <!-- 功能特性 -->
            <div class="features-card">
              <h3 class="card-title">功能特性</h3>
              <div class="features-list">
                <div 
                  v-for="feature in tool.features" 
                  :key="feature"
                  class="feature-item"
                >
                  <Check class="check-icon" />
                  <span>{{ feature }}</span>
                </div>
              </div>
            </div>

            <!-- 标签 -->
            <div class="tags-card">
              <h3 class="card-title">标签</h3>
              <div class="tags-list">
                <span 
                  v-for="tag in tool.tags" 
                  :key="tag"
                  class="tag"
                >
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>

          <!-- 右侧内容 -->
          <div class="right-content">
            <!-- 截图展示 -->
            <div v-if="tool.screenshots" class="screenshots-card">
              <h3 class="card-title">产品截图</h3>
              <div class="screenshots-grid">
                <img 
                  v-for="(screenshot, index) in tool.screenshots" 
                  :key="index"
                  :src="screenshot" 
                  :alt="`${tool.name} 截图 ${index + 1}`"
                  class="screenshot"
                  @click="openScreenshot(screenshot)"
                />
              </div>
            </div>

            <!-- 相关工具 -->
            <div class="related-tools-card">
              <h3 class="card-title">相关工具</h3>
              <div class="related-tools-list">
                <div 
                  v-for="relatedTool in relatedTools" 
                  :key="relatedTool.id"
                  class="related-tool-item"
                  @click="navigateToTool(relatedTool)"
                >
                  <div class="related-tool-icon">
                    <img :src="relatedTool.logo || `/icons/${relatedTool.icon}.svg`" :alt="relatedTool.name" />
                  </div>
                  <div class="related-tool-content">
                    <h4 class="related-tool-name">{{ relatedTool.name }}</h4>
                    <p class="related-tool-description">{{ relatedTool.shortDescription }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- 用户评价 -->
            <div class="reviews-card">
              <h3 class="card-title">用户评价</h3>
              <div class="reviews-list">
                <div 
                  v-for="review in reviews" 
                  :key="review.id"
                  class="review-item"
                >
                  <div class="review-header">
                    <div class="reviewer-info">
                      <div class="reviewer-avatar">
                        {{ review.userName.charAt(0) }}
                      </div>
                      <div class="reviewer-details">
                        <div class="reviewer-name">{{ review.userName }}</div>
                        <div class="review-date">{{ formatDate(review.createdAt) }}</div>
                      </div>
                    </div>
                    <div class="review-rating">
                      <Star v-for="i in 5" :key="i" class="star" :class="{ filled: i <= review.rating }" />
                    </div>
                  </div>
                  <p class="review-content">{{ review.content }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 截图模态框 -->
    <div v-if="showScreenshotModal" class="screenshot-modal" @click="closeScreenshotModal">
      <div class="modal-content" @click.stop>
        <img :src="selectedScreenshot" :alt="`${tool.name} 截图`" class="modal-screenshot" />
        <button @click="closeScreenshotModal" class="close-btn">
          <X class="close-icon" />
        </button>
      </div>
    </div>
  </div>
  
  <div v-else class="loading">
    <div class="loading-spinner"></div>
    <p>加载中...</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { 
  ArrowLeft, 
  Star, 
  Users, 
  Calendar, 
  DollarSign, 
  ExternalLink, 
  Heart, 
  Check, 
  X
} from 'lucide-vue-next'
import { aiTools } from '@/data/tools'
import type { AITool } from '@/types'

const router = useRouter()
const route = useRoute()

// 响应式数据
const tool = ref<AITool | null>(null)
const isFavorite = ref(false)
const showScreenshotModal = ref(false)
const selectedScreenshot = ref('')

// 模拟用户评价数据
const reviews = ref([
  {
    id: '1',
    userName: '张小明',
    rating: 5,
    content: '非常好用的AI工具，大大提升了我的工作效率！',
    createdAt: '2024-02-10'
  },
  {
    id: '2',
    userName: '李小红',
    rating: 4,
    content: '功能很强大，界面也很友好，推荐使用。',
    createdAt: '2024-02-08'
  },
  {
    id: '3',
    userName: '王大华',
    rating: 5,
    content: '免费版本已经足够日常使用了，性价比很高。',
    createdAt: '2024-02-05'
  }
])

// 计算属性
const relatedTools = computed(() => {
  if (!tool.value) return []
  return aiTools
    .filter(t => t.category === tool.value?.category && t.id !== tool.value?.id)
    .slice(0, 5)
})

// 方法
const goBack = () => {
  console.log('返回按钮被点击')
  // 尝试多种返回方法
  try {
    router.back()
  } catch (error) {
    console.log('router.back() 失败，尝试其他方法')
    try {
      router.go(-1)
    } catch (error2) {
      console.log('router.go(-1) 失败，使用原生方法')
      window.history.back()
    }
  }
}

const loadTool = () => {
  const toolId = route.params.id as string
  tool.value = aiTools.find(t => t.id === toolId) || null
}

const toggleFavorite = () => {
  isFavorite.value = !isFavorite.value
  // 这里可以添加收藏逻辑
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

const openScreenshot = (screenshot: string) => {
  selectedScreenshot.value = screenshot
  showScreenshotModal.value = true
}

const closeScreenshotModal = () => {
  showScreenshotModal.value = false
  selectedScreenshot.value = ''
}

const navigateToTool = (relatedTool: AITool) => {
  router.push({
    name: 'ToolDetail',
    params: { id: relatedTool.id }
  })
}

// 生命周期
onMounted(() => {
  loadTool()
})
</script>

<style scoped>
.tool-detail {
  min-height: 100vh;
  background-color: var(--bg-secondary);
}

.header {
  background-color: var(--bg-primary);
  border-bottom: 1px solid var(--border-color);
  padding: 1rem 0;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background-color: var(--border-color);
  color: var(--text-primary);
}

.header-title {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.tool-icon {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
}

.tool-icon-svg {
  width: 32px;
  height: 32px;
  color: white;
}

.title-content h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.title-content p {
  color: var(--text-secondary);
  font-size: 1rem;
  line-height: 1.5;
}

.main-content {
  padding: 2rem 0;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;
}

.left-content,
.right-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.info-card,
.features-card,
.tags-card,
.screenshots-card,
.related-tools-card,
.reviews-card {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.tool-badges {
  display: flex;
  gap: 0.5rem;
}

.badge {
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 500;
}

.badge.free {
  background-color: var(--success-color);
  color: white;
}

.badge.popular {
  background-color: var(--warning-color);
  color: white;
}

.badge.featured {
  background-color: var(--primary-color);
  color: white;
}

.rating {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--text-secondary);
}

.tool-meta {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.action-buttons {
  display: flex;
  gap: 1rem;
}

.btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background-color: var(--primary-hover);
  transform: translateY(-1px);
}

.btn-secondary {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover {
  background-color: var(--border-color);
}

.card-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.features-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--text-secondary);
}

.check-icon {
  width: 16px;
  height: 16px;
  color: var(--success-color);
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  background-color: var(--bg-tertiary);
  color: var(--text-secondary);
  padding: 0.5rem 1rem;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
}

.screenshots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.screenshot {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: transform 0.2s ease;
}

.screenshot:hover {
  transform: scale(1.05);
}

.related-tools-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.related-tool-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
}

.related-tool-item:hover {
  background-color: var(--bg-tertiary);
  transform: translateX(4px);
}

.related-tool-icon {
  width: 40px;
  height: 40px;
}

.related-tool-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.related-tool-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.related-tool-description {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.review-item {
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
}

.review-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.reviewer-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.reviewer-avatar {
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

.reviewer-name {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.875rem;
}

.review-date {
  color: var(--text-muted);
  font-size: 0.75rem;
}

.review-rating {
  display: flex;
  gap: 0.25rem;
}

.star {
  width: 16px;
  height: 16px;
  color: var(--border-color);
}

.star.filled {
  color: var(--warning-color);
}

.review-content {
  color: var(--text-secondary);
  font-size: 0.875rem;
  line-height: 1.5;
}

.screenshot-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
}

.modal-screenshot {
  max-width: 100%;
  max-height: 100%;
  border-radius: var(--radius-lg);
}

.close-btn {
  position: absolute;
  top: -40px;
  right: 0;
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.close-btn:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  gap: 1rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border-color);
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 1024px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
  
  .right-content {
    order: -1;
  }
}

@media (max-width: 768px) {
  .action-buttons {
    flex-direction: column;
  }
  
  .screenshots-grid {
    grid-template-columns: 1fr;
  }
}
</style>
