import { Form, Spin } from "antd";
import dayjs from "dayjs";
import { HotDateTypeDict, HotTypeDict } from "helper/dictionary";
import Map2D, { MapTileType } from "helper/Map2D";
import { InputType } from "hooks/flexibility/FormPanel";
import FormInterface from "hooks/integrity/FormInterface";
import _ from "lodash";
import { useCallback, useEffect, useRef, useState } from "react";
import { getDeviceDictByDataType } from "server/device";
import { getHotMapData } from "server/search";
import CanvasPane from "webgis/extendUntils/layer/CanvasPane";
import { CircleParams, createCircleGroup, createLineGroup, LineParams } from "webgis/untils/canvasDraw";
import styles from "./index.module.sass";


const initSearchData = {
  hotType: 1,
  dataType: 0,
  range: [dayjs().subtract(1, 'd'), dayjs()]
}

const inputs = [
  ['热力图类型', 'hotType', InputType.select, { dict: HotTypeDict, allowClear: false }],
  ['时间', 'range', InputType.dateTimeRange],
  ['数据类型', 'dataType', InputType.select, { dict: HotDateTypeDict, allowClear: false }],
  ['设备', 'deviceList', InputType.selectMultipleRemote, {
    remote: getDeviceDictByDataType,
    minWidth: 180,
    maxTagCount: 2,
    watchKey: 'dataType'
  }]
]

const HotData: React.FC = () => {
  console.debug('HotData')


  const [form] = Form.useForm()


  const mapRef = useRef(null)


  const [map2d, setMap2D] = useState<Map2D>()
  const [searchData, setSearchData] = useState(undefined)
  const [canvasLayer, setCanvasLayer] = useState<CanvasPane>()
  const [data, setData] = useState<any[]>()
  const [type, setType] = useState(1)
  const [isLoading, setIsLoading] = useState(false)


  // 初始化地图
  useEffect(() => {
    let _map2d: Map2D
    if (mapRef.current) {
      _map2d = new Map2D(mapRef.current, MapTileType.satellite)
      const _canvasLayer = _map2d.createCanvasPane()
      setCanvasLayer(_canvasLayer)
      setMap2D(_map2d)
    }
    return () => {
      _map2d?.map.remove()
    }
  }, [])

  // 请求数据
  useEffect(() => {
    let ctr: AbortController
    async function main() {
      try {
        if (map2d && searchData) {
          ctr = new AbortController()
          setIsLoading(true)
          const vo = await getHotMapData(searchData, ctr)
          setData(vo)
        }
      } finally {
        setIsLoading(false)
      }
    }
    main()
    return () => {
      ctr && ctr.abort()
    }
  }, [searchData, map2d, canvasLayer])

  // 根据热力图类型渲染
  useEffect(() => {
    if (map2d && canvasLayer && data) {
      if (type === 1) { // 线
        const lineList: LineParams[] = []
        _.forIn(data, (points: any[]) => {
          const lineLatLngList = points.map((ele: any) => ({ lat: ele.latitude, lng: ele.longitude }))
          const lineParams: LineParams = {
            latLngList: lineLatLngList,
            color: 'rgba(255, 255, 255, 0.5)'
          }
          lineList.push(lineParams)
        })
        canvasLayer.addDrawFn(info => {
          createLineGroup(lineList, info.canvas, map2d)
        })
      } else { // 点
        const circleList: CircleParams[] = []
        _.forIn(data, (points: any[]) => {
          points.forEach((ele: any) => {
            const latLng = { lat: ele.latitude, lng: ele.longitude }
            const circleParams: CircleParams = {
              latLng: latLng,
              radius: 2,
              color: 'rgba(255, 255, 255, 0.1)'
            }
            circleList.push(circleParams)
          })
        })
        canvasLayer.addDrawFn(info => {
          createCircleGroup(circleList, info.canvas, map2d)
        })
      }
    }
    return () => {
      if (canvasLayer) {
        canvasLayer.clearDrawFn()
        canvasLayer.clearContent()
      }
    }
  }, [map2d, canvasLayer, data, type])


  // 监听热力图类型切换
  const handleFieldsChange = useCallback(
    (values: any) => {
      const [item] = values
      const [key] = item.name
      if (key === 'hotType') {
        setType(item.value)
      }
    },
    [],
  )

  const handleFinish = useCallback(
    async (params: any) => {
      setSearchData(params)
    },
    [],
  )


  return (
    <article className={styles.wrapper}>
      <header className={styles.searchBox}>
        <FormInterface
          queryForm={form}
          initData={initSearchData}
          inputs={inputs}
          options={{
            isNotShowFooter: true,
            isShowItemButton: true
          }}
          formProps={{
            layout: 'inline',
            onFieldsChange: handleFieldsChange
          }}
          onAsyncFinish={handleFinish}
        />
      </header>
      <section className={styles.mapBox} ref={mapRef}></section>
      {isLoading &&
        <div className={styles.loading}>
          <Spin tip="加载数据中" size="large"></Spin>
        </div>
      }
    </article>
  )
}

export default HotData