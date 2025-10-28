<template>
  <div class="toast-container">
    <TransitionGroup name="toast-list" tag="div" class="toast-list">
      <Toast
        v-for="toast in toasts"
        :key="toast.id"
        :type="toast.type"
        :title="toast.title"
        :message="toast.message"
        :duration="0"
        :closable="toast.closable"
        @close="removeToast(toast.id)"
      />
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { useToast } from '@/composables/useToast'
import Toast from './Toast.vue'

const { toasts, removeToast } = useToast()
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 10000;
  pointer-events: none;
}

.toast-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  pointer-events: auto;
}

/* 列表动画 */
.toast-list-enter-active,
.toast-list-leave-active {
  transition: all 0.3s ease;
}

.toast-list-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-list-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-list-move {
  transition: transform 0.3s ease;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .toast-container {
    top: 0.5rem;
    right: 0.5rem;
    left: 0.5rem;
  }
  
  .toast-list {
    gap: 0.5rem;
  }
}
</style>
