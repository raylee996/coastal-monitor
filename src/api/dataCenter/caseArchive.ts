import { get, post, put, requestDelete } from "helper/ajax";

/** ------- 案件管理模块接口 ------- */

// 案件列表
export function queryCaseArchive(dto: any) {
  return get("/archive/caseBase/pageList", dto);
}

// 新增案件
export function addCaseArchive(dto: any) {
  return post("/archive/caseBase/insert", dto, { successText: "新增案件" });
}

// 编辑案件
export function editCaseArchive(dto: any) {
  return put("/archive/caseBase/update", dto, { successText: "编辑案件" });
}

// 删除案件
export function delCaseArchive(dto: any) {
  return requestDelete("/archive/caseBase/deleteById", dto);
}

// 案件导入模板下载
export function downCaseArchiveTemplate(dto: any) {
  return get("/archive/caseBase/down/template", dto);
}

// 导入案件
export function importCaseArchive(dto: any) {
  return post("/archive/caseBase/import", dto, { isUploadFile: true });
}

/** ------- 案件信息 ------- */

// 查询单条案件信息
export function getCaseArchive(dto: any) {
  return get("/archive/caseBase/getInfo", dto);
}

// 涉案物品列表
export function queryCaseThing(dto: any) {
  return get("/archive/caseThing/selectByCaseId", dto);
}

// 新增涉案物品
export function addCaseThing(dto: any) {
  return post("/archive/caseThing/insert", dto, {
    successText: "新增涉案物品",
  });
}

// 编辑涉案物品
export function editCaseThing(dto: any) {
  return put("/archive/caseThing/update", dto, { successText: "编辑涉案物品" });
}

// 删除涉案物品
export function delCaseThing(dto: any) {
  return requestDelete("/archive/caseThing/deleteById", dto);
}

// 查询单条涉案物品
export function getCaseThing(dto: any) {
  return get("/archive/caseThing/selectById", dto);
}

/** ------- 案件进展 ------- */

// 查询案件进展时间线
export function qureyCaseProgressTimeLine(dto: any) {
  return get("/archive/caseProgress/selectByCaseId", dto);
}

// 查询单条案件进展内容
export function queryCaseProgress(dto: any) {
  return get("/archive/caseProgress/selectById", dto);
}

// 新增案件进展
export function addCaseProgress(dto: any) {
  return post("/archive/caseProgress/insert", dto, {
    successText: "新增案件进展",
  });
}

// 编辑案件进展
export function editCaseProgress(dto: any) {
  return post("/archive/caseProgress/update", dto, {
    successText: "编辑案件进展",
  });
}

/** ------- 涉案人员 ------- */

// 查询涉案人员
export function qureyCaseSuspects(dto: any) {
  return get("/archive/caseSuspects/pageList", dto);
}
export function qureyLegalCaseRelation(dto: any) {
  return get("/archive/caseSuspects/getLegalCaseRelation", dto);
}

// 查询单条涉案人员
export function getCaseSuspects(id: any) {
  return get(`/archive/caseSuspects/${id}`);
}

// 新增涉案人员
export function addCaseSuspects(dto: any) {
  return post("/archive/caseSuspects/add", dto, {
    successText: "新增涉案人员",
  });
}

// 删除涉案人员
export function delCaseSuspects(id: any) {
  return requestDelete(`/archive/caseSuspects/${id}`);
}

/** 更新案件视图信息 */
export function updateCaseUrls(dto: any) {
  return put("/archive/caseBase/updateUrls", dto, {
    successAlt: "操作成功",
  });
}
