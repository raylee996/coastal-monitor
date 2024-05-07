import { PlusOutlined } from "@ant-design/icons";
import { dictionaryStatusDict } from "helper/dictionary";
import popup from "hooks/basis/Popup";
import { InputType, UseType } from "hooks/flexibility/FormPanel";
// import { ActionType } from "hooks/flexibility/TablePanel";
import TableInterface from "hooks/integrity/TableInterface"
import { useRef } from "react";
import { delDictionaryDetail, getDictionaryTable } from "server/system";
import DictionaryDataTable from "../DictionaryDataTable";
import DictionaryDetail from "../DictionaryDetail";
import styles from "./index.module.sass";
import WindowDelet from "component/WindowDelet";
// import popupmini from "component/PopupMini";
import popupUI from "component/PopupUI";

const queryInputs = [
  ['字典名称', 'dictName'],
  ['字典类型', 'dictType'],
  ['状态', 'status', InputType.select, { dict: dictionaryStatusDict }]
]

const DictionaryTable: React.FC = () => {
  console.debug('DictionaryTable')

  const tableRef = useRef<any>()

  const columns = [
    ['字典名称', 'dictName'],
    ['字典类型', 'dictType'],
    ['状态', 'statusName'],
    ['备注', 'remark'],
    ['创建时间', 'createTime'],
    [
      ['查看数据', (record: any) => {
        popup(<DictionaryDataTable dictType={record.dictType} />, { title: '字典数据管理', size: "middle" })
      }],
      ['编辑', (record: any) => {
        popupUI(<DictionaryDetail id={record.dictId} onSuccess={() => {
          tableRef.current.onRefresh()
        }} />, { title: '编辑字典', size: 'auto' })
      }],
      ['删除', async (record: any) => {
        popupUI(<WindowDelet title={'确定删除字典吗？'} request={delDictionaryDetail} id={record.dictId} onSuccess={() => {
          tableRef.current.onRefresh()
        }} />, { title: '删除提示', size: 'auto' })
        // await delDictionaryDetail(record.dictId)
        // tableRef.current.onRefresh()
      }]
    ]
  ]

  const tools = [
    ['新增', {
      onClick: () => {
        popupUI(<DictionaryDetail type={UseType.add} onSuccess={() => {
          tableRef.current.onRefresh()
        }} />, { title: '新增字典', size: 'auto' })
      },
      type: 'primary',
      icon: <PlusOutlined />
    }]
  ]

  return (
    <article className={styles.wrapper}>
      <TableInterface
        ref={tableRef}
        tableProps={{
          rowKey: 'dictId'
        }}
        columns={columns}
        queryInputs={queryInputs}
        tools={tools}
        request={getDictionaryTable}
      />
    </article>
  )
}

export default DictionaryTable