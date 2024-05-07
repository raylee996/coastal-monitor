import { Checkbox, Col, Row } from "antd";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import Title from "component/Title";
import { CollectTypeDict } from "helper/dictionary";
import SelectSimple from "hooks/basis/SelectSimple";
import EchartPanel from "hooks/flexibility/EchartPanel";
import { useEffect, useState } from "react"
import { getDeviceCollectData, getDeviceFineAndFaultData, getDeviceTypeStatisticData } from "server/statistics";
import styles from "./index.module.sass";


const DeviceStatistic: React.FC = () => {
  console.debug('DeviceStatistic')

  const [collectType, setCollectType] = useState(3)
  const [isDeduplication, setIsDeduplication] = useState(true)

  const [typeOption, setTypeOption] = useState<any>()
  const [fineFaultOption, setFineFaultOption] = useState<any>()
  const [dataOption, setDataOption] = useState<any>()

  useEffect(() => {
    async function main() {
      const _typeOption = await getDeviceTypeStatisticData()
      setTypeOption(_typeOption)
    }
    main()
  }, [])

  useEffect(() => {
    async function main() {
      const _fineFaultOption = await getDeviceFineAndFaultData()
      setFineFaultOption(_fineFaultOption)
    }
    main()
  }, [])

  useEffect(() => {
    async function main() {
      let isRepeat = collectType === 1 ? false : isDeduplication
      const _dataOption = await getDeviceCollectData(isRepeat, collectType)
      setDataOption(_dataOption)
    }
    main()
  }, [isDeduplication, collectType])

  function handleCollect(val: any) {
    setCollectType(val)
  }

  function handleDeduplication(evt: CheckboxChangeEvent) {
    setIsDeduplication((val: boolean) => {
      return !val
    })
  }

  return (
    <article className={styles.wrapper}>

      <section>
        <Title title="设备数量统计" />
        <EchartPanel className={styles.chart} option={typeOption} />
      </section>

      <section>
        <Title title="设备状态统计" />
        <EchartPanel className={styles.chart} option={fineFaultOption} />
      </section>

      <section>
        <Title title="采集数据统计" />
        <Row>
          <Col span={6}>
            <SelectSimple dict={CollectTypeDict} allowClear={false} value={collectType} onChange={handleCollect} />
          </Col>
          {collectType !== 1 && <Col span={6}>
            <Checkbox checked={isDeduplication} onChange={handleDeduplication}>数据去重</Checkbox>
          </Col>}
        </Row>
        <EchartPanel className={styles.chart} option={dataOption} />
      </section>

    </article>
  )
}

export default DeviceStatistic