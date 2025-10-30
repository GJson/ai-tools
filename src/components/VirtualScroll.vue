<template>
  <div 
    ref="containerRef"
    class="virtual-scroll-container"
    @scroll="handleScroll"
  >
    <div 
      class="virtual-scroll-content"
      :style="{ height: totalHeight + 'px' }"
    >
      <div 
        class="virtual-scroll-viewport"
        :style="{ 
          transform: `translateY(${offsetY}px)`,
          height: containerHeight + 'px'
        }"
      >
        <div
          v-for="(item, index) in visibleItems"
          :key="getItemKey(item, startIndex + index)"
          class="virtual-scroll-item"
          :style="{ height: itemHeight + 'px' }"
        >
          <slot 
            :item="item" 
            :index="startIndex + index"
            :isVisible="true"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'

interface Props<T> {
  items: T[]
  itemHeight: number
  containerHeight?: number
  overscan?: number
  keyField?: keyof T | ((item: T, index: number) => string | number)
  threshold?: number
}

const props = withDefaults(defineProps<Props<any>>(), {
  containerHeight: 400,
  overscan: 5,
  keyField: 'id',
  threshold: 0.1
})

const emit = defineEmits<{
  scroll: [scrollTop: number, scrollLeft: number]
  visibleChange: [visibleItems: any[], startIndex: number, endIndex: number]
}>()

const containerRef = ref<HTMLElement>()
const scrollTop = ref(0)
const containerHeight = ref(props.containerHeight)

// 计算可见区域
const startIndex = computed(() => {
  return Math.max(0, Math.floor(scrollTop.value / props.itemHeight) - props.overscan)
})

const endIndex = computed(() => {
  const visibleCount = Math.ceil(containerHeight.value / props.itemHeight)
  return Math.min(
    props.items.length,
    startIndex.value + visibleCount + props.overscan * 2
  )
})

const visibleItems = computed(() => {
  return props.items.slice(startIndex.value, endIndex.value)
})

const totalHeight = computed(() => {
  return props.items.length * props.itemHeight
})

const offsetY = computed(() => {
  return startIndex.value * props.itemHeight
})

// 获取项目key
const getItemKey = (item: any, index: number): string | number => {
  if (typeof props.keyField === 'function') {
    return props.keyField(item, index)
  }
  return item[props.keyField] || index
}

// 滚动处理
const handleScroll = (event: Event) => {
  const target = event.target as HTMLElement
  scrollTop.value = target.scrollTop
  
  emit('scroll', target.scrollTop, target.scrollLeft)
  emit('visibleChange', visibleItems.value, startIndex.value, endIndex.value)
}

// 滚动到指定位置
const scrollTo = (index: number) => {
  if (!containerRef.value) return
  
  const targetScrollTop = index * props.itemHeight
  containerRef.value.scrollTop = targetScrollTop
}

// 滚动到顶部
const scrollToTop = () => {
  if (!containerRef.value) return
  containerRef.value.scrollTop = 0
}

// 滚动到底部
const scrollToBottom = () => {
  if (!containerRef.value) return
  containerRef.value.scrollTop = totalHeight.value
}

// 获取可见项目范围
const getVisibleRange = () => {
  return {
    start: startIndex.value,
    end: endIndex.value,
    count: endIndex.value - startIndex.value
  }
}

// 更新容器高度
const updateContainerHeight = () => {
  if (!containerRef.value) return
  containerHeight.value = containerRef.value.clientHeight
}

// 监听窗口大小变化
const handleResize = () => {
  updateContainerHeight()
}

// 监听items变化
watch(() => props.items, () => {
  nextTick(() => {
    updateContainerHeight()
  })
})

onMounted(() => {
  updateContainerHeight()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// 暴露方法
defineExpose({
  scrollTo,
  scrollToTop,
  scrollToBottom,
  getVisibleRange,
  updateContainerHeight
})
</script>

<style scoped>
.virtual-scroll-container {
  height: 100%;
  overflow: auto;
  position: relative;
}

.virtual-scroll-content {
  position: relative;
  width: 100%;
}

.virtual-scroll-viewport {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  overflow: hidden;
}

.virtual-scroll-item {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
}

/* 滚动条样式 */
.virtual-scroll-container::-webkit-scrollbar {
  width: 8px;
}

.virtual-scroll-container::-webkit-scrollbar-track {
  background: var(--bg-tertiary);
  border-radius: 4px;
}

.virtual-scroll-container::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 4px;
}

.virtual-scroll-container::-webkit-scrollbar-thumb:hover {
  background: var(--text-muted);
}

/* 移动端优化 */
@media (max-width: 768px) {
  .virtual-scroll-container::-webkit-scrollbar {
    width: 4px;
  }
}

/* 减少动画模式 */
@media (prefers-reduced-motion: reduce) {
  .virtual-scroll-viewport {
    transition: none;
  }
}

/* 高对比度模式 */
@media (prefers-contrast: high) {
  .virtual-scroll-container::-webkit-scrollbar-thumb {
    background: var(--text-primary);
  }
}
</style>