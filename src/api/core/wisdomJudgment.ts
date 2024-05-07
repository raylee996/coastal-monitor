import { get, post, put, requestDelete } from "helper/ajax";

//获取智能研判列表
export function getJudgmentList(dto: any) {
  return get("/analyze/analyzeTask/list", dto);
}

//获取智能研判详细信息
export function getJudgmentDetail(id:any){
  return get(`/analyze/analyzeTask/${id}`);
}


//删除研判
export function judgmentTaskDelete(id: any) {
  return requestDelete(`/analyze/analyzeTask/${id}`);
}

//编辑研判（关联案件）
export function judgmentEdit(dto: any) {
  return put("/analyze/analyzeTask/relateCase", dto);
}

//新增研判
export function judgmentAdd(dto: any) {
  return post("/analyze/analyzeTask/add", dto);
}

/*模型管理*/
export function getAnalyzeModelList(dto: any) {
  return get("/analyze/analyzeModel/list", dto);
}
/*新增模型*/
export function analyzeModelAdd(dto: any) {
  return post("/analyze/analyzeModel/add", dto);
}
/*编辑模型*/
export function analyzeModelEdit(dto: any) {
  return put("/analyze/analyzeModel/edit", dto);
}
/*删除模型*/
export function analyzeModelDel(id: any) {
  return requestDelete(`/analyze/analyzeModel/${id}`);
}
/*获取模型详细信息*/
export function analyzeModelDetail(id: any) {
  return get(`/analyze/analyzeModel/${id}`);
}

/** 查看结果 */
export function analyzeTaskList(dto: any) {
  return get("/analyze/analyzeTask/list", dto);
}

/**------查看结果-------*/

/*查询研判结果列表*/
export function judgeResultList(dto:any){
  return get("/search/judgeResult/page", dto);
}
/*点击结果，查看结果详情*/
export function viewResultDetail(dto:any){
  return get('/search/judgeResult/getInfo',dto)
}
/*点击结果 - 查看详情 - 关联信息*/
export function judgeResultListRelation(dto:any){
  return get('/search/judgeResult/listRelation',dto)
}
/**
 * 查询所有过程数据
 * */
export function getProcessDataList(dto:any){
  return get('/search/judgeResult/listProcessData',dto)
}

/**导出研判过程数据*/
export function exportProcessData(dto:any){
  return get('/search/judgeResult/exportProcessData',dto,{
    isRequestFile: true,
  })
}
