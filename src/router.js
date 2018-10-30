import Vue from 'vue'
import Router from 'vue-router'
import Feedback from './views/Feedback.vue'
import Index from './views/index.vue'
import mescroll from './views/mescroll.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/feedback',
      name: 'feedback',
      component: Feedback,
    }, {
      path: '/index',
      name: 'index',
      component: Index,
    }, {
      path: '/mescroll',
      name: 'mescroll',
      component: mescroll,
    },
  ],
})
