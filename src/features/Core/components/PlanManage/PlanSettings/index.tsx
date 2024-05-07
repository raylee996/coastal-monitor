import { Button, message } from "antd";
import { editPlan } from "api/core/planManagement";
import { useAppDispatch, useAppSelector } from "app/hooks";
import Map2D, { MapTileType } from "helper/Map2D";
import _ from "lodash";
import { useCallback, useEffect, useRef, useState } from "react";
import { getAreaListByIds } from "server/core/controlManage";
import { addPlanAsync } from "server/core/planManage";
import { clear, selectValue, set } from "slice/planConfigSlice";
import createElementByComponent from "webgis/untils/elementComponent";
import Flowgraph from "../../WisdomModel/component/flowgraph";
import DealWith from "./components/DealWith";
import styles from './index.module.sass'


interface Props {
  onClosePopup?: Function
  //点击确定，跳转到下一步
  nextStep?: Function
  //事件集合
  totalItem?: any[]
  //表单基础信息
  basicInfo: any
  //新增完成后返回的ID
  setDataId?: Function
  // 流程图数据
  graphData?: any
}

const PlanSettings: React.FC<Props> = ({ onClosePopup, basicInfo, totalItem, nextStep, setDataId, graphData }) => {
  console.debug('PlanSettings')

  const dispatch = useAppDispatch()
  const planConfig = useAppSelector(selectValue)

  const flowgraphRef = useRef<any>()

  const mapRef = useRef<HTMLDivElement>(null)
  const [map2d, setMap2d] = useState<Map2D>();
  const [layerList, setLayerList] = useState<any[]>()
  const [isShowDealWith, setIsShowDealWith] = useState(false)
  const [eventIds, setEventIds] = useState<string[]>([])


  //新增，存储全局变量
  useEffect(() => {
    if (!basicInfo.id) {
      const result = totalItem ? totalItem.map(ele => ({
        ...ele,
        actions: [],
        // actions: [{
        //   uniqueId: _.uniqueId(),
        //   data: {
        //     ...initData1,
        //     type: '1'
        //   }
        // }]
      })) : []
      dispatch(set(result))
    }

    return () => {
      dispatch(clear())
    }
  }, [totalItem, dispatch, basicInfo])


  // 编辑，修改全局变量
  useEffect(() => {
    if (basicInfo && basicInfo.planSettingJsons && basicInfo.planSettingJsons.length > 0 && totalItem && totalItem.length > 0) {

      let result: any[] = [];
      for (let i = 0; i < totalItem.length; i++) {
        let params = totalItem[i];
        let actionsList = basicInfo.planSettingJsons.filter((item: any) => {
          return params.eventId === item.eventId
        })

        let actions = []
        if (actionsList.length > 0) {
          for (let j = 0; j < actionsList.length; j++) {
            actions.push({
              data: { ...actionsList[j], type: actionsList[j].typeId },
              uniqueId: _.uniqueId()
            })
          }
        }
        result.push({
          actions,
          ...params
        })
      }

      dispatch(set(result))

      return () => {
        dispatch(clear())
      }
    }

  }, [basicInfo, totalItem, dispatch])


  //渲染地图
  useEffect(() => {
    let _map2d: Map2D
    if (mapRef.current) {
      _map2d = new Map2D(mapRef.current, MapTileType.satellite)
      setMap2d(_map2d)
    }
    return () => {
      _map2d && _map2d.remove()
    }
  }, [])

  // 获取模型区域
  useEffect(() => {
    const layers: any[] = []
    async function main() {
      if (map2d && totalItem) {
        const nodes = _.cloneDeep(totalItem)
        // 获取所有区域
        let ids: number[] = []
        nodes.forEach(item => {
          if (item.attributeJson.areaId) {
            ids = ids.concat(item.attributeJson.areaId)
          }
          if (item.attributeJson.lineId) {
            ids = ids.concat(item.attributeJson.lineId)
          }
        })

        if (ids.length !== 0) {

          ids = _.uniq(ids)
          const idsStr = ids.toString()
          const allArea = await getAreaListByIds(idsStr)

          // 根据区域大小排序区域、避免大区域覆盖小区域从而无法点击小区域
          allArea.forEach(item => {
            const graphObj = JSON.parse(item.graph)
            item.graphObj = graphObj
            if (graphObj.geometry.type === 'Polygon') {
              item.layerType = 'Polygon'
              const [target] = graphObj.geometry.coordinates
              const pointList = target.map(([lng, lat]: any[]) => [lat, lng])
              const polygon = turf.polygon([pointList]);
              item.size = turf.area(polygon)
            } else if (graphObj.properties.subType === 'Circle') {
              item.layerType = 'Circle'
              item.size = 3.14 * graphObj.properties.radius * graphObj.properties.radius
            } else if (graphObj.properties.subType === 'Line') {
              item.layerType = 'Line'
              item.size = 1
            }
          })
          const areaList = allArea.sort((a, b) => b.size - a.size)

          areaList.forEach(item => {
            let layer: any

            if (item.layerType === 'Circle') {
              layer = new L.Circle([item.graphObj.geometry.coordinates[1], item.graphObj.geometry.coordinates[0]], {
                radius: item.graphObj.properties.radius,
              })
            } else {
              layer = L.geoJson(item.graphObj)
            }

            const nodeList = _.filter(nodes, ele => ele.attributeJson.areaId?.includes(item.id) || ele.attributeJson.lineId?.includes(item.id))
            const ids = nodeList.map(ele => ele.eventId)
            const popupContent = createElementByComponent(<DealWith eventIds={ids} title={`区域名称：${item.name}`} />)
            const tooltipContent = nodeList.map(ele => ele.eventName).toString()

            layer.options.nodeList = nodeList
            layer.options.area = item
            layer.bindPopup(popupContent, { className: 'leaflet-popup-ui', minWidth: 320, autoPan: false })
            layer.bindTooltip(tooltipContent, { permanent: true, className: styles.tooltip })

            layer
              .on('mouseover', (evt: any) => {
                evt.target.unbindTooltip()
                evt.target.bindTooltip(tooltipContent, { sticky: true, className: styles.tooltip }).openTooltip()
                evt.target.setStyle({ fillOpacity: 0.4 })
              })
              .on('mouseout', (evt: any) => {
                evt.target.unbindTooltip()
                evt.target.bindTooltip(tooltipContent, { permanent: true, className: styles.tooltip })
                evt.target.setStyle({ fillOpacity: 0.2 })
              })
              .on('click', () => {
                setIsShowDealWith(false)
                flowgraphRef.current && flowgraphRef.current.cancelSelection()
              })

            layer.addTo(map2d.map)
            layers.push(layer)
          })

        }
      }
      setLayerList(layers)
    }
    main()
    return () => {
      layers.forEach(layer => layer.remove())
    }
  }, [map2d, totalItem])

  const handleNodeClick = useCallback((param: any) => {
    if (layerList && layerList.length !== 0) {
      if ((param.data.areaId || param.data.lineId) && map2d) {
        const _areaId = param.data.areaId ? _.head(param.data.areaId) : _.head(param.data.lineId)
        const layer = layerList.find(ele => ele.options.area.id === _areaId)
        if (layer) {
          map2d.map.fitBounds(layer.getBounds())
          layer.openPopup()
        }
        setIsShowDealWith(false)
      } else {
        layerList.forEach(ele => ele.closePopup())
        setIsShowDealWith(true)
        setEventIds([param.data.eventId])
      }
    }
  }, [map2d, layerList])

  function handleCancel() {
    onClosePopup && onClosePopup()
  }

  async function handleNext() {
    const planSettingJson: any[] = []
    planConfig.forEach(item => {
      item.actions.forEach((ele: any) => {
        const data = _.omit(ele.data, 'type')
        planSettingJson.push({
          ...data,
          eventId: item.eventId,
          eventName: item.eventName,
          typeId: ele.data.type
        })
      })
    })
    const data = {
      ...basicInfo,
      planSettingJsons: planSettingJson
    }
    if (basicInfo && basicInfo.id) {
      await editPlan(data)
      setDataId && setDataId(basicInfo.id)
      nextStep && nextStep(2)
    } else {
      let id: any = await addPlanAsync(data)
      setDataId && setDataId(id)
      nextStep && nextStep(2)
    }
  }

  // 保存
  async function handleSave() {
    const planSettingJson: any[] = []
    planConfig.forEach(item => {
      item.actions.forEach((ele: any) => {
        const data = _.omit(ele.data, 'type')
        planSettingJson.push({
          ...data,
          eventId: item.eventId,
          eventName: item.eventName,
          typeId: ele.data.type
        })
      })
    })
    const data = {
      ...basicInfo,
      planSettingJsons: planSettingJson
    }
    try {
      await editPlan(data)
      message.success('保存成功')
    } catch (error) {
      message.error('保存失败')
    }
  }

  function handlePrev() {
    nextStep && nextStep(0)
  }


  // const flowgraphData = useEffect(() => graphData, [graphData])

  return (
    <article className={styles.wrapper}>
      <section className={styles.map} ref={mapRef}></section>

      <section className={styles.model}>
        <Flowgraph
          ref={flowgraphRef}
          showCondition={false}
          data={graphData}
          isNotShowConditionParams={true}
          isNotShowRemoveBtn={true}
          onNodeClick={handleNodeClick}
        />
      </section>

      {isShowDealWith &&
        <section className={styles.dealWith}>
          <DealWith eventIds={eventIds} />
        </section>
      }

      <div className={styles.bottom}>
        <Button type={"primary"} onClick={handlePrev}>上一步</Button>
        <Button className={styles.cancel} type={"default"} onClick={handleCancel}>取消</Button>
        <Button className={styles.cancel} type={"primary"} onClick={handleNext}>下一步</Button>
        {basicInfo && basicInfo.id &&
          <Button className={styles.cancel} type="primary" onClick={handleSave}>保存</Button>}
      </div>
    </article>
  )
}

export default PlanSettings