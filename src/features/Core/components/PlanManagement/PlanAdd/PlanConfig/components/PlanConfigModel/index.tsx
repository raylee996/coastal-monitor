import Title from "component/Title"
import Flowgraph from "features/Core/components/WisdomModel/component/flowgraph"
import createElementByComponent from "helper/elementComponent";
import _ from "lodash";
import { useEffect, useState } from "react";
import { getAreaListByIds } from "server/core/controlManage";
import { getModelDetailAsync } from "server/core/model";
import styles from './index.module.sass'

interface Props {
    basicInfo: any
    map2D: any,
    getEventId: (eventId: string) => void
}
// 模型预览
const PlanConfigModel: React.FC<Props> = ({
    basicInfo,
    map2D,
    getEventId
}) => {

    const [modelData, setModelData] = useState<any>();
    const [graphNodes, setGraphNodes] = useState<any>()

    useEffect(() => {
        async function main() {
            //获取详情
            getModelDetailAsync(basicInfo.modelId).then(res => {
                setModelData(res.originalJson)
                setGraphNodes(JSON.parse(res.modelJson).eventParams)
            })
        }
        main()
    }, [basicInfo])

    // 获取模型区域
    useEffect(() => {
        const layers: any[] = []
        async function main() {
            if (map2D && graphNodes) {
                const nodes = _.cloneDeep(graphNodes)
                // 获取所有区域
                let ids: number[] = []
                nodes.forEach((item: any) => {
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
                        const popupContent = createElementByComponent(<>{`区域名称：${item.name}`}</>)
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

                        layer.addTo(map2D.map)
                        layers.push(layer)
                    })

                }
            }
        }
        main()
        return () => {
            layers.forEach(layer => layer.remove())
        }
    }, [map2D, graphNodes])

    // 获取节点的eventId
    function handleNodeClick(data: any) {
        getEventId && getEventId(data.data.eventId)
    }

    return <div>
        <div className={styles.modleTitle}>
            <Title title="模型预警" />
            <span className={styles.modelTips}>按住键盘Shift和鼠标左键可拖动画布</span>
        </div>
        <Flowgraph
            showCondition={false}
            data={modelData}
            isNotShowConditionParams={true}
            isNotShowRemoveBtn={true}
            isShowMask={true}
            graphHeight='280px'
            isGraphCenter={true}
            onNodeClick={handleNodeClick}
        />
    </div>
}

export default PlanConfigModel