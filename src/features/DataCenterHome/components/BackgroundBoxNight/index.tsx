import Map2D, { MapTileType } from "helper/Map2D";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./index.module.sass";

import nightSrc from 'images/situation/nights.jpg'
import aisHighSrc from "images/shipList/ais_high.svg";
import { getSpeedLength, mapMarkerA, mapMarkerB } from "helper";
import { getAisColor, getMapFusionTargetIcon, getMapRadarTargetIcon, getMapWarnShipTargetIcon, markerAIcon, markerBIcon } from "helper/mapIcon";
import { useAppSelector } from "app/hooks";
import { selectValue as selectUserInfo } from "slice/userInfoSlice";
import _ from "lodash";
import { CreateProps as ShipData } from "webgis/extendUntils/layer/ShipMarker";
import ClientWebsocket from "helper/websocket";
import { getDictName, shipStatusDict } from "helper/dictionary";
import createElementByComponent from "helper/elementComponent";
import ShipPopup from "features/Core/components/SituationalAnalysis/components/ShipPopup";
import RadarPopup from "features/Core/components/SituationalAnalysis/components/RadarPopup";
import WarnMapInfo from "features/Core/components/WarnMapInfo";
import CanvasPane from "webgis/extendUntils/layer/CanvasPane";
import { createLineGroup, LineParams } from "webgis/untils/canvasDraw";
import { getAllDeviceMarkerGroup } from "server/map";
import DevicePopup from "features/Core/components/SituationalAnalysis/components/DevicePopup";
import { getDictDataByType } from "server/system";
import { useNavigate } from "react-router-dom";


const BackgroundBoxNight: React.FC = () => {
  console.debug('BackgroundBoxNight')


  const navigate = useNavigate();


  const mapRef = useRef<HTMLDivElement>(null)


  const userInfo = useAppSelector(selectUserInfo)


  const [map2d, setMap2D] = useState<Map2D>()
  const [shipMessage, setMessageShip] = useState<any>()
  const [messageTrails, setMessageTrails] = useState<any>()
  const [trailsCanvasLayer, setTrailsCanvasLayer] = useState<CanvasPane>()

  // 船舶图层
  const [aisLayerGroup, setAisLayerGroup] = useState<ShipData[]>([])
  const [radarLayerGroup, setRadarLayerGroup] = useState<any[]>([])
  const [fusionLayerGroup, setFusionLayerGroup] = useState<ShipData[]>([])


  /**
   * 展示预警等信息
   */
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
            content: <WarnMapInfo text={`${warnInfoDto.warnContent}:${warnInfoDto.monitorName}`} data={warnInfoDto} isNotOpenWindow={true} />
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
            content: <WarnMapInfo text={`${warnInfoDto.warnContent}:${warnInfoDto.monitorName}`} data={warnInfoDto} isNotOpenWindow={true} />
          })
        }

        layer.options.warnInfoLayer = infoMarker
        infoMarker.addTo(map2d.map)
      }
    },
    [map2d],
  )

  /**
     * 展示目标速度线
     */
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

  /**
   * 包含清除图层相关的清除函数
   */
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

  /** 监听点击事件跳转情指中心 */
  const handleClick = useCallback(
    () => {
      navigate('core')
    },
    [navigate]
  )



  // 初始化地图实例
  useEffect(() => {
    let _map2d: Map2D
    if (mapRef.current) {
      _map2d = new Map2D(mapRef.current, MapTileType.empty, {
        maxZoom: 12.8,
        minZoom: 12.8,
        center: [22.461464365278147, 113.94312501388569],
        dragging: false,
        doubleClickZoom: false,
      })
      setMap2D(_map2d)
    }
    return () => {
      if (_map2d) {
        _map2d.map.remove()
        setMap2D(undefined)
      }
    }
  }, [])

  // 贴UI设计图到地图上
  useEffect(() => {
    let Imglayer: any
    let topLeftPoint = L.latLng(22.562025064735266, 113.73733520507812),
      topRightPoint = L.latLng(22.560756873100104, 114.1417694091797),
      bottomLeftPoint = L.latLng(22.352298509371213, 113.7359619140625),
      bottomRightPoint = L.latLng(22.351345926606957, 114.14039611816406);
    if (map2d) {
      // 创建可以拖拽的UI设计图。
      const imgEle = document.createElement('img')
      imgEle.src = aisHighSrc
      imgEle.width = 0
      imgEle.height = 0

      let icon = L.divIcon({ html: imgEle, iconSize: [0, 0] })
      let topRightMarker = L.marker(topRightPoint, { draggable: true, icon }).addTo(map2d.map);
      let bottomLeftMarker = L.marker(bottomLeftPoint, { draggable: true, icon }).addTo(map2d.map);

      Imglayer = L.imageOverlay.rotated(nightSrc, topRightMarker, bottomLeftMarker, {
        opacity: 1,
        interactive: true,
        corners: [topLeftPoint, topRightPoint, bottomRightPoint, bottomLeftPoint]
      });
      map2d.map.addLayer(Imglayer);

    }
    return () => {
      Imglayer?.remove()
    }
  }, [map2d])

  // 渲染辅助图标
  useEffect(() => {
    const layerGroup = L.layerGroup()
    if (map2d) {
      mapMarkerA.forEach(latLng => {
        const marker = L.marker(latLng, { icon: markerAIcon, pane: 'shadowPane' }).bindTooltip('浮标', { className: 'leaflet-tooltip-ui', direction: 'top', offset: L.point(0, -8) });
        layerGroup.addLayer(marker)
      })
      mapMarkerB.forEach(latLng => {
        const marker = L.marker(latLng, { icon: markerBIcon, pane: 'shadowPane' }).bindTooltip('灯塔', { className: 'leaflet-tooltip-ui', direction: 'top', offset: L.point(0, -8) });
        layerGroup.addLayer(marker)
      })
      layerGroup.addTo(map2d.map)
    }
    return () => {
      layerGroup.clearLayers()
    }
  }, [map2d])

  // 创建尾迹专用画布图层
  useEffect(() => {
    let _trailsCanvasLayer: CanvasPane
    if (map2d) {
      _trailsCanvasLayer = map2d.createCanvasPane()
      setTrailsCanvasLayer(_trailsCanvasLayer)
    }
    return () => {
      _trailsCanvasLayer && _trailsCanvasLayer.remove()
    }
  }, [map2d])

  // 建立船舶信息websocket
  useEffect(() => {
    // 十分钟内没有数据则清空当前数据
    let timeOut: NodeJS.Timer
    let _clientWebsocket: ClientWebsocket
    try {
      _clientWebsocket = new ClientWebsocket(`${WEBSOCKET_URL}/channel`, userInfo.token)
      _clientWebsocket.onMessage(data => {
        const message = JSON.parse(data)
        if (message.code === 200) {
          if (message.module === '01' && message.cmd === '0103') {
            setMessageShip(message.data)
            setMessageTrails(message.data)
            timeOut && clearTimeout(timeOut)
            timeOut = setTimeout(() => {
              setMessageShip(null)
              setMessageTrails(null)
            }, 10 * 60 * 1000);
          }
        } else {
          console.warn('onMessage 接受数据异常', message)
        }
      })
      _clientWebsocket.send(JSON.stringify({
        module: "01",
        cmd: "0101",
        data: {
          dataType: ['1', '2', '3'],
          riskLevel: ['1', '2', '3', '4'],
          aisSizeType: ['1', '2', '3'],
          focusType: ['2', '3', '4', '5'],
          motionState: ['0', '1'],
          shipType: [],
          shipLabel: [],

        }
      }))
      _clientWebsocket.send(JSON.stringify({
        module: "01",
        cmd: "0103",
        data: {
          wakeFlag: 1,
          aisTimeLimit: 10,
          radarTimeLimit: 5
        }
      }))
    } catch (error) {
      console.error('连接websocket异常', error)
    }
    return () => {
      _clientWebsocket?.close()
      timeOut && clearTimeout(timeOut)
    }
  }, [userInfo.token])

  // websocket信息-处理船舶信息
  useEffect(() => {
    if (shipMessage) {
      const data = shipMessage

      const aisList = _.filter(data, ele => ele.tagType === '1' && _.has(ele, 'shipDataAisDto'))
      const radarList = _.filter(data, ele => ele.tagType === '2' && _.has(ele, 'shipDataRadarDto'))
      const fusionList = _.filter(data, ele => ele.tagType === '3')

      const _aisLayerGroup = aisList.map(ele => {
        const aisData = ele.shipDataAisDto
        return {
          trackId: ele.mmsi,
          lng: aisData.lng,
          lat: aisData.lat,
          speed: aisData.sog * 0.5144444444,
          course: aisData.cog * Math.PI / 180.0,
          heading: aisData.true_heading ? aisData.true_heading * Math.PI / 180.0 : aisData.cog * Math.PI / 180.0,
          extraData: ele
        }
      })
      const _radarLayerGroup = radarList.map(ele => {
        const radarData = ele.shipDataRadarDto
        return {
          trackId: ele.batchNum,
          lng: radarData.lng,
          lat: radarData.lat,
          speed: radarData.speed,
          course: radarData.course * Math.PI / 180.0,
          heading: radarData.course * Math.PI / 180.0,
          extraData: ele
        }
      })
      const _fusionLayerGroup = fusionList.map(ele => {
        const aisData = ele.shipDataAisDto
        const radarData = ele.shipDataRadarDto
        return {
          trackId: ele.mmsi || ele.batchNum,
          lng: ele.lng,
          lat: ele.lat,
          speed: ele.speed,
          course: aisData ? aisData.cog : radarData.course,
          heading: aisData ? aisData.true_heading : radarData.course,
          extraData: ele
        }
      })
      setAisLayerGroup(_aisLayerGroup)
      setRadarLayerGroup(_radarLayerGroup)
      setFusionLayerGroup(_fusionLayerGroup)
    } else {
      setAisLayerGroup([])
      setRadarLayerGroup([])
      setFusionLayerGroup([])
    }
  }, [shipMessage])

  // AIS船舶图层渲染
  useEffect(() => {
    let shipLayers: any[] = []

    if (map2d) {

      aisLayerGroup.forEach(item => {
        let shipLayer: any

        if (item.extraData.warnInfoDto) {

          const latLng = {
            lat: item.lat,
            lng: item.lng
          }

          const type = Number(item.extraData.shipType)

          const icon = getMapWarnShipTargetIcon({
            type,
            heading: item.extraData.shipDataAisDto.true_heading || 0
          })

          shipLayer = L.marker(latLng, { icon, extraData: item.extraData })

          showSpeedLine(shipLayer, item.speed, item.extraData.shipDataAisDto.cog)
        } else {
          const color = getAisColor(item.extraData.focusType, item.extraData.isBlackList)
          shipLayer = map2d.createShip({
            ...item,
            color,
            borderColor: '#404040',
            options: {
              defaultSymbol: [0.60, 0, -0.20, 0.24, -0.20, -0.24]
            }
          })
        }

        shipLayer.on("mouseover ", function (evt: any) {
          const extraData = evt.target.options.extraData
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

          evt.target.on('mouseout', () => {
            evt.target.closePopup()
          })
        })

        showExtraInfo(shipLayer, item.extraData)

        shipLayer.addTo(map2d.map);
        shipLayers.push(shipLayer)
      })

    }

    return () => {
      clearTargetLayers(shipLayers)
    }
  }, [map2d, showSpeedLine, showExtraInfo, clearTargetLayers, aisLayerGroup])

  // 雷达目标图层渲染
  useEffect(() => {
    let radarLayers: any[] = []
    if (map2d) {

      radarLayerGroup.forEach(item => {
        const latLng = {
          lat: item.lat,
          lng: item.lng
        }

        const icon = getMapRadarTargetIcon({
          riskLevel: item.extraData.riskLevel,
          caseBottom: item.extraData.caseBottom,
          heading: item.extraData.shipDataRadarDto.course
        })

        const radarLayer = L.marker(latLng, { icon, extraData: item.extraData })

        radarLayer.on("mouseover ", function (evt: any) {
          const layer = evt.target
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

          layer.on('mouseout', () => {
            layer.closePopup()
          })
        })

        showExtraInfo(radarLayer, item.extraData)

        showSpeedLine(radarLayer, item.speed, item.extraData.shipDataRadarDto.course)

        radarLayer.addTo(map2d.map);
        radarLayers.push(radarLayer)
      })

    }

    return () => {
      clearTargetLayers(radarLayers)
    }
  }, [map2d, showSpeedLine, showExtraInfo, clearTargetLayers, radarLayerGroup])

  // 融合目标图层渲染
  useEffect(() => {
    let fusionLayers: any[] = []
    if (map2d) {

      fusionLayerGroup.forEach(item => {
        const latLng = {
          lat: item.lat,
          lng: item.lng
        }

        let icon = getMapFusionTargetIcon({
          riskLevel: item.extraData.riskLevel,
          caseBottom: item.extraData.caseBottom,
          heading: item.heading || item.course
        })

        const fusionLayer = L.marker(latLng, { icon, extraData: item.extraData })

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

            layer.bindPopup(htmlEle, {
              className: 'leaflet-popup-ui',
              minWidth: 220,
              autoPan: false,
              offset: L.point(0, -4)
            }).openPopup()

            layer.on('mouseout', () => {
              layer.closePopup()
            })
          }
        })

        showExtraInfo(fusionLayer, item.extraData)

        showSpeedLine(fusionLayer, item.speed, item.extraData.shipDataRadarDto?.course)

        fusionLayer.addTo(map2d.map);
        fusionLayers.push(fusionLayer)
      })

    }

    return () => {
      clearTargetLayers(fusionLayers)
    }
  }, [map2d, showSpeedLine, showExtraInfo, clearTargetLayers, fusionLayerGroup])

  // 目标尾迹信息渲染
  useEffect(() => {

    if (map2d && messageTrails && trailsCanvasLayer) {
      const data = messageTrails

      const aisShipList = _.filter(data, (ship: any) => ship.tagType === '1' || ship.tagType === '3')
      const aisLlineList: LineParams[] = []
      aisShipList.forEach((ship: any) => {
        const validPointList = _.filter(ship.pathList, ele => ele.lat && ele.lng)
        const lineLatLngList = validPointList.map(ele => ({ lat: ele.lat, lng: ele.lng }))
        const lineParams: LineParams = {
          latLngList: lineLatLngList,
          color: 'rgba(255, 255, 255, 0.5)'
        }
        aisLlineList.push(lineParams)
      })


      const radarShipList = _.filter(data, (ship: any) => ship.tagType === '2')
      const radarLineList: LineParams[] = []
      radarShipList.forEach((ship: any) => {
        const validPointList = _.filter(ship.pathList, ele => ele.lat && ele.lng)
        const lineLatLngList = validPointList.map(ele => ({ lat: ele.lat, lng: ele.lng }))
        const lineParams: LineParams = {
          latLngList: lineLatLngList,
          color: 'rgba(255, 255, 255, 0.5)'
        }
        radarLineList.push(lineParams)
      })

      trailsCanvasLayer.addDrawFn(info => createLineGroup(aisLlineList, info.canvas, map2d))
      trailsCanvasLayer.addDrawFn(info => createLineGroup(radarLineList, info.canvas, map2d))
    }

    return () => {
      trailsCanvasLayer?.clear()
    }
  }, [map2d, messageTrails, trailsCanvasLayer])

  // 设备信息图层渲染
  useEffect(() => {
    let group: any
    let ctr: AbortController
    async function main() {
      if (map2d) {
        ctr = new AbortController()
        const deviceDict = await getDictDataByType('device_type', 'auto', ctr)
        const allDeviceValue = deviceDict.map((ele: any) => ele.value)
        const deviceSource = ['0', '1']
        const vo = await getAllDeviceMarkerGroup(allDeviceValue, ctr)
        const markerList = vo.map(ele => {
          const marker = L.marker(ele.latLng, {
            extraData: ele,
            icon: ele.lIcon
          })
          const htmlEle = createElementByComponent(<DevicePopup data={ele} />)
          marker.bindPopup(htmlEle, {
            offset: L.point(0, -10),
            minWidth: 220,
            autoPan: false,
            className: 'leaflet-popup-ui'
          })
          marker.on("mouseover ", function (evt: any) {
            evt.target.openPopup()
          })
          return marker
        })
        group = L.featureGroup(markerList).addTo(map2d.map);
      }
    }
    main()
    return () => {
      group && group.remove()
      ctr && ctr.abort()
    }
  }, [map2d])


  return (
    <article className={styles.wrapper} onClick={handleClick}>
      <div className={styles.map} ref={mapRef}></div>
    </article>
  )
}

export default BackgroundBoxNight