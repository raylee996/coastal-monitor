import { datetimeSort, getShipWarnActionOptions, getShipWarnDateOptions, getShipWarnLevelOptions, MDpoint, YMD, YMDHms } from './../helper/index';
import { getAlarmActionStatistics, getAlarmDayStatistics, getAlarmHourStatistics, getAlarmLevelStatistics, getAlarmMonthStatistics, getAlarmWarnTypeStatsStatistics, getAreaAlarmRank, getCollectionDataCount, getCollectionNewCount, getDeviceStatusStatistics, getFaultDeviceStatistics, getFineDeviceStatistics, getShipTypeCount, getStatisticsAreainfoList, getStatisticsCaseLabelStats, getStatisticsCaseNumStats, getStatisticsCaseNumTend, getStatisticsControlNumTend, getStatisticsCountByCategory, getStatisticsCountByTarget, getStatisticsCountControlTotal, getStatisticsCountWarningTotal, getStatisticsEventCountByDate, getStatisticsEventCountByEventType, getStatisticsEventCountByTimeInterval, getStatisticsEventList, getStatisticsWarnInfoList, getStatisticsWarningMonitorTypeStats, getWarnShipStatistics } from "api/statistics";
import { Moment } from 'moment';
import { getDictDataByType } from './system';
import matching, { getDictName, shipTypeDict, warnStatusDict } from 'helper/dictionary';
import dayjs, { Dayjs } from 'dayjs';
import _ from 'lodash';
import { getRealTimeShipDataStatistics, getRealTimeShipStatisticsWorker, getWarningDayStats } from 'api/situation';
import { getBehivorEchartsPieSimple, getCollectionOption, getDeviceFineAndFaultOption, getDeviceTypeOption, getEchartsControlBarTick, getNoDataEchartsOption, getShipCountOption, getShipTypeOption, getWarnShipStatisticsOption } from 'helper/echartsConfig';
import { getDeviceOnlineCount } from 'api/device';
import { getPlacesList } from 'api/place';
import { PageInfo } from 'hooks/integrity/TableInterface';
import { getLabelList } from 'api/label';
import common from 'helper/common';
import { DayjsRange } from 'hooks/hooks';

function addDtoCodeValue(dto: any, shipData: any) {
  if (shipData.targetId) {
    dto.fusionId = shipData.targetId
  } else if (shipData.mmsi) {
    dto.codeValue = shipData.mmsi
    dto.contentType = 6
  } else if (shipData.radarNumber) {
    dto.codeValue = shipData.radarNumber
    dto.contentType = 7
  } else {
    // dto.codeValue = _.uniqueId('front_')
  }
  return dto
}


/** 船舶档案-预警信息-风险等级统计*/
export async function getRiskLevelOptions(param: string, shipData: any) {
  let dto: any = {
    endWarnTime: dayjs().set('h', 23).set('m', 59).set('s', 59).format(YMDHms)
  }

  dto = addDtoCodeValue(dto, shipData)

  if (param === 'month') {
    dto.startWarnTime = dayjs().subtract(1, 'M').set('h', 0).set('m', 0).set('s', 0).format(YMDHms)
  } else {
    dto.startWarnTime = dayjs().subtract(1, 'y').set('h', 0).set('m', 0).set('s', 0).format(YMDHms)
  }

  const [vo, levelDict] = await Promise.all([getAlarmLevelStatistics(dto), getDictDataByType('risk_level')])

  let options: any = getNoDataEchartsOption()
  let data: any = []
  if (vo.length !== 0) {
    vo.forEach((ele: any) => {
      if (!ele.itemName.includes('总计')) {
        data.push({
          name: getDictName(levelDict, ele.dataItem),
          value: Number(ele.count)
        })
      }
    })
    options = getShipWarnLevelOptions(data, { series: { name: '风险等级' } })
  }

  return options;
}

/** 船舶档案-预警信息-预警行为统计*/
export async function getActionlOptions(param: string, shipData: any) {
  let dto: any = {
    endWarnTime: dayjs().set('h', 23).set('m', 59).set('s', 59).format(YMDHms)
  }

  dto = addDtoCodeValue(dto, shipData)

  if (param === 'month') {
    dto.startWarnTime = dayjs().subtract(1, 'M').set('h', 0).set('m', 0).set('s', 0).format(YMDHms)
  } else {
    dto.startWarnTime = dayjs().subtract(1, 'y').set('h', 0).set('m', 0).set('s', 0).format(YMDHms)
  }

  const [vo, modelDict] = await Promise.all([getAlarmWarnTypeStatsStatistics(dto), getDictDataByType('warn_type')])

  const data = vo.map((ele: any) => {
    const name = getDictName(modelDict, ele.dataItem)
    return {
      name,
      value: Number(ele.count)
    }
  })
  let filterData = data.filter((item: any) => item.name !== '')

  const options = getShipWarnActionOptions(filterData)

  return options;
}

/** 船舶档案-预警信息-每月预警统计*/
export async function getWarnMonthOptions(params: Moment[], shipData: any) {
  const [startMoment, endMoment] = params

  let dto: any = {
    startWarnTime: startMoment.format(YMDHms),
    endWarnTime: endMoment.format(YMDHms)
  }

  dto = addDtoCodeValue(dto, shipData)


  const vo = await getAlarmMonthStatistics(dto)

  const xAxisData = vo.map((ele: any) => ele.dataItem)
  const seriesData = vo.map((ele: any) => ele.count)

  const options = getShipWarnDateOptions(xAxisData, seriesData)

  return options;
}

/** 船舶档案-预警信息-每日预警统计*/
export async function getWarnDateOptions(params: DayjsRange, shipData: any) {

  let dto: any = {}

  if (params) {
    const [startMoment, endMoment] = params
    dto.startWarnTime = dayjs(startMoment).set('h', 0).set('m', 0).set('s', 0).format(YMDHms)
    dto.endWarnTime = dayjs(endMoment).set('h', 23).set('m', 59).set('s', 59).format(YMDHms)
  }

  dto = addDtoCodeValue(dto, shipData)

  const vo = await getAlarmDayStatistics(dto)
  vo.forEach((ele: any) => {
    ele.dataItem = dayjs(ele.dataItem).format('MM.DD')
  })

  const xAxisData = vo.map((ele: any) => ele.dataItem)
  const seriesData = vo.map((ele: any) => ele.count)

  const options = getShipWarnDateOptions(xAxisData, seriesData)

  return options;
}

/** 船舶档案-预警信息-每日预警统计*/
export async function getAlarmHourData(param: string, shipData: any) {
  let dto: any = {
    endWarnTime: dayjs().set('h', 23).set('m', 59).set('s', 59).format(YMDHms)
  }

  dto = addDtoCodeValue(dto, shipData)

  if (param === 'month') {
    dto.startWarnTime = dayjs().subtract(1, 'M').set('h', 0).set('m', 0).set('s', 0).format(YMDHms)
  } else {
    dto.startWarnTime = dayjs().subtract(1, 'y').set('h', 0).set('m', 0).set('s', 0).format(YMDHms)
  }

  const vo = await getAlarmHourStatistics(dto)

  return vo;
}

// 态势分析-感知目标-统计信息
export async function getTargetStatistic() {
  const vo = await getRealTimeShipDataStatistics();
  return vo
}

// 态势分析-感知目标-统计信息-worker
export function getTargetStatisticWorker(cb: (data: any) => void) {
  return getRealTimeShipStatisticsWorker(cb);
}

// 态势分析-基础设施-采集数据统计
export async function getShipTotalStatistics() {

  const dto = {
    endTime: dayjs().set('h', 23).set('m', 59).set('s', 59).format(YMDHms),
    beginTime: dayjs().set('h', 0).set('m', 0).set('s', 0).subtract(7, 'd').format(YMDHms),
    isRepeat: true
  }

  const aisCount = await getCollectionDataCount({ ...dto, type: 3 })

  const radarCount = await getCollectionDataCount({ ...dto, type: 4 })

  const xAxisData = _.keys(aisCount).sort()

  const seriesDataA: number[] = []
  _.forIn(aisCount, (value: number) => {
    seriesDataA.push(value)
  })

  const seriesDataB: number[] = []
  _.forIn(radarCount, (value: number) => {
    seriesDataB.push(value)
  })

  const option = getShipCountOption(xAxisData, seriesDataA, seriesDataB)

  return option
}

// 态势分析-感知目标-AIS船舶类型分布
export async function getShipTypeStatistic(type: number) {
  const dto = {
    type
  }
  const vo = await getShipTypeCount(dto);
  const dict = await getDictDataByType('archive_ship_type')

  const data: { value: number, name: string }[] = []

  _.forIn(vo, (value, key) => {
    const typeName = getDictName(dict, key)
    data.push({
      name: `${typeName} ${value}`,
      value
    })
  })

  const option = getShipTypeOption(data)

  return option
}

// 态势分析-基础设施-统计信息
export async function getDeviceStatusStatisticData() {
  const vo = await getDeviceStatusStatistics();
  return vo
}

// 态势分析-基础设施-设备数量统计
export async function getDeviceTypeStatisticData() {
  const vo = await getDeviceOnlineCount(null);

  let option: any = getNoDataEchartsOption()
  const data: { value: number, name: string }[] = []

  if (vo.length !== 0) {
    vo.forEach((item: any) => {
      data.push({
        name: `${item.labelName} ${item.itemNum}`,
        value: item.itemNum
      })
    })
    option = getDeviceTypeOption(data)
  }


  return option
}

// 态势分析-基础设施-设备状态统计
export async function getDeviceFineAndFaultData() {

  const fineVo = await getFineDeviceStatistics();
  const faultVo = await getFaultDeviceStatistics();
  const xAxisData = _.keys(fineVo)

  const seriesDataA: number[] = []
  _.forIn(fineVo, (value: number) => {
    seriesDataA.push(value)
  })

  const seriesDataB: number[] = []
  _.forIn(faultVo, (value: number) => {
    seriesDataB.push(value)
  })

  const option = getDeviceFineAndFaultOption(xAxisData, seriesDataA, seriesDataB)

  return option
}

// 态势分析-基础设施-采集数据统计
export async function getDeviceCollectData(isRepeat: boolean, type: number) {

  const dataCount = await getCollectionDataCount({
    endTime: dayjs().set('h', 23).set('m', 59).set('s', 59).format(YMDHms),
    beginTime: dayjs().subtract(7, 'd').format(YMDHms),
    type,
    isRepeat
  })

  const newCount = await getCollectionNewCount({
    type
  })

  const xAxisData = _.keys(dataCount).sort()

  const seriesDataA: number[] = []
  _.forIn(newCount, (value: number) => {
    seriesDataA.push(value)
  })

  const seriesDataB: number[] = []
  _.forIn(dataCount, (value: number) => {
    seriesDataB.push(value)
  })

  const option = getCollectionOption(xAxisData, seriesDataA, seriesDataB)

  return option
}

/** 态势感知-感知目标-风险船舶数量趋势 */
export async function getWarnShipStatisticsData() {
  const dto = {
    startWarnTime: dayjs().subtract(7, 'd').format(YMD),
    endWarnTime: dayjs().format(YMD),
    dateType: 2
  }

  const vo = await getWarnShipStatistics(dto)

  const aisList: any[] = []
  const radarList: any[] = []

  vo.forEach((ele: any) => {
    ele.dateFormat = dayjs(ele.dataKey2, 'YYYYMMDD').format(YMD)
    if (ele.dataKey1 === '6') {
      aisList.push(ele)
    } else if (ele.dataKey1 === '7') {
      radarList.push(ele)
    } else {
      console.warn('风险船舶数量趋势，返回了既不是AIS也不是雷达统计数据', ele)
    }
  })

  datetimeSort(aisList, 'dateFormat')
  datetimeSort(radarList, 'dateFormat')

  const xAxisData = aisList.map(ele => ele.dateFormat)

  const seriesDataA: number[] = aisList.map(ele => ele.count)

  const seriesDataB: number[] = radarList.map(ele => ele.count)

  const option = getWarnShipStatisticsOption(xAxisData, seriesDataA, seriesDataB)

  return option
}


/** 数据统计-布控预警信息-布控预警统计-布控总数-场所下载 */
export async function doGetStatisticsPlace() {
  const dto = {
    pageSize: -1,
    pageNumber: 1
  }

  let placeData: any[] = []

  // 查询区域记录列表
  const voArea = await getStatisticsAreainfoList({ type: '2,3,4', ...dto })
  voArea.forEach((element2: any) => {
    placeData.push({
      value: element2.id,
      label: element2.name,
      typeId: 1
    })
  })

  // 查询重点场所列表
  const voPlace = await getPlacesList(dto)
  voPlace.records.forEach((element1: any) => {
    placeData.push({
      value: element1.id,
      label: element1.name,
      typeId: 2
    })
  })

  return {
    data: placeData
  }
}

/** 数据统计-布控预警信息-布控预警统计-布控总数 */
export async function doGetContralStatistics(params?: any) {
  const dto: any = {
  }

  if (params.areaId) {
    dto.areaId = params.areaId
  }

  if (params.typeId) {
    dto.typeId = params.typeId
  }

  const vo = await getStatisticsCountControlTotal(dto)
  return vo
}


/** 数据统计-布控预警信息-布控预警统计-预警总数 */
export async function doGetWarningStatistics(params?: any) {
  const dto: any = {
  }

  if (params.areaId) {
    dto.areaId = params.areaId
  }

  if (params.typeId) {
    dto.typeId = params.typeId
  }

  // 选择区域时
  if (params.typeId === 1) {
    // dto.monitorType = '04'
  }

  const vo = await getStatisticsCountWarningTotal(dto)
  return vo
}

/** 数据中心-数据统计-布控预警信息-布控数量趋势 */
export async function doGetStatisticsControlNumTend(params?: any) {
  const dto: any = {
    dateType: 1 //(1: 近7天; 2: 近1个月; 3: 近一年
  }

  if (params.controlTime === 'day') {
    dto.dateType = 2
  } else if (params.controlTime === 'month') {
    dto.dateType = 3
  } else if (params.controlTime === 'year') {
    dto.dateType = 4
  }

  const vo = await getStatisticsControlNumTend(dto)

  let options: any = getNoDataEchartsOption()
  let dataTotalArr: any[] = []
  let dayArr: any[] = []

  if (vo.length !== 0) {
    vo.forEach((element: any) => {
      dayArr.push(element.label)
      dataTotalArr.push(element.num)
    });

    options = getEchartsControlBarTick(
      {
        legendData: [],
        xAxisData: dayArr,
        seriesData: dataTotalArr
      },
      {
        yAxis: {
          axisLabel: {
            show: true,
            textStyle: {
              color: "#79a7e3"
            }
          }
        },
        xAxis: {
          axisLabel: {
            show: true,
            textStyle: {
              color: "#79a7e3"
            }
          }
        }
      }
    )
  }



  return {
    data: vo,//原始数据
    options: options//echarts图表
  }
}



/** 数据中心-数据统计-布控预警信息-布控分类统计(船舶 | 人员) */
export async function doGetStatisticsCountByCategory(params?: any) {
  const dto: any = {
    controlCategory: params.controlCategory //布控类型(1: 船舶布控, 2:人车布控, 3: 场所布控, 4:智慧建模, 5: 视频布控)
  }

  if (params.time) {
    dto.startTime = dayjs(params.time[0]).format(YMD) + ' 00:00:00'
    dto.endTime = dayjs(params.time[1]).format(YMD) + ' 23:59:59'
  }

  const vo = await getStatisticsCountByCategory(dto)

  let options: any = getNoDataEchartsOption()
  // 组装饼图数据
  let seriesData: any = []
  if (vo.length !== 0) {
    vo.forEach((element: any) => {
      seriesData.push({ value: element.num, name: element.label })
    });

    // 获取饼图echarts配置对象
    options = getBehivorEchartsPieSimple({ seriesData })
  }

  return {
    data: vo, // 原始数据
    options: options // echarts图表
  }
}




/** 数据中心-数据统计-布控预警信息-布控对象统计 */
export async function doGetStatisticsCountByTarget(params?: any) {
  const dto: any = {
    controlCategory: params.controlCategory //布控类型(1: 船舶布控, 2:人车布控, 3: 场所布控, 4:智慧建模, 5: 视频布控)
  }

  if (params.time) {
    dto.startTime = dayjs(params.time[0]).format(YMD) + ' 00:00:00'
    dto.endTime = dayjs(params.time[1]).format(YMD) + ' 23:59:59'
  }

  const vo = await getStatisticsCountByTarget(dto)

  let options: any = getNoDataEchartsOption()

  // 组装饼图数据
  let seriesData: any = []
  if (vo.length !== 0) {
    vo.forEach((element: any) => {
      seriesData.push({ value: element.num, name: element.label })
    });

    // 获取饼图echarts配置对象
    options = getBehivorEchartsPieSimple({ seriesData })
  }

  return {
    data: vo, // 原始数据
    options: options // echarts图表
  }
}




/** 数据中心-数据统计-布控预警信息-预警数量趋势 */
export async function doGetStatisticsWarningDayStats(params?: any) {
  const dto: any = {
    dateType: 2 //(2: 近7天; 3: 近1个月; 4: 近一年
  }

  if (params.warningTime === 'day') {
    dto.dateType = 2
  } else if (params.warningTime === 'month') {
    dto.dateType = 3
  } else if (params.warningTime === 'year') {
    dto.dateType = 4
  }

  const vo = await getWarningDayStats(dto)

  let options: any = getNoDataEchartsOption()
  let dataTotalArr: any[] = []
  let dayArr: any[] = []

  if (vo.length !== 0) {
    vo.forEach((element: any) => {
      dayArr.push(dayjs(element.dataItem).format(MDpoint))
      dataTotalArr.push(Number(element.count))
    });

    options = getEchartsControlBarTick(
      {
        legendData: [],
        xAxisData: dayArr,
        seriesData: dataTotalArr
      },
      {
        yAxis: {
          axisLabel: {
            show: true,
            textStyle: {
              color: "#79a7e3"
            }
          }
        },
        xAxis: {
          axisLabel: {
            show: true,
            textStyle: {
              color: "#79a7e3"
            }
          }
        }
      }
    )

  }

  return {
    data: vo,//原始数据
    options: options//echarts图表
  }
}


/** 数据中心-数据统计-布控预警信息-人员预警分类统计(船舶 | 人员) */
export async function doGetStatisticsWarningByCategory(params?: any) {
  const dto: any = {
    monitorType: params.monitorType // 0104船舶,03人员
  }

  if (params.time) {
    dto.startWarnTime = dayjs(params.time[0]).set('h', 0).set('m', 0).set('s', 0).format(YMDHms)
    dto.endWarnTime = dayjs(params.time[1]).set('h', 23).set('m', 59).set('s', 59).format(YMDHms)
  }

  const vo = await getAlarmActionStatistics(dto)
  let options: any = getNoDataEchartsOption()

  // 组装饼图数据
  let seriesData: any = []
  if (vo.length !== 0) {
    vo.forEach((element: any) => {
      seriesData.push({ value: element.count, name: element.itemName })
    });

    // 获取饼图echarts配置对象
    options = getBehivorEchartsPieSimple({ seriesData })
  }

  return {
    data: vo, // 原始数据
    options: options // echarts图表
  }
}


/** 数据中心-数据统计-布控预警信息-预警对象统计 */
export async function doGetStatisticsWarningByTarget(params?: any) {
  const dto: any = {
  }

  if (params.time) {
    dto.startWarnTime = dayjs(params.time[0]).format(YMD) + ' 00:00:00'
    dto.endWarnTime = dayjs(params.time[1]).format(YMD) + ' 23:59:59'
  }

  const vo = await getStatisticsWarningMonitorTypeStats(dto)

  let options: any = getNoDataEchartsOption()
  // 组装饼图数据
  let seriesData: any = []
  if (vo.length !== 0) {
    vo.forEach((element: any) => {
      seriesData.push({ value: element.count, name: element.itemName })
    });

    // 获取饼图echarts配置对象
    options = getBehivorEchartsPieSimple({ seriesData })
  }

  return {
    data: vo, // 原始数据
    options: options // echarts图表
  }
}


/** 数据中心-数据统计-布控预警信息-预警信息记录 */
export async function doGetStatisticsWarnInfoList(pageInfo?: PageInfo, params?: any) {
  const dto: any = {
    monitorType: params.monitorType, // 布控类型
    warnContent: params.warnContent, // 预警内容
    ...pageInfo
  }

  if (params.warnTime) {
    dto.startTime = dayjs(params.warnTime[0]).format(YMDHms)
    dto.endTime = dayjs(params.warnTime[1]).format(YMDHms)
  }

  const [vo, monitorTypeDict, modelDict, levelDict] = await Promise.all([getStatisticsWarnInfoList(dto), getDictDataByType('monitor_type'), getDictDataByType("model_type"), getDictDataByType("risk_level"),])
  matching(vo.records, monitorTypeDict, "monitorType");
  matching(vo.records, warnStatusDict, "status");
  matching(vo.records, modelDict, "warnType");

  for (let i = 0; i < vo.records.length; i++) {
    for (let j = 0; j < levelDict.length; j++) {
      if (Number(vo.records[i].riskLevel) === Number(levelDict[j].value)) {
        vo.records[i].riskLevelName = levelDict[j].name
      }
    }
  }


  vo.records.forEach((element: any) => {
    element.lonlat = `${element.longitude}/${element.latitude}`
  })
  vo.records.forEach((item: any) => {
    if (item.warnType) {
      let temp = item.warnType.indexOf(";") ? item.warnType.split(";") : ''
      if (temp) {
        let warnName: any = []
        temp.forEach((it: any) => {
          modelDict.forEach((warn: any) => {
            if (it === warn.value) {
              warnName.push(warn.name)
            }
          })
        })
        item['warnTypeName'] = warnName.join(',')
      }
    }
  })

  return {
    data: vo.records,
    total: vo.total
  }
}


/** 数据统计-布控预警信息-行为分析-行为分类统计*/
export async function doGetStatisticsEventCountByEventType(param: string, dataInfo: any) {

  const dto: any = {
    endTime: dayjs().set('h', 23).set('m', 59).set('s', 59).format(YMDHms),
  }

  if (param === 'month') {
    dto.beginTime = dayjs().subtract(1, 'M').set('h', 0).set('m', 0).set('s', 0).format(YMDHms)
  } else {
    dto.beginTime = dayjs().subtract(1, 'y').set('h', 0).set('m', 0).set('s', 0).format(YMDHms)
  }

  const [vo] = await Promise.all([getStatisticsEventCountByEventType(dto)])

  let options: any = getNoDataEchartsOption()
  let data: any[] = []

  if (vo.length !== 0) {
    data = vo.map((ele: any) => {
      return {
        name: ele.labelName,
        value: Number(ele.itemNum)
      }
    })
    options = getShipWarnLevelOptions(data, { series: { name: '行为分类' } })
  }
  return options;
}

/** 数据统计-布控预警信息-行为分析-预警时段统计*/
export async function doGetStatisticsEventCountByTimeInterval(param: string, dataInfo: any) {
  const dto: any = {
    endTime: dayjs().set('h', 23).set('m', 59).set('s', 59).format(YMDHms),
  }

  if (param === 'month') {
    dto.beginTime = dayjs().subtract(1, 'M').set('h', 0).set('m', 0).set('s', 0).format(YMDHms)
  } else {
    dto.beginTime = dayjs().subtract(1, 'y').set('h', 0).set('m', 0).set('s', 0).format(YMDHms)
  }

  const vo = await getStatisticsEventCountByTimeInterval(dto)
  return vo;
}


/** 数据统计-布控预警信息-行为分析-每日预警统计*/
export async function doGetStatisticsEventCountByDate(params: [Dayjs, Dayjs], shipData: any) {
  const [startMoment, endMoment] = params

  const dto: any = {
    beginTime: dayjs(startMoment).set('h', 0).set('m', 0).set('s', 0).format(YMDHms),
    endTime: dayjs(endMoment).set('h', 23).set('m', 59).set('s', 59).format(YMDHms)
  }

  const vo = await getStatisticsEventCountByDate(dto)

  let options: any = getNoDataEchartsOption()
  let xAxisData: any[] = []
  let seriesData: any[] = []

  if (vo.length !== 0) {
    xAxisData = vo.map((ele: any) => ele.dataItem)
    seriesData = vo.map((ele: any) => ele.count)
    options = getShipWarnDateOptions(xAxisData, seriesData)
  }

  return options;
}


/** 数据统计-布控预警信息-行为分析-行为分类表格*/
export async function doGetStatisticsEventList(pageInfo: PageInfo, params: any) {
  const { dateTimeRange } = params

  const dto: any = {
    ...pageInfo,
    modelName: params.modelName, // 模型名称
  };

  if (dateTimeRange) {
    dto.startTime = dayjs(dateTimeRange[0]).format(YMDHms)
    dto.endTime = dayjs(dateTimeRange[1]).format(YMDHms)
  }

  // 行为
  if (params.eventType) {
    dto.eventType = params.eventType;
  }

  // 船舶分类
  if (params.focusType) {
    dto.focusType = params.focusType;
  }

  const [vo, analyzeShipEventTypeDict] = await Promise.all(
    [
      getStatisticsEventList(dto),
      getDictDataByType("analyze_ship_event_type"),
    ]
  );

  const data = vo.records.map((ele: any) => {
    if (ele.firstLat || ele.firstLng) {
      ele.firstLonLat = `${ele.firstLng}/${ele.firstLat}`;
    } else {
      ele.longitudeLatitude = "";
    }
    return ele;
  });

  matching(data, shipTypeDict, "focusType"); // 船舶分类
  matching(data, analyzeShipEventTypeDict, "eventType"); // 行为分类

  return {
    data,
    total: vo.total,
  };
}

/** 数据统计-案事件统计-*/
export async function doGetStatisticsCaseNumStats(param?: any) {
  const dto: any = {
  }
  const vo = await getStatisticsCaseNumStats(dto)

  return vo;
}

/** 数据统计-案事件统计-*/
export async function doGetStatisticsCaseNumTend(param?: any) {
  const dto: any = {
    countType: param.countType,
  }

  if (!common.isNull(param.labelId)) {
    dto.labelId = param.labelId
  }

  const vo = await getStatisticsCaseNumTend(dto)

  let options: any = getNoDataEchartsOption()
  let dataTotalArr: any[] = []
  let dayArr: any[] = []

  if (vo.length !== 0) {
    vo.forEach((element: any) => {
      dayArr.push(element.keyName)
      dataTotalArr.push(element.count)
    });
  }

  options = getEchartsControlBarTick(
    {
      legendData: [],
      xAxisData: dayArr,
      seriesData: dataTotalArr
    },
    {
      yAxis: {
        splitLine: {
          show: true,
          lineStyle: {
            type: 'dashed',
            color: '#97b0e1'
          }
        },
        axisLabel: {
          show: true,
          textStyle: {
            color: "#79a7e3"
          }
        }
      },
      xAxis: {
        axisLabel: {
          show: true,
          textStyle: {
            color: "#79a7e3"
          }
        }
      }
    }
  )

  return {
    data: vo,//原始数据
    options: options//echarts图表
  }
}



/**获取案件类别下拉 */
export async function doGetStatisticsLabelTable(params: any) {
  const dto = {
    pageSize: -1,
    pageNumber: 1,
    type: params.type
  };
  const res = await getLabelList(dto);
  let tempArr: any = []
  if (res.records.length !== 0) {

    res.records.forEach((element: any) => {
      tempArr.push({
        value: element.id,
        label: element.labelName
      })
    })
  }

  return {
    data: tempArr,
    total: res.total,
  };
}

/** 数据统计-案件类别统计-*/
export async function doGetStatisticsCaseLabelStats(param?: any) {
  const dto: any = {
    startTime: dayjs(param.dateTime[0]).format(YMDHms),
    endTime: dayjs(param.dateTime[1]).format(YMDHms),
  }

  const vo = await getStatisticsCaseLabelStats(dto)

  // 获取饼图echarts配置对象
  let options: any = getNoDataEchartsOption({})

  // 组装饼图数据
  let seriesData: any = []
  if (vo.length !== 0) {
    vo.forEach((element: any) => {
      seriesData.push({ value: element.count, name: element.keyName ? element.keyName : '标签' })
    });

    // 获取饼图echarts配置对象
    options = getBehivorEchartsPieSimple({ seriesData })
  }

  return {
    data: vo,//原始数据
    options: options//echarts图表
  }
}


/** 数据统计-案件类别统计-*/
export async function getAreaAlarmRankData(param: number, signal: AbortController) {

  const dto: any = {
    endTime: dayjs().set('h', 23).set('m', 59).set('s', 59).format(YMDHms)
  }

  switch (param) {
    case 0:
      dto.startTime = dayjs().set('h', 0).set('m', 0).set('s', 0).format(YMDHms)
      break;
    case 2:
      dto.startTime = dayjs().subtract(7, 'd').set('h', 0).set('m', 0).set('s', 0).format(YMDHms)
      break;
    case 3:
      dto.startTime = dayjs().subtract(1, 'M').set('h', 0).set('m', 0).set('s', 0).format(YMDHms)
      break;
    default:
      break;
  }
  const vo = await getAreaAlarmRank(dto, { signal })

  return vo
}