import { getPlaceListHome, getPlacesList } from "api/place";
import { getVideoUrlByDeviceCode } from "api/ship";
import { getAllCollectCountByDate, getControlDataLine, getControlDataPie, getDeviceAndChannelCode, getDeviceRTSP, getEntryExitStatistics, getFocusTargetCount, getNearFiveCarData, getNearFivePersonData, getNearFivePlaceData, getNearFiveShipData, getPlaceAlarmRank, getRealTimeShipDataStatistics, getTodayFirstCount, getWarningDayStats, getWarningMonitorTypeStats } from "api/situation";
import { getStatisticsCountByWarn } from "api/statistics";
import dayjs from "dayjs";
import { MDpoint, YMD } from "helper";
import matching, { riskLevelOptions } from "helper/dictionary";
import { getControlEchartsPie, getEchartsCollectionBarTick, getEchartsControlBarTick, getEchartsWarringDataStackedLine, getNoDataEchartsOption, getWarningPie3D } from "helper/echartsConfig";
import { PageInfo } from "hooks/integrity/TableInterface";
import _ from "lodash";
import moment from "moment";
import { getDictDataByType } from "./system";

/**
 * 预警数据-pie
 * @param params
 * @returns
 */
export async function doGetWarningDataPie(params: any, signal?: AbortController) {

  const dto: any = {
    endWarnTime: dayjs().format(YMD) + ' 23:59:59',
    // monitorType: '01',// '03,0104,0101,0102,05',
  }
  // 日期
  if (params.dateTime === 'month') {
    // 近一月
    dto.startWarnTime = dayjs().subtract(1, 'M').format(YMD) + ' 00:00:00'
  } else if (params.dateTime === 'week') {
    // 近一周
    dto.startWarnTime = dayjs().subtract(1, 'w').format(YMD) + ' 00:00:00'
  } else {
    // 季度
    let tYear = new Date().getFullYear();
    dto.startWarnTime = dayjs(new Date(tYear, 0, 1)).format(YMD) + ' 00:00:00'
  }

  //预警统计 - 分类统计
  const vo = await getWarningMonitorTypeStats(dto, { signal });
  // console.log(vo)

  let total = 0
  vo.forEach((element: any) => {
    total += Number(element.count)
  });
  // 获取预警类型字典
  const warnTypeDict = await getDictDataByType("monitor_type")

  matching(vo, warnTypeDict, "dataItem");// 在职状态

  let options: any = getNoDataEchartsOption()

  let colors = ['rgba(0, 236, 208, 1)', 'rgba(0, 228, 255, 1)', 'rgba(2, 169, 247, 1)', 'rgba(0, 126, 255, 1)']
  let pieData: any = []
  let colorNumber = 0

  warnTypeDict.forEach((wItem: any) => {
    let temp = vo.find((vItem: any) => {
      return vItem.dataItemName === wItem.name
    })

    if (wItem.name !== '总计') {
      let name = wItem.name
      if (wItem.name === '黑名单预警') {
        name = '黑名单'
      }
      pieData.push({
        name,
        value: temp ? Number(temp.count) : 0,
        itemStyle: {
          color: colors[colorNumber++],
          opacity: 1
        },
      })
    }

  })
  if (pieData.length !== 0) {
    // 传入数据生成 option
    options = getWarningPie3D(
      pieData,
      0.7 // 圆饼：0，圆环>0
    );
  }

  return { options, total }
}


/**
 * 预警数据-Line
 * @param params
 * @returns
 */
export async function doGetWarningDataLine(params: any, signal?: AbortController) {

  const dto: any = {
    endWarnTime: dayjs().format(YMD) + ' 23:59:59',
  }
  params.warningType !== -1 && (dto.monitorType = params.warningType);
  // 日期
  if (params.dateTime === 'month') {
    // 近一月
    dto.startWarnTime = dayjs().subtract(1, 'M').format(YMD) + ' 00:00:00'
    dto.dateType = 3
  } else if (params.dateTime === 'week') {
    // 近一周
    dto.startWarnTime = dayjs().subtract(1, 'w').format(YMD) + ' 00:00:00'
    dto.dateType = 2
  } else {
    // 季度
    let tYear = new Date().getFullYear();
    dto.startWarnTime = dayjs(new Date(tYear, 0, 1)).format(YMD) + ' 00:00:00'
    // dto.endWarnTime = dayjs(new Date(tYear, 11, 31)).format(YMD)+ ' 23:59:59'
    dto.dateType = 6
  }

  const vo = await getWarningDayStats(dto, { signal });

  let options: any = getNoDataEchartsOption()

  // 折线图
  let dayArr = []//日期
  let valArr = []// 值

  let len = vo.length
  if (len !== 0) {
    if (params.dateTime !== 'quarter') {
      for (let i = 0; i < len; i++) {
        let item = vo[i]
        dayArr.push(dayjs(item.dataItem).format(MDpoint))
        valArr.push(Number(item.count))
      }
    } else {
      for (let i = 0; i < len; i++) {
        let item = vo[i]
        dayArr.push(item.itemName)
        valArr.push(Number(item.count))
      }
    }


    options = getEchartsWarringDataStackedLine(
      {
        xAxisData: dayArr,
        seriesData: valArr
      }
    )
  }
  return options
}

/**
 * 重点目标数据
 * @param params
 * @returns
 */
export async function doGetFocusTargetCount(params: any, signal?: AbortController) {
  const dto: any = {
    countType: params.dateTime
  }

  const vo = await getFocusTargetCount(dto, { signal })
  if (vo.length !== 0) {
    vo[0].forEach((element: any) => {
      if (element.keyName === '重点船舶') {
        element.styleName = 'ship'
      } else if (element.keyName === '重点人员') {
        element.styleName = 'person'
      } else if (element.keyName === '重点车辆') {
        element.styleName = 'car'
      }
    });
  }
  return {
    data: vo[0]
  }
}
export async function doGetFocusTargetCountV2(params: any, signal?: AbortController) {
  const dto: any = {
    countType: params.dateTime
  }

  const vo = await getFocusTargetCount(dto, { signal })
  const result = {
    ship: '',
    person: '',
    car: ''
  }

  if (vo[1]) {
    vo[1].forEach((element: any) => {
      switch (element.keyName) {
        case '重点船舶':
          result.ship = String(element.count)
          break;
        case '重点人员':
          result.person = String(element.count)
          break;
        case '重点车辆':
          result.car = String(element.count)
          break;
        default:
          break;
      }
    });
  }
  return result
}

/**
 * 重点目标数据-获取重点人员最近5条数据
 * @param params
 * @returns
 */
export async function doGetNearFivePersonData(signal?: AbortController): Promise<any[]> {
  const vo = await getNearFivePersonData({ focusType: 4 }, { signal })
  return vo
}

/**
 * 重点目标数据-获取重点车辆最近5条数据
 * @param params
 * @returns
 */
export async function doGetNearFiveCarData(signal?: AbortController): Promise<any[]> {
  const vo = await getNearFiveCarData({ focusType: 4 }, { signal })
  return vo
}

/**
 * 重点目标数据-获取重点船舶最近5条数据
 * @param params
 * @returns
 */
export async function doGetNearFiveShipData(signal?: AbortController): Promise<any[]> {
  const vo = await getNearFiveShipData({ signal })
  return vo
}


/**
 * 重点目标数据-获取重点场所最近5条数据
 * @param params
 * @returns
 */
export async function doGetNearFivePlaceData(params: any) {
  const dto: any = {
    placeId: params.placeId
  }
  const vo = await getNearFivePlaceData(dto)
  return {
    data: vo
  }
}

/**
 * 重点目标数据-场所预警排行
 * @param params
 * @returns
 */
export async function doGetPlaceAlarmRank(params: any) {
  const dto: any = {
    // endWarnTime: dayjs().format(YMDHms),
    codeType: 6,
    type: 0, //0-当天， 1-近一天， 2-近一周， 3-近一个月， 4-近一年， 5-近三个月，默认自定义
  }

  if (params.dateTime === 'today') {
    // 今日
    // dto.startWarnTime = dayjs().format(YMDHms)
    dto.type = 0
  }
  if (params.dateTime === 'week') {
    // 近一周
    // dto.startWarnTime = dayjs().subtract(1, 'w').format(YMDHms)
    dto.type = 2
  } else if (params.dateTime === 'month') {
    // 近一月
    // dto.startWarnTime = dayjs().subtract(1, 'M').format(YMDHms)
    dto.type = 3
  }

  //dto
  const vo = await getPlaceAlarmRank(dto)
  return {
    data: vo
  }
}
export async function getPlaceAlarmLog(param: number, signal: AbortController) {
  const dto: any = {
    codeType: 6,
    type: param, //0-当天， 1-近一天， 2-近一周， 3-近一个月， 4-近一年， 5-近三个月，默认自定义
  }
  const vo = await getPlaceAlarmRank(dto, { signal })
  return vo
}


/**
 * 实时船舶数据 - 船舶统计
 * @param params
 * @returns
 */
export async function doGetRealTimeShipDataStatistics(params: any) {
  const dto: any = {
    // endTime: dayjs().format(YMDHms),
    ...params
  }

  // if (params.dateTime === 'today') {
  //   // 今日
  //   dto.beginTime = dayjs().format(YMDHms)
  // }
  // if (params.dateTime === 'week') {
  //   // 近一周
  //   dto.beginTime = dayjs().subtract(1, 'w').format(YMDHms)
  // } else if (params.dateTime === 'month') {
  //   // 近一月
  //   dto.beginTime = dayjs().subtract(1, 'M').format(YMDHms)
  // }

  const vo = await getRealTimeShipDataStatistics(dto)

  return {
    data: vo
  }
}
export async function doGetRealTimeShipDataStatisticsV2(signal: AbortController) {
  const vo = await getRealTimeShipDataStatistics(undefined, { signal })
  return vo
}



/**
 * 实时船舶数据 - 进出港统计
 * @param params
 * @returns
 */
export async function doGetEntryExitStatistics(params: any) {
  const dto: any = {
    type: 0, //0-当天， 1-近一天， 2-近一周， 3-近一个月， 4-近一年， 5-近三个月，默认自定义
  }

  if (params.dateTime === 'today') {
    dto.type = 0
  }
  if (params.dateTime === 'week') {
    dto.type = 2
  } else if (params.dateTime === 'month') {
    dto.type = 3
  }

  const vo = await getEntryExitStatistics(dto)
  return {
    data: vo
  }
}
export async function getEntryExitLog(params: any, signal: AbortController) {
  const dto: any = {
    type: params //0-当天， 1-近一天， 2-近一周， 3-近一个月， 4-近一年， 5-近三个月，默认自定义
  }
  const vo = await getEntryExitStatistics(dto, { signal })
  return vo
}


/**
 * 布控数据-全类型饼图
 * @param params
 * @returns
 */
export async function doGetControlDataPie(params: any) {
  const dto: any = {
    endTime: moment().format(YMD) + ' 23:59:59',
    //controlCategory: ''//布控类型(1: 船舶布控, 2:人员布控(人+车), 3: 场所布防, 4:建模布控, 5: 视频布控)
  }
  // 日期
  if (params.dateTime === 'month') {
    // 近一月
    dto.startTime = moment().subtract(1, 'M').format(YMD) + ' 00:00:00'
  } else if (params.dateTime === 'week') {
    // 近一周
    dto.startTime = moment().subtract(6, 'd').format(YMD) + ' 00:00:00'
  } else {
    // 季度
    let tYear = new Date().getFullYear();
    dto.startTime = dayjs(new Date(tYear, 0, 1)).format(YMD) + ' 00:00:00'
  }

  const vo = await getControlDataPie(dto);

  let total = 0 //总计
  vo.forEach((element: any) => {
    total += Number(element.num)
  });

  // 布控类型
  // matching(vo, controlDataDict, "label");// 在职状态

  let pieData: any = []
  const controlDataDict = await getDictDataByType("controlCategory")
  controlDataDict.forEach((wItem: any) => {
    let temp = vo.find((vItem: any) => {
      return vItem.label === wItem.name
    })

    if (wItem.name !== '总计') {
      pieData.push({
        name: wItem.name,
        value: temp ? Number(temp.num) : 0,
      })
    }

  })

  let options: any = getNoDataEchartsOption()

  if (pieData.length !== 0) {
    // 态势感知-布控饼形
    options = getControlEchartsPie({
      seriesData: pieData
    })
  }

  return {
    options,
    total
  }
}

/**
 * 布控数据-全类型折线图
 * @param params
 * @returns
 */
export async function doGetControlDataLine(params: any) {
  const dto: any = {}

  if (params.controlType !== -1) {
    dto.controlCategory = params.controlType
  }



  // 日期
  if (params.dateTime === 'month') {
    // 近一月
    // dto.startTime = dayjs().subtract(1, 'M').format(YMD) + ' 00:00:00'
    dto.dateType = 3
  } else if (params.dateTime === 'week') {
    // 近一周
    // dto.startTime = dayjs().subtract(6, 'd').format(YMD) + ' 00:00:00'
    dto.dateType = 2

  } else {
    // 季度
    // let tYear = new Date().getFullYear();
    // dto.startTime = dayjs(new Date(tYear, 0, 1)).format(YMD) + ' 00:00:00'
    dto.dateType = 6
  }

  const vo = await getControlDataLine(dto);

  let options: any = getNoDataEchartsOption
  let dataTotalArr: any[] = []
  let dayArr: any[] = []

  if (vo.length !== 0) {
    if (params.dateTime !== 'quarter') {
      vo.forEach((element: any) => {
        dayArr.push(dayjs(element.label).format(MDpoint))
        dataTotalArr.push(element.num)
      });
    } else {
      // 按季度
      vo.forEach((element: any) => {
        dayArr.push(element.label)
        dataTotalArr.push(element.num)
      });
    }


    options = getEchartsControlBarTick(
      {
        legendData: ["预警总计"],
        xAxisData: dayArr,
        seriesData: dataTotalArr
      },
    )
  }

  return options
}


/**
 * 采集数据统计
 * @param params
 * @returns
 */
export async function doGetCollectionData(params: any) {
  // const dto: any = {
  //   beginTime: dayjs().subtract(1, 'w').format(YMDHms),
  //   endTime: dayjs().format(YMDHms),
  //   type: 1
  // }

  //全类型数据-无参，默认返回最七天的数据
  const vo = await getAllCollectCountByDate(null);
  console.log(vo)


  let options: any = getNoDataEchartsOption()

  // controlBarTick
  let dayArr = []
  let dataAisArr = []
  let dataRadarArr = []
  let dataFaceArr = []
  let dataCarArr = []

  for (let i = 0; i < 7; i++) {
    let today = dayjs().subtract(i, 'days').format('YYYY-MM-DD')
    //日期
    dayArr.unshift(dayjs(today).format(MDpoint))
    dataAisArr.unshift(vo.ais[today]) // ais
    dataRadarArr.unshift(vo.radar[today]) // 雷达
    dataFaceArr.unshift(vo.face[today]) // 人脸
    dataCarArr.unshift(vo.car[today])  // 车牌
  }

  options = getEchartsCollectionBarTick(
    {
      dayArr,
      series: {
        dataAisArr,
        dataRadarArr,
        dataFaceArr,
        dataCarArr
      }
    }
  )
  return options
}

export async function doGetCollectionDataV2(signal: AbortController) {

  //全类型数据-无参，默认返回最七天的数据
  const vo = await getAllCollectCountByDate(null, { signal });


  let options: any = getNoDataEchartsOption()

  let dayArr = []
  let dataAisArr = []
  let dataRadarArr = []
  let dataFaceArr = []
  let dataCarArr = []

  for (let i = 0; i < 7; i++) {
    let today = dayjs().subtract(i, 'days').format('YYYY-MM-DD') //日期
    dayArr.unshift(dayjs(today).format(MDpoint))
    dataAisArr.unshift(vo.ais[today]) // ais
    dataRadarArr.unshift(vo.radar[today]) // 雷达
    dataFaceArr.unshift(vo.face[today]) // 人脸
    dataCarArr.unshift(vo.car[today])  // 车牌
  }

  options = getEchartsCollectionBarTick({
    dayArr,
    series: {
      dataAisArr,
      dataRadarArr,
      dataFaceArr,
      dataCarArr
    }
  })

  return options
}

/**
 * 今日首次出现数据
 * @param params
 * @returns
 */
export async function doGetTodayFirstCount(params: any) {
  const dto: any = { ...params }
  const vo = await getTodayFirstCount(dto);
  return {
    data: vo
  }
}
export async function doGetTodayFirstCountV2(signal: AbortController) {
  const vo = await getTodayFirstCount(undefined, { signal });
  return vo
}


/**重点场所列表 */
export async function doGetQueryPlaceList(params: any) {
  const pageInfo: PageInfo = {
    pageSize: -1,
    pageNumber: 1
  }
  let dto = {
    ...pageInfo,
    ...params,
  };
  const data = await getPlacesList(dto);
  matching(data.records, riskLevelOptions, "level");
  return data.records;
}
export async function getAllPlaceList(signal: AbortController) {

  const dto = {
    pageSize: -1,
    pageNumber: 1
  }

  const data = await getPlaceListHome(dto, { signal });

  matching(data, riskLevelOptions, "level");

  return data;
}

/**重点场所-所有设备 */
export async function getPlaceCameraList(params: any, signal?: AbortController) {
  let dto = {
    placeId: params.placeId
  }
  const vo = await getDeviceAndChannelCode(dto, { signal });
  return vo.map((item: any) => ({ ...item, uniqueId: _.uniqueId('uniqueId'), placeId: params.placeId }))
}

export async function doGetDeviceAndChannelCodeV2(signal: AbortController) {
  const vo = await getDeviceAndChannelCode(undefined, { signal });
  return vo.map((item: any) => ({ ...item, uniqueId: _.uniqueId('uniqueId') }))
}


/**重点场所-设备播放rtsp */
export async function doGetDeviceRTSP(params: any) {
  let dto = {
    deviceCode: params.deviceCode,
    deviceChannelCode: params.deviceChannelCode
  };
  const vo = await getDeviceRTSP(dto);
  return vo
}
export async function getRTSPByDeviceChannel(params: any) {
  let dto = {
    deviceCode: params.deviceCode,
    deviceChannelCode: params.deviceChannelCode
  };
  const vo = await getDeviceRTSP(dto);
  return vo
}

/** 态势分析-预警威胁-数据统计*/
export async function getWarnStatisticsCount(dateType: number, focusType: string) {
  let dto = {
    dateType,
    focusType
  }
  const vo = await getStatisticsCountByWarn(dto);
  return vo
}

/** 态势分析-实时视频获取流 */
export async function getVideoUrlByDeviceCodeAndChannel(params: any) {
  const dto = {
    deviceCode: params.deviceCode,
    channel: params.channelCode
  }
  const data = await getVideoUrlByDeviceCode(dto, { timeout: 3000 })
  return data.vedioUrl
}