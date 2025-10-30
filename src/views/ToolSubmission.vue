<template>
  <div class="tool-submission-page">
    <!-- 头部导航 -->
    <header class="header">
      <div class="container">
        <div class="header-content">
          <button @click="goBack" class="back-btn" type="button">
            <ArrowLeft class="back-icon" />
            返回
          </button>
          <h1 class="page-title">提交AI工具</h1>
          <div class="header-actions">
            <button @click="showPreview = true" class="preview-btn" :disabled="!isFormValid">
              <Eye class="preview-icon" :size="20" />
              预览
            </button>
          </div>
        </div>
      </div>
    </header>

    <div class="main-content">
      <div class="container">
        <div class="submission-form">
          <form @submit.prevent="handleSubmit">
            <!-- 基本信息 -->
            <div class="form-section">
              <h2 class="section-title">基本信息</h2>
              
              <div class="form-group">
                <label for="name" class="form-label">工具名称 *</label>
                <input
                  id="name"
                  v-model="form.name"
                  type="text"
                  class="form-input"
                  :class="{ 'form-input--error': errors.name }"
                  placeholder="请输入工具名称"
                  maxlength="100"
                  required
                />
                <span v-if="errors.name" class="form-error">{{ errors.name }}</span>
                <div class="form-help">简洁明了的工具名称，最多100个字符</div>
              </div>

              <div class="form-group">
                <label for="description" class="form-label">工具描述 *</label>
                <textarea
                  id="description"
                  v-model="form.description"
                  class="form-textarea"
                  :class="{ 'form-textarea--error': errors.description }"
                  placeholder="请详细描述工具的功能、特点和用途..."
                  maxlength="500"
                  rows="4"
                  required
                ></textarea>
                <div class="form-help">
                  <span class="char-count">{{ form.description.length }}/500</span>
                </div>
                <span v-if="errors.description" class="form-error">{{ errors.description }}</span>
              </div>

              <div class="form-group">
                <label for="category" class="form-label">分类 *</label>
                <select
                  id="category"
                  v-model="form.category"
                  class="form-select"
                  :class="{ 'form-select--error': errors.category }"
                  required
                >
                  <option value="">请选择分类</option>
                  <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                    {{ cat.name }}
                  </option>
                </select>
                <span v-if="errors.category" class="form-error">{{ errors.category }}</span>
              </div>

              <div class="form-group">
                <label for="tags" class="form-label">标签</label>
                <div class="tags-input">
                  <div class="tags-container">
                    <span 
                      v-for="(tag, index) in form.tags" 
                      :key="index"
                      class="tag"
                    >
                      {{ tag }}
                      <button 
                        type="button" 
                        @click="removeTag(index)"
                        class="tag-remove"
                      >
                        <X :size="14" />
                      </button>
                    </span>
                    <input
                      v-model="tagInput"
                      type="text"
                      class="tag-input"
                      placeholder="输入标签后按回车"
                      @keydown.enter.prevent="addTag"
                      @keydown.comma.prevent="addTag"
                    />
                  </div>
                </div>
                <div class="form-help">用逗号或回车分隔标签，最多10个标签</div>
                <span v-if="errors.tags" class="form-error">{{ errors.tags }}</span>
              </div>
            </div>

            <!-- 工具详情 -->
            <div class="form-section">
              <h2 class="section-title">工具详情</h2>
              
              <div class="form-group">
                <label for="website" class="form-label">官方网站 *</label>
                <input
                  id="website"
                  v-model="form.website"
                  type="url"
                  class="form-input"
                  :class="{ 'form-input--error': errors.website }"
                  placeholder="https://example.com"
                  required
                />
                <span v-if="errors.website" class="form-error">{{ errors.website }}</span>
                <div class="form-help">工具的官方网站或主要访问地址</div>
              </div>

              <div class="form-group">
                <label for="pricing" class="form-label">定价模式 *</label>
                <select
                  id="pricing"
                  v-model="form.pricing"
                  class="form-select"
                  :class="{ 'form-select--error': errors.pricing }"
                  required
                >
                  <option value="">请选择定价模式</option>
                  <option value="free">免费</option>
                  <option value="freemium">免费+付费</option>
                  <option value="paid">付费</option>
                  <option value="trial">试用</option>
                </select>
                <span v-if="errors.pricing" class="form-error">{{ errors.pricing }}</span>
              </div>

              <div class="form-group">
                <label for="features" class="form-label">主要功能</label>
                <div class="features-input">
                  <div 
                    v-for="(feature, index) in form.features" 
                    :key="index"
                    class="feature-item"
                  >
                    <input
                      v-model="form.features[index]"
                      type="text"
                      class="form-input"
                      placeholder="输入功能描述"
                      maxlength="100"
                    />
                    <button 
                      type="button" 
                      @click="removeFeature(index)"
                      class="remove-feature"
                    >
                      <X :size="16" />
                    </button>
                  </div>
                  <button 
                    type="button" 
                    @click="addFeature"
                    class="add-feature"
                  >
                    <Plus :size="16" />
                    添加功能
                  </button>
                </div>
                <div class="form-help">列出工具的主要功能特点，最多10个</div>
              </div>

              <div class="form-group">
                <label for="screenshots" class="form-label">截图/演示</label>
                <div class="file-upload">
                  <input
                    ref="fileInput"
                    type="file"
                    multiple
                    accept="image/*"
                    @change="handleFileUpload"
                    class="file-input"
                    style="display: none"
                  />
                  <button 
                    type="button" 
                    @click="triggerFileUpload"
                    class="upload-btn"
                  >
                    <Upload class="upload-icon" :size="20" />
                    上传截图
                  </button>
                  <div v-if="form.screenshots.length > 0" class="screenshots-preview">
                    <div 
                      v-for="(screenshot, index) in form.screenshots" 
                      :key="index"
                      class="screenshot-item"
                    >
                      <img :src="screenshot.url" :alt="screenshot.name" class="screenshot-img" />
                      <button 
                        type="button" 
                        @click="removeScreenshot(index)"
                        class="remove-screenshot"
                      >
                        <X :size="16" />
                      </button>
                    </div>
                  </div>
                </div>
                <div class="form-help">支持JPG、PNG格式，每张图片不超过5MB，最多5张</div>
                <span v-if="errors.screenshots" class="form-error">{{ errors.screenshots }}</span>
              </div>
            </div>

            <!-- 联系信息 -->
            <div class="form-section">
              <h2 class="section-title">联系信息</h2>
              
              <div class="form-group">
                <label for="contactEmail" class="form-label">联系邮箱</label>
                <input
                  id="contactEmail"
                  v-model="form.contactEmail"
                  type="email"
                  class="form-input"
                  :class="{ 'form-input--error': errors.contactEmail }"
                  placeholder="your-email@example.com"
                />
                <span v-if="errors.contactEmail" class="form-error">{{ errors.contactEmail }}</span>
                <div class="form-help">用于接收审核结果通知（可选）</div>
              </div>

              <div class="form-group">
                <label for="notes" class="form-label">备注</label>
                <textarea
                  id="notes"
                  v-model="form.notes"
                  class="form-textarea"
                  :class="{ 'form-textarea--error': errors.notes }"
                  placeholder="其他需要说明的信息..."
                  maxlength="300"
                  rows="3"
                ></textarea>
                <div class="form-help">
                  <span class="char-count">{{ form.notes.length }}/300</span>
                </div>
                <span v-if="errors.notes" class="form-error">{{ errors.notes }}</span>
              </div>
            </div>

            <!-- 提交按钮 -->
            <div class="form-actions">
              <button type="button" @click="goBack" class="cancel-btn">
                取消
              </button>
              <button 
                type="submit" 
                class="submit-btn"
                :disabled="!isFormValid || isSubmitting"
              >
                <LoadingSpinner v-if="isSubmitting" :size="16" />
                <span v-else>提交审核</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- 预览模态框 -->
    <Modal v-model:visible="showPreview" title="工具预览" size="lg">
      <div class="tool-preview">
        <div class="preview-header">
          <div class="preview-icon">
            <Bot class="icon" :size="32" />
          </div>
          <div class="preview-info">
            <h3 class="preview-name">{{ form.name || '工具名称' }}</h3>
            <p class="preview-category">{{ getCategoryName(form.category) }}</p>
            <div class="preview-tags">
              <span 
                v-for="tag in form.tags" 
                :key="tag"
                class="preview-tag"
              >
                {{ tag }}
              </span>
            </div>
          </div>
        </div>
        
        <div class="preview-content">
          <p class="preview-description">{{ form.description || '工具描述' }}</p>
          
          <div v-if="form.features.length > 0" class="preview-features">
            <h4 class="preview-section-title">主要功能</h4>
            <ul class="features-list">
              <li v-for="feature in form.features" :key="feature" class="feature-item">
                {{ feature }}
              </li>
            </ul>
          </div>
          
          <div class="preview-meta">
            <div class="meta-item">
              <span class="meta-label">定价：</span>
              <span class="meta-value">{{ getPricingText(form.pricing) }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">网站：</span>
              <a :href="form.website" target="_blank" class="meta-link">{{ form.website }}</a>
            </div>
          </div>
        </div>
      </div>
      
      <template #footer>
        <button @click="showPreview = false" class="close-btn">关闭</button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  ArrowLeft, 
  Eye, 
  X, 
  Plus, 
  Upload, 
  Bot
} from 'lucide-vue-next'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'
import { categories } from '@/data/categories'
import Modal from '@/components/Modal.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const router = useRouter()
const { isAuthenticated, apiRequest } = useAuth()
const { success, error } = useToast()

const showPreview = ref(false)
const isSubmitting = ref(false)
const fileInput = ref<HTMLInputElement>()
const tagInput = ref('')

const form = reactive({
  name: '',
  description: '',
  category: '',
  tags: [] as string[],
  website: '',
  pricing: '',
  features: [''],
  screenshots: [] as Array<{ name: string; url: string; file: File }>,
  contactEmail: '',
  notes: ''
})

const errors = reactive({
  name: '',
  description: '',
  category: '',
  tags: '',
  website: '',
  pricing: '',
  screenshots: '',
  contactEmail: '',
  notes: ''
})

// 检查用户是否已登录
onMounted(() => {
  if (!isAuthenticated.value) {
    error('请先登录后再提交工具')
    router.push('/login')
  }
})

// 表单验证
const isFormValid = computed(() => {
  return form.name.trim() && 
         form.description.trim() && 
         form.category && 
         form.website.trim() && 
         form.pricing
})

// 添加标签
const addTag = () => {
  const tag = tagInput.value.trim()
  if (tag && form.tags.length < 10 && !form.tags.includes(tag)) {
    form.tags.push(tag)
    tagInput.value = ''
  }
}

// 移除标签
const removeTag = (index: number) => {
  form.tags.splice(index, 1)
}

// 添加功能
const addFeature = () => {
  if (form.features.length < 10) {
    form.features.push('')
  }
}

// 移除功能
const removeFeature = (index: number) => {
  if (form.features.length > 1) {
    form.features.splice(index, 1)
  }
}

// 触发文件上传
const triggerFileUpload = () => {
  fileInput.value?.click()
}

// 处理文件上传
const handleFileUpload = (event: Event) => {
  const files = (event.target as HTMLInputElement).files
  if (!files) return

  Array.from(files).forEach(file => {
    if (form.screenshots.length >= 5) {
      error('最多只能上传5张截图')
      return
    }

    if (!file.type.startsWith('image/')) {
      error('请选择图片文件')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      error('图片大小不能超过5MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      form.screenshots.push({
        name: file.name,
        url: e.target?.result as string,
        file: file
      })
    }
    reader.readAsDataURL(file)
  })
}

// 移除截图
const removeScreenshot = (index: number) => {
  form.screenshots.splice(index, 1)
}

// 表单验证
const validateForm = () => {
  // 清除之前的错误
  Object.keys(errors).forEach(key => {
    errors[key as keyof typeof errors] = ''
  })

  let isValid = true

  if (!form.name.trim()) {
    errors.name = '请输入工具名称'
    isValid = false
  }

  if (!form.description.trim()) {
    errors.description = '请输入工具描述'
    isValid = false
  }

  if (!form.category) {
    errors.category = '请选择分类'
    isValid = false
  }

  if (!form.website.trim()) {
    errors.website = '请输入官方网站'
    isValid = false
  } else if (!isValidUrl(form.website)) {
    errors.website = '请输入有效的网站地址'
    isValid = false
  }

  if (!form.pricing) {
    errors.pricing = '请选择定价模式'
    isValid = false
  }

  if (form.contactEmail && !isValidEmail(form.contactEmail)) {
    errors.contactEmail = '请输入有效的邮箱地址'
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

// 验证邮箱
const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// 获取分类名称
const getCategoryName = (categoryId: string) => {
  const category = categories.find(cat => cat.id === categoryId)
  return category?.name || '未分类'
}

// 获取定价文本
const getPricingText = (pricing: string) => {
  const pricingMap: Record<string, string> = {
    free: '免费',
    freemium: '免费+付费',
    paid: '付费',
    trial: '试用'
  }
  return pricingMap[pricing] || '未知'
}

// 提交表单
const handleSubmit = async () => {
  if (!validateForm()) return

  try {
    isSubmitting.value = true

    // 准备提交数据
    const submitData = {
      name: form.name.trim(),
      description: form.description.trim(),
      category: form.category,
      tags: form.tags,
      website: form.website.trim(),
      pricing: form.pricing,
      features: form.features.filter(f => f.trim()),
      contactEmail: form.contactEmail.trim() || null,
      notes: form.notes.trim() || null
    }

    const response = await apiRequest('/tools/submit', {
      method: 'POST',
      body: JSON.stringify(submitData)
    })

    if (response.success) {
      success('工具提交成功！我们会在1-3个工作日内完成审核')
      router.push('/')
    } else {
      error(response.error || '提交失败')
    }
  } catch (err) {
    error('网络错误，请稍后重试')
  } finally {
    isSubmitting.value = false
  }
}

// 返回
const goBack = () => {
  router.push('/')
}
</script>

<style scoped>
.tool-submission-page {
  min-height: 100vh;
  background-color: var(--bg-secondary);
}

.header {
  background-color: var(--bg-primary);
  border-bottom: 1px solid var(--border-color);
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: none;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background-color: var(--bg-tertiary);
  border-color: var(--border-hover);
}

.back-icon {
  width: 16px;
  height: 16px;
}

.page-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.preview-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.preview-btn:hover:not(:disabled) {
  background-color: var(--primary-hover);
}

.preview-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.preview-icon {
  width: 20px;
  height: 20px;
}

.main-content {
  padding: 2rem 0;
}

.submission-form {
  max-width: 800px;
  margin: 0 auto;
}

.form-section {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: var(--shadow-sm);
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 1.5rem 0;
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
.form-textarea,
.form-select {
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
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.form-input--error,
.form-textarea--error,
.form-select--error {
  border-color: var(--error-color);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
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

.form-error {
  display: block;
  color: var(--error-color);
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

/* 标签输入 */
.tags-input {
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 0.5rem;
  min-height: 44px;
  background-color: var(--bg-primary);
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.tag {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background-color: var(--primary-color);
  color: white;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 500;
}

.tag-remove {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
}

.tag-remove:hover {
  opacity: 0.8;
}

.tag-input {
  border: none;
  outline: none;
  background: none;
  color: var(--text-primary);
  font-size: 0.875rem;
  flex: 1;
  min-width: 120px;
}

/* 功能输入 */
.features-input {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.feature-item {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.feature-item .form-input {
  flex: 1;
}

.remove-feature {
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  color: var(--text-muted);
  cursor: pointer;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.remove-feature:hover {
  background-color: var(--error-color);
  color: white;
}

.add-feature {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: none;
  border: 1px dashed var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
  align-self: flex-start;
}

.add-feature:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

/* 文件上传 */
.file-upload {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.upload-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: none;
  border: 2px dashed var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
  align-self: flex-start;
}

.upload-btn:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.upload-icon {
  width: 20px;
  height: 20px;
}

.screenshots-preview {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
}

.screenshot-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.screenshot-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-screenshot {
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  width: 24px;
  height: 24px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.remove-screenshot:hover {
  background-color: var(--error-color);
}

/* 表单操作 */
.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 2rem;
  border-top: 1px solid var(--border-color);
}

.cancel-btn,
.submit-btn {
  padding: 0.75rem 1.5rem;
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
  border: 1px solid var(--border-color);
}

.cancel-btn:hover {
  background-color: var(--border-color);
}

.submit-btn {
  background-color: var(--primary-color);
  color: white;
}

.submit-btn:hover:not(:disabled) {
  background-color: var(--primary-hover);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 预览样式 */
.tool-preview {
  padding: 1rem 0;
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.preview-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.preview-icon .icon {
  width: 32px;
  height: 32px;
}

.preview-info {
  flex: 1;
}

.preview-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
}

.preview-category {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin: 0 0 0.5rem 0;
}

.preview-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.preview-tag {
  padding: 0.25rem 0.5rem;
  background-color: var(--bg-tertiary);
  color: var(--text-secondary);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
}

.preview-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.preview-description {
  color: var(--text-primary);
  line-height: 1.6;
  margin: 0;
}

.preview-features {
  background-color: var(--bg-tertiary);
  padding: 1rem;
  border-radius: var(--radius-md);
}

.preview-section-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.features-list {
  margin: 0;
  padding-left: 1.25rem;
}

.features-list .feature-item {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.preview-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.meta-label {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 0.875rem;
}

.meta-value {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.meta-link {
  color: var(--primary-color);
  text-decoration: none;
  font-size: 0.875rem;
}

.meta-link:hover {
  text-decoration: underline;
}

.close-btn {
  padding: 0.5rem 1rem;
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background-color: var(--border-color);
}

/* 移动端优化 */
@media (max-width: 768px) {
  .main-content {
    padding: 1rem 0;
  }
  
  .form-section {
    padding: 1.5rem;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .cancel-btn,
  .submit-btn {
    width: 100%;
    justify-content: center;
  }
  
  .preview-header {
    flex-direction: column;
    text-align: center;
  }
  
  .screenshots-preview {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
}
</style>