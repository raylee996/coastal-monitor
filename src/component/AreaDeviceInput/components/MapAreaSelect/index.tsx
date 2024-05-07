import { Button, Modal, PaginationProps, TableProps } from "antd";
import { AreaDeviceValueType } from "component/AreaDeviceInput";
import Map2D, { MapTileType } from "helper/Map2D";
import { getIconByDeviceType } from "helper/mapIcon";
import { ActionType } from "hooks/flexibility/TablePanel";
import TableInterface from "hooks/integrity/TableInterface";
import _ from "lodash";
import { Key, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { deleteAreaServe } from "server/core/controlManage";
import { getAllDevice } from "server/device";
import MapAreaInfo from "../MapAreaInfo";
import styles from "./index.module.sass";


const paginationProps: PaginationProps = {
  size: 'small',
  simple: true
}

interface Props {
  areaList?: any[]
  value?: AreaDeviceValueType
  onChange?: (val: AreaDeviceValueType) => void
  onUpdate: () => Promise<any>
}

const MapAreaSelect: React.FC<Props> = ({ areaList, value, onChange, onUpdate }) => {
  console.debug('MapAreaSelect')


  const mapRef = useRef<HTMLElement>(null)


  const [map2d, setMap2D] = useState<Map2D>()
  const [deviceList, setDeviceList] = useState<any[]>()
  const [isOpenAreaInfo, setIsOpenAreaInfo] = useState(false)
  const [title, setTitle] = useState('')
  const [areaData, setAreaData] = useState<any>()


  // 初始化地图
  useEffect(() => {
    let _map2d: Map2D
    const timer = setTimeout(() => {
      if (mapRef.current) {
        _map2d = new Map2D(mapRef.current, MapTileType.satellite)
        setMap2D(_map2d)
      }
    }, 1000);
    return () => {
      _map2d?.map?.remove()
      clearTimeout(timer)
    }
  }, [])

  // 初始化设备数据
  useEffect(() => {
    let ctr: AbortController
    async function main() {
      ctr = new AbortController()
      const _deviceList = await getAllDevice(ctr)
      setDeviceList(_deviceList)
    }
    main()
    return () => {
      ctr?.abort()
    }
  }, [])

  // 渲染设备
  useEffect(() => {
    let layerGroup: any
    if (map2d && value && areaList && deviceList) {
      layerGroup = L.layerGroup()
      let deviceCodeList: string[] = []
      if (Array.isArray(value)) {

      } else {
        const target = areaList.find(item => item.id === value)
        if (target?.deviceCodes) {
          const deviceCodes = target.deviceCodes.split(',')
          deviceCodeList = deviceCodeList.concat(deviceCodes)
        }
      }

      let latlngs: any[] = []
      if (deviceCodeList.length) {
        const result = _.filter(deviceList, item => deviceCodeList.includes(item.deviceCode))
        result.forEach(item => {
          const deviceType = String(item.deviceType)
          const cameraType = Number(item.cameraType)
          const icon = getIconByDeviceType(deviceType, cameraType)
          const latLng = {
            lat: item.latitude,
            lng: item.longitude
          }
          latlngs.push([item.latitude, item.longitude])
          const marker = L.marker(latLng, {
            icon
          })
          layerGroup.addLayer(marker)
        })
      }
      layerGroup.addTo(map2d.map)
      latlngs.length && map2d.map.fitBounds(latlngs)
    }
    return () => {
      layerGroup?.clearLayers()
    }
  }, [map2d, value, areaList, deviceList])


  // 渲染区域
  useEffect(() => {
    const layerGroup = L.layerGroup()
    const getLayer = (graph: string) => {
      const jsonObj = JSON.parse(graph)
      console.log(jsonObj)
      let layer: any
      if (jsonObj.properties.subType === 'Circle') {
        layer = new L.Circle([jsonObj.geometry.coordinates[1], jsonObj.geometry.coordinates[0]], {
          radius: jsonObj.properties.radius,
          color: jsonObj.properties.borderColor, //颜色
          fillColor: jsonObj.properties.background,
          fillOpacity: 0.4, //透明度
        })
      } else if (jsonObj.geometry.type === 'Point') {
        layer = L.circleMarker([jsonObj.geometry.coordinates[1], jsonObj.geometry.coordinates[0]], {
          pane: 'markerPane',
          radius: 4,
          fillColor: '#f5222d',
          fillOpacity: 1,
          weight: 0
        })
      } else {
        // layer = L.geoJson(jsonObj)
        layer = L.geoJson(jsonObj).addTo(map2d?.map)
        map2d?.map.panTo(layer.getBounds().getCenter())
        //边框、背景颜色回显
        layer.setStyle({
          color: jsonObj.properties.borderColor,
          fillColor: jsonObj.properties.background,
          fillOpacity: 0.4
        })
      }
      return layer
    }

    if (map2d && areaList && value) {
      if (Array.isArray(value)) {
        const targetList = _.filter(areaList, item => value.includes(item.id))
        targetList.forEach(item => {
          if (item.graph) {
            const layer = getLayer(item.graph)
            layerGroup.addLayer(layer)
          }
        })
      } else {
        const target = areaList.find(item => item.id === value)
        if (target?.graph) {
          const layer = getLayer(target.graph)
          layerGroup.addLayer(layer)
        }
      }
      layerGroup.addTo(map2d.map)
      let latlngs = []
      for (let i = 0; i < areaList.length; i++) {
        let graphJson = JSON.parse(areaList[i].graphJson);
        let latlng = graphJson && graphJson.coordinates;
        if (graphJson && graphJson.radius > 0) {
          // 圆形
          latlng && latlngs.push(latlng)
        } else {
          latlng && latlngs.push(...latlng)
        }
      }
      let latlngArr = latlngs.map((item: number[]) => [item[1], item[0]])
      layerGroup && map2d.map.fitBounds(latlngArr)
    }
    return () => {
      layerGroup.clearLayers()
    }
  }, [map2d, value, areaList])


  const tableProps = useMemo<TableProps<any>>(() => {
    const selectedRowKeys = value ? (Array.isArray(value) ? value : [value]) : []

    const handleRadioChange = (_selectedRowKeys: Key[], selectedRows: any[]) => {
      const [record] = selectedRows
      onChange && onChange(record.id)
    }

    return {
      size: 'small',
      rowSelection: {
        type: 'radio',
        selectedRowKeys,
        onChange: handleRadioChange
      }
    }
  }, [value, onChange])


  const columns = useMemo(() => [
    ['区域名称', 'name'],
    [
      ['编辑', (data: any) => {
        setTitle('编辑区域')
        setAreaData(data)
        setIsOpenAreaInfo(true)
      }],
      ['删除', ActionType.confirm, async (data: any) => {
        await deleteAreaServe(data.id)
        onUpdate()
      }]
    ]
  ], [onUpdate])


  const handleCloseAreaInfo = useCallback(
    () => {
      setIsOpenAreaInfo(false)
    },
    [],
  )

  const handleAddArea = useCallback(
    () => {
      setTitle('新增区域')
      setAreaData(undefined)
      setIsOpenAreaInfo(true)
    },
    [],
  )

  const handleAreaInfoSuccess = useCallback(
    () => {
      setIsOpenAreaInfo(false)
      onUpdate()
    },
    [onUpdate],
  )



  return (
    <article className={styles.wrapper}>
      <section className={styles.map} ref={mapRef}></section>
      <article className={styles.table}>
        <header>
          <Button size="small" onClick={handleAddArea}>新增区域</Button>
        </header>
        <section>
          <TableInterface
            columns={columns}
            tableProps={tableProps}
            tableDataSource={areaList}
            paginationProps={paginationProps}
          />
        </section>
      </article>
      <Modal
        title={title}
        footer={false}
        width={1366}
        open={isOpenAreaInfo}
        onCancel={handleCloseAreaInfo}
        mask={false}
        maskClosable={false}
        destroyOnClose={true}
      >
        <MapAreaInfo
          deviceList={deviceList}
          areaData={areaData}
          onSuccess={handleAreaInfoSuccess}
        />
      </Modal>
    </article>
  )
}

export default MapAreaSelect