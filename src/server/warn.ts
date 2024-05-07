import { getBehavirecordList } from 'api/search';
import { getShipWarnList, matchingRails } from 'api/ship';
import { getBehavirecordHeatMap, getDayRiskLevelStats, getHighIncidence, getListByWarnInfo, getRiskLevelHeatMap, getRiskTypeHeatMap, getRiskTypeStats, getWarnCountByEventType } from 'api/warn';
import { Dayjs } from 'dayjs';
import { YMDHms } from 'helper';
import matching from 'helper/dictionary';
import { getDayRiskLevelStatsOption, getRiskTypeOption, getWarnCountByEventTypeOption } from 'helper/echartsConfig';
import _ from 'lodash';
import { getDictDataByType } from './system';


/** 预警信息-时间范围 */
export async function getWarnData(dateTimeRange: [Dayjs, Dayjs]) {

  const [start, end] = dateTimeRange;

  const startWarnTime = start.format(YMDHms)
  const endWarnTime = end.format(YMDHms)

  const dto = {
    startWarnTime,
    endWarnTime
  }

  const [vo, monitorDict, levelDict, modelDict, deviceDict] = await Promise.all(
    [
      getShipWarnList(dto),
      getDictDataByType("monitor_type"),
      getDictDataByType("risk_level"),
      getDictDataByType("model_type"),
      getDictDataByType("device_type"),
    ]
  );

  const data = vo.records

  matching(data, monitorDict, "monitorType");
  matching(data, levelDict, "riskLevel");
  matching(data, modelDict, "warnType");
  matching(data, deviceDict, "deviceType");

  return data;

}

/** 船舶行为信息-时间范围 */
export async function getBehavirecordData(params: any) {
  const [start, end]: [Dayjs, Dayjs] = params.range;
  const count = end.diff(start, 'd')
  const rangeList: [Dayjs, Dayjs][] = []

  if (count === 0) {
    rangeList.push([start, end])
  } else {
    _.times(count, (index: number) => {
      if (index + 1 < count) {
        rangeList.push([start.add(index, 'd'), start.add(index + 1, 'd')])
      } else {
        rangeList.push([start.add(index, 'd'), end])
      }
    })
  }


  const valuse: any[] = []
  for (let i = 0; i < rangeList.length; i++) {
    const [s, e] = rangeList[i];
    const dto = {
      startTime: s.format(YMDHms),
      endTime: e.format(YMDHms),
      pageSize: 100,
      pageNumber: 1
    }
    const vo = await getBehavirecordList(dto)
    valuse.push(vo.records)
  }

  return _.flatten(valuse)
}


/** 船舶行为信息 */
export async function getWarnActions(params: any) {

  const dto = {
    ...params,
    pageSize: -1,
    pageNumber: 1
  }

  const vo = await getBehavirecordList(dto)

  return vo.records
}

/** 获取地图上展示船舶行为信息 */
export async function getTargetMapWarnActions(params: { mmsi: string, uniqueId: string }, range: [Dayjs, Dayjs]) {

  const { mmsi, uniqueId } = params
  const [startTime, endTime] = range

  const dto = {
    //beginTime: startTime.format(YMDHms),
    startTime: startTime.format(YMDHms),
    endTime: endTime.format(YMDHms),
    codeType: mmsi ? 6 : 7,
    codeValue: mmsi || uniqueId,
    pageSize: -1,
    pageNumber: 1
  }

  const vo = await getBehavirecordList(dto)

  return vo.records
}

/** 船舶行为信息-返回时间范围 */
export async function getWarnActionsAndDate(params: any) {

  const dto = {
    alarmId: params.id,
    monitorId: params.monitorId,
    monitorType: params.monitorType,
    // alarmId: '30367',
    // monitorId: 554,
    // monitorType: "03",
    pageSize: -1,
    pageNumber: 1
  }

  const vo = await getListByWarnInfo(dto)

  const _dto: any = {
    beginTime: vo.beginTime,
    endTime: vo.endTime
  }

  if (params.contentType === 6) {
    _dto.mmsi = params.warnContent
  } else {
    _dto.uniqueId = params.warnContent
  }

  const track = await matchingRails(_dto)

  let trackList: any[] = []
  let shipInfo: any

  if (!_.isEmpty(track.content)) {
    trackList = track.content.map((item: any) => {
      const { latitude, longitude, capTime } = item
      return {
        lat: latitude,
        lng: longitude,
        datetime: capTime
      }
    })

    const trackData: any = _.head(track.content)

    shipInfo = {
      lat: trackData.latitude,
      lng: trackData.longitude,
      speed: trackData.speed,
      course: trackData.course,
      heading: trackData.trueHeading,
      extraData: trackData
    }
  }

  return [vo.page ? vo.page.records : [], trackList, shipInfo]
}

/** 态势分析-预警威胁-船舶异常行为态势 */
export async function getBehavirecordHeatMapData(dateType: number, dateRange: string[], unusual: string[], focusType: string, signal: AbortController) {

  let dto: any = {
    focusType: focusType,
    eventType: unusual.toString()
  }

  if (dateType === 6) {
    if (dateRange && dateRange.length === 2) {
      const [beginTime, endTime] = dateRange
      dto.beginTime = beginTime
      dto.endTime = endTime
    } else {
      return []
    }
  } else {
    dto.dateType = dateType
  }

  const vo = await getBehavirecordHeatMap(dto, { signal })

  // const latlngList = vo.map((item: any) => ({
  //   latLng: [item.latitude, item.longitude],
  //   options: {
  //     radius: 20,
  //     fillColor: '#b0f4ff',
  //     fillOpacity: 0.05,
  //   }
  // }))

  const latlngList = vo.map((item: any) => ({
    latLng: {
      lat: item.latitude,
      lng: item.longitude
    },
    radius: 20,
    color: 'rgba(176, 244, 255, 0.05)'
  }))

  return latlngList
}

/** 态势分析-预警威胁-风险等级筛选 */
export async function getRiskHeatMapData(dateType: number, dateRange: string[], riskLevels: number[], focusType: string, signal: AbortController) {

  let dto: any = {
    focusType: focusType,
    riskLevels: riskLevels.toString()
  }

  if (dateType === 6) {
    if (dateRange && dateRange.length === 2) {
      const [beginTime, endTime] = dateRange
      dto.startWarnTime = beginTime
      dto.endWarnTime = endTime
    } else {
      return []
    }
  } else {
    dto.dateType = dateType
  }

  const vo = await getRiskLevelHeatMap(dto, { signal })

  const latlngList = vo.map((item: any) => {
    let color = ''
    switch (Number(item.riskLevel)) {
      case 1:
        color = 'rgba(255, 77, 79, 0.05)'
        break;
      case 2:
        color = 'rgba(255, 169, 64, 0.05)'
        break;
      case 3:
        color = 'rgba(250, 219, 20, 0.05)'
        break;
      default:
        color = 'rgba(250, 219, 20, 0.05)'
        break;
    }
    return {
      latLng: {
        lat: item.latitude,
        lng: item.longitude
      },
      radius: 20,
      color
    }
  })

  return latlngList
}

/** 态势分析-预警威胁-船舶风险类别态势 */
export async function getRiskTypeStatsData(dateType: number, dateRange: string[], riskTypeIds: number[], focusType: string, signal: AbortController) {

  let dto: any = {
    focusType: focusType,
    riskTypeIds: riskTypeIds.toString()
  }

  if (dateType === 6) {
    if (dateRange && dateRange.length === 2) {
      const [beginTime, endTime] = dateRange
      dto.startWarnTime = beginTime
      dto.endWarnTime = endTime
    } else {
      return []
    }
  } else {
    dto.dateType = dateType
  }

  const vo = await getRiskTypeHeatMap(dto, { signal })

  // const latlngList = vo.map((item: any) => {
  //   return {
  //     latLng: [item.latitude, item.longitude],
  //     options: {
  //       radius: 20,
  //       fillColor: '#52c41a',
  //       fillOpacity: 0.05,
  //     }
  //   }
  // })

  const latlngList = vo.map((item: any) => ({
    latLng: {
      lat: item.latitude,
      lng: item.longitude
    },
    radius: 20,
    color: 'rgba(82, 196, 26, 0.05)'
  }))

  return latlngList
}

/** 态势感知-预警威胁-风险船舶数量趋势 */
export async function getRiskTypeStatisticsData(
  dateType: number,
  focusType: string,
  signal?: AbortController
) {
  const dto: any = {
    dateType
  }

  if (focusType) {
    dto.focusType = focusType
  }

  const vo = await getRiskTypeStats(dto, { signal })

  const data = vo.map((item: any) => ({
    name: `${item.itemName} ${item.count}`,
    value: item.count
  }))

  const option = getRiskTypeOption(data)

  return option
}

/** 态势感知-预警威胁-预警风险趋势 */
export async function getDayRiskLevelStatsData(focusType: string, signal?: AbortController) {
  const dto: any = {
    dateType: 2
  }

  if (focusType) {
    dto.focusType = focusType
  }

  const vo = await getDayRiskLevelStats(dto, { signal })

  const count0: number[] = []
  const count1: number[] = []
  const count2: number[] = []
  const count3: number[] = []

  const xAxisData: string[] = []

  vo.forEach((item: any) => {
    switch (item.name) {
      case '总数':
        count0.push(item.count)
        xAxisData.push(item.dataKey2)
        break;
      case '高风险':
        count1.push(item.count)
        break;
      case '中风险':
        count2.push(item.count)
        break;
      case '低风险':
        count3.push(item.count)
        break;
      default:
        break;
    }
  })

  const option = getDayRiskLevelStatsOption(xAxisData, count0, count1, count2, count3)

  return option
}

/** 态势感知-预警威胁-风险船舶数量趋势 */
export async function getWarnCountByEventTypeData(
  dateType: number,
  focusType: string,
  signal?: AbortController
) {
  const dto: any = {
    dateType
  }

  if (focusType) {
    dto.focusType = focusType
  }

  const vo = await getWarnCountByEventType(dto, { signal })

  const data = vo.map((item: any) => ({
    name: `${item.labelName} ${item.itemNum}`,
    value: item.itemNum
  }))

  const option = getWarnCountByEventTypeOption(data)

  return option
}

/** 态势感知-预警威胁-风险船舶数量趋势 */
export async function getHighIncidenceData(dateType: number, dateRange: string[], focusType: string, signal?: AbortController) {

  let dto: any = {
    focusType
  }

  if (dateType === 6) {
    if (dateRange && dateRange.length === 2) {
      const [beginTime, endTime] = dateRange
      dto.startWarnTime = beginTime
      dto.endWarnTime = endTime
    } else {
      return []
    }
  } else {
    dto.dateType = dateType
  }

  const vo = await getHighIncidence(dto, { signal })

  return vo
}