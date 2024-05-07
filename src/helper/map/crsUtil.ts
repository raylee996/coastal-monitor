/**
 * 地图实例类型
 */
export enum MapType {
  /** 街景地图*/
  StreetMap,
  /** 卫星地图 */
  SatelliteMap,
  /** 海图 */
  SeaMap
}

/**
 * 根据地图类型返回对应的CRS
 */
export function getCRSByMapType(mapType: MapType) {
  let result: any
  switch (mapType) {
    case MapType.StreetMap:
      result = L.CRS.EPSG3857;
      break;
    case MapType.SatelliteMap:
      result = L.CRS.EPSG3857;
      break;
    case MapType.SeaMap:
      result = L.CRS.EPSG3395;
      break;
    default:
      result = L.CRS.EPSG3857;
      break;
  }
  return result;
}
