export type DrawType = 'Polygon' | 'Rectangle' | 'Circle'


export interface AreaToolOptions {
  /** 是否展示面积值 */
  isNotShowAreaValue?: boolean
  /** 创建成功的回调 */
  onCreate?: (layer: any, tool: Area) => void
}

/**
 * 基于geoman插件扩展的面积测量工具
 */
class Area {
  readonly map: any
  readonly pm: any

  isNotShowAreaValue = false
  onCreate: any

  layer: any


  constructor(_map: any) {
    this.map = _map
    this.pm = _map.pm
  }

  open(type: DrawType, opt?: AreaToolOptions) {
    this.pm.enableDraw(type)
    this.map.on('keydown', this.clear, this)
    this.map.on('pm:create', this.create, this);

    if (opt) {
      if (opt.isNotShowAreaValue) {
        this.isNotShowAreaValue = opt.isNotShowAreaValue
      }
      if (opt.onCreate) {
        this.onCreate = opt.onCreate
      }
    }
  }

  create(e: any) {
    this.layer = e.layer

    if (!this.isNotShowAreaValue) {
      let result = 0
      let center: any
      if (e.shape === 'Circle') {
        result = Math.PI * Math.pow(e.layer._mRadius, 2)
        center = e.layer.getLatLng()
      } else {
        let pointList = e.layer._latlngs[0].map((val: any) => [val.lng, val.lat])
        pointList.push(pointList[0])
        const polygon = turf.polygon([pointList])
        result = turf.area(polygon)
        center = e.layer.getCenter()
      }
      const value = Math.trunc(result).toLocaleString()
      const content = `面积:${value}平方米`

      const popup = L.popup({
        className: 'leaflet-popup-ui tool-area-ui',
        minWidth: 160,
        closeOnClick: false
      })
        .setLatLng(center)
        .setContent(content)
        .addTo(this.map)

      popup.on('remove', () => {
        this.clear()
      })
    }

    this.onCreate && this.onCreate(e, this)

  }

  clear() {
    this.pm.disableDraw()
    this.map.off('keydown', this.clear, this)
    this.map.off('pm:create', this.create, this);
    this.layer.remove()
  }

}

export default Area