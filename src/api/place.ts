// 标签管理API
import { get, post, requestDelete, put, Config } from "helper/ajax";
// 开发
export function graphqlPlace(dto: any) {
  return post('/graphql/place', dto, { isNotToken: true, isGraphql: true })
}

// 数据中心首页重点场所下拉
export function getPlaceListHome(dto: any, config?: Config){
  return get("/archive/place/getAreaWithCamera", dto, config);
}

// 获取重点场所列表
export function getPlacesList(dto: any, config?: Config) {
  return get("/archive/place/list", dto, config);
}

// 新增重点场所列表
export function addPlacesList(dto: any) {
  return post("/archive/place/add", dto, { successText: '新增重点场所' });
}

// 编辑重点场所列表
export function eidtPlacesList(dto: any) {
  return put("/archive/place/edit", dto, { successText: '编辑重点场所' });
}

// 删除重点场所
export function removePlaceData(id: any) {
  return requestDelete(`/archive/place/${id}`, null, {
    successText: "删除",
  });
}

export function getPlaceListDetail(id: any, config?: Config) {
  return get(`/archive/place/${id}`, null, config);
}

// 重点场所-详情-场所信息-工作人员列表
export function getPlacePersonList(dto: any) {
  return get(`/archive/place/person/list`, dto);
}


// 重点场所-详情-场所信息-工作人员新增
export function placesPersonAdd(dto: any) {
  return post("/archive/place/person/add", dto, {
    successText: '新增'
  });
}


// 重点场所-详情-场所信息-工作人员编辑
export function placesPersonEdit(dto: any) {
  return put("/archive/place/person/edit", dto, {
    successText: '编辑'
  });
}


// 重点场所-详情-场所信息-获取工作人员信息
export function placesPersonGetInfo(dto: any) {
  return get("/archive/place/person/getInfo", dto);
}

// 重点场所-详情-场所信息-删除工作人员
export function placeDelPerson(id: any) {
  return requestDelete(`/archive/place/person/${id}`, null, {
    successText: "删除",
  });
}



// 重点场所-详情-场所信息-获取重点场所涉案信息列表
export function getPlacesCaseList(dto: any) {
  return get("/archive/place/caseList", dto);
}


// 重点场所-详情-场所信息-重点场所-新增案件
export function placeAddCase(dto: any) {
  return post("/archive/place/addCase", dto, {
    successText: '新增'
  });
}

// 重点场所-详情-场所信息-重点场所-取消关联案件
export function placeRemoveCase(dto: any) {
  return requestDelete("/archive/place/removeCase", dto, {
    successText: '取消关联'
  });
}



// 重点场所-详情-场所信息-获取重点场所详情内的所有设备列表
export function getPlacesAllDevices(dto: any, config?: Config) {
  return get("/archive/place/findAllDevices", dto, config);
}

// 重点场所-详情-场所信息-获取所有设备
export function getAllDevices(dto: any) {
  return get("/archive/place/findAllDevices", dto);
}


// 重点场所-详情-场所信息-重点场所-新增场所设备
export function placeAddDevice(dto: any) {
  return post("/archive/place/addDevice", dto, {
    successText: '新增设备'
  });
}

// 重点场所-详情-场所信息-重点场所-删除场所设备
export function placeDelDevice(dto: any) {
  return requestDelete("/archive/place/removeDevice", dto, {
    successText: '删除设备'
  });
}


// 重点场所-详情-场所信息-获取场所中的布控数据，全量
export function getControlInfoByIdV2(dto: any, config?: Config) {
  return get("/alarm/controlInfo/getControlInfoByIdV2", dto, config);
}


// 感知目标-船舶来源
export function getPlacePort(dto: any) {
  return get("/archive/place/portTerminalList", dto);
}


// 重点场所-数据信息-船舶，车辆，人脸数据列表
export function getTrackList(dto: any) {
  return post("/search/smart/track/list", dto, { isFormUrlencoded: true });
}

// 重点场所-场所布防-预警信息
export function getFocusAreaWarn(dto: any) {
  return get("/alarm/warnInfo/getFocusAreaWarn", dto);
}

// 根据场所id，返回关联的标签id
export function getLabelByPlaceId(dto: any) {
  return get('/admin/label/getLabelIdByPlaceId', dto)
}


// 重点场所-新增布控
export function addPlaceCtrl(dto: any) {
  return post("/alarm/controlInfo/create", dto);
}

// 重点场所-更新布控
export function updatePlaceCtrl(dto: any) {
  return post("/alarm/controlInfo/updateById", dto);
}