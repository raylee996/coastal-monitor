import { Form } from "antd";
import { InputType } from "hooks/flexibility/FormPanel";
import { ColType } from "hooks/flexibility/TablePanel";
import TableInterface from "hooks/integrity/TableInterface"
import { exportSyslogFile, getSystemlog } from "server/system";
// import popup from "hooks/basis/Popup";
import LogSearchInfo from "./logSearchInfo";
import styles from "./index.module.sass";
// import popupmini from "component/PopupMini";
import popupUI from "component/PopupUI";

const columns = [
  ['日志编号', 'id'],
  ['系统模块', 'busName'],
  ['操作类型', 'busTypeName', ColType.tag],
  ['操作人员', 'logUser'],
  ['主机', 'operIp'],
  ['操作日期', 'logTime'],
  [
    ['查看', (record: any) => {
      // console.log(record)
      popupUI(<LogSearchInfo id={record.id} type={record.busTypeName}></LogSearchInfo>, { title: '查看日志', size: "auto" })
    }]
  ]
]

const queryInputs = [
  ['系统模块', 'busName'],
  ['操作人员', 'logUser'],
  ['操作时间', 'datetimeRange', InputType.dateTimeRange],
]

const LogSystemTable: React.FC = () => {
  console.debug('LogSystemTable')

  const [form] = Form.useForm()

  const tools = [
    ['导出', {
      onClick: async () => {
        await exportSyslogFile(form)
      },
      type: "primary"
    }],
  ]

  return (
    <article className={styles.wrapper}>
      <TableInterface
        tableProps={{ rowKey: 'id' }}
        columns={columns}
        queryForm={form}
        queryInputs={queryInputs}
        request={getSystemlog}
        toolsHeader={tools}
      />
    </article>
  )
}

export default LogSystemTable