<template>
  <div 
    ref="element" 
    class="scroll-reveal"
    :class="{ 'scroll-reveal--visible': isVisible }"
    :style="{ '--animation-delay': delay + 'ms' }"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface Props {
  delay?: number
  threshold?: number
  rootMargin?: string
}

const props = withDefaults(defineProps<Props>(), {
  delay: 0,
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
})

const element = ref<HTMLElement>()
const isVisible = ref(false)

let observer: IntersectionObserver | null = null

onMounted(() => {
  if (!element.value) return
  
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          isVisible.value = true
          observer?.unobserve(entry.target)
        }
      })
    },
    {
      threshold: props.threshold,
      rootMargin: props.rootMargin
    }
  )
  
  observer.observe(element.value)
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
})
</script>

<style scoped>
.scroll-reveal {
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.6s ease-out;
  transition-delay: var(--animation-delay, 0ms);
}

.scroll-reveal--visible {
  opacity: 1;
  transform: translateY(0);
}

/* 不同的动画效果 */
.scroll-reveal[data-animation="fade"] {
  transform: none;
}

.scroll-reveal[data-animation="fade"]--visible {
  transform: none;
}

.scroll-reveal[data-animation="slide-left"] {
  transform: translateX(-30px);
}

.scroll-reveal[data-animation="slide-left"]--visible {
  transform: translateX(0);
}

.scroll-reveal[data-animation="slide-right"] {
  transform: translateX(30px);
}

.scroll-reveal[data-animation="slide-right"]--visible {
  transform: translateX(0);
}

.scroll-reveal[data-animation="scale"] {
  transform: scale(0.9);
}

.scroll-reveal[data-animation="scale"]--visible {
  transform: scale(1);
}

.scroll-reveal[data-animation="rotate"] {
  transform: rotate(-5deg);
}

.scroll-reveal[data-animation="rotate"]--visible {
  transform: rotate(0deg);
}
</style>
