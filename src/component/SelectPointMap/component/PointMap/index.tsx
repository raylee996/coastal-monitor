import { DefaultOptionType } from "antd/lib/select";
import CoastalMonitorWebgis from "helper/map";
import Map2D, { MapTileType } from "helper/Map2D";
import { getIconByDeviceType } from "helper/mapIcon";
import _ from "lodash";
import { useEffect, useRef, useState } from "react";
import PointList from "../PointList";
import styles from "./index.module.sass";


interface Option extends DefaultOptionType {
  type: string | number
  lat: number
  lng: number
}

interface Props {
  /** 点位过滤类型，数组传入支持多选，默认全部类型 */
  typeList?: string[]
  /** 选中的值 */
  value: string[]
  /** 点位数据 */
  data: Option[]
  /** 确认回调 */
  onConfirm: (value: string[]) => void
  /** popup组件隐式传入的关闭窗口函数 */
  onClosePopup?: Function
}

const PointMap: React.FC<Props> = ({ data, value, typeList, onConfirm, onClosePopup }) => {
  console.debug('PointMap')

  const mapRef = useRef<HTMLDivElement>(null)

  const [mapLeaflet, setMapLeaflet] = useState<CoastalMonitorWebgis>()
  const [typeValue, setTypeValue] = useState(typeList)
  const [selectValue, setSelectValue] = useState<string[]>([])

  // 初始化地图实例
  useEffect(() => {
    let _mapLeaflet: Map2D
    if (mapRef.current) {
      _mapLeaflet = new Map2D(mapRef.current, MapTileType.satellite)
      setMapLeaflet(_mapLeaflet)
    }
    return () => {
      _mapLeaflet?.remove()
    }
  }, [])

  // 初始化绘制插件
  useEffect(() => {
    if (mapLeaflet) {
      mapLeaflet.createGraphicDrawing({ drawPolyline: false })
      const map = mapLeaflet.map
      map.on('pm:create', function (e: any) {
        const layers = map.pm.getGeomanLayers()
        // 只保留当前创建的范围
        const needRemoveLayers = _.filter(layers, (ele: any) => ele._drawnByGeoman && ele._leaflet_id !== e.layer._leaflet_id)
        needRemoveLayers.forEach((ele: any) => {
          ele.pm.remove()
        });
        // 过滤出在范围内的点位
        if (e.shape === 'Circle') {
          const result = _.filter(data, ele => {
            const latLng = L.latLng(ele.lat, ele.lng);
            const distance = latLng.distanceTo(e.layer._latlng)
            return distance <= e.layer._mRadius
          })
          const _selectValue = result.map(ele => ele.value) as string[]
          setSelectValue(_selectValue)
        } else {
          const result = _.filter(data, ele => {
            const pt = turf.point([ele.lng, ele.lat]);
            const [polygon] = e.layer._latlngs
            const pointList = polygon.map((val: any) => [val.lng, val.lat])
            pointList.push(_.head(pointList))
            const poly = turf.polygon([pointList]);
            return turf.booleanPointInPolygon(pt, poly) as boolean;
          })
          const _selectValue = result.map(ele => ele.value) as string[]
          setSelectValue(_selectValue)
        }
      });
    }
  }, [mapLeaflet, data])

  // 渲染点位
  useEffect(() => {
    let featureGroup = L.featureGroup()
    if (mapLeaflet) {
      let result: Option[]

      if (typeValue) {
        result = _.filter(data, ele => typeValue.some(val => ele.type === val))
      } else {
        result = data
      }

      result.forEach(ele => {
        const lIcon = getIconByDeviceType(ele.deviceType)
        const latLng = {
          lat: ele.lat || ele.latitude,
          lng: ele.lng || ele.longitude
        }
        const marker = L.marker(latLng, {
          extraData: ele,
          icon: lIcon
        })
        featureGroup.addLayer(marker)
      })

      featureGroup.on("mouseover ", function (evt: any) {
        evt.layer.bindPopup(evt.layer.options.extraData.label).openPopup()
      })

      // 点击设备，选中点位
      featureGroup.on("click", function (evt: any) {
        let lat = evt.latlng.lat;
        let lng = evt.latlng.lng;
        const result: any = data.filter(ele => ele.lat === lat && ele.lng === lng)
        let _selectValue = []
        for (let i = 0; i < result.length; i++) {
          _selectValue.push(result[i].value)
        }
        setSelectValue(_selectValue)
      })

      featureGroup.addTo(mapLeaflet.map)
    }
    return () => {
      featureGroup && featureGroup.clearLayers()
    }
  }, [mapLeaflet, typeValue, data])

  function handleType(params: string[]) {
    setTypeValue(params)
  }

  function handleConfirm(params: string[]) {
    onClosePopup && onClosePopup()
    onConfirm(params)
  }

  return (
    <article className={styles.wrapper}>
      <div className={styles.list}>
        <PointList typeList={typeList} data={data} value={value} mapValue={selectValue} onTypeChange={handleType}
          onConfirm={handleConfirm} />
      </div>
      <div className={styles.mapBox} ref={mapRef} />
    </article>
  )
}

export default PointMap;
