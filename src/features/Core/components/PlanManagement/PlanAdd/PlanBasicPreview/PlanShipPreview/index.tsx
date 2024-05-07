import { Col, Row, Image } from "antd";
import Title from "component/Title"
import Map2D, { MapTileType } from "helper/Map2D"
import { useEffect, useRef, useState } from "react"
import { getAreaOne } from "server/core/controlManage"
import { planGetAllControlList } from "server/core/planManagement";
import styles from './index.module.sass'

interface Props {
    data: any
}
// 船舶布控预览
const PlanShipPreview: React.FC<Props> = ({ data }) => {
    console.debug('PlanShipPreview')
    const mapRef = useRef<HTMLDivElement>(null)
    const [map2D, setMap2D] = useState<Map2D>();
    const [areaList, setAreaList] = useState<any[]>([])

    const [record, setRecord] = useState<any>()

    // 初始化地图实例
    useEffect(() => {
        let _map2d: Map2D
        if (mapRef.current) {
            _map2d = new Map2D(mapRef.current, MapTileType.satellite)
            setMap2D(_map2d)
        }
        return () => {
            _map2d && _map2d.remove()
        }
    }, [])

    useEffect(() => {
        async function main() {
            const vo = await getAreaOne({ id: data.areaId })
            vo && setAreaList([vo])
            setRecord(null)
        }
        main()
    }, [data, map2D])

    useEffect(() => {
        async function main(id: any) {
            let vo = await planGetAllControlList()
            if (vo) {
                let res = vo.find((item: any) => item.id === id)
                setRecord(res)
            }
        }
        if (data.id) {
            setRecord(null)
            main(data.id)
        }
    }, [data])


    // 渲染区域
    useEffect(() => {
        const layers: any[] = []
        if (map2D && areaList?.length) {
            areaList.map(item => {
                if (item?.properties?.subType === 'Circle') {
                    let circle = new L.Circle([item.geometry.coordinates[1], item.geometry.coordinates[0]], {
                        radius: item.properties.radius,
                        color: item.properties.borderColor, //颜色
                        fillColor: item.properties.background,
                        fillOpacity: 0.4, //透明度
                    });
                    circle.addTo(map2D.map);
                    map2D.map.panTo(circle.getBounds().getCenter())
                    layers.push(circle)
                }
                else {
                    const areaLayer = L.geoJson(item).addTo(map2D.map)
                    map2D.map.panTo(areaLayer.getBounds().getCenter())
                    //边框、背景颜色回显
                    areaLayer.setStyle({
                        color: item.properties.borderColor,
                        fillColor: item.properties.background,
                        fillOpacity: 0.4
                    })
                    layers.push(areaLayer)
                }
                return item
            })
        }
        return () => {
            layers.forEach(item => item.remove())
        }
    }, [areaList, map2D])

    return <article className={styles.wrapper}>
        <div ref={mapRef} className={styles.drawMap}></div>
        {record && <div className={styles.info}>
            <div className={styles.bottomRight}>
                <div className={styles.warningBox}>
                    <Title title={'预警条件'} />
                    <div className={styles.warnContent}>
                        <div>预警条件：</div>
                        <div>{record.shipConditionJson.alarmConditionName + (record.shipConditionJson.alarmCondition === '3' ? ` , 航速大于${record.shipConditionJson.speed || 0}节` : '')}</div>
                    </div>
                </div>
                <div className={'Control__Detail__Box'}>
                    <Title title={'布控内容'} />
                    {
                        record.shipConditionJson.controlScope === '0' ? <span>所有船舶</span> :
                            <>
                                <Row className={styles.labelRow}>
                                    <Col span={6} className={styles.borderCol}>内容类型</Col>
                                    <Col span={18}>布控内容</Col>
                                </Row>
                                <Row className={styles.rowCommon}>
                                    <Col span={6} className={styles.borderCol}>船名</Col>
                                    <Col span={18} className={styles.detailContent} title={record.shipConditionJson.alarmConditionShipNames}>{record.shipConditionJson.alarmConditionShipNames || '--'}</Col>
                                </Row>
                                <Row className={`${styles.rowTowCommon}`}>
                                    <Col span={6} className={styles.borderCol}>MMSI</Col>
                                    <Col span={18} className={styles.detailContent} title={record.shipConditionJson.alarmConditionShipMmsis}>{record.shipConditionJson.alarmConditionShipMmsis || '--'}</Col>
                                </Row>
                                <Row className={`${styles.rowCommon}`}>
                                    <Col span={6} className={styles.borderCol}>船脸</Col>
                                    <Col span={18}>
                                        {
                                            record.shipConditionJson?.alarmConditionShipFaceIds?.length ? record.shipConditionJson.alarmConditionShipFaceIds.map((item: string | undefined) => {
                                                return <Image width={60} src={item} />
                                            }) : '--'
                                        }
                                    </Col>
                                </Row>
                            </>
                    }
                </div>
            </div>
        </div>}
    </article>
}

export default PlanShipPreview