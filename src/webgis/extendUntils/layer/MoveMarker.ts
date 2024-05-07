type Icon = { iconUrl: string; iconSize: [number, number] };

export interface Tarck {
  /** 经度 */
  lng: number
  /** 纬度 */
  lat: number
  /** 时间戳或者YYYY-MM-DD hh:mm:ss格式的时间字符串 */
  time?: number | string
}

interface LineStyle {
  color?: string
  weight?: number
}

export interface CreateProps {
  /** marker的经纬度 */
  data: Tarck[]
  /** 自定义图标 */
  icon?: Icon
  /** 是否不绘制轨迹线 */
  isNotShowLine?: boolean
  /** 是否自动播放 默认自动播放 */
  isAutoPlay?: boolean
  /** 是否循环播放 默认循环 */
  isLoopPlay?: boolean
  /** 绘制路径线的样式 */
  lineStyle?: LineStyle
}

class MoveMarker {
  readonly map: any;

  constructor(_map: any) {
    this.map = _map;
  }

  create({ data, isNotShowLine, isAutoPlay, isLoopPlay, lineStyle }: CreateProps) {
    const latlngs = data.map(ele => [ele.lat, ele.lng]);
    let speed = (data.length - 1) * 1000;

    if (isNotShowLine) {
      // 绘制线到地图图层
      L.polyline(latlngs, {
        color: "#20a080",
        weight: 2,
        ...lineStyle
      }).addTo(this.map);
    }

    // 设置点的移动路径
    const marker = L.Marker.movingMarker(latlngs, speed, {
      autostart: !!isAutoPlay,
      loop: !!isLoopPlay
    }).addTo(this.map);

    return {
      marker,
      /** 播放 */
      play: () => marker.start(),
      /** 暂停 */
      pause: () => marker.pause(),
      /** 重播 */
      replay: () => {
        marker.stop();
        marker.start();
      },
      /** 删除图层 */
      remove: (map: any) => marker.onRemove(map)
    };;
  }
}

export default MoveMarker;
