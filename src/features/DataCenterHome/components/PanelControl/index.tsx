// import { controlDataDict } from "helper/dictionary";
import EchartPanel from "hooks/flexibility/EchartPanel";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doGetControlDataLine, doGetControlDataPie } from "server/situation";
import { getDictDataByType } from "server/system";
import CardButton from "../CardButton";
import CardSelect from "../CardSelect";
import CardTitle from "../CardTitle"
import TotalShow from "./components/TotalShow";
import styles from "./index.module.sass";


const options = [{
  name: '近一周',
  value: 'week'
}, {
  name: '近一月',
  value: 'month'
}, {
  name: '今年',
  value: 'quarter'
}]

const PanelControl: React.FC = () => {
  console.debug('PanelControl')


  const navigate = useNavigate();


  const [ctrlType, setCtrlType] = useState(-1)
  const [rangeType, setRangeType] = useState('week')
  const [chartOptionA, setChartOptionA] = useState<any>()
  const [chartOptionB, setChartOptionB] = useState<any>()
  const [total, setTotal] = useState<number>()
  const [controlDataDict, setControlDataDict] = useState<any>([]) // 预警类型字典


  useEffect(() => {
    async function main() {
      const vo = await doGetControlDataPie({ dateTime: rangeType })
      const optionB = await doGetControlDataLine({ dateTime: rangeType, controlType: ctrlType })

      // 获取布控类型字典
      const warnTypeDict = await getDictDataByType("controlCategory")
      // controlCategory

      setTotal(vo.total)
      setChartOptionA(vo.options)
      setChartOptionB(optionB)
      // 添加一个总计
      setControlDataDict([{ name: "总计", value: -1 }, ...warnTypeDict])
    }
    main()
  }, [ctrlType, rangeType])


  const handleTimeRange = useCallback((param: any) => {
    setRangeType(param)
  }, [])

  const handleType = useCallback((param: any) => {
    setCtrlType(param)
  }, [])

  const handleClick = useCallback(
    () => {
      navigate('dataCenter/totalData')
    },
    [navigate]
  )


  return (
    <article className={styles.wrapper}>
      <CardTitle text='布控数据' />

      <header className={styles.cardHeader}>
        <div>
          <CardSelect
            label="布控类型"
            dict={controlDataDict}
            defaultValue={ctrlType}
            onChange={handleType}
          />
        </div>
        <div>
          <CardButton
            options={options}
            defaultValue={rangeType}
            onChange={handleTimeRange}
          />
        </div>
      </header>

      <article className={styles.content}>
        <section onClick={handleClick}>
          <TotalShow className={styles.total} value={total} />
          <EchartPanel option={chartOptionA} />
        </section>
        <section onClick={handleClick}>
          <EchartPanel option={chartOptionB} />
        </section>
      </article>
    </article>
  )
}

export default PanelControl