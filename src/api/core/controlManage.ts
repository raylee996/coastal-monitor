import { Config, get, post, put, requestDelete } from "helper/ajax";

export function getControlList(dto: any) {
  return get("/alarm/controlInfo/getPage", dto);
}

export function addControl(dto: any) {
  return post("/alarm/controlInfo/create", dto, { successText: "新增布控" });
}

export function updateControl(dto: any) {
  return post("/alarm/controlInfo/updateById", dto, { successText: "编辑布控" });
}

export function cancelControl(dto: any) {
  return post("/alarm/controlInfo/cancelControl", dto, { successText: "撤控" });
}

export function continueControl(dto: any) {
  return post("/alarm/controlInfo/continueControl", dto, {
    successText: "续控",
  });
}

// 获取布控详情
export function getControlInfo(dto: any) {
  return get("/alarm/controlInfo/getControlInfoById", dto);
}

export function cancel(dto: any) {
  return post("/alarm/controlInfo/cancel", dto, { successText: "撤回" });
}

export function deleteControl(dto: any) {
  return post("/alarm/controlInfo/deleteById", dto, { successText: "删除" });
}

export function getAreaListAll(dto: any) {
  return get("/admin/areainfo/list", dto);
}

export function getAreaList(dto: any) {
  return get("/admin/areainfo/page", dto);
}

export function addArea(dto: any) {
  return post("/admin/areainfo/add", dto);
}

export function editArea(dto: any) {
  return put("/admin/areainfo/edit", dto);
}

export function delArea(id: any) {
  return requestDelete(`/admin/areainfo/${id}`, null);
}

export function getAreaInfoById(id: any) {
  return get(`/admin/areainfo/${id}`, null);
}


export function getAreaData(dto: any, config?: Config) {
  return get("/admin/areainfo/page", dto, config);
}

// 布控管理-人员布控列表
export function getControlInfoList(dto: any) {
  return get("/alarm/controlInfo/getPage", dto);
}