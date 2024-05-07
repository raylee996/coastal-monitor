
import { Radio } from "antd";
import DateTimeRangeSimple from "hooks/basis/DateTimeRangeSimple";
import EchartPanel from "hooks/flexibility/EchartPanel";
import { useEffect, useState } from "react";
import styles from "./index.module.sass";
import Title from "../../../../../../../../../component/Title";
import XcEmpty from '../../../../../../../../../component/XcEmpty'


interface IEchartsBox {
  title?: any
  /**按钮类型     */
  condType?: any
  condProps?: any
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

const EchartsBox: React.FC<IEchartsBox> = ({ condData, condVal, valise, title, request, condType, condProps, extraParams }) => {
  console.debug('EchartsBox')


  const [radioData, setRadioData] = useState<any>([])
  const [timeVal, setTimeVal] = useState<any>()
  const [echartsOptions, setEchartsOptions] = useState<any>({})
  const [isShowOption, setIsShowOption] = useState(false)


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
        setIsShowOption(vo.series[0].data.length ? true : false)
        setEchartsOptions(vo)
      }
    }
    main()
  }, [request, timeVal, extraParams])


  return (
    <article className={styles.wapper}>
      <div className={styles.panelStatistics}>
        <div className={styles.item}>
          <div className={styles.title}>
            <div className={styles.txt}><Title title={title} /></div>
            <div className={styles.condi}>
              {
                condType === 'radio' ?
                  <Radio.Group value={timeVal} size="small" onChange={evt => setTimeVal(evt.target.value)} {...condProps}>
                    {
                      radioData && radioData.map((item: any, index: number) => {
                        return (
                          <Radio.Button key={"ecbox_" + index} value={item[valise.value]}>{item[valise.label]}</Radio.Button>
                        )
                      })
                    }
                  </Radio.Group>
                  : null
              }

              {
                condType === 'DateTimeRangeSimple' ?
                  <DateTimeRangeSimple format={"YYYY-MM-DD"} {...condProps} value={timeVal} onChange={(dates: any, dateStrings: any) => {
                    setTimeVal([dates[0], dates[1]])
                  }} />
                  : null
              }

            </div>
          </div>
          <div className={styles.content}>
            {isShowOption ? <EchartPanel option={echartsOptions} /> : <XcEmpty />}
          </div>
        </div>
      </div>
    </article>
  )
}

EchartsBox.defaultProps = {
  condType: 'radio',
  valise: {
    label: 'label',
    value: 'value'
  }
}


export default EchartsBox
