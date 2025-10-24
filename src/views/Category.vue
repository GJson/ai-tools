<template>
  <div class="category">
    <!-- 头部 -->
    <header class="header">
      <div class="container">
        <div class="header-content">
          <button @click.prevent="goBack" class="back-btn" type="button">
            <ArrowLeft class="back-icon" />
            返回
          </button>
          <div class="header-title">
            <div class="category-icon" :style="{ color: category?.color }">
              <component :is="category?.icon" class="icon" />
            </div>
            <div class="title-content">
              <h1>{{ category?.name }}</h1>
              <p>{{ category?.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </header>

    <div class="main-content">
      <div class="container">
        <!-- 子分类 -->
        <section v-if="category?.subcategories" class="subcategories">
          <h2 class="section-title">子分类</h2>
          <div class="subcategories-grid">
            <div 
              v-for="subcategory in category.subcategories" 
              :key="subcategory.id"
              class="subcategory-card"
              @click="filterBySubcategory(subcategory.id)"
            >
              <h3 class="subcategory-name">{{ subcategory.name }}</h3>
              <p class="subcategory-description">{{ subcategory.description }}</p>
              <div class="tool-count">{{ subcategory.toolCount }} 个工具</div>
            </div>
          </div>
        </section>

        <!-- 筛选器 -->
        <section class="filters">
          <div class="filter-group">
            <label class="filter-label">筛选条件：</label>
            <div class="filter-options">
              <button 
                :class="['filter-btn', { active: filters.isFree === true }]"
                @click="toggleFilter('isFree', true)"
              >
                免费
              </button>
              <button 
                :class="['filter-btn', { active: filters.isPopular === true }]"
                @click="toggleFilter('isPopular', true)"
              >
                热门
              </button>
              <button 
                :class="['filter-btn', { active: filters.isFeatured === true }]"
                @click="toggleFilter('isFeatured', true)"
              >
                推荐
              </button>
            </div>
          </div>
          
          <div class="filter-group">
            <label class="filter-label">排序：</label>
            <select v-model="sortBy" class="sort-select">
              <option value="rating">评分</option>
              <option value="name">名称</option>
              <option value="userCount">用户数</option>
              <option value="createdAt">最新</option>
            </select>
          </div>
        </section>

        <!-- 工具列表 -->
        <section class="tools-section">
          <div class="tools-header">
            <h2 class="section-title">
              工具列表
              <span class="tool-count">({{ filteredTools.length }} 个)</span>
            </h2>
          </div>
          
          <div class="tools-grid">
            <div 
              v-for="tool in paginatedTools" 
              :key="tool.id"
              class="tool-card"
              @click="navigateToTool(tool)"
            >
              <div class="tool-header">
              <div class="tool-icon">
                <component :is="tool.icon" class="tool-icon-svg" />
              </div>
                <div class="tool-badges">
                  <span v-if="tool.isFree" class="badge free">免费</span>
                  <span v-if="tool.isPopular" class="badge popular">热门</span>
                  <span v-if="tool.isFeatured" class="badge featured">推荐</span>
                </div>
              </div>
              
              <div class="tool-content">
                <h3 class="tool-name">{{ tool.name }}</h3>
                <p class="tool-description">{{ tool.description }}</p>
                
                <div class="tool-features">
                  <span 
                    v-for="feature in tool.features.slice(0, 3)" 
                    :key="feature"
                    class="feature-tag"
                  >
                    {{ feature }}
                  </span>
                </div>
                
                <div class="tool-meta">
                  <div class="rating">
                    <Star class="star-icon" />
                    <span>{{ tool.rating }}</span>
                  </div>
                  <div v-if="tool.userCount" class="user-count">
                    <Users class="users-icon" />
                    <span>{{ tool.userCount }}</span>
                  </div>
                </div>
                
                <div class="tool-tags">
                  <span 
                    v-for="tag in tool.tags.slice(0, 3)" 
                    :key="tag"
                    class="tag"
                  >
                    {{ tag }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- 分页 -->
          <div v-if="totalPages > 1" class="pagination">
            <button 
              :disabled="currentPage === 1"
              @click="currentPage--"
              class="page-btn"
            >
              上一页
            </button>
            
            <div class="page-numbers">
              <button 
                v-for="page in visiblePages" 
                :key="page"
                :class="['page-number', { active: page === currentPage }]"
                @click="currentPage = page"
              >
                {{ page }}
              </button>
            </div>
            
            <button 
              :disabled="currentPage === totalPages"
              @click="currentPage++"
              class="page-btn"
            >
              下一页
            </button>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, Star, Users } from 'lucide-vue-next'
import { categories } from '@/data/categories'
import { aiTools } from '@/data/tools'
import type { AITool } from '@/types'

const router = useRouter()
const route = useRoute()

// 响应式数据
const category = ref<any>(null)
const tools = ref<AITool[]>([])
const filters = ref({
  isFree: null as boolean | null,
  isPopular: null as boolean | null,
  isFeatured: null as boolean | null,
  subcategory: null as string | null
})
const sortBy = ref('rating')
const currentPage = ref(1)
const pageSize = 12

// 计算属性
const filteredTools = computed(() => {
  let result = tools.value

  // 应用筛选器
  if (filters.value.isFree !== null) {
    result = result.filter(tool => tool.isFree === filters.value.isFree)
  }
  if (filters.value.isPopular !== null) {
    result = result.filter(tool => tool.isPopular === filters.value.isPopular)
  }
  if (filters.value.isFeatured !== null) {
    result = result.filter(tool => tool.isFeatured === filters.value.isFeatured)
  }
  if (filters.value.subcategory) {
    result = result.filter(tool => tool.subcategory === filters.value.subcategory)
  }

  // 应用排序
  result = [...result].sort((a, b) => {
    switch (sortBy.value) {
      case 'rating':
        return b.rating - a.rating
      case 'name':
        return a.name.localeCompare(b.name)
      case 'userCount':
        return parseInt(b.userCount || '0') - parseInt(a.userCount || '0')
      case 'createdAt':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      default:
        return 0
    }
  })

  return result
})

const totalPages = computed(() => Math.ceil(filteredTools.value.length / pageSize))

const paginatedTools = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredTools.value.slice(start, end)
})

const visiblePages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  const delta = 2
  
  let start = Math.max(1, current - delta)
  let end = Math.min(total, current + delta)
  
  if (end - start < delta * 2) {
    if (start === 1) {
      end = Math.min(total, start + delta * 2)
    } else {
      start = Math.max(1, end - delta * 2)
    }
  }
  
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
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

const loadCategory = () => {
  const categoryId = route.params.id as string
  category.value = categories.find(cat => cat.id === categoryId)
  if (category.value) {
    tools.value = aiTools.filter(tool => tool.category === categoryId)
  }
}

const toggleFilter = (key: keyof typeof filters.value, value: boolean) => {
  if (filters.value[key] === value) {
    filters.value[key] = null
  } else {
    filters.value[key] = value
  }
  currentPage.value = 1
}

const filterBySubcategory = (subcategoryId: string) => {
  filters.value.subcategory = filters.value.subcategory === subcategoryId ? null : subcategoryId
  currentPage.value = 1
}

const navigateToTool = (tool: AITool) => {
  router.push({
    name: 'ToolDetail',
    params: { id: tool.id }
  })
}

// 监听器
watch(() => route.params.id, () => {
  loadCategory()
})

// 生命周期
onMounted(() => {
  loadCategory()
})
</script>

<style scoped>
.category {
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

.category-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-tertiary);
  border-radius: var(--radius-lg);
}

.title-content h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.title-content p {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.main-content {
  padding: 2rem 0;
}

.subcategories {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.subcategories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.subcategory-card {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.subcategory-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.subcategory-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.subcategory-description {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.tool-count {
  color: var(--text-muted);
  font-size: 0.75rem;
}

.filters {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  margin-bottom: 2rem;
  display: flex;
  gap: 2rem;
  align-items: center;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-label {
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
}

.filter-options {
  display: flex;
  gap: 0.5rem;
}

.filter-btn {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background-color: var(--bg-primary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-btn:hover,
.filter-btn.active {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.sort-select {
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

.tools-section {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
}

.tools-header {
  margin-bottom: 1.5rem;
}

.tool-count {
  color: var(--text-muted);
  font-weight: 400;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.tool-card {
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tool-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.tool-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.tool-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
}

.tool-icon-svg {
  width: 24px;
  height: 24px;
  color: white;
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

.tool-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.tool-description {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.tool-features {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.feature-tag {
  background-color: var(--bg-tertiary);
  color: var(--text-secondary);
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
}

.tool-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.rating,
.user-count {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.tool-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  background-color: var(--bg-tertiary);
  color: var(--text-muted);
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
}

.page-btn {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background-color: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.page-btn:hover:not(:disabled) {
  background-color: var(--bg-tertiary);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 0.5rem;
}

.page-number {
  width: 40px;
  height: 40px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background-color: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-number:hover,
.page-number.active {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

@media (max-width: 768px) {
  .filters {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .tools-grid {
    grid-template-columns: 1fr;
  }
  
  .pagination {
    flex-wrap: wrap;
  }
}
</style>
