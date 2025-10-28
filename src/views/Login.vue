<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <div class="logo">
          <div class="logo-icon">
            <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
              <path d="M16 2L20 8H28L24 14L28 20H20L16 26L12 20H4L8 14L4 8H12L16 2Z" fill="currentColor"/>
            </svg>
          </div>
          <span class="logo-text">AI工具集</span>
        </div>
        <h1 class="login-title">欢迎回来</h1>
        <p class="login-subtitle">登录以享受个性化体验</p>
      </div>

      <div class="login-form">
        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <label for="email" class="form-label">邮箱地址</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              class="form-input"
              :class="{ 'form-input--error': errors.email }"
              placeholder="请输入邮箱地址"
              required
            />
            <span v-if="errors.email" class="form-error">{{ errors.email }}</span>
          </div>

          <div class="form-group">
            <label for="password" class="form-label">密码</label>
            <div class="password-input">
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                class="form-input"
                :class="{ 'form-input--error': errors.password }"
                placeholder="请输入密码"
                required
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="password-toggle"
              >
                <Eye v-if="!showPassword" class="eye-icon" :size="20" />
                <EyeOff v-else class="eye-icon" :size="20" />
              </button>
            </div>
            <span v-if="errors.password" class="form-error">{{ errors.password }}</span>
          </div>

          <div class="form-options">
            <label class="checkbox-label">
              <input v-model="form.remember" type="checkbox" class="checkbox" />
              <span class="checkbox-text">记住我</span>
            </label>
            <a href="#" class="forgot-link">忘记密码？</a>
          </div>

          <button
            type="submit"
            class="login-btn"
            :disabled="isLoading"
          >
            <LoadingSpinner v-if="isLoading" :size="20" />
            <span v-else>登录</span>
          </button>
        </form>

        <div class="divider">
          <span class="divider-text">或</span>
        </div>

        <div class="social-login">
          <button class="social-btn social-btn--google">
            <svg class="social-icon" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            使用 Google 登录
          </button>
          <button class="social-btn social-btn--github">
            <Github class="social-icon" :size="20" />
            使用 GitHub 登录
          </button>
        </div>

        <div class="login-footer">
          <p class="signup-text">
            还没有账号？
            <router-link to="/register" class="signup-link">立即注册</router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Eye, EyeOff, Github } from 'lucide-vue-next'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const router = useRouter()
const { login, isLoading } = useAuth()
const { success, error } = useToast()

const form = reactive({
  email: '',
  password: '',
  remember: false
})

const errors = reactive({
  email: '',
  password: ''
})

const showPassword = ref(false)

const validateForm = () => {
  errors.email = ''
  errors.password = ''
  
  if (!form.email) {
    errors.email = '请输入邮箱地址'
    return false
  }
  
  if (!form.password) {
    errors.password = '请输入密码'
    return false
  }
  
  if (form.password.length < 6) {
    errors.password = '密码至少需要6位字符'
    return false
  }
  
  return true
}

const handleLogin = async () => {
  if (!validateForm()) return
  
  const result = await login({
    email: form.email,
    password: form.password
  })
  
  if (result.success) {
    success('登录成功！')
    router.push('/')
  } else {
    error(result.error || '登录失败')
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
}

.login-container {
  background-color: var(--bg-primary);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  width: 100%;
  max-width: 400px;
  padding: 2rem;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.logo-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: var(--radius-lg);
  color: white;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
}

.login-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.login-subtitle {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.login-form {
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  transition: all 0.2s ease;
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.form-input--error {
  border-color: var(--error-color);
}

.form-error {
  display: block;
  color: var(--error-color);
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.password-input {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: none;
  cursor: pointer;
  color: var(--text-muted);
  padding: 0.25rem;
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
}

.password-toggle:hover {
  color: var(--text-primary);
  background-color: var(--bg-tertiary);
}

.eye-icon {
  width: 20px;
  height: 20px;
}

.form-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox {
  width: 16px;
  height: 16px;
  accent-color: var(--primary-color);
}

.checkbox-text {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.forgot-link {
  font-size: 0.875rem;
  color: var(--primary-color);
  text-decoration: none;
  transition: color 0.2s ease;
}

.forgot-link:hover {
  color: var(--primary-hover);
}

.login-btn {
  width: 100%;
  padding: 0.75rem 1rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.login-btn:hover:not(:disabled) {
  background-color: var(--primary-hover);
  transform: translateY(-1px);
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.divider {
  position: relative;
  text-align: center;
  margin: 1.5rem 0;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background-color: var(--border-color);
}

.divider-text {
  background-color: var(--bg-primary);
  color: var(--text-muted);
  font-size: 0.875rem;
  padding: 0 1rem;
  position: relative;
}

.social-login {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.social-btn {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.social-btn:hover {
  background-color: var(--bg-tertiary);
  border-color: var(--border-hover);
}

.social-btn--google:hover {
  background-color: #f8f9fa;
}

.social-btn--github:hover {
  background-color: #f6f8fa;
}

.social-icon {
  width: 20px;
  height: 20px;
}

.login-footer {
  text-align: center;
}

.signup-text {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
}

.signup-link {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.signup-link:hover {
  color: var(--primary-hover);
}

/* 移动端优化 */
@media (max-width: 480px) {
  .login-container {
    padding: 1.5rem;
  }
  
  .login-title {
    font-size: 1.5rem;
  }
  
  .form-input {
    padding: 0.625rem 0.875rem;
  }
  
  .login-btn {
    padding: 0.625rem 1rem;
  }
  
  .social-btn {
    padding: 0.625rem 1rem;
  }
}
</style>
