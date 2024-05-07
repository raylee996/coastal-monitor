import Map2D, { MapTileType } from "helper/Map2D"
import _ from "lodash";
import { useEffect, useRef, useState } from "react"
import styles from "./index.module.sass";

interface PointProps {
  /** id */
  id: string
  /** 经纬度 */
  lat: number
  lng: number
  /** 点标注名称 */
  label?: string
}

interface Props {
  /** 地图类型 */
  mapTileType?: MapTileType
  /** 自定义图标样式 */
  icon?: any
  /** 标注点的集合 */
  pointList?: PointProps[]
}

const MapDottingInteraction: React.FC<Props> = ({
  mapTileType = MapTileType.street,
  icon = L.icon({
    iconUrl: require(`images/mapIcon/radarIcon.png`),
    iconSize: [20, 20],
  }),
  pointList
}) => {
  console.debug('MapDottingInteraction')

  const mapRef = useRef<HTMLDivElement>(null)

  const [mapLeaflet, setMapLeaflet] = useState<Map2D>()

  // 实例化地图
  useEffect(() => {
    let _mapLeaflet: Map2D
    if (mapRef.current) {
      _mapLeaflet = new Map2D(mapRef.current, MapTileType.satellite)
      setMapLeaflet(_mapLeaflet)
    }
    return () => {
      _mapLeaflet && _mapLeaflet.remove()
    }
  }, [mapTileType])

  // 渲染轨迹
  useEffect(() => {
    const createCircleGroupList: any[] = []
    if (mapLeaflet && !_.isEmpty(pointList)) {
      let centerLatlng: any;
      // 取第一个点为中心点
      pointList?.length && (
        centerLatlng = [pointList[0].lat, pointList[0].lng]
      );
      const markers = pointList?.map(item => {
        return {
          markerId: item.id,
          latLng: { lat: item.lat, lng: item.lng },
          markerOptions: { icon },
          extraData: item,
        }
      })
      if (!markers?.length) return;
      const featureGroup = mapLeaflet.createMarkerGroup(markers)
      featureGroup.on("mouseover ", function (evt: any) {
        const extraData = evt.layer.options.extraData
        evt.layer.bindPopup(extraData.label).openPopup()
      })
      createCircleGroupList.push(featureGroup)
      centerLatlng && mapLeaflet.map.setView(centerLatlng)
    }
    return () => {
      createCircleGroupList.forEach(group => group.clearLayers())
    }
  }, [pointList, mapLeaflet, icon])

  return (
    <article className={styles.wapper}>
      <div className={styles.map} ref={mapRef}></div>
    </article>
  )
}

export default MapDottingInteraction