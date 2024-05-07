import { Checkbox, Row } from "antd";
import PlayControlPanel, { PlayControlPanelRefProps } from "component/PlayControlPanel";
import dayjs from "dayjs";
import { YMDHms } from "helper";
import { createDottedSolidPolyline } from "helper/map/common";
import Map2D, { MapTileType } from "helper/Map2D";
import { getMapRadarTargetIcon } from "helper/mapIcon";
import ImageSimple from "hooks/basis/ImageSimple";
import { DayjsPair } from "hooks/hooks";
import _ from "lodash";
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { useCallback } from "react";
import { Latlngs } from "webgis/webgis";
import WarnInfo from "./components/WarnInfo";
import styles from "./index.module.sass";
import './index.sass'

export const targetTrackColorList = ['#7f90ff', '#343eff', '#489bff', '#63edfd', '#25f076', '#f4fb34', '#ffa517', '#ff2f25', '#ff4cad', '#e24cff'].reverse()

interface LatLng {
  lng: number
  lat: number
  time?: string
  speed?: number
  course?: number
  heading?: number
  /** 是否雷达目标（使用雷达图标） */
  targetType?: string
  /** 存在则展示预警信息 */
  warnInfo?: {
    monitorName: string
    eventName: string
  }
  [props: string]: any
}

interface Data {
  legendName: string
  legendImgSrc?: string
  legendColor?: string
  latLngList: LatLng[]
  /** 是否雷达目标（使用雷达图标） */
  targetType?: string
}

interface Props {
  /** 目标轨迹数据 */
  data?: Data[]
  /** 是否不需要控制面版 */
  isNotControlPanel?: boolean
  /** 是否自动播放 */
  isAutoPlay?: boolean
  /** 是否显示marker */
  isMarker?: boolean
  /** 虚线设置 */
  dashed?: {
    /**线的粗细 */
    weight: number,
    // 单条虚线长度 数字string
    dashArray: string,
  },
  /** 是否不展示起点和方向箭头 */
  isNotShowBeginAndArrow?: boolean
  /** 手动设置时间范围，在数据原来的数据范围基础上额外多两个时间点 */
  dateTimeRange?: DayjsPair
  // 是否显示时间标签
  isNotShowTimeLabel?: boolean
}

export interface TargetTrackPlayRefProps {
  mapLeaflet?: Map2D
  onDatetimeCurrent: (val: string | number) => void
}

// 时间标签
let timeTagList: any[] = []

// 时间速度跟随标签
let timeSpeedTag: any

const TargetTrackPlay = forwardRef<TargetTrackPlayRefProps, Props>(({
  data,
  isNotControlPanel,
  isAutoPlay,
  dashed,
  isMarker,
  isNotShowBeginAndArrow,
  dateTimeRange,
  isNotShowTimeLabel
}, ref) => {
  console.debug('TargetTrackPlay')


  const mapRef = useRef<HTMLDivElement>(null)
  const playRef = useRef<PlayControlPanelRefProps>(null)


  const [mapLeaflet, setMapLeaflet] = useState<Map2D>()
  const [targetData, setTargetData] = useState<Data[]>([])
  const [targetMarkers, setTargetMarkers] = useState<LatLng[]>([])
  const [realData, setRealData] = useState<Data[]>([])
  const [value, setValue] = useState<string[]>([])
  const [timeLine, setTimeLine] = useState<string[]>([])


  /** 导出刷新函数 */
  useImperativeHandle(ref, () => {
    const onDatetimeCurrent = (val: string | number) => {
      playRef.current?.onDatetimeCurrent(val)
    }
    return {
      mapLeaflet,
      onDatetimeCurrent
    }
  }, [mapLeaflet])


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
  }, [])

  /** 根据轨迹数据设置状态 */
  useEffect(() => {
    if (data && !_.isEmpty(data)) {
      const len = targetTrackColorList?.length - 1
      setRealData(data.map((val, idx) => ({ legendColor: targetTrackColorList[idx >= len ? idx % len : idx], ...val, })))
      setValue(data.map(ele => ele.legendName))
    } else {
      setRealData([])
      setValue([])
      setTimeLine([])
      setTargetMarkers([])
    }
  }, [data])

  /** 初始化选择所有目标轨迹 */
  useEffect(() => {
    setTargetData(realData)
  }, [realData])

  // 设置时间标签
  useEffect(() => {
    if (mapLeaflet) {
      // 先清空时间标签
      if (timeTagList.length > 0) {
        for (let i = 0; i < timeTagList.length; i++) {
          mapLeaflet && mapLeaflet.map.removeLayer(timeTagList[i])
        }
        timeTagList = []
      }
      for (let i = 0; i < targetData.length; i++) {
        for (let j = 0; j < targetData[i].latLngList.length; j++) {
          // 不显示时间标签
          if (isNotShowTimeLabel) {
            if (timeTagList.length > 0) {
              for (let i = 0; i < timeTagList.length; i++) {
                mapLeaflet && mapLeaflet.map.removeLayer(timeTagList[i])
              }
            }
            break
          }
          if (targetData[i].latLngList[j].timeTag) {
            let toolTip = L.tooltip({
              permanent: true,
              direction: j % 2 === 0 ? 'left' : 'right'
            }).setLatLng([targetData[i].latLngList[j].lat, targetData[i].latLngList[j].lng]).setContent(`${targetData[i].latLngList[j].time}`).addTo(mapLeaflet.map)
            timeTagList.push(toolTip)
          }
        }
      }
    }
    return () => {
      if (timeTagList.length > 0) {
        for (let i = 0; i < timeTagList.length; i++) {
          mapLeaflet && mapLeaflet.map.removeLayer(timeTagList[i])
        }
        timeTagList = []
      }
    }
  }, [isNotShowTimeLabel, mapLeaflet, targetData])


  //根据目标轨迹设置时间线
  useEffect(() => {
    if (targetData.length > 0) {
      const _timeLine: string[] = []
      targetData.forEach(target => {
        target.latLngList.forEach(val => {
          val.time && _timeLine.push(dayjs(val.time).format(YMDHms))
        })
      })
      const uniqTimeLine = _.uniq(_timeLine)
      let result = uniqTimeLine.sort((a, b) => dayjs(a).unix() - dayjs(b).unix())

      if (dateTimeRange) {
        const head = _.head(result)
        const last = _.last(result)
        const [sTime, eTime] = dateTimeRange
        if (sTime.isBefore(head)) {
          result = [sTime.format(YMDHms)].concat(result)
        }
        if (eTime.isAfter(last)) {
          result.push(eTime.format(YMDHms))
        }
      }

      setTimeLine(result)
    } else {
      setTimeLine([])
    }
  }, [targetData, dateTimeRange])

  // 渲染轨迹
  useEffect(() => {
    const createCircleGroupList: any[] = []
    const polylineList: any[] = []
    const arrowList: any[] = []
    const startMarkerList: any[] = []
    if (mapLeaflet && !_.isEmpty(targetData)) {
      let centerLatlng: any;
      targetData.forEach((_data, idx) => {
        if (_data.latLngList.length > 0) {
          // 对所有数据打点 需求去掉点
          // if (isMarker) {
          //   const markers = _data.latLngList.map(ele => ({
          //     latLng: { lat: ele.lat, lng: ele.lng },
          //     extraData: ele,
          //     options: {
          //       fillColor: _data.legendColor
          //     }
          //   }))
          //   const featureGroup = mapLeaflet.createCircleMarkerGroup(markers)
          //   featureGroup.on("mouseover ", function (evt: any) {
          //     const extraData = evt.layer.options.extraData
          //     evt.layer.bindPopup(extraData.time).openPopup()
          //   })
          //   createCircleGroupList.push(featureGroup)
          // }
          // 设置地图中心点
          if (idx === 0) {
            const centerMarker = _.head(_data.latLngList)
            if (centerMarker) {
              centerLatlng = [centerMarker.lat, centerMarker.lng]
            }
          }
          // 两个点之间单独划实线或者虚线
          const polyline = createDottedSolidPolyline(mapLeaflet, _data.latLngList || [], { color: _data.legendColor })
          // const latlngs = _data.latLngList.map(ele => ({ lat: ele.lat, lng: ele.lng }))
          // const polyline = L.polyline(latlngs, { color: _data.legendColor, ...(dashed || {}) }).addTo(mapLeaflet.map);
          polylineList.push(...polyline)
          // 默认开始该配置，为轨迹展示箭头和起点
          if (!isNotShowBeginAndArrow) {
            // 添加箭头
            const latlngs: Latlngs = _data.latLngList.map(ele => [Number(ele.lat), Number(ele.lng)])
            arrowList.push(mapLeaflet.createPolylineDecorator(latlngs, {
              patterns: {
                symbol: L.Symbol.arrowHead({
                  pixelSize: 8,
                  headAngle: 60,
                  polygon: false,
                  pathOptions: {
                    stroke: true,
                    weight: 1,
                    color: _data.legendColor
                  }
                })
              }
            }).addTo(mapLeaflet.map))
            // 添加起点
            const start: LatLng = _data.latLngList[0]
            startMarkerList.push(mapLeaflet.createInfoMarker({
              latLng: start,
              content: <div className={styles.startDot} style={{ backgroundColor: _data.legendColor }}>起点</div>
            }).addTo(mapLeaflet.map))
          }
        }
      })
      centerLatlng && mapLeaflet.map.setView(centerLatlng)
      // 将地图层级和定位根据线自适应调整
      const BoundsLatLngList = _.flattenDepth(targetData.map(item => item.latLngList))
      BoundsLatLngList?.length && mapLeaflet.map.fitBounds(BoundsLatLngList);
    }
    return () => {
      createCircleGroupList.forEach(group => group.clearLayers())
      polylineList.forEach(ele => ele.remove())
      arrowList.forEach(ele => ele.remove())
      startMarkerList.forEach(ele => ele.remove())
    }
  }, [targetData, mapLeaflet, dashed, isMarker, isNotShowBeginAndArrow])

  // 根据targetMarkers更新图标
  useEffect(() => {
    const group: any = L.featureGroup()
    if (mapLeaflet) {
      targetMarkers.forEach((item, index) => {
        if (item.targetType === 'radar') {
          const latLng = {
            lat: item.lat,
            lng: item.lng
          }
          const icon = getMapRadarTargetIcon({
            riskLevel: 0,
            caseBottom: 0,
            heading: item.course
          })
          const radarLayer = L.marker(latLng, { icon })
          group.addLayer(radarLayer)
        } else if (item.targetType === 'ship' && item.speed) {

          const shipLayer = mapLeaflet.createShip({
            ...item,
            color: '#25F076',
            borderColor: '#404040',
            speed: item.speed * 0.5144444444,
            heading: Number(item.heading || 0) === 511 ? item.course : (item.heading || 0) * Math.PI / 180.0,
            course: (item.course || 0) * Math.PI / 180.0
          })
          group.addLayer(shipLayer)
        } else if (item.lat && item.lng) {
          const latLng = {
            lat: item.lat,
            lng: item.lng
          }
          const otherLayer = mapLeaflet.createCircleMarker({ latLng })
          group.addLayer(otherLayer)
        }

        if (item.warnInfo && item.lat && item.lng) {
          const latLng = {
            lat: item.lat,
            lng: item.lng
          }
          const infoMarker = mapLeaflet.createInfoMarker({
            latLng: latLng,
            content: <WarnInfo text={`${item.warnInfo.monitorName}:${item.warnInfo.eventName}`} />
          })
          group.addLayer(infoMarker)
        }
        mapLeaflet && timeSpeedTag && mapLeaflet.map.removeLayer(timeSpeedTag)
        if (targetData.length) {
          timeSpeedTag = mapLeaflet.createInfoMarker({
            latLng: [item.lat, item.lng],
            content: (
              <article className={styles.timeSpeedTag} style={{ backgroundColor: targetData[0].legendColor }}>
                时间：{item.time},<br />
                速度：{item.speed}
              </article>
            ),
            position: 'bottomRight'
          }).addTo(mapLeaflet.map)
        }
      })

      if (targetMarkers.length === 1) {
        const item = targetMarkers[0]
        if (item.lat && item.lng) {
          const latLng = {
            lat: item.lat,
            lng: item.lng
          }
          mapLeaflet.map.panInside(latLng, {
            padding: L.point(100, 100)
          })
        }
      }

      group.setZIndex(100)
      group.addTo(mapLeaflet.map)
    }
    return () => {
      group.remove()
      mapLeaflet && timeSpeedTag && mapLeaflet.map.removeLayer(timeSpeedTag)
    }
  }, [targetMarkers, mapLeaflet, targetData])


  function handleChange(params: any[]) {
    const target = _.filter(realData, ele => params.some(val => val === ele.legendName))
    setTargetData(target)
    setValue(params)
  }

  const handlePlay = useCallback((value: number) => {
    if (timeLine.length > 0) {
      const idxTime = timeLine[value]
      const _targetMarkers: LatLng[] = []
      targetData.forEach(ele => {
        if (ele.latLngList.length) {
          const result = _.find(ele.latLngList, val => val.time === idxTime)
          if (result) {
            const target: LatLng = {
              ...result,
              targetType: ele.targetType || 'ship'
            }
            _targetMarkers.push(target)
          }
        }
      })
      setTargetMarkers(val => {
        const needRemoveList = _.filter(val, ele => {
          const is = _targetMarkers.some(tag => tag.targetId === ele.targetId)
          return is
        })

        _.remove(val, ele => needRemoveList.some(tag => tag.targetId === ele.targetId))

        const _val = [...val, ..._targetMarkers]

        return _val
      })
    }
  }, [targetData, timeLine])


  const mapContentClassName = isNotControlPanel ? styles.mapContentDef : styles.mapContentCtl


  return (
    <article className={styles.wapper}>
      <section className={`${styles.mapBox} ${mapContentClassName}`}>
        <div className={styles.map} ref={mapRef}></div>
      </section>
      <section className={`${styles.legend} TargetTrackPlay__Checkbox`}>
        <Checkbox.Group value={value} onChange={handleChange}>
          {realData && realData.map(item => (
            <div className={styles.checkboxRow} key={item.legendName}>
              <Row>
                <Checkbox value={item.legendName} checked />
                {item.legendImgSrc && <ImageSimple className={styles.img} src={item.legendImgSrc} />}
                <div className={`${styles.legendName} ${value.includes(item.legendName) ? '' : 'TargetTrackPlay__label'}`} style={{ color: item.legendColor }}>{item.legendName}</div>
              </Row>
            </div>
          ))}
        </Checkbox.Group>
      </section>
      {!isNotControlPanel &&
        <section className={styles.ctrlPanel}>
          <PlayControlPanel ref={playRef} datetimeList={timeLine} onChange={handlePlay} />
        </section>
      }
    </article>
  )
})

// 定义默认值
TargetTrackPlay.defaultProps = {
  isMarker: true
}

export default React.memo(TargetTrackPlay)
