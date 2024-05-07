import { Button, Form, FormProps, TableProps } from "antd";
import Checkbox from "antd/es/checkbox/Checkbox";
import TargetTrackPlay from "component/TargetTrackPlay";
import dayjs from "dayjs";
import FormPanel, { InputType } from "hooks/flexibility/FormPanel";
import { DayjsPair } from "hooks/hooks";
import TableInterface from "hooks/integrity/TableInterface";
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { queryWisdomSearchTracking } from "server/core/wisdomSearch";
// import VirtualTable from "./components/VirtualTable";
import styles from "./index.module.sass";


const columns = [
  ['数据类型', 'codeTypeName'],
  ['目标ID', 'targetId'],
  ['数据内容', 'content'],
  ['航速/节', 'speed'],
  ['航向', 'course'],
  ['航艏向', 'trueHeading'],
  ['经纬度', 'LatLng'],
  ['采集时间', 'capTime'],
  ['采集地址', 'capAddress'],
]

const inputs: any[] = [
  ['时间范围', 'datetime', InputType.dateTimeRange],
]

const formProps: FormProps = {
  layout: 'inline'
}

const options = {
  isShowItemButton: true,
  isNotShowFooter: true,
  isShowReset: false,
  submitText: '查询'
}

const datetime: DayjsPair = [dayjs().subtract(1, 'day'), dayjs()]

interface Props {
  /** 
   * 0: 'faceId', 1: 'licensePlate', 2: 'imsi', 
   * 3: 'imei', 4: 'mac', 5: 'phone', 
   * 6: 'mmsi', 7: 'uniqueId', 8: targetId
   */
  codeType: number
  /** 选中的数据 */
  targetList?: any[]
  /** 请求参数 */
  params?: {
    datetime: DayjsPair
  }
}

const TrajectoryAnalysis: React.FC<Props> = ({ codeType, targetList, params }) => {
  console.debug('TrajectoryAnalysis')


  const trackRef = useRef<any>(null);


  const [form] = Form.useForm();


  const [trackData, setTrackData] = useState<any>()
  const [tableData, setTableData] = useState<any[]>([])
  const [isShowTable, setIsShowTable] = useState<boolean>(true)
  const [dateTimeRange, setdateTimeRange] = useState<DayjsPair>()
  const [isLoading, setIsLoading] = useState(false)

  // 是否显示时间标签
  const [isNotShowTimeLabel, setIsNotShowTimeLabel] = useState(false)
  const [checkedTimeLabel, setCheckedTimeLabel] = useState(true)


  useEffect(() => {
    if (params) {
      form.setFieldsValue(params)
      setdateTimeRange(params.datetime)
    } else {
      form.setFieldsValue({ datetime })
      setdateTimeRange(datetime)
    }
  }, [form, params]);


  const queryTrackData = useCallback(
    async (codeType: number, timeArr?: any[]) => {
      if (targetList) {
        setIsLoading(true)
        const res = await queryWisdomSearchTracking(codeType, targetList, timeArr)
        setTrackData(res?.trackData)
        setTableData(res?.tableData)
        setIsLoading(false)
      }
    },
    [targetList],
  )


  useEffect(() => {
    queryTrackData(codeType, params?.datetime || datetime)
  }, [codeType, params?.datetime, queryTrackData])


  const handleFinish = useCallback(
    async (params: any) => {
      setdateTimeRange(params.datetime)
      queryTrackData(codeType, params?.datetime)
    },
    [codeType, queryTrackData],
  )

  const handleHiddle = useCallback(
    () => {
      setIsShowTable(!isShowTable)
      setTimeout(() => {
        trackRef.current.mapLeaflet.map.invalidateSize(true)
      }, 1000);
    },
    [isShowTable],
  )

  const tableProps = useMemo<TableProps<any>>(() => ({
    loading: isLoading,
    size: 'small'
  }), [isLoading])


  const tableClassName = useMemo(() => isShowTable ? styles.tableBox : styles.tableBoxHide, [isShowTable])
  const titleClassName = useMemo(() => isShowTable ? styles.titleBox : styles.titleBoxHide, [isShowTable])
  const mapClassName = useMemo(() => isShowTable ? styles.mapBox : styles.mapBoxFull, [isShowTable])

  function handleShowTimeLabel(e: any) {
    setIsNotShowTimeLabel(!e.target.checked)
    setCheckedTimeLabel(e.target.checked)
  }

  return (
    <article className={styles.content}>

      <header className={styles.header}>
        <FormPanel
          form={form}
          inputs={inputs}
          formProps={formProps}
          options={options}
          onAsyncFinish={handleFinish}
        />
        <Button type="primary" onClick={handleHiddle}>轨迹详情</Button>
        <div className={styles.showTimeLabel}>
          <Checkbox checked={checkedTimeLabel} onChange={(e) => handleShowTimeLabel(e)}>显示时间标签</Checkbox>
        </div>
      </header>

      <section className={mapClassName} >
        <TargetTrackPlay ref={trackRef} data={trackData} dateTimeRange={dateTimeRange} isNotShowTimeLabel={isNotShowTimeLabel} />
      </section>

      <section className={titleClassName}>
        轨迹详情
      </section>

      <section className={tableClassName}>
        <TableInterface
          columns={columns}
          tableProps={tableProps}
          tableDataSource={tableData}
        />
      </section>

    </article>
  )
}

export default TrajectoryAnalysis