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

// 注册 sensersdata window sa
// let buildType = 'dev'
// if (process.env.NODE_ENV === 'production') buildType = 'prod'
// if (process.env.NODE_ENV === 'test') buildType = 'qa'
// const { userId, deviceId } = this.userInfo
// const identify = userId || deviceId
// window.sa.identify(`u:${identify}`)
// window.sa.registerPage({
//   app_name: 'wechat',
//   build_type: buildType,
//   host: '',
// })

Vue.config.productionTip = false
Vue.use(toastRegistry)
Vue.use(OptionSelect)

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app')
