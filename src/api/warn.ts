import { Config, get, post } from "helper/ajax";

/** 获取预警行为列表 */
export function getListByWarnInfo(dto: any) {
  return get("/search/behavirecord/getListByWarnInfo", dto);
}

/** 获取船舶异常行为列表 */
export function getBehavirecordHeatMap(dto: any, config?: Config) {
  return get("/search/behavirecord/heatMap", dto, config);
}

/** 态势感知->预警等级热力图 */
export function getRiskLevelHeatMap(dto: any, config?: Config) {
  return get("/alarm/warnInfo/riskLevelHeatMap", dto, config);
}

/** 态势感知-预警风险类别统计 */
export function getRiskTypeStats(dto: any, config?: Config) {
  return get("/alarm/warnInfo/riskTypeStats", dto, config);
}

/** 态势分析-预警威胁-船舶风险类别态势 */
export function getRiskTypeHeatMap(dto: any, config?: Config) {
  return get("/alarm/warnInfo/riskTypeHeatMap", dto, config);
}

/** 态势分析-预警威胁-预警风险趋势日统计 */
export function getDayRiskLevelStats(dto: any, config?: Config) {
  return get("/alarm/warnInfo/dayRiskLevelStats", dto, config);
}

/** 态势分析-预警威胁-异常行为分布 */
export function getWarnCountByEventType(dto: any, config?: Config) {
  return get("/search/behavirecord/countByEventType", dto, config);
}

/** 态势分析-预警威胁-预警高发地 */
export function getHighIncidence(dto: any, config?: Config) {
  return get("/alarm/warnInfo/highIncidenceAnalysis", dto, config);
}

/** 查询预警记录 */
export function getWarnList(dto: any, config?: Config) {
  return get("/alarm/warnInfo/warnList", dto, config);
}

/** 查询船舶信息面板-预警记录 */
export function getShipInfoWarnTable(dto: any, config?: Config) {
  return get("/alarm/warnInfo/warnListV3", dto, config);
}
/** 查询船舶信息面板-预警记录 */
export function getWarnTableExport(dto: any) {
  return post("/alarm/warnInfo/exportWarnList", dto, { isRequestFile: true });
}