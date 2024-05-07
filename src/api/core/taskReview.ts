import {post,get} from "../../helper/ajax";

//任务回顾-任务来源统计
export function statisticsSource(dto:any){
  return post('/alarm/command/statistics/statisticsSource',dto)
}

//任务回顾-任务用时统计
export function statisticsTime(dto:any){
  return post('/alarm/command/statistics/statisticsTime',dto)
}

//任务回顾-关联案件统计
export function statisticsCase(dto:any){
  return post('/alarm/command/statistics/statisticsCase',dto)
}

//任务回顾-关联案件统计
export function statisticsChargePerson(dto:any){
  return post('/alarm/command/statistics/statisticsChargePerson',dto)
}

//任务回顾-列表
export function taskReviewList(dto:any){
  return get('/alarm/command/list',dto)
}
