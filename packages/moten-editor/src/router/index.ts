import { createRouter, createWebHashHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      //@ts-ignore
      component: () => import('../pages/list.vue'),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/edit/:id?',
      name: 'edit',
      component: () => import('../pages/edit.vue'),
      meta: {
        requiresAuth: true,
      },
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

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  const isLogin = !!userStore.token

  if (isLogin && ['/login', '/register'].includes(to.path)) {
    next('/')
    return
  }

  if (!isLogin && to.meta.requiresAuth) {
    next(`/login`)
    return
  }

  next()
})

export default router
