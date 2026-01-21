<template>
  <div class="forgot-password-page" id="forgot-password-page">
    <div class="forgot-password-container">
      <div class="forgot-password-header">
        <div class="logo">
          <div class="logo-icon">
            <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
              <path d="M16 2L20 8H28L24 14L28 20H20L16 26L12 20H4L8 14L4 8H12L16 2Z" fill="currentColor"/>
            </svg>
          </div>
          <span class="logo-text">AI工具集</span>
        </div>
        <h1 class="forgot-password-title">忘记密码</h1>
        <p class="forgot-password-subtitle">请输入您的邮箱地址，我们将发送验证码到您的邮箱</p>
      </div>

      <div class="forgot-password-form">
        <form @submit.prevent="handleSendCode" v-if="!codeSent">
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
              :disabled="isLoading"
            />
            <span v-if="errors.email" class="form-error">{{ errors.email }}</span>
          </div>

          <button
            type="submit"
            class="submit-btn"
            :disabled="isLoading"
          >
            <LoadingSpinner v-if="isLoading" :size="20" />
            <span v-else>发送验证码</span>
          </button>
        </form>

        <form @submit.prevent="handleVerifyCode" v-else>
          <div class="form-group">
            <label for="code" class="form-label">验证码</label>
            <input
              id="code"
              v-model="form.code"
              type="text"
              class="form-input"
              :class="{ 'form-input--error': errors.code }"
              placeholder="请输入6位验证码"
              maxlength="6"
              required
              :disabled="isLoading"
            />
            <span v-if="errors.code" class="form-error">{{ errors.code }}</span>
            <div class="resend-code">
              <span class="resend-text">没有收到验证码？</span>
              <button
                type="button"
                @click="handleResendCode"
                class="resend-btn"
                :disabled="isResending || countdown > 0"
              >
                {{ countdown > 0 ? `${countdown}秒后重新发送` : '重新发送' }}
              </button>
            </div>
          </div>

          <div class="form-group">
            <label for="password" class="form-label">新密码</label>
            <div class="password-input">
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                class="form-input"
                :class="{ 'form-input--error': errors.password }"
                placeholder="请输入新密码（至少6位）"
                required
                :disabled="isLoading"
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

          <div class="form-group">
            <label for="confirmPassword" class="form-label">确认密码</label>
            <input
              id="confirmPassword"
              v-model="form.confirmPassword"
              :type="showPassword ? 'text' : 'password'"
              class="form-input"
              :class="{ 'form-input--error': errors.confirmPassword }"
              placeholder="请再次输入新密码"
              required
              :disabled="isLoading"
            />
            <span v-if="errors.confirmPassword" class="form-error">{{ errors.confirmPassword }}</span>
          </div>

          <button
            type="submit"
            class="submit-btn"
            :disabled="isLoading"
          >
            <LoadingSpinner v-if="isLoading" :size="20" />
            <span v-else>重置密码</span>
          </button>
        </form>

        <div class="forgot-password-footer">
          <p class="back-text">
            <router-link to="/login" class="back-link">返回登录</router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Eye, EyeOff } from 'lucide-vue-next'
import { useToast } from '@/composables/useToast'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const router = useRouter()
const { success, error } = useToast()

const form = reactive({
  email: '',
  code: '',
  password: '',
  confirmPassword: ''
})

const errors = reactive({
  email: '',
  code: '',
  password: '',
  confirmPassword: ''
})

const isLoading = ref(false)
const isResending = ref(false)
const codeSent = ref(false)
const showPassword = ref(false)
const countdown = ref(0)
let countdownTimer: NodeJS.Timeout | null = null

const validateEmail = () => {
  errors.email = ''
  if (!form.email) {
    errors.email = '请输入邮箱地址'
    return false
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = '请输入有效的邮箱地址'
    return false
  }
  return true
}

const validateCode = () => {
  errors.code = ''
  if (!form.code) {
    errors.code = '请输入验证码'
    return false
  }
  if (!/^\d{6}$/.test(form.code)) {
    errors.code = '验证码必须是6位数字'
    return false
  }
  return true
}

const validatePassword = () => {
  errors.password = ''
  errors.confirmPassword = ''
  
  if (!form.password) {
    errors.password = '请输入新密码'
    return false
  }
  if (form.password.length < 6) {
    errors.password = '密码长度至少6位'
    return false
  }
  if (!form.confirmPassword) {
    errors.confirmPassword = '请确认密码'
    return false
  }
  if (form.password !== form.confirmPassword) {
    errors.confirmPassword = '两次输入的密码不一致'
    return false
  }
  return true
}

const startCountdown = () => {
  countdown.value = 60
  countdownTimer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      if (countdownTimer) {
        clearInterval(countdownTimer)
        countdownTimer = null
      }
    }
  }, 1000)
}

const handleSendCode = async () => {
  if (!validateEmail()) return

  isLoading.value = true
  errors.email = ''

  try {
    const response = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: form.email
      })
    })

    const data = await response.json()

    if (data.success) {
      codeSent.value = true
      success(data.message || '验证码已发送到您的邮箱')
      startCountdown()
    } else {
      error(data.message || data.error || '发送验证码失败')
      if (response.status === 429) {
        // 如果是因为频繁请求，也显示倒计时
        startCountdown()
      }
    }
  } catch (err) {
    console.error('发送验证码错误:', err)
    error('网络错误，请稍后重试')
  } finally {
    isLoading.value = false
  }
}

const handleResendCode = async () => {
  if (countdown.value > 0) return

  isResending.value = true
  try {
    await handleSendCode()
  } finally {
    isResending.value = false
  }
}

const handleVerifyCode = async () => {
  if (!validateCode() || !validatePassword()) return

  isLoading.value = true
  errors.code = ''
  errors.password = ''
  errors.confirmPassword = ''

  try {
    const response = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: form.email,
        code: form.code,
        password: form.password
      })
    })

    const data = await response.json()

    if (data.success) {
      success(data.message || '密码重置成功')
      setTimeout(() => {
        router.push('/login')
      }, 1500)
    } else {
      error(data.message || data.error || '重置密码失败')
    }
  } catch (err) {
    console.error('重置密码错误:', err)
    error('网络错误，请稍后重试')
  } finally {
    isLoading.value = false
  }
}

onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
})
</script>

<style scoped>
.forgot-password-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.forgot-password-container {
  width: 100%;
  max-width: 450px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  padding: 2.5rem;
}

.forgot-password-header {
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
  color: #667eea;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a202c;
}

.forgot-password-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 0.5rem 0;
}

.forgot-password-subtitle {
  font-size: 0.875rem;
  color: #718096;
  margin: 0;
}

.forgot-password-form {
  margin-top: 2rem;
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

.form-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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

.resend-code {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.resend-text {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.resend-btn {
  font-size: 0.75rem;
  color: var(--primary-color);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
  transition: color 0.2s ease;
}

.resend-btn:hover:not(:disabled) {
  color: var(--primary-hover);
}

.resend-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  text-decoration: none;
}

.submit-btn {
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
  margin-top: 1rem;
}

.submit-btn:hover:not(:disabled) {
  background-color: var(--primary-hover);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.forgot-password-footer {
  margin-top: 2rem;
  text-align: center;
}

.back-text {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
}

.back-link {
  color: var(--primary-color);
  text-decoration: none;
  transition: color 0.2s ease;
}

.back-link:hover {
  color: var(--primary-hover);
}
</style>

