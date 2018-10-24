import _lodash from 'lodash'

const DEBUG = 'DEBUG'
const INFO = 'INFO'
const SYSTEM_PATH = process.cwd()
const env = (process.env.NODE_ENV &&
  (process.env.NODE_ENV === 'test' ||
  process.env.NODE_ENV === 'production')) ? process.env.NODE_ENV : 'development'

const baseConfig = {
  app: {
    env,
  },
}

const platformConfig = {
  development: {
    logger: {
      stdoutLevel: DEBUG,
    },
    app: {
      port: process.env.PORT || 8028,
      host: process.env.HOST || 'localhost',
      root: `${SYSTEM_PATH}/src`,
    },
    redis: {
      session: {
        sentinels: [
          { host: '192.168.64.68', port: 26379 },
          { host: '192.168.64.68', port: 26380 },
          { host: '192.168.64.68', port: 26381 },
        ],
        name: 'mymaster',
      },
      prefix: 'dr:feedback',
    },
    leanstorage: {
      appId: 'X4fXxMCMXX9WVpHgDSzyG5VP-gzGzoHsz',
      appKey: 'jCCTh0LOfK5ISfnvWqtqbwwM',
      tables: {
        feedbackMsg: 'FeedbackMessage_QA',
        newestFeedback: 'NewestFeedback_QA',
      },
    },
    xsldrDb: {
      host: '192.168.64.66',
      port: 33306,
      user: 'xsldr',
      password: 'x22Do5EuCkJ5rSv',
      database: 'xsl_dr',
      multipleStatements: true,
    },
    xslMada: {
      host: '192.168.64.66',
      port: 33306,
      user: 'XslcrmAll',
      password: 'hj34&*g%fk*GK',
      database: 'xsl_mada',
    },
    winston: {
      consoleLevel: 'debug',
      fileLevel: 'error',
      filename: 'feedback-service.log',
    },
  },

  test: {
    logger: {
      stdoutLevel: DEBUG,
    },
    app: {
      port: process.env.PORT || 8028,
      host: process.env.HOST || 'localhost',
      root: SYSTEM_PATH,
    },
    redis: {
      session: {
        sentinels: [
          { host: '192.168.64.68', port: 26379 },
          { host: '192.168.64.68', port: 26380 },
          { host: '192.168.64.68', port: 26381 },
        ],
        name: 'mymaster',
      },
      prefix: 'dr:feedback',
    },
    leanstorage: {
      appId: 'X4fXxMCMXX9WVpHgDSzyG5VP-gzGzoHsz',
      appKey: 'jCCTh0LOfK5ISfnvWqtqbwwM',
      tables: {
        feedbackMsg: 'FeedbackMessage_QA',
        newestFeedback: 'NewestFeedback_QA',
      },
    },
    xsldrDb: {
      host: '192.168.64.66',
      port: 33306,
      user: 'xsldr',
      password: 'x22Do5EuCkJ5rSv',
      database: 'xsl_dr',
      multipleStatements: true,
    },
    xslMada: {
      host: '192.168.64.66',
      port: 33306,
      user: 'XslcrmAll',
      password: 'hj34&*g%fk*GK',
      database: 'xsl_mada',
    },
    winston: {
      consoleLevel: 'debug',
      fileLevel: 'error',
      filename: 'feedback-service.log',
    },
  },

  production: {
    logger: {
      stdoutLevel: INFO,
    },
    app: {
      port: process.env.PORT || 8028,
      host: process.env.HOST || 'localhost',
      root: SYSTEM_PATH,
    },
    redis: {
      session: {
        sentinels: [
          { host: '192.168.20.100', port: 26379 },
          { host: '192.168.20.101', port: 26379 },
          { host: '192.168.20.102', port: 26379 },
        ],
        name: 'mymaster',
        password: 'apricotforest2O17Red!s',
      },
      prefix: 'dr:feedback',
    },
    leanstorage: {
      appId: 'X4fXxMCMXX9WVpHgDSzyG5VP-gzGzoHsz',
      appKey: 'jCCTh0LOfK5ISfnvWqtqbwwM',
      tables: {
        feedbackMsg: 'FeedbackMessage',
        newestFeedback: 'NewestFeedback',
      },
    },
    xsldrDb: {
      host: 'dr-master.xsl.link',
      port: 33306,
      user: 'xsldr',
      password: 'x22Do5EuCkJ5rSv',
      database: 'xsl_dr',
      multipleStatements: true,
    },
    xslMada: {
      host: 'statistics-db.xsl.link',
      port: 33306,
      user: 'root',
      password: '780810',
      database: 'xsl_mada',
    },
    winston: {
      consoleLevel: 'debug',
      fileLevel: 'error',
      filename: '/logs/feedback-service/feedback-service.log',
    },
  },
}

// override the base configuration with the platform specific values
const config = _lodash.merge(baseConfig, platformConfig[baseConfig.app.env])
export default config
