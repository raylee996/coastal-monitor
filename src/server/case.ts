import { getCaseRecordModel, setCaseRecordModel } from "api/case"
import { getWarningV3Api } from "api/core/earlyWarning"
import { getModelList } from "api/model"
import { Dayjs } from "dayjs"
import { YMDHms } from "helper"
import matching from "helper/dictionary"
import { Type } from "hooks/hooks"
import { PageInfo } from "hooks/integrity/TableInterface"
import _ from "lodash"
import { getDictDataByType } from "./system"


/** 获取案件档案关联模型列表 */
export async function getCaseRecordModelList(params: any) {
  const dto = {
    ...params
  }
  const vo = await getCaseRecordModel(dto)

  const modelIds: number[] = vo.records.map((ele: any) => ele.modelId)

  const modelIdsStr = modelIds.join(',')

  const dict: Type<number>[] = vo.records.map((ele: any) => ({
    value: ele.modelId,
    name: ele.modelName
  }))

  return {
    ids: modelIdsStr,
    list: dict
  }
}

/** 获取模型下拉选项 */
export async function getCaseModelListDict() {
  const dto = {
    pageNumber: 1,
    pageSize: -1,
  }
  const vo = await getModelList(dto)

  const result: Type<number>[] = vo.records.map((item: any) => {
    return {
      name: item.modelName,
      value: item.modelId
    }
  })

  return result
}

/** 获取案件档案记录的表格数据 */
export async function getCaseRecordTableData(pageInfo: PageInfo, params: any) {

  const { datetimeRange, monitorIds, ...othParams } = params

  // 用户未选择关联模型不调用后端接口，直接返回空
  if (!monitorIds) {
    return {
      data: [],
      total: 0,
    }
  }

  const dto = {
    monitorIds,
    ...pageInfo,
    ...othParams
  }

  if (datetimeRange) {
    const [sTime, eTime]: [Dayjs, Dayjs] = datetimeRange
    _.set(dto, 'startTime', sTime.format(YMDHms))
    _.set(dto, 'endTime', eTime.format(YMDHms))
  }

  const vo = await getWarningV3Api(dto)

  const riskLevelDict = await getDictDataByType('risk_level', 'number')
  const monitorTypeDict = await getDictDataByType('monitor_type')

  matching(vo.records, riskLevelDict, 'riskLevel')
  matching(vo.records, monitorTypeDict, 'monitorType')

  const reuslt = vo.records.map((item: any) => {
    return {
      ...item,
      lnglat: `${item.longitude}/${item.latitude}`
    }
  })

  return {
    data: reuslt,
    total: vo.total,
  }
}

/** 获取案件档案记录的表格数据 */
export async function setCaseRecordModelList(id: number, modelIds: number[]) {
  const dto = {
    caseId: id,
    modelIds
  }
  await setCaseRecordModel(dto)
}