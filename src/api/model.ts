import { Config } from './../helper/ajax';
import { post, get, requestDelete, put } from "helper/ajax";

export function graphqlModelList(dto: any) {
  return post("/graphql/wisdom", dto, { isNotToken: true, isGraphql: true });
}

//获取模型列表
export function getModelList(dto: any) {
  return get("/alarm/modelingTask/list", dto);
}

//新增模型
export function modelTaskAdd(dto: any) {
  return post('/alarm/modelingTask/add', dto)
}

//删除模型
export function modelTaskDelete(id: any) {
  return requestDelete(`/alarm/modelingTask/${id}`)
}

//查询模型详情
export function getModelDetail(id: any, config?: Config) {
  return get(`/alarm/modelingTask/${id}`, null, config)
}

//编辑模型
export function modelTaskEdit(dto: any) {
  return put('/alarm/modelingTask/edit', dto)
}

// 模型列表中修改模型状态
export function updateModelStatusApi(dto: any) {
  return post('/alarm/modelingTask/updateModelColumn', dto)
}