/* global logger */
import express from 'express'
import path from 'path'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import compression from 'compression'
// import template from './feedback/render'
import session from 'express-session'
import connectRedis from 'connect-redis'
import Redis from 'ioredis'
import Schedule from 'node-schedule'
import history from 'connect-history-api-fallback'
import monitor from 'express-status-monitor'
import apiRoutes from './feedback/apiRoutes'
import epocketRoutes from './epocket/apiRoutes'
import { basicAuth as basicAuthMiddleWare, errorLog } from './common'
import fetchUserInfo from './parseClientInfo'
import { config } from './config'
// import fetchUserInfo from '../parseClientInfo'

const app = express()

Schedule.scheduleJob('1 1 3 * * *', () => {
  try {
    process.exit(1)
  } catch (e) {
    logger.error(`error occur on restartApp, error info is: ${e.stack}`)
  }
})

app.use(compression())
app.use(bodyParser.urlencoded({ extended: false, limit: '1024mb' }))
//  parse application/json
app.use(bodyParser.json({ limit: '1024mb' }))
app.use(cookieParser())

/* project basic router */
app.use(basicAuthMiddleWare)
app.use(monitor({ path: '/monitor', title: 'biz status monitor' }))
app.use('/logs', errorLog)
app.use('/api/epocket', epocketRoutes)

const RedisStore = connectRedis(session)
app.use(session({
  name: 'feedback.sessionId',
  secret: 'TP78x5qh3uwPhm5xpEuUlojX',
  resave: true,
  saveUninitialized: true,
  cookie: { maxAge: 1000 * 60 * 60 * 2 },
  store: new RedisStore({
    client: new Redis(config.redis.session),
    prefix: 'dr:feedback:login:session:',
  }),
}))

// Serve static files
// 这句代码需要在express.static上面
app.use(history())
app.use(express.static(path.join(__dirname, '../../dist')))
// app.use('/css', express.static(path.resolve(config.app.root, './css')))
// app.use('/static', express.static(path.resolve(config.app.root, './static')))
// app.use('/images', express.static(path.resolve(config.app.root, './images')))
// app.use('/', express.static(path.resolve(process.cwd(), '../../dist')))
// app.use('/assert', express.static(path.resolve(process.cwd(), './assert')))
// app.use('/src/js/shared/lib', express.static(path.resolve(process.cwd(), './src/js/shared/lib')))
// app.use('/js/shared/lib', express.static(path.resolve(process.cwd(), './js/shared/lib')))

// handle request
app.use('/api', fetchUserInfo, apiRoutes)
// app.use('/feedback', template)
// app.use('/api', apiRoutes)

const server = app.listen(config.app.port, (err) => {
  if (err) logger.error(err, 'error occured on server')
  const { address: host, port } = server.address()
  logger.info(`Front-End server is running at ${host}:${port}`)
})
