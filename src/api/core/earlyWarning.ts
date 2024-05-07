import { Config, get, post } from "helper/ajax";

export function graphqlWarning(dto: any) {
  return post("/graphql/warning", dto, { isNotToken: true, isGraphql: true });
}

export function getWarningApi(dto: any, config?: Config) {
  return get("/alarm/warnInfo/warnListV2", dto, config);
}

export function getWarningDetailApi(dto: any) {
  return get(`/alarm/warnInfo/${dto.id}`, {});
}

export function getWarningVudioListApi(dto: any) {
  return get("/search/fileInfo/list", dto);
}

export function handleWarningResult(dto: any) {
  return post("/alarm/warnInfo/deal", dto, { successText: "预警处理" });
}

// 根据预警查询行为记录列表
export function handleBehaviorApi(dto: any, config?: Config) {
  return get("/search/behavirecord/getListByWarnInfo", dto, config);
}

export function getWarningV3Api(dto: any, config?: Config) {
  return get("/alarm/warnInfo/warnListV3", dto, config);
}