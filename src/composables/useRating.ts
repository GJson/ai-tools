import { ref, computed } from 'vue'

interface Rating {
  toolId: string
  rating: number
  comment?: string
  ratedAt: string
}

const ratings = ref<Rating[]>([])

// 从localStorage加载评分数据
const loadRatings = () => {
  const saved = localStorage.getItem('ai-tools-ratings')
  if (saved) {
    try {
      ratings.value = JSON.parse(saved)
    } catch (error) {
      console.error('Failed to load ratings:', error)
      ratings.value = []
    }
  }
}

// 保存评分数据到localStorage
const saveRatings = () => {
  localStorage.setItem('ai-tools-ratings', JSON.stringify(ratings.value))
}

// 添加或更新评分
const rateTool = (toolId: string, rating: number, comment?: string) => {
  const existingIndex = ratings.value.findIndex(r => r.toolId === toolId)
  
  const ratingData: Rating = {
    toolId,
    rating,
    comment,
    ratedAt: new Date().toISOString()
  }
  
  if (existingIndex > -1) {
    ratings.value[existingIndex] = ratingData
  } else {
    ratings.value.push(ratingData)
  }
  
  saveRatings()
}

// 获取工具评分
const getToolRating = (toolId: string) => {
  return ratings.value.find(r => r.toolId === toolId)
}

// 获取用户评分列表
const userRatings = computed(() => ratings.value)

// 获取评分统计
const getRatingStats = () => {
  const totalRatings = ratings.value.length
  const averageRating = totalRatings > 0 
    ? ratings.value.reduce((sum, r) => sum + r.rating, 0) / totalRatings 
    : 0
  
  const ratingDistribution = [1, 2, 3, 4, 5].map(star => ({
    stars: star,
    count: ratings.value.filter(r => r.rating === star).length,
    percentage: totalRatings > 0 
      ? Math.round((ratings.value.filter(r => r.rating === star).length / totalRatings) * 100)
      : 0
  }))
  
  return {
    totalRatings,
    averageRating: Math.round(averageRating * 10) / 10,
    ratingDistribution
  }
}

// 删除评分
const removeRating = (toolId: string) => {
  const index = ratings.value.findIndex(r => r.toolId === toolId)
  if (index > -1) {
    ratings.value.splice(index, 1)
    saveRatings()
  }
}

// 清空所有评分
const clearRatings = () => {
  ratings.value = []
  saveRatings()
}

// 初始化时加载评分数据
loadRatings()

export function useRating() {
  return {
    ratings: computed(() => ratings.value),
    rateTool,
    getToolRating,
    userRatings,
    getRatingStats,
    removeRating,
    clearRatings,
    loadRatings
  }
}
