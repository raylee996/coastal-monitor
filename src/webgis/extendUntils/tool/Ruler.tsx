import { useMemo } from "react";
import createElementByComponent from "webgis/untils/elementComponent";
import styles from "./Ruler.module.sass";


interface Props {
  distance: number
  total: number
}

const RulerTip: React.FC<Props> = ({ distance, total }) => {
  console.debug('RulerTip')

  const _distance = useMemo(() => Math.floor(distance), [distance])
  const _total = useMemo(() => Math.floor(total), [total])

  return (
    <article className={`${styles.rulerTip} tool-ruler-tip-ui`}>
      <div className={styles.row}>距离:{_distance}米</div>
      <div className={styles.row}>累计距离:{_total}米</div>
    </article>
  )
}

class Ruler {
  readonly map: any;

  lineLayers: any[] = []
  tipLayers: any[] = []

  clickCount = 0
  allDistance: number[] = []
  popupClose: any

  clickedLatLong: any
  clickedPoints: any[] = []

  movingLatLong: any
  moveLineLayer: any
  moveTooltip: any

  constructor(_map: any) {
    this.map = _map;
  }

  open() {
    this.map.on('click', this.clicked, this)
    this.map.on('mousemove', this.moving, this)
    this.map.on('keydown', this.clear, this)
    this.map._container.classList.add(styles.cursor)
    this.map.doubleClickZoom.disable()
  }

  clear() {
    this.clickCount = 0
    this.map.off('click', this.clicked, this)
    this.map.off('mousemove', this.moving, this)
    this.map.off('keydown', this.clear, this)
    this.map._container.classList.remove(styles.cursor)
    this.moveLineLayer && this.map.removeLayer(this.moveLineLayer)
    this.moveTooltip && this.moveTooltip.remove()
    this.map.doubleClickZoom.enable()
    this.popupClose.on('remove', () => {
      this.lineLayers.forEach(ele => ele.remove())
      this.tipLayers.forEach(ele => ele.remove())
    })
  }

  clicked(e: any) {
    if (!this.clickedLatLong || (this.clickedLatLong.lat !== e.latlng.lat && this.clickedLatLong.lng !== e.latlng.lng)) {
      this.clickedLatLong = e.latlng;
      this.clickedPoints.push(this.clickedLatLong)
      if (this.clickCount > 0) {
        if (this.movingLatLong) {
          const previousPoint = this.clickedPoints[this.clickCount - 1]

          const layer = L.polyline([
            previousPoint,
            this.movingLatLong
          ]).addTo(this.map);

          this.lineLayers.push(layer)

          const distance = this.movingLatLong.distanceTo(previousPoint)
          this.allDistance.push(distance)
          let total = 0
          this.allDistance.forEach(val => total += val)

          const htmlPopEle = createElementByComponent(<RulerTip distance={distance} total={total} />)

          let _distance = 0
          let _total = 0
          if (this.popupClose) {
            _distance = this.popupClose.options.distance
            _total = this.popupClose.options.total
            this.popupClose.remove()
          }
          this.popupClose = L.popup({ className: 'leaflet-popup-ui', minWidth: 120, closeOnClick: false, distance, total })
            .setLatLng(this.movingLatLong)
            .setContent(htmlPopEle)
            .addTo(this.map)

          if (this.clickedPoints.length > 2) {

            const htmlEle = createElementByComponent(<RulerTip distance={_distance} total={_total} />)

            const tip = L.tooltip({ className: 'leaflet-tooltip-ui', direction: 'top', permanent: true })
              .setLatLng(previousPoint)
              .setContent(htmlEle)
            setTimeout(() => {
              tip.update()
              tip.addTo(this.map)
            }, 50)

            this.tipLayers.push(tip)

          }
        }
      } else {

        const tip = L.tooltip({ className: 'leaflet-tooltip-ui', direction: 'top', permanent: true })
          .setLatLng(this.movingLatLong)
          .setContent('起点')
        setTimeout(() => {
          tip.update()
          tip.addTo(this.map)
        }, 50)

        this.tipLayers.push(tip)
      }
      this.clickCount++
    } else {
      setTimeout(() => {
        this.clear()
      }, 50)
    }
  }

  moving(e: any) {
    this.movingLatLong = e.latlng
    if (this.clickedLatLong) {
      this.moveLineLayer && this.map.removeLayer(this.moveLineLayer)
      this.moveLineLayer = L.polyline([
        this.clickedLatLong,
        this.movingLatLong
      ], {
        className: styles.cursor
      }).addTo(this.map);

      let distance = this.movingLatLong.distanceTo(this.clickedLatLong)
      distance = Math.floor(distance)
      const content = `距离:${distance}米`

      if (this.moveTooltip) {
        this.moveTooltip.setLatLng(this.movingLatLong).setContent(content)
      } else {
        this.moveTooltip = L.tooltip({ className: 'leaflet-tooltip-ui', direction: 'top', permanent: true, offset: L.point(0, -4) })
          .setLatLng(this.movingLatLong)
          .setContent(content)
          .addTo(this.map)
      }
    }
  }
}

export default Ruler