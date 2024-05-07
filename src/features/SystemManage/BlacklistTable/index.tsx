import { DownloadOutlined, PlusOutlined } from "@ant-design/icons";
import { Form, message } from "antd";
import UploadTool from "component/UploadTool";
// import popup from "hooks/basis/Popup";
import { UseType } from "hooks/flexibility/FormPanel";
// import { ActionType } from "hooks/flexibility/TablePanel";
import TableInterface from "hooks/integrity/TableInterface"
import { useRef } from "react";
import { delBlackData, downBlackTemplateFile, exportBlackFile, getBlackTable, importBlackFile } from "server/system";
import BlacklistDetail from "../BlacklistDetail";
import styles from "./index.module.sass";
import WindowDelet from "component/WindowDelet";
// import popupmini from "component/PopupMini";
import popupUI from "component/PopupUI";

const queryInputs = [
  ['号码', 'searchValue']
]

const BlacklistTable: React.FC = () => {
  console.debug('BlacklistTable')

  const [form] = Form.useForm()

  const tableRef = useRef<any>()

  const columns = [
    ['数据类型', 'dataTypeName'],
    ['号码', 'content'],
    ['是否预警', 'isWarnName'],

    ['登记原因', 'recordReason', {
      itemProps: {
        ellipsis: true
      }
    }],
    ['登记人', 'createBy'],
    ['登记时间', 'createTime'],
    [
      ['删除', async (record: any) => {
        popupUI(<WindowDelet title={'确定删除黑名单吗？'} request={delBlackData} id={record.id} onSuccess={() => {
          tableRef.current.onRefresh()
        }} />, { title: '删除提示', size: 'auto' })
        // await delBlackData(record.id)
        // tableRef.current.onRefresh()
      }]
    ]
  ]

  const tools = [
    ['新增', {
      onClick: () => {
        popupUI(<BlacklistDetail type={UseType.add} onSuccess={() => {
          tableRef.current.onRefresh()
        }} />, { title: '新增黑名单', size: 'auto' })
      },
      type: 'primary',
      icon: <PlusOutlined />
    }],
    <UploadTool asyncDownloadTemplate={async () => {
      await downBlackTemplateFile()
    }} asyncUploadFile={async (formData: FormData) => {
      await importBlackFile(formData)
      message.success('数据已全部导入成功！')
      tableRef.current.onRefresh()
    }} />,
    ['导出', {
      asyncClick: async () => {
        const queryParams = form.getFieldsValue()
        await exportBlackFile(queryParams)
      },
      icon: <DownloadOutlined />
    }]
  ]

  return (
    <article className={styles.wrapper}>
      <TableInterface
        ref={tableRef}
        tableProps={{
          rowKey: 'id'
        }}
        columns={columns}
        queryInputs={queryInputs}
        queryForm={form}
        toolsHeader={tools}
        request={getBlackTable}
      />
    </article>
  )
}

export default BlacklistTable