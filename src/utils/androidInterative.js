export default {
  pushController(url) {
    window.androidNative.pushController(url)
  },
  selectImages(limit, cb) {
    this.previewImages(cb)
    window.androidNative.selectImages(limit)
  },
  previewImages(cb) {
    window.previewImages = cb
  },
  browseImage(param = {}) {
    window.androidNative.browseImage(JSON.stringify(param))
  },
}
