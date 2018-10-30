import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
// eslint-disable-next-line
import '@/utils/bridge.js'
// eslint-disable-next-line
import '@/assets/reset.css'
// eslint-disable-next-line
import OptionSelect from '@/plugins/OptionSelect/index.js'
// eslint-disable-next-line
import toastRegistry from '@/plugins/toast/index.js'

Vue.config.productionTip = false
Vue.use(toastRegistry)
Vue.use(OptionSelect)

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app')
