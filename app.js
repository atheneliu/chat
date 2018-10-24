/**
 * Define isomorphic constants.
 */
global.__CLIENT__ = false
global.__SERVER__ = true
global.__DEVELOPMENT__ = !(process.env.NODE_ENV &&
  (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'production'))
global.__PRODUCTION__ = process.env.NODE_ENV === 'production'
global.__QA__ = process.env.NODE_ENV !== 'production'

if (__PRODUCTION__) {
  require('oneapm')
}
// to support es6 in node
// const fs = require('fs')
const path = require('path')
const R = require('ramda')
var srcPath = global.__DEVELOPMENT__ ? path.resolve(__dirname, 'src') : __dirname
// var babelrc
// if (__DEVELOPMENT__) {
//   babelrc = fs.readFileSync(path.resolve(__dirname, './.babelrc'))
// } else {
//   babelrc = fs.readFileSync(path.resolve(__dirname, './.babelrc'))
// }

// var config
// try {
//   config = JSON.parse(babelrc)
// } catch (err) {
//   console.error('==>ERROR: Error parsing your .babelrc.')
//   console.error(err)
// }
require('babel-register')({
  'presets': [
    'es2015',
    'stage-0'
  ],
  'plugins': [
    'transform-runtime',
    'add-module-exports',
    'transform-decorators-legacy',
    'transform-react-display-name'
  ],
  'env': {
  }
})

global.logger = require(path.resolve(srcPath, './server/config/logger'))
global.outputLog = require(path.resolve(srcPath, './server/common/outputLog'))
global.R = R
const AV = require('leancloud-storage')
const envConfig = require(path.resolve(srcPath, './server/config/config'))
AV.init(envConfig.leanstorage)
global.AV = AV

// Prevent issues with libraries using this var (see http://tinyurl.com/pcockwk)

// require('./getJsonData')
require(path.resolve(srcPath, './server/express'))
