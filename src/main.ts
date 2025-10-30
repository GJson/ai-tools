import { createApp, nextTick } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './style.css'
import './styles/mobile.css'
import { 
  preloadCriticalResources, 
  preconnectExternalDomains, 
  addResourceHints, 
  optimizeResourceLoading, 
  registerServiceWorker,
  lazyLoadImages
} from './utils/performance'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// 性能优化初始化
if (typeof window !== 'undefined') {
  // 预加载关键资源
  preloadCriticalResources()
  
  // 预连接到外部域名
  preconnectExternalDomains()
  
  // 添加资源提示
  addResourceHints()
  
  // 优化资源加载
  optimizeResourceLoading()
  
  // 注册服务工作者
  registerServiceWorker()
  
  // 初始化图片懒加载
  app.mount('#app')
  
  // 等待DOM更新后初始化懒加载
  nextTick(() => {
    lazyLoadImages()
  })
} else {
  app.mount('#app')
}
