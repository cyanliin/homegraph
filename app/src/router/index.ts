import { createRouter, createWebHistory } from 'vue-router'
import DevicesView from '../views/DevicesView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'devices',
      component: DevicesView
    },
    {
      path: '/device/:id',
      name: 'device-detail',
      // 使用路由懶載入 (Route-level code-splitting) 來優化效能
      component: () => import('../views/DeviceDetailView.vue')
    }
  ]
})

export default router
