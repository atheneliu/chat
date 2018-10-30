// const path = require('path')

// function resolve(dir) {
//   return path.join(__dirname, dir)
// }

module.exports = {
  devServer: {
    proxy: 'http://10.1.100.189:8028',
  },
  // chainWebpack: (config) => {
  //   config.resolve.alias
  //     .set('', resolve('src'))
  // },
}
