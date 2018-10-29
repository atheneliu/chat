import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// eslint-disable-next-line
import '@/assets/reset.css'
// eslint-disable-next-line
import toastRegistry from '@/plugins/toast/index.js'

Vue.config.productionTip = false
Vue.use(toastRegistry)

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app')
