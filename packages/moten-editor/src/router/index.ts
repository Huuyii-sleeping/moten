import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../pages/list.vue'),
    },
    {
      path: '/edit',
      name: 'edit',
      component: () => import('../pages/edit.vue'),
    },
  ],
})

export default router
