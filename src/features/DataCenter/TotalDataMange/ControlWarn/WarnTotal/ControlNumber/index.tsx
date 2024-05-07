import { Row, Col, Card, Select } from 'antd'
import React, { useCallback, useEffect, useState } from 'react'
import { doGetContralStatistics, doGetStatisticsPlace, doGetWarningStatistics } from 'server/statistics'
import styles from './index.module.sass'
import './index.sass'
interface IControlNumber {
    // 布控场所下拉
    data?: any
}

const ControlNumber: React.FC<IControlNumber> = (props) => {

    // 布控
    const [controlData, setControlData] = useState<any>([{ label: '今日', num: 0 }, { label: '近3个月', num: 0 }, { label: '近1年', num: 0 }, { label: '总数', num: 0 }])
    const [placeData, setPlaceData] = useState<any>([])
    const [selectedPlace, setSelectedPlace] = useState<any>({})

    // 预警
    const [warningData, setWarningData] = useState<any>([{ label: '今日', num: 0 }, { label: '近3个月', num: 0 }, { label: '近1年', num: 0 }, { label: '总数', num: 0 }])
    const [warningPlaceData, setWarningPlaceData] = useState<any>([])
    const [selectedWarningPlace, setSelectedWarningPlace] = useState<any>({})


    useEffect(() => {
        // 布控-获取场所下拉数据
        async function main() {
            const placeSelectData = await doGetStatisticsPlace()
            // 布控场所
            setPlaceData(placeSelectData.data)

            // 预警场所
            setWarningPlaceData(placeSelectData.data)
        }
        main()
    }, [])


    // 布控总数
    const getContralData = useCallback(async () => {
        const placeSelectData = await doGetContralStatistics({
            areaId: selectedPlace ? selectedPlace.value : null,
            typeId: selectedPlace ? selectedPlace.typeId : null
        })

        setControlData(placeSelectData)
    }, [selectedPlace])

    useEffect(() => {
        // 选择场所后，获取布控总数
        getContralData()
    }, [selectedPlace, getContralData])

    function handleContralPlace(data?: any, option?: any) {
        setSelectedPlace(option)
    }

    // 预警总数
    const getWarningData = useCallback(async () => {
        const placeSelectData = await doGetWarningStatistics({
            areaId: selectedWarningPlace ? selectedWarningPlace.value : null,
            typeId: selectedWarningPlace ? selectedWarningPlace.typeId : null
        })

        setWarningData([{ label: '今日', num: placeSelectData.today }, { label: '近3个月', num: placeSelectData.threeMonth }, { label: '近1年', num: placeSelectData.year }, { label: '总数', num: placeSelectData.total }])
    }, [selectedWarningPlace])

    useEffect(() => {
        // 选择预警场所后，获取预警总数
        getWarningData()
    }, [selectedWarningPlace, getWarningData])

    // 预警场所选择
    function handleWarningPlace(data?: any, option?: any) {
        setSelectedWarningPlace(option)
    }

    return (
        <article className='controls'>
            <Row gutter={20}>
                <Col span={12}>
                    <Card title="布控总数" extra={
                        <Select style={{ width: "240px" }}
                            placeholder='全部'
                            options={placeData}
                            onChange={handleContralPlace}
                            allowClear
                            getPopupContainer={triggerNode => triggerNode.parentElement}
                        />
                    }>
                        <div className={styles.contents}>
                            {
                                controlData.length !== 0 ?
                                    controlData.map((item: any, index: number) => {
                                        return (
                                            <div key={'controlData_' + index} className={styles.imgs}>
                                                <p className={styles.nums}>{item.num}</p>
                                                <p className={styles.labels}>{item.label}</p>
                                            </div>
                                        )
                                    })
                                    :
                                    <></>
                            }

                        </div>
                    </Card>
                </Col>
                <Col span={12}>
                    <Card title="预警总数" extra={
                        <Select style={{ width: "240px" }}
                            placeholder='全部'
                            options={warningPlaceData}
                            onChange={handleWarningPlace}
                            allowClear
                            getPopupContainer={triggerNode => triggerNode.parentElement}
                        ></Select>
                    }>
                        <div className={styles.contents}>
                            {
                                warningData.length !== 0 ?
                                    warningData.map((item: any, index: number) => {
                                        return (
                                            <div key={'controlData_' + index} className={styles.wanrimgs}>
                                                <p className={styles.warnnums}>{item.num}</p>
                                                <p className={styles.labels}>{item.label}</p>
                                            </div>
                                        )
                                    })
                                    :
                                    <></>
                            }
                        </div>
                    </Card>
                </Col>
            </Row>
        </article>
    )
}

export default ControlNumber