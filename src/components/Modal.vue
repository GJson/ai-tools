<template>
  <Teleport to="body">
    <Transition name="modal" appear>
      <div v-if="visible" class="modal-overlay" @click="handleOverlayClick">
        <div class="modal-container" :class="[`modal-${size}`, { 'modal-fullscreen': fullscreen }]">
          <div class="modal-header" v-if="title || closable">
            <h3 v-if="title" class="modal-title">{{ title }}</h3>
            <button v-if="closable" @click="close" class="modal-close">
              <X class="close-icon" />
            </button>
          </div>
          
          <div class="modal-body">
            <slot />
          </div>
          
          <div class="modal-footer" v-if="$slots.footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { X } from 'lucide-vue-next'

interface Props {
  visible: boolean
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  fullscreen?: boolean
  closable?: boolean
  closeOnOverlay?: boolean
  closeOnEscape?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  closable: true,
  closeOnOverlay: true,
  closeOnEscape: true
})

const emit = defineEmits<{
  'update:visible': [value: boolean]
  close: []
}>()

const close = () => {
  emit('update:visible', false)
  emit('close')
}

const handleOverlayClick = (event: MouseEvent) => {
  if (props.closeOnOverlay && event.target === event.currentTarget) {
    close()
  }
}

const handleEscape = (event: KeyboardEvent) => {
  if (props.closeOnEscape && event.key === 'Escape') {
    close()
  }
}

watch(() => props.visible, (visible) => {
  if (visible) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-container {
  background-color: var(--bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 500px;
}

.modal-sm {
  max-width: 400px;
}

.modal-md {
  max-width: 500px;
}

.modal-lg {
  max-width: 700px;
}

.modal-xl {
  max-width: 900px;
}

.modal-fullscreen {
  max-width: 100vw;
  max-height: 100vh;
  width: 100vw;
  height: 100vh;
  border-radius: 0;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 1.5rem 0 1.5rem;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 1.5rem;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.modal-close {
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  cursor: pointer;
  color: var(--text-muted);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
}

.close-icon {
  width: 18px;
  height: 18px;
}

.modal-body {
  flex: 1;
  padding: 0 1.5rem;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid var(--border-color);
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

/* 动画 */
.modal-enter-active {
  transition: all 0.3s ease-out;
}

.modal-leave-active {
  transition: all 0.2s ease-in;
}

.modal-enter-from {
  opacity: 0;
  transform: scale(0.9) translateY(-20px);
}

.modal-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(-20px);
}

/* 移动端优化 */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 0.5rem;
  }
  
  .modal-container {
    max-height: 95vh;
  }
  
  .modal-header {
    padding: 1rem 1rem 0 1rem;
    margin-bottom: 1rem;
  }
  
  .modal-title {
    font-size: 1.125rem;
  }
  
  .modal-body {
    padding: 0 1rem;
  }
  
  .modal-footer {
    padding: 1rem;
    flex-direction: column;
  }
  
  .modal-fullscreen {
    padding: 0;
  }
  
  .modal-fullscreen .modal-header {
    padding: 1rem;
  }
  
  .modal-fullscreen .modal-body {
    padding: 0 1rem;
  }
  
  .modal-fullscreen .modal-footer {
    padding: 1rem;
  }
}
</style>
