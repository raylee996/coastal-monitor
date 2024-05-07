import CoastalMonitorWebgis from "helper/map";
import { getCRSByMapType, MapType } from "helper/map/crsUtil";
import getMapOffLineDate from "helper/map/getMap";
import _ from "lodash";
import { useEffect, useRef, useState } from "react";
import { Button } from 'antd'
import { getAreaListByIds } from "server/core/controlManage";
import { getModelDetailAsync } from "server/core/model";
import Flowgraph from "../flowgraph";
import styles from './index.module.sass'
import { CaretRightOutlined, PauseOutlined } from "@ant-design/icons";

interface Props {
    // 直接传入流程图数据
    graphData?: any
    // 用模型ID获取流程图数据
    modelId?: string | number
}

// 模型预演
const PreviewModel: React.FC<Props> = ({ graphData, modelId }) => {
    // 地图相关
    const mapRef = useRef<HTMLDivElement>(null)
    const [mapLeaflet, setMapLeaflet] = useState<CoastalMonitorWebgis>()

    // 流程图数据
    const [modelData, setModelData] = useState(graphData || null)

    // 播放
    const [isPlay, setIsPlay] = useState<boolean>(false)


    // 地图实例化
    useEffect(() => {
        let _mapLeaflet: CoastalMonitorWebgis
        if (mapRef.current) {
            const crs = getCRSByMapType(MapType.SatelliteMap);
            _mapLeaflet = new CoastalMonitorWebgis(mapRef.current, { crs, zoom: 12, minZoom: 3, maxZoom: 16 })
            getMapOffLineDate(MapType.SatelliteMap).addTo(_mapLeaflet.map);
            setMapLeaflet(_mapLeaflet)
        }
        return () => {
            _mapLeaflet?.map?.remove()
        }
    }, [])

    // 使用模型ID获取流程图数据
    useEffect(() => {
        function main() {
            //获取详情
            getModelDetailAsync(modelId).then(res => {
                setModelData(res.originalJson)
            })
        }
        if (modelId) {
            main()
        }
    })

    // 获取模型区域,划区域图形
    useEffect(() => {
        const layers: any[] = []
        async function main() {
            if (mapLeaflet) {
                let nodes: any[] = []
                //获取节点
                await getModelDetailAsync(modelId).then(res => {
                    nodes = _.cloneDeep(JSON.parse(res.modelJson).eventParams)
                })
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

                        layer.options.nodeList = nodeList
                        layer.options.area = item
                        layer.addTo(mapLeaflet.map)
                        layers.push(layer)
                    })

                }
            }
        }
        main()
        return () => {
            layers.forEach(layer => layer.remove())
        }
    }, [mapLeaflet, modelId])

    // 播放
    function handlerPlay() {
        setIsPlay((val) => {
            return !val
        })
    }

    return <div className={styles.wrapper}>
        {/* 放置地图 */}
        <div ref={mapRef} className={styles.mapContainer}></div>
        {/* 放置模型 */}
        <div className={styles.flowData}>
            <Flowgraph
                showCondition={false}
                data={modelData}
                isNotShowConditionParams={true}
                isNotShowRemoveBtn={true}
            />
        </div>
        {/* 右侧操作按钮 */}
        <div className={styles.rightBtns}>
            <div className={styles.playBtn} onClick={handlerPlay}>
                {isPlay ? <PauseOutlined /> : <CaretRightOutlined />}
            </div>
            <Button type={'default'}>生成预案</Button>
        </div>
    </div>
}

export default PreviewModel