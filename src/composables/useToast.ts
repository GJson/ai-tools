import { ref, reactive } from 'vue'
import type { Component } from 'vue'

interface ToastOptions {
  type?: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  duration?: number
  closable?: boolean
}

interface ToastInstance extends ToastOptions {
  id: string
  component?: Component
}

const toasts = ref<ToastInstance[]>([])

export function useToast() {
  const addToast = (options: ToastOptions) => {
    const id = Math.random().toString(36).substr(2, 9)
    const toast: ToastInstance = {
      id,
      type: 'info',
      duration: 5000,
      closable: true,
      ...options
    }
    
    toasts.value.push(toast)
    
    // 自动移除
    if (toast.duration && toast.duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, toast.duration)
    }
    
    return id
  }
  
  const removeToast = (id: string) => {
    const index = toasts.value.findIndex(toast => toast.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }
  
  const clearAll = () => {
    toasts.value = []
  }
  
  // 便捷方法
  const success = (message: string, options?: Partial<ToastOptions>) => {
    return addToast({ ...options, type: 'success', message })
  }
  
  const error = (message: string, options?: Partial<ToastOptions>) => {
    return addToast({ ...options, type: 'error', message })
  }
  
  const warning = (message: string, options?: Partial<ToastOptions>) => {
    return addToast({ ...options, type: 'warning', message })
  }
  
  const info = (message: string, options?: Partial<ToastOptions>) => {
    return addToast({ ...options, type: 'info', message })
  }
  
  return {
    toasts: toasts.value,
    addToast,
    removeToast,
    clearAll,
    success,
    error,
    warning,
    info
  }
}
