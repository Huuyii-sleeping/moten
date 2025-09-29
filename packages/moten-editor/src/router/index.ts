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
    {
      path: '/login',
      name: 'login',
      component: () => import('../pages/login.vue'),
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../pages/register.vue'),
    },
  ],
})

export default router
