import { Config, get, post, } from "helper/ajax";

// 获取案件档案记录关联的智慧建模
export function getCaseRecordModel(dto: any, config?: Config) {
  return get("/archive/caseBase/getCaseModelRelationList", dto, config);
}

// 新增案件档案记录关联的智慧建模
export function setCaseRecordModel(dto: any, config?: Config) {
  return post("/archive/caseBase/addModelRelations", dto, config);
}