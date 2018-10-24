import { SaveType } from '../../constants/ActionTypes'

export default function catchError (whatDo, result = SaveType.SAVE_FAILED) {
  return (target, key, descriptor) => {
    const func = descriptor.value

    descriptor.value = async (req, res, next) => {
      try {
        await func(req, res, next)
      } catch (e) {
        logger.error(`error when ${whatDo} info is: ${e}`)
        res.json({
          result,
          reason: e.message || null,
          time: Date.now()
        })
      }
    }
    return descriptor
  }
}
