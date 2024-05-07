import { getWarningV3Api } from "api/core/earlyWarning";
import {
  getAllPlacePortApi,
  getHistoryTrackApi,
  getShipPlacePortApi,
} from "api/dataCenter/shipSailing";
import { getFileInfoPage } from "api/search";
import dayjs, { Dayjs } from "dayjs";
import { YMDHms } from "helper";
import matching from "helper/dictionary";
import { DayjsPair } from "hooks/hooks";
import { PageInfo } from "hooks/integrity/TableInterface";
import _ from "lodash";
// import _ from "lodash";
import { getDictDataByType } from "server/system";

/** 历史轨迹内容 */

const dateTimeFormat = "YYYY-MM-DD HH:mm:ss";
// 获取历史轨迹数据
export async function getAllHistoryTrack(dto: any) {
  const { returnTime, customTime, trackType, ...obj } = dto;
  const page = {
    pageNumber: 1,
    pageSize: returnTime === "lastFive" ? 5 : 1000000,
  };
  // 最后一小时
  if (returnTime === 'lastHour') {
    obj.beginTime = dayjs().subtract(1, 'hour').format(dateTimeFormat);
    obj.endTime = dayjs().format(dateTimeFormat)
  } else if (customTime) {
    const [sDayjs, eDayjs] = customTime
    obj.beginTime = sDayjs.format(YMDHms)
    obj.endTime = eDayjs.format(YMDHms)
  }
  const res = await getHistoryTrackApi({ aisDateType: 1, ...page, ...obj });

  return res?.content
    ?.map((item: any) => {
      const {
        capAddress,
        latitude,
        longitude,
        trueHeading,
        codeType,
        capTime,
        trackStatus,
        speed,
        course,
        ...obj
      } = item;
      const lngLat =
        capAddress.split(",")?.length === 2
          ? capAddress.split(",")
          : [longitude, latitude];
      return {
        lng: Number(lngLat[0]),
        lat: Number(lngLat[1]),
        heading: trueHeading,
        course: course || 0,
        datetime: dayjs(capTime).format(dateTimeFormat),
        speed: speed.split(",")?.length === 2 ? speed[1] : speed,
        codeType: String(codeType),
        ...obj,
      };
    })
    .sort((a: { datetime: number }, b: { datetime: number }) => {
      return dayjs(a.datetime).isAfter(dayjs(b.datetime)) ? 1 : -1;
    });
}

// 获取历史轨迹数据列表
export async function getHistoryTrackList(pageInfo: PageInfo, params: any) {
  const { returnTime, customTime, trackType, ...paramsObj } = params;
  setHourTime(returnTime, customTime, paramsObj);

  // 最后一小时
  if (returnTime === 'lastHour') {
    paramsObj.beginTime = dayjs().subtract(1, 'hour').format(dateTimeFormat);
    paramsObj.endTime = dayjs().format(dateTimeFormat)
  } else {
    const [sDayjs, eDayjs] = customTime
    paramsObj.beginTime = sDayjs.format(YMDHms)
    paramsObj.endTime = eDayjs.format(YMDHms)
  }
  const dto = {
    current: pageInfo.pageNumber,
    size: pageInfo.pageSize,
    ...paramsObj,
  };
  const [res, codeTypeDict, trackStatusDict] = await Promise.all([
    getHistoryTrackApi(dto),
    getDictDataByType("target_data_type"),
    getDictDataByType("nav_status"),
  ]);
  res?.content?.map((item: any) => {
    item.time = dayjs(item.capTime).format(dateTimeFormat);
    item.codeTypeStr = item.codeType + "";
    item.trackStatusStr = item.trackStatus + "";
    return item;
  });
  if (res?.content) {
    matching(res.content, codeTypeDict, "codeTypeStr");
    matching(res.content, trackStatusDict, "trackStatusStr");
  }
  return {
    data: res?.content,
    total: res.total,
  };
}

// 历史轨迹AIS与雷达绘制
export async function drawHistoryTrack(dto: any, shipData: any) {
  const { mmsi, uniqueId, ...obj } = dto || {}
  if (obj.returnTime === 'custom' && !obj.customTime) {
    return
  }
  let data: any[] = []
  let tableData: any[] = []
  const pageInfo = { pageNumber: 1, pageSize: 1000000 }
  if (dto.trackType) {
    // 两个都选中,求融合轨迹
    if (dto.trackType.includes('ais') && dto.trackType.includes('radar')) {
      const [aisRes, aisTableRes] = await Promise.all([
        getAllHistoryTrack({ ...obj, mmsi, uniqueId, aisDateType: 1 }), // aisDateType指定获取轨迹数据类型 0mmsi 1融合 2雷达
        getHistoryTrackList(pageInfo, { ...obj, mmsi, uniqueId, aisDateType: 1 })
      ]);
      // 保存table数据
      tableData = [...aisTableRes?.data || []]
      // 组装轨迹数据
      // const radarList = uniqueId?.split(',') || mmsi+'雷达'
      data = [{
        legendName: mmsi ? mmsi : uniqueId,
        latLngList: aisRes,
        targetType: 'ship'
      }]
    } else {
      // 选中一个
      let params = {}
      // 选中ais
      if (dto.trackType.includes('ais') && !dto.trackType.includes('radar')) {
        mmsi ? params = { mmsi, aisDateType: 0 } : params = { uniqueId, aisDateType: 0 }
      } else {
        // 选中雷达
        uniqueId ? params = { uniqueId, aisDateType: 2 } : params = { mmsi, aisDateType: 2 }
      }

      // 保存table数据
      const tableRes = await getHistoryTrackList(pageInfo, { ...obj, ...params })
      tableData = tableRes?.data || []
      // 组装轨迹数据
      const res = await getAllHistoryTrack({ ...obj, ...params })
      if (uniqueId) {
        const radarList = uniqueId?.split(',')
        data = radarList.map((item: string) => {
          return {
            legendName: item,
            latLngList: res.filter((v: any) => v.content === item),
            targetType: 'radar'
          }
        })
      } else {
        data = [{
          legendName: mmsi ? mmsi : uniqueId,
          latLngList: res,
          targetType: obj.aisDateType === 0 || obj.aisDateType === 1 ? 'ship' : 'radar'
        }]
      }
    }
  }


  let dateTimeRange: DayjsPair = [dayjs().subtract(1, 'h'), dayjs()]
  if (obj.returnTime === 'custom') {
    dateTimeRange = obj.customTime
  }

  // 雷达无轨迹数据时不组装入
  const trackData = data?.filter(item => item.targetType !== 'radar' || item.latLngList?.length)?.map(item => {
    const { latLngList } = item
    item.latLngList = latLngList.map((ele: any) => {
      const { datetime, trueHeading, heading, ...obj } = ele
      return {
        time: datetime,
        heading: trueHeading || heading || obj.course,
        ...obj
      }
    })
    return item
  }).sort((a: { time: number }, b: { time: number }) => {
    return dayjs(a.time).isAfter(dayjs(b.time)) ? 1 : -1;
  }) || []

  // 组装预警信息
  const warnList = await getHistoryWarnList(shipData, dateTimeRange)

  trackData.forEach((item: any) => {
    item.latLngList.forEach((ele: any) => {
      const warnInfo = warnList.find((warn: any) => {
        const pointDayjs = dayjs(ele.time)
        const is = pointDayjs.diff(warn.capTime, 's') < 60
        return is
      })
      if (warnInfo) {
        ele.warnInfo = warnInfo
      }
    })
  })

  tableData.forEach(ele => ele.id = _.uniqueId('lodash'))

  return {
    trackData,
    tableData,
  }
}

/** 历经港口内容 */
//历史轨迹预警信息
export async function getHistoryWarnList(shipData: any, dateTimeRange: DayjsPair) {

  const dto: any = {
    pageNumber: 1,
    pageSize: -1
  }

  if (shipData.targetId) {
    dto.fusionId = shipData.targetId
  } else if (shipData.mmsi) {
    dto.warnContent = shipData.mmsi
  } else if (shipData.radarNumber) {
    dto.warnContent = shipData.radarNumber
  } else {
    return []
  }

  if (dateTimeRange) {
    const [startDatetime, endDatetime]: [Dayjs, Dayjs] = dateTimeRange;
    dto.startTime = startDatetime.format(YMDHms)
    dto.endTime = endDatetime.format(YMDHms)
  }

  const vo = await getWarningV3Api(dto)

  return vo.records
}


/** 所有港口 */
export async function queryAllPlacePort(dto: any) {
  const page = {
    pageNumber: 1,
    pageSize: -1,
  };
  return await getAllPlacePortApi({ ...page, ...dto });
}

const dateFormat = "YYYY-MM-DD";
/** 历经港口 */
export async function queryShipPlacePortList(dto: any) {
  const page = {
    pageNumber: 1,
    pageSize: -1,
  };
  const { time, isEntry, codeType, ...obj } = dto;
  setBeginEndTime(obj, time);
  isEntry && (obj.isEntry = isEntry.join(","));
  codeType && (obj.codeType = codeType.join(','));
  return await getShipPlacePortApi({ ...page, ...obj });
}

/** 视图信息  */
export async function queryImageVideoList(params: any) {
  const { customTime, returnTime, trackType, ...obj } = params;
  const dto: any = {
    pageNumber: 1,
    pageSize: -1,
    ...obj
  }
  if (returnTime === 'lastHour') {
    dto.endTime = dayjs().format(YMDHms)
    dto.startTime = dayjs().subtract(1, 'h').format(YMDHms)
  } else if (customTime) {
    const [sDayjs, eDayjs] = customTime
    dto.endTime = eDayjs.format(YMDHms)
    dto.startTime = sDayjs.format(YMDHms)
  }
  const vo = await getFileInfoPage(dto);
  const data = vo?.records || [];
  return {
    image: data.filter((item: { fileType: string }) => item.fileType === "01"),
    video: data.filter((item: { fileType: string }) => ["02", "03"].includes(item.fileType)),
  };
}

// 转换开始与结束时间
function setBeginEndTime(obj: any, time: any[]) {
  if (time?.length) {
    time[0] &&
      (obj.beginTime = dayjs(time[0]).format(dateFormat) + " 00:00:00");
    time[1] && (obj.endTime = dayjs(time[1]).format(dateFormat) + " 23:59:59");
  }
}

// 转换最后一小时与时间自定义
function setHourTime(returnTime: string, customTime: any[], obj: any) {
  if (returnTime === "lastFive") return;
  if (returnTime === "lastHour" || customTime?.length) {
    const date = new Date().getTime();
    obj.beginTime = dayjs(customTime ? customTime[0] : date - 3600000).format(
      dateTimeFormat
    );
    obj.endTime = dayjs(customTime ? customTime[1] : date).format(
      dateTimeFormat
    );
  }
}
