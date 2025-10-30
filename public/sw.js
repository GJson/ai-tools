// 服务工作者 - 缓存策略和离线支持
const CACHE_NAME = 'ai-tools-v2'
const STATIC_CACHE = 'static-v2'
const DYNAMIC_CACHE = 'dynamic-v2'

// 需要缓存的静态资源
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico'
]

// 需要缓存的API路径
const API_CACHE_PATTERNS = [
  '/api/tools',
  '/api/categories',
  '/api/search'
]

// 不存在的资源黑名单
const NON_EXISTENT_RESOURCES = [
  '/icons/sprite.svg',
  '/images/logo.png',
  '/critical.css',
  '/non-critical.css',
  '/critical.js'
]

// 安装事件
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Caching static assets...')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log('Static assets cached successfully')
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error('Failed to cache static assets:', error)
      })
  )
})

// 激活事件
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('Service Worker activated')
        return self.clients.claim()
      })
  )
})

// 拦截请求
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // 只处理GET请求
  if (request.method !== 'GET') {
    return
  }
  
  // 直接忽略不存在的资源，避免404错误
  if (NON_EXISTENT_RESOURCES.includes(url.pathname)) {
    event.respondWith(new Response('', { status: 404 }))
    return
  }
  
  // 静态资源 - 缓存优先策略
  if (isStaticAsset(request)) {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          if (response) {
            return response
          }
          
          return fetch(request)
            .then((response) => {
              if (response.status === 200) {
                const responseClone = response.clone()
                caches.open(STATIC_CACHE)
                  .then((cache) => {
                    cache.put(request, responseClone)
                  })
              }
              return response
            })
        })
    )
    return
  }
  
  // API请求 - 网络优先策略
  if (isApiRequest(request)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone()
            caches.open(DYNAMIC_CACHE)
              .then((cache) => {
                cache.put(request, responseClone)
              })
          }
          return response
        })
        .catch(() => {
          // 网络失败时返回缓存
          return caches.match(request)
            .then((response) => {
              if (response) {
                return response
              }
              
              // 返回离线页面
              return caches.match('/offline.html')
            })
        })
    )
    return
  }
  
  // 页面请求 - 网络优先策略
  if (isPageRequest(request)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone()
            caches.open(DYNAMIC_CACHE)
              .then((cache) => {
                cache.put(request, responseClone)
              })
          }
          return response
        })
        .catch(() => {
          // 网络失败时返回缓存
          return caches.match(request)
            .then((response) => {
              if (response) {
                return response
              }
              
              // 返回首页
              return caches.match('/')
            })
        })
    )
    return
  }
  
  // 其他请求 - 网络优先策略
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.status === 200) {
          const responseClone = response.clone()
          caches.open(DYNAMIC_CACHE)
            .then((cache) => {
              cache.put(request, responseClone)
            })
        }
        return response
      })
      .catch(() => {
        return caches.match(request)
      })
  )
})

// 判断是否为静态资源
function isStaticAsset(request) {
  const url = new URL(request.url)
  
  // 检查是否在黑名单中
  if (NON_EXISTENT_RESOURCES.includes(url.pathname)) {
    return false
  }
  
  // 只处理确实存在的静态资源
  return (
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.woff') ||
    url.pathname.endsWith('.ttf') ||
    url.pathname.endsWith('.eot') ||
    url.pathname.endsWith('.ico') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.jpeg') ||
    url.pathname.endsWith('.gif') ||
    url.pathname.endsWith('.webp') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.svg')
  )
}

// 判断是否为API请求
function isApiRequest(request) {
  const url = new URL(request.url)
  
  return (
    url.pathname.startsWith('/api/') ||
    API_CACHE_PATTERNS.some(pattern => url.pathname.startsWith(pattern))
  )
}

// 判断是否为页面请求
function isPageRequest(request) {
  const url = new URL(request.url)
  
  return (
    request.headers.get('accept')?.includes('text/html') ||
    url.pathname === '/' ||
    url.pathname.startsWith('/tool/') ||
    url.pathname.startsWith('/category/') ||
    url.pathname.startsWith('/search')
  )
}

// 后台同步
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync())
  }
})

// 执行后台同步
async function doBackgroundSync() {
  try {
    // 这里可以执行一些后台任务
    console.log('Background sync executed')
  } catch (error) {
    console.error('Background sync failed:', error)
  }
}

// 推送通知
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json()
    const options = {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      tag: data.tag || 'ai-tools-notification',
      data: data.data || {},
      actions: data.actions || []
    }
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    )
  }
})

// 通知点击
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  
  const url = event.notification.data?.url || '/'
  
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then((clientList) => {
        // 如果已经有窗口打开，聚焦到该窗口
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus()
          }
        }
        
        // 否则打开新窗口
        if (clients.openWindow) {
          return clients.openWindow(url)
        }
      })
  )
})

// 消息处理
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    const urls = event.data.payload
    event.waitUntil(
      caches.open(DYNAMIC_CACHE)
        .then((cache) => {
          return cache.addAll(urls)
        })
    )
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys()
        .then((cacheNames) => {
          return Promise.all(
            cacheNames.map((cacheName) => {
              return caches.delete(cacheName)
            })
          )
        })
    )
  }
})

// 错误处理
self.addEventListener('error', (event) => {
  console.error('Service Worker error:', event.error)
})

self.addEventListener('unhandledrejection', (event) => {
  console.error('Service Worker unhandled rejection:', event.reason)
})