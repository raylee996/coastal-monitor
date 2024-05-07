import { Config, get } from "helper/ajax";

/** 预警信息-风险等级统计数据*/
export function getAlarmLevelStatistics(dto: any) {
  return get("/alarm/warnInfo/riskLevelStats", dto);
  // return get("/alarm/warnInfo/dayRiskLevelStats", dto);
}
/** 船型统计*/
export function getShipsStatistics(dto: any) {
  return get("/search/portInfo/shipTypeStatistics", dto);
  // return get("/alarm/warnInfo/dayRiskLevelStats", dto);
}

/** 预警信息-预警行为统计*/
export function getAlarmWarnTypeStatsStatistics(dto: any) {
  return get("/alarm/warnInfo/warnTypeStats", dto);
}

/** 预警信息-预警行为统计*/
export function getAlarmActionStatistics(dto: any) {
  return get("/alarm/warnInfo/riskTypeStats", dto);
}

/** 预警信息-按月统计*/
export function getAlarmMonthStatistics(dto: any) {
  return get("/alarm/warnInfo/monthStats", dto);
}

/** 预警信息-按天统计*/
export function getAlarmDayStatistics(dto: any) {
  return get("/alarm/warnInfo/dayStats", dto);
}

/** 预警信息-按小时统计*/
export function getAlarmHourStatistics(dto: any) {
  return get("/alarm/warnInfo/hourStats", dto);
}

/** AIS船舶类型统计*/
export function getShipTypeCount(dto: any) {
  return get("/search/deviceCollection/getShipTypeCount", dto);
}

/** 设备总数、在线、离线统计数据*/
export function getDeviceStatusStatistics() {
  return get("/admin/device/countDeviceByStatus");
}

/** 统计最近7天设备在线数*/
export function getFineDeviceStatistics() {
  return get("/admin/device/getNear7DaysGoodDeviceCount");
}

/** 统计最近7天设备故障数*/
export function getFaultDeviceStatistics() {
  return get("/admin/device/getNear7DaysBadDeviceCount");
}

/** 采集数据统计的上新数*/
export function getCollectionNewCount(dto: any) {
  return get("/archive/deviceCollection/getNearDaysNewCount", dto);
}

/** 统计某时间段设备采集数*/
export function getCollectionDataCount(dto: any) {
  return get("/search/deviceCollection/getCollectCountByDate", dto);
}

/** 预警船舶数量统计 按天统计*/
export function getWarnShipStatistics(dto: any) {
  return get("/alarm/warnInfo/dayShipStats", dto);
}

/** 数据中心-数据统计-布控预警信息-布控数量趋势 */
export function getStatisticsControlNumTend(dto: any) {
  return get("/alarm/controlInfo/controlNumTend", dto);
}

/** 数据中心-数据统计-布控预警信息-布控分类统计 船舶 | 人员 */
export function getStatisticsCountByCategory(dto: any) {
  return get("/alarm/controlInfo/countByCategory", dto);
}

/** 数据中心-数据统计-布控预警信息-布控对象统计*/
export function getStatisticsCountByTarget(dto: any) {
  return get("/alarm/controlInfo/countByTarget", dto);
}

/** 数据统计-布控预警信息-查询重点场所列表*/
export function getStatisticsPlaceNameForMap(dto: any) {
  return get("/archive/place/getPlaceNameForMap", dto, { isCache: true });
}

/** 数据统计-布控预警信息-查询区域记录列表*/
export function getStatisticsAreainfoList(dto: any) {
  return get("/admin/areainfo/list", dto);
}

/** 数据统计-布控预警信息-布控总数*/
export function getStatisticsCountControlTotal(dto: any) {
  return get("/alarm/controlInfo/countControlTotal", dto);
}

/** 数据统计-布控预警信息-预警总数*/
export function getStatisticsCountWarningTotal(dto: any) {
  return get("/alarm/warnInfo/countStats", dto);
}

/** 态势分析-预警威胁-数据统计*/
export function getStatisticsCountByWarn(dto: any) {
  return get("/alarm/warnInfo/statusStats", dto);
}

/** 数据统计-布控预警信息-预警对象统计*/
export function getStatisticsWarningMonitorTypeStats(dto: any) {
  return get("/alarm/warnInfo/monitorTypeStats", dto);
}

/** 数据统计-布控预警信息-预警信息记录*/
export function getStatisticsWarnInfoList(dto: any) {
  return get("/alarm/warnInfo/warnListV3", dto);
}

/** 数据统计-布控预警信息-行为分析-行为分类统计 */
export function getStatisticsEventCountByEventType(dto: any) {
  return get("/search/behavirecord/countByEventType", dto);
}

/** 数据统计-布控预警信息-行为分析-预警时段统计 */
export function getStatisticsEventCountByTimeInterval(dto: any) {
  return get("/search/behavirecord/countByTimeInterval", dto);
}

/** 数据统计-布控预警信息-行为分析-每日预警统计 */
export function getStatisticsEventCountByDate(dto: any) {
  return get("/search/behavirecord/countByDate", dto);
}

/** 数据统计-布控预警信息-行为分析-行为分类表格 */
export function getStatisticsEventList(dto: any) {
  return get("/search/behavirecord/list", dto);
}

/** 数据统计-案事件统计-案事件数量 */
export function getStatisticsCaseNumStats(dto: any) {
  return get("/archive/caseBase/caseNumStats", dto);
}

/** 数据统计-案事件统计-发展趋势 */
export function getStatisticsCaseNumTend(dto: any) {
  return get("/archive/caseBase/caseNumTend", dto);
}

/** 数据统计-案事件统计-案件类别统计 */
export function getStatisticsCaseLabelStats(dto: any) {
  return get("/archive/caseBase/caseLabelStats", dto);
}

/** 进出港船型统计接口*/
export function getPortShipStatistics(dto: any) {
  return get("/search/portInfo/shipTypeStatistics", dto);
}

/** 数据中心-场所预警排行前十的数据 */
export function getAreaAlarmRank(dto: any, config: Config) {
  return get('/alarm/warnInfo/getAreaAlarmRank', dto, config)
}