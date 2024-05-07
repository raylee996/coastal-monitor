// import { UseType } from "hooks/flexibility/FormPanel"
// import FormInterface from "hooks/integrity/FormInterface"
import TableInterface from "hooks/integrity/TableInterface"
import { useEffect, useMemo, useRef, useState } from "react"
import { getTaskApprovalDetails, getApprovalDetailList } from "server/system";
import styles from "./index.module.sass";
import Title from "../../../../component/Title";
import { Descriptions } from 'antd';
import './index.sass'

interface Props {
  /** 任务id */
  id: number
  /** 任务编号 */
  task_no: string
}

/* const formInputs: any = [
  [
    '任务名称',
    'taskName', {
      isRow: true,
    }
  ],
  [
    '申请号码类型',
    'numberplate',
  ],
  [
    '翻译号码类型',
    'carNumberplateColor',
  ],
  [
    '申请号码',
    'carType', {
      isRow: true,
    }
  ],
  [
    '申请账号',
    'carColor',
  ],
  [
    '申请人姓名',
    'carBrand',
  ],
  [
    '申请人警号',
    'labelIds',
  ],
  [
    '申请理由',
    'taskDesc',
  ]
] */


const columns = [
  ['操作事项', 'operateTypeName'],
  ['处理意见', 'statusName'],
  // ['备注', 'operateDesc'],
  ['操作人', 'operateName'],
  ['操作时间', 'createTime']
]

const WorkbenchDetail: React.FC<Props> = ({ id, task_no }) => {
  console.debug('WorkbenchDetail')


  const tableRef = useRef<any>(null)


  const [initData, setInitData] = useState<any>()


  useEffect(() => {
    async function main() {
      if (id) {
        const res = await getTaskApprovalDetails({ id })
        setInitData(res)
      }
    }
    main()
  }, [id])


  const extraParams = useMemo(() => ({
    taskId: id
  }), [id])


  return (
    <article className={`${styles.wrapper} workDetail`}>

      <div className={styles.tagLabel}>
        <Title title={'申请信息'} />
        <div style={{ color: '#a6cdff', fontSize: '12px' }}>{`任务编号：${task_no || '--'}`}</div>
      </div>

      <Descriptions bordered size='middle'>
        <Descriptions.Item label="任务名称" span={3}><div >{initData?.taskName || '--'}</div></Descriptions.Item>
        <Descriptions.Item label="布控名称" ><div >{initData?.controlName || '--'}</div></Descriptions.Item>
        <Descriptions.Item label="布控等级" ><div >{initData?.control_levelName || '--'}</div></Descriptions.Item>
        <Descriptions.Item label="有效期" ><div >{initData?.controlExpiryDate || '--'}</div></Descriptions.Item>
        <Descriptions.Item label="布控分类" ><div >{initData?.controlTypeName || '--'}</div></Descriptions.Item>
        <Descriptions.Item label="布控区域" span={initData?.continueDay ? 1 : 2}><div >{initData?.controlArea || '--'}</div></Descriptions.Item>
        {initData?.continueDay && <Descriptions.Item label="续控天数"><div >{initData.continueDay}</div></Descriptions.Item>}
        <Descriptions.Item label="布控事由" span={3}><div >{initData?.taskDesc || initData?.controlReason || '--'}</div></Descriptions.Item>
      </Descriptions>

      <div className={styles.tagLabel}><Title title={'操作记录'} /></div>

      <TableInterface
        extraParams={extraParams}
        ref={tableRef}
        columns={columns}
        request={getApprovalDetailList}
      />

    </article>
  )
}

export default WorkbenchDetail