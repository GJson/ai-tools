<template>
  <Modal :visible="visible" title="编辑个人资料" size="lg" @close="handleClose">
    <div class="profile-edit">
      <!-- 头像编辑 -->
      <div class="avatar-section">
        <div class="avatar-container">
          <img 
            :src="form.avatar || defaultAvatar" 
            :alt="form.username"
            class="avatar"
          />
          <button @click="triggerFileUpload" class="avatar-edit-btn">
            <Camera class="camera-icon" :size="16" />
          </button>
        </div>
        <div class="avatar-info">
          <h3 class="avatar-title">头像</h3>
          <p class="avatar-description">支持 JPG、PNG 格式，建议尺寸 200x200px</p>
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            @change="handleAvatarChange"
            class="file-input"
            style="display: none"
          />
        </div>
      </div>

      <!-- 基本信息 -->
      <div class="form-section">
        <h3 class="section-title">基本信息</h3>
        
        <div class="form-group">
          <label for="username" class="form-label">用户名</label>
          <input
            id="username"
            v-model="form.username"
            type="text"
            class="form-input"
            :class="{ 'form-input--error': errors.username }"
            placeholder="请输入用户名"
            maxlength="20"
          />
          <span v-if="errors.username" class="form-error">{{ errors.username }}</span>
          <div class="form-help">用户名长度2-20个字符，只能包含字母、数字和下划线</div>
        </div>

        <div class="form-group">
          <label for="email" class="form-label">邮箱地址</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            class="form-input"
            :class="{ 'form-input--error': errors.email }"
            placeholder="请输入邮箱地址"
            disabled
          />
          <div class="form-help">邮箱地址不可修改，如需更换请联系客服</div>
        </div>

        <div class="form-group">
          <label for="bio" class="form-label">个人简介</label>
          <textarea
            id="bio"
            v-model="form.bio"
            class="form-textarea"
            :class="{ 'form-textarea--error': errors.bio }"
            placeholder="介绍一下自己吧..."
            maxlength="200"
            rows="4"
          ></textarea>
          <div class="form-help">
            <span class="char-count">{{ form.bio.length }}/200</span>
          </div>
        </div>
      </div>

      <!-- 联系方式 -->
      <div class="form-section">
        <h3 class="section-title">联系方式</h3>
        
        <div class="form-group">
          <label for="website" class="form-label">个人网站</label>
          <input
            id="website"
            v-model="form.website"
            type="url"
            class="form-input"
            :class="{ 'form-input--error': errors.website }"
            placeholder="https://example.com"
          />
          <span v-if="errors.website" class="form-error">{{ errors.website }}</span>
        </div>

        <div class="form-group">
          <label for="location" class="form-label">所在地</label>
          <input
            id="location"
            v-model="form.location"
            type="text"
            class="form-input"
            :class="{ 'form-input--error': errors.location }"
            placeholder="请输入所在城市"
            maxlength="50"
          />
          <span v-if="errors.location" class="form-error">{{ errors.location }}</span>
        </div>
      </div>

      <!-- 隐私设置 -->
      <div class="form-section">
        <h3 class="section-title">隐私设置</h3>
        
        <div class="privacy-item">
          <div class="privacy-info">
            <h4 class="privacy-title">公开个人资料</h4>
            <p class="privacy-description">允许其他用户查看您的基本信息</p>
          </div>
          <label class="toggle">
            <input type="checkbox" v-model="form.isPublic" />
            <span class="toggle-slider"></span>
          </label>
        </div>

        <div class="privacy-item">
          <div class="privacy-info">
            <h4 class="privacy-title">显示邮箱</h4>
            <p class="privacy-description">在个人资料中显示邮箱地址</p>
          </div>
          <label class="toggle">
            <input type="checkbox" v-model="form.showEmail" />
            <span class="toggle-slider"></span>
          </label>
        </div>

        <div class="privacy-item">
          <div class="privacy-info">
            <h4 class="privacy-title">显示使用统计</h4>
            <p class="privacy-description">在个人资料中显示工具使用统计</p>
          </div>
          <label class="toggle">
            <input type="checkbox" v-model="form.showStats" />
            <span class="toggle-slider"></span>
          </label>
        </div>
      </div>
    </div>

    <template #footer>
      <button @click="handleClose" class="cancel-btn">取消</button>
      <button @click="handleSave" class="save-btn" :disabled="isLoading">
        <LoadingSpinner v-if="isLoading" :size="16" />
        <span v-else>保存</span>
      </button>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { Camera } from 'lucide-vue-next'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'
import Modal from '@/components/Modal.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

interface Props {
  visible: boolean
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'saved'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { user, apiRequest } = useAuth()
const { success, error } = useToast()

const isLoading = ref(false)
const fileInput = ref<HTMLInputElement>()
const defaultAvatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'

const form = reactive({
  username: '',
  email: '',
  bio: '',
  website: '',
  location: '',
  avatar: '',
  isPublic: true,
  showEmail: false,
  showStats: true
})

const errors = reactive({
  username: '',
  email: '',
  bio: '',
  website: '',
  location: ''
})

// 初始化表单数据
const initForm = () => {
  if (user.value) {
    form.username = user.value.username || ''
    form.email = user.value.email || ''
    form.bio = user.value.bio || ''
    form.website = user.value.website || ''
    form.location = user.value.location || ''
    form.avatar = user.value.avatar || ''
    form.isPublic = user.value.isPublic !== false
    form.showEmail = user.value.showEmail || false
    form.showStats = user.value.showStats !== false
  }
}

// 监听visible变化，初始化表单
watch(() => props.visible, (newVisible) => {
  if (newVisible) {
    initForm()
    clearErrors()
  }
})

// 清除错误信息
const clearErrors = () => {
  Object.keys(errors).forEach(key => {
    errors[key as keyof typeof errors] = ''
  })
}

// 表单验证
const validateForm = () => {
  clearErrors()
  let isValid = true

  // 验证用户名
  if (!form.username) {
    errors.username = '请输入用户名'
    isValid = false
  } else if (form.username.length < 2) {
    errors.username = '用户名至少需要2个字符'
    isValid = false
  } else if (form.username.length > 20) {
    errors.username = '用户名不能超过20个字符'
    isValid = false
  } else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) {
    errors.username = '用户名只能包含字母、数字和下划线'
    isValid = false
  }

  // 验证个人简介
  if (form.bio && form.bio.length > 200) {
    errors.bio = '个人简介不能超过200个字符'
    isValid = false
  }

  // 验证网站
  if (form.website && !isValidUrl(form.website)) {
    errors.website = '请输入有效的网站地址'
    isValid = false
  }

  // 验证所在地
  if (form.location && form.location.length > 50) {
    errors.location = '所在地不能超过50个字符'
    isValid = false
  }

  return isValid
}

// 验证URL
const isValidUrl = (url: string) => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// 触发文件上传
const triggerFileUpload = () => {
  fileInput.value?.click()
}

// 处理头像变更
const handleAvatarChange = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    error('请选择图片文件')
    return
  }

  // 验证文件大小 (2MB)
  if (file.size > 2 * 1024 * 1024) {
    error('图片大小不能超过2MB')
    return
  }

  // 预览图片
  const reader = new FileReader()
  reader.onload = (e) => {
    form.avatar = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

// 保存个人资料
const handleSave = async () => {
  if (!validateForm()) return

  try {
    isLoading.value = true

    const response = await apiRequest('/user/profile', {
      method: 'PUT',
      body: JSON.stringify({
        username: form.username,
        bio: form.bio,
        website: form.website,
        location: form.location,
        avatar: form.avatar,
        isPublic: form.isPublic,
        showEmail: form.showEmail,
        showStats: form.showStats
      })
    })

    if (response.success) {
      success('个人资料更新成功')
      // 更新localStorage中的用户信息
      if (response.data && response.data.user) {
        const currentUser = localStorage.getItem('ai-tools-user')
        if (currentUser) {
          const userData = JSON.parse(currentUser)
          // 合并新的用户数据
          const updatedUser = { ...userData, ...response.data.user }
          localStorage.setItem('ai-tools-user', JSON.stringify(updatedUser))
        }
      }
      emit('saved', response.data?.user)
      handleClose()
    } else {
      error(response.error || '更新失败')
    }
  } catch (err) {
    error('网络错误，请稍后重试')
  } finally {
    isLoading.value = false
  }
}

// 关闭模态框
const handleClose = () => {
  emit('update:visible', false)
}
</script>

<style scoped>
.profile-edit {
  padding: 1rem 0;
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  background-color: var(--bg-tertiary);
  border-radius: var(--radius-lg);
  margin-bottom: 2rem;
}

.avatar-container {
  position: relative;
  flex-shrink: 0;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--border-color);
}

.avatar-edit-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 28px;
  height: 28px;
  background-color: var(--primary-color);
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.avatar-edit-btn:hover {
  background-color: var(--primary-hover);
  transform: scale(1.1);
}

.camera-icon {
  width: 16px;
  height: 16px;
}

.avatar-info {
  flex: 1;
}

.avatar-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.avatar-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
}

.form-section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-color);
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

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  transition: all 0.2s ease;
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.form-input--error,
.form-textarea--error {
  border-color: var(--error-color);
}

.form-input:disabled {
  background-color: var(--bg-tertiary);
  color: var(--text-muted);
  cursor: not-allowed;
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.form-error {
  display: block;
  color: var(--error-color);
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.form-help {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 0.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.char-count {
  font-weight: 500;
}

.privacy-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0;
  border-bottom: 1px solid var(--border-color);
}

.privacy-item:last-child {
  border-bottom: none;
}

.privacy-info {
  flex: 1;
}

.privacy-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
}

.privacy-description {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  margin: 0;
}

.toggle {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--border-color);
  transition: 0.3s;
  border-radius: 24px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

.toggle input:checked + .toggle-slider {
  background-color: var(--primary-color);
}

.toggle input:checked + .toggle-slider:before {
  transform: translateX(20px);
}

.cancel-btn,
.save-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.cancel-btn {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
  margin-right: 0.5rem;
}

.cancel-btn:hover {
  background-color: var(--border-color);
}

.save-btn {
  background-color: var(--primary-color);
  color: white;
}

.save-btn:hover:not(:disabled) {
  background-color: var(--primary-hover);
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .avatar-section {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .privacy-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .privacy-info {
    width: 100%;
  }
}
</style>