import { createRouter, createWebHistory, RouteRecordRaw, createWebHashHistory } from 'vue-router'
import SettingsPage from '@/views/SettingsPage.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'main',
    component: SettingsPage
  },
]

const router = createRouter({
  history: process.env.IS_ELECTRON ? createWebHashHistory() : createWebHistory(),
  // history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
