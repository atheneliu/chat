const env = (process.env.NODE_ENV && (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'production'))
  ? process.env.NODE_ENV
  : 'development'

const platformConfig = {
  development: {
    common: {
      Bucket_Name: 'qa-feedback-public-common/',
      Domain: 'http://qa-feedback.xingshulinimg.com/',
    },
  },

  test: {
    common: {
      Bucket_Name: 'qa-feedback-public-common/',
      Domain: 'http://qa-feedback.xingshulinimg.com/',
    },
  },

  production: {
    common: {
      Bucket_Name: 'prod-feedback-public-common/',
      Domain: 'http://feedback.xingshulinimg.com/',
    },
  },
}

export default platformConfig[env]
