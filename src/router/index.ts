import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw, RouteLocationNormalized, NavigationGuardNext } from 'vue-router';
import firebase from '@/backend/firebase-config';
import Tabs from '@/views/Tabs.vue'
import 'firebase/firestore';


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
    path: '/forgotPassword',
    component: () => import('@/views/auth/ForgotPassword.vue')
  },
  {
    path: '/changePassword',
    component: () => import('@/views/auth/ChangePassword.vue')
  },
  {
    path: '/edit/:folderName',
    component: () => import('@/views/editing/EditMainView.vue'),
    props: true,
    meta: { requiresAuth: true },
  },
  {
    path: '/tabs/',
    component: Tabs,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/tabs/record'
      },
      {
        path: 'saved',
        component: () => import('@/views/TabSaved.vue')
      },
      {
        path: 'record',
        component: () => import('@/views/TabRecord.vue'),
      },
      {
        path: 'account',
        component: () => import('@/views/TabUploaded.vue'),
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
        component: () => import('@/views/TabLicense.vue'),
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
  if(!requiresAuth){
    next();
  }else{
    const isAuthenticated = firebase.auth().currentUser;
    if (isAuthenticated) {
      next();
    } else {
      next("/login");
    }
  }
});

export default router;
