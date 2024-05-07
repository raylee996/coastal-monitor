import { MapType } from "./crsUtil";

/**
 * 字典类型
 */
export interface IMapType<T> {
  /**
   * 字典名称
   */
  name: string;
  /**
   * 映射值
   */
  value: T;
}

export const mapType: IMapType<MapType>[] = [
  {
    name: "地图",
    value: MapType.StreetMap,
  },
  {
    name: "卫图",
    value: MapType.SatelliteMap,
  },
  {
    name: "海图",
    value: MapType.SeaMap,
  },
];
