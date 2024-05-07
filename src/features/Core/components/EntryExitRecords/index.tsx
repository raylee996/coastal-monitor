import { Form } from "antd";
import { useAppDispatch } from "app/hooks";
import Title from "component/Title";
import dayjs from "dayjs";
import DataCarousel from "features/Situation/component/DataCarousel";
import EchartPanel from "hooks/flexibility/EchartPanel";
import { DayjsPair } from "hooks/hooks";
import _ from "lodash";
import { useEffect, useState } from "react";
import { getEntryExitPortList, getEntryExitPortThermalMap, queryEntryExitStatisticsDay } from "server/core/entryExitRecords";
import { setSituationalAnalysis } from "slice/coreMapSlice";
import EntryExitTable from "./components/EntryExitTable";
import styles from "./index.module.sass";


interface Props {
  /** 场所id */
  id?: string
  /** 时间范围 */
  range?: DayjsPair
}

const EntryExitRecords: React.FC<Props> = ({ id, range }) => {
  console.debug('EntryExitRecords')


  const dispatch = useAppDispatch()


  const [form] = Form.useForm();


  const [data, setData] = useState([])
  const [dayStatistics, setDayStatistics] = useState<any[]>([])
  const [entryExitLine, setEntryExitLine] = useState<any>()
  const [queryInitData] = useState(() => {
    let result: any = {}
    if (id) {
      result.placeId = id
    }
    if (range) {
      result.datetime = range
    }
    if (_.isEmpty(result)) {
      return undefined
    } else {
      return result
    }
  })


  useEffect(() => {
    dispatch(setSituationalAnalysis(false))
    return () => {
      dispatch(setSituationalAnalysis(true))
    }
  }, [dispatch])

  // 获取港口今日统计
  useEffect(() => {
    async function getDayStatistics() {
      const res = await queryEntryExitStatisticsDay({ type: 0 })
      setDayStatistics(res || [])
    }
    getDayStatistics()
  }, [])

  useEffect(() => {
    let tempArr: any = []
    if (dayStatistics.length !== 0) {
      dayStatistics.forEach((item: any) => {

        const handleClick = () => {
          const id = String(item.placeId)
          form.setFieldValue('placeId', id)
          form.setFieldValue('datetime', [dayjs().hour(0).minute(0).second(0), dayjs()])
          form.submit()
        }

        tempArr.push({
          component:
            <div key={item.placeId} className={`${styles.numItem}`}>
              <div className={`${styles.box}`} onClick={handleClick}>
                <div className={styles.numLabel} title={item.placeName} >{item.placeName || '--'}</div>
                <div className={styles.numContent}>
                  <div className={styles.entryExit}>
                    <div className={styles.numStyle}>{item.entry || 0}</div>
                    <div className={styles.labelStyle}>进港</div>
                  </div>
                  <div className={styles.entryExit}>
                    <div className={`${styles.numStyle} ${styles.outerNumColor}`}>{item.exit || 0}</div>
                    <div className={`${styles.labelStyle} ${styles.outerLabelColor}`}>出港</div>
                  </div>
                </div>
              </div>
            </div>
        })
      })
      setData(tempArr)
    }
  }, [dayStatistics, form])

  // 进出港数据-热力图统计
  useEffect(() => {
    async function main() {
      const options = await getEntryExitPortThermalMap({ type: 1 })
      setEntryExitLine(options)
    }
    main()
  }, [])


  return (
    <article className={styles.wrapper}>
      <div className={styles.top}>
        <div className={styles.num}>
          <Title title={'今日统计'} />
          <div className={styles.numBox}>
            <DataCarousel
              playBtn
              infinite={false}
              data={data}
              dotPosition={'bottom'}
              autoplay={false}
              slidesToShow={3}
              slidesToScroll={3}
            />
          </div>
        </div>
        <div className={styles.line}>
          <Title title={'近1天热力图'} />
          <div className={styles.linebox}>
            <EchartPanel option={entryExitLine} />
          </div>
        </div>
      </div>
      <Title title={'进出港记录'} />
      <div className={styles.content}>
        <EntryExitTable
          request={getEntryExitPortList}
          tableForm={form}
          isShowPlaceSelect={true}
          queryInitData={queryInitData}
        />
      </div>
    </article>
  )
}

export default EntryExitRecords