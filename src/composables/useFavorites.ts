import { ref, computed } from 'vue'
import type { AITool } from '@/types'

const favorites = ref<string[]>([])

// 从localStorage加载收藏列表
const loadFavorites = () => {
  const saved = localStorage.getItem('ai-tools-favorites')
  if (saved) {
    try {
      favorites.value = JSON.parse(saved)
    } catch (error) {
      console.error('Failed to load favorites:', error)
      favorites.value = []
    }
  }
}

// 保存收藏列表到localStorage
const saveFavorites = () => {
  localStorage.setItem('ai-tools-favorites', JSON.stringify(favorites.value))
}

// 添加收藏
const addFavorite = (toolId: string) => {
  if (!favorites.value.includes(toolId)) {
    favorites.value.push(toolId)
    saveFavorites()
  }
}

// 移除收藏
const removeFavorite = (toolId: string) => {
  const index = favorites.value.indexOf(toolId)
  if (index > -1) {
    favorites.value.splice(index, 1)
    saveFavorites()
  }
}

// 切换收藏状态
const toggleFavorite = (toolId: string) => {
  if (isFavorite(toolId)) {
    removeFavorite(toolId)
    return false
  } else {
    addFavorite(toolId)
    return true
  }
}

// 检查是否已收藏
const isFavorite = (toolId: string) => {
  return favorites.value.includes(toolId)
}

// 获取收藏的工具ID列表
const favoriteIds = computed(() => favorites.value)

// 清空所有收藏
const clearFavorites = () => {
  favorites.value = []
  saveFavorites()
}

// 根据工具列表获取收藏的工具
const getFavoriteTools = (allTools: AITool[]) => {
  return allTools.filter(tool => favorites.value.includes(tool.id))
}

// 初始化时加载收藏列表
loadFavorites()

export function useFavorites() {
  return {
    favorites: computed(() => favorites.value),
    favoriteIds,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    clearFavorites,
    getFavoriteTools,
    loadFavorites
  }
}
