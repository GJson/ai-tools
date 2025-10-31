import { ref, computed } from 'vue'

interface User {
  id: number
  uuid: string
  username: string
  email: string
  avatar?: string
  is_active: boolean
  email_verified: boolean
  last_login_at: string
  created_at: string
  updated_at: string
}

interface LoginCredentials {
  email: string
  password: string
}

interface RegisterData {
  username: string
  email: string
  verificationCode: string
  password: string
}

interface AuthResponse {
  success: boolean
  message?: string
  error?: string
  data?: {
    user: User
    accessToken: string
    refreshToken: string
    expiresIn: string
  }
}

const user = ref<User | null>(null)
const isAuthenticated = computed(() => !!user.value)
const isLoading = ref(false)
const accessToken = ref<string | null>(null)
const refreshToken = ref<string | null>(null)

// API基础URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://gjson.co/api'

// 从localStorage加载用户信息
const loadUser = () => {
  const savedUser = localStorage.getItem('ai-tools-user')
  const savedAccessToken = localStorage.getItem('ai-tools-access-token')
  const savedRefreshToken = localStorage.getItem('ai-tools-refresh-token')
  
  if (savedUser && savedAccessToken) {
    try {
      user.value = JSON.parse(savedUser)
      accessToken.value = savedAccessToken
      refreshToken.value = savedRefreshToken
    } catch (error) {
      console.error('Failed to load user data:', error)
      clearAuth()
    }
  }
}

// 更新用户信息（用于资料编辑后更新）
const updateUser = (updatedData: Partial<User>) => {
  if (user.value) {
    user.value = { ...user.value, ...updatedData }
    localStorage.setItem('ai-tools-user', JSON.stringify(user.value))
  }
}

// 清除认证信息
const clearAuth = () => {
  user.value = null
  accessToken.value = null
  refreshToken.value = null
  localStorage.removeItem('ai-tools-user')
  localStorage.removeItem('ai-tools-access-token')
  localStorage.removeItem('ai-tools-refresh-token')
}

// API请求辅助函数
const apiRequest = async (url: string, options: RequestInit = {}) => {
  const headers: Record<string, string> = {
    ...options.headers,
  }

  // 只在需要时添加Content-Type，避免触发预检请求
  if (options.method && ['POST', 'PUT', 'PATCH'].includes(options.method)) {
    headers['Content-Type'] = 'application/json'
  }

  if (accessToken.value) {
    headers['Authorization'] = `Bearer ${accessToken.value}`
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
    // 同域名请求不需要credentials
    credentials: 'same-origin'
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
  }

  return response.json()
}

// 验证token
const verifyToken = async (token: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      credentials: 'same-origin'
    })
    return response.ok
  } catch {
    return false
  }
}

// 刷新访问令牌
const refreshAccessToken = async (): Promise<boolean> => {
  if (!refreshToken.value) return false

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refreshToken: refreshToken.value }),
      credentials: 'same-origin'
    })

    if (response.ok) {
      const data = await response.json()
      accessToken.value = data.accessToken
      refreshToken.value = data.refreshToken
      localStorage.setItem('ai-tools-access-token', data.accessToken)
      localStorage.setItem('ai-tools-refresh-token', data.refreshToken)
      return true
    }
  } catch (error) {
    console.error('Token refresh failed:', error)
  }

  return false
}

// 登录
const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    isLoading.value = true
    
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    })

    if (data.success) {
      user.value = data.data.user
      accessToken.value = data.data.accessToken
      refreshToken.value = data.data.refreshToken
      
      // 保存到localStorage
      localStorage.setItem('ai-tools-user', JSON.stringify(data.data.user))
      localStorage.setItem('ai-tools-access-token', data.data.accessToken)
      localStorage.setItem('ai-tools-refresh-token', data.data.refreshToken)
    }

    return data
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '登录失败'
    }
  } finally {
    isLoading.value = false
  }
}

// 注册
const register = async (userData: RegisterData): Promise<AuthResponse> => {
  try {
    isLoading.value = true
    
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    })

    if (data.success) {
      user.value = data.data.user
      accessToken.value = data.data.accessToken
      refreshToken.value = data.data.refreshToken
      
      // 保存到localStorage
      localStorage.setItem('ai-tools-user', JSON.stringify(data.data.user))
      localStorage.setItem('ai-tools-access-token', data.data.accessToken)
      localStorage.setItem('ai-tools-refresh-token', data.data.refreshToken)
    }

    return data
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '注册失败'
    }
  } finally {
    isLoading.value = false
  }
}

// 登出
const logout = async (): Promise<void> => {
  try {
    if (accessToken.value) {
      await apiRequest('/auth/logout', {
        method: 'POST'
      })
    }
  } catch (error) {
    console.error('Logout error:', error)
  } finally {
    clearAuth()
  }
}

// 初始化时加载用户信息
loadUser()

export const useAuth = () => {
  return {
    user,
    isAuthenticated,
    isLoading,
    accessToken,
    login,
    register,
    logout,
    updateUser,
    apiRequest
  }
}

export {
  user,
  isAuthenticated,
  isLoading,
  accessToken,
  login,
  register,
  logout,
  apiRequest
}
