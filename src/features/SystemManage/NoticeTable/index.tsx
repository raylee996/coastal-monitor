import { PlusOutlined } from "@ant-design/icons";
import { noticeTypeDict } from "helper/dictionary";
// import popup from "hooks/basis/Popup";
import { InputType, UseType } from "hooks/flexibility/FormPanel";
// import {  ColType } from "hooks/flexibility/TablePanel";
import TableInterface from "hooks/integrity/TableInterface"
import { useMemo, useRef } from "react";
import { getNoticeTable, removeNoticeData } from "server/system";
import NoticeDetail from "../NoticeDetail";
import styles from "./index.module.sass";
import WindowDelet from "component/WindowDelet";
// import popupmini from "component/PopupMini";
import popupUI from "component/PopupUI";

const tableProps = {
  rowKey: 'noticeId'
}

const queryInputs = [
  ['公告标题', 'noticeTitle'],
  ['公告类型', 'noticeType', InputType.select, { dict: noticeTypeDict, style: { width: '180px' } }]
]

const NoticeTable: React.FC = () => {
  console.debug('NoticeTable')


  const tableRef = useRef<any>()


  const columns = useMemo(() => [
    ['公告标题', 'noticeTitle', { itemProps: { width: 400, ellipsis: true } }],
    ['公告类型', 'noticeTypeName'],
    ['公告内容', 'noticeContent', { itemProps: { ellipsis: true } }],
    ['状态', 'statusName'],
    ['创建者', 'createBy'],
    ['创建时间', 'createTime'],
    [
      ['编辑', (record: any) => {
        popupUI(<NoticeDetail id={record.noticeId} onSuccess={() => {
          tableRef.current.onRefresh()
        }} />, { title: '编辑公告', size: 'auto' })
      }],
      ['删除', async (record: any) => {
        popupUI(<WindowDelet title={'确定删除公告吗？'} request={removeNoticeData} id={record.noticeId} onSuccess={() => {
          tableRef.current.onRefresh()
        }} />, { title: '删除提示', size: 'auto' })
        // await removeNoticeData(record.noticeId)
        // tableRef.current.onRefresh()
      }]
    ]
  ], [])


  const tools = useMemo(() => [
    ['新增', {
      onClick: () => {
        popupUI(<NoticeDetail type={UseType.add} onSuccess={() => {
          tableRef.current.onRefresh()
        }} />, { title: '新增公告', size: 'auto' })
      },
      type: 'primary',
      icon: <PlusOutlined />
    }]
  ], [])


  return (
    <article className={styles.wrapper}>
      <TableInterface
        ref={tableRef}
        tableProps={tableProps}
        columns={columns}
        queryInputs={queryInputs}
        tools={tools}
        request={getNoticeTable}
      />
    </article>
  )
}

export default NoticeTable