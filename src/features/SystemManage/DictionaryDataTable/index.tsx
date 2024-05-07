import { PlusOutlined } from "@ant-design/icons";
import { dictionaryStatusDict } from "helper/dictionary";
// import popup from "hooks/basis/Popup";
import { InputType } from "hooks/flexibility/FormPanel";
import { ActionType } from "hooks/flexibility/TablePanel";
import TableInterface from "hooks/integrity/TableInterface"
import { useRef } from "react";
import { delDictionaryDataDetail, getDictionaryDataTable } from "server/system";
import DictionaryDataDetail from "../DictionaryDataDetail";
import styles from "./index.module.sass";
import popupUI from "component/PopupUI";

const queryInputs = [
  ['字典标签', 'dictLabel'],
  ['状态', 'status', InputType.select, { dict: dictionaryStatusDict,style:{width:'180px'} }]
]

interface Props {
  dictType: string
}

const DictionaryDataTable: React.FC<Props> = ({ dictType }) => {
  console.debug('DictionaryDataTable')

  const tableRef = useRef<any>()

  const columns = [
    ['字典标签', 'dictLabel'],
    ['字典键值', 'dictValue'],
    ['字典排序', 'dictSort'],
    ['状态', 'statusName'],
    ['备注', 'remark'],
    ['创建时间', 'createTime'],
    [
      ['编辑', (record: any) => {
        popupUI(<DictionaryDataDetail id={record.dictCode} dictType={dictType} onSuccess={() => {
          tableRef.current.onRefresh()
        }} />, { title: '编辑字典数据', size: 'auto' })
      }],
      ['删除', async (record: any) => {
        await delDictionaryDataDetail(record.dictCode)
        tableRef.current.onRefresh()
      }, ActionType.confirm]
    ]
  ]

  const tools = [
    ['新增', {
      onClick: () => {
        popupUI(<DictionaryDataDetail dictType={dictType} onSuccess={() => {
          tableRef.current.onRefresh()
        }} />, { title: '新增字典数据', size: 'auto' })
      },
      type: 'primary',
      icon: <PlusOutlined />
    }]
  ]

  return (
    <article className={styles.wrapper}>
      <TableInterface
        ref={tableRef}
        extraParams={{
          dictType
        }}
        tableProps={{
          rowKey: 'dictCode'
        }}
        columns={columns}
        queryInputs={queryInputs}
        tools={tools}
        request={getDictionaryDataTable}
      />
    </article>
  )
}

export default DictionaryDataTable