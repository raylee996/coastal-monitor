import { Row, Col, Card, Radio } from 'antd'
import styles from './index.module.sass'
import XcEcharts from "../../../../../../hooks/flexibility/EchartPanel";
import { doGetStatisticsControlNumTend, doGetStatisticsWarningDayStats } from 'server/statistics';
import { useCallback, useEffect, useState } from 'react';
const ControlTrend: React.FC = () => {
    console.debug('ControlTrend')

    // 布控数量趋势-时间
    const [controlTime, setControlTime] = useState('day')
    // 布控数量趋势-echarts图
    const [controlEchart, setControlEchart] = useState({})

    // 预警数量趋势-时间
    const [warningTime, setWarningTime] = useState('day')

    // 布控数量趋势-echarts图
    const [warningEchart, setWarningEchart] = useState({})
    
    // 获取布控数量趋势
    const getControlNumTend = useCallback(async () => {
        const vo = await doGetStatisticsControlNumTend({ controlTime })
        if (vo.options) {
            setControlEchart(vo.options)
        }
    }, [controlTime])

    useEffect(() => {
        // 获取布控数量趋势
        getControlNumTend()
    }, [getControlNumTend, controlTime])



    // 布控数量趋势-时间选择
    function handleControlTime(data?: any) {
        setControlTime(data.target.value)
        
    }



    // 获取预警数量趋势
    const getWarningDayStats = useCallback(async () => {
        
        const vo = await doGetStatisticsWarningDayStats({ warningTime })
        if (vo.options) {
            setWarningEchart(vo.options)
        }
    }, [warningTime])

    useEffect(() => {
        // 获取预警数量趋势
        getWarningDayStats()
    }, [getWarningDayStats, warningTime])

    // 预警数量趋势-时间选择
    function handleWarningTime(data?: any) {
        setWarningTime(data.target.value)
    }

    return (
        <article className={styles.contents}>
            <Row gutter={20}>
                <Col span={12}>
                    <Card title="布控数量趋势" extra={
                        <Radio.Group  value={controlTime} onChange={handleControlTime} size='small'>
                            <Radio.Button  value="day">近7天</Radio.Button>
                            <Radio.Button  value="month">近1月</Radio.Button>
                            <Radio.Button  value="year">近1年</Radio.Button>
                        </Radio.Group>
                    }>
                        <div className={styles.echartHeight}>
                            <XcEcharts option={controlEchart} />
                        </div>

                    </Card>
                </Col>
                <Col span={12}>
                    <Card title="预警数量趋势" extra={
                        <Radio.Group value={warningTime} onChange={handleWarningTime} size='small'>
                            <Radio.Button  value="day">近7天</Radio.Button>
                            <Radio.Button  value="month">近1月</Radio.Button>
                            <Radio.Button  value="year">近1年</Radio.Button>
                        </Radio.Group>
                    }>

                        <div className={styles.echartHeight}>
                            <XcEcharts option={warningEchart} />
                        </div>
                    </Card>
                </Col>
            </Row>
        </article>
    )
}

export default ControlTrend