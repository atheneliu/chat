/**
 * Created by colorfulcow on 16/1/20.
 */
const env =
  (process.env.NODE_ENV &&
    (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'production'))
  ? process.env.NODE_ENV
  : 'development'

const platformConfig = {
  development: {
    epocketApi: {
      unreadExpire: 60 * 2,
      unreadModule: 'epocketunread',
    },
    kafkaApi: {
      url: '192.168.64.68:9092',
    },
    usApi: 'http://qa-uas-management.xsl.link/management/default/search/user',
    pushApi: 'http://qa-push.xsl.link',
  },

  test: {
    epocketApi: {
      unreadExpire: 60 * 2,
      unreadModule: 'epocketunread',
    },
    kafkaApi: {
      url: '192.168.64.68:9092',
    },
    usApi: 'http://qa-uas-management.xsl.link/management/default/search/user',
    pushApi: 'http://qa-push.xsl.link',
  },

  production: {
    epocketApi: {
      unreadExpire: 60 * 2,
      unreadModule: 'epocketunread',
    },
    kafkaApi: {
      url: '192.168.20.105:9092,192.168.20.106:9092,192.168.20.107:9092',
    },
    usApi: 'http://uas-management.xsl.link/management/default/search/user',
    pushApi: 'http://push.xsl.link',
  },
}

export default platformConfig[env]
