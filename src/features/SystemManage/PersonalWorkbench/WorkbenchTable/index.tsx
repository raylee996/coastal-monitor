import { Popconfirm,Button } from "antd";
import { approvalStatusDesc } from "helper/dictionary";
import popup from "hooks/basis/Popup";
import { InputType } from "hooks/flexibility/FormPanel";
import TableInterface from "hooks/integrity/TableInterface";
import { useRef } from "react";
import { getTaskApprovalPageList, updateTaskApproval } from "server/system";
import WorkbenchDetail from "../WorkbenchDetail";
import styles from "./index.module.sass";
import { ColType } from "hooks/flexibility/TablePanel";

const WorkbenchTable: React.FC = () => {
  console.debug('WorkbenchTable')

  const tableRef = useRef<any>(null)

  const columns = [
    ['任务编号', 'task_no', ColType.tooltip],
    ['任务名称', 'task_name', ColType.tooltip],
    ['申请人', 'names'],
    ['申请时间', 'create_time', ColType.tooltip],
    ['任务状态', 'statusName'],
    ['审批人', 'approval_name'],
    ['审批时间', 'approval_time', ColType.tooltip],
    ['操作', '', {
      itemProps: {
        width: '180px',
        render: (text: any, record: any) => {
          // 状态(0:待审批)
          const showBtn = {
            approval: [0].includes(record.status),
          }
          return (
            <section>
              {showBtn.approval && <Button type={"link"} onClick={() => handleAreaFinish(record.id, 1)} className={styles.detailBtn}>通过</Button>}
              {showBtn.approval && <Popconfirm title="确认审批不通过？" onConfirm={() => handleAreaFinish(record.id, 2)}>
                <Button type={"link"} className={`${styles.detailBtn} ${styles.colorError}`}>不通过</Button>
              </Popconfirm>}
              <Button type={"link"} onClick={() => showDetail(record)} className={styles.detailBtn}>查看</Button>
            </section>
          )
        }
      }
    }],
  ]

  const queryInputs = [
    ['关键字',
      'key',
      {
        placeholder: '请输入关键字搜索',
        allowClear: true,
        style: { width: '360px' }
      }
    ],
    [
      '任务状态', 'status', InputType.select, {
        dict: approvalStatusDesc,
        placeholder: '请选择任务状态',
        style: { width: '180px' }
      }],
  ]

  //刷新表格数据
  function refreshTable() {
    tableRef.current && tableRef.current.onRefresh()
  }

  async function handleAreaFinish(id: number, status: number) {
    console.debug('handle Finish')
    // 审批操作
    await updateTaskApproval({ id, status })
    refreshTable()
  }

  function showDetail(record: any) {
    popup(<WorkbenchDetail id={record.id} task_no={record.task_no} />, { title: '审批信息查看', size: 'large' })
  }

  return (
    <article className={styles.wrapper}>
      <TableInterface
        ref={tableRef}
        columns={columns}
        queryInputs={queryInputs}
        request={getTaskApprovalPageList}
      />
    </article>
  )
}

export default WorkbenchTable