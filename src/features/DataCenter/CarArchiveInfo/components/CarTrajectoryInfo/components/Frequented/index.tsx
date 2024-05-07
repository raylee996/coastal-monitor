import { Form, FormProps, Spin } from "antd";
import DragView from "component/DragView";
import MapDottingInteraction from "component/MapDottingInteraction";
import dayjs from "dayjs";
import NumberInput from "features/DataCenter/components/NumberInput";
import FormPanel, { InputType } from "hooks/flexibility/FormPanel";
import TableInterface from "hooks/integrity/TableInterface";
import { useEffect, useRef, useState } from "react";
import { searchStayFrequented, submitStayTask } from "server/stayFrequented";
import styles from "./index.module.sass";
import './index.sass';



const inputs = [
  [
    '出现天数',
    'maxStayNum',
    InputType.component,
    {
      component: NumberInput,
      unit: '天'
    }
  ],
  [
    '时间',
    'searchTime',
    InputType.dateTimeRange
  ]
]

const columns = [
  ['地址', 'address'],
  ['出现天数', 'stayNum'],
]

const formProps: FormProps<any> = {
  layout: 'inline'
}

const options = {
  isShowItemButton: true,
  isNotShowFooter: true,
  submitText: '查询'
}

interface Props {
  persionId: any
  personItem?: any
}

const Frequented: React.FC<Props> = ({ persionId }) => {
  console.debug('Frequented')


  const tableRef = useRef<any>(null)


  const [form] = Form.useForm();


  const [taskId, setTaskId] = useState<string>()
  const [timers, setTimers] = useState<any>()
  const [status, setStatus] = useState<number>(0)
  const [tarckListData, setTarckListData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)


  // 给表单赋初始值setFieldsValue
  useEffect(() => {
    form?.setFieldsValue({
      maxStayNum: undefined,
      searchTime: [dayjs(), dayjs().subtract(1, 'month')]
    })
  }, [form]);

  useEffect(() => {
    persionId && handleSubmit({ archiveType: 1, archiveId: persionId, searchTime: [dayjs(), dayjs().subtract(1, 'month')] })
  }, [persionId])

  useEffect(() => {
    let timer: any = null
    if (taskId) {
      timer && clearInterval(timer)
      timer = setInterval(() => {
        queryData({ taskId })
      }, 2000)
      setTimers(timer)

      queryData({ taskId })
    }
    return () => clearInterval(timer);
  }, [taskId])

  useEffect(() => {
    if (status === 2 && timers) {
      clearInterval(timers)
      setTimers(null)
      setIsLoading(false)
    }
  }, [status, timers])


  async function handleSubmit(params: any) {
    setIsLoading(true)
    const vo = await submitStayTask(params)
    setTaskId(vo?.taskId)
    setIsLoading(false)
  }

  async function queryData(params: any) {
    // 获取目标物坐标
    const vo = await searchStayFrequented(params)
    setStatus(vo?.status || 0)
    // 组装数据
    vo?.status === 2 && setTarckListData(vo?.result || [])
  }

  function handleQuery(values: any) {
    setStatus(0)
    persionId && handleSubmit({ archiveType: 1, archiveId: persionId, ...values })
  }


  return (
    <article className={styles.wapper}>
      <div className={styles.panelMap}>
        <div className={styles.panelTitle}>
          <div className={`${styles.titleBox} ${'dc-form'}`}>
            <FormPanel
              form={form}
              inputs={inputs}
              onFinish={handleQuery}
              formProps={formProps}
              options={options} />
          </div>

        </div>

        <div className={styles.panelContent}>
          <MapDottingInteraction pointList={tarckListData.filter(item => item?.lat && item?.lng)} icon={L.icon({
            iconUrl: require(`images/mapIcon/addressIcon.png`),
            iconSize: [40, 40],
          })} />
        </div>

        <DragView
          style={{
            width: '360px',
            right: '20px',
            top: '60px'
          }}
          title='常去地'
          content={
            <TableInterface
              ref={tableRef}
              columns={columns}
              tableDataSource={tarckListData}
              tableProps={{
                scroll: { y: '300px' },
                size: 'small'
              }}
            />
          }
        />

      </div>

      {isLoading &&
        <aside className={styles.loading}>
          <Spin tip="加载数据中" size="large"></Spin>
        </aside>
      }

    </article>
  )
}

export default Frequented
