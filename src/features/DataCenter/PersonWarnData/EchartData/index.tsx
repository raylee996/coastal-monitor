import {Row,Col,Radio,DatePicker} from 'antd'
import XcEcharts from "../../../../hooks/flexibility/EchartPanel";
import styles from './index.module.sass'
const Echartdata: React.FC = () => {

    const { RangePicker } = DatePicker
    const leveEchart ={
        tooltip: {
            trigger: 'item',
        },
        legend: {
            orient: 'vertical',
            left: 'right',
            top:'8%',
            itemHeight: 12
        },
        series: [
            {
                name: '风险等级',
                type: 'pie',
                radius: ['45%', '65%'],
                center: ['50%', '55%'],
                avoidLabelOverlap: false,
                label: {
                    normal: {
                        show: true,
                        position: 'center',
                        rich: {
                            totalText: {
                                fontSize: 12,
                                lineHeight: 20,
                                color: '#797979'
                            },
                            totalNumber: {
                                fontSize: 16,
                                color: '#4F6EF3'
                            }
                        }
                    },
                    emphasis: {
                        show: true
                    }
                },
                labelLine: {
                    show: false
                },
                data: [
                    { value: 423, name: '高风险' },
                    { value: 1234, name: '中风险' },
                    { value: 4124, name: '低风险' }
                ]
            }
        ]
    }
    const lineEchart ={
        xAxis:{
            type:"category",
            data:[1,2,3,4,5,6,7]
        },
        yAxis:{
            type:'value'
        },
        series:[
            {data:[2,3,4,5,6,7,8],type:'line'}
        ]
    }
    return (
        <article className={styles.contents}>
            <Row gutter={20}>
                <Col span={8} className={styles.echartCont}>
                    <div className={styles.leftTop}>
                        <h3>风险等级</h3>
                        <Radio.Group >
                            <Radio.Button value="month">近一月</Radio.Button>
                            <Radio.Button value="year">近一年</Radio.Button>
                        </Radio.Group>
                    </div>
                    <XcEcharts option={leveEchart} />
                </Col>
                <Col span={8}>
                    <div className={styles.leftTop}>
                        <h3>预警时段统计</h3>
                        <Radio.Group >
                            <Radio.Button value="month">近一月</Radio.Button>
                            <Radio.Button value="year">近一年</Radio.Button>
                        </Radio.Group>
                    </div>
                    <div>
                        <p>00:00 - 06:00    50</p>
                    </div>
                </Col>
                <Col span={8}>
                    <div className={styles.leftTop}>
                        <h3>每日预警统计</h3>
                        <RangePicker showTime/>
                    </div>
                    <XcEcharts option={lineEchart} />
                </Col>
            </Row>
        </article>
    )
}

export default Echartdata
