import request from 'superagent'
import { apiConfig, logger } from '../config'

const targetUrl = '/message/v2/id'

export default async function pushMessage(userIds, appName, message) {
  try {
    const content = {
      appName,
      osName: ['android', 'ios'],
      message,
      userId: userIds,
    }

    logger.info(`推送发送的内容是: ${JSON.stringify(content)}, 推送的URL是: ${apiConfig.pushApi}${targetUrl}`)
    const result = await request
      .post(`${apiConfig.pushApi}${targetUrl}`)
      .send(content)
      .set('sign', 'sadfasdf=2asdfwerewqr')
      .set('X-Referer-Service', 'feedback')
      .timeout(1000 * 60 * 20)
    logger.info(`推送返回的结果是: ${JSON.stringify(result)}`)
  } catch (e) {
    logger.error('Error when push message', e.stack)
    logger.error('Error when push message', e.response.body)
  }
}
