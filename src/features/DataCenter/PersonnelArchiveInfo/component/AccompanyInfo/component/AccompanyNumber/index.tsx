import { Col, Row, Spin } from "antd";
import dayjs from "dayjs";
import { followTaskStatusDict, getDictName } from "helper/dictionary";
import DateTimeRangeSimple from "hooks/basis/DateTimeRangeSimple";
import { DayjsRange } from "hooks/hooks";
import TableInterface from "hooks/integrity/TableInterface";
import { useEffect, useState } from "react";
import { addFollowTask } from "server/personnel";
import { getFollowTask } from "server/ship";
import styles from "./index.module.sass";


const numberColumns = [
  ['帧码', 'tagCode'],
  ['次数', 'followNum', { itemProps: { width: 50 } }],
  [
    ['查看档案', (record: any) => {
      console.log(record)
    }]
  ]
]

interface Props {
  /** 数据请求的额外参数 */
  params?: any

  /** 任务id */
  taskId?: any

  /** 点击查看的回调 */
  onSelect?: (record: any) => void
}

const AccompanyNumber: React.FC<Props> = ({ params, taskId }) => {
  console.debug('AccompanyNumber')

  const [isLoading, setIsLoading] = useState(true)
  const [tipLoading, setTipLoading] = useState<string>()
  const [queryDateRange, setQueryDateRange] = useState<DayjsRange>([dayjs().set('h', 0).set('m', 0).set('s', 0).subtract(1, "day"), dayjs()])
  const [followTask, setFollowTask] = useState<any>()
  const [tableDataSource, setTableDataSource] = useState<any[]>()


  useEffect(() => {
    if (taskId) {
      setFollowTask({
        taskId: taskId
      })
    }
  }, [taskId])

  useEffect(() => {
    async function main() {
      if (params) {
        const _params = {
          ...params,
          queryDateRange
        }
        setIsLoading(true)
        const vo = await addFollowTask(_params)
        if (vo.status !== 3) {
          setFollowTask(vo)
        } else {
          setIsLoading(false)
        }
      }
    }
    main()
  }, [params, queryDateRange])

  // 获取伴随信息
  useEffect(() => {
    let _worker: Worker
    if (followTask && followTask.status !== 3) { //0 已创建 1 分析中  2 已完成，3失败
      _worker = getFollowTask(followTask, (res: any) => {
        if (res.code === 200) {
          const data = res.data
          if (data.status === 2) {
            setTableDataSource(data.result)
            setIsLoading(false)
            _worker.terminate()
          } else if (data.status === 3) {
            setIsLoading(false)
            _worker.terminate()
          } else {
            const statusName = getDictName(followTaskStatusDict, data.status)
            setTipLoading(statusName)
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


  function handleChange(values: DayjsRange) {
    setQueryDateRange(values)
  }

  return (
    <article className={styles.wrapper}>
      <header>
        <Row>
          <Col span={4}><div className={styles.label}>时间</div></Col>
          <Col span={20}>
            <DateTimeRangeSimple
              isDisabledAfter={true}
              defaultValue={queryDateRange}
              onChange={handleChange}
              allowClear={false}
            /></Col>
        </Row>
      </header>
      {isLoading &&
        <section className={styles.spinBox}>
          <Spin tip={tipLoading}></Spin>
        </section>
      }
      {!isLoading &&
        <section className={styles.spinBox}>
          <TableInterface
            columns={numberColumns}
            tableDataSource={tableDataSource}
            tableProps={{
              size: 'small'
            }}
            paginationProps={{
              pageSize: 5,
              size: 'small',
              showQuickJumper: false,
              showSizeChanger: false
            }}
          />
        </section>
      }
    </article>
  )
}

export default AccompanyNumber