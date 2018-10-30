
import initBridge from 'xsl-bridge'

export default () => {
  const bridge = initBridge()
  window.$bridge = bridge
}
