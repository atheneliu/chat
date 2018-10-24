import fs from 'fs'
import moment from 'moment'
import express from 'express'

import { config } from '../config'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const date = moment(new Date()).format('YYYY-MM-DD')
    const filename = config.winston.filename
    const filePath = `${filename}.${date}`
    if (fs.existsSync(filePath)) {
      res.setHeader("content-type", "text/plain")
      return fs.createReadStream(filePath).pipe(res)
    } else {
      return res.send('没有错误日志')
    }
  } catch (e) {
    logger.error(`error in mp output logs service, error info is ${e.stack}`)
    return res.status(500).send(`error in mp output logs service, error info is: ${e.stack}`)
  }
})

export default router

