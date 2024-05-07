import { Config, get, post } from "helper/ajax";

/** 图数据库添加档案实体与关系，双方都有档案id,目前只支持人员档案使用 */
export function addArchiveRelation(dto: any) {
  return post('/graph/addArchiveEntityAndRelation', dto);
}

// 获取船舶信息详细信息
export function getShipArchive(dto: any, config?: Config) {
  return get("/archive/ship/getInfo", dto, {
    ...config,
    isCache: true
  });
}