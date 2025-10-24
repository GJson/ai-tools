import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Category from '@/views/Category.vue'
import ToolDetail from '@/views/ToolDetail.vue'
import Search from '@/views/Search.vue'
import Debug from '@/views/Debug.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/category/:id',
    name: 'Category',
    component: Category,
    props: true
  },
  {
    path: '/tool/:id',
    name: 'ToolDetail',
    component: ToolDetail,
    props: true
  },
  {
    path: '/search',
    name: 'Search',
    component: Search
  },
  {
    path: '/debug',
    name: 'Debug',
    component: Debug
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
