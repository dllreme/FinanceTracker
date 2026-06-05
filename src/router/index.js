import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import Transactions from '../views/Transactions.vue'
import Reports from '../views/Reports.vue'
import Goals from '../views/Goals.vue'
import Journal from '../views/Journal.vue'
import Budget from '../views/Budget.vue'
import Profile from '../views/Profile.vue'
import Subscriptions from '../views/Subscriptions.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: Login
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: Dashboard,
      meta: { requiresAuth: true }
    },
    {
      path: '/transactions',
      name: 'transactions',
      component: Transactions,
      meta: { requiresAuth: true }
    },
    {
      path: '/reports',
      name: 'reports',
      component: Reports,
      meta: { requiresAuth: true }
    },
    {
      path: '/goals',
      name: 'goals',
      component: Goals,
      meta: { requiresAuth: true }
    },
    {
      path: '/journal',
      name: 'journal',
      component: Journal,
      meta: { requiresAuth: true }
    },
    {
      path: '/budget',
      name: 'budget',
      component: Budget,
      meta: { requiresAuth: true }
    },
    {
      path: '/profile',
      name: 'profile',
      component: Profile,
      meta: { requiresAuth: true }
    },
    {
      path: '/subscriptions',
      name: 'subscriptions',
      component: Subscriptions,
      meta: { requiresAuth: true }
    }
  ]
})

// Updated Route Guard
router.beforeEach((to, from) => {
  const isLoggedIn = localStorage.getItem('user')

  if (to.meta.requiresAuth && !isLoggedIn) {
    return '/'
  }
})

export default router