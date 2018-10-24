import moment from 'moment'
import {
  xsldrDb as db,
  xslMada
} from '../database'
import kafka from './kafka'
import {
  MESSAGE_LIMIT
} from '../../constants/Literal'
import {
  catchError,
  redisHandler
} from '../common'
import {
  SaveType
} from '../../constants/ActionTypes'
import {
  getUserIdOrDeviceId,
  delay
} from '../common/utils'
import {
  uploadConfig,
  config,
  apiConfig
} from '../config'
import fetchUserInfo from './fetchUserInfo'
import pushMessage from './push'

const { unreadModule } = apiConfig.epocketApi

const SENDER_TYPE_USER = 1
const SENDER_TYPE_DEVICE = 2

const FeedbackMessage = config.leanstorage.tables.feedbackMsg
const NewestFeedback = config.leanstorage.tables.newestFeedback

async function getDialogue (senderId, type = 'user', appName, lastTime = new Date()) {
  const formatTime = moment(lastTime).utc().format('YYYY-MM-DDTHH:mm:ss.SSS')
  let querySlice = `userId = '${senderId}'`
  if (type === 'device') {
    querySlice = `(deviceId = '${senderId}' and userId is not exists)`
  }

  const query = `select * from ${FeedbackMessage}
  where (${querySlice} or toId = '${senderId}')
  and appName = '${appName}' and createdAt < date('${formatTime}Z')
  order by -createdAt limit ${MESSAGE_LIMIT}`

  const dialogue = await AV.Query.doCloudQuery(query)
  return dialogue.results
}

async function getObjectIds (table, fields, conditions) {
  const query = new AV.Query(table)
  fields.forEach((field, index) => {
    query.equalTo(field, conditions[index])
  })
  query.select('objectId')
  const objectIds = await query.find()
  if (!objectIds.length) return []
  return objectIds.map(object => object.id)
}

async function updateNewestMessage (objectIds, {
  userId,
  userName,
  message,
  deviceId,
  appName,
  role,
  imageUrl
}) {
  const newMessage = AV.Object.createWithoutData(`${NewestFeedback}`, objectIds[0])
  if (userId) {
    newMessage.set('senderId', `${userId}`)
    newMessage.set('senderName', userName)
    newMessage.set('senderRole', role)
  } else {
    newMessage.set('senderId', deviceId)
  }
  newMessage.set('senderType', userId ? SENDER_TYPE_USER : SENDER_TYPE_DEVICE)
  newMessage.increment('unread', 1)
  newMessage.set('newestMessage', message)
  newMessage.set('appName', appName)
  newMessage.set('newMessageCreatedAt', new Date())
  newMessage.set('imageUrl', JSON.parse(imageUrl))
  await newMessage.save()
}

async function insertMessageToMysql (data) {
  await xslMada('FeedbackMessage').insert(data)
}

async function saveMessage (messageInfo, clientInfo, userDetails) {
  const {
    message,
    messageType,
    imageUrl
  } = messageInfo
  const {
    deviceId,
    appName,
    appVersion,
    model,
    osName,
    osVersion
  } = clientInfo
  const {
    fullName,
    roleId,
    userId
  } = userDetails

  let field = 'deviceId'
  let senderId = deviceId
  if (userId) {
    field = 'userId'
    senderId = userId
  }
  const formatTimeEnd = moment(new Date()).utc().format('YYYY-MM-DDTHH:mm:ss.SSS')
  const formatTimeStart = moment(new Date(moment()
    .format('YYYY-MM-DD 00:00:00')))
    .utc().format('YYYY-MM-DDTHH:mm:ss.SSS')

  const toDayCount = await AV.Query.doCloudQuery(`select count(*) from ${FeedbackMessage}
    where (${field} = '${senderId}' or toId = '${senderId}')
    and createdAt >= date('${formatTimeStart}Z') and createdAt <= date('${formatTimeEnd}Z')`)

  const newsetObjectIds = await getObjectIds(NewestFeedback,
    ['senderId', 'appName'],
    [`${senderId}`, appName])
  const feedbackMessage = new AV.Object(FeedbackMessage)
  if (userId) {
    feedbackMessage.set('userId', `${userId}`)
  }
  feedbackMessage.set('userName', fullName)
  feedbackMessage.set('role', roleId)
  feedbackMessage.set('deviceId', deviceId)
  feedbackMessage.set('appName', appName)
  feedbackMessage.set('appVersion', appVersion)
  feedbackMessage.set('model', model)
  feedbackMessage.set('message', message)
  feedbackMessage.set('messageType', messageType)
  feedbackMessage.set('imageUrl', imageUrl)
  feedbackMessage.set('type', 1)
  feedbackMessage.set('isRead', false)
  feedbackMessage.set('osName', osName)
  feedbackMessage.set('osVersion', osVersion)
  feedbackMessage.set('isFirst', !toDayCount.count)
  const result = await feedbackMessage.save()
  insertMessageToMysql({
    object_id: result.id,
    type: 1,
    message_type: messageType,
    message,
    model,
    device_id: deviceId,
    user_id: userId,
    user_name: fullName,
    role: roleId,
    app_name: appName,
    app_version: appVersion
  })
  await updateNewestMessage(newsetObjectIds, {
    userId,
    deviceId,
    appName,
    imageUrl,
    message,
    userName: fullName,
    role: roleId
  })
  return result.createdAt
}

async function updateReadStatus (objectIds) {
  if (!objectIds || objectIds.length === 0) {
    return
  }
  const avObjectArray = objectIds.map(objectId => {
    const feedback = AV.Object.createWithoutData(`${FeedbackMessage}`, objectId)
    feedback.set('isRead', true)
    return feedback
  })

  await Promise.all([
    AV.Object.saveAll(avObjectArray),
    xslMada('FeedbackMessage').update('read_status', true).whereIn('object_id', objectIds)
  ])
}

async function getunReadMessages (id, appName) {
  const query = `select * from ${FeedbackMessage}
  where isRead=${false} and toId='${id}' and appName='${appName}'`
  const unreadMessages = await AV.Query.doCloudQuery(query)
  await updateReadStatus(unreadMessages.results.map(message => message.id), id, appName)
  redisHandler.delete(unreadModule, id).catch((err) => {
    if (err) {
      logger.error(`error when delete epocket unread count: ${err}`)
    }
  })
  return unreadMessages
}

async function getunReadCount (id, appName) {
  const query = `select count(*) from ${FeedbackMessage}
  where isRead=${false} and toId='${id}' and appName='${appName}'`
  const unreadCount = await AV.Query.doCloudQuery(query)
  return unreadCount.count
}

async function updateClickCount (recordId) {
  await db('t_feedback_record')
    .increment('click_count', 1)
    .where('id', recordId)
}

async function sendMessagesOneByOne (messages) {
  try {
    const msgs = [...messages]
    while (msgs.length > 0) {
      const { appName, userId, roleId, content } = msgs.pop()

      const feedbackMessage = new AV.Object(FeedbackMessage)
      feedbackMessage.set('appName', appName)
      feedbackMessage.set('userId', '')
      feedbackMessage.set('userName', '系统消息')
      feedbackMessage.set('role', roleId)
      feedbackMessage.set('toId', String(userId))
      feedbackMessage.set('message', content)
      feedbackMessage.set('messageType', 'TEXT')
      feedbackMessage.set('type', 8)
      feedbackMessage.set('isRead', false)
      await feedbackMessage.save()
      // 延迟 100 ms 发送确保顺序
      await delay(100)
      await pushMessage([userId], appName, {
        title: '杏服小秘书',
        description: `杏服小秘书: ${content}`,
        badge: 1,
        notification: 'true',
        content: JSON.stringify({ intentType: 'feedback' })
      })
      kafka.send('dr_feedback', { userId })
    }
  } catch (e) {
    console.error('Error when sendMessagesOneByOne', e.stack)
  }
}

function getFamilyName (name = '') {
  return name ? name.substr(0, 1) : ''
}

/**
 * 给新登录的用户推送特定的信息
 *
 * @param {string} appName 要推送的 App
 * @param {string | number[]} userIds 要推送的用户 id
 */
async function sendToFreshman (appName, userIds = '') {
  if (!userIds || userIds.length === 0) throw new Error('请提供有效的 userId')
  if (!appName) throw new Error('appName 必须为 epocket, medchart, medplus_plus 中的一个')

  userIds.forEach(async (userId) => {
    await delay(2000)
    const { userName = '', roleId } = await fetchUserInfo(+userId) || {}
    const freshmanMessages = [
      '遇到过的典型患者，用病历夹来记。',
      `hi，${getFamilyName(userName)}医生，示例患者看过了吧？`
    ]
    await sendMessagesOneByOne(freshmanMessages.map((content) => ({
      content,
      appName,
      userId: +userId,
      userName,
      roleId,
      title: content
    })))
    kafka.send('dr_feedback', { userId })
  })
}

export default {
  @catchError('get dialogue')
  async getDialogue (req, res) {
    const {
      query: {
        lastTime
      }
    } = req
    const {
      userInfo,
      clientInfo: {
        appName,
        deviceId
      }
    } = req.session
    const {
      type,
      Id
    } = getUserIdOrDeviceId(userInfo, deviceId)
    const dialogue = await getDialogue(Id, type, appName, lastTime)
    res.json({
      dialogue: dialogue.reverse(),
      result: SaveType.SAVE_SUCCESS
    })
  },
  @catchError('post message')
  async saveMessage (req, res) {
    const {
      clientInfo,
      userInfo
    } = req.session
    const userDetails = userInfo && userInfo.data && userInfo.data.profile ? userInfo.data.profile : {}
    const {
      messageInfo
    } = req.body
    const createdTime = await saveMessage(messageInfo, clientInfo, userDetails)
    res.json({
      createdTime,
      result: SaveType.SAVE_SUCCESS
    })
  },
  @catchError('send to freshman')
  async sendToFreshman (req, res) {
    const { userId, appName } = req.body

    logger.info(`即将给用户${userId} ${appName}发送小秘书通知`)

    await sendToFreshman(appName, [userId])
    res.json({
      result: SaveType.SAVE_SUCCESS,
      time: Date.now()
    })
  },
  @catchError('get unread message')
  async getunReadMessages (req, res) {
    const {
      id
    } = req.params
    const {
      appName
    } = req.query
    const unreadMessages = await getunReadMessages(id, appName)
    res.json({
      unreadMessages,
      result: SaveType.SAVE_SUCCESS
    })
  },
  @catchError('init environment')
  async getInitInfo (req, res) {
    const {
      clientInfo,
      userInfo,
      queryInfo
    } = req.session
    const userDetails = userInfo && userInfo.data && userInfo.data.profile ? userInfo.data.profile : {}
    const initInfo = {
      ...clientInfo,
      ...userDetails,
      queryInfo,
      uploadDomain: uploadConfig.common.Domain
    }
    res.json({
      initInfo,
      result: SaveType.SAVE_SUCCESS
    })
  },
  @catchError('update click count')
  async updateClickCount (req, res) {
    const {
      params: {
        recordId
      }
    } = req
    updateClickCount(recordId)
    res.json({
      result: SaveType.SAVE_SUCCESS
    })
  },
  @catchError('get unread count')
  async getunReadCount (req, res) {
    const {
      id
    } = req.params
    const {
      appName
    } = req.query
    const unreadCount = await getunReadCount(id, appName)
    res.json({
      errorCode: 0,
      jsonType: 'map',
      numRows: 0,
      obj: {
        unreadCount,
        userId: id
      },
      rawReason: 'success',
      reason: 'success',
      result: true,
      serverTime: new Date()
    })
  }
}
