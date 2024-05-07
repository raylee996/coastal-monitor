import { FormProps, message, Spin } from "antd";
import PlayControlPanel, { PlayControlPanelRefProps } from "component/PlayControlPanel";
import windowUI from "component/WindowUI";
import dayjs, { Dayjs } from "dayjs";
import { getSpeedLength, keepRequest, YMDHms } from "helper";
import { DataPackTrackDict, dataPlayTypeDict, getDictName, shipStatusDict } from "helper/dictionary";
import createElementByComponent from "helper/elementComponent";
import Map2D, { MapTileType } from "helper/Map2D";
import { fusionIcon, getMapRadarTargetIcon } from "helper/mapIcon";
import { InputType } from "hooks/flexibility/FormPanel";
import FormInterface from "hooks/integrity/FormInterface";
import _ from "lodash";
import { startTransition, useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { getTrackReviewAndBehavirecordData } from "server/ship";
import RadarTargetInfo from "../RadarTargetInfo";
import ShipInfo from "../ShipInfo";
import RadarPopup from "../SituationalAnalysis/components/RadarPopup";
import ShipPopup from "../SituationalAnalysis/components/ShipPopup";
import WarnMapInfo from "../WarnMapInfo";
import styles from "./index.module.sass";
import CanvasPane from "webgis/extendUntils/layer/CanvasPane";
import { createLineGroup, LineParams } from "webgis/untils/canvasDraw";
import { setSituationalAnalysis } from "slice/coreMapSlice";
import { useAppDispatch } from "app/hooks";
import HocShipPopup from "./components/HocShipPopup";
// import { DayTimeRangeValue } from "hooks/basis/DayTimeRange";
import { DayjsPair } from "hooks/hooks";
import BackTime from "./components/BackTime";


export interface DataPlayBackQueryData {
  range: DayjsPair
  types: string[]
  isTrack: boolean
  trackTime: number
}


const inputs = [
  // ['回放时段', 'range', InputType.dateTimeRange, { allowClear: false }],
  ['回放时段', 'range', InputType.component, { component: BackTime }],
  ['数据类型', 'types', InputType.selectMultiple, { dict: dataPlayTypeDict, style: { minWidth: '120px' } }],
  ['尾迹查看', 'isTrack', InputType.select, { dict: DataPackTrackDict, allowClear: false }],
  ['尾迹时长(单位:分钟)', 'trackTime', InputType.number]
]

const options = {
  isNotShowFooter: true,
  isShowItemButton: true,
  isShowReset: true,
  submitText: '查询',
}

const formProps: FormProps<any> = {
  layout: 'inline'
}

let data: { [index: string]: any[] } = {}
let keepRequestStartTime: Dayjs | undefined = undefined
let keepRequestEndTime: Dayjs | undefined = undefined
let queryStartTime: Dayjs | undefined = undefined


const DataPlayBack: React.FC = () => {
  console.debug('DataPlayBack')


  const dispatch = useAppDispatch()


  const mapRef = useRef<HTMLDivElement>(null)
  const playCtrlRef = useRef<PlayControlPanelRefProps>(null)


  useState(() => {
    data = {}
    keepRequestEndTime = undefined
    queryStartTime = undefined
  })


  const [map2d, setMap2d] = useState<Map2D>()
  const [isLoading, setIsLoading] = useState(false)
  const [trailsCanvasLayer, setTrailsCanvasLayer] = useState<CanvasPane>()
  const [aisLayerGroup, setAisLayerGroup] = useState<any[]>([])
  const [radarLayerGroup, setRadarLayerGroup] = useState<any[]>([])
  const [fusionLayerGroup, setFusionLayerGroup] = useState<any[]>([])
  const [trackData, setTrackData] = useState<any[]>()
  // const [initQueryData] = useState<DataPlayBackQueryData>({ range: [dayjs(), [dayjs().subtract(1, 'h'), dayjs()]], types: ['2'], isTrack: true, trackTime: 5 })
  const [initQueryData] = useState<DataPlayBackQueryData>({ range: [dayjs().subtract(30, 'm'), dayjs()], types: ['2'], isTrack: true, trackTime: 5 })
  const [datetimeIndex, setDatetimeIndex] = useState<string>(() => {
    const [sTime] = initQueryData.range!
    return sTime!.format(YMDHms)
  })
  const [queryData, setQueryData] = useState<DataPlayBackQueryData>(initQueryData)
  const [keepData, setKeepData] = useState<DataPlayBackQueryData>()
  // const [data, setData] = useState<any>([])
  const [selectTarget, setSelectTarget] = useState({ codeType: 0, content: '' })
  const [isShowPoint, setIsShowPoint] = useState(false)
  const [isReady, setIsReady] = useState(false)


  const deferredDatetimeIndex = useDeferredValue(datetimeIndex)


  // 配置播放控制参数
  const startCount = useMemo(() => {

    const timeRange = queryData.range

    let start: Dayjs
    let end: Dayjs

    if (timeRange) {
      const [sTime, eTime] = timeRange
      if (sTime) {
        start = sTime
      } else {
        start = dayjs()
      }
      if (eTime) {
        end = eTime
      } else {
        end = dayjs()
      }
    } else {
      start = dayjs()
      end = dayjs()
    }

    return {
      datetime: start.format(YMDHms),
      count: end.unix() - start.unix(),
      seconds: 3
    }
  }, [queryData])

  // 是否展示轨迹
  const isShowTrack = useMemo(() => queryData.isTrack, [queryData])


  // 展示预警等信息
  const showExtraInfo = useCallback(
    (layer: any, data: any) => {
      if (map2d && data.warnInfoDto) {
        const warnInfoDto = data.warnInfoDto
        const latLng = layer.getLatLng()
        let infoMarker: any
        // 靠岸预警
        if (warnInfoDto.eventType === '05' && warnInfoDto.relationInfo) {
          const layerGroup = L.layerGroup()
          const relationInfo = JSON.parse(warnInfoDto.relationInfo)
          const _latLng = {
            lat: relationInfo.latitude,
            lng: relationInfo.longitude
          }

          const _infoMarker = map2d.createInfoMarker({
            latLng: latLng,
            content: <WarnMapInfo text={`${warnInfoDto.warnContent}:${warnInfoDto.monitorName}`} />
          })

          if (relationInfo.latitude && relationInfo.longitude) {

            const line = L.polyline([latLng, _latLng], { color: '#ff2f25', dashArray: '5,5' })
            layerGroup.addLayer(line)
          }
          layerGroup.addLayer(_infoMarker)
          infoMarker = layerGroup

        } else {
          infoMarker = map2d.createInfoMarker({
            latLng: latLng,
            content: <WarnMapInfo text={`${warnInfoDto.warnContent}:${warnInfoDto.monitorName}`} />
          })
        }

        layer.options.warnInfoLayer = infoMarker
        infoMarker.addTo(map2d.map)
      }
    },
    [map2d],
  )

  // 展示目标速度线
  const showSpeedLine = useCallback(
    (layer: any, speed?: number, course?: number) => {
      if (map2d && speed && course) {
        const latLng = layer.getLatLng()
        const lineLatlngs = getSpeedLength(latLng, speed, course)
        const speedLineLayer = L.polyline(lineLatlngs, {
          weight: 1,
          color: '#404040'
        })
        layer.options.speedLineLayer = speedLineLayer
        speedLineLayer.addTo(map2d.map)
      }
    },
    [map2d],
  )

  // 包含清除图层相关的清除函数
  const clearTargetLayers = useCallback(
    (layers: any[]) => {
      layers.forEach((layer: any) => {
        if (layer.options.warnInfoLayer) {
          layer.options.warnInfoLayer.remove()
        }
        if (layer.options.speedLineLayer) {
          layer.options.speedLineLayer.remove()
        }
        layer.remove()
      })
    },
    [],
  )


  // 初始化地图实例
  useEffect(() => {
    let _map2d: Map2D
    if (mapRef.current) {
      _map2d = new Map2D(mapRef.current, MapTileType.satellite)
      _map2d.map.on('zoom', (evt: any) => {
        const zoom = evt.target.getZoom()
        if (zoom === 12) {
          setIsShowPoint(true)
        } else {
          setIsShowPoint(false)
        }
      })
      setMap2d(_map2d)
    }
    dispatch(setSituationalAnalysis(false))
    return () => {
      _map2d && _map2d.remove()
      dispatch(setSituationalAnalysis(true))
    }
  }, [dispatch])

  // 分拣数据
  useEffect(() => {
    const _aisLayerGroup: any[] = []
    const _radarLayerGroup: any[] = []
    const _fusionLayerGroup: any[] = []

    const _trackData: any[] = []

    // 处理船舶与雷达目标
    if (deferredDatetimeIndex && isReady && !_.isEmpty(data)) {

      const datetimeDayjs = dayjs(deferredDatetimeIndex)

      // 获取需要展示的点，分拣不同类型的目标
      _.forIn(data, (shipTrack) => {
        const headPoint: any = _.head(shipTrack)
        const targetTrack = {
          ...headPoint,
          pointList: []
        }
        let isTarck = false
        const setIsTarck = () => {
          isTarck = true
          return isTarck
        }
        for (let i = 0; i < shipTrack.length; i++) {
          const point = shipTrack[i]
          const pointDayjs = dayjs(point.capTime)
          if (pointDayjs.isSame(datetimeDayjs)) {
            pushPoint(point) && setIsTarck()
            break
          } else {
            if (pointDayjs.isAfter(datetimeDayjs)) {
              if (i !== 0) {
                const previous = shipTrack[i - 1]
                const previousDayjs = dayjs(previous.capTime)
                if (previousDayjs.isBefore(datetimeDayjs)) {
                  if (previous.codeType === 6) { //ais目标
                    datetimeDayjs.diff(previousDayjs, 'm') < 10 && pushPoint(previous) && setIsTarck()
                  } else { //雷达目标
                    datetimeDayjs.diff(previousDayjs, 's') < 10 && pushPoint(previous) && setIsTarck()
                  }
                }
              }
              break
            } else if (i === shipTrack.length - 1) {
              if (point.codeType === 6) { //ais目标
                datetimeDayjs.diff(pointDayjs, 'm') < 10 && pushPoint(point) && setIsTarck()
              } else { //雷达目标
                datetimeDayjs.diff(pointDayjs, 's') < 10 && pushPoint(point) && setIsTarck()
              }
            }
          }
          if (pointDayjs.isBefore(datetimeDayjs)) {
            datetimeDayjs.diff(pointDayjs, 'm') < queryData.trackTime && targetTrack.pointList.push(point)
          }
        }
        if (isTarck && targetTrack.pointList.length > 0) {
          _trackData.push(targetTrack)
        }
      })

      startTransition(() => {
        setAisLayerGroup(_aisLayerGroup)
        setRadarLayerGroup(_radarLayerGroup)
        setFusionLayerGroup(_fusionLayerGroup)
        setTrackData(_trackData)
      })
    } else {
      startTransition(() => {
        setAisLayerGroup([])
        setRadarLayerGroup([])
        setFusionLayerGroup([])
        setTrackData([])
      })
    }

    // 分拣不同类型的目标
    function pushPoint(point: any) {
      let shipData = {
        trackId: point.content,
        lng: point.longitude,
        lat: point.latitude,
        speed: point.speed * 0.5144444444,
        course: point.course * Math.PI / 180.0,
        heading: point.trueHeading ? point.trueHeading * Math.PI / 180.0 : point.course * Math.PI / 180.0,
        warnInfoDto: point.warnInfoDto
      }
      switch (point.codeType) {
        case 6:
          const ais = {
            ...shipData,
            shipDataAisDto: {
              mmsi: point.content,
              sog: point.speed,
              cog: point.course,
              capTime: point.capTime,
              nav_status: point.trackStatus,
              true_heading: point.trueHeading
            }
          }
          _aisLayerGroup.push({
            ...ais,
            extraData: ais
          })
          break;
        case 7:
          const radar = {
            tagCode: point.targetId,
            batchNum: point.content,
            capTime: point.capTime,
            ...shipData,
            shipDataRadarDto: {
              lat: point.longitude,
              lng: point.longitude,
              uniqueid: point.content,
              speed: point.speed,
              course: point.course,
              capTime: point.capTime
            }
          }
          _radarLayerGroup.push({
            ...radar,
            extraData: radar
          })
          break;
        case 8:
          _fusionLayerGroup.push(shipData)
          break;
        default:
          break;
      }
      return true
    }

  }, [isReady, queryData, deferredDatetimeIndex])

  // AIS船舶图层渲染
  useEffect(() => {
    let nowShipLayer: any[] = []

    if (map2d && !isShowPoint) {

      aisLayerGroup.forEach(item => {

        let color: string = '#25F076'

        if (item.warnInfoDto) {
          switch (item.warnInfoDto.riskLevel) {
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
        }

        const shipLayer = map2d.createShip({
          ...item,
          color,
          borderColor: '#404040',
          options: {
            defaultSymbol: [0.60, 0, -0.20, 0.24, -0.20, -0.24]
          }
        })

        shipLayer.on("mouseover ", function (evt: any) {
          const extraData = evt.target.options.extraData
          const aisData = extraData.shipDataAisDto
          const stateName = getDictName(shipStatusDict, aisData.nav_status)
          const htmlEle = createElementByComponent(<HocShipPopup
            name={extraData.shipName}
            mmsi={aisData.mmsi}
            state={stateName}
            speed={aisData.sog}
            course={aisData.cog}
            lat={item.lat}
            lng={item.lng}
            time={aisData.capTime}
          />)
          evt.target.bindPopup(htmlEle, {
            className: 'leaflet-popup-ui',
            minWidth: 220,
            autoPan: false,
            offset: L.point(0, -4)
          }).openPopup()
        })

        shipLayer.on("click", function (evt: any) {
          const extraData = evt.target.options.extraData
          const aisData = extraData.shipDataAisDto
          let riskLevel = 4
          if (item.extraData.warnInfoDto) {
            riskLevel = item.extraData.warnInfoDto.riskLevel
          }
          const title = `船舶目标-MMSI:${aisData.mmsi}`
          windowUI(<ShipInfo
            mmsi={aisData.mmsi}
            data={extraData}
            riskLevel={riskLevel}
            alarmEndTime={aisData.capTime}
          />, {
            title,
            width: 400,
            height: 720,
            key: 'targetInfo',
            zIndex: 1069
          })

          setSelectTarget({ codeType: 6, content: extraData.trackId })

        })

        showExtraInfo(shipLayer, item.extraData)

        shipLayer.addTo(map2d.map);
        nowShipLayer.push(shipLayer)
      })

    }

    return () => {
      clearTargetLayers(nowShipLayer)
    }
  }, [map2d, aisLayerGroup, isShowPoint, showExtraInfo, clearTargetLayers])

  // 雷达目标图层渲染
  useEffect(() => {
    let nowRadarLayer: any[] = []

    if (map2d && !isShowPoint) {

      radarLayerGroup.forEach(item => {
        const latLng = {
          lat: item.lat,
          lng: item.lng
        }

        let icon: any
        if (item.warnInfoDto) {
          icon = getMapRadarTargetIcon({
            riskLevel: item.warnInfoDto.riskLevel,
            caseBottom: 0,
            heading: item.shipDataRadarDto.course
          })
        } else {
          icon = getMapRadarTargetIcon({
            riskLevel: 0,
            caseBottom: 0,
            heading: item.shipDataRadarDto.course
          })
        }

        const radarLayer = L.marker(latLng, { icon, extraData: item.extraData })

        radarLayer.on("mouseover ", function (evt: any) {
          const layer = evt.target
          if (!layer.getTooltip()) {
            const extraData = layer.options.extraData
            const radarData = extraData.shipDataRadarDto
            const htmlEle = createElementByComponent(<RadarPopup
              number={extraData.batchNum}
              speed={radarData.speed}
              course={radarData.course}
              time={radarData.capTime}
              lat={item.lat}
              lng={item.lng}
            />)
            layer.bindPopup(htmlEle, {
              className: 'leaflet-popup-ui',
              minWidth: 220,
              autoPan: false,
              offset: L.point(0, -4)
            }).openPopup()
          }
        })

        radarLayer.on("click", function (evt: any) {
          const extraData = evt.target.options.extraData
          const radarData = extraData.shipDataRadarDto
          const title = `雷达目标-批号:${extraData.batchNum}`
          let riskLevel = 4
          if (item.extraData.warnInfoDto) {
            riskLevel = item.extraData.warnInfoDto.riskLevel
          }
          windowUI(<RadarTargetInfo
            radarNumber={extraData.batchNum}
            data={extraData}
            riskLevel={riskLevel}
            alarmEndTime={radarData.capTime}
          />, {
            title,
            width: 400,
            height: 720,
            key: 'targetInfo',
            zIndex: 1069
          })
        })

        showExtraInfo(radarLayer, item.extraData)

        showSpeedLine(radarLayer, item.speed, item.extraData.shipDataRadarDto.course)

        radarLayer.addTo(map2d.map);
        nowRadarLayer.push(radarLayer)
      })

    }

    return () => {
      clearTargetLayers(nowRadarLayer)
    }
  }, [map2d, radarLayerGroup, isShowPoint, clearTargetLayers, showExtraInfo, showSpeedLine])

  // 融合目标图层渲染
  useEffect(() => {
    let nowFusionLayer: any[] = []

    if (map2d && !isShowPoint) {

      fusionLayerGroup.forEach(item => {
        const latLng = {
          lat: item.lat,
          lng: item.lng
        }

        const fusionLayer = L.marker(latLng, { icon: fusionIcon, extraData: item.extraData })

        fusionLayer.on("mouseover ", function (evt: any) {
          const layer = evt.target
          if (!layer.getTooltip()) {
            const extraData = layer.options.extraData
            const aisData = extraData.shipDataAisDto
            const stateName = getDictName(shipStatusDict, aisData.nav_status)
            const htmlEle = createElementByComponent(<ShipPopup
              name={extraData.shipName}
              mmsi={extraData.mmsi}
              state={stateName}
              speed={aisData.sog}
              course={aisData.cog}
              lat={item.lat}
              lng={item.lng}
              time={aisData.capTime}
            />)
            evt.target.bindPopup(htmlEle, {
              className: 'leaflet-popup-ui',
              minWidth: 220,
              autoPan: false,
              offset: L.point(0, -4)
            }).openPopup()
          }
        })

        fusionLayer.on("click", function (evt: any) {
          const extraData = evt.target.options.extraData
          let riskLevel = 4
          if (extraData.warnInfoDto) {
            riskLevel = item.extraData.warnInfoDto.riskLevel
          }
          const title = `融合目标-MMSI:${extraData.mmsi}`
          windowUI(<ShipInfo
            mmsi={extraData.mmsi}
            data={extraData}
            riskLevel={riskLevel}
            targetId={extraData.tagCode}
          />, {
            title,
            width: 400,
            height: 720,
            key: 'targetInfo',
            zIndex: 1069
          })
        })

        showExtraInfo(fusionLayer, item.extraData)

        showSpeedLine(fusionLayer, item.speed, item.extraData.shipDataRadarDto?.course)

        fusionLayer.addTo(map2d.map);
        nowFusionLayer.push(fusionLayer)
      })

    }

    return () => {
      clearTargetLayers(nowFusionLayer)
    }
  }, [map2d, fusionLayerGroup, isShowPoint, showExtraInfo, showSpeedLine, clearTargetLayers])

  // 创建尾迹专用画布图层
  useEffect(() => {
    let _trailsCanvasLayer: CanvasPane
    if (map2d && isShowTrack) {
      _trailsCanvasLayer = map2d.createCanvasPane()
      setTrailsCanvasLayer(_trailsCanvasLayer)
    } else {
      setTrailsCanvasLayer(undefined)
    }
    return () => {
      _trailsCanvasLayer && _trailsCanvasLayer.remove()
    }
  }, [map2d, isShowTrack])

  // 轨迹渲染
  useEffect(() => {
    if (map2d && isShowTrack && trailsCanvasLayer && trackData) {
      const lineList: LineParams[] = []
      trackData.forEach((target: any) => {
        const lineLatLngList = target.pointList.map((ele: any) => ({ lat: ele.latitude, lng: ele.longitude }))
        const lineParams: LineParams = {
          latLngList: lineLatLngList,
          color: 'rgba(255, 255, 255, 0.5)'
        }
        lineList.push(lineParams)
      })
      trailsCanvasLayer.addDrawFn(info => createLineGroup(lineList, info.canvas, map2d))
    }
    return () => {
      if (trailsCanvasLayer) {
        trailsCanvasLayer.clearDrawFn()
        trailsCanvasLayer.clearContent()
      }
    }
  }, [map2d, isShowTrack, trailsCanvasLayer, trackData])

  // 展示选中目标
  useEffect(() => {
    let target: any
    if (selectTarget && map2d) {
      if (selectTarget.codeType === 6) {
        target = aisLayerGroup.find(item => item.extraData.trackId === selectTarget.content)
      } else {
        target = radarLayerGroup.find(item => item.extraData.trackId === selectTarget.content)
      }
      if (target) {
        const latLng = {
          lat: target.lat,
          lng: target.lng
        }
        map2d.createSelectTarget(latLng)
      }
    }

    // 展示选中目标近一小时轨迹
    let ctr: AbortController
    let layer: any
    // async function main() {
    //   if (target && map2d) {
    //     ctr = new AbortController()
    //     const queryParams = {
    //       range: [dayjs().subtract(1, 'h'), dayjs(target.capTime)],
    //       types: ['1']
    //     }
    //     const data = await getTrackReviewAndBehavirecord(queryParams, ctr)
    //     console.log(data)
    //   }
    // }
    // main()

    return () => {
      map2d && map2d.clearSelectTarget()
      ctr && ctr.abort()
      layer && layer.remove()
    }
  }, [map2d, selectTarget, aisLayerGroup, radarLayerGroup])

  // 展示点颜色
  useEffect(() => {
    let aisGroup: any
    let radarGroup: any

    if (map2d && isShowPoint) {

      const aisList = aisLayerGroup.map(item => ({
        latLng: {
          lat: item.lat,
          lng: item.lng
        },
        circleMarkerOptions: {
          fillColor: '#25F076'
        }
      }))

      const radarList = radarLayerGroup.map(item => ({
        latLng: {
          lat: item.lat,
          lng: item.lng
        },
        circleMarkerOptions: {
          fillColor: '#eeeeee'
        }
      }))

      aisGroup = map2d.createMarkerGroup(aisList)
      radarGroup = map2d.createMarkerGroup(radarList)
    }
    return () => {
      aisGroup && aisGroup.remove()
      radarGroup && radarGroup.remove()
    }
  }, [map2d, isShowPoint, aisLayerGroup, radarLayerGroup, fusionLayerGroup])

  // 轮询数据请求
  useEffect(() => {
    let onExit: any
    let ctr: AbortController

    if (keepData) {
      const [sTime, eTime]: DayjsPair = keepData.range

      let _sTime: Dayjs
      let _eTime: Dayjs
      let timeVal: number = keepData.isTrack ? keepData.trackTime : 5

      setIsLoading(true)
      setIsReady(false)

      data = {}

      const main = async () => {
        try {
          const _params = { ...keepData }

          if (queryStartTime) {
            data = {}
            _sTime = dayjs(queryStartTime).subtract(5, 'm')
            keepRequestStartTime = _sTime
            keepRequestEndTime = _sTime
          } else {
            if (_sTime && _eTime) {
              _sTime = dayjs(_eTime)
            } else {
              _sTime = dayjs(sTime).subtract(5, 'm')
              keepRequestStartTime = _sTime
              keepRequestEndTime = _sTime
            }
          }

          if (_sTime.isAfter(eTime)) {
            // 退出循环请求数据
            onExit && onExit()
          } else {
            _eTime = dayjs(_sTime).add(timeVal + 5, 'm')
            _params.range = [_sTime, _eTime]
            ctr = new AbortController()
            const result = await getTrackReviewAndBehavirecordData(_params, ctr)
            keepRequestEndTime = _eTime

            if (queryStartTime) {
              queryStartTime = undefined
              playCtrlRef.current?.play()
            }
            return result
          }
        } catch (error) {
          console.warn('获取数据异常', error)
          return {}
        }
      }

      onExit = keepRequest(main, (result: any) => {
        _.forIn(result, (track, k) => {
          const isHas = _.has(data, k)
          if (isHas) {
            data[k] = data[k].concat(track)
          } else {
            _.set(data, k, track)
          }
        })
        setIsReady(true)
        setIsLoading(false)
      })
    }

    return () => {
      onExit && onExit()
      ctr?.abort()
    }
  }, [keepData])



  const handleFinish = useCallback(
    async (params: any) => {
      const [sTime, eTime]: DayjsPair = params.range
      queryStartTime = undefined
      if (sTime && eTime) {
        const diffVal = eTime.diff(sTime, 'h')
        if (diffVal > 24) {
          message.warning('回放时段请在24小时范围内')
        } else {
          setQueryData(params)
          setKeepData(params)
        }
      } else {
        message.warning('必须输入完整回放时段')
      }
    },
    []
  )

  const handlePlay = useCallback(
    (value: number) => {
      const nowDayjs = dayjs(startCount.datetime).add(value, 's')
      const _datetimeIndex = nowDayjs.format(YMDHms)
      setDatetimeIndex(_datetimeIndex)
      if (value !== 0 && (nowDayjs.isAfter(keepRequestEndTime) || nowDayjs.isBefore(keepRequestStartTime))) {
        playCtrlRef.current?.pause()
        queryStartTime = nowDayjs
        setKeepData(val => val ? { ...val } : val)
      }
    },
    [startCount]
  )


  const isNotCanPlay = useMemo(() => !isReady, [isReady])


  return (
    <article className={styles.wrapper}>

      {isLoading &&
        <aside className={styles.loading}>
          <Spin tip="加载数据中" size="large"></Spin>
        </aside>
      }

      <section className={styles.content}>
        <div className={styles.map} ref={mapRef}></div>
      </section>

      <section className={styles.search}>
        <FormInterface
          inputs={inputs}
          initData={initQueryData}
          options={options}
          formProps={formProps}
          onAsyncFinish={handleFinish}
        />
      </section>

      <section className={styles.control}>
        <PlayControlPanel ref={playCtrlRef} isNotCanPlay={isNotCanPlay} onChange={handlePlay} startCount={startCount} />
      </section>

    </article>
  )
}

export default DataPlayBack