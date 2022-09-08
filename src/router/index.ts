import Vue from 'vue'
import VueRouter, { RouteConfig, RawLocation } from 'vue-router'
import Home from '../views/Home.vue'

const originalPush = VueRouter.prototype.push;
VueRouter.prototype.push = function(location:RawLocation) {
  return (originalPush as any).call(this, location).catch((err:any)=> err)
}

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    children: [
      {
        path: '/canvas2',
        name: 'canvas2',
        components: {
          content: () => import('@/views/Canvas2.vue'),
        }
      },
      {
        path: '/gobang',
        name: 'gobang',
        components: {
          content: () => import('@/views/gobang.vue'),
        }
      },
      {
        path: '/routerTable',
        name: 'routerTable',
        components: {
          content: () => import('@/views/routerTable.vue'),
        }
      },
      {
        path: '/konva',
        name: 'konva',
        components: {
          content: () => import('@/views/konva.vue'),
        }
      },
      {
        path: '/TD',
        name: 'TD',
        components: {
          content: () => import('@/views/TD/index.vue'),
        }
      },
    ]
  }
]

const router = new VueRouter({
  mode: process.env.NODE_ENV === 'production' ? 'hash' : 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
