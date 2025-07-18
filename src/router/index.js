import { createRouter, createWebHistory } from 'vue-router'
import Main from '../views/Main.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/main',
      name: 'main',
      component: () => import('../views/Main2.vue'),
    },
    {
      path: '/main2',
      name: 'main2',
      component: () => import('../views/Main.vue'),
    },
    {
      path: '/',
      redirect: '/main'
    },
    {
      path: '/ai',
      name: 'ai',
      component: () => import('../views/AI.vue'),
    },
    // {
    //   path: '/ai2',
    //   name: 'ai2',
    //   component: () => import('../views/AI2.vue'),
    // },
    // {
    //   path: '/test',
    //   name: 'test',
    //   component: () => import('../views/Test.vue'),
    // },
  ],
})

export default router
