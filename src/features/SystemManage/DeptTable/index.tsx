import { PlusOutlined } from "@ant-design/icons";
import { deptStatusDict } from "helper/dictionary";
// import popup from "hooks/basis/Popup";
// import popupmini from "component/PopupMini";
import { InputType } from "hooks/flexibility/FormPanel";
// import { ActionType } from "hooks/flexibility/TablePanel";
import TableInterface from "hooks/integrity/TableInterface";
import React, { useRef } from "react";
import { deleltDeptData, getDeptTable } from "server/user";
import DeptDetail from "../DeptDetail";
import styles from "./index.module.sass";
import WindowDelet from "component/WindowDelet";
import popupUI from "component/PopupUI";

const tableOptions = {
  isShowRowNumber: false
}

const tableProps = {
  rowKey: 'deptId'
}

const queryInputs = [
  ['部门名称', 'deptName'],
  ['部门状态', 'status', InputType.select, { dict: deptStatusDict, style: { width: '180px' } }],
]

const DeptTable: React.FC = () => {
  console.debug('DeptTable')

  const tableRef = useRef<any>()

  const columns = [
    ['部门名称', 'deptName', { itemProps: { width: 260 } }],
    ['上级部门名称', 'parentName'],
    ['负责人', 'leader'],
    ['负责人联系电话', 'phone'],
    ['显示顺序', 'orderNum'],
    ['备注', 'remark'],
    ['部门状态', 'statusName'],
    ['创建时间', 'createTime'],
    [
      ['编辑', (record: any) => {
        popupUI(<DeptDetail id={record.deptId} onSuccess={() => {
          tableRef.current.onRefresh()
        }} />, { title: '编辑部门', size: 'auto' })
      }],
      ['删除', async (record: any) => {
        popupUI(<WindowDelet title={'确定删除部门吗？'} request={deleltDeptData} id={record.deptId} onSuccess={() => {
          tableRef.current.onRefresh()
        }} />, { title: '删除提示', size: 'auto' })
        // await deleltDeptData(record.deptId)
        // tableRef.current.onRefresh()
      }]
    ]
  ]

  const tools = [
    ['新增', {
      onClick: () => {
        popupUI(<DeptDetail onSuccess={() => {
          tableRef.current.onRefresh()
        }} />, { title: '新增部门', size: 'auto' })
      },
      type: 'primary',
      icon: <PlusOutlined />
    }]
  ]

  return (
    <article className={styles.wrapper}>
      <TableInterface
        ref={tableRef}
        tableProps={tableProps}
        tableOptions={tableOptions}
        columns={columns}
        queryInputs={queryInputs}
        tools={tools}
        request={getDeptTable}
        isNotPagination={true}
      />
    </article>
  )
}

export default DeptTable