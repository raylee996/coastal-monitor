import { BellOutlined } from '@ant-design/icons';
import { Row, Col, Radio } from 'antd'
import DateRangeSimple from 'hooks/basis/DateRangeSimple';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { getActionlOptions, getAlarmHourData, getRiskLevelOptions, getWarnDateOptions } from 'server/statistics';
import EchartPanel from "../../../../../../hooks/flexibility/EchartPanel";
import styles from './index.module.sass'
import Title from "../../../../../../component/Title";
import XcEmpty from '../../../../../../component/XcEmpty'
import { DayjsRange } from 'hooks/hooks';

interface Props {
  /** 船舶信息 */
  shipData?: any
}

const Echartdata: React.FC<Props> = ({ shipData }) => {
  console.debug("Echartdata")

  const [levelDate, setLevelDate] = useState("month")
  const [actionDate, setActionDate] = useState("month")
  const [timeDate, setTimeDate] = useState("month")

  const [defaultDateRange] = useState<DayjsRange>([dayjs().subtract(1, 'M'), dayjs()])
  const [dateRange, setDateRange] = useState<DayjsRange>(defaultDateRange)

  const [levelOptions, setLevelOptions] = useState<any>()
  const [actionOptions, setActionOptions] = useState<any>()
  const [lineOptions, setLineOptions] = useState<any>()

  const [hourList, setHourList] = useState<any[]>([])
  const [isShowOption, setIsShowOption] = useState(false)

  // 风险等级统计
  useEffect(() => {
    async function main() {
      if (shipData) {
        const options = await getRiskLevelOptions(levelDate, shipData)
        setLevelOptions(options)
      }
    }
    main()
  }, [levelDate, shipData])

  // 预警行为统计
  useEffect(() => {
    async function main() {
      if (shipData) {
        const options = await getActionlOptions(actionDate, shipData)
        setIsShowOption(options.series[0].data.length ? true : false)
        setActionOptions(options)
      }
    }
    main()
  }, [actionDate, shipData])

  // 预警时间段统计
  useEffect(() => {
    async function main() {
      if (shipData) {
        const vo = await getAlarmHourData(timeDate, shipData)
        setHourList(vo?.map((item: any) => {
          const { count } = item
          item.wd = (count || 0) / 100
          return item
        }) || [])
      }
    }
    main()
  }, [timeDate, shipData])

  // 每日预警统计
  useEffect(() => {
    async function main() {
      if (shipData) {
        const options = await getWarnDateOptions(dateRange, shipData)
        setLineOptions(options)
      }
    }
    main()
  }, [dateRange, shipData])

  function handleDate(values: DayjsRange) {
    setDateRange(values)
  }

  return (
    <article className={styles.contents}>
      <Row gutter={20}>
        <Col span={5} className={styles.echartCont}>
          <div className={styles.leftTop}>
            {/* <h3>风险等级</h3> */}
            <Title title={'风险等级统计'} />
            <Radio.Group value={levelDate} onChange={evt => setLevelDate(evt.target.value)}>
              <Radio.Button style={levelDate === 'month' ? { color: '#fff', background: '#1c5ca8', height: '30px', lineHeight: '30px' } : {}} value="month">近一月</Radio.Button>
              <Radio.Button style={levelDate === 'year' ? { color: '#fff', background: '#1c5ca8', height: '30px', lineHeight: '30px' } : {}} value="year">近一年</Radio.Button>
            </Radio.Group>
          </div>
          <EchartPanel option={levelOptions} />
        </Col>
        <Col span={6} className={styles.echartCont}>
          <div className={styles.leftTop}>
            {/* <h3>预警行为统计</h3> */}
            <Title title={'预警行为统计'} />
            <Radio.Group value={actionDate} onChange={evt => setActionDate(evt.target.value)}>
              <Radio.Button style={actionDate === 'month' ? { color: '#fff', background: '#1c5ca8', height: '30px', lineHeight: '30px' } : {}} value="month">近一月</Radio.Button>
              <Radio.Button style={actionDate === 'year' ? { color: '#fff', background: '#1c5ca8', height: '30px', lineHeight: '30px' } : {}} value="year">近一年</Radio.Button>
            </Radio.Group>
          </div>
          {isShowOption ? <EchartPanel option={actionOptions} /> : <XcEmpty />}
        </Col>
        <Col span={5}>
          <div className={styles.leftTop}>
            {/* <h3>预警时段统计</h3> */}
            <Title title={'预警时段统计'} />
            <Radio.Group value={timeDate} onChange={evt => setTimeDate(evt.target.value)}>
              <Radio.Button style={timeDate === 'month' ? { color: '#fff', background: '#1c5ca8', height: '30px', lineHeight: '30px' } : {}} value="month">近一月</Radio.Button>
              <Radio.Button style={timeDate === 'year' ? { color: '#fff', background: '#1c5ca8', height: '30px', lineHeight: '30px' } : {}} value="year">近一年</Radio.Button>
            </Radio.Group>
          </div>
          <div className={styles.hourList}>
            {
              hourList.map(ele =>
                <div key={ele.dataItem} className={styles.hourItem}>
                  <div className={styles.name} style={{ color: '#79a7e3' }}>
                    <BellOutlined />&nbsp;{ele.itemName}
                  </div>
                  <div className={styles.count}>{ele.count}</div>
                </div>
              )
            }
          </div>
        </Col>
        <Col span={8} className={styles.echartCont}>
          <div className={styles.leftTop}>
            {/* <h3>每日预警统计</h3> */}
            <Title title={'每日预警统计'} />
            <DateRangeSimple defaultValue={defaultDateRange} onChange={handleDate} />
          </div>
          <EchartPanel option={lineOptions} />
        </Col>
      </Row>
    </article>
  )
}

export default Echartdata
