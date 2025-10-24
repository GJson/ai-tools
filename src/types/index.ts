// AI工具类型定义
export interface AITool {
  id: string
  name: string
  description: string
  shortDescription: string
  category: string
  subcategory?: string
  icon: string
  logo?: string
  url: string
  isFree: boolean
  isPopular: boolean
  isFeatured: boolean
  tags: string[]
  rating: number
  userCount?: string
  features: string[]
  pricing?: {
    free: boolean
    paid: boolean
    price?: string
  }
  screenshots?: string[]
  createdAt: string
  updatedAt: string
}

// 分类类型定义
export interface Category {
  id: string
  name: string
  description: string
  icon: string
  color: string
  subcategories?: Subcategory[]
  toolCount: number
}

export interface Subcategory {
  id: string
  name: string
  description: string
  toolCount: number
}

// 搜索相关类型
export interface SearchFilters {
  category?: string
  subcategory?: string
  isFree?: boolean
  isPopular?: boolean
  tags?: string[]
}

export interface SearchResult {
  tools: AITool[]
  total: number
  filters: SearchFilters
}

// 新闻和文章类型
export interface NewsItem {
  id: string
  title: string
  description: string
  image: string
  url: string
  category: string
  publishedAt: string
  author: string
}

// 快速访问卡片类型
export interface QuickAccessCard {
  id: string
  title: string
  description: string
  icon: string
  color: string
  url: string
  badge?: string
}

// 用户相关类型
export interface User {
  id: string
  name: string
  avatar?: string
  email: string
  favorites: string[]
  history: string[]
}

// API响应类型
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  error?: string
}

// 分页类型
export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}
