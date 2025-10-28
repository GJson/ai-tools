<template>
  <Transition name="toast" appear>
    <div v-if="visible" class="toast" :class="[`toast-${type}`, { 'toast-closable': closable }]">
      <div class="toast-icon">
        <component :is="iconComponent" class="icon" />
      </div>
      <div class="toast-content">
        <h4 v-if="title" class="toast-title">{{ title }}</h4>
        <p class="toast-message">{{ message }}</p>
      </div>
      <button v-if="closable" @click="close" class="toast-close">
        <X class="close-icon" />
      </button>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { CheckCircle, AlertCircle, Info, XCircle, X } from 'lucide-vue-next'

interface Props {
  type?: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  duration?: number
  closable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  duration: 5000,
  closable: true
})

const emit = defineEmits<{
  close: []
}>()

const visible = ref(false)
let timer: NodeJS.Timeout | null = null

const iconComponent = computed(() => {
  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info
  }
  return icons[props.type]
})

const show = () => {
  visible.value = true
  if (props.duration > 0) {
    timer = setTimeout(() => {
      close()
    }, props.duration)
  }
}

const close = () => {
  visible.value = false
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
  emit('close')
}

onMounted(() => {
  show()
})

onUnmounted(() => {
  if (timer) {
    clearTimeout(timer)
  }
})

defineExpose({
  show,
  close
})
</script>

<style scoped>
.toast {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  max-width: 400px;
  min-width: 300px;
  position: relative;
  overflow: hidden;
}

.toast::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background-color: var(--primary-color);
}

.toast-success::before {
  background-color: var(--success-color);
}

.toast-error::before {
  background-color: var(--error-color);
}

.toast-warning::before {
  background-color: var(--warning-color);
}

.toast-info::before {
  background-color: var(--accent-color);
}

.toast-icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  margin-top: 0.125rem;
}

.toast-icon .icon {
  width: 100%;
  height: 100%;
  color: var(--primary-color);
}

.toast-success .toast-icon .icon {
  color: var(--success-color);
}

.toast-error .toast-icon .icon {
  color: var(--error-color);
}

.toast-warning .toast-icon .icon {
  color: var(--warning-color);
}

.toast-info .toast-icon .icon {
  color: var(--accent-color);
}

.toast-content {
  flex: 1;
  min-width: 0;
}

.toast-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
  line-height: 1.4;
}

.toast-message {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.4;
}

.toast-close {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border: none;
  background: none;
  cursor: pointer;
  color: var(--text-muted);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  margin-top: -0.125rem;
}

.toast-close:hover {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
}

.close-icon {
  width: 16px;
  height: 16px;
}

/* 动画 */
.toast-enter-active {
  transition: all 0.3s ease-out;
}

.toast-leave-active {
  transition: all 0.2s ease-in;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

/* 移动端优化 */
@media (max-width: 768px) {
  .toast {
    min-width: 280px;
    max-width: calc(100vw - 2rem);
    padding: 0.875rem;
  }
  
  .toast-title {
    font-size: 0.8125rem;
  }
  
  .toast-message {
    font-size: 0.75rem;
  }
  
  .toast-icon {
    width: 18px;
    height: 18px;
  }
  
  .toast-close {
    width: 20px;
    height: 20px;
  }
  
  .close-icon {
    width: 14px;
    height: 14px;
  }
}
</style>
