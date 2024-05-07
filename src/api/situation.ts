// 态势感知API
import { Config, get, post } from "helper/ajax"
import { workerGet } from "helper/workerRequest";

// 获取
export function getWarning(dto: any) {
  return post('/admin/label/list', dto)
}

// 预警数据-按天统计
export function getWarningDayStats(dto: any, config?: Config) {
  return get("/alarm/warnInfo/dayStats", dto, config);
}

// 预警数据-分组统计
export function getWarningMonitorTypeStats(dto: any, config?: Config) {
  return get("/alarm/warnInfo/monitorTypeStats", dto, config);
}

// 重点目标数据
export function getFocusTargetCount(dto: any, config?: Config) {
  return get("/search/ship/focusTargetCount", dto, config);
}

// 重点目标数据 获取重点人员最近5条数据
export function getNearFivePersonData(dto: any, config?: Config) {
  return get("/search/person/getNearFiveData", dto, config);
}

// 重点目标数据 获取重点车辆最近5条数据
export function getNearFiveCarData(dto: any, config?: Config) {
  return get("/search/car/getNearFiveData", dto, config);
}

// 重点目标数据 获取重点船舶最近5条数据
/* export function getNearFiveShipData(config?: Config) {
  return get("/search/ship/getNearFiveData", undefined, config);
} */
export function getNearFiveShipData(config?: Config) {
  return get("/search/deviceCollection/getFocusNearFiveData", undefined, config);
}

// 重点目标数据 获取重点船舶最近5条重点场所图片
export function getNearFivePlaceData(dto: any) {
  return get("/search/focusPlaceData/getNearFiveData", dto);
}

// 重点目标数据 进出港排行
export function getThermalMap(dto: any) {
  return get("/search/portInfo/thermalMap", dto);
}

// 布控数据 - 布控全类型饼图（左饼图）
export function getControlDataPie(dto: any) {
  return get("/alarm/controlInfo/controlDataPie", dto);
}

// 布控数据 - 布控全类型折线图（右折线图）
export function getControlDataLine(dto: any) {
  return get("/alarm/controlInfo/controlDataLine", dto);
}

// 实时船舶数据 - 船舶统计
export function getRealTimeShipDataStatistics(dto?: any, config?: Config) {
  return get("/wsapi/shipinfo/realTimeShipDataStatistics", dto, config);
}
export function getRealTimeShipStatisticsWorker(cb: (data: any) => void) {
  return workerGet({
    api: "/wsapi/shipinfo/realTimeShipDataStatistics",
    cb,
    config: { time: 10 * 1000 }
  });
}

// 实时船舶数据 - 进出港统计
export function getEntryExitStatistics(dto: any, config?: Config) {
  return get("/search/portInfo/entryExitStatistics", dto, config);
}

// 采集数据统计
export function getCollectCountByDate(dto: any) {
  return get("/search/deviceCollection/getCollectCountByDate", dto);
}

// 采集数据统计-全量
export function getAllCollectCountByDate(dto: any, config?: Config) {
  return get("/search/deviceCollection/getAllCollectCountByDate", dto, config);
}

// 今日首次出现数据
export function getTodayFirstCount(dto: any, config?: Config) {
  return get("/search/deviceCollection/getTodayFirstCount", dto, config);
}

// 重点场所数据-场所预警排行
export function getPlaceAlarmRank(dto: any, config?: Config) {
  return get("/alarm/warnInfo/placeAlarmRank", dto, config);
}

// 获取重点场所的所有设备
export function getDeviceAndChannelCode(dto?: any, config?: Config) {
  return get("/admin/device/getDeviceAndChannelCode", dto, config);
}

// 获取设备播放地址
export function getDeviceRTSP(dto: any, config?: Config) {
  return get(`/gb28181/api/play/start/${dto.deviceCode}/${dto.deviceChannelCode}`, null, { isNotErrorMessage: true, ...config });
}

export function getDevicePlayerUrl(dto: any, config?: Config) {
  return get(`/gb28181/api/play/start/${dto.deviceCode}/${dto.deviceChannelCode}`, null, { isNotErrorMessage: true, timeout: 500, ...config });
}

// 获取设备播放地址根据流等级
export function getDeviceVideoUrl(dto: any, config?: Config) {
  const { deviceCode, channel, ...othParams } = dto
  return get(`/gb28181/api/play/start/${deviceCode}/${channel}`, othParams, { isNotErrorMessage: true, ...config });
}