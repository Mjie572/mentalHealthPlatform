import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/layouts/MainLayout.vue'

const routes = [
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard/index.vue')
      },
      // 成员A：AI情绪监控与预警模块
      {
        path: 'emotion',
        name: 'EmotionMonitor',
        component: () => import('@/views/EmotionMonitor/index.vue')
      },
      {
        path: 'emotion/collect',
        name: 'EmotionCollect',
        component: () => import('@/views/EmotionMonitor/Collect.vue')
      },
      {
        path: 'emotion/archive',
        name: 'EmotionArchive',
        component: () => import('@/views/EmotionMonitor/Archive.vue')
      },
      {
        path: 'emotion/alert',
        name: 'EmotionAlert',
        component: () => import('@/views/EmotionMonitor/Alert.vue')
      },
      // 多维解压服务模块
      {
        path: 'decompress',
        name: 'DecompressService',
        component: () => import('@/views/DecompressService/index.vue')
      },
      {
        path: 'decompress/games',
        name: 'DecompressGames',
        component: () => import('@/views/DecompressService/Games.vue')
      },
      {
        path: 'decompress/questionnaire',
        name: 'DecompressQuestionnaire',
        component: () => import('@/views/DecompressService/Questionnaire.vue')
      },
      {
        path: 'decompress/advisor',
        name: 'DecompressAdvisor',
        component: () => import('@/views/DecompressService/Advisor.vue')
      },
      {
        path: 'decompress/checkin',
        name: 'DecompressCheckIn',
        component: () => import('@/views/DecompressService/CheckIn.vue')
      },
      // 成员C：积极情绪赋能模块
      {
        path: 'positive',
        name: 'PositiveEmpowerment',
        component: () => import('@/views/PositiveEmpowerment/index.vue')
      },
      {
        path: 'positive/content',
        name: 'PositiveContent',
        component: () => import('@/views/PositiveEmpowerment/Content.vue')
      },
      {
        path: 'positive/diary',
        name: 'PositiveDiary',
        component: () => import('@/views/PositiveEmpowerment/Diary.vue')
      },
      // 成员D：个性化心理方案与数据模块
      {
        path: 'personalized',
        name: 'PersonalizedPlan',
        component: () => import('@/views/PersonalizedPlan/index.vue')
      },
      {
        path: 'personalized/plan',
        name: 'PersonalizedPlanDetail',
        component: () => import('@/views/PersonalizedPlan/Plan.vue')
      },
      {
        path: 'personalized/report',
        name: 'PersonalizedReport',
        component: () => import('@/views/PersonalizedPlan/Report.vue')
      },
      // 成员E：系统集成 + 界面引导智能助手
      {
        path: 'system',
        name: 'SystemIntegration',
        component: () => import('@/views/SystemIntegration/index.vue')
      },
      {
        path: 'system/assistant',
        name: 'SystemAssistant',
        component: () => import('@/views/SystemIntegration/Assistant.vue')
      },
      // 用户账户管理模块（成员E）
      {
        path: 'system/user-account',
        name: 'UserAccount',
        component: () => import('@/views/GroupManagement/UserAccount.vue')
      },
      {
        path: 'system/login',
        name: 'GroupLogin',
        component: () => import('@/views/GroupManagement/Login.vue')
      },
      {
        path: 'system/register',
        name: 'GroupRegister',
        component: () => import('@/views/GroupManagement/Register.vue')
      },
      {
        path: 'system/account',
        name: 'GroupAccount',
        component: () => import('@/views/GroupManagement/Account.vue'),
        meta: { requiresAuth: true }
      },

    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 全局路由守卫：需要登录的页面会检查 token（支持 localStorage 与 sessionStorage）
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token')
  if (to.meta && to.meta.requiresAuth && !token) {
    next({ path: '/system/login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

export default router

