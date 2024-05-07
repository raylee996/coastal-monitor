import styles from "./index.module.sass";
import { useCallback, useEffect, useRef, useState } from "react";
import CoastalMonitorWebgis from "helper/map";
import { getCRSByMapType, MapType } from "helper/map/crsUtil";
import getMapOffLineDate from "helper/map/getMap";
import _ from "lodash";
import { PlaceTypeIconDict } from "helper/dictionary";
import { getPlaceTypeIconSrc } from "helper";
import { getIconByDeviceType } from "helper/mapIcon";
import createElementByComponent from "helper/elementComponent";
import { Button, Row } from "antd";

interface Props {
  tips?: any
  /**是否显示标题 */
  isShowTitle?: any
  onFinish?: Function
  /**只能做一个图 */
  isOneGraph?: any
  /**画图 */
  graphValue?: any
  /** 受控属性*/
  value?: any
  /** 值变化时的回调函数 */
  onChange?: (value: any) => void
  //类别返回类型：图形类型 1 线 2 圆形 3 矩形 4 多边形
  chooseType?: string
  /** 是否不支持编辑矩形 */
  isNotRectangle?: boolean
  /** 是否不支持编辑多边形 */
  isNotPolygon?: boolean
  /** 是否不支持编辑圆形 */
  isNotCircle?: boolean,
  /** 是否隐藏绘制工具栏 false(默认):显示工具栏  true:隐藏工具栏*/
  isHiddleControls?: boolean
  /** 是否启用点绘制 */
  isDrawMarker?: boolean
  markIconType?: string

  // 设备列表，用于渲染设备icon
  deviceList?: any
}

interface DevicePopupProps {
  data?: any
}

// 弹出面积或者长度
let popupContentTips: any



const DevicePopup: React.FC<DevicePopupProps> = ({ data }) => {
  return <>
    <p className={styles.deviceName}>{data.name}</p>
  </>
}

const MapPlace: React.FC<Props> = ({
  isOneGraph,
  isShowTitle,
  value,
  graphValue,
  onChange,
  chooseType,
  isNotRectangle,
  isNotPolygon,
  isNotCircle,
  isHiddleControls,
  isDrawMarker,
  markIconType,
  deviceList
}) => {
  console.debug('MapPlace')

  const mapRef = useRef<HTMLDivElement>(null)
  const [mapLeaflet, setMapLeaflet] = useState<CoastalMonitorWebgis>()
  const [isShowActions, setIsShowActions] = useState(false)
  /* 颜色设置 */
  const [background, setBackground] = useState('#3388ff')
  const [borderColor, setBorderColor] = useState('#3388ff')

  const [iconUrl, setIconUrl] = useState<any>()

  const [mapLayer, setMapLayer] = useState<any>()

  // 兼容旧的使用graphValue绘制图形的
  const realValue = graphValue || value

  const selectIcon = PlaceTypeIconDict.find((ele) => ele.value === markIconType);

  // 绘制标识点
  const drawMarker = useCallback((MAP: any, latLng: [number, number]) => {
    const IconUrl = getPlaceTypeIconSrc(selectIcon?.value)
    setIconUrl(IconUrl)
    const marker = MAP.createMarker({
      markerId: 1,
      latLng,
      markerOptions: {
        icon: L.icon({
          iconUrl: IconUrl,
          iconSize: selectIcon?.value === '11' ? [94, 22] : [20, 20],
        })
      }
    }).bindPopup(`${selectIcon?.name || ''}`).addTo(MAP.map)
    // 将marker放入layer管理
    const layerGroup = L.layerGroup([marker]);
    MAP.map.addLayer(layerGroup)
    return layerGroup
  }, [selectIcon?.name, selectIcon?.value])

  // 地图实例化
  useEffect(() => {
    let _mapLeaflet: CoastalMonitorWebgis
    if (mapRef.current) {
      const crs = getCRSByMapType(MapType.SatelliteMap);
      _mapLeaflet = new CoastalMonitorWebgis(mapRef.current, { crs, zoom: 12, minZoom: 12, maxZoom: 16 })
      // _mapLeaflet = new CoastalMonitorWebgis(mapRef.current, {crs})
      getMapOffLineDate(MapType.SatelliteMap).addTo(_mapLeaflet.map);
      setMapLeaflet(_mapLeaflet)
    }
    return () => {
      _mapLeaflet?.map?.remove()
    }
  }, [])

  // 设备icon打点
  useEffect(() => {
    let group: any
    if (deviceList && deviceList.length > 0 && mapLeaflet) {
      const result = deviceList.map((ele: any) => {
        const lIcon = getIconByDeviceType(ele.deviceType)
        ele.latLng = [ele.latitude, ele.longitude]
        ele.lIcon = lIcon
        return ele
      })
      const markerList = result.map((ele: any) => {
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
        marker.on("mouseover", function (evt: any) {
          evt.target.openPopup()
        })
        /*  marker.on("mouseout", function (evt: any) {
           evt.target.closePopup()
         }) */
        return marker
      });
      group = L.featureGroup(markerList).addTo(mapLeaflet.map);
    }
    return () => {
      group && group.remove()
    }
  }, [deviceList, mapLeaflet])

  useEffect(() => {
    if (!mapLeaflet) {
      return
    }

    // 清除绘制图形
    const layers = mapLeaflet.map.pm.getGeomanLayers()
    layers.forEach((ele: any) => {
      ele.pm.remove()
    })
    if (popupContentTips) {
      mapLeaflet.map.removeLayer(popupContentTips)
      popupContentTips = null
    }

    // 取消绘制
    if (!realValue) {
      return
    }

    // 处理返回的图形数据
    const geoJsonData = Object.prototype.toString.call(realValue) === '[object String]' ? JSON.parse(realValue) : realValue

    if (_.isEmpty(geoJsonData)) {
      return
    }

    // 回显轨迹点
    if (geoJsonData?.geometry?.type === 'SinglePoint') {
      geoJsonData?.geometry?.coordinates && drawMarker(mapLeaflet, geoJsonData.geometry.coordinates)
    } else {
      // 回显图形
      mapLeaflet?.map.pm.setPathOptions({
        color: geoJsonData.properties.borderColor,
        fillColor: geoJsonData.properties.background,
        fillOpacity: 0.4,
      });
      setBorderColor(geoJsonData.properties.borderColor)
      setBackground(geoJsonData.properties.background)
      //单独处理圆形
      if (geoJsonData.properties.subType === 'Circle') {
        let circle = new L.Circle([geoJsonData.geometry.coordinates[1], geoJsonData.geometry.coordinates[0]], {
          radius: geoJsonData.properties.radius,
          color: geoJsonData.properties.borderColor, //颜色
          fillColor: geoJsonData.properties.background,
          fillOpacity: 0.4, //透明度
        });
        circle.addTo(mapLeaflet?.map);
        mapLeaflet?.map.panTo(circle.getBounds().getCenter())
        setMapLayer(circle)
      } else {
        const areaLayer = L.geoJson(geoJsonData).addTo(mapLeaflet?.map)
        mapLeaflet?.map.panTo(areaLayer.getBounds().getCenter())
        //边框、背景颜色回显
        areaLayer.setStyle({
          color: geoJsonData.properties.borderColor,
          fillColor: geoJsonData.properties.background,
          fillOpacity: 0.4
        })
        setMapLayer(areaLayer)
      }

      // 计算线段长度和面积
      const ele = (mapLeaflet?.map.pm.getGeomanLayers())[0]
      let area = 0;
      let center: any
      let value: any
      let popupContent: any
      if (geoJsonData.geometry.type === "LineString") {
        let line = turf.lineString(geoJsonData.geometry.coordinates)
        area = turf.length(line, { units: 'meters' })
        center = _.last(geoJsonData.geometry.coordinates)
        center = [center[1], center[0]]
        value = Math.trunc(area).toLocaleString()
        popupContent = `长度:${value}米`
      } else if (geoJsonData.properties.subType === 'Circle') {
        area = Math.PI * Math.pow(geoJsonData.properties.radius, 2)
        center = geoJsonData.geometry.coordinates
        center = [center[1], center[0]]
        value = Math.trunc(area).toLocaleString()
        popupContent = `面积:${value}平方米`
      } else {
        let polygon = turf.polygon(geoJsonData.geometry.coordinates)
        area = turf.area(polygon)
        center = ele.pm._layer.getCenter()
        value = Math.trunc(area).toLocaleString()
        popupContent = `面积:${value}平方米`
      }

      let pop = L.popup({
        className: 'leaflet-popup-ui tool-area-ui',
        minWidth: 160,
        closeOnClick: false
      }).setLatLng(center)
        .setContent(popupContent)
        .addTo(mapLeaflet?.map)
      popupContentTips = pop
    }
  }, [drawMarker, realValue, isDrawMarker, mapLeaflet])

  // 绘制插件初始化
  useEffect(() => {
    if (isHiddleControls) {
      // 是否显示绘制工具栏
      return
    }
    // pm插件画完事件
    let handlePmDrawend: any;
    if (mapLeaflet) {
      const map = mapLeaflet.map
      const controlsOptions: any = {
        position: 'topleft',
        drawMarker: false,
        drawText: false,
        drawCircleMarker: false,
        cutPolygon: false,
        rotateMode: false
      }
      if (isNotRectangle) {
        controlsOptions.drawRectangle = false
      }
      if (isNotPolygon) {
        controlsOptions.drawPolygon = false
      }
      if (isNotCircle) {
        controlsOptions.drawCircle = false
      }
      map.pm.setLang('zh');

      map.pm.addControls(controlsOptions); // 新增绘制工具栏
      map.pm.setPathOptions({
        color: borderColor,
        fillColor: background,
        fillOpacity: 0.4,
      });

      handlePmDrawend = () => {
        const layers = map.pm.getGeomanLayers()
        setMapLayer(_.first(layers))

        if (popupContentTips) {
          map.removeLayer(popupContentTips)
          popupContentTips = null
        }
        const geoJsonList = layers.map((ele: any) => {
          const result = ele.toGeoJSON()
          let area = 0;
          let center: any
          let value: any
          let popupContent: any
          if (ele.pm._shape === "Circle") {
            result.properties.subType = ele.pm._shape
            result.properties.radius = ele._mRadius
          }
          // 计算线段长度和面积
          if (ele.pm._shape === 'Line') {
            let line = turf.lineString(result.geometry.coordinates)
            area = turf.length(line, { units: 'meters' })
            center = _.last(result.geometry.coordinates)
            center = [center[1], center[0]]
            value = Math.trunc(area).toLocaleString()
            popupContent = `长度:${value}米`
          } else if (ele.pm._shape === 'Circle') {
            area = Math.PI * Math.pow(result.properties.radius, 2)
            center = result.geometry.coordinates
            center = [center[1], center[0]]
            value = Math.trunc(area).toLocaleString()
            popupContent = `面积:${value}平方米`
          } else {
            let polygon = turf.polygon(result.geometry.coordinates)
            area = turf.area(polygon)
            center = ele.pm._layer.getCenter()
            value = Math.trunc(area).toLocaleString()
            popupContent = `面积:${value}平方米`
          }

          let pop = L.popup({
            className: 'leaflet-popup-ui tool-area-ui',
            minWidth: 160,
            closeOnClick: false
          }).setLatLng(center)
            .setContent(popupContent)
            .addTo(map)
          popupContentTips = pop
          return result
        })
        geoJsonList[0].properties.borderColor = borderColor
        geoJsonList[0].properties.background = background
        setIsShowActions(true)
      }
      map.on('pm:drawend', handlePmDrawend)

    }
    return () => {
      mapLeaflet && mapLeaflet.map.off('pm:drawend', handlePmDrawend)
      mapLeaflet && mapLeaflet.map.pm.removeControls()
    }
  }, [mapLeaflet, isNotRectangle, isNotPolygon, isNotCircle, borderColor, background, isOneGraph, isHiddleControls])

  // 监听图层编辑
  useEffect(() => {
    if (mapLeaflet && mapLayer) {
      mapLayer.on('pm:edit', function (e: any) {
        const layer = (mapLeaflet.map.pm.getGeomanLayers())[0]
        let geoJsonData = layer.toGeoJSON()
        geoJsonData.properties.borderColor = borderColor
        geoJsonData.properties.background = background
        setIsShowActions(true)
      })
    }
  }, [mapLeaflet, mapLayer, background, borderColor, isOneGraph, onChange])

  // 监听创建删除，只绘一个图形
  useEffect(() => {

    const handleCreate = (e: any) => {
      const layers = mapLeaflet!.map.pm.getGeomanLayers()
      // 只保留当前创建的范围
      const needRemoveLayers = _.filter(layers, (ele: any) => ele._leaflet_id !== e.layer._leaflet_id)
      needRemoveLayers.forEach((ele: any) => {
        ele.pm.remove()
      });
    }

    const handleRemove = () => {
      onChange && onChange(undefined)
    }

    if (mapLeaflet && isOneGraph) {
      mapLeaflet.map.on('pm:create', handleCreate);
      mapLeaflet.map.on('pm:remove', handleRemove);
    }

    return () => {
      if (mapLeaflet) {
        mapLeaflet.map.off('pm:create', handleCreate)
        mapLeaflet.map.off('pm:remove', handleRemove)
      }
    }
  }, [mapLeaflet, isOneGraph, onChange])

  // 地图打点绘制
  useEffect(() => {
    let markerGroup: any
    if (isDrawMarker && mapLeaflet) {
      const map = mapLeaflet.map
      map.on('click', function (evt: any) {
        markerGroup && mapLeaflet.map.removeLayer(markerGroup)
        // 绘制标识点
        if (evt.latlng) {
          // 处理经纬度保留6位小数
          evt.latlng.lat = Number(evt.latlng.lat)?.toFixed(6)
          evt.latlng.lng = Number(evt.latlng.lng)?.toFixed(6)
          markerGroup = drawMarker(mapLeaflet, [evt.latlng.lat, evt.latlng.lng])
          onChange && onChange({ type: 'Feature', properties: {}, geometry: { type: 'SinglePoint', coordinates: [evt.latlng.lat, evt.latlng.lng] } })
        }
      })
    }
    return () => {
      markerGroup && mapLeaflet?.map.removeLayer(markerGroup)
    }
  }, [drawMarker, isDrawMarker, mapLeaflet, markIconType, onChange])

  useEffect(() => {
    const selectIcon = PlaceTypeIconDict.find((ele) => ele.value === markIconType);
    if (selectIcon) {
      const IconUrl = getPlaceTypeIconSrc(selectIcon?.value)
      setIconUrl(IconUrl)
    }
  }, [markIconType])

  // 修改图形背景颜色
  function changeBackground(e: any) {
    if (mapLeaflet) {
      const map = mapLeaflet.map
      setBackground(e.target.value)
      map.pm.setPathOptions({
        color: borderColor,
        fillColor: e.target.value,
        fillOpacity: 0.4,
      });
      const layers = mapLeaflet.map.pm.getGeomanLayers()
      const layer: any = _.first(layers)
      layer.setStyle({
        fillColor: e.target.value,
        fillOpacity: 0.4
      })
      // 对应修改value值
      if (value) {
        const copyValue = JSON.parse(JSON.stringify(value))
        copyValue.properties.background = e.target.value
        onChange && onChange(copyValue)
      }
    }
  }

  // 修改边框颜色
  function changeBorderColor(e: any) {
    if (mapLeaflet) {
      const map = mapLeaflet.map
      setBorderColor(e.target.value)
      map.pm.setPathOptions({
        color: e.target.value,
        fillColor: background,
        fillOpacity: 0.4,
      });
      const layers = mapLeaflet.map.pm.getGeomanLayers()
      const layer: any = _.first(layers)
      layer.setStyle({
        color: e.target.value
      })
      console.log(value, 'value')
      // 对应修改value值
      if (value) {
        const copyValue = JSON.parse(JSON.stringify(value))
        copyValue.properties.borderColor = e.target.value
        onChange && onChange(copyValue)
      }
    }
  }

  // 用户确认
  function handleConfirm() {
    if (mapLeaflet) {
      const layers = mapLeaflet.map.pm.getGeomanLayers()
      const geoJsonList = layers.map((ele: any) => {
        const result = ele.toGeoJSON()

        if (ele.pm._shape === "Circle") {
          result.properties.subType = ele.pm._shape
          result.properties.radius = ele._mRadius
        }

        return result
      })
      geoJsonList[0].properties.borderColor = borderColor
      geoJsonList[0].properties.background = background
      onChange && onChange(geoJsonList[0])
      setIsShowActions(false)
    }
  }

  // 清除
  function handleClear() {
    if (mapLeaflet) {
      const layers = mapLeaflet.map.pm.getGeomanLayers()
      layers.forEach((ele: any) => {
        ele.pm.remove()
      })
      let params: any = {}
      onChange && onChange(params)
      setIsShowActions(false)
      if (popupContentTips) {
        mapLeaflet.map.removeLayer(popupContentTips)
        popupContentTips = null
      }
    }
  }

  return (
    <div className={styles.wrapper}>
      {
        isShowTitle && !isDrawMarker && <div className={styles.title}>
          <div className={`${styles.titleItem} ${styles.txt}`}>在下方地图中框选场所区域</div>
          <div className={`${styles.titleItem} ${styles.btnColor}`}>
            填充：<input type='color' value={background} onChange={changeBackground} />
          </div>
          <div className={`${styles.titleItem} ${styles.btnColor}`}>
            边框：<input type='color' value={borderColor} onChange={changeBorderColor} />
          </div>
        </div>
      }

      {isShowActions &&
        <aside className={styles.actions}>
          <Row style={{ marginBottom: '10px', color: 'rgba(255, 197, 25)' }}>
            <span>提交前，请先点击此确认按钮</span>
          </Row>
          <Row>
            <Button onClick={handleClear}>清空</Button>
            <Button type="primary" onClick={handleConfirm} style={{ marginLeft: '60px' }}>确认</Button>
          </Row>
        </aside>
      }
      <section className={styles.mapBox}>
        <div className={styles.map} ref={mapRef} />
        {
          isDrawMarker && <div className={styles.markIcon}>
            <img className={styles.img} alt={''} width={selectIcon?.value === '11' ? '94px' : '24px'} height={selectIcon?.value === '11' ? '22px' : '24px'} src={iconUrl} />
          </div>
        }
      </section>
    </div>
  )
}

MapPlace.defaultProps = {
  isOneGraph: true, // 只画一个图形
  isShowTitle: true, // 是否显示标题
}

export default MapPlace