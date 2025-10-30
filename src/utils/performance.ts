/**
 * 性能优化工具函数
 */

// 防抖函数
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      if (!immediate) func(...args)
    }
    
    const callNow = immediate && !timeout
    
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    
    if (callNow) func(...args)
  }
}

// 节流函数
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// 图片懒加载
export function lazyLoadImages() {
  const images = document.querySelectorAll('img[data-src]')
  
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement
        img.src = img.dataset.src || ''
        img.classList.remove('lazy')
        img.classList.add('loaded')
        observer.unobserve(img)
      }
    })
  })
  
  images.forEach(img => imageObserver.observe(img))
}

// 预加载关键资源
export function preloadCriticalResources() {
  const criticalResources = [
    '/fonts/inter.woff2'
  ]
  
  criticalResources.forEach(resource => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = resource
    link.as = resource.endsWith('.woff2') ? 'font' : 'image'
    if (resource.endsWith('.woff2')) {
      link.crossOrigin = 'anonymous'
    }
    document.head.appendChild(link)
  })
}

// 预连接到外部域名
export function preconnectExternalDomains() {
  const externalDomains = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://api.dicebear.com'
  ]
  
  externalDomains.forEach(domain => {
    const link = document.createElement('link')
    link.rel = 'preconnect'
    link.href = domain
    link.crossOrigin = 'anonymous'
    document.head.appendChild(link)
  })
}

// 资源提示
export function addResourceHints() {
  // DNS预解析
  const dnsPrefetchDomains = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://api.dicebear.com'
  ]
  
  dnsPrefetchDomains.forEach(domain => {
    const link = document.createElement('link')
    link.rel = 'dns-prefetch'
    link.href = domain
    document.head.appendChild(link)
  })
  
  // 预连接到关键API
  const apiLink = document.createElement('link')
  apiLink.rel = 'preconnect'
  apiLink.href = '/api'
  document.head.appendChild(apiLink)
}

// 虚拟滚动
export function createVirtualScroll<T>(
  container: HTMLElement,
  items: T[],
  itemHeight: number,
  renderItem: (item: T, index: number) => HTMLElement
) {
  const containerHeight = container.clientHeight
  const visibleCount = Math.ceil(containerHeight / itemHeight) + 2
  const totalHeight = items.length * itemHeight
  
  let scrollTop = 0
  let startIndex = 0
  let endIndex = Math.min(visibleCount, items.length)
  
  const scrollContainer = document.createElement('div')
  scrollContainer.style.height = `${totalHeight}px`
  scrollContainer.style.position = 'relative'
  
  const viewport = document.createElement('div')
  viewport.style.position = 'absolute'
  viewport.style.top = '0'
  viewport.style.left = '0'
  viewport.style.right = '0'
  viewport.style.height = `${containerHeight}px`
  viewport.style.overflow = 'hidden'
  
  container.appendChild(scrollContainer)
  scrollContainer.appendChild(viewport)
  
  function updateViewport() {
    startIndex = Math.floor(scrollTop / itemHeight)
    endIndex = Math.min(startIndex + visibleCount, items.length)
    
    viewport.innerHTML = ''
    viewport.style.transform = `translateY(${startIndex * itemHeight}px)`
    
    for (let i = startIndex; i < endIndex; i++) {
      const item = renderItem(items[i], i)
      item.style.position = 'absolute'
      item.style.top = '0'
      item.style.left = '0'
      item.style.right = '0'
      item.style.height = `${itemHeight}px`
      item.style.transform = `translateY(${(i - startIndex) * itemHeight}px)`
      viewport.appendChild(item)
    }
  }
  
  container.addEventListener('scroll', () => {
    scrollTop = container.scrollTop
    updateViewport()
  })
  
  updateViewport()
  
  return {
    updateItems: (newItems: T[]) => {
      items = newItems
      updateViewport()
    },
    destroy: () => {
      container.removeChild(scrollContainer)
    }
  }
}

// 图片压缩
export function compressImage(file: File, quality = 0.8): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const img = new Image()
    
    img.onload = () => {
      const maxWidth = 800
      const maxHeight = 600
      
      let { width, height } = img
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }
      }
      
      canvas.width = width
      canvas.height = height
      
      ctx.drawImage(img, 0, 0, width, height)
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            })
            resolve(compressedFile)
          } else {
            resolve(file)
          }
        },
        file.type,
        quality
      )
    }
    
    img.src = URL.createObjectURL(file)
  })
}

// 缓存管理
export class CacheManager {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()
  
  set(key: string, data: any, ttl = 5 * 60 * 1000) { // 默认5分钟
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }
  
  get(key: string): any | null {
    const item = this.cache.get(key)
    if (!item) return null
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return item.data
  }
  
  has(key: string): boolean {
    const item = this.cache.get(key)
    if (!item) return false
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return false
    }
    
    return true
  }
  
  delete(key: string) {
    this.cache.delete(key)
  }
  
  clear() {
    this.cache.clear()
  }
  
  size() {
    return this.cache.size
  }
}

// 性能监控
export class PerformanceMonitor {
  private metrics: Record<string, number[]> = {}
  
  mark(name: string) {
    performance.mark(name)
  }
  
  measure(name: string, startMark: string, endMark?: string) {
    if (endMark) {
      performance.measure(name, startMark, endMark)
    } else {
      performance.measure(name, startMark)
    }
    
    const entries = performance.getEntriesByName(name, 'measure')
    const duration = entries[entries.length - 1]?.duration || 0
    
    if (!this.metrics[name]) {
      this.metrics[name] = []
    }
    this.metrics[name].push(duration)
    
    return duration
  }
  
  getMetrics(name: string) {
    const values = this.metrics[name] || []
    if (values.length === 0) return null
    
    const sorted = [...values].sort((a, b) => a - b)
    const len = sorted.length
    
    return {
      count: len,
      min: sorted[0],
      max: sorted[len - 1],
      avg: values.reduce((a, b) => a + b, 0) / len,
      median: len % 2 === 0 
        ? (sorted[len / 2 - 1] + sorted[len / 2]) / 2
        : sorted[Math.floor(len / 2)],
      p95: sorted[Math.floor(len * 0.95)],
      p99: sorted[Math.floor(len * 0.99)]
    }
  }
  
  getAllMetrics() {
    const result: Record<string, any> = {}
    for (const name in this.metrics) {
      result[name] = this.getMetrics(name)
    }
    return result
  }
  
  clear() {
    this.metrics = {}
    performance.clearMarks()
    performance.clearMeasures()
  }
}

// 内存使用监控
export function getMemoryUsage() {
  if ('memory' in performance) {
    const memory = (performance as any).memory
    return {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      limit: memory.jsHeapSizeLimit,
      usage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
    }
  }
  return null
}

// 网络状态检测
export function getNetworkInfo() {
  if ('connection' in navigator) {
    const connection = (navigator as any).connection
    return {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData
    }
  }
  return null
}

// 页面可见性检测
export function onVisibilityChange(callback: (isVisible: boolean) => void) {
  const handleVisibilityChange = () => {
    callback(!document.hidden)
  }
  
  document.addEventListener('visibilitychange', handleVisibilityChange)
  
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  }
}

// 长任务检测
export function detectLongTasks(callback: (duration: number) => void) {
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) { // 超过50ms的任务
          callback(entry.duration)
        }
      }
    })
    
    observer.observe({ entryTypes: ['longtask'] })
    
    return () => observer.disconnect()
  }
  
  return () => {}
}

// 资源加载优化
export function optimizeResourceLoading() {
  // 注意：已移除对不存在资源的预加载
  // 这些资源在项目中不存在，会导致404错误
  console.log('Resource loading optimization disabled for non-existent resources')
}

// 服务工作者注册
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('SW registered: ', registration)
        })
        .catch(registrationError => {
          console.log('SW registration failed: ', registrationError)
        })
    })
  }
}

// 导出单例实例
export const cacheManager = new CacheManager()
export const performanceMonitor = new PerformanceMonitor()