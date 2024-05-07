

/** 预警目标自动研判api */

import { get, post, put, requestDelete } from "helper/ajax";

// 获取研判记录列表
export function getJudgeRecordApi(dto: any) {
    return get('/alarm/judgeRecord/list', dto)
}

// 获取高危目标列表
export function getJudgeRecordGroupByApi(dto: any) {
    return get('/alarm/judgeRecord/listGroupBy', dto)
}

//获取预案列表
export function getPlanList(dto: any) {
    return get('/alarm/plan/list', dto)
}

//新增预案
export function addPlan(dto: any) {
    return post('/alarm/plan/add', dto, { isUseResponse: true })
}

//删除预案
export function delPlan(id: any) {
    return requestDelete(`/alarm/plan/${id}`, {}, { successText: '删除' })
}

//编辑预案
export function editPlan(dto: any) {
    return put('/alarm/plan/edit', dto, { isUseResponse: true })
}

//预演
export function playPlan(dto: any) {
    return get('/alarm/plan/playPlan', dto)
}