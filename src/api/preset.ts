import { Config, get, post } from "helper/ajax";
import { workerPost } from "helper/workerRequest";

// 新增
export function addPreset(dto: any) {
  return post('/admin/preset/add', dto, { successText: '新增预置位' })
}

// 编辑
export function editPreset(dto: any, config?: Config) {
  return post('/admin/preset/updateById', dto, config)
}

// 查询
export function getPresetList(dto: any) {
  return get('/admin/preset/list', dto)
}

// 删除
export function delPreset(dto: any) {
  return post('/admin/preset/deleteById', dto, { successText: '删除预置位' })
}

// 通过设备编码获取摄像头PTZ值
export function getCameraPTZ(dto: any) {
  return post('/ship/camera/getVideoPTZByDeviceCode', dto, { isNotErrorMessage: true })
}
// 轮询获取摄像头ptz值
export function getCameraPTZInterval(dto: any, cb: (data: any) => void) {
  return workerPost({
    api: "/ship/camera/getVideoPTZByDeviceCode",
    dto,
    cb,
    config: {
      time: 2000,
    },
  });
}
// 重点场所 新增编辑设备预置位
export function setDefaultPreset(dto: any) {
  return post('/admin/defaultPreset/setDefaultPreset', dto, { successText: '设置默认预置位' })
}

// 重点场所 获取设备预置位
export function getPlaceDefaultPreset(dto: any, config?: Config): Promise<any[]> {
  return get('/admin/defaultPreset/getDefaultPreset', dto, config)
}