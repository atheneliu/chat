
import request from 'superagent'

const HEADER_SECURITY = 'X-Security-Id'
const HEADER_TOKEN = 'X-User-Token'
const HEADER_UA = 'X-User-Agent'
const HEADER_SK = 'sessionKey'
const APPNAME_MEDCHART = 'medchart'
const APPNAME_EPOCKET = 'epocket'
const APPNAME_WEBSITE = 'website'
const APPNAME_MEDCLIPSPLUS = 'medclips_plus'
const OSNAME_ANDROID = 'android'
const OSNAME_IOS = 'ios'
const SESSIONINFO_REG = /{[^}]*}/g
const requireUrl = process.env.NODE_ENV === 'production' ? 'http://uas.xsl.link/profile/default/user/_profile'
  : 'http://qa-uas.xsl.link/profile/default/user/_profile'

const epocketArr = ['epocket', 'EPocket', 'IOSEpocket', 'epocketIOS']
const medchartArr = ['medchart', '病历夹Pub', 'MedicalRecordsFolder', 'MedicalRecordIOS',
  'MedicalRecord', 'IOSMulberry', 'IOSMedicalRecordsFolder', 'IOSMedicalRecordFolder']
const iosNameArr = ['iPhone OS', 'iOS', 'iPhone']

function standardAppName(name = '') {
  if (/medclips_plus/.test(name.toLowerCase())) return APPNAME_MEDCLIPSPLUS
  if (/medchart|medical|medicalrecordsfolder/.test(name.toLowerCase())) return APPNAME_MEDCHART
  if (/epocket|mplatform/.test(name.toLowerCase())) return APPNAME_EPOCKET
  return APPNAME_WEBSITE
}

function standardVersion(clientType) {
  const regVersion = /\d+\.\d+\.\d+/
  if (!clientType) return null
  if (regVersion.test(clientType)) {
    const versions = clientType.match(regVersion)
    return versions[0]
  }
  return clientType
}

/**
 * parseAppInfo - 解析客户端版本信息
 * 新版病历夹比较特殊:
 * medclips_plus_1.0_Mac OS X_Chrome51.0.2704.103
 * 由于 medclips_plus 中已经存在了一个 _ ，因此 rank 需要 +1
 *
 * @param  {string} clientInfo 客户端信息
 * @param  {number} rank 分隔之后取第几个，如果没有默认取最后一个
 * @return {string} description
 * @example website_1.0_Mac OS X_Chrome51.0.2704.103
 */
function parseAppInfo(clientInfo, rank) {
  const infos = clientInfo.split('_')
  const index = rank === undefined ? (infos.length - 1) : rank
  if (clientInfo.indexOf(APPNAME_MEDCLIPSPLUS) >= 0) {
    if (rank === 0) {
      return APPNAME_MEDCLIPSPLUS
    }
    return infos[index + 1]
  }
  return infos[index]
}

function parseOsName(ua) {
  if (!ua) return null
  if (ua.toLowerCase().indexOf('ios') >= 0) {
    return OSNAME_IOS
  } if (ua.toLowerCase().indexOf('android') >= 0) {
    return OSNAME_ANDROID
  }
  return null
}

/**
 * parseSessionInfo - 把 sessionKey 中的信息匹配出来
 * sessionInfo 格式就像 {6437B657BB145494DC8CB8D52FEA7BC9},{website},{true},...
 * @param  {string} sessionKey
 * @return {obj} { deviceId, appName, appVersion, model, deviceInfo }
 *                deviceInfo: <appName>/<appVersion> (<model>, <systemName> <systemVersion>) net/<netType>
 */
function parseSessionInfo(sessionKey) {
  const sessionInfo = String(new Buffer(sessionKey, 'hex'))
  const infos = sessionInfo.match(SESSIONINFO_REG).map(info => info.slice(1, -1))
  const appName = standardAppName(infos[9])
  const appVersion = standardVersion(parseAppInfo(infos[10], 1))
  // osName 的解析按照 parseOsName 先解析，因为有类似 medchart_4.46.0-iOS_10.3.2 格式的存在
  // 如果不能正常解析，则取第三个
  const osName = parseOsName(infos[10]) || parseAppInfo(infos[10], 2)
  return {
    deviceId: infos[1],
    appName,
    appVersion,
    model: osName,
    deviceInfo: `${appName}/${appVersion} `
      + `(${osName}, ${osName} ${parseAppInfo(infos[10])}) net/null`,
  }
}

function noneEncode(each) {
  return each
}

/**
  * 解析用户信息的中间件
  * 解析规则：
  *   先从 header 中获取
  *     X-Security-Id  --  deviceId
  *     X-User-Agent   --  <客户端版本、名称、操作系统等> appName/appVersion (deviceModel[,;] osName osVersion) net/netType
  *     X-User-Token   --  token
  *   如果上面的三个头有缺失项，则依次按下面的顺序获取 sessionKey
  *     cookie
  *     header
  *     cookie 中的 sk
  *   获取到了按照以下规则解析
  *     16进制转字符串
  *     按照 {}, 分割，其中 1 是 deviceId，9 是 appName， 10 可以解析出 appVersion
  *   发送请求获取 userId
  */

export default async (req, res, next) => {
  let clientInfo
  try {
    let appName
    let appVersion
    let model
    let osName
    let osVersion
    let deviceId = req.header(HEADER_SECURITY) || req.cookies[HEADER_SECURITY]
    let token = req.header(HEADER_TOKEN) || req.cookies[HEADER_TOKEN]
    let deviceInfo = req.header(HEADER_UA) || req.cookies[HEADER_UA]
    let sessionKey = req.cookies.sessionKey || req.header(HEADER_SK) || req.cookies.sk || req.cookies['X-User-Token']
    if (!(deviceId && token && deviceInfo) && !sessionKey) {
      const query = req.query || {}
      // console.log('query', query)
      deviceId = query.deviceId
      token = query.token
      deviceInfo = query.deviceInfo
      sessionKey = query.sessionKey
    }
    if (deviceId && token && deviceInfo) {
      res.cookie(HEADER_SECURITY, deviceId, { domain: '.xingshulin.com', path: '/', encode: noneEncode })
      res.cookie(HEADER_TOKEN, token, { domain: '.xingshulin.com', path: '/', encode: noneEncode })
      res.cookie(HEADER_UA, deviceInfo, { domain: '.xingshulin.com', path: '/', encode: noneEncode })
      const parseUserAgent = deviceInfo.replace(/[\(|\/\)]/g, ',').split(',')
      appName = parseUserAgent[0] || ''
      appVersion = parseUserAgent[1].trim()
      model = parseUserAgent[2] || ''
      const osInfo = (parseUserAgent[3] || '').trim().split(' ')
      osName = osInfo[0] || ''
      osVersion = osInfo[2] || osInfo[1] || ''
    } else {
      if (!sessionKey) {
        throw new Error('没有解析信息')
      }
      const parsedInfo = parseSessionInfo(sessionKey)
      appName = req.cookies.appName || parsedInfo.appName
      appVersion = req.cookies.appVersion || parsedInfo.appVersion
      deviceId = parsedInfo.deviceId
      deviceInfo = parsedInfo.deviceInfo
      osName = parsedInfo.osName
      osVersion = parsedInfo.osVersion
      model = parsedInfo.model
      token = sessionKey
    }
    if (iosNameArr.indexOf(osName) > -1) {
      osName = 'iOS'
    }
    if (epocketArr.indexOf(appName) > -1) {
      appName = 'epocket'
    } else if (medchartArr.indexOf(appName) > -1) {
      appName = 'medchart'
    } else if (appName === 'www') {
      appName = 'official_website'
    }
    clientInfo = {
      deviceId,
      appName,
      appVersion,
      model,
      osName,
      osVersion,
    }
    req.session.clientInfo = clientInfo
    req.session.queryInfo = {
      sessionKey,
      deviceId,
      token,
      deviceInfo,
    }
    // fetch userInfo
    const result = await request.get(requireUrl)
      .set('X-Security-Id', deviceId)
      .set('X-User-Agent', deviceInfo)
      .set('X-User-Token', token)
    const userInfo = JSON.parse(result.text)
    req.session.userInfo = userInfo
  } catch (err) {
    if (!clientInfo) {
      req.session.clientInfo = {}
    }
    req.session.userInfo = {}
    console.error('current user is no login:', err.stack)
  } finally {
    next()
  }
}
