import { message, Tabs } from "antd"
import PerceiveTarget, { CONDITION_VALUE_A, perceiveTargetDefaultValue, PerceiveTargetValue } from "./components/PerceiveTarget";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getDictName, shipStatusDict } from "helper/dictionary";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { selectMessageShip, selectMessageTrails } from "slice/websocketMessageSlice";
import _ from "lodash";
import RadarTargetInfo from "../RadarTargetInfo";
import createElementByComponent from "helper/elementComponent";
import RadarPopup from "./components/RadarPopup";
import ShipInfo from "../ShipInfo";
import ShipPopup from "./components/ShipPopup";
import { websocketSend } from "slice/websocketSendSlice";
import { CreateProps as ShipData } from "webgis/extendUntils/layer/ShipMarker";
import Infrastructure, { CONDITION_VALUE_B, infrastructureDefaultValue, InfrastructureValue } from "./components/Infrastructure";
import { selectValue, setSituationalAnalysis } from "slice/coreMapSlice";
import { getAllDeviceType, getDeviceSourceOptions } from "server/device";
import { getDeviceVideoWarnAreaList, getDictDataByType, getShipTypeDictData } from "server/system";
import { delTextMarker, getAllDeviceMarkerGroupBySource, getAllMarkList, getCtrlArea, getPlaceData } from "server/map";
import DevicePopup from "./components/DevicePopup";
import WarnMapInfo from "../WarnMapInfo";
import { local } from "helper/storage";
import WarnDanger, { CONDITION_VALUE_C, warnDangerDefaultValue, WarnDangerValue } from "./components/WarnDanger";
import { getBehavirecordHeatMapData, getHighIncidenceData, getRiskHeatMapData, getRiskTypeStatsData } from "server/warn";
import windowUI from "component/WindowUI";
import { createCircleGroup, createLatlngGird, createLineGroup, LineParams } from "webgis/untils/canvasDraw";
import CanvasPane from "webgis/extendUntils/layer/CanvasPane";
import { getMapPinIcon, markerAIcon, markerBIcon } from "helper/mapIcon";
import { clearSelectTarget, selectTarget, selectTargetValue } from "slice/selectTargetSlice";
import { getPlaceTypeIconSrc, getSpeedLength, Hms, mapMarkerA, mapMarkerB } from "helper";
import { MapTileType } from "helper/Map2D";
import AreaTargetPopup from "./components/AreaTargetPopup";
import { createDrawAreaPolyline, createYawPolyline } from "helper/map/common";
import TextMarkerContent from "./components/TextMarkerContent";
import useRealtimeVideo from "useHook/useRealtimeVideo";
import PinPopup from "../PinPopup";
import dayjs from "dayjs";

import '../../index.sass'
import VoicePlayPanel from "../Voice/VoicePlayPanel";
import { setIndex, setParams } from "slice/funMenuSlice";
import { getAisTargetIcon, getFusionTargetIcon, getRadarTargetIcon } from "helper/mapTargetIcon";
import PlanManagementPopup from "./components/PlanManagementPopup";
import { createPlanManagementMap } from "helper/map/planManagement";
import SvgPic from 'component/SvgaPic'
import { earlyWarningIconColor } from "../WarningModel/components/WarningTypeCardItem";

const planDestinationSvga = require('images/core/planManagement/plan_destination.svga')

const pinIcon = getMapPinIcon()

let handleOpenRealtimeWin: any

interface Props {
  mapType: MapTileType
}

const SituationalAnalysis: React.FC<Props> = ({ mapType }) => {
  useState(() => { console.debug('SituationalAnalysis') })

  const dispatch = useAppDispatch()
  handleOpenRealtimeWin = useRealtimeVideo()

  const shipMessage = useAppSelector(selectMessageShip)
  const trailsMessage = useAppSelector(selectMessageTrails)
  const followTargetValue = useAppSelector(selectTargetValue)

  const { map2d, isSituationalAnalysis } = useAppSelector(selectValue)

  const [trailsCanvasLayer, setTrailsCanvasLayer] = useState<CanvasPane>()
  const [latLngCanvasLayer, setLatLngCanvasLayer] = useState<CanvasPane>()

  const [tabsValue, setTabsValue] = useState('1')

  const [valueA, setValueA] = useState<PerceiveTargetValue>(() => {
    const _valueA = local(CONDITION_VALUE_A)
    if (_valueA) {
      return {
        ..._.clone(perceiveTargetDefaultValue),
        ..._valueA
      }
    } else {
      return _.clone(perceiveTargetDefaultValue)
    }
  })

  const [valueB, setValueB] = useState<InfrastructureValue>(() => {
    const _valueB = local(CONDITION_VALUE_B)
    if (_valueB) {
      return {
        ..._.clone(infrastructureDefaultValue),
        ..._valueB
      }
    } else {
      return _.clone(infrastructureDefaultValue)
    }
  })

  const [valueC, setValueC] = useState<WarnDangerValue>(() => {
    const _valueC = local(CONDITION_VALUE_C)
    if (_valueC) {
      return {
        ..._.clone(warnDangerDefaultValue),
        ..._valueC
      }
    } else {
      return _.clone(warnDangerDefaultValue)
    }
  })

  // 船舶图层
  const [aisLayerGroup, setAisLayerGroup] = useState<ShipData[]>([])
  const [radarLayerGroup, setRadarLayerGroup] = useState<any[]>([])
  const [fusionLayerGroup, setFusionLayerGroup] = useState<ShipData[]>([])
  const [shipTypeData, setShipTypeData] = useState<any[]>([])
  // 预案实战图层
  const [shipPlanLayerGroup, setShipPlanLayerGroup] = useState<any[]>([])


  const isShowRadarShipIcon = useMemo(() => valueA.iconData.some(val => val === '-1'), [valueA.iconData])


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
            content: <WarnMapInfo text={`${warnInfoDto.warnContent}:${warnInfoDto.monitorName}`} data={warnInfoDto} />
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
            content: <WarnMapInfo text={`${warnInfoDto.warnContent}:${warnInfoDto.monitorName}`} data={warnInfoDto} />
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
          weight: 0.3,
          color: '#db8914',
          // pane: 'tooltipPane'
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


  // 获取配置数据
  useEffect(() => {
    async function main() {
      const _valueA = local(CONDITION_VALUE_A)
      if (_.isEmpty(_valueA)) {
        // const portDict = await getPlacePortList()
        // const portData = portDict.map(ele => ele.value)
        const typeDict = await getDictDataByType('archive_ship_type')
        const typeData = typeDict.map(ele => ele.value)
        setValueA(val => {
          // const _valueA = {
          //   ...val,
          //   typeData,
          //   portData
          // }
          const _valueA = {
            ...val,
            typeData
          }
          local(CONDITION_VALUE_A, _valueA)
          return _valueA
        })
      }

      const _valueB = local(CONDITION_VALUE_B)
      if (_.isEmpty(_valueB)) {
        const deviceData = await getAllDeviceType()
        const device = deviceData.map(ele => ele.value)

        const sourceData = await getDeviceSourceOptions()
        const source = sourceData.map(ele => ele.value)

        setValueB(val => {
          const _valueB = {
            ...val,
            device,
            source
          }
          local(CONDITION_VALUE_B, _valueB)
          return _valueB
        })
      }

      const _valueC = local(CONDITION_VALUE_C)
      if (_.isEmpty(_valueC)) {
        // const unusualDict = await getDictDataByType('model_type')
        // const unusualData = unusualDict.map(ele => ele.value)

        // const typeDict = await getLabelDict(7)
        // const typeData = typeDict.map(ele => ele.value)



        setValueC(val => {
          const _valueC = {
            ...val,
            // unusual: unusualData,
            // type: typeData
          }
          local(CONDITION_VALUE_C, _valueC)
          return _valueC
        })
      }
    }
    main()
  }, [])

  // 获取船舶字典数据
  useEffect(() => {
    let ctr: AbortController
    async function main() {
      ctr = new AbortController()
      const vo = await getShipTypeDictData(ctr)
      setShipTypeData(vo)
    }
    main()
    return () => {
      ctr?.abort()
    }
  }, [])

  // 渲染辅助图标
  useEffect(() => {
    const layerGroup = L.layerGroup()
    if (map2d && isSituationalAnalysis && valueB.other.fixedMarker) {
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
  }, [map2d, isSituationalAnalysis, valueB.other.fixedMarker])

  // 创建经纬度网格专用画布图层
  useEffect(() => {
    let _latLngCanvasLayer: CanvasPane
    if (map2d) {
      _latLngCanvasLayer = map2d.createCanvasPane()
      setLatLngCanvasLayer(_latLngCanvasLayer)
    }
    return () => {
      _latLngCanvasLayer && _latLngCanvasLayer.remove()
    }
  }, [map2d])

  // 渲染经纬度网格
  useEffect(() => {
    if (map2d && isSituationalAnalysis && latLngCanvasLayer && valueB.other.latlngGird) {
      const textColor = mapType === MapTileType.satellite ? '#cccccc' : '#666666'
      latLngCanvasLayer.addDrawFn(info => createLatlngGird(info.canvas, map2d, { textColor }))
    }
    return () => {
      latLngCanvasLayer?.clear()
    }
  }, [map2d, isSituationalAnalysis, latLngCanvasLayer, mapType, valueB.other.latlngGird])

  // 感知目标-基础数据
  useEffect(() => {
    if (_.isEmpty(valueA.baseData)) {
      dispatch(websocketSend({
        channel: JSON.stringify({
          module: "01",
          cmd: "0102"
        })
      }))
    } else {
      dispatch(websocketSend({
        channel: JSON.stringify({
          module: "01",
          cmd: "0101",
          data: {
            dataType: valueA.baseData,
            riskLevel: valueA.riskData,
            aisSizeType: valueA.sizeData,
            shipType: valueA.typeData,
            motionState: valueA.stateData,
            shipLabel: valueA.portData,
            focusType: valueA.focusData
          }
        })
      }))
    }
    return () => {
      dispatch(websocketSend({
        channel: JSON.stringify({
          module: "01",
          cmd: "0106",
          data: {
            selected: false
          }
        })
      }))
    }
  }, [valueA.baseData, valueA.riskData, valueA.sizeData, valueA.typeData, valueA.stateData, valueA.portData, valueA.focusData, dispatch])

  // websocket信息-处理船舶信息
  useEffect(() => {
    if (shipMessage) {
      const data = shipMessage

      const aisList = _.filter(data, ele => ele.tagType === '1' && _.has(ele, 'shipDataAisDto'))
      const radarList = _.filter(data, ele => ele.tagType === '2' && _.has(ele, 'shipDataRadarDto'))
      const fusionList = _.filter(data, ele => ele.tagType === '3')

      const planDealList = _.filter(data, ele => ele.planDealVo)

      const aisH: any[] = [] // 高风险
      const aisM: any[] = [] // 中风险
      const aisL: any[] = [] // 低风险
      const aisB: any[] = [] // 黑名单
      const aisI: any[] = [] // 重点
      const aisF: any[] = [] // 关注
      const aisC: any[] = [] // 一般

      aisList.forEach(ele => {
        const aisData = ele.shipDataAisDto
        const data = {
          trackId: ele.mmsi,
          lng: aisData.lng,
          lat: aisData.lat,
          speed: aisData.sog,
          course: aisData.cog,
          heading: aisData.true_heading || aisData.cog,
          extraData: ele
        }
        if (ele.riskLevel === 1) {
          aisH.push(data)
        } else if (ele.riskLevel === 2) {
          aisM.push(data)
        } else if (ele.riskLevel === 3) {
          aisL.push(data)
        } else if (ele.focusType === 5) {
          aisB.push(data)
        } else if (ele.focusType === 2) {
          aisI.push(data)
        } else if (ele.focusType === 3) {
          aisF.push(data)
        } else {
          aisC.push(data)
        }
      })

      // 高风险>中风险>低风险>黑名单>重点船舶>关注船舶>一般船舶
      const _aisLayerGroup = [...aisC, ...aisF, ...aisI, ...aisB, ...aisL, ...aisM, ...aisH]

      const _radarLayerGroup = radarList.map(ele => {
        const radarData = ele.shipDataRadarDto
        return {
          trackId: ele.batchNum,
          lng: radarData.lng,
          lat: radarData.lat,
          // speed: radarData.speed * 0.5144444444,
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
          // speed: aisData.speed * 0.5144444444,
          speed: ele.speed,
          course: aisData ? aisData.cog : radarData.course,
          heading: aisData ? aisData.true_heading || aisData.cog : radarData.course,
          extraData: {
            ...ele
          }
        }
      })

      setAisLayerGroup(_aisLayerGroup)
      setRadarLayerGroup(_radarLayerGroup)
      setFusionLayerGroup(_fusionLayerGroup)
      planDealList?.length && setShipPlanLayerGroup(planDealList)
    } else {
      setAisLayerGroup([])
      setRadarLayerGroup([])
      setFusionLayerGroup([])
      setShipPlanLayerGroup([])
    }
  }, [shipMessage])

  // AIS船舶图层渲染
  useEffect(() => {
    let shipLayers: any[] = []

    const isShow = valueA.baseData.some(value => value === '1')

    if (map2d && isSituationalAnalysis && isShow) {

      aisLayerGroup.forEach(item => {
        let shipLayer: any
        let isShowShipIcon = false
        let dictData: any

        const latLng = {
          lat: item.lat,
          lng: item.lng
        }

        if (valueA.iconData.includes(item.extraData.shipType)) {
          dictData = shipTypeData.find(ele => ele.dictValue === item.extraData.shipType && ele.picPath)

          if (dictData) {
            isShowShipIcon = true
          }
        }

        let icon: any

        if (isShowShipIcon) {
          icon = getAisTargetIcon({
            riskLevel: item.extraData.riskLevel,
            groupType: item.extraData.isBlackList ? 1 : item.extraData.focusType,
            iconType: dictData.picPath
          })
        } else {
          icon = getAisTargetIcon({
            riskLevel: item.extraData.riskLevel,
            groupType: item.extraData.isBlackList ? 1 : item.extraData.focusType,
            heading: item.heading
          })
        }

        shipLayer = L.marker(latLng, { icon, extraData: item.extraData })

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

        shipLayer.on("click", function (evt: any) {
          const extraData = evt.target.options.extraData
          let riskLevel = extraData.riskLevel
          if (extraData.warnInfoDto) {
            riskLevel = item.extraData.warnInfoDto.riskLevel
          }
          const title = `船舶目标-MMSI:${extraData.mmsi}`
          windowUI(<ShipInfo
            mmsi={extraData.mmsi}
            data={extraData}
            riskLevel={riskLevel}
          />, {
            title,
            width: 400,
            height: 720,
            key: 'targetInfo'
          })

          // 展示选中效果
          dispatch(selectTarget({ mmsi: extraData.mmsi }))
        })

        showExtraInfo(shipLayer, item.extraData)

        showSpeedLine(shipLayer, item.speed, item.extraData.shipDataAisDto.cog)

        shipLayer.addTo(map2d.map);
        shipLayers.push(shipLayer)
      })

    }

    return () => {
      clearTargetLayers(shipLayers)
    }
  }, [map2d, isSituationalAnalysis, dispatch, showExtraInfo, showSpeedLine, clearTargetLayers, aisLayerGroup, valueA.baseData, valueA.iconData, shipTypeData])

  // 雷达目标图层渲染
  useEffect(() => {
    let radarLayers: any[] = []
    const isShow = valueA.baseData.some(value => value === '2')
    if (map2d && isSituationalAnalysis && isShow) {

      radarLayerGroup.forEach(item => {
        const latLng = {
          lat: item.lat,
          lng: item.lng
        }

        const isUseShipIcon = isShowRadarShipIcon && item.extraData.shipDataRadarDto.isShip === 1

        const icon = getRadarTargetIcon({
          riskLevel: item.extraData.riskLevel,
          isWarned: item.extraData.caseBottom === 1,
          isUseShipIcon
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

        radarLayer.on("click", function (evt: any) {
          const extraData = evt.target.options.extraData
          let riskLevel = extraData.riskLevel
          if (extraData.warnInfoDto) {
            riskLevel = item.extraData.warnInfoDto.riskLevel
          }
          const title = `雷达目标-批号:${extraData.batchNum}`
          windowUI(<RadarTargetInfo
            radarNumber={extraData.batchNum}
            data={extraData}
            riskLevel={riskLevel}
          />, {
            title,
            width: 400,
            height: 720,
            key: 'targetInfo'
          })

          // 展示选中效果
          dispatch(selectTarget({ radar: extraData.batchNum }))
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
  }, [map2d, isSituationalAnalysis, dispatch, showSpeedLine, showExtraInfo, clearTargetLayers, radarLayerGroup, valueA.baseData, isShowRadarShipIcon])

  // 融合目标图层渲染
  useEffect(() => {
    let fusionLayers: any[] = []
    const isShow = valueA.baseData.some(value => value === '3')
    if (map2d && isSituationalAnalysis && isShow) {

      fusionLayerGroup.forEach(item => {
        let isShowShipIcon = false
        let dictData: any

        const latLng = {
          lat: item.lat,
          lng: item.lng
        }

        if (valueA.iconData.includes(item.extraData.shipType)) {
          dictData = shipTypeData.find(ele => ele.dictValue === item.extraData.shipType && ele.picPath)

          if (dictData) {
            isShowShipIcon = true
          }

        }

        let icon: any

        if (isShowShipIcon) {
          icon = getFusionTargetIcon({
            riskLevel: item.extraData.riskLevel,
            groupType: item.extraData.isBlackList ? 1 : item.extraData.focusType,
            iconType: dictData.picPath
          })
        } else {
          icon = getFusionTargetIcon({
            riskLevel: item.extraData.riskLevel,
            groupType: item.extraData.isBlackList ? 1 : item.extraData.focusType,
            heading: item.heading
          })
        }

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

        fusionLayer.on("click", function (evt: any) {
          const extraData = evt.target.options.extraData
          let riskLevel = extraData.riskLevel
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
            key: 'targetInfo'
          })

          // 展示选中效果
          dispatch(selectTarget({ mmsi: extraData.mmsi }))
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
  }, [map2d, isSituationalAnalysis, dispatch, showExtraInfo, showSpeedLine, clearTargetLayers, fusionLayerGroup, valueA.baseData, valueA.iconData, shipTypeData])

  // 预案实战图层渲染
  useEffect(() => {
    const shipPlanLayer = shipPlanLayerGroup.map(item => {
      const { planDealVo } = item
      const shipLatLng = [item.lat, item.lng]
      return createPlanManagementMap(
        shipLatLng,
        planDealVo?.planItemJsons?.length ? planDealVo.planItemJsons.map((planItem: any) => {
          return {
            latLng: planItem.startType === '1' ? shipLatLng : [planItem.latitude, planItem.longitude],
            cameraScope: planItem.cameraScope || 500,
            typeId: planItem.typeId || []
          }
        }) : [],
        (data: any) => {
          const { index } = data || {}
          return <SvgPic pic={planDestinationSvga} svagid={`planDestinationSvga${index}`} option={{ height: '72px', width: '72px', borderRadius: '30px' }} />
        },
        (data: any) => {
          return <PlanManagementPopup data={data || {}} />
        },
        <WarnMapInfo text={item.dataType === '1' ? item.shipName || '' : item.batchNum} textColor={'#fff'} isNotOpenWindow={true} />,
        planDealVo.warnTypeName ? <WarnMapInfo text={planDealVo.warnTypeName} textColor={'#fff'} themeColor={earlyWarningIconColor[planDealVo.riskLevel || 0]} customIcon={<span className={`iconfont icon-lingdang`} style={{ color: '#ffa940' }}></span>} isNotOpenWindow={true} /> : null,
        planDealVo?.areaId,
        map2d,
      )
    })

    return () => {
      shipPlanLayer?.map(item => {
        item?.then(func => {
          func && func()
        })
        return item
      })
    }
  }, [map2d, shipPlanLayerGroup])

  // 展示点击选中目标
  useEffect(() => {
    let target: any
    if (map2d && isSituationalAnalysis
      && (followTargetValue.mmsi || followTargetValue.radar)
      && (aisLayerGroup.length !== 0 || radarLayerGroup.length !== 0 || fusionLayerGroup.length !== 0)) {

      if (followTargetValue.mmsi) {
        target = aisLayerGroup.find(ele => String(ele.trackId).search(followTargetValue.mmsi!) !== -1)
        if (_.isEmpty(target)) {
          target = fusionLayerGroup.find(ele => String(ele.extraData.mmsi).search(followTargetValue.mmsi!) !== -1)
        }
      } else {
        target = radarLayerGroup.find(ele => String(ele.trackId).search(followTargetValue.radar!) !== -1)
        if (_.isEmpty(target)) {
          target = fusionLayerGroup.find(ele => String(ele.extraData.batchNum).search(followTargetValue.radar!) !== -1)
        }
      }

      if (_.isEmpty(target)) {
        console.warn('followTargetValue', followTargetValue, '目标不在线')
        dispatch(clearSelectTarget())
      } else {
        const latLng = {
          lat: target.lat,
          lng: target.lng
        }
        map2d.createSelectTarget(latLng)
        if (followTargetValue.isCenter) {
          map2d.map.setView(latLng, 15)
          dispatch(selectTarget({ ...followTargetValue, isCenter: false }))
        }
        dispatch(websocketSend({
          channel: JSON.stringify({
            module: "01",
            cmd: "0106",
            data: {
              selected: true,
              mmsi: target.extraData.mmsi,
              batchNum: target.extraData.batchNum,
              fusionId: target.extraData.tagCode
            }
          })
        }))
      }
    }
    return () => {
      map2d && map2d.clearSelectTarget()
    }
  }, [map2d, isSituationalAnalysis, followTargetValue, dispatch, aisLayerGroup, radarLayerGroup, fusionLayerGroup])

  // 感知目标-船舶尾迹
  useEffect(() => {
    if (valueA.trails.ais.is || valueA.trails.radar.is) {//开启推送尾迹数据
      let aisTimeLimit = 0
      let radarTimeLimit = 0
      if (valueA.trails.ais.is) {
        aisTimeLimit = valueA.trails.ais.value
      }
      if (valueA.trails.radar.is) {
        radarTimeLimit = valueA.trails.radar.value
      }
      dispatch(websocketSend({
        channel: JSON.stringify({
          module: "01",
          cmd: "0103",
          data: {
            wakeFlag: 1,
            aisTimeLimit,
            radarTimeLimit,
          }
        })
      }))
    } else {//停止推送尾迹数据
      dispatch(websocketSend({
        channel: JSON.stringify({
          module: "01",
          cmd: "0103",
          data: {
            wakeFlag: 0
          }
        })
      }))
    }
  }, [dispatch, valueA.trails.ais.is, valueA.trails.ais.value, valueA.trails.radar.is, valueA.trails.radar.value])

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

  // websocket信息-处理船舶尾迹信息
  useEffect(() => {

    if (map2d && isSituationalAnalysis && trailsMessage && trailsCanvasLayer && (valueA.trails.ais.is || valueA.trails.radar.is)) {
      const data = trailsMessage
      const color = mapType === MapTileType.satellite ? 'rgba(255, 255, 255, 0.5)' : '#404040'

      if (valueA.trails.ais.is && valueA.baseData.some(val => val === '1' || val === '3')) {
        const aisShipList = _.filter(data, (ship: any) => ship.tagType === '1' || ship.tagType === '3')
        const lineList: LineParams[] = []
        aisShipList.forEach((ship: any) => {
          const validPointList = _.filter(ship.pathList, ele => ele.lat && ele.lng)
          const lineLatLngList = validPointList.map(ele => ({ lat: ele.lat, lng: ele.lng }))
          const lineParams: LineParams = {
            latLngList: lineLatLngList,
            color
          }
          if (followTargetValue.mmsi === ship.mmsi) {
            lineParams.color = 'rgba(255, 0, 0, 1)'
          }
          lineList.push(lineParams)
        })
        trailsCanvasLayer.addDrawFn(info => createLineGroup(lineList, info.canvas, map2d))
      }

      if (valueA.trails.radar.is && valueA.baseData.some(val => val === '2')) {
        const radarShipList = _.filter(data, (ship: any) => ship.tagType === '2')
        const lineList: LineParams[] = []
        radarShipList.forEach((ship: any) => {
          const validPointList = _.filter(ship.pathList, ele => ele.lat && ele.lng)
          const lineLatLngList = validPointList.map(ele => ({ lat: ele.lat, lng: ele.lng }))
          const lineParams: LineParams = {
            latLngList: lineLatLngList,
            color
          }
          if (followTargetValue.radar === ship.batchNum) {
            lineParams.color = 'rgba(255, 0, 0, 1)'
          }
          lineList.push(lineParams)
        })
        trailsCanvasLayer.addDrawFn(info => createLineGroup(lineList, info.canvas, map2d))
      }
    }

    return () => {
      trailsCanvasLayer?.clear()
    }
  }, [map2d, trailsMessage, isSituationalAnalysis, trailsCanvasLayer, followTargetValue, valueA.trails.ais.is, valueA.trails.radar.is, valueA.baseData, mapType])

  // websocket信息-处理船舶尾迹预警信息
  useEffect(() => {
    const tooltipList: any[] = []
    if (map2d && isSituationalAnalysis && trailsMessage) {
      let target: any
      if (followTargetValue.mmsi && valueA.trails.ais.is && valueA.baseData.some(val => val === '1' || val === '3')) {
        target = trailsMessage.find((item: any) => item.mmsi === followTargetValue.mmsi)
      }
      if (followTargetValue.radar && valueA.trails.radar.is && valueA.baseData.some(val => val === '2')) {
        target = trailsMessage.find((item: any) => item.batchNum === followTargetValue.radar)
      }
      if (target && target.pathList) {
        const timePoinit = _.filter(target.pathList, item => item.capTime)

        timePoinit.forEach(item => {
          const timeStr = dayjs(item.capTime).format(Hms)
          const toolTip = L.tooltip({
            className: 'leaflet-tooltip-ui-opacity20',
            pane: 'shadowPane',
            permanent: true,
            direction: 'top',
          }).setLatLng([item.lat, item.lng])
            .setContent(`${timeStr} 航速:${item.speed}节 ${item.warnTypeLabel || ''} `)
            .addTo(map2d.map)
          tooltipList.push(toolTip)
        })
      }
    }
    return () => {
      tooltipList.forEach(item => item.remove())
    }
  }, [map2d, trailsMessage, isSituationalAnalysis, followTargetValue, valueA.trails.ais.is, valueA.trails.radar.is, valueA.baseData])

  // 基础设施-电子防区-布控区域
  useEffect(() => {
    let layers: any[] = []
    let yawPolyline: any //航道
    let ctr: AbortController
    async function main() {
      if (map2d && valueB.fence.control.is) {
        ctr = new AbortController()
        const vo = await getCtrlArea(valueB.fence.control.value, ctr)
        // 根据区域大小排序区域、避免大区域覆盖小区域从而无法点击小区域
        vo.forEach((item: any) => {
          const graphObj = JSON.parse(item.graph)
          item.graphObj = graphObj
          if (_.isNil(graphObj)) {
            item.layerType = 'Line'
            item.size = 1
            return
          }
          if (graphObj.geometry.type === 'Polygon') {
            item.layerType = 'Polygon'
            const [target] = graphObj.geometry.coordinates
            const pointList = target.map(([lng, lat]: any[]) => [lat, lng])
            const polygon = turf.polygon([pointList]);
            item.size = turf.area(polygon)
          } else if (graphObj.properties.subType === 'Circle') {
            item.layerType = 'Circle'
            item.size = 3.14 * graphObj.properties.radius * graphObj.properties.radius
          } else if (graphObj.geometry.type === 'LineString') {
            item.layerType = 'Line'
            item.size = 1
          }
        })
        const areaList = vo.sort((a: any, b: any) => b.size - a.size)

        areaList.forEach((record: any) => {
          const _geoJson = JSON.parse(record.graph)
          if (_geoJson.properties.subType === 'Circle') {
            let circle = new L.Circle([_geoJson.geometry.coordinates[1], _geoJson.geometry.coordinates[0]], {
              radius: _geoJson.properties.radius,
            });
            circle.bindTooltip(`${record.name} <br/> ${_geoJson.geometry.coordinates[1]} , ${_geoJson.geometry.coordinates[0]}`,
              {
                className: 'leaflet-tooltip-ui',
                // permanent: true,
                direction: 'top',
                offset: L.point(0, -2)
              }
            )
            circle.addTo(map2d.map);
            layers.push(circle)
            circle.setStyle({
              color: _geoJson.properties.borderColor,
              fillColor: _geoJson.properties.background,
              fillOpacity: 0.1,
              weight: 1,
              opacity: 0.4
            })
          } else {

            // 航道另外渲染
            if (record.type === '5') {
              yawPolyline = createYawPolyline(map2d, _geoJson)
              return
            }
            const areaLayer = L.geoJson(_geoJson)
            // 区域定点坐标集合
            let pointList = []
            if (_geoJson.geometry.type === 'LineString') {
              pointList = _geoJson.geometry.coordinates.map((item: any) => {
                return [item[1], item[0]]
              })
            } else {
              pointList = _geoJson.geometry.coordinates[0].map((item: any) => {
                return [item[1], item[0]]
              })
            }

            for (let i = 0; i < pointList.length; i++) {
              let point = map2d.createMarker({
                latLng: pointList[i],
                circleMarkerOptions: {
                  pane: 'markerPane',
                  radius: 8,
                  fillColor: 'rgba(0,0,0,0)',
                  fillOpacity: 1,
                  weight: 0,
                }
              }).bindTooltip(`${record.name} <br/> ${pointList[i][0]} , ${pointList[i][1]}`,
                {
                  className: 'leaflet-tooltip-ui',
                  // permanent: true,
                  direction: 'top',
                  offset: L.point(0, -2)
                }).addTo(map2d.map)
              layers.push(point)
            }
            areaLayer.bindTooltip(record.name, { className: 'leaflet-tooltip-ui' })
            areaLayer.addTo(map2d.map)
            layers.push(areaLayer)
            //边框、背景颜色回显
            if (_geoJson.geometry.type === 'LineString') {
              areaLayer.setStyle({
                color: _geoJson.properties.borderColor,
                fillColor: _geoJson.properties.background,
                fillOpacity: 0.1,
                weight: 2, //线条宽度
                opacity: 1 //线条透明度
              })
            } else {
              areaLayer.setStyle({
                color: _geoJson.properties.borderColor,
                fillColor: _geoJson.properties.background,
                fillOpacity: 0.1,
                weight: 1, //线条宽度
                opacity: 0.4 //线条透明度
              })
            }
          }
        })
      }
    }
    main()
    return () => {
      layers.forEach(layer => {
        layer.remove();
      })
      // 移除航道
      if (yawPolyline && yawPolyline.length > 0) {
        for (let i = 0; i < yawPolyline.length; i++) {
          map2d?.map.removeLayer(yawPolyline[i])
        }
      }
      ctr && ctr.abort()
    }
  }, [map2d, valueB.fence.control.is, valueB.fence.control.value])

  // 基础设施-重点场所
  useEffect(() => {
    let layers: any[] = []
    let ctr: AbortController
    async function main() {
      if (map2d && valueB.place.length !== 0) {
        ctr = new AbortController()
        const vo = await getPlaceData(valueB.place, ctr)


        // 根据区域大小排序区域、避免大区域覆盖小区域从而无法点击小区域
        vo.forEach((item: any) => {
          const graphObj = JSON.parse(item.graph)
          item.graphObj = graphObj
          if (_.isNil(graphObj)) {
            item.layerType = 'Line'
            item.size = 1
            return
          }
          if (graphObj.geometry.type === 'Polygon') {
            item.layerType = 'Polygon'
            const [target] = graphObj.geometry.coordinates
            const pointList = target.map(([lng, lat]: any[]) => [lat, lng])
            const polygon = turf.polygon([pointList]);
            item.size = turf.area(polygon)
          } else if (graphObj.properties.subType === 'Circle') {
            item.layerType = 'Circle'
            item.size = 3.14 * graphObj.properties.radius * graphObj.properties.radius
          } else if (graphObj.geometry.type === 'LineString') {
            item.layerType = 'Line'
            item.size = 1
          }
        })

        const areaList = vo.sort((a: any, b: any) => b.size - a.size)

        areaList.forEach((record: any) => {
          const _geoJson = JSON.parse(record.graph)
          let layer: any
          if (_.isNil(_geoJson)) {
            return
          }
          if (_geoJson.properties.subType === 'Circle') {
            layer = new L.Circle([_geoJson.geometry.coordinates[1], _geoJson.geometry.coordinates[0]], {
              radius: _geoJson.properties.radius,
              color: _geoJson.properties.borderColor, //颜色
              fillColor: _geoJson.properties.background,
              fillOpacity: 0.1, //透明度
              weight: 1, //线条宽度
              opacity: 0.4 //线条透明度
            });
            layer.bindTooltip(`${record.name} <br/> ${_geoJson.geometry.coordinates[1]} , ${_geoJson.geometry.coordinates[0]}`, {
              className: 'leaflet-tooltip-ui',
            })
            layer.addTo(map2d.map);
          }
          // 回显点类型场所
          else if (_geoJson?.geometry?.type === 'SinglePoint') {
            const IconUrl = getPlaceTypeIconSrc(record.icon)
            layer = map2d.createMarker({
              markerId: 1,
              latLng: _geoJson?.geometry.coordinates.map(Number),
              markerOptions: {
                icon: L.icon({
                  iconUrl: IconUrl,
                  iconSize: record.icon === '11' ? [50, 10] : [20, 20],
                })
              }
            })
            layer.bindTooltip(record.name)
            layer.addTo(map2d.map)
          }
          else {

            // 区域定点坐标集合
            let pointList = []
            if (_geoJson.geometry.type === 'LineString') {
              pointList = _geoJson.geometry.coordinates.map((item: any) => {
                return [item[1], item[0]]
              })
            } else {
              pointList = _geoJson.geometry.coordinates[0].map((item: any) => {
                return [item[1], item[0]]
              })
            }

            // 顶点坐标鼠标移入显示经纬度
            for (let i = 0; i < pointList.length; i++) {
              let point = map2d.createMarker({
                latLng: pointList[i],
                circleMarkerOptions: {
                  pane: 'markerPane',
                  radius: 8,
                  fillColor: 'rgba(0,0,0,0)',
                  fillOpacity: 1,
                  weight: 0,
                }
              }).bindTooltip(`${record.name} <br/>${pointList[i][0]} , ${pointList[i][1]}`,
                {
                  className: 'leaflet-tooltip-ui',
                  // permanent: true,
                  direction: 'top',
                  offset: L.point(0, -2)
                }).addTo(map2d.map)
              layers.push(point)
            }

            layer = L.geoJson(_geoJson)
            layer.bindTooltip(record.name, { className: 'leaflet-tooltip-ui' })
            layer.addTo(map2d.map)
            //边框、背景颜色回显
            if (_geoJson.geometry.type === 'LineString') {
              layer.setStyle({
                color: _geoJson.properties.borderColor,
                fillColor: _geoJson.properties.background,
                fillOpacity: 0.1,
                weight: 2, //线条宽度
                opacity: 1 //线条透明度
              })
            } else {
              layer.setStyle({
                color: _geoJson.properties.borderColor,
                fillColor: _geoJson.properties.background,
                fillOpacity: 0.1,
                weight: 1, //线条宽度
                opacity: 0.4 //线条透明度
              })
            }

          }
          layer.on('click', (e: any) => {
            windowUI(<AreaTargetPopup layer={e.layer} placeId={record.id} />, {
              key: 'placeDevice',
              title: `重点场所`,
              width: 330,
              height: 400,
              offset: [480, 100]
            })
          })
          layers.push(layer)
        });
      }
    }
    main()
    return () => {
      layers.forEach(layer => {
        layer.remove();
      })
      ctr && ctr.abort()
    }
  }, [map2d, valueB.place])

  // 基础设施-电子防区-标记-名称
  useEffect(() => {
    const layers: any[] = []
    let ctr: AbortController
    async function main() {
      if (map2d && valueB.fence.marker) {
        ctr = new AbortController()
        const vo = await getAllMarkList(1, ctr)
        vo.forEach(item => {
          if (item.latitude && item.longitude) {

            const handleClose = () => {
              delTextMarker(item)
              const layer = layers.find(ele => ele.options.extraData.id === item.id)
              layer && layer.remove()
            }

            const content = createElementByComponent(<TextMarkerContent
              content={item.name}
              onClose={handleClose}
            />)

            const infoMarker = map2d.createHtmlPopup({
              latLng: {
                lat: item.latitude,
                lng: item.longitude
              },
              content,
              extraData: {
                id: item.id,
                text: item.name
              }
            })

            infoMarker.addTo(map2d.map)
            layers.push(infoMarker)
          }
        })
      }
    }
    main()
    return () => {
      layers.forEach(layer => layer.remove())
      if (map2d) {
        map2d.map.eachLayer((item: any) => {
          if (item.options.isToolText) {
            item.remove()
          }
        })
      }
      ctr && ctr.abort()
    }
  }, [map2d, valueB.fence.marker])

  // 基础设施-电子防区-标记-点位
  useEffect(() => {
    const layers: any[] = []
    let ctr: AbortController
    async function main() {
      if (map2d && valueB.fence.marker) {
        ctr = new AbortController()
        const vo = await getAllMarkList(2, ctr)
        vo.forEach(item => {
          if (item.latitude && item.longitude) {

            const handleRemove = () => {
              delTextMarker(item)
              const layer = layers.find(ele => ele.options.extraData.id === item.id)
              layer && layer.remove()
            }

            const latLng = {
              lat: item.latitude,
              lng: item.longitude
            }

            const marker = L.marker(latLng, {
              icon: pinIcon,
              extraData: {
                id: item.id
              }
            })

            const htmlEle = createElementByComponent(<PinPopup id={item.id} layer={marker} onClear={handleRemove} />)

            marker.bindPopup(htmlEle, {
              offset: L.point(0, -14),
              minWidth: 40,
              autoPan: false,
              className: 'leaflet-popup-ui',
              closeButton: false
            })

            marker.on("mouseover ", function (evt: any) {
              evt.target.openPopup()
            })


            marker.addTo(map2d.map)
            layers.push(marker)
          }
        })
      }
    }
    main()
    return () => {
      layers.forEach(layer => layer.remove())
      if (map2d) {
        map2d.map.eachLayer((item: any) => {
          if (item.options.isToolText) {
            item.remove()
          }
        })
      }
      ctr && ctr.abort()
    }
  }, [map2d, valueB.fence.marker])

  // 基础设施-电子防区-视频预警范围
  useEffect(() => {
    const layers: any[] = []
    let ctr: AbortController
    async function main() {
      if (map2d && valueB.fence.videoWarn) {
        ctr = new AbortController()
        const vo = await getDeviceVideoWarnAreaList(ctr)
        vo.forEach(item => {
          let layer: any
          const geoJsonData = _.isString(item.graphJson) ? JSON.parse(item.graphJson) : item.graphJson
          //单独处理圆形
          if (geoJsonData.properties.subType === 'Circle') {
            layer = new L.Circle([
              geoJsonData.geometry.coordinates[1],
              geoJsonData.geometry.coordinates[0]
            ], {
              radius: geoJsonData.properties.radius,
            })
          } else {
            layer = L.geoJson(geoJsonData)
          }
          layer.options.areaName = item.name
          const title = `${item.name}-${item.deviceName}`
          layer.bindTooltip(title, {
            className: 'leaflet-tooltip-ui',
            // permanent: true,
            direction: 'top',
          })
          layer.addTo(map2d.map)
          layers.push(layer)
        })
      }
    }
    main()
    return () => {
      layers.forEach(layer => layer.remove())
      ctr && ctr.abort()
    }
  }, [map2d, valueB.fence.videoWarn])

  // 基础设施-感知设备
  useEffect(() => {
    let group: any[]
    let ctr: AbortController
    let areaPolyline: any
    // let timer: NodeJS.Timer
    async function main() {
      if (map2d && !_.isEmpty(valueB.device)) {
        ctr = new AbortController()
        const vo = await getAllDeviceMarkerGroupBySource(valueB.device, valueB.source, ctr)
        const markerList = vo.map(ele => {
          const marker = L.marker(ele.latLng, {
            extraData: ele,
            icon: ele.lIcon
          })
          const htmlEle = createElementByComponent(<DevicePopup data={ele} />)
          marker.bindPopup(htmlEle, {
            offset: L.point(0, -24),
            minWidth: 220,
            autoPan: false,
            className: 'leaflet-popup-ui'
          })
          marker.on("mouseover ", function (evt: any) {
            evt.target.openPopup()
          })
          // const isCamera = CameraTypeDict.some(dict => dict.value === Number(ele.cameraType))
          if (ele.isCamera) {
            marker.on("click ", function () {
              if (ele.deviceCode) {
                handleOpenRealtimeWin({
                  deviceCode: ele.deviceCode
                })
              } else {
                console.warn('无设备编码', ele)
                message.warning('无设备编码')
              }
            })
          }
          if (ele.deviceType === '9') {
            marker.on("click ", function () {
              windowUI(<VoicePlayPanel deviceCodes={[ele.deviceCode]} />, {
                title: '点播',
                offset: [1480, 80],
                width: '400px',
                height: '800px',
                key: '点播'
              })
            })
          }
          // 红外周扫
          if (ele.deviceType === '7') {
            marker.on("click ", function () {
              dispatch(setParams({
                id: ele.id,
                deviceCode: ele.deviceCode
              }))
              dispatch(setIndex(6))
            })
          }

          // 海防雷达点击绘制形状
          if (ele.deviceType === '5' && ele.graph) {
            marker.on("click ", function () {
              areaPolyline && map2d?.map.removeLayer(areaPolyline)
              areaPolyline = createDrawAreaPolyline(map2d, JSON.parse(ele.graph))
            })
          }
          // 去掉海防雷达形状
          map2d.map.on("click ", function () {
            areaPolyline && map2d?.map.removeLayer(areaPolyline)
          })

          return marker
        });

        group?.forEach(layer => layer.remove())
        markerList.forEach(layer => layer.addTo(map2d.map))
        group = markerList;
      }
    }
    main()
    // timer = setInterval(main, 10 * 1000)
    return () => {
      group?.forEach(layer => layer.remove())
      areaPolyline && map2d?.map.removeLayer(areaPolyline)
      ctr && ctr.abort()
      // clearInterval(timer)
    }
  }, [map2d, dispatch, valueB.device, valueB.source])

  // 预警威胁-不展示船舶
  useEffect(() => {
    if (tabsValue === '2') {
      dispatch(setSituationalAnalysis(false))
    } else {
      dispatch(setSituationalAnalysis(true))
    }
  }, [dispatch, tabsValue])

  // 预警威胁-船舶异常行为态势
  useEffect(() => {
    let canvasLayer: CanvasPane
    let ctr: AbortController
    async function main() {
      if (map2d && tabsValue === '2' && valueC.unusual.length > 0) {
        ctr = new AbortController()
        const vo = await getBehavirecordHeatMapData(valueC.dateType, valueC.dateRange, valueC.unusual, valueC.focusType, ctr)
        canvasLayer = map2d.createCanvasPane()
        canvasLayer.addDrawFn(info => {
          createCircleGroup(vo, info.canvas, map2d)
        })
      }
    }
    main()
    return () => {
      canvasLayer && canvasLayer.remove()
      ctr && ctr.abort()
    }
  }, [map2d, tabsValue, dispatch, valueC.dateType, valueC.unusual, valueC.dateRange, valueC.focusType])

  // 预警威胁-风险等级筛选
  useEffect(() => {
    let canvasLayer: CanvasPane
    let ctr: AbortController
    async function main() {
      if (map2d && tabsValue === '2' && valueC.level.length > 0) {
        ctr = new AbortController()
        const vo = await getRiskHeatMapData(valueC.dateType, valueC.dateRange, valueC.level, valueC.focusType, ctr)
        canvasLayer = map2d.createCanvasPane()
        canvasLayer.addDrawFn(info => {
          createCircleGroup(vo, info.canvas, map2d)
        })
      }
    }
    main()
    return () => {
      canvasLayer && canvasLayer.remove()
      ctr && ctr.abort()
    }
  }, [map2d, tabsValue, valueC.dateType, valueC.level, valueC.dateRange, valueC.focusType])

  // 预警威胁-船舶风险类别态势
  useEffect(() => {
    let canvasLayer: CanvasPane
    let ctr: AbortController
    async function main() {
      if (map2d && tabsValue === '2' && valueC.type.length > 0) {
        ctr = new AbortController()
        const vo = await getRiskTypeStatsData(valueC.dateType, valueC.dateRange, valueC.type, valueC.focusType, ctr)
        canvasLayer = map2d.createCanvasPane()
        canvasLayer.addDrawFn(info => {
          createCircleGroup(vo, info.canvas, map2d)
        })
      }
    }
    main()
    return () => {
      canvasLayer && canvasLayer.remove()
      ctr && ctr.abort()
    }
  }, [map2d, tabsValue, dispatch, valueC.dateType, valueC.type, valueC.dateRange, valueC.focusType])

  // 预警威胁-预警高发地
  useEffect(() => {
    let group: any[] = []
    let ctr: AbortController
    async function main() {
      if (map2d && tabsValue === '2') {
        ctr = new AbortController()
        const vo = await getHighIncidenceData(valueC.dateType, valueC.dateRange, valueC.focusType, ctr)
        vo.forEach((item: any) => {
          const latlng = {
            lat: _.floor(item.latitude, 6),
            lng: _.floor(item.longitude, 6)
          }
          const tooltip = L.tooltip({ direction: 'top' })
            .setLatLng(latlng)
            .setContent(item.areaName)
            .addTo(map2d.map);
          group.push(tooltip)
        })
      }
    }
    main()
    return () => {
      group.forEach(item => item.remove())
      ctr && ctr.abort()
    }
  }, [map2d, tabsValue, dispatch, valueC.dateType, valueC.dateRange, valueC.focusType])


  // 是否展示雷达回波数据
  const isShowRadarData = useMemo(() => valueA.baseData.includes('4'), [valueA.baseData])


  // 基础数据-回波数据
  useEffect(() => {
    if (isShowRadarData) {
      console.log('加载雷达数据')
    }
    return () => {
      console.log('卸载雷达数据')
    }
  }, [map2d, isShowRadarData])



  const items = useMemo(() => {
    function handleChangeA(params: any) {
      setValueA(params)
    }

    function handleChangeB(params: any) {
      setValueB(params)
    }

    function handleChangeC(params: any) {
      setValueC(params)
    }
    return [
      {
        label: `感知目标`,
        key: '1',
        children: <PerceiveTarget value={valueA} onChange={handleChangeA} />,
      },
      {
        label: `预警威胁`,
        key: '2',
        children: <WarnDanger value={valueC} onChange={handleChangeC} />,
      },
      {
        label: `基础设施`,
        key: '3',
        children: <Infrastructure value={valueB} onChange={handleChangeB} />,
      },
    ]
  }, [valueA, valueB, valueC])

  return (
    <Tabs
      type='card'
      className="core-tabs-card"
      activeKey={tabsValue}
      onChange={(activeKey: string) => setTabsValue(activeKey)}
      items={items}
    />
  )
}

export default SituationalAnalysis