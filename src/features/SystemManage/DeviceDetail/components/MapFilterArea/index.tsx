import { message, PaginationProps, TableProps } from "antd";
import { deviceAreaRelationDict, getDictName } from "helper/dictionary";
import createElementByComponent from "helper/elementComponent";
import Map2D, { MapTileType } from "helper/Map2D";
import { getIconByDeviceType } from "helper/mapIcon";
import { ActionType } from "hooks/flexibility/TablePanel";
import TableInterface from "hooks/integrity/TableInterface";
import _ from "lodash";
import React, { useImperativeHandle, useMemo } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { getDeviceDataAll } from "server/system";
import ConfirmArea from "./components/ConfirmArea";
import styles from "./index.module.sass";


const paginationProps: PaginationProps = {
  size: 'small'
}

const tableProps: TableProps<any> = {
  size: "small",
  rowKey: 'name'
}

interface Props {
  /** 是否支持编辑线条 */
  isLine?: boolean
  /** 是否支持编辑圆形 */
  isCircle?: boolean
  value?: any[]
  onChange?: (data: any[] | undefined) => void
}
interface DevicePopupProps {
  data?: any
}
const DevicePopup: React.FC<DevicePopupProps> = ({ data }) => {
  return <>
    <p className={styles.deviceName}>{data.deviceName}</p>
  </>
}
export interface MapFilterAreaRefProps {
  onValue: (data: any[]) => void
}

const MapFilterArea = React.forwardRef<MapFilterAreaRefProps, Props>(({
  isLine,
  isCircle,
  value,
  onChange
}, ref) => {
  console.debug('MapFilterArea')


  const mapRef = useRef<HTMLElement>(null)


  const [map2d, setMap2D] = useState<Map2D>()
  const [realvalue, setRealValue] = useState<any[] | undefined>(() => {
    return value ? value : undefined
  })


  useImperativeHandle(
    ref,
    () => ({
      onValue(data) {
        setRealValue(data)
      },
    }),
    []
  )


  const handleAdd = useCallback(
    (e: any) => {

      const handleAsyncFinish = async (data: any) => {
        if (data.name) {

          const graphJson = e.layer.toGeoJSON()

          let type = 4
          if (e.layer.pm._shape === "Circle") {
            graphJson.properties.subType = e.layer.pm._shape
            graphJson.properties.radius = e.layer._mRadius
            type = 2
          } else {
            const list: [number, number][] = graphJson.geometry.coordinates[0]
            if (list.length === 5
              && list[0][0] === list[1][0]
              && list[1][1] === list[2][1]) {
              type = 3
            }
          }

          const item = {
            graphJson,
            name: data.name,
            type
          }

          let _value

          if (realvalue) {
            if (realvalue.some(item => item.name === data.name)) {
              message.warning('已经存在同名称区域')
            } else {
              _value = [...realvalue, item]
            }
          } else {
            _value = [item]
          }

          onChange && onChange(_value)

          e.layer.remove()
        } else {
          message.warning('请输入区域名称')
        }
      }

      const popupContent = createElementByComponent(<ConfirmArea onAsyncFinish={handleAsyncFinish} />)

      e.layer.bindPopup(popupContent, {
        className: 'leaflet-popup-ui',
        minWidth: 320,
        autoPan: false,
        keepInView: true,
        closeButton: false,
        closeOnClick: false
      }).openPopup()
    },
    [realvalue, onChange],
  )

  const handlePmEdit = useCallback((e: any) => {

    const graphJson = e.layer.toGeoJSON()

    let type = 4
    if (e.layer.pm._shape === "Circle") {
      graphJson.properties.subType = e.layer.pm._shape
      graphJson.properties.radius = e.layer._mRadius
      type = 2
    } else {
      const list: [number, number][] = graphJson.geometry.coordinates[0]
      if (list.length === 5
        && list[0][0] === list[1][0]
        && list[1][1] === list[2][1]) {
        type = 3
      }
    }

    const name = e.sourceTarget.options.areaName

    const item = {
      graphJson,
      name,
      type
    }

    let _value

    if (realvalue) {
      const index = realvalue.findIndex(item => item.name === name)
      realvalue.splice(index, 1, item)
      _value = [...realvalue]
    } else {
      _value = [item]
    }

    onChange && onChange(_value)
  }, [onChange, realvalue])


  // 初始化地图
  useEffect(() => {
    let _map2d: Map2D
    if (mapRef.current) {
      _map2d = new Map2D(mapRef.current, MapTileType.satellite)
      const controlsOptions: any = {
        position: 'topright',
        drawMarker: false,
        drawText: false,
        drawCircleMarker: false,
        drawCircle: isCircle || false,
        drawPolyline: isLine || false,
        cutPolygon: false,
        rotateMode: false,
        removalMode: false,
        // editMode: false,
        dragMode: false
      }
      _map2d.map.pm.addControls(controlsOptions);
      _map2d.map.pm.setLang('zh');
      setMap2D(_map2d)
    }
    return () => {
      _map2d?.map?.remove()
    }
  }, [isLine, isCircle])
  useEffect(()=>{
    let group: any
    async function main() {
      if(map2d) {
        const deviceList = await getDeviceDataAll()
        const result = deviceList.map((ele: any) => {
          
          const lIcon = getIconByDeviceType(String(ele.deviceType))
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
        group = L.featureGroup(markerList).addTo(map2d.map);
      }
    }
    main()
    return () => {
      group && group.remove()
    }
  },[map2d])
  // 监听创建图层事件
  useEffect(() => {
    let previous: any
    const handlePmCreate = (e: any) => {
      previous?.pm.remove()
      previous = e.layer
      handleAdd(e)
    }
    map2d?.map.on('pm:create', handlePmCreate);
    return () => {
      map2d?.map.off('pm:create', handlePmCreate);
    }
  }, [map2d, handleAdd])

  // 根据值渲染地图区域
  useEffect(() => {
    let layers: any[]
    if (map2d && realvalue) {
      layers = realvalue.map((item: any) => {
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
        layer.bindTooltip(item.name, {
          className: 'leaflet-tooltip-ui',
          permanent: true,
          direction: 'top',
        })
        layer.on('pm:disable', handlePmEdit);
        layer.addTo(map2d.map)
        return layer
      })
    }
    return () => {
      layers?.forEach(item => item.remove())
    }
  }, [map2d, realvalue, handlePmEdit])


  const columns = useMemo(() => [
    ['区域名称', 'name'],
    ['类型', 'typeName'],
    [
      ['删除', (record: any) => {
        if (onChange && realvalue) {
          const result = _.filter(realvalue, item => item.name !== record.name)
          if (result.length === 0) {
            onChange(undefined)
          } else {
            onChange(result)
          }
        }
      }, ActionType.confirm]
    ]
  ], [realvalue, onChange])

  const tableDataSource = useMemo(() => {
    if (realvalue) {
      const result = realvalue.map(item => {
        const typeName = getDictName(deviceAreaRelationDict, item.type)
        return { ...item, typeName }
      })
      return result
    } else {
      return []
    }
  }, [realvalue])


  return (
    <article className={styles.wrapper}>
      <section className={styles.map} ref={mapRef}></section>
      <section className={styles.panel}>
        <TableInterface
          isMustExtraParams={true}
          columns={columns}
          paginationProps={paginationProps}
          tableDataSource={tableDataSource}
          tableProps={tableProps}
        />
      </section>
    </article>
  )
})

export default MapFilterArea