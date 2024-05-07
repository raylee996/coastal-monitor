import { Config, get, post, put, requestDelete } from "helper/ajax";

// 获取车辆档案
export function getCarInfo(dto: any) {
  return get("/archive/car/getInfo", dto);
}

// 获取车辆档案列表
export function getCarList(dto: any, config?: Config) {
  return get("/archive/car/list", dto, config);
}

// 新增车辆档案
export function addCar(dto: any) {
  return post("/archive/car/add", dto, { successText: '新增车辆档案' });
}

// 编辑车辆档案
export function editCar(dto: any) {
  return put("/archive/car/edit", dto, { successText: '编辑车辆档案' });
}

// 删除车辆档案
export function delCar(dto: any) {
  return requestDelete(`/archive/car/${dto.id}`, {}, { successText: '删除车辆档案' })
}


// 获取车辆档案涉案列表
export function getCarCaseList(dto: any) {
  return get("/archive/car/caseList", dto);
}


// 获取车辆档案-预警信息列表
export function getCarWarnListV2(dto: any) {
  return get("/alarm/warnInfo/warnListV2", dto);
}

// 查询车辆类型分类数量
export function getCarTypeCount(dto: any) {
  return get(`/archive/car/carTypeCount`, dto);
}

// 导入车辆
export function importCars(dto: any) {
  return post("/archive/car/import", dto, { isUploadFile: true });
}

