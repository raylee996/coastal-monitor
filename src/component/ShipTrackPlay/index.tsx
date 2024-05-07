import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react"
import styles from "./index.module.sass";
import "./index.css";
import PlayControlPanel from "component/PlayControlPanel";
import Map2D, { MapTileType } from "helper/Map2D";
import { getMapRadarTargetIcon } from "helper/mapIcon";
import { LatLng, Latlngs } from "webgis/webgis";
import { createDottedSolidPolyline } from "helper/map/common";
import { getIconByDeviceType } from "helper/mapIcon";

export interface TarckData {
  /** 经度 */
  lng: number
  /** 维度 */
  lat: number
  /** YYYY-MM-DD hh:mm:ss格式的时间字符串 */
  datetime: string
  /** 风险等级 */
  riskLevel?: number
  // 船舶图层参数
  course: number
  heading: number
  speed: number
  [props: string]: any
}


interface Props {
  /** 船舶轨迹信息 */
  tarckList?: TarckData[]
  /** 是否雷达目标（使用雷达图标） */
  isRadarTarget?: boolean
  /** 是否不需要控制面版 */
  isNotControlPanel?: boolean
  /** 是否自动播放 */
  isAutoPlay?: boolean
  /** 是否使用箭头轨迹 */
  isShowArrow?: boolean
  /** 是否展示起点标志 */
  isShowStart?: boolean
  /** 原始Leaflet地图创建配置项 */
  mapAttribute?: any
  /** 设置船舶图标点初始绘制位置 */
  targetInitIndex?: number
}

export interface ShipTrackPlayRefProps {
  /** 地图实例 */
  mapLeaflet: Map2D | undefined
}

let drawPolyline: any[] = []
let polyline: any

// 带箭头的线，箭头有颜色，线条无色
let arrowLine: any

// 时间标签
let timeTagList: any[] = []

const ShipTrackPlay = forwardRef<ShipTrackPlayRefProps, Props>(({ tarckList, isNotControlPanel, isRadarTarget, isShowArrow, mapAttribute, targetInitIndex, isShowStart }, ref) => {
  console.debug('ShipTrackPlay')

  useImperativeHandle(ref,
    () => ({
      mapLeaflet,
    })
  )

  const mapRef = useRef<HTMLDivElement>(null)
  const [mapLeaflet, setMapLeaflet] = useState<Map2D>();

  const [index, setIndex] = useState<any>(0)
  const [datetimeList, setDatetimeList] = useState<string[]>()

  // 创建地图实例
  useEffect(() => {
    let _mapLeaflet: Map2D
    if (mapRef.current) {
      let config: any = {
        ...mapAttribute
      }
      _mapLeaflet = new Map2D(mapRef.current, MapTileType.satellite, config)
      setMapLeaflet(_mapLeaflet)
    }
    return () => {
      _mapLeaflet && _mapLeaflet.remove()
    }
  }, [mapAttribute])

  // 初始化
  useEffect(() => {
    let startMarker: any
    // mapLeaflet && handleClear(mapLeaflet?.map)
    if (tarckList && tarckList.length > 0 && mapLeaflet) {
      const latlngs: Latlngs = tarckList.map(ele => [Number(ele.lat), Number(ele.lng)])
      // 两个点之间单独划实线或者虚线
      drawPolyline = createDottedSolidPolyline(mapLeaflet, tarckList)
      polyline = L.polyline(latlngs, { color: '#ffffff', opacity: 0.5 });
      // 添加无颜色的线，箭头为红色
      arrowLine = mapLeaflet.createPolylineDecorator(latlngs).addTo(mapLeaflet.map)

      mapLeaflet.map.fitBounds(polyline.getBounds());

      if (isShowStart) {
        const start: LatLng = tarckList[0]
        startMarker = mapLeaflet.createInfoMarker({
          latLng: start,
          content: <div className={styles.startDot}>起点</div>
        })
        startMarker.addTo(mapLeaflet.map)
      }
      const _datetimeList = tarckList.map(ele => ele.datetime)
      setDatetimeList(_datetimeList)
    }
    return () => {
      mapLeaflet && handleClear(mapLeaflet?.map)
      startMarker && startMarker.remove()

    }
  }, [mapLeaflet, tarckList, isShowArrow, isShowStart])

  // 设置时间标签
  useEffect(() => {
    if (mapLeaflet && tarckList) {
      for (let i = 0; i < tarckList.length; i++) {
        if (tarckList[i].timeTag) {
          let toolTip = L.tooltip({
            permanent: true,
            direction: i % 2 === 0 ? 'left' : 'right'
          }).setLatLng([tarckList[i].lat, tarckList[i].lng]).setContent(`${tarckList[i].datetime}`).addTo(mapLeaflet.map)
          timeTagList.push(toolTip)
        }
      }
    }
    return () => {
      if (timeTagList.length > 0) {
        for (let i = 0; i < timeTagList.length; i++) {
          mapLeaflet && mapLeaflet.map.removeLayer(timeTagList[i])
        }
      }
    }
  }, [mapLeaflet, tarckList])

  // 根据播放更新地图船舶图层和时间展示
  useEffect(() => {
    let layer: any
    if (tarckList?.length && mapLeaflet) {
      let current: any = targetInitIndex && index === 0 ? tarckList[targetInitIndex] : tarckList[index]
      // 倍速时当index 大于 tarckList长度时会导致current为空 将默认设置为最后一项
      if (!current) {
        current = tarckList[tarckList?.length - 1]
      }

      if (isRadarTarget) {
        const latLng = {
          lat: current.lat,
          lng: current.lng
        }
        const icon = getMapRadarTargetIcon({
          riskLevel: 0,
          caseBottom: 0,
          heading: current.course
        })
        layer = L.marker(latLng, { icon }).addTo(mapLeaflet.map)
      } else {
        if (current.codeType === '1') {
          const lIcon = getIconByDeviceType(current.codeType)
          const latLngs = {
            lat: current.lat || current.latitude,
            lng: current.lng || current.longitude
          }
          layer = L.marker(latLngs, {
            icon: lIcon
          }).addTo(mapLeaflet.map)
        } else {
          // 修改船舶图标
          let color = '#25F076'
          switch (current.riskLevel) {
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
          layer = mapLeaflet.createShip({
            ...current,
            speed: Number(current.speed) * 0.5144444444,
            // heading: Number(current.heading || 0) === 511 ? current.course : current.heading * Math.PI / 180.0,
            heading: current.heading ? Number(current.heading) * Math.PI / 180.0 : current.course * Math.PI / 180.0, //正确的，勿改
            course: current.course * Math.PI / 180.0,
            color,
            borderColor: '#404040'
          }).addTo(mapLeaflet.map);
        }

      }
    }
    else {
      setDatetimeList([])
      layer?.remove();
    }
    return () => {
      layer?.remove()
    }
  }, [tarckList, isRadarTarget, index, mapLeaflet, targetInitIndex])

  const handlePlay = useCallback((value: number) => setIndex(value), [])

  function handleClear(map: any) {
    drawPolyline && drawPolyline.map(item => map?.removeLayer(item))
    polyline && map?.removeLayer(polyline)
    arrowLine && map?.removeLayer(arrowLine)
    drawPolyline = []
    arrowLine = null
    polyline = null
  }

  return (
    <article className={styles.wapper}>
      <section className={styles.content}>
        <div className={styles.map} ref={mapRef}></div>
      </section>
      {!isNotControlPanel &&
        <aside className={styles.control}>
          <PlayControlPanel datetimeList={datetimeList} onChange={handlePlay} />
        </aside>
      }
    </article>
  )
})

export default ShipTrackPlay

