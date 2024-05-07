import _ from "lodash";

export interface CreateProps {
  /** 经度 */
  lng: number;
  /** 纬度 */
  lat: number;
  /** 唯一标识 */
  trackId?: any
  /** 速度，原始数据需要乘以0.5144444444转换节 */
  speed?: number;
  /** 航迹向，原始数据需要乘以Math.PI / 180.0 */
  course?: number;
  /** 船首向，原始数据需要乘以Math.PI / 180.0 */
  heading?: number;
  /** 船长 */
  length?: number;
  /** 船宽 */
  width?: number;
  /** ITU R-REC-M.1371-4-201004 page 108 in sequence A,B,C,D.*/
  gpsRefPos?: number[]
  /** 颜色 */
  color?: string
  /** 边框颜色 */
  borderColor?: string
  /** trackSymbol options */
  options?: any
  /** 额外数据 */
  extraData?: any
}

class ShipMarker {
  readonly map: any;

  constructor(_map: any) {
    this.map = _map;
  }

  create({ lat, lng, heading, course, speed, length, width, gpsRefPos, color, borderColor, options, extraData }: CreateProps) {

    let _gpsRefPos: number[] | undefined = undefined

    if (length && width) {
      _gpsRefPos = [length * 0.75, length * 0.25, width / 2, width / 2]
    } else if (gpsRefPos) {
      _gpsRefPos = gpsRefPos
    }

    return L.trackSymbol(L.latLng(lat, lng), {
      trackId: _.uniqueId('ShipMarker_create'),
      fill: true,
      fillColor: color || '#ffffff',
      fillOpacity: 1.0,
      stroke: true,
      color: borderColor || "#000000",
      opacity: 1.0,
      weight: 1.0,
      gpsRefPos: _gpsRefPos,
      heading: heading,
      course: course,
      pane: 'markerPane',
      zIndex: 100,
      speed: speed,
      extraData,
      ...options
    });
  }

  createGroup(shipList: CreateProps[]) {
    let markArr = shipList.map(v => this.create(v));
    return L.featureGroup(markArr).addTo(this.map);
  }

}

export default ShipMarker;
