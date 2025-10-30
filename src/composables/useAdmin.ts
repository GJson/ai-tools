import { ref, computed } from 'vue'
import { useAuth } from './useAuth'

// 简单的管理员权限检查
// 在实际项目中，这应该从后端API获取用户权限信息
const isAdmin = ref(false)

export const useAdmin = () => {
  const { user } = useAuth()
  
  // 检查用户是否为管理员
  // 这里使用简单的邮箱后缀检查，实际项目中应该从用户数据中获取角色信息
  const checkAdminStatus = () => {
    if (user.value) {
      // 简单的管理员检查逻辑
      // 在实际项目中，这应该从用户数据中的role字段或isAdmin字段获取
      const adminEmails = [
        'admin@example.com',
        'administrator@example.com',
        'wangshu@example.com' // 临时添加一个测试邮箱
      ]
      
      isAdmin.value = adminEmails.includes(user.value.email?.toLowerCase() || '')
    } else {
      isAdmin.value = false
    }
  }
  
  // 监听用户变化
  const adminStatus = computed(() => {
    checkAdminStatus()
    return isAdmin.value
  })
  
  return {
    isAdmin: adminStatus,
    checkAdminStatus
  }
}