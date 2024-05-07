import { get, post, put, requestDelete } from "helper/ajax";

/** 智慧指挥主体相关 */
export function queryCommanderCommandApi(dto: any) {
  return get("/alarm/command/list", dto);
}

export function addCommanderCommandApi(dto: any) {
  return post("/alarm/command/add", dto, { successText: "新增指挥任务" });
}

export function queryCommandDetailApi(dto: any) {
  return get("/alarm/command/getById", dto);
}

export function updateCommanderCommandApi(dto: any) {
  return put("/alarm/command/edit", dto, { successText: "修改指挥任务" });
}

export function deleteCommanderCommandApi(id: any) {
  return requestDelete(
    `/alarm/command/${id}`,
    {},
    { successText: "删除指挥任务" }
  );
}

// 实时指挥相关接口
export function queryRealTimeCommandApi(dto: any) {
  return get("/alarm/command/list", dto);
}

// 根据token或用户id获取用户基本信息（含所属部门）
export function queryUserInfo(dto: any) {
  return get("/system/user/getInfo", dto, { isFormUrlencoded: true });
}

// 获取审批人
export function queryApproveUser(dto: any){
  return get("/system/user/list", dto);
}

/** 智慧指挥反馈相关 */
export function queryCommandProcessApi(dto: any) {
  return get("/alarm/commandProcess/list", dto);
}

export function addCommandProcessApi(dto: any) {
  return post("/alarm/commandProcess/add", dto, {
    successText: "提交任务反馈",
  });
}

/** 根据mmsi或雷达批号查询涉案列表 */
export function queryCommandCaseApi(dto: any) {
  return get("/archive/ship/commandCaseList", dto);
}

/** 行为分析 */
export function queryCommandAnalyseBehaviorApi(dto: any) {
  return post("/alarm/command/analyseBehavior", dto);
}

/** 智慧指挥任务回放 */
export function queryCommandPlayTaskApi(dto: any) {
  return get("/alarm/command/playTask", dto);
}
