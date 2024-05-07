
import { Radio, Row, Col } from "antd";
// import ImageSimple from "hooks/basis/ImageSimple";
import { useEffect, useState } from "react";
import styles from "./index.module.sass";
import { BellOutlined } from '@ant-design/icons';


interface IDataList {
  title?: any
  /**条件选项值 */
  condData?: any
  /**条件的值 */
  condVal?: any
  valise?: any
  /** 异步请求 */
  request?: any
  /** 请求额外数据 */
  extraParams?: any
}

const DataList: React.FC<IDataList> = ({ condData, condVal, valise, title, request, extraParams }) => {
  console.debug('DataList')


  const [radioData, setRadioData] = useState<any>([])
  const [timeVal, setTimeVal] = useState<any>()
  const [dataList, setDataList] = useState<any>([])


  useEffect(() => {
    setRadioData(condData)
  }, [condData])

  useEffect(() => {
    setTimeVal(condVal)
  }, [condVal])

  useEffect(() => {
    async function main() {
      if (request && timeVal) {
        const vo = await request({ time: timeVal, ...extraParams })
        setDataList(vo)
      }
    }
    main()
  }, [request, timeVal, extraParams])


  return (
    <article className={styles.wapper}>
      <div className={styles.panelStatistics}>
        <div className={styles.item}>
          <div className={styles.title}>
            <div className={styles.txt}>{title}</div>
            <div className={styles.condi}>
              <Radio.Group value={timeVal} size="small" onChange={evt => setTimeVal(evt.target.value)}>
                {
                  radioData && radioData.map((item: any, index: number) => {
                    return (
                      <Radio.Button key={"ecbox_" + index} value={item[valise.value]}>{item[valise.label]}</Radio.Button>
                    )
                  })
                }
              </Radio.Group>
            </div>
          </div>
          <div className={styles.content}>
            {
              dataList.map((dItem: any, dIndex: number) => {
                return (
                  <Row key={dIndex}>
                    <Col span={7}><p style={{ color: '#79a7e3' }}><BellOutlined />&nbsp;{dItem.name}</p></Col>
                    <Col span={14} style={{ paddingTop: '20px' }}>
                      <div className={styles.warnTotals} style={{ width: dItem.wd + '%' }}></div>
                    </Col>
                    <Col span={3}><p style={{ color: '#00f0fe' }}>{dItem.total}</p></Col>
                  </Row>
                )
              })
            }
          </div>
        </div>
      </div>
    </article>
  )
}

DataList.defaultProps = {
  valise: {
    label: 'label',
    value: 'value'
  }
}


export default DataList
