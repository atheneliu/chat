import vue from 'vue'

export function checkUrl(urlString) {
  if (urlString !== '') {
    const reg = /(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?/
    if (!reg.test(urlString)) {
      vue.toast('不合法地址，无法跳转！')
      return false
    }
    return true
  }
}

export function isArray(o) {
  return Object.prototype.toString.apply(o) === '[object Array]'
}

export function isFunction(o) {
  return Object.prototype.toString.apply(o) === '[object Function]'
}

export function getCookie(name) {
  const arr = document.cookie.split(';')
  for (let i = 0, len = arr.length; i < len; i++) {
    const item = arr[i].split('=')
    if (item[0] === String(name)) {
      return item[1]
    }
  }
  return ''
}

export function compareClientVersion(_versionA, _versionB) {
  const versionA = _versionA ? `${_versionA}` : '0'
  const versionB = _versionB ? `${_versionB}` : '0'
  if (versionA === versionB) return 0
  const versionAs = versionA.split(/\./)
  const versionBs = versionB.split(/\./)
  const compareLen = Math.min(versionAs.length, versionBs.length)
  for (let i = 0; i < compareLen; i += 1) {
    const currentVersionA = versionAs[i]
    const currentVersionB = versionBs[i]
    if (currentVersionA !== currentVersionB) {
      return +currentVersionA > +currentVersionB ? 1 : -1
    }
  }
  return 0
}

export function changeHttpToHttps(url) {
  if (url && url.indexOf('https://') === -1) return url.replace('http://', 'https://')
  return url
}
