import React, {useEffect, useState} from "react";
import styles from './index.module.sass'
import {Col, Radio, Row} from "antd";
import EchartPanel from "hooks/flexibility/EchartPanel";
import {
  statisticsCaseAsync,
  statisticsChargePersonAsync,
  statisticsSourceAsync,
  statisticsTimeAsync
} from "../../../../../server/core/taskReview";
import XcEmpty from "../../../../../component/XcEmpty";
import Title from "../../../../../component/Title";
//任务回顾顶部Echarts图
const TaskEcharts:React.FC = ()=>{
  //任务来源
  const [sourceDate, setSourceDate] = useState('month');
  const [sourceOptions, setSourceOptions] = useState<any>();
  //任务用时
  const [timeDate, setTimeDate] = useState('month');
  const [timeOptions, setTimeOptions] = useState<any>();
  //关联案件
  const [caseDate, setCaseDate] = useState('month');
  const [caseOptions, setCaseOptions] = useState<any>();
  //责任人排行
  const [chargeManDate, setChargeManDate] = useState('month');
  const [chargeManList, setChargeManList] = useState<any>([]);

  useEffect(() => {
    async function main() {
      // 任务来源统计
      const options = await statisticsSourceAsync({ sourceDate })
      setSourceOptions(options)
    }
    main()
  }, [sourceDate])

  useEffect(() => {
    async function main() {
      // 任务用时统计
      const options = await statisticsTimeAsync({ timeDate })
      setTimeOptions(options)
    }
    main()
  }, [timeDate])

  useEffect(() => {
    async function main() {
      // 关联案件统计
      const options = await statisticsCaseAsync({ caseDate })
      setCaseOptions(options)
    }
    main()
  }, [caseDate])

  useEffect(() => {
    async function main() {
      // 责任人排行统计
      const options = await statisticsChargePersonAsync({ chargeManDate })
      setChargeManList(options)
    }
    main()
  }, [chargeManDate])

  return<div className={styles.wrapper}>
    <Row>
      <Col span={6} className={styles.chartWrapper}>
        <div className={styles.leftTop}>
          <Title title={'任务来源统计'}/>
          <Radio.Group value={sourceDate} onChange={evt => setSourceDate(evt.target.value)}>
            <Radio.Button value="month">近一月</Radio.Button>
            <Radio.Button value="year">近一年</Radio.Button>
          </Radio.Group>
        </div>
        <EchartPanel option={sourceOptions} />
      </Col>
      <Col span={6} className={styles.chartWrapper}>
        <div className={styles.leftTop}>
          <Title title={'任务用时统计'}/>
          <Radio.Group value={timeDate} onChange={evt => setTimeDate(evt.target.value)}>
            <Radio.Button value="month">近一月</Radio.Button>
            <Radio.Button value="year">近一年</Radio.Button>
          </Radio.Group>
        </div>
        <EchartPanel option={timeOptions} />
      </Col>
      <Col span={6} className={styles.chartWrapper}>
        <div className={styles.leftTop}>
          <Title title={'关联案件统计'}/>
          <Radio.Group value={caseDate} onChange={evt => setCaseDate(evt.target.value)}>
            <Radio.Button value="month">近一月</Radio.Button>
            <Radio.Button value="year">近一年</Radio.Button>
          </Radio.Group>
        </div>
        <EchartPanel option={caseOptions} />
      </Col>
      <Col span={6} className={styles.chartWrapper}>
        <div className={styles.leftTop}>
          <Title title={'责任人排行'}/>
          <Radio.Group value={chargeManDate} onChange={evt => setChargeManDate(evt.target.value)}>
            <Radio.Button value="month">近一月</Radio.Button>
            <Radio.Button value="year">近一年</Radio.Button>
          </Radio.Group>
        </div>
        <div className={styles.chargeManList}>
          {
            chargeManList.length !== 0 ?
              chargeManList.map((item: any, index: number) => {
                return (
                  <div className={styles.itemRow} key={'chargeManList' + index}>
                    <div className={styles.itemCol}>{index+1}、{item.name}：{item.value}</div>
                  </div>
                )
              }) : <XcEmpty />
          }
        </div>

      </Col>
    </Row>
  </div>
}

export default TaskEcharts
