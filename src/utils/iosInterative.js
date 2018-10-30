function setupWebViewJavascriptBridge(callback) {
  document.addEventListener('WebViewJavascriptBridgeReady', () => {
    window.WebViewJavascriptBridge.init()
    callback(window.WebViewJavascriptBridge)
  }, false)
  if (window.WebViewJavascriptBridge) {
    return callback(window.WebViewJavascriptBridge)
  }
  if (window.WVJBCallbacks) { return window.WVJBCallbacks.push(callback) }
  window.WVJBCallbacks = [callback]
  const WVJBIframe = document.createElement('iframe')
  WVJBIframe.style.display = 'none'
  WVJBIframe.src = 'wvjbscheme://__BRIDGE_LOADED__'
  document.documentElement.appendChild(WVJBIframe)
  setTimeout(() => document.documentElement.removeChild(WVJBIframe), 0)
}

let bridge = null

const iosInterative = {
  pushController(url) {
    bridge.callHandler('pushController', url)
  },
  selectImages(limit, cb) {
    this.previewImages(cb)
    bridge.callHandler('selectImages', limit, cb)
  },
  previewImages(cb) {
    window.previewImages = cb
  },
  browseImage(param) {
    bridge.callHandler('browseImage', param)
  },
}

export default () => {
  const proxy = {}
  let funcBeforeReadyList = []
  Object.keys(iosInterative).forEach(func => {
    proxy[func] = (...argus) => {
      if (bridge) {
        return iosInterative[func](...argus)
      }
      funcBeforeReadyList.push(() => iosInterative[func](...argus))
    }
  })

  setupWebViewJavascriptBridge(_ => {
    bridge = _
    funcBeforeReadyList.forEach(func => func())
    funcBeforeReadyList = []
  })

  return proxy
}
