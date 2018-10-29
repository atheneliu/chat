import axios from 'axios'

async function requestService(url, method = 'GET', params = {}, headers = {}) {
  let ret = {}
  try {
    let query = {}
    let body = {}
    const customHeaders = headers // 这里可以扩展headers
    if (method === 'GET') {
      query = params
    } else {
      body = params
    }
    const res = await axios({
      url,
      method,
      params: query,
      data: body,
      headers: customHeaders,
    })
    ret = res.data
  } catch (err) {
    console.error(`Request ${url} Error `, err.stack)
    throw new Error(JSON.stringify(err.response.data))
  }
  return ret
}

function request(url, params = {}, headers = {}) {
  return requestService(url, 'GET', params, headers)
}

request.get = (url, params = {}, headers = {}) => requestService(url, 'GET', params, headers)
request.del = (url, params = {}, headers = {}) => requestService(url, 'DELETE', params, headers)
request.post = (url, params = {}, headers = {}) => requestService(url, 'POST', params, headers)
request.put = (url, params = {}, headers = {}) => requestService(url, 'PUT', params, headers)
request.patch = (url, params = {}, headers = {}) => requestService(url, 'PATCH', params, headers)

export default request
