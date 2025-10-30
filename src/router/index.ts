/* genAI_main_start */
import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Category from '@/views/Category.vue'
import ToolDetail from '@/views/ToolDetail.vue'
import Search from '@/views/Search.vue'
import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'
import Profile from '@/views/Profile.vue'
import Favorites from '@/views/Favorites.vue'
import History from '@/views/History.vue'
import Ratings from '@/views/Ratings.vue'
import AINews from '@/views/AINews.vue'
import AINewsDetail from '@/views/AINewsDetail.vue'
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
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile
  },
  {
    path: '/favorites',
    name: 'Favorites',
    component: Favorites
  },
  {
    path: '/history',
    name: 'History',
    component: History
  },
  {
    path: '/ratings',
    name: 'Ratings',
    component: Ratings
  },
  {
    path: '/ai-news',
    name: 'AINews',
    component: AINews
  },
  {
    path: '/ai-news/:id',
    name: 'AINewsDetail',
    component: AINewsDetail,
    props: true
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
/* genAI_main_end */
