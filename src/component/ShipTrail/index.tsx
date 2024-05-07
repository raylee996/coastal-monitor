import CoastalMonitorWebgis from "helper/map";
import { getCRSByMapType, MapType } from "helper/map/crsUtil";
import getMapOffLineDate from "helper/map/getMap";
import _ from "lodash";
import { useEffect, useRef, useState } from "react";
import { getShipTrail } from "server/track";
import styles from "./index.module.sass";


const ShipTrail: React.FC = () => {
  console.debug('ShipTrail')

  const mapRef = useRef<HTMLDivElement>(null)
  const [mapLeaflet, setMapLeaflet] = useState<CoastalMonitorWebgis>();

  // 创建地图实例
  useEffect(() => {
    let _mapLeaflet: CoastalMonitorWebgis
    if (mapRef.current) {
      const crs = getCRSByMapType(MapType.SatelliteMap);
      _mapLeaflet = new CoastalMonitorWebgis(mapRef.current, { crs, zoom: 12 })
      getMapOffLineDate(MapType.SatelliteMap).addTo(_mapLeaflet.map);
      setMapLeaflet(_mapLeaflet)
    }
    return () => {
      _mapLeaflet && _mapLeaflet.remove()
    }
  }, [])

  useEffect(() => {
    let layer: any
    async function main() {
      if (mapLeaflet) {
        const vo = await getShipTrail()
        const ship: any = _.last(vo)
        const list = vo.map((ele: any) => [ele.lat, ele.lng])
        layer = mapLeaflet.createShipTrailMarker({ shipParams: ship, latLngs: list })
      }
    }
    main()
    return () => {
      layer && layer.clearLayers()
    }
  }, [mapLeaflet])

  return (
    <article className={styles.wapper}>
      <div className={styles.map} ref={mapRef}></div>
    </article>
  )
}

export default ShipTrail