import { Row, Col, Radio } from 'antd'
import styles from './index.module.sass'
import { getCollectNearNums } from "server/search";
import { useEffect, useState } from "react";
const CodeData: React.FC = () => {
  console.debug('CodeData')
  const [counts, setCounts] = useState('0')
  const [allNum, setallNum] = useState<any>([
    { name: "AIS", value: 0 },
    { name: "雷达", value: 0 },
    { name: "人脸", value: 0 },
    { name: "车辆", value: 0 }
  ])

  useEffect(() => {
    async function main() {
      const vo = await getCollectNearNums({ type: counts })
      let temp = [
        { name: "AIS", value: vo.ais },
        { name: "雷达", value: vo.radar },
        { name: "人脸", value: vo.face },
        { name: "车辆", value: vo.car }
      ]
      setallNum(temp)
    }
    main()
  }, [counts])
  function changRadio(e: any) {
    setCounts(e.target.value)
  }
  return (
    <article className={styles.wrapper}>
      <div className={`${styles.modelTitle}`}>
        <span className={`icon iconfont icon-zhuangshitubiao ${styles.iconColor}`} />
        <span>采集数量统计</span>
        <div className={styles.radios}>
          <Radio.Group value={counts} onChange={(e: any) => changRadio(e)} size='small'>
            <Radio.Button  value="0">总计</Radio.Button>
            <Radio.Button  value="3">近一月</Radio.Button>
            <Radio.Button  value="5">近一年</Radio.Button>
          </Radio.Group>
        </div>
      </div>
      <Row gutter={20}>
        {allNum.map((item: any, index: any) => {
          return (
            <Col span={3} key={index}>
              <div className={styles.modules}>
                <div className={styles.warnnums}>{item.value}</div>
                <div className={styles.labels}>{item.name}</div>
              </div>
            </Col>
          )
        })
        }
      </Row>
    </article>
  )
}

export default CodeData