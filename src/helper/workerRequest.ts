import _ from "lodash";
import { local } from "./storage";

enum Method {
  post,
  get
}

function factory(fn: Function) {
  const fnStr = fn.toString() + fn.name + '()';
  const blob = new Blob([fnStr]);
  const url = URL.createObjectURL(blob);
  const handleWorker = new Worker(url);
  return handleWorker;
}

interface Options {
  /** 请求地址 */
  api: string
  /** 请求参数 */
  init: RequestInit
  /** 轮询的时间间隔 */
  time: number
}

function main() {
  onmessage = (evt) => {
    const options: Options = evt.data
    function handle() {
      postMessage({
        type: 'start',
        data: options
      })
      fetch(process.env.REACT_APP_BASE_URL + options.api, options.init)
        .then(response => response.json())
        .then(data => postMessage({
          type: 'data',
          data: data
        }))
        .catch(err => postMessage({
          type: 'error',
          data: err
        }))
        .finally(() => {
          postMessage({
            type: 'end',
            data: options
          })
        })
    }
    handle()
    setInterval(handle, options.time)
  }
}

function run(method: Method, params: Params): Worker {
  const options: Options = {
    api: '',
    init: {
      headers: {
        'Content-Type': 'application/json'
      }
    },
    time: params.config?.time || 2 * 1000
  }

  switch (method) {
    case Method.post:
      options.api = params.api;
      options.init.method = 'POST';
      if (params.dto) {
        options.init.body = JSON.stringify(params.dto)
      }
      break;
    case Method.get:
      options.init.method = 'GET'
      if (params.dto) {
        const searchParams = Qs.stringify(params.dto)
        options.api = `${params.api}?${searchParams}`
      } else {
        options.api = params.api;
      }
      break;
    default:
      break;
  }

  if (!params.config?.isNotToken) {
    const userInfo = local('USER_INFO');
    if (userInfo?.token) {
      _.set(options.init.headers!, TOKEN_KEY, userInfo.token)
    } else {
      console.warn(`isNotToken is false, but token value is null`);
    }
  }

  const requestWorker = factory(main)
  requestWorker.onmessage = evt => {
    if (evt.data.type === 'data' && params.cb) {
      params.cb(evt.data.data)
    }
  }
  requestWorker.postMessage(options)
  return requestWorker
}

interface Config {
  /**请求是否不携带token，默认false，token保存在Local Storage中*/
  isNotToken?: boolean
  /** 轮询的时间间隔 */
  time?: number
}

interface Params {
  /** 请求地址 */
  api: string
  /** 请求参数 */
  dto?: any
  /** 请求回调 */
  cb?: (data: any) => void
  /** 自定义请求配置 */
  config?: Config
}

export function workerPost(params: Params): Worker {
  return run(Method.post, params);
}

export function workerGet(params: Params): Worker {
  return run(Method.get, params);
}