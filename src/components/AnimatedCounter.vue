<template>
  <span class="animated-counter">{{ displayValue }}</span>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

interface Props {
  value: number
  duration?: number
  prefix?: string
  suffix?: string
  decimals?: number
}

const props = withDefaults(defineProps<Props>(), {
  duration: 2000,
  prefix: '',
  suffix: '',
  decimals: 0
})

const displayValue = ref(props.prefix + '0' + props.suffix)
let animationId: number | null = null

const animate = (start: number, end: number, duration: number) => {
  const startTime = performance.now()
  
  const update = (currentTime: number) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    
    // 使用缓动函数
    const easeOutCubic = 1 - Math.pow(1 - progress, 3)
    const current = start + (end - start) * easeOutCubic
    
    displayValue.value = props.prefix + current.toFixed(props.decimals) + props.suffix
    
    if (progress < 1) {
      animationId = requestAnimationFrame(update)
    }
  }
  
  animationId = requestAnimationFrame(update)
}

const startAnimation = () => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  animate(0, props.value, props.duration)
}

watch(() => props.value, () => {
  startAnimation()
})

onMounted(() => {
  startAnimation()
})
</script>

<style scoped>
.animated-counter {
  font-weight: 600;
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
}
</style>
