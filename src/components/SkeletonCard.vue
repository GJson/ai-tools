<template>
  <div class="skeleton-card" :class="{ 'skeleton-list': list }">
    <div class="skeleton-header">
      <div class="skeleton-avatar"></div>
      <div class="skeleton-content">
        <div class="skeleton-line skeleton-title"></div>
        <div class="skeleton-line skeleton-subtitle"></div>
      </div>
    </div>
    
    <div class="skeleton-body">
      <div class="skeleton-line skeleton-description"></div>
      <div class="skeleton-line skeleton-description short"></div>
      
      <div class="skeleton-tags">
        <div class="skeleton-tag"></div>
        <div class="skeleton-tag"></div>
        <div class="skeleton-tag"></div>
      </div>
      
      <div class="skeleton-meta">
        <div class="skeleton-meta-item"></div>
        <div class="skeleton-meta-item"></div>
        <div class="skeleton-meta-item"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  list?: boolean
}

defineProps<Props>()
</script>

<style scoped>
.skeleton-card {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}

.skeleton-list {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
}

.skeleton-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.skeleton-list .skeleton-header {
  margin-bottom: 0;
}

.skeleton-avatar {
  width: 48px;
  height: 48px;
  background-color: var(--bg-tertiary);
  border-radius: var(--radius-md);
  flex-shrink: 0;
}

.skeleton-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.skeleton-line {
  height: 1rem;
  background-color: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
}

.skeleton-title {
  width: 60%;
  height: 1.25rem;
}

.skeleton-subtitle {
  width: 40%;
  height: 0.875rem;
}

.skeleton-description {
  width: 100%;
  margin-bottom: 0.5rem;
}

.skeleton-description.short {
  width: 80%;
}

.skeleton-tags {
  display: flex;
  gap: 0.5rem;
  margin: 1rem 0;
  flex-wrap: wrap;
}

.skeleton-tag {
  width: 60px;
  height: 1.5rem;
  background-color: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
}

.skeleton-meta {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.skeleton-meta-item {
  width: 80px;
  height: 1rem;
  background-color: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
}

@keyframes skeleton-pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

@keyframes skeleton-shimmer {
  0% {
    background-color: var(--bg-tertiary);
  }
  50% {
    background-color: var(--border-color);
  }
  100% {
    background-color: var(--bg-tertiary);
  }
}

/* 移动端优化 */
@media (max-width: 768px) {
  .skeleton-card {
    padding: 1rem;
  }
  
  .skeleton-list {
    padding: 0.75rem;
  }
  
  .skeleton-avatar {
    width: 40px;
    height: 40px;
  }
  
  .skeleton-title {
    height: 1rem;
  }
  
  .skeleton-subtitle {
    height: 0.75rem;
  }
  
  .skeleton-line {
    height: 0.875rem;
  }
  
  .skeleton-tag {
    width: 50px;
    height: 1.25rem;
  }
  
  .skeleton-meta-item {
    width: 60px;
    height: 0.875rem;
  }
}
</style>
