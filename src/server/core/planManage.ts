import matching from 'helper/dictionary';
import { addPlan, delPlan, editPlan, getPlanList, playPlan } from "../../api/core/planManagement";
import { PageInfo } from "hooks/integrity/TableInterface";
import { getLabelTable } from "../label";
import { getModelList } from "api/model";
import { getDictDataByType } from 'server/system';

//获取模型列表
export async function getModelListAsync(pageInfo: PageInfo, params?: any) {
  let dto = {
    current: pageInfo.pageNumber,
    size: pageInfo.pageSize,
    ...params
  }
  return await getModelList(dto)
}

//获取预案列表
export async function getPlanListAsync(pageInfo: PageInfo, params: any) {
  let dto = {
    current: pageInfo.pageNumber,
    size: pageInfo.pageSize,
    ...params
  }
  let vo: any = await getPlanList(dto)
  const planTypeList: any = await getLabelTable({ type: 12 })
  //预案类型翻译
  for (let i = 0; i < vo.records.length; i++) {
    for (let j = 0; j < planTypeList.data.length; j++) {
      if (vo.records[i].planTypeId === planTypeList.data[j].id) {
        vo.records[i].planTypeName = planTypeList.data[j].labelName
      }
    }
  }
  let monitorTypeDict = await getDictDataByType("monitor_type")
  matching(vo.records, monitorTypeDict, 'monitorType')
  return {
    data: vo.records,
    total: vo.total,
  }
}

//新增预案
export async function addPlanAsync(params: any) {
  let dto: any = {
    ...params
  }
  let res = await addPlan(dto)
  return res
}

//删除预案
export async function delPlanAsync(id: any) {
  await delPlan(id)
}

//编辑预案
export async function editPlanAsync(dto: any) {
  await editPlan(dto)
}

//预演
export async function playPlanAsync(params: any) {
  let dto: any = {
    ...params
  }
  let vo: any = await playPlan(dto)
  return {
    data: vo
  }
}
