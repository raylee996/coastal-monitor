import { Form } from "antd";
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

interface IFrequented {
  persionId: any
  personItem?: any
}

const inputs = [
  [
    '停留次数',
    'maxStayNum',
    InputType.component,
    {
      component: NumberInput,
      unit: '次'
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
  ['停留次数', 'stayNum'],
]

const Frequented: React.FC<IFrequented> = (props) => {
  console.debug('Frequented', props)
  const { persionId } = props

  const tableRef = useRef<any>(null)

  const [tarckListData, setTarckListData] = useState<any[]>([])

  const [form] = Form.useForm();

  const [taskId, setTaskId] = useState<string>()

  const [timers, setTimers] = useState<any>()

  const [status, setStatus] = useState<number>(0)

  // 给表单赋初始值setFieldsValue
  useEffect(() => {
    form?.setFieldsValue({
      maxStayNum: undefined,
      searchTime: [dayjs(), dayjs().subtract(1, 'month')]
    })
  }, [form]);

  useEffect(() => {
    persionId && handleSubmit({ archiveType: 0, archiveId: persionId, searchTime: [dayjs(), dayjs().subtract(1, 'month')] })
  }, [persionId])

  useEffect(() => {
    let timer: any = null
    if (taskId) {
      timer && window.clearInterval(timer)
      timer = window.setInterval(function () {
        queryData({ taskId })
      }, 10000)
      setTimers(timer)
    }
    return () => window.clearInterval(timer);
  }, [taskId])

  useEffect(() => {
    if (status === 2 && timers) {
      window.clearInterval(timers)
      setTimers(null)
    }
  }, [status, timers])

  async function handleSubmit(params: any) {
    const vo = await submitStayTask(params)
    console.log(vo, "vo")
    setTaskId(vo?.taskId)
  }

  async function queryData(params: any) {
    // 获取目标物坐标
    const vo = await searchStayFrequented(params)
    console.log(vo, "vo")
    setStatus(vo?.status || 0)
    // 组装数据
    vo?.status === 2 && setTarckListData(vo?.result || [])
  }

  function handleQuery(values: any) {
    console.log(values, 'values')
    setStatus(0)
    persionId && handleSubmit({ archiveType: 0, archiveId: persionId, ...values })
  }

  return (
    <article className={styles.wapper}>
      <div className={`${styles.panelMap}`}>
        <div className={styles.panelTitle}>
          <div className={`${styles.titleBox} ${'dc-form'}`}>
            <FormPanel
              form={form}
              inputs={inputs}
              onFinish={handleQuery}
              formProps={{
                layout: 'inline',
              }}
              options={{
                isShowItemButton: true,
                isNotShowFooter: true,
                submitText: '查询'
              }} />
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
    </article>
  )
}

export default Frequented
