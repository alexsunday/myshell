import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router';
import ShellPage from '@/views/shell/index.vue';
import SettingsPage from '@/views/settings/index.vue';
import ManagerPage from '@/views/manager/index.vue';

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'index',
    redirect: '/shell',
  },
  {
    // 会话管理器
    path: '/manager',
    name: 'Manager',
    component: ManagerPage,
  },
  {
    // 设置
    path: '/settings',
    name: 'Settings',
    component: SettingsPage,
  },
  {
    // shell 界面
    path: '/shell',
    name: 'Shell',
    component: ShellPage,
  }
]

const router = new VueRouter({
  routes
})

export default router
