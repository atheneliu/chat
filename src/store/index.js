import Vue from 'vue'
import Vuex from 'vuex'
import app from './modules/app'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    app,
  },
})

// hot-reload 注意必须携程modules的形式才能有效果
if (process.env.NODE_ENV === 'development') {
  module.hot.accept([
    './modules/app',
  ], () => {
    store.hotUpdate({
      modules: {
        app: require('./modules/app').default,
      },
    })
  })
}
export default store
