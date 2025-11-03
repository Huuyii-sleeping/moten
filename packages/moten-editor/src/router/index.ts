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
      path: '/preview/:id',
      name: 'preview',
      component: () => import('../pages/preview.vue'),
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
    {
      path: '/plugins',
      name: 'plugins',
      component: () => import('../pages/pluginMarket.vue'),
    },
    {
      path: '/plugins/upload',
      name: 'uploadPlugin',
      component: () => import('../pages/pluginUpload.vue'),
    },
    {
      path: '/plugins/review',
      name: 'reviewPlugin',
      component: () => import('../pages/pluginReview.vue'),
    },
    {
      path: '/performance/report',
      name: 'PerformanceReport',
      component: () => import('../components/performance/PerformanceReport.vue'),
    },
    {
      path: '/performance/comparsion',
      name: 'PerformanceComparsion',
      component: () => import('../components/performance/PerformanceComparison.vue'),
    },
  ],
})

// router.beforeEach(async (to, from, next) => {
//   const userStore = useUserStore()
//   const isLogin = !!userStore.token
//   if (isLogin && ['/login', '/register'].includes(to.path)) {
//     next('/')
//     return
//   }

//   if (!isLogin && to.meta.requiresAuth) {
//     next(`/login`)
//     return
//   }

//   next()
// })

export default router
