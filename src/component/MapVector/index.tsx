import { Button, Space } from "antd";
import CoastalMonitorWebgis from "helper/map";
import { getCRSByMapType, MapType } from "helper/map/crsUtil";
import getMapOffLineDate from "helper/map/getMap";
import _ from "lodash";
import { useEffect, useRef, useState } from "react";
import styles from "./index.module.sass";


interface Props {
  /** 最多能创建的图形数量，不传值或者为0时不限制 */
  limit?: number
  /** 是否不支持编辑矩形 */
  isNotRectangle?: boolean
  /** 是否不支持编辑多边形 */
  isNotPolygon?: boolean
  /** 是否不支持编辑线条 */
  isNotLine?: boolean
  /** 是否不支持编辑圆形 */
  isNotCircle?: boolean
  /** 点击确认的回调函数传入geoJson数组数据 */
  onConfirm?: (geoJsonList: any[]) => void
}

const MapVector: React.FC<Props> = ({
  limit,
  isNotRectangle,
  isNotPolygon,
  isNotLine,
  isNotCircle,
  onConfirm
}) => {
  console.debug('MapVector')

  const mapRef = useRef<HTMLDivElement>(null)
  const [mapLeaflet, setMapLeaflet] = useState<CoastalMonitorWebgis>()
  const [isShowActions, setIsShowActions] = useState(false)

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
        cutPolygon: false,
        rotateMode: false
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

export default MapVector