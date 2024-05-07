import CommonData from '../component'
import { Card, DatePicker, Row, Col, Select, Radio, Button } from 'antd'
import XcEcharts from "../../../../hooks/flexibility/EchartPanel";
import { useCallback, useEffect, useState } from 'react';
import { doGetStatisticsCaseLabelStats, doGetStatisticsCaseNumTend, doGetStatisticsLabelTable } from 'server/statistics';
import dayjs from 'dayjs';
import styles from './index.module.sass'
import XcEmpty from 'component/XcEmpty';
import './index.sass'

const CaseTotal: React.FC = () => {
    console.debug('CaseTotal')
    const { RangePicker } = DatePicker

    // 趋势echarts
    const [trendOptions, setTrendOptions] = useState<any>({})
    // 趋势时间
    const [trendDate, setTrendDate] = useState<any>('1')

    // 发案趋势下拉值
    const [trendSelected, setTrendSelected] = useState<any>(null)
    // 发案趋势下拉选项值
    const [trendSelectedOptions, setTrendSelectedOptions] = useState<any>([])

    // 案件类别统计-时间
    const [caseTime, setCaseTime] = useState<any>([dayjs().subtract(7, 'day'), dayjs().subtract(0, 'day')])

    // 案件类别统计图
    const [caseOptions, setCaseOptions] = useState<any>({})
    const [isShowOption, setIsShowOption] = useState(false)

    // 发案趋势-时间选择器,案件标签类别
    const LeftHtml = () => {
        return <div>
            
            
            <Select placeholder="请选择" style={{ width: 120, marginLeft: 10 }} allowClear value={trendSelected} options={trendSelectedOptions} onChange={(val: any) => {
                setTrendSelected(val)
            }}></Select>
        </div>
    }

    const getStatisticsLabelTableData = useCallback(async () => {
        // 案件类别标签获取
        const voLabel = await doGetStatisticsLabelTable({ current: 1, size: -1, type: 8 })
        setTrendSelectedOptions(voLabel.data)
    }, [])


    useEffect(() => {
        // 获取发案趋势数据
        async function getCaseTrendData() {
            const vo = await doGetStatisticsCaseNumTend({ countType: trendDate, labelId: trendSelected })
            setTrendOptions(vo.options)
        }
        getCaseTrendData()
    }, [trendDate, trendSelected])

    useEffect(() => {
        getStatisticsLabelTableData()
    }, [getStatisticsLabelTableData])


    async function getCaseLabelStats(data:any) {
        // 案件类别标签获取
        const voLabel = await doGetStatisticsCaseLabelStats({ dateTime: data })
        console.log(voLabel)
        setIsShowOption(voLabel.data.length ? true : false)
        setCaseOptions(voLabel.options)
    }
    useEffect(()=>{
        
        async function main() {
            getCaseLabelStats(caseTime)
        }
        main()
    },[caseTime])
    // getCaseLabelStats()


    const RightHtml = () => {
        return <div>
            <RangePicker showTime value={caseTime} onChange={(val: any) => {
                setCaseTime(val)
            }} />
            <Button type={"primary"} onClick={()=>getCaseLabelStats(caseTime)}>统计</Button>
        </div>
    }


    return (
        <article className={`${styles.wappercont} controls`}>
            <CommonData title="案事件数量" type={2} />
            <Row gutter={20} style={{ marginTop: 10 }}>
                <Col span={12}>
                    <Card title="发案趋势" extra={LeftHtml()}>
                        <div style={{ height: '300px' }}>
                            <div style={{marginLeft: '71%'}}>
                                <Radio.Group size='small' value={trendDate} onChange={(val: any) => {
                                    setTrendDate(val.target.value)
                                }}>
                                    <Radio.Button  value="1">近七天</Radio.Button>
                                    <Radio.Button  value="2">近一月</Radio.Button>
                                    <Radio.Button value="3">近一年</Radio.Button>
                                </Radio.Group>
                            </div>
                            <XcEcharts option={trendOptions} />
                        </div>
                    </Card>
                </Col>
                <Col span={12} >
                    <Card title="案件类别统计" extra={RightHtml()}>
                        <div style={{ height: '300px' }}>
                        {isShowOption ? <XcEcharts option={caseOptions} />: <XcEmpty />}
                        </div>
                    </Card>
                </Col>
            </Row>
        </article>
    )
}

export default CaseTotal