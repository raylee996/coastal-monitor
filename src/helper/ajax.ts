import _ from "lodash";
import { local, session } from "./storage";
import { message } from "antd";

let cache = new Map();

export const instance = axios.create({
  baseURL: BASE_URL,
  timeout: 60 * 1000,
});

instance.defaults.headers.post["Content-Type"] = "application/json";

// export const TOKEN_HEADER_KEY = process.env.TOKEN_KEY || 'Web-Requested-Token';

enum Method {
  post = "POST",
  get = "GET",
  put = "PUT",
  detele = "delete",
}

interface Request {
  /** 请求接口的地址 */
  url: string

  /** 请求类型 */
  method: Method

  /** 与请求一起发送的URL参数，必须是普通对象 */
  params?: object

  /** 作为请求主体被发送的数据，FormData, File, Blob */
  data?: object | string

  /** 自定义请求头 */
  headers?: any

  /**请求响应的类型 */
  responseType?: string

  /** 支持以fetch api方式取消请求 */
  signal?: any

  /** 支持配置请求超时时间 */
  timeout?: number
}

interface AxiosResponse {
  /** `data` 由服务器提供的响应 */
  data: any

  /** `status` 来自服务器响应的 HTTP 状态码 */
  status: number

  /** `statusText` 来自服务器响应的 HTTP 状态信息 */
  statusText: string

  /** `headers` 服务器响应的头 */
  headers: any

  /** `config` 是为请求提供的配置信息 */
  config: any

  /** request is the request that generated this response XMLHttpRequest */
  request: any
}

export interface Config {
  /** 请求是否不携带token，默认false，token保存在Local Storage中*/
  isNotToken?: boolean

  /** 是否使用本地会话缓存，请求结果缓存到浏览器，同一个请求优先取缓存。（注意：只缓存成功响应的数据） */
  isSessionCache?: boolean

  /** 是否使用Content-Type=application/x-www-form-urlencoded */
  isFormUrlencoded?: boolean

  /** 是否使用返回信息 */
  isUseResponse?: boolean

  /** 是否是请求文件 */
  isRequestFile?: boolean

  /** 是否使用内部缓存 */
  isCache?: boolean

  /** 是否是GQL请求 */
  isGraphql?: boolean

  /** 是否是上传文件, dto必须是FormData数据 */
  isUploadFile?: boolean

  /** 接口请求成功的提示文本，会自动加上操作成功的文本 */
  successText?: string

  /** 接口请求成功的提示文本 */
  successAlt?: string

  /** 接口请求成功的提示文本，是否在接口调用成功时展示操作成功 */
  isSuccessMessage?: boolean

  /** 是否上传文件且带其他参数,  dto中data必须是FormData数据 params中放其他参数  */
  isUploadFileWithParames?: boolean

  /** 支持传入 controller = new AbortController() 取消请求 controller.abort() */
  signal?: AbortController

  /** 自定义接口请求超时时间 */
  timeout?: number

  /** 是否不提示服务端错误信息 */
  isNotErrorMessage?: boolean

  /** 自定义token */
  requestToken?: string
}

function request(
  type: Method,
  url: string,
  dto: any,
  config: Config = {}
): Promise<any> {
  let cacheName: string;

  let opt: Request = {
    url,
    method: type,
    headers: {},
  };

  if (config.isUploadFile) {
    opt.headers["Content-Type"] = "multipart/form-data;charset=UTF-8";
  }
  if (config.isFormUrlencoded) {
    opt.headers["Content-Type"] = "application/x-www-form-urlencoded";
  }

  if (config.isRequestFile) {
    opt.responseType = "blob";
    config.isUseResponse = true;
  }

  if (config.signal) {
    opt.signal = config.signal.signal
  }

  // 用于表格分页字段的转换，后台使用pageNum
  let readDto = {};
  if (config.isUploadFile) {
    readDto = dto;
  } else {
    readDto = _.cloneDeep(dto);
    if (_.has(readDto, "pageNumber") && _.has(readDto, "pageSize")) {
      _.set(readDto, "current", _.get(readDto, "pageNumber"));
      _.set(readDto, "size", _.get(readDto, "pageSize"));
      _.unset(readDto, "pageNumber");
      _.unset(readDto, "pageSize");
    }
  }

  switch (type) {
    case Method.post:
      if (config.isFormUrlencoded) {
        opt.data = Qs.stringify(readDto);
      } else if (config.isUploadFileWithParames) {
        const fileParams: any = { ...readDto };
        const { file, params } = fileParams;
        opt.data = file;
        opt.params = params;
      } else {
        opt.data = readDto;
      }
      break;
    case Method.get:
      if (config.isFormUrlencoded) {
        opt.params = Qs.stringify(readDto, { indices: false });//
      } else {
        opt.params = readDto;
      }
      break;
    case Method.put:
      if (config.isFormUrlencoded) {
        opt.data = Qs.stringify(readDto);
      } else {
        opt.data = readDto;
      }

      break;
    case Method.detele:
      opt.params = readDto;
      break;
    default:
      break;
  }

  if (!config.isNotToken) {
    const userInfo = local("USER_INFO");
    if (config.requestToken) {
      opt.headers[TOKEN_KEY] = `Bearer ${config.requestToken}`;
    } else if (userInfo?.token) {
      opt.headers[TOKEN_KEY] = `Bearer ${userInfo.token}`;
    } else {
      console.warn(`isNotToken is false, but token value is null`);
    }
  }

  if (config.isSessionCache || config.isCache) {
    const jsonStr = JSON.stringify(opt);
    const hash = CryptoJS.MD5(jsonStr).toString();
    cacheName = `ajaxCache_${hash}`;
    let data: any;
    if (config.isCache) {
      data = cache.get(cacheName);
    }
    if (!data && config.isSessionCache) {
      data = session(cacheName);
    }
    if (data) {
      return new Promise((resolve) => resolve(data));
    }
  }

  if (config.timeout) {
    opt.timeout = config.timeout
  }

  return new Promise((resolve, reject) => {
    instance(opt)
      .then(function (res: AxiosResponse) {
        // 导出接口的返回值不含code、data等内容，进行特殊判断。
        if (config.isUseResponse || config.isGraphql) {
          resolve(res);
        } else {
          let vo = res.data;

          if (Number(vo.code) === 200) {
            resolve(vo.data);
            if (config.isCache) {
              cache.set(cacheName, vo.data);
            }
            if (config.isSessionCache) {
              session(cacheName, vo.data);
            }
            // 成功提示
            if (config.successText) {
              message.success(`${config.successText}操作成功!`)
            } else if (config.isSuccessMessage) {
              message.success("操作成功")
            } else if (config.successAlt) {
              message.success(config.successAlt)
            }
          } else if (Number(vo.code) === 401) {
            window.location.pathname = '/login'
          } else {
            if (!vo.hasOwnProperty("message") && vo.hasOwnProperty("msg")) {
              vo.message = vo.msg;
            }
            if (!config.isNotErrorMessage) {
              message.error(vo.message);
            }
            //打印报错模板信息
            let errTxt = "\n";
            errTxt += `%c接口请求异常::${res.config.method}->${res.config.url}    \n`;
            if (res.config.data) {
              errTxt += `参数::${res.config.data}    \n`;
            } else if (res.config.params) {
              const paramsStr = JSON.stringify(res.config.params);
              errTxt += `参数::${paramsStr}    \n`;
            }
            errTxt += `响应::${res.request.responseText}\n`;
            console.log(errTxt, "color:red;font-weight:bold;");
            reject(vo);
          }


        }
      })
      .catch(function (error: any) {
        if (error.message !== 'canceled') {
          reject({
            message: `请求异常：${error.message} ${error.request.responseURL}`,
          });
        }
      });
  });
}

export function get(url: string, dto?: any, config?: Config): Promise<any> {
  return request(Method.get, url, dto, config);
}

export function post(url: string, dto: any, config?: Config): Promise<any> {
  return request(Method.post, url, dto, config);
}

export function put(url: string, dto: any, config?: Config): Promise<any> {
  return request(Method.put, url, dto, config);
}

export function requestDelete(
  url: string,
  dto?: any,
  config?: Config
): Promise<any> {
  return request(Method.detele, url, dto, config);
}

export function assets(url: string): Promise<any> {
  return axios.get(url);
}
