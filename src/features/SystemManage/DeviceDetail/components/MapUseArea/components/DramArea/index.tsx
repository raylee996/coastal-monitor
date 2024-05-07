import { Button, Space } from "antd";
import CoastalMonitorWebgis from "helper/map";
import { getCRSByMapType, MapType } from "helper/map/crsUtil";
import getMapOffLineDate from "helper/map/getMap";
import _ from "lodash";
import { useEffect, useRef, useState } from "react";
import styles from "./index.module.sass";


interface Props {
  /** 绑定信息 */
  onChange?: Function
  value: any
  /** 最多能创建的图形数量，不传值或者为0时不限制 默认为1 */
  limit?: number
  /** 是否不支持编辑矩形 */
  isNotRectangle?: boolean
  /** 是否不支持编辑多边形 */
  isNotPolygon?: boolean
  /** 是否不支持编辑线条 */
  isNotLine?: boolean
  /** 是否不支持编辑圆形 */
  isNotCircle?: boolean
  /** 确认回调 */
  onConfirm: (value: string[]) => void
  /** popup组件隐式传入的关闭窗口函数 */
  onClosePopup?: Function
  /** 展示名称 */
  title?: string
}

const DramArea: React.FC<Props> = ({
  onChange,
  value,
  limit = 1,
  isNotRectangle,
  isNotPolygon,
  isNotLine,
  isNotCircle,
  onConfirm,
  onClosePopup
}) => {
  console.debug('DramAreaInForm')

  const mapRef = useRef<HTMLDivElement>(null)
  const [mapLeaflet, setMapLeaflet] = useState<CoastalMonitorWebgis>()
  const [isShowActions, setIsShowActions] = useState(false)

  // 当前绘制的图层
  const [areaLayer, setAreaLayer] = useState<any>(null)

  // 地图实例化
  useEffect(() => {
    let _mapLeaflet: CoastalMonitorWebgis
    if (mapRef.current) {
      const crs = getCRSByMapType(MapType.SatelliteMap);
      _mapLeaflet = new CoastalMonitorWebgis(mapRef.current, { crs })
      getMapOffLineDate(MapType.SatelliteMap).addTo(_mapLeaflet.map);
      setMapLeaflet(_mapLeaflet)
    }
    return () => {
      _mapLeaflet?.map?.remove()
    }
  }, [])

  // 绘制插件初始化
  useEffect(() => {
    if (mapLeaflet) {
      const map = mapLeaflet.map
      const controlsOptions: any = {
        position: 'topleft',
        drawMarker: false,
        drawText: false,
        drawCircleMarker: false,
        drawCircle: false,
        cutPolygon: false,
        rotateMode: false,
        drawPolyline: false
      }
      if (isNotRectangle) {
        controlsOptions.drawRectangle = false
      }
      if (isNotPolygon) {
        controlsOptions.drawPolygon = false
      }
      if (isNotLine) {
        controlsOptions.drawPolyline = false
      }
      if (isNotCircle) {
        controlsOptions.drawCircle = false
      }
      map.pm.addControls(controlsOptions);
      map.pm.setLang('zh');
      map.on('pm:create', function (e: any) {
        const layers = map.pm.getGeomanLayers()
        // 限制图形数量
        if (limit && layers.length > limit) {
          const needRemoveLayer: any = _.first(layers)
          needRemoveLayer.pm.remove()
        }
        // 当前图层
        // const currentLayer = _.filter(layers, (ele: any) => ele._leaflet_id === e.layer._leaflet_id)
        setAreaLayer(e.layer)
        setIsShowActions(true)
      });
      map.on('pm:remove', function (e: any) {
        const layers = map.pm.getGeomanLayers()
        if (layers.length === 0) {
          setIsShowActions(false)
        }
      });
    }
    return () => {
      mapLeaflet && mapLeaflet.map.pm.removeControls()
    }
  }, [mapLeaflet, isNotRectangle, isNotPolygon, isNotLine, isNotCircle, limit])

  useEffect(() => {
    if (value && mapLeaflet) {
      console.log(value, "value")
      if (value.properties.subType === 'Circle') {
        let circle = new L.Circle([value.geometry.coordinates[1], value.geometry.coordinates[0]], {
          radius: value.properties.radius,
        });
        let circleLayer = circle.addTo(mapLeaflet.map);
        mapLeaflet.map.panTo(circle.getBounds().getCenter())
        setAreaLayer(circleLayer)
      } else {
        const areaLayer = L.geoJson(value).addTo(mapLeaflet.map)
        mapLeaflet.map.panTo(areaLayer.getBounds().getCenter())
        setAreaLayer(areaLayer)
      }
    }
  }, [value, mapLeaflet])

  // 编辑图层
  useEffect(() => {
    if (mapLeaflet && areaLayer) {
      areaLayer.on('pm:edit', function () {
        setIsShowActions(true)
      })
    }
  }, [mapLeaflet, areaLayer])


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
      onConfirm && onConfirm(geoJsonList)
      onClosePopup && onClosePopup()
    }
  }

  function handleClear() {
    if (mapLeaflet) {
      const layers = mapLeaflet.map.pm.getGeomanLayers()
      layers.forEach((ele: any) => {
        ele.pm.remove()
      })
    }
  }

  return (
    <article className={styles.wrapper}>
      <section className={styles.mapBox}>
        <div className={styles.map} ref={mapRef}></div>
      </section>
      {isShowActions &&
        <aside className={styles.actions}>
          <Space>
            <Button onClick={handleClear}>清空</Button>
            <Button type="primary" onClick={handleConfirm}>确认</Button>
          </Space>
        </aside>
      }
    </article>
  )
}

export default DramArea