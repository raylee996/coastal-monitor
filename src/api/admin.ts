import { Config, get, post, put, requestDelete } from "helper/ajax";

/** 查询摄像头轮巡设置列表 */
export function getVedioTConfigList(dto: any, config?: Config) {
  return get("/admin/vedioTConfig/list", dto, config);
}

/** 新增摄像头轮巡设置 */
export function addVedioTConfig(dto: any) {
  return post("/admin/vedioTConfig/add", dto, { successText: '新增轮巡' });
}

/** 删除摄像头轮巡设置 */
export function delVedioTConfig(ids: any) {
  return requestDelete(`/admin/vedioTConfig/${ids}`);
}

/** 修改摄像头轮巡设置 */
export function editVedioTConfig(dto: any) {
  return put("/admin/vedioTConfig/edit", dto, { successText: '编辑轮巡' });
}

/** 查询摄像头轮巡设置列表 */
export function getVedioTConfigInfo(id: any) {
  return get(`/admin/vedioTConfig/${id}`);
}
/** 登录 */
export function getLoginSrcData(dto: any) {
  return get(`/auth/srcData`, dto);
}
/** Ca登录 */
export function getLoginCAData(dto: any) {
  return post(`/auth/v2/login`, dto);
}
/** 日志验签 */
export function getLogVerify(dto: any) {
  return get(`/auth/verify`, dto);
}