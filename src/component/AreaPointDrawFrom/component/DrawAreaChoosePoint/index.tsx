import { Button, Space } from "antd";
import Map2D, { MapTileType } from "helper/Map2D";
import { getIconByDeviceType } from "helper/mapIcon";
import TableInterface from "hooks/integrity/TableInterface";
import _ from "lodash";
import { useEffect, useMemo, useRef, useState } from "react";
// import { CreateProps } from "webgis/extendUntils/layer/CommonMarker";
import styles from "./index.module.sass";

export interface DrawAreaChoosePointProps {
  /** 是否为选中绘制区域内的点 */
  isPoint?: boolean
  /** 点位集合 */
  pointList: any[]
  /** 点击确认的回调函数传入geoJson数组数据 */
  onConfirm?: (data: any[]) => void
  /** popup组件隐式传入的关闭窗口函数 */
  onClosePopup?: Function
  /** 设备类型 */
  params?: any
}

interface Props extends DrawAreaChoosePointProps {
  onChange?: Function
  value: any
}

type LatLngType = any

/** 判断点是否在图形内 */
function isPointInPolygon(point: LatLngType, polygon: LatLngType[][]) {
  const pt = turf.point([point[1], point[0]]);
  const poly = turf.polygon(polygon);
  return turf.booleanPointInPolygon(pt, poly);
}

/** 判断点是否在圆内 */
function isPointInCircle(point: LatLngType, circle: LatLngType, radius: number) {
  const from = L.latLng(circle)
  const distance = from.distanceTo([point[1], point[0]])
  // const from = turf.point(point);
  // const to = turf.point(circle);
  // const distance = turf.distance(from, to, { units: "kilometers", }) * 1000;
  return distance < radius || distance === radius
}

const DrawAreaChoosePoint: React.FC<Props> = (props) => {
  console.debug('DrawAreaChoosePoint')

  const { value, onChange, isPoint, pointList, onClosePopup } = props

  const mapRef = useRef<HTMLDivElement>(null)
  const [mapLeaflet, setMapLeaflet] = useState<Map2D>()

  const [polygonLayers, setPolygonLayers] = useState<any>({})

  const [activePoint, setActivePoint] = useState<any[]>([])

  const [toggle, setToggle] = useState<boolean>(true)

  const columns = useMemo(() => {
    return [
      ['类型', 'deviceTypeName'],
      ['设备名称', 'name'],
      ['操作', '', {
        itemProps: {
          width: '90px',
          render: (text: any, record: any) => {
            return (
              <Button type={"link"} onClick={() => {
                const ActivePoint = activePoint.filter(item => item.markerId !== record.markerId)
                record?.markerId && setActivePoint(ActivePoint)
                onChange && onChange(ActivePoint?.length ? ActivePoint.map(item => item.deviceCode || item.markerId) : [])
              }}>删除</Button>
            )
          }
        }
      }],
    ]
  }, [activePoint, onChange])

  // 地图实例化
  useEffect(() => {
    let _mapLeaflet: Map2D
    if (mapRef.current) {
      _mapLeaflet = new Map2D(mapRef.current, MapTileType.satellite)
      setMapLeaflet(_mapLeaflet)
    }
    return () => {
      _mapLeaflet?.map?.remove()
    }
  }, [])

  useEffect(() => {
    /** 需要选择点时先绘制点 */
    if (mapLeaflet && isPoint && pointList?.length) {
      const markerList = pointList.map(item => {
        const marker = L.marker(item.latLng, {
          extraData: item,
          icon: getIconByDeviceType(item.deviceType)
        })
        marker.bindTooltip(item.name)
        return marker
      })
      L.featureGroup(markerList).addTo(mapLeaflet.map);
    }
  }, [isPoint, mapLeaflet, pointList])

  useEffect(() => {
    if (mapLeaflet) {
      // 绘制插件初始化
      const map = mapLeaflet.map
      const controlsOptions: any = {
        position: 'topright',
        drawMarker: false,
        drawText: false,
        drawCircleMarker: false,
        cutPolygon: false,
        rotateMode: false,
        drawPolyline: false
      }
      map.pm.addControls(controlsOptions);
      map.pm.setLang('zh');
      map.on('pm:create', function (e: any) {
        const layers = map.pm.getGeomanLayers().filter((item: any) => item.options.pane === 'overlayPane')
        let rectangleGeoJson = e.layer.toGeoJSON();
        //特殊处理圆形
        if (e.shape === 'Circle') {
          setPolygonLayers(() => {
            return {
              type: 'Circle',
              radius: e.layer.getRadius(),
              coordinates: rectangleGeoJson.geometry.coordinates
            }
          })
        }
        else {
          setPolygonLayers(() => {
            return {
              type: 'Polygon',
              coordinates: rectangleGeoJson.geometry.coordinates
            }
          })
        }
        // 只保留当前创建的范围
        const needRemoveLayers = _.filter(layers, (ele: any) => ele._leaflet_id !== e.layer._leaflet_id)
        needRemoveLayers.forEach((ele: any) => {
          ele.pm.remove()
        });
        // console.log(layers, 'layers')
      });
    }
    return () => {
      mapLeaflet && mapLeaflet.map.pm.removeControls()
    }
  }, [isPoint, mapLeaflet, pointList])

  useEffect(() => {
    if (!isPoint) return;
    const ActivePoint = polygonLayers?.coordinates?.length ?
      pointList.filter(item => {
        console.log(item, polygonLayers)
        return polygonLayers.type === 'Circle' ? isPointInCircle(item.latLng, polygonLayers.coordinates, polygonLayers.radius) : isPointInPolygon(item.latLng, polygonLayers.coordinates.map((v: any) => v))
      })
      : []
    console.log(ActivePoint, "ActivePoint")
    setActivePoint(ActivePoint)
  }, [isPoint, pointList, polygonLayers, value])

  useEffect(() => {
    value && setActivePoint(pointList.filter(item => value.includes(item.markerId)))
  }, [pointList, value])

  function handleConfirm() {
    console.log(activePoint, 'activePoint')
    onChange && onChange(activePoint?.length ? activePoint.map(item => item.deviceCode || item.markerId) : [])
    onClosePopup && onClosePopup()
  }

  function handleClear() {
    if (mapLeaflet) {
      const layers = mapLeaflet.map.pm.getGeomanLayers().filter((item: any) => item.options.pane === 'overlayPane')
      layers.forEach((ele: any) => {
        ele.pm.remove()
      })
      setPolygonLayers(() => { })
    }
  }

  const handleToggle = () => setToggle(!toggle)

  function handleClearActive() {
    handleClear()
    onChange && onChange([])
    setActivePoint([])
  }

  return (
    <article className={styles.wrapper}>
      <section className={styles.mapBox}>
        <div className={styles.map} ref={mapRef}></div>
      </section>
      <aside className={styles.tableBox}>
        <div className={styles.label}>
          <span>点位列表</span>
          <Button type="link" onClick={handleToggle}>{toggle ? '收起' : '展开'}</Button>
        </div>
        <div>
          {/* <select */}
        </div>
        <div className={styles.label}>
          <span>{`已选择${activePoint.length}项`}</span>
          <Button type="link" onClick={() => handleClearActive()}>清空</Button>
        </div>
        {
          toggle && <div className={styles.table}>
            <TableInterface
              columns={columns}
              tableProps={{ dataSource: activePoint }}
              isNotPagination={true}
            />
          </div>
        }
      </aside>
      {
        polygonLayers?.coordinates?.length && <aside className={styles.actions}>
          <Space>
            <Button onClick={handleClear}>清空</Button>
            <Button type="primary" onClick={handleConfirm}>确认</Button>
          </Space>
        </aside>
      }

    </article>
  )
}

export default DrawAreaChoosePoint