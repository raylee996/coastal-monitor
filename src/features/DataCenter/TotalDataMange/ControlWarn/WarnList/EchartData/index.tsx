import { BellOutlined } from '@ant-design/icons';
import { Row, Col, Radio } from 'antd'
import DateRangeSimple from 'hooks/basis/DateRangeSimple';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { doGetStatisticsEventCountByEventType, doGetStatisticsEventCountByTimeInterval, getWarnDateOptions } from 'server/statistics';
import EchartPanel from "../../../../../../hooks/flexibility/EchartPanel";
import styles from './index.module.sass'
import { DayjsRange } from 'hooks/hooks';
import XcEmpty from '../../../../../../component/XcEmpty'

interface Props {
  /** 个人信息 */
  personDetail?: any
}

const Echartdata: React.FC<Props> = ({ personDetail }) => {
  console.debug("Echartdata")

  // 行为分类统计
  const [levelDate, setLevelDate] = useState("month")

  const [timeDate, setTimeDate] = useState("month")

  const [defaultDateRange] = useState<DayjsRange>([dayjs().subtract(1, 'M'), dayjs()])
  const [dateRange, setDateRange] = useState<DayjsRange>(defaultDateRange)

  const [levelOptions, setLevelOptions] = useState<any>()
  const [lineOptions, setLineOptions] = useState<any>()

  const [hourList, setHourList] = useState<any[]>([])
  const [isShowOption, setIsShowOption] = useState(false)

  // 行为分析-行为分类统计
  useEffect(() => {
    async function main() {
      
      if (personDetail) {
        const options = await doGetStatisticsEventCountByEventType(levelDate, personDetail)
        setIsShowOption(options.series[0].data.length ? true : false)
        setLevelOptions(options)
      }
    }
    main()
  }, [levelDate, personDetail])


  // 行为分析-触发时段统计
  useEffect(() => {
    async function main() {
      if (personDetail) {
        let vo = await doGetStatisticsEventCountByTimeInterval(timeDate, personDetail)
        let arr:any =[]
        vo.forEach((item:any) => {
          let str:any = {itemNum: item.itemNum,labelName: item.labelName,totalNum: item.totalNum,type:item.type,wd:item.itemNum / 100}
          arr.push(str)
        })
        
        setHourList(arr)
      }
    }
    main()
  }, [timeDate, personDetail])

  // 行为分析-每日行为统计
  useEffect(() => {
    async function main() {
      if (personDetail) {
        const options = await getWarnDateOptions(dateRange, personDetail)
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
            <p className={styles.titles}>行为分类统计</p>
            <Radio.Group value={levelDate} onChange={evt => setLevelDate(evt.target.value)} size='small'>
              <Radio.Button  value="month">近一月</Radio.Button>
              <Radio.Button  value="year">近一年</Radio.Button>
            </Radio.Group>
          </div>
          {isShowOption ?  <EchartPanel option={levelOptions} /> : <XcEmpty />}
        </Col>
        <Col span={8}>
          <div className={styles.leftTop}>
            <p className={styles.titles}>触发时段统计</p>
            <Radio.Group value={timeDate} onChange={evt => setTimeDate(evt.target.value)} size='small'>
              <Radio.Button  value="month">近一月</Radio.Button>
              <Radio.Button  value="year">近一年</Radio.Button>
            </Radio.Group>
          </div>
          <div className={styles.hourList}>
            {hourList.map(ele =>
              <Row>
                <Col span={5}><p style={{color: '#79a7e3'}}><BellOutlined />&nbsp;{ele.labelName}</p></Col>
                <Col span={14} style={{paddingTop: '20px'}}>
                  <div className={styles.warnTotals} style={{width:ele.wd+'px'}}></div>
                </Col>
                <Col span={4}><p style={{color: '#00f0fe',textAlign: 'right'}}>{ele.itemNum}</p></Col>
              </Row>
            )}
          </div>
        </Col>
        <Col span={8}>
          <div className={styles.leftTop}>
            <p className={styles.titles}>每日行为统计</p>
            <DateRangeSimple defaultValue={defaultDateRange} onChange={handleDate} />
          </div>
          <EchartPanel option={lineOptions} />
        </Col>
      </Row>
    </article>
  )
}

export default Echartdata
