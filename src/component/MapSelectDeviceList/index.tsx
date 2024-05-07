import { Button, Popconfirm, Space } from "antd";
import { isPointInCircle, isPointInPolygon } from "helper/map/common";
import Map2D, { MapTileType } from "helper/Map2D";
import SelectRemote from "hooks/basis/SelectRemote";
import _ from "lodash";
import { useCallback, useEffect, useRef, useState } from "react";
import { doGetDeviceType, getDeviceAllData } from "server/device";
import { getPlaceInfoById } from "server/place";
import styles from "./index.module.sass";


interface Props {
  /** 场所id，传入则在地图上展示场所区域范围 */
  placeId?: number
  onFinish?: (deviceList: any[]) => void
  onClosePopup?: () => void
}

const MapSelectDeviceList: React.FC<Props> = ({ placeId, onFinish, onClosePopup }) => {
  console.debug('MapSelectDeviceList')


  const mapRef = useRef<HTMLElement>(null)


  const [map2d, setMap2D] = useState<Map2D>()
  const [deviceList, setDeviceList] = useState<any[]>()
  const [deviceTypes, setDeviceTypes] = useState<string[]>()
  const [selectDeviceList, setSelectDeviceList] = useState<any[]>()


  // 初始化地图
  useEffect(() => {
    let _map2d: Map2D
    if (mapRef.current) {
      _map2d = new Map2D(mapRef.current, MapTileType.satellite)
      setMap2D(_map2d)
    }
    return () => {
      _map2d?.map?.remove()
    }
  }, [])

  //获取点位列表
  useEffect(() => {
    let ctr: AbortController
    async function main() {
      if (map2d) {
        ctr = new AbortController()
        const _deviceList = await getDeviceAllData(deviceTypes, ctr)
        setDeviceList(_deviceList)
      }
    }
    main()
    return () => {
      ctr?.abort()
    }
  }, [map2d, deviceTypes]);

  // 渲染设备
  useEffect(() => {
    let group: any
    if (map2d && deviceList) {
      const markerList = deviceList.map(ele => {
        const marker = L.marker(ele.latLng, {
          extraData: ele,
          icon: ele.lIcon
        })
        marker.bindTooltip(`${ele.name}（${ele.deviceTypeName}）`, {
          className: 'leaflet-tooltip-ui',
          direction: 'top',
          offset: L.point(0, -32)
        })
        marker.on("click ", function (evt: any) {
          const extraData = evt.target.options.extraData
          // 经纬度相同的设备
          let samePositionDevices = deviceList.filter((item: any) => {
            return item.latitude === extraData.latitude && item.longitude === extraData.longitude
          })
          setSelectDeviceList(val => {
            let arr: any = val ? val.concat(samePositionDevices) : samePositionDevices
            return _.uniqWith(arr, _.isEqual)
          })
        })
        return marker
      })
      group = L.featureGroup(markerList).addTo(map2d.map);
    }
    return () => {
      group?.remove()
    }
  }, [map2d, deviceList])

  // 渲染场所范围
  useEffect(() => {
    let ctr: AbortController
    let layer: any
    async function main() {
      if (placeId && map2d) {
        ctr = new AbortController()
        const data = await getPlaceInfoById(placeId, ctr)
        const geoJson = JSON.parse(data.graph)
        if (geoJson.properties.subType === 'Circle') {
          layer = new L.Circle([geoJson.geometry.coordinates[1], geoJson.geometry.coordinates[0]], {
            radius: geoJson.properties.radius,
          })
        } else {
          layer = L.geoJson(geoJson)
        }
        layer.addTo(map2d.map)
      }
    }
    main()
    return () => {
      ctr?.abort()
      layer?.remove()
    }
  }, [placeId, map2d])

  // 绘制插件初始化
  useEffect(() => {
    if (map2d) {
      map2d.map.pm.addControls({
        position: 'topright',
        drawMarker: false,
        drawText: false,
        drawCircleMarker: false,
        cutPolygon: false,
        drawPolyline: false,
        rotateMode: false,
        removalMode: false,
        editMode: false,
        dragMode: false
      });
      map2d.map.pm.setLang('zh');
      map2d.map.on('pm:create', function (e: any) {
        const rectangleGeoJson = e.layer.toGeoJSON();
        let result: any[] = []
        //特殊处理圆形
        if (e.shape === 'Circle') {
          result = _.filter(deviceList, device => {
            const radius = e.layer.getRadius()
            return isPointInCircle(device.latLng, rectangleGeoJson.geometry.coordinates, radius)
          })
        }
        else {
          result = _.filter(deviceList, device => {
            return isPointInPolygon(device.latLng, rectangleGeoJson.geometry.coordinates)
          })
        }

        // 追加选择设备
        setSelectDeviceList(val => {
          if (val) {
            const addList = _.filter(result, device => {
              return !val.some(ele => ele.id === device.id)
            })
            if (addList.length === 0) {
              return val
            } else {
              return [...val, ...addList]
            }
          } else {
            if (result.length > 0) {
              return result
            } else {
              return val
            }
          }
        })

        // 只保留当前创建的范围
        const layers = map2d.map.pm.getGeomanLayers().filter((item: any) => item.options.pane === 'overlayPane')
        const needRemoveLayers = _.filter(layers, (ele: any) => ele._leaflet_id !== e.layer._leaflet_id)
        needRemoveLayers.forEach((ele: any) => {
          ele.pm.remove()
        });

      });
    }
    return () => {
      map2d?.map.pm.removeControls()
    }
  }, [map2d, deviceList])


  const handleDeviceType = useCallback(
    (value: any) => {
      setDeviceTypes(value)
    },
    [],
  )

  const handleDelete = useCallback(
    (item: any) => {
      setSelectDeviceList(val => {
        if (val) {
          const _val = [...val]
          _.remove(_val, ele => ele.id === item.id)
          return _val
        } else {
          return val
        }
      })
    },
    [],
  )

  const handleFinish = useCallback(
    () => {
      const result = selectDeviceList || []
      onFinish && onFinish(result)
      onClosePopup && onClosePopup()
    },
    [onFinish, onClosePopup, selectDeviceList],
  )

  const handleCancel = useCallback(
    () => {
      onClosePopup && onClosePopup()
    },
    [onClosePopup],
  )

  const handleDevice = useCallback(
    (item: any) => {
      map2d && map2d.map.setView(item.latLng)
    },
    [map2d],
  )


  return (
    <article className={styles.wapper}>
      <section className={styles.map} ref={mapRef}></section>
      <article className={styles.panel}>
        <header className={styles.head}>
          <SelectRemote
            width={320}
            request={doGetDeviceType}
            onChange={handleDeviceType}
            mode='tags'
            maxTagCount={2}
            placeholder='所有设备类型'
          />
        </header>
        <section className={styles.content}>
          {selectDeviceList && selectDeviceList.map(item =>
            <article className={styles.deviceCard} key={item.id}>
              <header onClick={() => handleDevice(item)}>{item.name}</header>
              <section>{item.deviceTypeName}</section>
              <footer>
                <Popconfirm
                  title="确认删除该项吗?"
                  onConfirm={() => { handleDelete(item) }}
                >
                  <span className={styles.delete}>删除</span>
                </Popconfirm>
              </footer>
            </article>
          )}
          {!selectDeviceList &&
            <div className={styles.alt}>请在地图上个选择设备</div>
          }
        </section>
      </article>
      <footer>
        <Space>
          <Button className={styles.btn} onClick={handleCancel}>取消</Button>
          <Button type="primary" onClick={handleFinish}>确定</Button>
        </Space>
      </footer>
    </article>
  )
}

export default MapSelectDeviceList