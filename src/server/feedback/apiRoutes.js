import express from 'express'
import service from './service'
const router = express.Router()

router.get('/dialogue', service.getDialogue)
router.get('/message/un-read/:id', service.getunReadMessages)

router.post('/message', service.saveMessage)
router.post('/message/freshman', service.sendToFreshman)
router.get('/current', service.getInitInfo)

router.put('/record/:recordId', service.updateClickCount)

router.get('/unread/count/:id', service.getunReadCount)

export default router
