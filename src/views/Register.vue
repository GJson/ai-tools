<template>
  <div class="register-page">
    <div class="register-container">
      <div class="register-header">
        <div class="logo">
          <div class="logo-icon">
            <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
              <path d="M16 2L20 8H28L24 14L28 20H20L16 26L12 20H4L8 14L4 8H12L16 2Z" fill="currentColor"/>
            </svg>
          </div>
          <span class="logo-text">AI工具集</span>
        </div>
        <h1 class="register-title">创建账号</h1>
        <p class="register-subtitle">加入我们，发现更多AI工具</p>
      </div>

      <div class="register-form">
        <form @submit.prevent="handleRegister">
          <div class="form-group">
            <label for="username" class="form-label">用户名</label>
            <input
              id="username"
              v-model="form.username"
              type="text"
              class="form-input"
              :class="{ 'form-input--error': errors.username }"
              placeholder="请输入用户名"
              required
            />
            <span v-if="errors.username" class="form-error">{{ errors.username }}</span>
          </div>

          <div class="form-group">
            <label for="email" class="form-label">邮箱地址</label>
            <div class="email-input-group">
              <input
                id="email"
                v-model="form.email"
                type="email"
                class="form-input"
                :class="{ 'form-input--error': errors.email }"
                placeholder="请输入邮箱地址"
                required
                @blur="checkEmail"
              />
              <button
                type="button"
                class="send-code-btn"
                :disabled="!canSendCode || isSendingCode"
                @click="sendVerificationCode"
              >
                {{ isSendingCode ? '发送中...' : (countdown > 0 ? `${countdown}s` : '发送验证码') }}
              </button>
            </div>
            <span v-if="errors.email" class="form-error">{{ errors.email }}</span>
          </div>

          <div class="form-group">
            <label for="verificationCode" class="form-label">验证码</label>
            <input
              id="verificationCode"
              v-model="form.verificationCode"
              type="text"
              class="form-input"
              :class="{ 'form-input--error': errors.verificationCode }"
              placeholder="请输入6位验证码"
              maxlength="6"
              required
            />
            <span v-if="errors.verificationCode" class="form-error">{{ errors.verificationCode }}</span>
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
            <div class="password-strength">
              <div class="strength-bar">
                <div 
                  class="strength-fill" 
                  :class="passwordStrengthClass"
                  :style="{ width: passwordStrength + '%' }"
                ></div>
              </div>
              <span class="strength-text">{{ passwordStrengthText }}</span>
            </div>
          </div>

          <div class="form-group">
            <label for="confirmPassword" class="form-label">确认密码</label>
            <div class="password-input">
              <input
                id="confirmPassword"
                v-model="form.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                class="form-input"
                :class="{ 'form-input--error': errors.confirmPassword }"
                placeholder="请再次输入密码"
                required
              />
              <button
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="password-toggle"
              >
                <Eye v-if="!showConfirmPassword" class="eye-icon" :size="20" />
                <EyeOff v-else class="eye-icon" :size="20" />
              </button>
            </div>
            <span v-if="errors.confirmPassword" class="form-error">{{ errors.confirmPassword }}</span>
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input v-model="form.agreeTerms" type="checkbox" class="checkbox" required />
              <span class="checkbox-text">
                我已阅读并同意
                <a href="#" class="terms-link">服务条款</a>
                和
                <a href="#" class="terms-link">隐私政策</a>
              </span>
            </label>
            <span v-if="errors.agreeTerms" class="form-error">{{ errors.agreeTerms }}</span>
          </div>

          <button
            type="submit"
            class="register-btn"
            :disabled="isLoading"
          >
            <LoadingSpinner v-if="isLoading" :size="20" />
            <span v-else>创建账号</span>
          </button>
        </form>

        <div class="divider">
          <span class="divider-text">或</span>
        </div>

        <div class="social-register">
          <button class="social-btn social-btn--google">
            <svg class="social-icon" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            使用 Google 注册
          </button>
          <button class="social-btn social-btn--github">
            <Github class="social-icon" :size="20" />
            使用 GitHub 注册
          </button>
        </div>

        <div class="register-footer">
          <p class="login-text">
            已有账号？
            <router-link to="/login" class="login-link">立即登录</router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Eye, EyeOff, Github } from 'lucide-vue-next'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const router = useRouter()
const { register, isLoading } = useAuth()
const { success, error } = useToast()

const form = reactive({
  username: '',
  email: '',
  verificationCode: '',
  password: '',
  confirmPassword: '',
  agreeTerms: false
})

const errors = reactive({
  username: '',
  email: '',
  verificationCode: '',
  password: '',
  confirmPassword: '',
  agreeTerms: ''
})

const showPassword = ref(false)
const showConfirmPassword = ref(false)

// 验证码相关
const isSendingCode = ref(false)
const countdown = ref(0)
const canSendCode = ref(false)

// 密码强度计算
const passwordStrength = computed(() => {
  const password = form.password
  if (!password) return 0
  
  let strength = 0
  if (password.length >= 8) strength += 25
  if (password.length >= 12) strength += 25
  if (/[a-z]/.test(password)) strength += 12.5
  if (/[A-Z]/.test(password)) strength += 12.5
  if (/[0-9]/.test(password)) strength += 12.5
  if (/[^A-Za-z0-9]/.test(password)) strength += 12.5
  
  return strength
})

const passwordStrengthClass = computed(() => {
  const strength = passwordStrength.value
  if (strength < 25) return 'strength-weak'
  if (strength < 50) return 'strength-fair'
  if (strength < 75) return 'strength-good'
  return 'strength-strong'
})

const passwordStrengthText = computed(() => {
  const strength = passwordStrength.value
  if (strength < 25) return '弱'
  if (strength < 50) return '一般'
  if (strength < 75) return '良好'
  return '强'
})

const validateForm = () => {
  errors.username = ''
  errors.email = ''
  errors.verificationCode = ''
  errors.password = ''
  errors.confirmPassword = ''
  errors.agreeTerms = ''
  
  if (!form.username) {
    errors.username = '请输入用户名'
    return false
  }
  
  if (form.username.length < 2) {
    errors.username = '用户名至少需要2个字符'
    return false
  }
  
  if (!form.email) {
    errors.email = '请输入邮箱地址'
    return false
  }
  
  if (!form.verificationCode) {
    errors.verificationCode = '请输入验证码'
    return false
  }
  
  if (form.verificationCode.length !== 6) {
    errors.verificationCode = '验证码必须是6位数字'
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
  
  if (form.password !== form.confirmPassword) {
    errors.confirmPassword = '两次输入的密码不一致'
    return false
  }
  
  if (!form.agreeTerms) {
    errors.agreeTerms = '请同意服务条款和隐私政策'
    return false
  }
  
  return true
}

// 检查邮箱格式
const checkEmail = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  canSendCode.value = emailRegex.test(form.email)
  if (!canSendCode.value) {
    errors.email = '请输入有效的邮箱地址'
  } else {
    errors.email = ''
  }
}

// 发送验证码
const sendVerificationCode = async () => {
  if (!canSendCode.value || isSendingCode.value) return
  
  isSendingCode.value = true
  errors.email = ''
  
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/send-verification-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: form.email }),
      credentials: 'same-origin'
    })
    
    const result = await response.json()
    
    if (result.success) {
      success('验证码已发送到您的邮箱')
      startCountdown()
    } else {
      error(result.error || '发送验证码失败')
    }
  } catch (err) {
    error('网络错误，请稍后重试')
  } finally {
    isSendingCode.value = false
  }
}

// 开始倒计时
const startCountdown = () => {
  countdown.value = 60
  canSendCode.value = false
  
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
      canSendCode.value = true
    }
  }, 1000)
}

const handleRegister = async () => {
  if (!validateForm()) return
  
  const result = await register({
    username: form.username,
    email: form.email,
    verificationCode: form.verificationCode,
    password: form.password
  })
  
  if (result.success) {
    success('注册成功！欢迎加入AI工具集')
    router.push('/')
  } else {
    error(result.error || '注册失败')
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
}

.register-container {
  background-color: var(--bg-primary);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  width: 100%;
  max-width: 400px;
  padding: 2rem;
}

.register-header {
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

.register-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.register-subtitle {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.register-form {
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

/* 验证码相关样式 */
.email-input-group {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}

.email-input-group .form-input {
  flex: 1;
}

.send-code-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  min-width: 120px;
}

.send-code-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.send-code-btn:disabled {
  background: var(--bg-tertiary);
  color: var(--text-muted);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
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

.password-strength {
  margin-top: 0.5rem;
}

.strength-bar {
  width: 100%;
  height: 4px;
  background-color: var(--bg-tertiary);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 0.25rem;
}

.strength-fill {
  height: 100%;
  transition: all 0.3s ease;
}

.strength-weak {
  background-color: var(--error-color);
}

.strength-fair {
  background-color: var(--warning-color);
}

.strength-good {
  background-color: var(--accent-color);
}

.strength-strong {
  background-color: var(--success-color);
}

.strength-text {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  cursor: pointer;
  line-height: 1.4;
}

.checkbox {
  width: 16px;
  height: 16px;
  accent-color: var(--primary-color);
  margin-top: 0.125rem;
  flex-shrink: 0;
}

.checkbox-text {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.terms-link {
  color: var(--primary-color);
  text-decoration: none;
  transition: color 0.2s ease;
}

.terms-link:hover {
  color: var(--primary-hover);
}

.register-btn {
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

.register-btn:hover:not(:disabled) {
  background-color: var(--primary-hover);
  transform: translateY(-1px);
}

.register-btn:disabled {
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

.social-register {
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

.register-footer {
  text-align: center;
}

.login-text {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
}

.login-link {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.login-link:hover {
  color: var(--primary-hover);
}

/* 移动端优化 */
@media (max-width: 480px) {
  .register-container {
    padding: 1.5rem;
  }
  
  .register-title {
    font-size: 1.5rem;
  }
  
  .form-input {
    padding: 0.625rem 0.875rem;
  }
  
  .register-btn {
    padding: 0.625rem 1rem;
  }
  
  .social-btn {
    padding: 0.625rem 1rem;
  }
}
</style>
