import { createRouter, createWebHistory } from 'vue-router';
import ScreenView from '@/views/ScreenView.vue';
import AdminView from '@/views/AdminView.vue';
import BlessingView from '@/views/BlessingView.vue';

const routes = [
  {
    path: '/',
    name: 'Screen',
    component: ScreenView,
    meta: { title: '婚礼大屏轮播展示' }
  },
  {
    path: '/screen',
    redirect: '/'
  },
  {
    path: '/admin',
    name: 'Admin',
    component: AdminView,
    meta: { title: '婚礼大屏播控后台' }
  },
  {
    path: '/bless',
    name: 'Blessing',
    component: BlessingView,
    meta: { title: '送上新婚祝福' }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title;
  }
  next();
});

export default router;
