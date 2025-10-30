<template>
  <div v-if="showMonitor" class="performance-monitor">
    <div class="monitor-header">
      <h3 class="monitor-title">性能监控</h3>
      <div class="monitor-controls">
        <button @click="toggleExpanded" class="toggle-btn">
          <ChevronDown v-if="!isExpanded" class="icon" :size="16" />
          <ChevronUp v-else class="icon" :size="16" />
        </button>
        <button @click="clearMetrics" class="clear-btn">
          <Trash2 class="icon" :size="16" />
        </button>
        <button @click="closeMonitor" class="close-btn">
          <X class="icon" :size="16" />
        </button>
      </div>
    </div>
    
    <div v-if="isExpanded" class="monitor-content">
      <!-- 核心指标 -->
      <div class="metrics-section">
        <h4 class="section-title">核心指标</h4>
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-label">FCP</div>
            <div class="metric-value">{{ fcp }}ms</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">LCP</div>
            <div class="metric-value">{{ lcp }}ms</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">FID</div>
            <div class="metric-value">{{ fid }}ms</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">CLS</div>
            <div class="metric-value">{{ cls }}</div>
          </div>
        </div>
      </div>
      
      <!-- 内存使用 -->
      <div v-if="memoryUsage" class="metrics-section">
        <h4 class="section-title">内存使用</h4>
        <div class="memory-info">
          <div class="memory-item">
            <span class="memory-label">已使用:</span>
            <span class="memory-value">{{ formatBytes(memoryUsage.used) }}</span>
          </div>
          <div class="memory-item">
            <span class="memory-label">总计:</span>
            <span class="memory-value">{{ formatBytes(memoryUsage.total) }}</span>
          </div>
          <div class="memory-item">
            <span class="memory-label">限制:</span>
            <span class="memory-value">{{ formatBytes(memoryUsage.limit) }}</span>
          </div>
          <div class="memory-item">
            <span class="memory-label">使用率:</span>
            <span class="memory-value">{{ memoryUsage.usage.toFixed(1) }}%</span>
          </div>
        </div>
        <div class="memory-bar">
          <div 
            class="memory-fill" 
            :style="{ width: memoryUsage.usage + '%' }"
            :class="{ 'warning': memoryUsage.usage > 80, 'danger': memoryUsage.usage > 90 }"
          ></div>
        </div>
      </div>
      
      <!-- 网络信息 -->
      <div v-if="networkInfo" class="metrics-section">
        <h4 class="section-title">网络信息</h4>
        <div class="network-info">
          <div class="network-item">
            <span class="network-label">连接类型:</span>
            <span class="network-value">{{ networkInfo.effectiveType }}</span>
          </div>
          <div class="network-item">
            <span class="network-label">下载速度:</span>
            <span class="network-value">{{ networkInfo.downlink }} Mbps</span>
          </div>
          <div class="network-item">
            <span class="network-label">往返时间:</span>
            <span class="network-value">{{ networkInfo.rtt }}ms</span>
          </div>
          <div class="network-item">
            <span class="network-label">节省数据:</span>
            <span class="network-value">{{ networkInfo.saveData ? '是' : '否' }}</span>
          </div>
        </div>
      </div>
      
      <!-- 自定义指标 -->
      <div v-if="customMetrics.length > 0" class="metrics-section">
        <h4 class="section-title">自定义指标</h4>
        <div class="custom-metrics">
          <div 
            v-for="metric in customMetrics" 
            :key="metric.name"
            class="custom-metric"
          >
            <div class="metric-header">
              <span class="metric-name">{{ metric.name }}</span>
              <span class="metric-count">{{ metric.count }} 次</span>
            </div>
            <div class="metric-stats">
              <div class="stat-item">
                <span class="stat-label">平均:</span>
                <span class="stat-value">{{ metric.avg.toFixed(2) }}ms</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">最小:</span>
                <span class="stat-value">{{ metric.min.toFixed(2) }}ms</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">最大:</span>
                <span class="stat-value">{{ metric.max.toFixed(2) }}ms</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">P95:</span>
                <span class="stat-value">{{ metric.p95.toFixed(2) }}ms</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 长任务 -->
      <div v-if="longTasks.length > 0" class="metrics-section">
        <h4 class="section-title">长任务 ({{ longTasks.length }})</h4>
        <div class="long-tasks">
          <div 
            v-for="(task, index) in longTasks.slice(-10)" 
            :key="index"
            class="long-task"
          >
            <span class="task-duration">{{ task.duration.toFixed(2) }}ms</span>
            <span class="task-time">{{ formatTime(task.timestamp) }}</span>
          </div>
        </div>
      </div>
      
      <!-- 页面可见性 -->
      <div class="metrics-section">
        <h4 class="section-title">页面状态</h4>
        <div class="page-status">
          <div class="status-item">
            <span class="status-label">可见性:</span>
            <span class="status-value" :class="{ 'active': isPageVisible }">
              {{ isPageVisible ? '可见' : '隐藏' }}
            </span>
          </div>
          <div class="status-item">
            <span class="status-label">在线状态:</span>
            <span class="status-value" :class="{ 'active': isOnline }">
              {{ isOnline ? '在线' : '离线' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ChevronDown, ChevronUp, Trash2, X } from 'lucide-vue-next'
import { 
  performanceMonitor, 
  getMemoryUsage, 
  getNetworkInfo,
  onVisibilityChange,
  detectLongTasks
} from '@/utils/performance'

interface Props {
  show?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  show: false
})

const emit = defineEmits<{
  close: []
}>()

// 响应式数据
const showMonitor = ref(props.show)
const isExpanded = ref(true)
const fcp = ref(0)
const lcp = ref(0)
const fid = ref(0)
const cls = ref(0)
const memoryUsage = ref<any>(null)
const networkInfo = ref<any>(null)
const customMetrics = ref<any[]>([])
const longTasks = ref<Array<{ duration: number; timestamp: number }>>([])
const isPageVisible = ref(!document.hidden)
const isOnline = ref(navigator.onLine)

// 计算属性
const isExpandedComputed = computed(() => isExpanded.value)

// 方法
const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString()
}

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
}

const clearMetrics = () => {
  performanceMonitor.clear()
  customMetrics.value = []
  longTasks.value = []
}

const closeMonitor = () => {
  showMonitor.value = false
  emit('close')
}

const updateMetrics = () => {
  // 更新内存使用
  memoryUsage.value = getMemoryUsage()
  
  // 更新网络信息
  networkInfo.value = getNetworkInfo()
  
  // 更新自定义指标
  const metrics = performanceMonitor.getAllMetrics()
  customMetrics.value = Object.entries(metrics)
    .map(([name, data]) => ({ name, ...data }))
    .filter(metric => metric.count > 0)
}

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

// 生命周期
onMounted(() => {
  // 获取Core Web Vitals
  if ('PerformanceObserver' in window) {
    // FCP
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          fcp.value = Math.round(entry.startTime)
        }
      }
    }).observe({ entryTypes: ['paint'] })
    
    // LCP
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      lcp.value = Math.round(lastEntry.startTime)
    }).observe({ entryTypes: ['largest-contentful-paint'] })
    
    // FID
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        fid.value = Math.round(entry.processingStart - entry.startTime)
      }
    }).observe({ entryTypes: ['first-input'] })
    
    // CLS
    let clsValue = 0
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value
          cls.value = Math.round(clsValue * 1000) / 1000
        }
      }
    }).observe({ entryTypes: ['layout-shift'] })
  }
  
  // 设置页面可见性监听
  onVisibilityChange((visible) => {
    isPageVisible.value = visible
  })
  
  // 设置在线状态监听
  window.addEventListener('online', () => {
    isOnline.value = true
  })
  
  window.addEventListener('offline', () => {
    isOnline.value = false
  })
  
  // 设置长任务监听
  const stopLongTaskDetection = detectLongTasks(handleLongTask)
  
  // 定期更新指标
  const updateInterval = setInterval(updateMetrics, 1000)
  
  // 初始更新
  updateMetrics()
  
  // 清理函数
  onUnmounted(() => {
    clearInterval(updateInterval)
    stopLongTaskDetection()
  })
})

// 监听props变化
watch(() => props.show, (newValue) => {
  showMonitor.value = newValue
})
</script>

<style scoped>
.performance-monitor {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 320px;
  max-height: 80vh;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  z-index: 9999;
  overflow: hidden;
}

.monitor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.monitor-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.monitor-controls {
  display: flex;
  gap: 0.5rem;
}

.toggle-btn,
.clear-btn,
.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
}

.toggle-btn:hover,
.clear-btn:hover,
.close-btn:hover {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
}

.monitor-content {
  max-height: 60vh;
  overflow-y: auto;
  padding: 1rem;
}

.metrics-section {
  margin-bottom: 1.5rem;
}

.metrics-section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.75rem 0;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

.metric-card {
  padding: 0.75rem;
  background-color: var(--bg-tertiary);
  border-radius: var(--radius-md);
  text-align: center;
}

.metric-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-bottom: 0.25rem;
}

.metric-value {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.memory-info,
.network-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.memory-item,
.network-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
}

.memory-label,
.network-label {
  color: var(--text-muted);
}

.memory-value,
.network-value {
  color: var(--text-primary);
  font-weight: 500;
}

.memory-bar {
  width: 100%;
  height: 8px;
  background-color: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.memory-fill {
  height: 100%;
  background-color: var(--success-color);
  transition: width 0.3s ease;
}

.memory-fill.warning {
  background-color: var(--warning-color);
}

.memory-fill.danger {
  background-color: var(--error-color);
}

.custom-metrics {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.custom-metric {
  padding: 0.75rem;
  background-color: var(--bg-tertiary);
  border-radius: var(--radius-md);
}

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.metric-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
}

.metric-count {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.metric-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
}

.stat-label {
  color: var(--text-muted);
}

.stat-value {
  color: var(--text-primary);
  font-weight: 500;
}

.long-tasks {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 120px;
  overflow-y: auto;
}

.long-task {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background-color: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
}

.task-duration {
  color: var(--error-color);
  font-weight: 500;
}

.task-time {
  color: var(--text-muted);
}

.page-status {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.status-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
}

.status-label {
  color: var(--text-muted);
}

.status-value {
  color: var(--text-primary);
  font-weight: 500;
}

.status-value.active {
  color: var(--success-color);
}

/* 移动端优化 */
@media (max-width: 768px) {
  .performance-monitor {
    top: 10px;
    right: 10px;
    left: 10px;
    width: auto;
    max-height: 70vh;
  }
  
  .metrics-grid {
    grid-template-columns: 1fr;
  }
  
  .metric-stats {
    grid-template-columns: 1fr;
  }
}

/* 滚动条样式 */
.monitor-content::-webkit-scrollbar,
.long-tasks::-webkit-scrollbar {
  width: 4px;
}

.monitor-content::-webkit-scrollbar-track,
.long-tasks::-webkit-scrollbar-track {
  background: var(--bg-tertiary);
}

.monitor-content::-webkit-scrollbar-thumb,
.long-tasks::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 2px;
}

.monitor-content::-webkit-scrollbar-thumb:hover,
.long-tasks::-webkit-scrollbar-thumb:hover {
  background: var(--text-muted);
}
</style>