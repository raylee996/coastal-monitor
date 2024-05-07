// 文件信息相关API
import { Config, get, requestDelete } from "helper/ajax";

// 文件信息列表--分页查询(size=-1，返回全部)
export function getFileInfoPage(dto: any, config?: Config) {
  return get("/search/fileInfo/page", dto, config);
}

/**
 * 船舶档案-行为分析-列表
 * 查询智慧建模行为记录列表——分页查询
 * @param dto
 * @returns
 */
export function getBehavirecordList(dto: any) {
  return get("/search/behavirecord/list", dto);
}

/**
 * 船舶档案-行为分析-触发时段统计
 * 根据事件类型分组统计
 * @param dto
 * @returns
 */
export function getBehavirecordCountByEventType(dto: any) {
  return get("/search/behavirecord/countByEventType", dto, {});
}

/**
 * 船舶档案-行为分析-触发时段统计
 * 根据时段分组统计
 * @param dto
 * @returns
 */
export function getBehavirecordCountByTimeInterval(dto: any) {
  return get("/search/behavirecord/countByTimeInterval", dto, {});
}

/**
 * 船舶档案-行为分析-每日行为统计
 * 根据时段分组统计
 * @param dto
 * @returns
 */
export function getBehavirecordCountByDate(dto: any) {
  return get("/search/behavirecord/countByDate", dto, {});
}

/**
 * 查询关联信息
 * @param dto
 * @returns
 */
export function getRelationResult(dto: any) {
  return get("/search/relateInfo/getRelationResult", dto, {});
}

/**
 * 数据统计，采集数据统计--柱状图
 * @param dto
 * @returns
 */
export function getCollectCountByDate(dto: any, config?: Config) {
  return get("/search/deviceCollection/getCollectCountByDate", dto, config);
}
/**
 * 数据统计，采集数据统计--数量统计
 * @param dto
 * @returns
 */
export function getCollectGetNearNums(dto: any) {
  return get("/search/deviceCollection/getNearNums", dto);
}

/** 船舶热量图数据 */
export function getHotGraph(dto: any) {
  return get("/search/deviceCollection/getHotGraph", dto);
}
/** 水域卡口--列表 */
export function getWaterList(dto: any) {
  return get("/search/waterBayonetInfo/list", dto);
}

// 水域卡口-切换水域卡口
export function findAllDevices(dto: any) {
  return get("/archive/place/findAllDevices", dto);
}

export function getWatergetListByLabelType(dto: any) {
  return get("/archive/place/getListByLabelType", dto);
}
// 船舶流量统计
export function getWatercountByDirection(dto: any) {
  return get("/search/waterBayonetInfo/countByDirection", dto);
}
export function getWatercountByMmsi(dto: any) {
  return get("/search/waterBayonetInfo/countByMmsi", dto);
}

// 删除
export function delShipList(dto: any) {
  return requestDelete(`/search/portInfo/delete/${dto.id}`, null, { successText: '删除进出港' })
}
