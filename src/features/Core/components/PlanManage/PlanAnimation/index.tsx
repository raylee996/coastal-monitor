import VideoSimple from 'component/VideoSimple'
import { isPointInPolygon, plan97PoliceShip, plan97UAV, planPoint97 } from 'helper/map/common'
import Map2D, { MapTileType } from 'helper/Map2D'
import { getPoliceShipIcon, getUAVIcon } from 'helper/mapIcon'
import { useEffect, useRef, useState } from 'react'
import { getModelAreaById } from 'server/core/model'
import { Latlng } from 'webgis/webgis'
import styles from './index.module.sass'


const curentVideo = {
  startTime: '2023-05-17 10:34:00',
  endTime: '2023-05-17 10:36:11',
  deviceChannelCode: '44030500101325547225',
  deviceCode: '44030500101325247225',
}

interface Props {
  /** 模型id */
  modelId?: number
}

const PlanAnimation: React.FC<Props> = ({ modelId }) => {
  console.debug('PlanAnimation')


  const mapRef = useRef<HTMLDivElement>(null)


  const [map2d, setMap2D] = useState<Map2D>()
  const [areaList, setAreaList] = useState<any[]>([])
  const [isShowVideo, setIsShowVideo] = useState(false)
  const [isShowUAV, setIsShowUAV] = useState(false)
  const [isShowPoliceShip, setIsShowPoliceShip] = useState(false)


  // 初始化地图
  useEffect(() => {
    let _map2d: Map2D
    const pointList: any[] = []
    if (mapRef.current) {
      _map2d = new Map2D(mapRef.current, MapTileType.satellite)
      _map2d.map.on('click', (evt: any) => {
        const marker = _map2d.createCircleMarker({ latLng: evt.latlng })
        marker.addTo(_map2d.map)
        pointList.push(evt.latlng)
        console.log(pointList)
      })
      setMap2D(_map2d)
    }
    return () => {
      _map2d?.map?.remove()
    }
  }, [])

  // 渲染区域
  useEffect(() => {
    const layers: any[] = []
    let ctr: AbortController
    async function main() {
      if (map2d) {
        ctr = new AbortController()
        const _areaList = await getModelAreaById(modelId, ctr)
        _areaList.forEach(item => {
          let layer: any

          if (item.layerType === 'Circle') {
            layer = new L.Circle([item.graphObj.geometry.coordinates[1], item.graphObj.geometry.coordinates[0]], {
              radius: item.graphObj.properties.radius,
            })
          } else {
            layer = L.geoJson(item.graphObj)
          }

          layer.options.area = item
          layer.addTo(map2d.map)
          layers.push(layer)
        })
        map2d.map.fitBounds(layers[0].getBounds(), { maxZoom: 13 })
        setAreaList(_areaList)
      }
    }
    main()
    return () => {
      ctr?.abort()
      layers.forEach(layer => layer.remove())
    }
  }, [map2d, modelId])

  // 轨迹计时遍历
  useEffect(() => {
    let targetLayer: any
    let warnLayer: any
    let timer: NodeJS.Timer

    if (map2d && areaList.length > 0) {
      let index = 0
      timer = setInterval(() => {
        if (index < planPoint97.length) {
          targetLayer?.remove()
          warnLayer?.remove()

          const latLng = planPoint97[index]

          const area = areaList.find(item => {
            const latlng: Latlng = [latLng.lat, latLng.lng]
            const is = isPointInPolygon(latlng, item.graphObj.geometry.coordinates)
            return is
          })

          console.log(area)

          let fillColor = '#489bff'
          let lineColor = '#ffdc31'
          let articleClassName = styles.infoWrapperLow
          if (area) {
            switch (area.node.riskLevel) {
              case '1': //高风险
                fillColor = '#ff2f25'
                lineColor = '#ff3154'
                articleClassName = styles.infoWrapperHigh
                setIsShowPoliceShip(true)
                break;
              case '2': //中风险
                fillColor = '#ff9c00'
                lineColor = '#fd660c'
                articleClassName = styles.infoWrapperMiddle
                setIsShowUAV(true)
                break;
              case '3': //低风险
                fillColor = '#f4fb34'
                lineColor = '#ffdc31'
                setIsShowVideo(true)
                break;
              default:
                break;
            }

            warnLayer = map2d.createInfoMarker({
              latLng: latLng,
              content: (
                <article className={articleClassName}>
                  <div>速度：12节</div>
                  <div>经纬度：{latLng.lat.toFixed(6)},{latLng.lng.toFixed(6)}</div>
                  <div>预警内容：{area.node.eventName}</div>
                </article>
              ),
              lineColor,
              position: 'bottomRight'
            }).addTo(map2d.map)
          }

          targetLayer?.remove()
          targetLayer = map2d.createCircleMarker({
            latLng,
            options: {
              color: '#000000',
              weight: 1,
              fillColor,
              radius: 6
            }
          })
          targetLayer.addTo(map2d.map)

          // 累计下一个
          index += 1
        } else {
          clearInterval(timer)
        }
      }, 1500)
    }

    return () => {
      targetLayer?.remove()
      warnLayer?.remove()
      timer && clearInterval(timer)
    }
  }, [map2d, areaList])

  // 渲染无人机
  useEffect(() => {
    let layer: any
    let timer: NodeJS.Timer
    if (map2d && isShowUAV) {
      let index = 0
      timer = setInterval(() => {
        if (index < plan97UAV.length) {
          const latLng = plan97UAV[index]

          layer?.remove()
          const icon = getUAVIcon()
          layer = L.marker(latLng, { icon })
          layer.bindTooltip('无人机', {
            className: 'leaflet-tooltip-ui',
            permanent: true,
            direction: 'top',
            offset: L.point(0, -10)
          })
          layer.addTo(map2d.map)

          // 累计下一个
          index += 1
        } else {
          clearInterval(timer)
        }
      }, 1000)
    }
    return () => {
      layer?.remove()
      timer && clearInterval(timer)
    }
  }, [map2d, isShowUAV])

  // 渲染警船
  useEffect(() => {
    let layer: any
    let timer: NodeJS.Timer
    if (map2d && isShowPoliceShip) {
      let index = 0
      timer = setInterval(() => {
        if (index < plan97PoliceShip.length) {
          const latLng = plan97PoliceShip[index]

          layer?.remove()
          const icon = getPoliceShipIcon(180)
          layer = L.marker(latLng, { icon })
          layer.bindTooltip('警船', {
            className: 'leaflet-tooltip-ui',
            permanent: true,
            direction: 'top',
            offset: L.point(0, -4)
          })
          layer.addTo(map2d.map)

          // 累计下一个
          index += 1
        } else {
          clearInterval(timer)
        }
      }, 500)
    }
    return () => {
      layer?.remove()
      timer && clearInterval(timer)
    }
  }, [map2d, isShowPoliceShip])



  return (
    <article className={styles.wrapper}>

      <section className={styles.map} ref={mapRef}></section>

      {isShowVideo &&
        <aside className={styles.videoPanel}>
          <header className={styles.title}>视频联动</header>
          <section className={styles.videoBox}>
            <VideoSimple getVideoParams={curentVideo} isAutoPlay={true} />
          </section>
        </aside>
      }

      {/* {isShowUAV &&
        <aside className={styles.videoPanelUav}>
          <header className={styles.title}>无人机视频</header>
          <section className={styles.videoBox}>
            <VideoSimple getVideoParams={curentVideo} isAutoPlay={true} />
          </section>
        </aside>
      } */}

    </article>
  )
}

export default PlanAnimation