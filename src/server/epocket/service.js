import { catchError, redisHandler } from '../common'
import { config, apiConfig } from '../config'

const { unreadExpire, unreadModule } = apiConfig.epocketApi
const FeedbackMessage = config.leanstorage.tables.feedbackMsg

async function getunReadCountFromLean(id) {
  const query = `select count(*) from ${FeedbackMessage}
  where isRead=${false} and toId='${id}' and appName='epocket'`
  const unreadCount = await AV.Query.doCloudQuery(query)
  return unreadCount.count
}

async function getunReadCount(id) {
  let unreadObj = await redisHandler.get(unreadModule, id)
  if (!unreadObj) {
    const unreadCount = await getunReadCountFromLean(id)
    unreadObj = {
      id,
      unreadCount,
    }
    redisHandler.setWithExpire(unreadModule, id, unreadObj, unreadExpire)
  }
  return unreadObj.unreadCount
}

export default {
  @catchError('get unread count')
  async getunReadCount(req, res) {
    const { id } = req.params
    const unreadCount = await getunReadCount(id)
    res.json({
      obj: {
        unreadCount,
        id,
      },
      result: true,
      serverTime: new Date(),
    })
  }
}
