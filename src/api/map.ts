import { Config, get, post, requestDelete } from "helper/ajax";
import { workerPost } from "helper/workerRequest";

export function graphqlMap(dto: any) {
  return post("/graphql/map", dto, { isNotToken: true, isGraphql: true });
}

export function workerPostGraphqlMap(dto: any, cb: (data: any) => void): Worker {
  return workerPost({ api: '/graphql/map', dto, cb, config: { time: 10 * 60 * 1000 } })
}

/** 查询标记点信息列表 */
export function getMarkList(dto: any, config?: Config) {
  return get('/admin/mark/list', dto)
}

/** 查询标记点信息列表 */
export function addMark(dto: any) {
  return post('/admin/mark/add', dto)
}

/** 删除标记点信息 */
export function delMark(ids: any) {
  return requestDelete(`/admin/mark/${ids}`, null, { successText: '删除标记点' })
}


/** 获取地图布控区域 */
export function getMapCtrlArea(dto: any, config?: Config) {
  return get('/admin/areainfo/getMonitorAreas', dto, config)
}