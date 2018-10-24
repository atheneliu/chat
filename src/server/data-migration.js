import {
  xsldrDb as db,
} from './database'
import {
  config,
} from './config'
import AV from 'leancloud-storage'
AV.init(config.leanstorage)
const FeedbackMessage = config.leanstorage.tables.feedbackMsg
const NewestFeedback = config.leanstorage.tables.newestFeedback

async function checkExist(item, tableName, mysqlJson) {
  const count = await db(tableName).where('objectId', item.objectId)
  if (count.length === 0) {
    mysqlJson.push(item)
    return true
  }
  return false
}

async function sqlOpration(av, table, limit, page) {
  try {
    const query = `select * from ${av} order by -createdAt limit ${limit * (page - 1)}, ${limit}`
    const dialogue = await AV.Query.doCloudQuery(query)
    const dataJson = JSON.parse(JSON.stringify(dialogue.results))
    const mysqlJson = []
    // 修改原数组，使传入数据符合规范
    dataJson.forEach(async (item, index, input) => {
      input[index].createdAt = new Date(item.createdAt)
      input[index].updatedAt = new Date(item.updatedAt)
      if ('newMessageCreatedAt' in item) {
        input[index].newMessageCreatedAt = new Date(item.newMessageCreatedAt)
      }
      if ('tags' in item) {
        if (!item.tags || item.tags.length === 0) {
          input[index].tags = ' '
        } else {
          input[index].tags = JSON.stringify(item.tags)
        }
      }
      if ('imageUrl' in item) {
        if (item.imageUrl.length === 0) {
          input[index].imageUrl = ' '
        } else {
          input[index].imageUrl = JSON.stringify(item.imageUrl)
        }
      }
    })
    // 过滤，去除已存在
    await Promise.all(dataJson.map((item) => checkExist(item, table, mysqlJson)))
    console.log('insert-->', mysqlJson.length)
    await db(table).insert(mysqlJson)
    return dataJson.length
  } catch (error) {
    console.log(`${table}--${error}`)
  }
}

// 转移FeedbackMessage_QA 2768 rows  831541
async function getFeedbackMessage() {
  const limit = 100
  let page = 1
  let num = 100
  while (!(num < 100)) {
    console.log('getFeedbackMessage page-->', page, num)
    num = await sqlOpration(FeedbackMessage, 't_feedback_message', limit, page)
    page = page + 1
  }
  await sqlOpration(FeedbackMessage, 't_feedback_message', limit, page)
  console.log('down--->getFeedbackMessage')
  return {}
}
// 转移NewestFeedback_QA 122 rows 10088
async function getNewestFeedback() {
  const limit = 100
  let page = 1
  let num = 100
  while (!(num < 100)) {
    console.log('getNewestFeedback page-->', page)
    num = await sqlOpration(NewestFeedback, 't_feedback_newest', limit, page)
    page = page + 1
  }
  await sqlOpration(NewestFeedback, 't_feedback_newest', limit, page)
  console.log('down--->getNewestFeedback')
  return {}
}

// getNewestFeedback()
// getFeedbackMessage()

/**
 * q1: 已完成再执行，会不会再插入一遍 已解决
 * q2: 发生错误时，修改错误是，原来数据是会覆盖更新，还是直接再加入一遍 已解决
 */
