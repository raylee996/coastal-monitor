import { getHistoryTrackApi } from "api/dataCenter/shipSailing"
import { getShipRiskInfo, queryNewWarnTask } from "api/ship"
import { getShipInfoWarnTable, getWarnTableExport } from "api/warn"
import dayjs from "dayjs"
import { getEchartOptionByRiskRadar, getRiskLevelIconSrc, YMDHms, downloadFile } from "helper"
import matching, { getDictName, ShipRiskDict, warnStatusDict, opinionTypeDict } from "helper/dictionary"
import _ from "lodash"
import { getDictDataByType } from "./system"
import { FormInstance } from "antd";



/** 船舶信息-风险分布图*/
export async function getRiskRadarOption(data: { mmsi?: string, batchNum?: string }) {
  const dto = {
    codeType: data.mmsi ? 6 : 7,
    codeValue: data.mmsi || data.batchNum
  }

  const vo = await getShipRiskInfo(dto)

  const seriesData: number[] = []
  const indicatorData: any[] = []
  vo.items.forEach((item: any) => {
    switch (item.itemType) {
      case 'focus_type': //重点船舶
        seriesData.push(item.itemValue)
        indicatorData.push({ name: item.itemLabel, max: 1 })
        break;
      case 'risk_level': //预警等级
        seriesData.push(4 - item.itemValue)
        indicatorData.push({ name: item.itemLabel, max: 3 })
        break;
      case 'black_list': //黑名单船舶
        seriesData.push(item.itemValue)
        indicatorData.push({ name: item.itemLabel, max: 1 })
        break;
      case 'risk_score': //风险积分
        seriesData.push(item.itemValue > 100 ? 100 : item.itemValue)
        indicatorData.push({ name: item.itemLabel, max: 100 })
        break;
      case 'case_num': //涉案数量
        seriesData.push(item.itemValue > 3 ? 3 : item.itemValue)
        indicatorData.push({ name: item.itemLabel, max: 3 })
        break;
      default:
        break;
    }
  })

  const option = getEchartOptionByRiskRadar(indicatorData, seriesData)

  return option
}

/** 船舶信息-风险等级*/
export async function getRiskLevelText(data: { mmsi?: string, radarNumber?: string, targetId?: string }) {
  const dto = {
    codeType: data.targetId ? 8 : (data.mmsi ? 6 : 7),
    codeValue: data.targetId || data.mmsi || data.radarNumber
  }

  const vo = await getShipRiskInfo(dto)

  const src = getRiskLevelIconSrc(vo.riskLevel)

  const text = getDictName(ShipRiskDict, vo.riskLevel)

  return { text, src }
}

// 数据中心首页-最新预警
export function doQueryNewWarn(params: any, cb: (data: any) => void) {
  const dto = {
    size: 10,
    current: 1,
    ...params
  }
  return queryNewWarnTask(dto, cb)
}



// 数据中心首页-最新预警船舶轨迹
export async function getAlarmTargetTrack(params: any[]) {

  const list: any[] = []

  for (let i = 0; i < params.length; i++) {
    const param = params[i];
    const dto = {
      beginTime: dayjs(param.capTime).subtract(1, 'h').format(YMDHms),
      endTime: param.capTime,
      current: 1,
      size: 2000000
    }
    if (param.contentType === 7) {
      _.set(dto, 'uniqueId', param.warnContent)
    } else {
      _.set(dto, 'mmsi', param.warnContent)
    }
    const vo = await getHistoryTrackApi(dto)
    if (vo.content.length >= 2) {
      list.push([param, ...vo.content])
    }
  }

  return list
}

export async function getVideoWarn(params: any, signal: AbortController) {
  const dto = {
    size: 5,
    monitorType: '05',
    ...params
  }

  const vo = await getShipInfoWarnTable(dto, { signal })
  matching(vo.records, warnStatusDict, "status");
  vo.records.forEach((item: any) => {
    item?.dealRecord && matching([item.dealRecord], opinionTypeDict, "opinionType");
  })

  return [vo.records, vo.total]
}


// 获取布控类型字典
export async function getControlDict() {
  const warnTypeDict = await getDictDataByType("monitor_type")
  return warnTypeDict
}

// 情旨中心预警-导出
export async function exportWornFile(form: FormInstance) {
  const params = form.getFieldsValue();

  const { datetimeRange, ...otherParams } = params;

  const dto = {
    ...otherParams,
  };


  if (dto.datetime) {
    const [begin, end] = dto.datetime;
    dto.startWarnTime = begin.format(YMDHms);
    dto.endWarnTime = end.format(YMDHms);
  }

  // console.log(dto)
  const vo = await getWarnTableExport(dto);
  downloadFile(vo.data, "预警列表");
}
