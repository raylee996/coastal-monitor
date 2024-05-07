import { Row, Col, Radio } from 'antd'
import XcEmpty from 'component/XcEmpty';
import dayjs from 'dayjs';
import DateRangeSimple from 'hooks/basis/DateRangeSimple';
import { useEffect, useState } from 'react';
import styles from './index.module.sass'
import EchartPanel from "hooks/flexibility/EchartPanel";
import {
    getWisdomActionlOptions,
    getWisdomCountByDateOptions,
    getWisdomTriggerIntervalOptions
} from "../../../../../../../server/core/model";
import Title from "../../../../../../../component/Title";
import { DayjsRange } from 'hooks/hooks';

const Echartdata: React.FC = () => {
    // 行为分类数据
    const [actionDate, setActionDate] = useState("month")
    // 行为分类图表
    const [actionOptions, setActionOptions] = useState<any>()

    // 触发时段统计
    const [timeDate, setTimeDate] = useState("month")
    // 触发时段计列表
    const [hourList, setHourList] = useState<any[]>([])

    // 每日行为统计
    const [lineOptions, setLineOptions] = useState<any>()
    const [defaultDateRange] = useState<DayjsRange>([dayjs().subtract(1, 'M'), dayjs()])
    const [dateRange, setDateRange] = useState<DayjsRange>(defaultDateRange)


    // 行为分类统计
    useEffect(() => {
        async function main() {
            // 行为分类饼形图
            const options = await getWisdomActionlOptions({ actionDate })
            setActionOptions(options)
        }
        main()
    }, [actionDate])

    // 预警时间段统计
    useEffect(() => {
        async function main() {
            const vo = await getWisdomTriggerIntervalOptions({ timeDate })
            setHourList(vo)
        }
        main()
    }, [timeDate])



    // 每日预警统计
    useEffect(() => {
        async function main() {
            const options = await getWisdomCountByDateOptions({dateRange })
            setLineOptions(options)
        }
        main()
    }, [dateRange])

    function handleDate(values: DayjsRange) {
        setDateRange(values)
    }


    return (
        <article className={styles.contents}>
            <Row gutter={20}>
                <Col span={8} className={styles.echartCont}>
                    <div className={styles.leftTop}>
                        <Title title={'行为分类统计'}/>
                        <Radio.Group value={actionDate} onChange={evt => setActionDate(evt.target.value)}>
                            <Radio.Button value="month">近一月</Radio.Button>
                            <Radio.Button value="year">近一年</Radio.Button>
                        </Radio.Group>
                    </div>
                    <EchartPanel option={actionOptions} />
                </Col>
                <Col span={8}>
                    <div className={styles.leftTop}>
                        <Title title={'触发时段统计'}/>
                        <Radio.Group value={timeDate} onChange={evt => setTimeDate(evt.target.value)}>
                            <Radio.Button value="month">近一月</Radio.Button>
                            <Radio.Button value="year">近一年</Radio.Button>
                        </Radio.Group>
                    </div>
                    <div className={styles.content}>
                        {
                            hourList.length !== 0 ?
                                hourList.map((item: any, index: number) => {
                                    return (
                                        <div className={styles.itemRow} key={'hourList' + index}>
                                            <div className={styles.itemCol}>{item.labelName}</div>
                                            <div className={styles.itemCol}>{item.itemNum}</div>
                                        </div>
                                    )
                                }) : <XcEmpty />
                        }
                    </div>
                </Col>
                <Col span={8}>
                    <div className={styles.leftTop}>
                        <Title title={'每日行为统计'}/>
                        <DateRangeSimple
                          defaultValue={defaultDateRange}
                          onChange={handleDate}
                          disabledRangeDays={30}
                          style={{ width: '240px' }} />
                    </div>
                    <EchartPanel option={lineOptions} />
                </Col>
            </Row>
        </article>
    )
}

export default Echartdata
