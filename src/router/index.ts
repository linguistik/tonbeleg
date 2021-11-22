import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw, RouteLocationNormalized, NavigationGuardNext } from 'vue-router';
import firebase from '@/backend/firebase-config';
import Tabs from '@/views/Tabs.vue'


const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: () => import('@/views/auth/Login.vue')
  },
  {
    path: '/signup',
    component: () => import('@/views/auth/SignUp.vue')
  },
  {
    path: '/tabs/',
    component: Tabs,
    children: [
      {
        path: '',
        redirect: '/tabs/record'
      },
      {
        path: 'saved',
        component: () => import('@/views/TabSaved.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'record',
        component: () => import('@/views/TabRecord.vue'),
      },
      {
        path: 'account',
        component: () => import('@/views/TabAccount.vue'),
      },
      {
        path: 'tabsettings',
        component: () => import('@/views/TabSettings.vue'),
      },
      {
        path: 'tabpersonaldata',
        component: () => import('@/views/TabPersonalData.vue'),
      },
      {
        path: 'tabdataprotection',
        component: () => import('@/views/TabDataProtection.vue'),
      },
      {
        path: 'tabimprint',
        component: () => import('@/views/TabImprint.vue'),
      },
    ]
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});


/** check if route requires auth */
router.beforeEach((to: RouteLocationNormalized, 
                   from: RouteLocationNormalized, 
                   next: NavigationGuardNext) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const isAuthenticated = firebase.auth().currentUser;
  if (requiresAuth && !isAuthenticated) {
    next("/login");
  } else {
    next();
  }
});


export default router;
