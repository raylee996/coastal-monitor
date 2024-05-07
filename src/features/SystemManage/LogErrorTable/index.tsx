import { Form } from "antd";
import { InputType } from "hooks/flexibility/FormPanel";
import { ColType } from "hooks/flexibility/TablePanel";
import TableInterface from "hooks/integrity/TableInterface"
import { getExceptionList, getExceptionTypeDict, exportExceptionFile } from "server/device";
import styles from "./index.module.sass";

const columns = [
  ['异常描述', 'exception_content'],
  ['设备编码', 'device_code'],
  ['设备类型', 'device_type_str'],
  ['异常类型', 'exception_typeName', ColType.tag],
  ['开始时间', 'begin_time'],
  ['结束时间', 'end_time']
]

const queryInputs = [
  ['异常描述', 'exceptionContent'],
  ['异常类型', 'exceptionType', InputType.selectRemote, { request: getExceptionTypeDict ,style:{width:'180px'}}],
  ['时间范围', 'datetimeRange', InputType.dateTimeRange]
]



const LogErrorTable: React.FC = () => {
  console.debug('LogErrorTable')

  const [form] = Form.useForm()

  const tools = [
    ['导出', {
      onClick:async () => {
        await exportExceptionFile(form)
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
        request={getExceptionList}
        toolsHeader={tools}
      />
    </article>
  )
}

export default LogErrorTable