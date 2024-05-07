import {get, post, put, requestDelete} from "helper/ajax";

//获取线索列表
export function getClueList(dto:any){
  return get("/analyze/clueInfo/page", dto);
}

//删除线索
export function delClue(id:any){
  return requestDelete(`/analyze/clueInfo/${id}`)
}

//新增线索
export function addClue(dto:any){
  return post('/analyze/clueInfo/add',dto)
}

//编辑线索
export function editClue(dto:any){
  return put('/analyze/clueInfo/edit',dto)
}
