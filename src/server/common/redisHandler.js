import Redis from 'ioredis'
import { config } from '../config'

const cacheRedisAddress = config.redis.session

const cacheRedis = new Redis(cacheRedisAddress)
const prefix = config.redis.prefix

cacheRedis.on('error', err => { logger.error(`error in redis connect, error info is ${err}`) })

export default {
  async set(module, key, value) {
    try {
      const keyPath = `${prefix}:${module}:${key}`
      return await cacheRedis.set(keyPath, JSON.stringify(value))
    } catch (e) {
      logger.error('error when save redis , error info is :%', e)
      return false
    }
  },
  async get(module, key) {
    try {
      const keyPath = `${prefix}:${module}:${key}`
      const value = await cacheRedis.get(keyPath)
      if (!value) {
        return
      }
      return JSON.parse(value)
    } catch (e) {
      logger.error('error when read redis , error info is :%', e)
    }
  },
  async setWithExpire(module, key, value, expireTime) {
    try {
      const keyPath = `${prefix}:${module}:${key}`
      return await cacheRedis.set(keyPath, JSON.stringify(value), 'ex', expireTime)
    } catch (e) {
      logger.error('error when save redis with expire, error info is :%', e)
      return false
    }
  },
  async multiSet(module, value) {
    try {
      const toBeSavedObj = {}
      Object.keys(value).forEach(key => {
        const keyPath = `${prefix}:${module}:${key}`
        toBeSavedObj[keyPath] = JSON.stringify(value[key])
      })
      return await cacheRedis.mset(toBeSavedObj)
    } catch (e) {
      logger.error('error when multi save redis , error info is :%', e)
      return false
    }
  },
  async multiGet(module, key) {
    try {
      if (!Array.isArray(key) || !key) {
        throw new Error('multi get key must be a array')
      }
      key.forEach((current, index) => {
        key[index] = `${prefix}:${module}:${current}`
      })
      const value = await cacheRedis.mget(key)
      if (!value || !Array.isArray(value)) {
        return
      }
      // if key is not exit in redis, you will get null
      value.forEach((current, index) => {
        if (current) {
          value[index] = JSON.parse(current)
        } else {
          value[index] = null
        }
      })
      const result = {}
      key.forEach((subKey, index) => {
        result[subKey.substring(subKey.lastIndexOf(':') + 1)] = value[index]
      })
      return result
    } catch (e) {
      logger.error('error when multi read redis , error info is :%', e)
    }
  },
  async delete(module, key) {
    try {
      const keyPath = `${prefix}:${module}:${key}`
      return await cacheRedis.del(keyPath)
    } catch (e) {
      logger.error('error when delete redis , error info is :%', e)
      return false
    }
  },
  async LPush(queue, value) {
    try {
      await cacheRedis.lpush(queue, value)
    } catch (e) {
      logger.error('error when left push redis , error info is :%', e)
    }
  },
  async RPop(queue) {
    try {
      const isListExist = await cacheRedis.exists(queue)
      if (isListExist) {
        return await cacheRedis.rpop(queue)
      }
      return false
    } catch (e) {
      logger.error('error when right pop redis , error info is :%', e)
      return false
    }
  },
}
