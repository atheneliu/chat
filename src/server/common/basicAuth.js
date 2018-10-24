import fs from 'fs'
import path from 'path'

import redisHandler from './redisHandler'

function unauthorized(res, realm) {
  res.statusCode = 401
  res.setHeader('WWW-Authenticate', 'Basic realm="' + realm + '"')
  res.end('Unauthorized')
}

function check(req) {
  const path = req.path
  const isLogRequest = /^\/logs$/.test(path)
  const isMonitorRequest = /^\/monitor$/.test(path)
  const isNoNeedValidate = !isLogRequest && !isMonitorRequest
  return isNoNeedValidate
}

async function getBasicAuthAccount() {
  let authAccount
  authAccount = await redisHandler.get('basicAuth', 'account')
  if (!authAccount) {
    const authFilePath = path.resolve(__dirname, '../config/auth.json')
    if (fs.existsSync(authFilePath)) {
      authAccount = JSON.parse(fs.readFileSync(authFilePath).toString())
    } else {
      authAccount = { username: 'dev', password: 'xsl12345' }
    }
    await redisHandler.setWithExpire('basicAuth', 'account', authAccount, 30)
  }

  return authAccount
}

export default async function basicAuthValidate(req, res, next) {
  try {
    const isNoNeedValidate = check(req)

    if (isNoNeedValidate) {
      return next()
    }

    const authAccount = await getBasicAuthAccount()
    const authorization = req.headers.authorization
    const realm = authAccount.password || 'authentication is required'

    if (!authorization) {
      return unauthorized(res, realm)
    }

    const parts = authorization.split(' ')
    const credentials = new Buffer(parts[1], 'base64').toString()
    const index = credentials.indexOf(':')
    const user = credentials.slice(0, index)
    const pass = credentials.slice(index + 1)

    if (user === authAccount.username && pass === authAccount.password) {
      return next()
    }

    return unauthorized(res, realm)

  } catch (e) {
    logger.error(`error in mp basic auth, error info is ${e.stack}`)
    return next()
  }
}
