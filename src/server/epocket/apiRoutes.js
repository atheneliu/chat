import express from 'express'
import service from './service'
const router = express.Router()

router.get('/unread-count/:id', service.getunReadCount)

export default router
