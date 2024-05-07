import createElementByComponent from "helper/elementComponent";
import CoastalMonitorWebgis from "helper/map";
import { getCRSByMapType, MapType } from "helper/map/crsUtil";
import getMapOffLineDate from "helper/map/getMap";
import { useEffect, useRef, useState } from "react";
import styles from "./index.module.sass";

interface MapMarkPointPorps {
  /** 是否标注为船舶点 */
  isShip?: boolean
  /** 自定义图标样式 */
  icon?: any
  /** 标注点的集合 */
  pointList?: any[]
}

let marker: any

const MapMarkPoint: React.FC<MapMarkPointPorps> = ({ pointList }) => {
  console.debug('MapMarkPoint')

  const mapRef = useRef<HTMLDivElement>(null)

  const [mapLeaflet, setMapLeaflet] = useState<CoastalMonitorWebgis>()

  useEffect(() => {
    let _mapLeaflet: CoastalMonitorWebgis
    if (mapRef.current) {
      const crs = getCRSByMapType(MapType.SatelliteMap);
      _mapLeaflet = new CoastalMonitorWebgis(mapRef.current, { crs })
      getMapOffLineDate(MapType.SatelliteMap).addTo(_mapLeaflet.map);
      setMapLeaflet(_mapLeaflet)
    }
    return () => {
      _mapLeaflet && _mapLeaflet.remove()
    }
  }, [])

  useEffect(() => {
    if (!mapLeaflet) return
    if (marker) {
      mapLeaflet.map.removeLayer(marker)
    }
    marker = mapLeaflet.createMarkerGroup(pointList || [])
    const ele = <>
      <p style={{ color: '#a6cdff' }}>{pointList?.length && pointList[0].toolTipName}</p>
    </>
    const htmlEle = createElementByComponent(ele)
    marker.bindPopup(htmlEle, {
      offset: L.point(0, -24),
      minWidth: 220,
      autoPan: false,
      className: 'leaflet-popup-ui'
    })
    marker.on("mouseover ", function (evt: any) {
      evt.target.openPopup()
    })
    pointList?.length && mapLeaflet.map.panTo(pointList[0].latLng)
  }, [mapLeaflet, pointList])

  return (
    <div className={styles.map} ref={mapRef}></div>
  )
}

export default MapMarkPoint