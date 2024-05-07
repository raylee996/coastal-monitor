import { DownloadOutlined, PlusOutlined } from "@ant-design/icons";
import { Form, message } from "antd";
import UploadTool from "component/UploadTool";
// import popup from "hooks/basis/Popup";
// import popupmini from "component/PopupMini";
import { UseType } from "hooks/flexibility/FormPanel";
// import { ActionType } from "hooks/flexibility/TablePanel";
import TableInterface from "hooks/integrity/TableInterface"
import { useRef } from "react";
import { delWhiteData, downWhiteTemplateFile, exportWhiteFile, getWhiteTable, importWhiteFile } from "server/system";
import WhitelistDetail from "../WhitelistDetail";
import styles from "./index.module.sass";
import WindowDelet from "component/WindowDelet";
import popupUI from "component/PopupUI";

const queryInputs = [
  ['号码', 'content']
]

const WhitelistTable: React.FC = () => {
  console.debug('WhitelistTable')

  const [form] = Form.useForm()

  const tableRef = useRef<any>()

  const columns = [
    ['数据类型', 'dataTypeName'],
    ['号码', 'content'],
    ['允许建档', 'isEnableCreateArchiveName'],

    ['登记原因', 'recordReason', {
      itemProps: {
        ellipsis: true
      }
    }],
    ['登记人', 'createBy'],
    ['登记时间', 'createTime'],
    [
      ['删除', async (record: any) => {
        popupUI(<WindowDelet title={'确定删除白名单吗？'} request={delWhiteData} id={record.id} onSuccess={() => {
          tableRef.current.onRefresh()
        }} />, { title: '删除提示', size: 'auto' })
        // await delWhiteData(record.id)
        // tableRef.current.onRefresh()
      }]
    ]
  ]

  const tools = [
    ['新增', {
      onClick: () => {
        popupUI(<WhitelistDetail type={UseType.add} onSuccess={() => {
          tableRef.current.onRefresh()
        }} />, { title: '新增白名单', size: 'auto' })
      },
      type: 'primary',
      icon: <PlusOutlined />
    }],
    <UploadTool asyncDownloadTemplate={async () => {
      await downWhiteTemplateFile()
    }} asyncUploadFile={async (formData: FormData) => {
      await importWhiteFile(formData)
      message.success('数据已全部导入成功！')
      tableRef.current.onRefresh()
    }} />,
    ['导出', {
      asyncClick: async () => {
        const queryParams = form.getFieldsValue()
        await exportWhiteFile(queryParams)
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
        request={getWhiteTable}
      />
    </article>
  )
}

export default WhitelistTable