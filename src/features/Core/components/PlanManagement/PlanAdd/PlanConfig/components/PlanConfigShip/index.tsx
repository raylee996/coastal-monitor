import { Col, Row, Image } from 'antd'
import Title from 'component/Title'
import { useEffect, useState } from 'react'
import { getAreaOne } from 'server/core/controlManage'
import { planGetAllControlList } from 'server/core/planManagement'
import styles from './index.module.sass'

interface Props {
    basicInfo: any
    map2D: any
}
// 船舶布控配置
const PlanConfigShip: React.FC<Props> = ({ basicInfo, map2D }) => {
    const [shipRecord, setShipRecord] = useState<any>()
    const [areaList, setAreaList] = useState<any[]>([])

    useEffect(() => {
        async function main() {
            let shipControlList = await planGetAllControlList()
            if (shipControlList) {
                let res = shipControlList.find((item: any) => item.id === basicInfo.shipControlName)
                setShipRecord(res)
            }
        }
        main()
    }, [basicInfo])

    useEffect(() => {
        async function main() {
            if (!shipRecord?.areaId) {
                return
            }
            const vo = await getAreaOne({ id: shipRecord.areaId })
            vo && setAreaList([vo])
        }
        main()
    }, [map2D, shipRecord])

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

    return <div className={styles.info}>
        {shipRecord && <div className={styles.bottomRight}>
            <div className={styles.warningBox}>
                <Title title={'预警条件'} />
                <div className={styles.warnContent}>
                    <div>预警条件：</div>
                    <div>{shipRecord.shipConditionJson.alarmConditionName + (shipRecord.shipConditionJson.alarmCondition === '3' ? ` , 航速大于${shipRecord.shipConditionJson.speed || 0}节` : '')}</div>
                </div>
            </div>
            <div className={'Control__Detail__Box'}>
                <Title title={'布控内容'} />
                {
                    shipRecord.shipConditionJson.controlScope === '0' ? <span>所有船舶</span> :
                        <>
                            <Row className={styles.labelRow}>
                                <Col span={6} className={styles.borderCol}>内容类型</Col>
                                <Col span={18}>布控内容</Col>
                            </Row>
                            <Row className={styles.rowCommon}>
                                <Col span={6} className={styles.borderCol}>船名</Col>
                                <Col span={18} className={styles.detailContent} title={shipRecord.shipConditionJson.alarmConditionShipNames}>{shipRecord.shipConditionJson.alarmConditionShipNames || '--'}</Col>
                            </Row>
                            <Row className={`${styles.rowTowCommon}`}>
                                <Col span={6} className={styles.borderCol}>MMSI</Col>
                                <Col span={18} className={styles.detailContent} title={shipRecord.shipConditionJson.alarmConditionShipMmsis}>{shipRecord.shipConditionJson.alarmConditionShipMmsis || '--'}</Col>
                            </Row>
                            <Row className={`${styles.rowCommon}`}>
                                <Col span={6} className={styles.borderCol}>船脸</Col>
                                <Col span={18}>
                                    {
                                        shipRecord.shipConditionJson?.alarmConditionShipFaceIds?.length ? shipRecord.shipConditionJson.alarmConditionShipFaceIds.map((item: string | undefined) => {
                                            return <Image width={60} src={item} />
                                        }) : '--'
                                    }
                                </Col>
                            </Row>
                        </>
                }
            </div>
        </div>}
    </div>
}

export default PlanConfigShip