
import { Radio } from "antd";
import EchartPanel from "hooks/flexibility/EchartPanel";
import { useEffect, useMemo, useState } from "react";
import { getShipTypeOptions, getThermodynamicOptions } from "server/place";
import { getEntryExitPortList, getEntryExitStatistics } from "server/core/entryExitRecords";
import styles from "./index.module.sass";
import Title from "../../../../../../../component/Title";
import EntryExitTable from "features/Core/components/EntryExitRecords/components/EntryExitTable";


interface IPlaceDataInOutPort {
  placeId: any
  /** 来自祖父组件 popup组件隐式传入的关闭窗口函数 */
  onClosePopup?: Function
}

const PlaceDataInOutPort: React.FC<IPlaceDataInOutPort> = ({ placeId, onClosePopup }) => {
  console.debug('PlaceDataInOutPort')

  // 船型统计
  const [shipTypeDate, setShipTypeDate] = useState("0")
  const [shipTypeOptions, setShipTypeOptions] = useState<any>()

  // 数量统计
  const [quantityDate, setQuantityDate] = useState(0)
  const [inQuantityDate, setInQuantityDate] = useState<any>()
  const [outQuantityDate, setOutQuantityDate] = useState<any>()

  // 近1天热力图
  const [thermodynamicOptions, setThermodynamicOptions] = useState<any>()


  // 进出港数据-船型统计
  useEffect(() => {
    async function main() {
      const options = await getShipTypeOptions({ placeId: placeId, type: shipTypeDate })
      setShipTypeOptions(options)
    }
    main()
  }, [placeId, shipTypeDate])

  // 进出港数据-船型统计
  useEffect(() => {
    async function main() {
      const vo = await getEntryExitStatistics(placeId, quantityDate)

      setInQuantityDate(vo.entry)
      setOutQuantityDate(vo.exit)

    }
    main()
  }, [quantityDate, placeId])

  // 进出港数据-热力图统计
  useEffect(() => {
    async function main() {
      const options = await getThermodynamicOptions(placeId)
      setThermodynamicOptions(options)
    }
    main()
  }, [placeId])

  const requestParams = useMemo(() => ({ placeId: placeId }), [placeId])


  return (
    <article className={styles.wrapper}>
      <div className={styles.boxStatistics}>

        <div className={styles.statisticsItem}>

          <div className={styles.itemTitle}>
            <div className={styles.title}>
              <Title title={'数量统计'} />
            </div>
            <div className={styles.condition}>
              <Radio.Group value={quantityDate} size="small" onChange={evt => setQuantityDate(evt.target.value)}>
                <Radio.Button value={0}>今日</Radio.Button>
                <Radio.Button value={2}>近一周</Radio.Button>
                <Radio.Button value={3}>近一月</Radio.Button>
              </Radio.Group>
            </div>
          </div>

          <div className={styles.itemContent}>
            <div className={styles.contItem}>
              <div className={styles.title} style={{ color: '#28e29a' }}>进港</div>
              <div className={styles.num} style={{ color: '#fff' }}>{inQuantityDate}</div>
            </div>
            <div className={styles.contItem} style={{ marginLeft: '100px' }}>
              <div className={styles.title} style={{ color: '#ffa810' }}>出港</div>
              <div className={styles.num} style={{ color: '#4ab5ff' }}>{outQuantityDate}</div>
            </div>
          </div>

        </div>

        <div className={styles.statisticsItem}>

          <div className={styles.itemTitle}>
            <div className={styles.title}><Title title={'船型统计'} /></div>
            <div className={styles.condition}>
              <Radio.Group value={shipTypeDate} size="small" onChange={evt => setShipTypeDate(evt.target.value)}>
                <Radio.Button value="0">今日</Radio.Button>
                <Radio.Button value="2">近一周</Radio.Button>
                <Radio.Button value="3">近一月</Radio.Button>
              </Radio.Group>
            </div>
          </div>

          <EchartPanel option={shipTypeOptions} />

        </div>

        <div className={styles.statisticsItem}>
          <div className={styles.itemTitle}>
            <div className={styles.title}><Title title={'近1天热力图'} /></div>
          </div>

          <EchartPanel option={thermodynamicOptions} />
        </div>

      </div>
      <Title title={'进出港记录'} />
      <div className={styles.boxTable}>
        <EntryExitTable
          request={getEntryExitPortList}
          requestParams={requestParams}
        />
      </div>
    </article>
  )
}

export default PlaceDataInOutPort
