import { BellOutlined } from '@ant-design/icons';
import { Row, Col, Radio } from 'antd'
import DateRangeSimple from 'hooks/basis/DateRangeSimple';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import EchartPanel from "../../../../../../hooks/flexibility/EchartPanel";
import styles from './index.module.sass'
import { getPersonAlarmHourData, getPersonRiskLevelOptions, getPersonWarnDateOptions } from 'server/personnel';
import Title from "../../../../../../component/Title";
import { DayjsRange } from 'hooks/hooks';

interface Props {
  /** 个人信息 */
  personDetail?: any
}

const Echartdata: React.FC<Props> = ({ personDetail }) => {
  console.debug("Echartdata")

  const [levelDate, setLevelDate] = useState("month")
  const [timeDate, setTimeDate] = useState("month")

  const [defaultDateRange] = useState<DayjsRange>([dayjs().subtract(1, 'M'), dayjs()])
  const [dateRange, setDateRange] = useState<DayjsRange>(defaultDateRange)

  const [levelOptions, setLevelOptions] = useState<any>()
  const [lineOptions, setLineOptions] = useState<any>()

  const [hourList, setHourList] = useState<any[]>([])

  // 风险等级统计
  useEffect(() => {
    async function main() {
      if (personDetail) {
        const options = await getPersonRiskLevelOptions(levelDate, personDetail)
        setLevelOptions(options)
      }
    }
    main()
  }, [levelDate, personDetail])


  // 预警时间段统计
  useEffect(() => {
    async function main() {
      if (personDetail) {
        const vo = await getPersonAlarmHourData(timeDate, personDetail)
        setHourList(vo?.map((item: any) => {
          const { count } = item
          item.wd = (count || 0) / 100
          return item
        }) || [])
      }
    }
    main()
  }, [timeDate, personDetail])

  // 每日预警统计
  useEffect(() => {
    async function main() {
      if (personDetail) {
        const options = await getPersonWarnDateOptions(dateRange, personDetail)
        setLineOptions(options)
      }
    }
    main()
  }, [dateRange, personDetail])

  function handleDate(values: DayjsRange) {
    setDateRange(values)
  }


  return (
    <article className={styles.contents}>
      <Row gutter={20}>
        <Col span={8} className={styles.echartCont}>
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
        <Col span={8}>
          <div className={styles.leftTop}>
            {/* <h3>预警时段统计</h3> */}
            <Title title={'预警时段统计'} />
            <Radio.Group value={timeDate} onChange={evt => setTimeDate(evt.target.value)}>
              <Radio.Button style={timeDate === 'month' ? { color: '#fff', background: '#1c5ca8', height: '30px', lineHeight: '30px' } : {}} value="month">近一月</Radio.Button>
              <Radio.Button style={timeDate === 'year' ? { color: '#fff', background: '#1c5ca8', height: '30px', lineHeight: '30px' } : {}} value="year">近一年</Radio.Button>
            </Radio.Group>
          </div>
          <div className={styles.hourList}>
            {hourList.map(ele =>
              <div key={ele.dataItem} className={styles.hourItem}>
                <div className={styles.name} style={{ color: '#79a7e3' }}>
                  <BellOutlined />&nbsp;{ele.itemName}
                </div>
                <div className={styles.count}>{ele.count}</div>
              </div>
            )}
          </div>
        </Col>
        <Col span={8}>
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
