import { get, post, put, requestDelete } from "helper/ajax";

// 获取历史的全景数据（图片）
export function queryHistoryDataApi(dto: any) {
  return get("/search/fileInfo/list", dto);
}

// 获取单个设备所有联动配置对象 /panorama/listByPanoramaId
export function queryDevicePanoramaApi(dto: any) {
  return get("/admin/devicePanorama/listByPanoramaId", dto);
}

// 新增单个设备联动配置对象
export function addDevicePanoramaApi(dto: any) {
  return post("/admin/devicePanorama/add", dto, { successText: "新增" });
}

// 修改单个设备联动配置对象 修改设备修改PTZ /panorama/edit
export function editDevicePanoramaApi(dto: any) {
  return put("/admin/devicePanorama/edit", dto, { successText: "修改" });
}

// 删除单个设备下的联动配置对象
export function delDevicePanoramaApi(id: any) {
  return requestDelete(
    `/admin/devicePanorama/${id}`,
    {},
    { successText: "删除" }
  );
}

// 获取PTZ

// 预览

// 视图信息
