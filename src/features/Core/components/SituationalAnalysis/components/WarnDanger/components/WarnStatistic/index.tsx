import { Radio, RadioChangeEvent } from "antd";
import Title from "component/Title";
import { focusTypeDict, WarnMoreDateRange2Dict, WarnMoreDateRangeDict } from "helper/dictionary";
import EchartPanel from "hooks/flexibility/EchartPanel";
import { useCallback, useEffect, useState } from "react"
import { getDayRiskLevelStatsData, getRiskTypeStatisticsData, getWarnCountByEventTypeData } from "server/warn";
import styles from "./index.module.sass";


const dateTypeOptions = WarnMoreDateRangeDict.map(val => ({ ...val, label: val.name }))
const dateTypeYearOptions = WarnMoreDateRange2Dict.map(val => ({ ...val, label: val.name }))
const focusTypeOptions = focusTypeDict.map(val => ({ ...val, label: val.name }))


const WarnStatistic: React.FC = () => {
  console.debug('WarnStatistic')

  const [typeOption, setTypeOption] = useState<any>()
  const [riskOption, setRiskOption] = useState<any>()
  const [anomalyOption, setAnomalyOption] = useState<any>()
  const [typeDateType, setTypeDateType] = useState(1)
  const [typeFocusType, setTypeFocusType] = useState('')
  const [riskFocusType, setRiskFocusType] = useState('')
  const [anomalyDateType, setAnomalyDateType] = useState(1)
  const [anomalyFocusType, setAnomalyFocusType] = useState('')


  useEffect(() => {
    let ctr: AbortController
    async function main() {
      ctr = new AbortController()
      const _typeOption = await getRiskTypeStatisticsData(typeDateType, typeFocusType, ctr)
      setTypeOption(_typeOption)
    }
    main()
    return () => {
      ctr?.abort()
    }
  }, [typeDateType, typeFocusType])

  useEffect(() => {
    let ctr: AbortController
    async function main() {
      ctr = new AbortController()
      const _riskOption = await getDayRiskLevelStatsData(riskFocusType, ctr)
      setRiskOption(_riskOption)
    }
    main()
    return () => {
      ctr?.abort()
    }
  }, [riskFocusType])

  useEffect(() => {
    let ctr: AbortController
    async function main() {
      ctr = new AbortController()
      const _anomalyDateType = await getWarnCountByEventTypeData(anomalyDateType, anomalyFocusType, ctr)
      setAnomalyOption(_anomalyDateType)
    }
    main()
    return () => {
      ctr?.abort()
    }
  }, [anomalyDateType, anomalyFocusType])


  const handleTypeDateType = useCallback(
    ({ target: { value } }: RadioChangeEvent) => {
      setTypeDateType(value)
    },
    [],
  )

  const handleTypeFocusType = useCallback(
    ({ target: { value } }: RadioChangeEvent) => {
      setTypeFocusType(value)
    },
    [],
  )

  const handleRiskDateType = useCallback(
    ({ target: { value } }: RadioChangeEvent) => {
      setRiskFocusType(value)
    },
    [],
  )

  const handleAnomalyDateType = useCallback(
    ({ target: { value } }: RadioChangeEvent) => {
      setAnomalyDateType(value)
    },
    []
  )

  const handleAnomalyFocusType = useCallback(
    ({ target: { value } }: RadioChangeEvent) => {
      setAnomalyFocusType(value)
    },
    []
  )


  return (
    <article className={styles.wrapper}>

      <section>
        <Title title="风险类别分布" />
        <div className={styles.options}>
          <Radio.Group
            options={dateTypeYearOptions}
            onChange={handleTypeDateType}
            value={typeDateType}
            optionType="button"
            buttonStyle="solid"
            size="small"
          />
        </div>
        <div>
          <Radio.Group
            options={focusTypeOptions}
            onChange={handleTypeFocusType}
            value={typeFocusType}
            optionType="button"
            buttonStyle="solid"
            size="small"
          />
        </div>
        <EchartPanel className={styles.chart} option={typeOption} />
      </section>

      <section>
        <Title title="预警风险趋势" />
        <Radio.Group
          options={focusTypeOptions}
          onChange={handleRiskDateType}
          value={riskFocusType}
          optionType="button"
          buttonStyle="solid"
          size="small"
        />
        <EchartPanel className={styles.chart} option={riskOption} />
      </section>

      <section>
        <Title title="异常行为分布" />
        <div className={styles.options}>
          <Radio.Group
            options={dateTypeOptions}
            onChange={handleAnomalyDateType}
            value={anomalyDateType}
            optionType="button"
            buttonStyle="solid"
            size="small"
          />
        </div>
        <div>
          <Radio.Group
            options={focusTypeOptions}
            onChange={handleAnomalyFocusType}
            value={anomalyFocusType}
            optionType="button"
            buttonStyle="solid"
            size="small"
          />
        </div>
        <EchartPanel className={styles.chart} option={anomalyOption} />
      </section>

    </article >
  )
}

export default WarnStatistic