import request from 'superagent'
import { apiConfig, logger } from '../config'
import { safeAttr } from '../common/utils'

export default async (userId) => {
  try {
    const { body } = await request
      .post(apiConfig.usApi)
      .set('Content-Type', 'application/json')
      .send({
        userIds: [+userId],
        fields: ['hospitals'],
      })

    if (body && body.succeed) {
      const info = safeAttr(body, ['data', 'data', 0]) || {}
      const userName = info.fullName || ''
      const roleId = (info.role && +info.role.id) || 0

      return {
        userName,
        roleId,
      }
    }
  } catch (e) {
    logger.error('Error when fetch userInfo', e.stack)
  }
  return null
}
