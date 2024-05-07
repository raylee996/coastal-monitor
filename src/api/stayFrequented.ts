import { get, post } from "helper/ajax";

/** 提交常去地任务 */
export function stayTaskApi(dto: any) {
  return post("/analyze/stayTask/submit", dto);
}

/** 常去地结果查询 */
export function searchStayApi(dto: any) {
  // , { isFormUrlencoded: true }
  return get("/search/stayAnalyzeResult/list", dto);
}
