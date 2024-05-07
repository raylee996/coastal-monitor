import { Config, get, post, put, requestDelete } from "helper/ajax";

export function graphqlDevice(dto: any) {
  return post('/graphql/device', dto, { isNotToken: true, isGraphql: true })
}

export function graphqlPoint(dto: any) {
  return post('/graphql/point', dto, { isNotToken: true, isGraphql: true })
}

//获取点位列表
export function getPointList(dto: any) {
  return post('/admin/device/listall', dto)
}

// 异常日志-列表
export function getExceptionLogs(dto: any) {
  return get('/admin/deviceCollectException/list', dto)
}
// 异常日志-导出
export function exportException(dto: any) {
  return get('/admin/deviceCollectException/list-export', dto, { isRequestFile: true })
}
// 异常日志-异常类型
export function getExceptionTypes() {
  return get('/admin/device/deviceExceptionTypes')
}


// 设备信息-列表-地图展示使用
export function getDeviceAll(dto: any, config?: Config) {
  return post('/admin/device/listall', dto, config)
}
// 设备信息-设备分类统计-态势感知-感知设备使用
export function getDeviceOnlineCount(dto: any, config?: Config) {
  return get('/admin/device/countDeviceByType', dto, config)
}

// 设备信息-分页列表
export function getDevicesList(dto: any, config?: Config) {
  return get('/admin/device/list', dto, config)
}

// 视频控制
export function sendCameraControl(dto: any, config?: Config) {
  return post('/ship/camera/remoteControlCamera', dto, { isNotErrorMessage: true, ...config })
}

// 视频控制
export function sendCameraControlUseRes(dto: any, config?: Config) {
  return post('/ship/camera/remoteControlCamera', dto, { isUseResponse: true, ...config })
}

// 设备管理-导出
export function exportDeviceTable(dto: any) {
  return post('/admin/device/export', dto, { isRequestFile: true, isFormUrlencoded: true });
}

// 设备管理-下载模板
export function exportDeviceTableTemplate(dto: any) {
  return post('/admin/device/down/template', dto, { isRequestFile: true, isFormUrlencoded: true });
}

// 设备管理-导入
export function importDeviceTable(dto: any) {
  return post('/admin/device/importData', dto, { isUploadFile: true });
}

// 设备信息查询——同一站点叠加
export function getDeviceGroup(dto: any, config?: Config) {
  return post('/admin/device/getDeviceBaseByGroup', dto, config);
}

// 查询设备关联区域记录列表-分页
export function getDeviceAreaRelation(dto: any, config?: Config) {
  return get('/admin/deviceAreaRelation/page', dto, config);
}

// 查询设备关联区域记录列表-全部
export function getDeviceAreaRelationList(dto: any, config?: Config): Promise<any[]> {
  return get('/admin/deviceAreaRelation/list', dto, config);
}

// 新增设备关联区域记录
export function addDeviceAreaRelation(dto: any, config?: Config) {
  return post('/admin/deviceAreaRelation/add', dto, config);
}

// 删除设备关联区域记录
export function delDeviceAreaRelation(id: string, config?: Config) {
  return requestDelete(`/admin/deviceAreaRelation/${id}`, null, config);
}

// 批量删除设备关联区域记录
export function delDeviceAreaRelationBatch(ids: string, config?: Config) {
  return requestDelete(`/admin/deviceAreaRelation/batchDel/${ids}`, null, config);
}

// 批量删除设备关联区域记录
export function getDeviceAreaRelationByDeviceId(id: string, config?: Config) {
  return get(`/admin/deviceAreaRelation/${id}`, null, config);
}

// 查询红外全景设备框选四个设置的初始位置
export function queryDeviceInitialPositionApi(deviceId: number) {
  return get(`/admin/deviceAreaRelation/getOneByDeviceId`, { deviceId });
}

// 新增红外全景设备框选四个设置的初始位置
export function addDeviceInitialPositionApi(dto: any) {
  return post(`/admin/deviceAreaRelation/add`, dto);
}

// 编辑红外全景设备框选四个设置的初始位置
export function editDeviceInitialPositionApi(dto: any) {
  return put(`/admin/deviceAreaRelation/edit`, dto);
}

// TTS内容新增
export function ttsContentAdd(dto: any) {
  return post('/admin/itcContent/add', dto, { isUseResponse: true })
}

export function ttsContentEdit(dto: any) {
  return put('/admin/itcContent/edit', dto, { isUseResponse: true })
}

// 查询广播内容库列表
export function queryTTSContentList(dto: any) {
  return get('/admin/itcContent/list', dto)
}

// 删除广播内容
export function delTTSContent(id: any) {
  return requestDelete(`/admin/itcContent/${id}`)
}

// 下发广播
export function itcJobAdd(dto: any) {
  return post('/admin/itcJob/add', dto, { isUseResponse: true })
}

// 下发 记录
export function itcJobList(dto: any) {
  return get('/admin/itcJob/list', dto)
}

// 获取已下发的麦克风列表
export function getSendedMicroPhoneList(dto?: any) {
  return post('/admin/itcJob/getRunningTask', dto)
}

// 停止已下发的麦克风
export function stopMicroPhone(taskId: string) {
  return requestDelete(`/admin/itcJob/stopTask/${taskId}`)
}