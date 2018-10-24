import Kafka from 'node-rdkafka'
import buffer from 'buffer'
import { kafkaApi } from '../config/apiConfig'

const producer = new Kafka.Producer({
  'client.id': 'my-client',
  'metadata.broker.list': kafkaApi.url,
  dr_cb: true,
})

producer.connect()

const kafka = {
  ready: false,
  queue: [],
  send(topic, message) {
    this.queue.push({ topic, message: JSON.stringify(message) })
    if (this.ready) {
      const queueArr = this.queue
      this.queue = []
      queueArr.forEach(info => {
        try {
          console.log('send', info)
          this.readyProducer.produce(
            info.topic,
            null,
            new buffer.Buffer(info.message),
            'Stormwind',
            Date.now(),
          )
        } catch (err) {
          console.log('***send to kafak***', err)
        }
      })
    }
  },
  onReady(readyProducer) {
    this.readyProducer = readyProducer
    this.ready = true
  },
}

producer.on('ready', () => {
  console.log('***kafka is ready***')
  kafka.onReady(producer)
})

producer.on('error', (err) => {
  logger.info('producer error', JSON.stringify(err))
})

producer.on('event.error', (err) => {
  logger.info('producer event.error', JSON.stringify(err))
})

export default kafka
