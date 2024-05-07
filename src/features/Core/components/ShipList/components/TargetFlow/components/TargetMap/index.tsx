import { Descriptions, message } from "antd"
import { getDictName, shipStatusDict } from "helper/dictionary"
import createElementByComponent from "helper/elementComponent"
import Map2D, { MapTileType } from "helper/Map2D"
import { getMapFusionTargetIcon, getMapRadarTargetIcon } from "helper/mapIcon"
import { useEffect, useRef, useState } from "react"
import styles from './index.module.sass'

interface Props {
  // 目标数据
  data?: any
  // 目标类型 
  targetType: 'ais' | 'radar'
  // 实时尾迹
  realTimePath?: any[]

}

const TargetMap: React.FC<Props> = ({ data, targetType, realTimePath }) => {
  console.debug('TargetMap')

  const mapRef = useRef<HTMLDivElement>(null)
  const [mapLeaflet, setMapLeaflet] = useState<Map2D>()

  // 实例化地图
  useEffect(() => {
    let _mapLeaflet: Map2D
    if (mapRef.current) {
      _mapLeaflet = new Map2D(mapRef.current, MapTileType.satellite, {
        minZoom: 12,
        maxZoom: 17
      })
      setMapLeaflet(_mapLeaflet)
    }
    return () => {
      _mapLeaflet && _mapLeaflet.remove()
    }
  }, [])

  // 目标渲染
  useEffect(() => {
    let layer: any
    // AIS船舶渲染
    if (data && data.latLngList.length === 0) {
      return
    }

    if (data && mapLeaflet && data.latLngList[0].extraData.tagType === '1') { //ais目标
      let targetData = data.latLngList[0]
      if (!data.latLngList[0]) {
        return message.warning('暂无AIS船舶信息')
      }

      let color = '#25F076'
      switch (targetData.riskLevel) {
        case 1:
          color = '#ff2f25'
          break;
        case 2:
          color = '#FFA517'
          break;
        case 3:
          color = '#F4FB34'
          break;
        case 4:
          color = '#25F076'
          break;
        default:
          color = '#25F076'
          break;
      }

      const shipLayer = mapLeaflet.createShip({
        trackId: targetData.trackId,
        lng: targetData.lng,
        lat: targetData.lat,
        speed: targetData.speed,
        course: targetData.course,
        heading: targetData.heading || 0,
        extraData: targetData.extraData,
        color: color,
        borderColor: '#404040'
      })
      layer = shipLayer
      // 鼠标移入
      shipLayer.on("mouseover ", function (evt: any) {
        const aisData = targetData.extraData.shipDataAisDto
        const stateName = getDictName(shipStatusDict, aisData.nav_status)
        /*   const htmlEle = createElementByComponent(<ShipPopup
            name={targetData.extraData.shipName}
            mmsi={targetData.trackId}
            state={stateName}
            speed={aisData.sog}
            course={aisData.cog}
            lat={targetData.lat}
            lng={targetData.lng}
            time={targetData.time}
          />) */
        const htmlEle = createElementByComponent(<>
          <article className={`${styles.wrapper} core__popup-descriptions`}>
            <Descriptions size='small' column={3}>
              <Descriptions.Item label="船名" >{targetData.extraData.shipName}</Descriptions.Item>
              <Descriptions.Item label="MMSI" >{targetData.trackId}</Descriptions.Item>
              <Descriptions.Item label="状态" >{stateName}</Descriptions.Item>
              <Descriptions.Item label="航速(节)">{aisData.sog}</Descriptions.Item>
              <Descriptions.Item label="航向">{aisData.cog}</Descriptions.Item>
              <Descriptions.Item label="经纬度" span={2}>{targetData.lat}/{targetData.lng}</Descriptions.Item>
              <Descriptions.Item label="更新时间" span={2}>{targetData.time}</Descriptions.Item>
            </Descriptions>
          </article>
        </>)
        evt.target.bindPopup(htmlEle, {
          className: 'leaflet-popup-ui',
          minWidth: 620,
          autoPan: false,
          offset: L.point(0, -4)
        }).openPopup()
      })

      shipLayer.addTo(mapLeaflet.map);
      mapLeaflet.map.setView({
        lng: targetData.lng,
        lat: targetData.lat,
      })

    } else if (data && mapLeaflet && data.latLngList[0].extraData.tagType === '2') { //雷达目标渲染
      let targetData = data.latLngList[0]
      if (!targetData) {
        return message.warning('暂无目标信息')
      }
      const icon = getMapRadarTargetIcon({
        riskLevel: targetData.riskLevel,
        caseBottom: targetData.extraData.caseBottom || null,
        heading: targetData.extraData.shipDataRadarDto.course
      })

      const radarLayer = L.marker({
        lng: targetData.lng,
        lat: targetData.lat,
      }, { icon })

      layer = radarLayer

      // 鼠标移入
      radarLayer.on("mouseover ", function (evt: any) {
        if (!layer.getTooltip()) {
          /*  const htmlEle = createElementByComponent(<RadarPopup
             number={targetData.trackId}
             speed={targetData.speed.toFixed(2)}
             course={targetData.course.toFixed(2)}
             time={targetData.time}
             lat={targetData.lat}
             lng={targetData.lng}
           />) */
          const htmlEle = createElementByComponent(<>
            <article className={`${styles.wrapper} core__popup-descriptions`}>
              <Descriptions size='small' column={2}>
                <Descriptions.Item label="雷达批号" span={2}>{targetData.trackId}</Descriptions.Item>
                <Descriptions.Item label="航速(节)">{targetData.speed.toFixed(2)}</Descriptions.Item>
                <Descriptions.Item label="航向">{targetData.course.toFixed(2)}</Descriptions.Item>
                <Descriptions.Item label="经纬度" span={2}>{targetData.lng}/{targetData.lat}</Descriptions.Item>
                <Descriptions.Item label="更新时间" span={2}>{targetData.time}</Descriptions.Item>
              </Descriptions>
            </article>
          </>)
          layer.bindPopup(htmlEle, {
            className: 'leaflet-popup-ui',
            minWidth: 620,
            autoPan: false,
            offset: L.point(0, -4)
          }).openPopup()
        }
      })

      radarLayer.addTo(mapLeaflet.map);
      mapLeaflet.map.setView({
        lng: targetData.lng,
        lat: targetData.lat,
      })
    } else if (data && mapLeaflet && data.latLngList[0].extraData.tagType === '3') {//融合目标
      let targetData = data.latLngList[0]

      if (!targetData) {
        return message.warning('暂无目标信息')
      }
      const icon = getMapFusionTargetIcon({
        riskLevel: targetData.riskLevel,
        caseBottom: targetData.extraData.caseBottom || null,
        heading: targetData.heading || targetData.course,
      })

      const radarLayer = L.marker({
        lng: targetData.lng,
        lat: targetData.lat,
      }, { icon })

      layer = radarLayer

      // 鼠标移入
      radarLayer.on("mouseover ", function (evt: any) {
        const aisData = targetData.extraData.shipDataAisDto
        const stateName = getDictName(shipStatusDict, aisData.nav_status)
        /*  const htmlEle = createElementByComponent(<ShipPopup
           name={targetData.extraData.shipName}
           mmsi={targetData.extraData.mmsi}
           state={stateName}
           speed={aisData.sog}
           course={aisData.cog}
           lat={targetData.lat}
           lng={targetData.lng}
           time={targetData.time}
         />) */
        const htmlEle = createElementByComponent(<>
          <article className={`${styles.wrapper} core__popup-descriptions`}>
            <Descriptions size='small' column={3}>
              <Descriptions.Item label="船名" >{targetData.extraData.shipName}</Descriptions.Item>
              <Descriptions.Item label="MMSI" >{targetData.extraData.mmsi}</Descriptions.Item>
              <Descriptions.Item label="状态" >{stateName}</Descriptions.Item>
              <Descriptions.Item label="航速(节)">{aisData.sog}</Descriptions.Item>
              <Descriptions.Item label="航向">{aisData.cog}</Descriptions.Item>
              <Descriptions.Item label="经纬度" span={2}>{targetData.lat}/{targetData.lng}</Descriptions.Item>
              <Descriptions.Item label="更新时间" span={2}>{targetData.time}</Descriptions.Item>
            </Descriptions>
          </article>
        </>)
        evt.target.bindPopup(htmlEle, {
          className: 'leaflet-popup-ui',
          minWidth: 620,
          autoPan: false,
          offset: L.point(0, -4)
        }).openPopup()
      })


      radarLayer.addTo(mapLeaflet.map);
      mapLeaflet.map.setView({
        lng: targetData.lng,
        lat: targetData.lat,
      })
    }

    return () => {
      layer?.remove()
    }

  }, [mapLeaflet, data, targetType])

  // 尾迹
  useEffect(() => {
    let polyline: any = null
    if (realTimePath && realTimePath.length > 0 && mapLeaflet) {

      if (!realTimePath) {
        return message.warning('暂无找到目标尾迹')
      }

      const lineLatLngList = realTimePath.map((item: any) => {
        return { lat: item.lat, lng: item.lng }

      })
      polyline = L.polyline([lineLatLngList], { color: 'red', opacity: 0.5, weight: 1 }).addTo(mapLeaflet.map);
      // mapLeaflet.map.fitBounds(polyline.getBounds())
    }
    return () => {
      polyline?.remove()
    }

  }, [mapLeaflet, realTimePath])

  return (
    <article className={styles.wrapper}>
      <section className={styles.mapBox}>
        <div className={styles.map} ref={mapRef}></div>
      </section>
    </article>
  )
}

export default TargetMap