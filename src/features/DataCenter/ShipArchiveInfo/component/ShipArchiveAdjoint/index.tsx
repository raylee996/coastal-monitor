import { Form, FormProps, PaginationProps, TableProps } from "antd";
import TargetTrackPlay, { targetTrackColorList } from "component/TargetTrackPlay";
import { coincidenceDict } from "helper/dictionary";
import DateRangeSimple from "hooks/basis/DateRangeSimple";
import FormPanel, { InputType } from "hooks/flexibility/FormPanel";
import TableInterface from "hooks/integrity/TableInterface";
import dayjs from 'dayjs';
import { useCallback, useEffect, useState, } from "react";
import { addFollowTask, getMatchingRails } from "server/ship";
import ImageCard from "../../../components/ImageCard";
import styles from "./index.module.sass";
import { ColType } from "hooks/flexibility/TablePanel";
import Title from "component/Title";
import { useMemo } from "react";
import { DayjsRange } from "hooks/hooks";
import DataContent from "./components/DataContent";


const inputs: any[] = [
  ['时间范围', 'datetime', InputType.dateTimeRange],
  ['轨迹类型', 'coincidence', InputType.select, { dict: coincidenceDict }],
]

const tableProps: TableProps<any> = {
  size: 'small'
}

const options = {
  isShowItemButton: true,
  isNotShowFooter: true,
  submitText: '查询'
}

const formProps: FormProps<any> = {
  layout: 'inline'
}

const paginationProps: PaginationProps = {
  size: 'small',
  showQuickJumper: false,
  showSizeChanger: false
}

interface Props {
  /** 船舶档案数据 */
  shipData?: any
}

const ShipArchiveAdjoint: React.FC<Props> = ({ shipData }) => {
  console.debug('ShipArchiveAdjoint')


  const [form] = Form.useForm()


  const [trackData, setTrackData] = useState<any[]>([])
  const [tableData, setTableData] = useState<any[]>([])
  const [queryDateRange, setQueryDateRange] = useState<DayjsRange>([dayjs().set('h', 0).set('m', 0).set('s', 0).subtract(7, "day"), dayjs()])
  const [tableDataSource, setTableDataSource] = useState<any[]>()
  const [isLoading, setIsLoading] = useState(false)
  const [targetShip, setTargetShip] = useState<any>()


  const columns = useMemo(() => [
    ['序号', 'ordinal', ColType.backgroundColor, {
      getColor: (record: any) => {
        const result = record.content === shipData.mmsi || record.content === shipData.radarNumber
        return result ? targetTrackColorList[0] : targetTrackColorList[1]
      },
      itemProps: { width: 60 }
    }],
    ['数据类型', 'codeTypeName'],
    ['数据内容', 'content', ColType.component, { component: DataContent }],
    ['采集时间', 'capTime'],
    ['采集地址', 'capAddress']
  ], [shipData])


  // 请求执行伴随任务
  useEffect(() => {
    let ctr: AbortController
    async function main() {
      if (shipData && (shipData.mmsi || shipData.radarNumber)) {
        const params = {
          shipData,
          queryDateRange
        }
        setIsLoading(true)
        try {
          ctr = new AbortController()
          const vo = await addFollowTask(params, ctr)
          setTableDataSource(vo.result)
          setIsLoading(false)
        } catch (error) {
          setTableDataSource([])
          setIsLoading(false)
        }
      }
    }
    main()
    return () => {
      ctr?.abort()
    }
  }, [shipData, queryDateRange])


  const handleSelected = useCallback(
    async (items: any[]) => {
      if (items.length !== 0) {
        const [tagData] = items
        const sTime = dayjs(tagData.firstTime || undefined).subtract(30, 'm')
        const eTime = dayjs(tagData.latestTime || undefined).add(30, 'm')
        const datetime = [sTime, eTime]
        const queryParams = {
          coincidence: false,
          datetime
        }
        form.setFieldsValue(queryParams)
        const [_tableData, _trackData] = await getMatchingRails(shipData, tagData, queryParams)
        setTargetShip(tagData)
        setTrackData(_trackData)
        setTableData(_tableData)
        form.setFieldsValue({
          coincidence: false,
          datetime
        })
      }
    },
    [form, shipData],
  )

  const handleChange = useCallback(
    async (params: DayjsRange) => {
      setQueryDateRange(params)
    },
    [],
  )

  const handleFinish = useCallback(
    async (params: any) => {
      const [_tableData, _trackData] = await getMatchingRails(shipData, targetShip, params)
      setTrackData(_trackData)
      setTableData(_tableData)
    },
    [shipData, targetShip],
  )


  const cardProps = useMemo(() => ({
    isLoading: isLoading
  }), [isLoading])

  const cardOptions = useMemo(() => ({
    isRadio: true,
    isSelectedFirst: true,
    onSelected: handleSelected
  }), [handleSelected])


  return (
    <article className={styles.wrapper}>
      <section className={styles.archive}>
        <article className={styles.adjointShip}>
          <header>
            <Title title="伴随船舶" />
            <DateRangeSimple isDisabledAfter={true} disabledBefore={30} defaultValue={queryDateRange} onChange={handleChange} />
          </header>
          <section>
            <TableInterface
              tableDataSource={tableDataSource}
              card={ImageCard}
              cardOptions={cardOptions}
              cardProps={cardProps}
              paginationProps={paginationProps}
            />
          </section>
        </article>
      </section>
      <section className={styles.content}>
        <header>
          <Title title="轨迹信息" />
          <section className={styles.query}>
            <FormPanel
              form={form}
              inputs={inputs}
              formProps={formProps}
              options={options}
              onFinish={handleFinish} />
          </section>
        </header>
        <section className={styles.mapBox} >
          <TargetTrackPlay data={trackData} />
        </section>
        <footer className={styles.table}>
          <TableInterface
            columns={columns}
            tableProps={tableProps}
            tableDataSource={tableData}
          />
        </footer>
      </section>
    </article>
  )
}

export default ShipArchiveAdjoint