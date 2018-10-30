import Component from './OptionSelect.vue'

export default {
  install(Vue) {
    const Tpl = Vue.extend(Component)

    let vm
    Vue.prototype.$optionSelect = (options) => {
      if (!options || !options.length) throw new Error('OptionSelect 需要至少提供一个 options 选项')
      if (!options.every(({ title, onClick }) => !!(title && onClick))) {
        throw new Error('OptionSelect 是一个含title, onClick 属性的对象数组')
      }

      if (!vm) {
        vm = new Tpl()
        document.body.appendChild(vm.$mount().$el)
      }

      vm.options = options
      vm.show = true

      return () => {
        vm.show = false
      }
    }
  },
}
