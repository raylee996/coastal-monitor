import { Row, Col, Radio } from 'antd'
import XcEmpty from 'component/XcEmpty';
import dayjs from 'dayjs';
import DateRangeSimple from 'hooks/basis/DateRangeSimple';
import { useEffect, useState } from 'react';
import { getShipActionlOptions, getShipCountByDateOptions, getShipTriggerIntervalOptions } from 'server/ship';
import XcEcharts from "../../../../../../hooks/flexibility/EchartPanel";
import styles from './index.module.sass'
import Title from "../../../../../../component/Title";
import { BellOutlined } from '@ant-design/icons';
import { DayjsRange } from 'hooks/hooks';


interface Props {
  id?: any
  archiveType?: string | number
}

const Echartdata: React.FC<Props> = ({ id, archiveType }) => {
  console.debug('Echartdata')


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
  const [isShowOption, setIsShowOption] = useState(false)


  // 行为分类统计
  useEffect(() => {
    async function main() {
      // 行为分类饼形图
      const options = await getShipActionlOptions({ id, archiveType, actionDate })
      // console.log(options)
      setIsShowOption(options.series[0].data.length ? true : false)
      setActionOptions(options)
    }
    main()
  }, [id, actionDate, archiveType])

  // 预警时间段统计
  useEffect(() => {
    async function main() {
      const _hourList = await getShipTriggerIntervalOptions({ id, archiveType, timeDate })
      setHourList(_hourList)
    }
    main()
  }, [archiveType, id, timeDate])



  // 每日预警统计
  useEffect(() => {
    async function main() {
      const options = await getShipCountByDateOptions({ id, archiveType, dateRange })
      setLineOptions(options)
    }
    main()
  }, [id, dateRange, archiveType])

  function handleDate(values: DayjsRange) {
    setDateRange(values)
  }


  return (
    <article className={styles.contents}>
      <Row gutter={20}>
        <Col span={8} className={styles.echartCont}>
          <div className={styles.leftTop}>
            {/* <div className={styles.title}>行为分类统计</div> */}
            <Title title={'行为分类统计'} />
            <Radio.Group value={actionDate} onChange={evt => setActionDate(evt.target.value)}>
              <Radio.Button style={actionDate === 'month' ? { color: '#fff', background: '#1c5ca8', height: '30px', lineHeight: '30px' } : {}} value="month">近一月</Radio.Button>
              <Radio.Button style={actionDate === 'year' ? { color: '#fff', background: '#1c5ca8', height: '30px', lineHeight: '30px' } : {}} value="year">近一年</Radio.Button>
            </Radio.Group>
          </div>
          {isShowOption ? <XcEcharts option={actionOptions} /> : <XcEmpty />}
        </Col>
        <Col span={8}>
          <div className={styles.leftTop}>
            {/* <div className={styles.title}>触发时段统计</div> */}
            <Title title={'触发时段统计'} />
            <Radio.Group value={timeDate} onChange={evt => setTimeDate(evt.target.value)}>
              <Radio.Button style={timeDate === 'month' ? { color: '#fff', background: '#1c5ca8', height: '30px', lineHeight: '30px' } : {}} value="month">近一月</Radio.Button>
              <Radio.Button style={timeDate === 'year' ? { color: '#fff', background: '#1c5ca8', height: '30px', lineHeight: '30px' } : {}} value="year">近一年</Radio.Button>
            </Radio.Group>
          </div>
          <div className={styles.content}>
            {hourList.length !== 0 ? hourList.map((item: any, index: number) =>
              <Row key={index}>
                <Col span={5}><p style={{ color: '#79a7e3' }}><BellOutlined />&nbsp;{item.labelName}</p></Col>
                <Col span={14} style={{ paddingTop: '20px' }}>
                  <div className={styles.warnTotals} style={{ width: item.wd + '%' }}></div>
                </Col>
                <Col span={4}><p style={{ color: '#00f0fe', textAlign: 'center' }}>{item.itemNum}</p></Col>
              </Row>
            ) : <XcEmpty />
            }
          </div>
        </Col>
        <Col span={8}>
          <div className={styles.leftTop}>
            {/* <div className={styles.title}>每日行为统计</div> */}
            <Title title={'每日行为统计'} />
            <DateRangeSimple defaultValue={defaultDateRange} onChange={handleDate} style={{ width: '240px' }} />
          </div>
          <XcEcharts option={lineOptions} />
        </Col>
      </Row>
    </article>
  )
}

export default Echartdata
