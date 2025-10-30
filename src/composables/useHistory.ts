import { ref } from 'vue'
import { useAuth } from './useAuth'

export function useHistory() {
  const { apiRequest } = useAuth()
  const isTracking = ref(false)

  // 追踪用户行为
  const track = async (action: string, targetType: string, targetId?: number, targetName?: string, metadata?: any) => {
    if (isTracking.value) return // 防止重复追踪
    
    try {
      isTracking.value = true
      
      await apiRequest('/history/track', {
        method: 'POST',
        body: JSON.stringify({
          action,
          targetType,
          targetId,
          targetName,
          metadata
        })
      })
    } catch (error) {
      console.error('追踪用户行为失败:', error)
    } finally {
      isTracking.value = false
    }
  }

  // 追踪页面浏览
  const trackPageView = (pageName: string, metadata?: any) => {
    track('view', 'page', undefined, pageName, metadata)
  }

  // 追踪工具浏览
  const trackToolView = (toolId: number, toolName: string, metadata?: any) => {
    track('view', 'tool', toolId, toolName, metadata)
  }

  // 追踪搜索
  const trackSearch = (query: string, resultsCount: number, filters?: any) => {
    track('search', 'search', undefined, query, {
      query,
      resultsCount,
      filters
    })
  }

  // 追踪收藏
  const trackFavorite = (toolId: number, toolName: string) => {
    track('favorite', 'tool', toolId, toolName)
  }

  // 追踪取消收藏
  const trackUnfavorite = (toolId: number, toolName: string) => {
    track('unfavorite', 'tool', toolId, toolName)
  }

  // 追踪评分
  const trackRating = (toolId: number, toolName: string, rating: number) => {
    track('rating', 'tool', toolId, toolName, { rating })
  }

  // 追踪评论
  const trackComment = (toolId: number, toolName: string, commentLength: number) => {
    track('comment', 'tool', toolId, toolName, { commentLength })
  }

  // 追踪下载
  const trackDownload = (toolId: number, toolName: string, downloadType: string) => {
    track('download', 'tool', toolId, toolName, { downloadType })
  }

  return {
    track,
    trackPageView,
    trackToolView,
    trackSearch,
    trackFavorite,
    trackUnfavorite,
    trackRating,
    trackComment,
    trackDownload,
    isTracking
  }
}