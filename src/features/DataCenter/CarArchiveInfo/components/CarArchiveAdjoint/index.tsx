import { Form } from "antd";
import TargetTrackPlay, { targetTrackColorList } from "component/TargetTrackPlay";
import { coincidenceDict, followTaskStatusDict, getDictName } from "helper/dictionary";
import DateRangeSimple from "hooks/basis/DateRangeSimple";
import FormPanel, { InputType } from "hooks/flexibility/FormPanel";
import TableInterface, { TableInfo } from "hooks/integrity/TableInterface";
import dayjs from 'dayjs';
import { useEffect, useState, } from "react";
import ImageCard from "../../../components/ImageCard";
import styles from "./index.module.sass";
import { ColType } from "hooks/flexibility/TablePanel";
import { addFollowTask, getCarAdjointTrack } from "server/car";
import { getFollowTask } from "server/ship";
import Title from "component/Title";
import { DayjsRange } from "hooks/hooks";


const inputs: any[] = [
  ['时间范围', 'datetime', InputType.dateTimeRange],
  ['轨迹类型', 'coincidence', InputType.select, { dict: coincidenceDict }],
]

interface Props {
  /** 车辆档案数据 */
  data?: any
}

const CarArchiveAdjoint: React.FC<Props> = ({ data }) => {
  console.debug('CarArchiveAdjoint')

  const [form] = Form.useForm()

  const [trackData, setTrackData] = useState<any[]>([])
  const [tableData, setTableData] = useState<any[]>([])

  const [queryDateRange, setQueryDateRange] = useState<DayjsRange>([dayjs().set('h', 0).set('m', 0).set('s', 0).subtract(1, "day"), dayjs()])
  const [tableInfo, setTableInfo] = useState<TableInfo>()
  const [isLoading, setIsLoading] = useState(false)
  const [tipLoading, setTipLoading] = useState<string>()
  const [targetShip, setTargetShip] = useState<any>()
  const [followTask, setFollowTask] = useState<any>()

  const columns: any[] = [
    ['序号', 'ordinal', ColType.backgroundColor, {
      getColor: (record: any) => {
        const result = record.content === data.mmsi
        return result ? targetTrackColorList[0] : targetTrackColorList[1]
      },
      itemProps: { width: 60 }
    }],
    ['数据类型', 'codeTypeName'],
    ['数据内容', 'content'],
    ['采集时间', 'capTime'],
    ['采集地址', 'capAddress']
  ]

  // 请求执行伴随任务
  useEffect(() => {
    async function main() {
      if (data) {
        const params = {
          ...data,
          queryDateRange
        }
        setIsLoading(true)
        const vo = await addFollowTask(params)
        if (vo.status !== 3) {
          // vo.taskId = '604'
          setFollowTask(vo)
        } else {
          setIsLoading(false)
        }
      }
    }
    main()
  }, [data, queryDateRange])

  // 获取伴随信息
  useEffect(() => {
    let _worker: Worker
    if (followTask && followTask.status !== 3) { //0 已创建 1 分析中  2 已完成，3失败
      _worker = getFollowTask(followTask, (res: any) => {
        if (res.code === 200) {
          const data = res.data
          if (data.status === 2) {
            setTableInfo({
              data: data.result,
              total: data.result.length
            })
            setIsLoading(false)
            _worker.terminate()
          } else if (data.status === 3) {
            setIsLoading(false)
            _worker.terminate()
          } else {
            const statusName = getDictName(followTaskStatusDict, data.status)
            setTipLoading(statusName)
            setIsLoading(false)
            _worker.terminate()
          }
        } else {
          setIsLoading(false)
          _worker.terminate()
        }
      })
    }
    return () => {
      _worker && _worker.terminate()
    }
  }, [followTask])

  async function handleSelected(items: any[]) {
    if (items.length !== 0) {
      const [tagData] = items
      const queryParams = {
        coincidence: false,
        datetime: queryDateRange
      }
      form.setFieldsValue(queryParams)
      const [_tableData, _trackData] = await getCarAdjointTrack(data, tagData, queryParams)
      setTargetShip(tagData)
      setTrackData(_trackData)
      setTableData(_tableData)
      form.setFieldsValue({
        coincidence: false,
        datetime: queryDateRange
      })
    }
  }

  async function handleChange(params: DayjsRange) {
    if(!params){
      return
    }
    setQueryDateRange(params)
  }

  async function handleFinish(params: any) {
    const [_tableData, _trackData] = await getCarAdjointTrack(data, targetShip, params)
    setTrackData(_trackData)
    setTableData(_tableData)
  }

  return (
    <article className={styles.wrapper}>
      <section className={styles.archive}>
        <article className={styles.adjointShip}>
          <header>
            {/* <div className={styles.title}>伴随车辆</div> */}
            <Title title="伴随车辆" />
            <DateRangeSimple isDisabledAfter={true} disabledBefore={30} defaultValue={queryDateRange} onChange={handleChange} />
          </header>
          <section>
            <TableInterface
              tableInfo={tableInfo}
              card={ImageCard}
              cardOptions={{
                isRadio: true,
                isSelectedFirst: true,
                onSelected: handleSelected
              }}
              cardProps={{
                isLoading: isLoading,
                tipLoading: tipLoading
              }}
              paginationProps={{
                size: 'small',
                showQuickJumper: false,
                showSizeChanger: false
              }}
            />
          </section>
        </article>
      </section>
      <section className={styles.content}>
        <header>
          {/* <Typography.Title level={5}>轨迹信息</Typography.Title> */}
          <Title title="轨迹信息" />
          <section className={styles.query}>
            <FormPanel
              form={form}
              inputs={inputs}
              formProps={{
                layout: 'inline'
              }}
              options={{
                isShowItemButton: true,
                isNotShowFooter: true,
                submitText: '查询'
              }}
              onFinish={handleFinish} />
          </section>
        </header>
        <section className={styles.mapBox} >
          <TargetTrackPlay data={trackData} />
        </section>
        <footer className={styles.table}>
          <TableInterface
            columns={columns}
            tableProps={{
              rowKey: 'capAddress'
            }}
            tableDataSource={tableData}
          />
        </footer>
      </section>
    </article>
  )
}

export default CarArchiveAdjoint