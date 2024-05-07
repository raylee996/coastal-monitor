import { Radio, RadioChangeEvent } from "antd";
import Title from "component/Title";
import { DateRangeDict } from "helper/dictionary";
import EchartPanel from "hooks/flexibility/EchartPanel";
import { useEffect, useState } from "react"
import { getShipTotalStatistics, getShipTypeStatistic, getWarnShipStatisticsData } from "server/statistics";
import styles from "./index.module.sass";


const dateTypeOptions = DateRangeDict.map(val => ({ ...val, label: val.name }))

const TargetStatistic: React.FC = () => {
  console.debug('TargetStatistic')

  const [dateType, setDateType] = useState<number>(1)
  const [riskOption, setRiskOption] = useState<any>()
  const [shipOption, setShipOption] = useState<any>()
  const [typeOption, setTypeOption] = useState<any>()

  useEffect(() => {
    async function main() {
      const _riskOption = await getWarnShipStatisticsData()
      setRiskOption(_riskOption)
    }
    main()
  }, [])

  useEffect(() => {
    async function main() {
      const _shipOption = await getShipTotalStatistics()
      setShipOption(_shipOption)
    }
    main()
  }, [])

  useEffect(() => {
    async function main() {
      const _typeOption = await getShipTypeStatistic(dateType)
      setTypeOption(_typeOption)
    }
    main()
  }, [dateType])

  function handleDateType({ target: { value } }: RadioChangeEvent) {
    setDateType(value)
  }

  return (
    <article className={styles.wrapper}>
      <section>
        <Title title="风险船舶数量趋势" />
        <EchartPanel className={styles.chart} option={riskOption} />
      </section>

      <section>
        <Title title="船舶总数趋势" />
        <EchartPanel className={styles.chart} option={shipOption} />
      </section>

      <section>
        <Title title="AIS船舶类型分布" />
        <Radio.Group
          options={dateTypeOptions}
          onChange={handleDateType}
          value={dateType}
          optionType="button"
          buttonStyle="solid"
          size="small"
        />
        <EchartPanel className={styles.chart} option={typeOption} />
      </section>
    </article>
  )
}

export default TargetStatistic