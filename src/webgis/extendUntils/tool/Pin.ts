import { LatLng } from "webgis/webgis"
import styles from "./Text.module.sass";


export interface PinToolOptions {
  /** 创建成功的回调 */
  onCreate?: (layer: any) => void
  /** L.icon */
  icon?: any
}

class Pin {
  readonly map: any

  private onCreate: any

  icon: any


  constructor(_map: any) {
    this.map = _map
  }

  open(opt: PinToolOptions) {
    this.map.on('click', this.create, this)
    this.map.on('keydown', this.clear, this)
    this.map._container.classList.add(styles.cursor)
    if (opt) {
      if (opt.onCreate) {
        this.onCreate = opt.onCreate
      }
      if (opt.icon) {
        this.icon = opt.icon
      }
    }
  }

  create(e: { latlng: LatLng }) {
    let latLng = e.latlng
    let marker: any

    if (this.icon) {
      marker = L.marker(latLng, { icon: this.icon })
    } else {
      marker = L.circleMarker(latLng, {
        pane: 'markerPane',
        radius: 4,
        fillColor: '#f5222d',
        fillOpacity: 1,
        weight: 0,
      })
    }

    this.onCreate && this.onCreate(marker)
    this.clear()
  }

  private clear() {
    this.map.off('click', this.create, this)
    this.map.off('keydown', this.clear, this)
    this.map._container.classList.remove(styles.cursor)
  }

}

export default Pin