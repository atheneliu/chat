export function getUserInfoItem(result, key) {
  if (result && result.data && result.data.profile) {
    return result.data.profile[key]
  }
  return
}

export function getUserIdOrDeviceId(userInfo, deviceId) {
  if (getUserInfoItem(userInfo, 'userId')) {
    return { type: 'user', Id: getUserInfoItem(userInfo, 'userId') }
  }
  return { type: 'device', Id: deviceId }
}

export function delay(timeout = 100) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout)
  })
}

export function safeAttr(obj, _path) {
  if (!obj || !_path) return null
  const path = typeof _path === 'string' ? [_path] : _path
  return path.reduce((_obj, p) => (_obj ? _obj[p] : null), obj)
}

