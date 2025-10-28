import { ref, computed } from 'vue'
import type { AITool } from '@/types'

interface HistoryItem {
  toolId: string
  toolName: string
  toolCategory: string
  visitedAt: string
  visitCount: number
}

const history = ref<HistoryItem[]>([])

// 从localStorage加载历史记录
const loadHistory = () => {
  const saved = localStorage.getItem('ai-tools-history')
  if (saved) {
    try {
      history.value = JSON.parse(saved)
    } catch (error) {
      console.error('Failed to load history:', error)
      history.value = []
    }
  }
}

// 保存历史记录到localStorage
const saveHistory = () => {
  localStorage.setItem('ai-tools-history', JSON.stringify(history.value))
}

// 添加访问记录
const addVisit = (tool: AITool) => {
  const existingIndex = history.value.findIndex(item => item.toolId === tool.id)
  
  if (existingIndex > -1) {
    // 更新现有记录
    history.value[existingIndex].visitCount += 1
    history.value[existingIndex].visitedAt = new Date().toISOString()
  } else {
    // 添加新记录
    const newItem: HistoryItem = {
      toolId: tool.id,
      toolName: tool.name,
      toolCategory: tool.category,
      visitedAt: new Date().toISOString(),
      visitCount: 1
    }
    history.value.unshift(newItem)
  }
  
  // 限制历史记录数量
  if (history.value.length > 100) {
    history.value = history.value.slice(0, 100)
  }
  
  saveHistory()
}

// 移除历史记录
const removeFromHistory = (toolId: string) => {
  const index = history.value.findIndex(item => item.toolId === toolId)
  if (index > -1) {
    history.value.splice(index, 1)
    saveHistory()
  }
}

// 清空历史记录
const clearHistory = () => {
  history.value = []
  saveHistory()
}

// 获取最近访问的工具
const getRecentTools = (limit = 10) => {
  return history.value
    .sort((a, b) => new Date(b.visitedAt).getTime() - new Date(a.visitedAt).getTime())
    .slice(0, limit)
}

// 获取最常访问的工具
const getMostVisitedTools = (limit = 10) => {
  return history.value
    .sort((a, b) => b.visitCount - a.visitCount)
    .slice(0, limit)
}

// 获取按分类分组的访问记录
const getHistoryByCategory = () => {
  const grouped: Record<string, HistoryItem[]> = {}
  
  history.value.forEach(item => {
    if (!grouped[item.toolCategory]) {
      grouped[item.toolCategory] = []
    }
    grouped[item.toolCategory].push(item)
  })
  
  return grouped
}

// 获取访问统计
const getVisitStats = () => {
  const totalVisits = history.value.reduce((sum, item) => sum + item.visitCount, 0)
  const uniqueTools = history.value.length
  const categories = new Set(history.value.map(item => item.toolCategory)).size
  
  return {
    totalVisits,
    uniqueTools,
    categories,
    averageVisitsPerTool: uniqueTools > 0 ? Math.round(totalVisits / uniqueTools * 10) / 10 : 0
  }
}

// 历史记录列表
const historyList = computed(() => history.value)

// 初始化时加载历史记录
loadHistory()

export function useHistory() {
  return {
    history: historyList,
    addVisit,
    removeFromHistory,
    clearHistory,
    getRecentTools,
    getMostVisitedTools,
    getHistoryByCategory,
    getVisitStats,
    loadHistory
  }
}
