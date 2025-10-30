import { ref, onMounted, onUnmounted } from 'vue'
import { 
  performanceMonitor, 
  cacheManager, 
  getMemoryUsage, 
  getNetworkInfo,
  onVisibilityChange,
  detectLongTasks,
  debounce,
  throttle
} from '@/utils/performance'

export function usePerformance() {
  const isVisible = ref(!document.hidden)
  const isOnline = ref(navigator.onLine)
  const memoryUsage = ref<any>(null)
  const networkInfo = ref<any>(null)
  const longTasks = ref<Array<{ duration: number; timestamp: number }>>([])
  
  // 更新内存使用
  const updateMemoryUsage = () => {
    memoryUsage.value = getMemoryUsage()
  }
  
  // 更新网络信息
  const updateNetworkInfo = () => {
    networkInfo.value = getNetworkInfo()
  }
  
  // 处理长任务
  const handleLongTask = (duration: number) => {
    longTasks.value.push({
      duration,
      timestamp: Date.now()
    })
    
    // 只保留最近50个长任务
    if (longTasks.value.length > 50) {
      longTasks.value = longTasks.value.slice(-50)
    }
  }
  
  // 性能标记
  const mark = (name: string) => {
    performanceMonitor.mark(name)
  }
  
  // 性能测量
  const measure = (name: string, startMark: string, endMark?: string) => {
    return performanceMonitor.measure(name, startMark, endMark)
  }
  
  // 获取性能指标
  const getMetrics = (name: string) => {
    return performanceMonitor.getMetrics(name)
  }
  
  // 获取所有指标
  const getAllMetrics = () => {
    return performanceMonitor.getAllMetrics()
  }
  
  // 清除指标
  const clearMetrics = () => {
    performanceMonitor.clear()
    longTasks.value = []
  }
  
  // 缓存操作
  const setCache = (key: string, data: any, ttl?: number) => {
    cacheManager.set(key, data, ttl)
  }
  
  const getCache = (key: string) => {
    return cacheManager.get(key)
  }
  
  const hasCache = (key: string) => {
    return cacheManager.has(key)
  }
  
  const deleteCache = (key: string) => {
    cacheManager.delete(key)
  }
  
  const clearCache = () => {
    cacheManager.clear()
  }
  
  // 防抖函数
  const createDebounce = <T extends (...args: any[]) => any>(
    func: T,
    wait: number,
    immediate = false
  ) => {
    return debounce(func, wait, immediate)
  }
  
  // 节流函数
  const createThrottle = <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ) => {
    return throttle(func, limit)
  }
  
  // 页面可见性监听
  const setupVisibilityListener = () => {
    return onVisibilityChange((visible) => {
      isVisible.value = visible
    })
  }
  
  // 长任务监听
  const setupLongTaskListener = () => {
    return detectLongTasks(handleLongTask)
  }
  
  // 网络状态监听
  const setupNetworkListener = () => {
    const handleOnline = () => {
      isOnline.value = true
    }
    
    const handleOffline = () => {
      isOnline.value = false
    }
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }
  
  // 定期更新
  const setupPeriodicUpdate = () => {
    const updateInterval = setInterval(() => {
      updateMemoryUsage()
      updateNetworkInfo()
    }, 5000)
    
    return () => {
      clearInterval(updateInterval)
    }
  }
  
  // 初始化
  onMounted(() => {
    updateMemoryUsage()
    updateNetworkInfo()
    
    const cleanupVisibility = setupVisibilityListener()
    const cleanupLongTask = setupLongTaskListener()
    const cleanupNetwork = setupNetworkListener()
    const cleanupPeriodic = setupPeriodicUpdate()
    
    onUnmounted(() => {
      cleanupVisibility()
      cleanupLongTask()
      cleanupNetwork()
      cleanupPeriodic()
    })
  })
  
  return {
    // 状态
    isVisible,
    isOnline,
    memoryUsage,
    networkInfo,
    longTasks,
    
    // 性能监控
    mark,
    measure,
    getMetrics,
    getAllMetrics,
    clearMetrics,
    
    // 缓存管理
    setCache,
    getCache,
    hasCache,
    deleteCache,
    clearCache,
    
    // 工具函数
    createDebounce,
    createThrottle,
    
    // 更新函数
    updateMemoryUsage,
    updateNetworkInfo
  }
}

// 性能监控Hook
export function usePerformanceMonitor() {
  const { 
    mark, 
    measure, 
    getMetrics, 
    getAllMetrics, 
    clearMetrics 
  } = usePerformance()
  
  return {
    mark,
    measure,
    getMetrics,
    getAllMetrics,
    clearMetrics
  }
}

// 缓存管理Hook
export function useCache() {
  const { 
    setCache, 
    getCache, 
    hasCache, 
    deleteCache, 
    clearCache 
  } = usePerformance()
  
  return {
    setCache,
    getCache,
    hasCache,
    deleteCache,
    clearCache
  }
}

// 防抖Hook
export function useDebounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
) {
  const { createDebounce } = usePerformance()
  return createDebounce(func, wait, immediate)
}

// 节流Hook
export function useThrottle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
) {
  const { createThrottle } = usePerformance()
  return createThrottle(func, limit)
}