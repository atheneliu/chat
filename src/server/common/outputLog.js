import moment from 'moment'

export default function (module, type, rest) {
  const time = moment(new Date()).format('YYYY/MM/DD HH:mm')
  let restMessage = ''
  if (!rest) {
    return
  }
  for (const i in rest) {
    restMessage += `${i}: ${rest[i]};`
  }
  console.log(JSON.stringify({ module, type, time, restMessage }))
}