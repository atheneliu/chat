import express from 'express'
import request from 'superagent'
// import fetchUserInfo from 'xsl-us-middleware'
import fetchUserInfo from '../parseClientInfo'

const router = express.Router()

router.use('/', fetchUserInfo, async (req, res) => {
  try {
    if (__DEVELOPMENT__) {
      const result = await request.get('http://localhost:8027/dist/index.html')
      res.send(result.text)
      return res.end()
    } else {
      res.sendFile('/', {
        root: `${process.cwd()}`
      }, (err) => {
        if (err) {
          logger.error(`error whild send file, err is : ${err}`)
          res.status(err.status).end()
        }
      })
      return
    }
  } catch (e) {
    logger.error('error in feedback router', e)
  }
})

export default router
