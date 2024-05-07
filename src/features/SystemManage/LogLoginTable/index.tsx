import { Form,Button, message, Tooltip } from "antd";
import { InputType } from "hooks/flexibility/FormPanel";
import TableInterface from "hooks/integrity/TableInterface"
import { getLoginlogTable } from "server/system";
import { exportLoginFile } from "server/user";
import styles from "./index.module.sass";
import { ColType } from "hooks/flexibility/TablePanel";
import { useCallback } from "react";
import { getLogsVerify } from "server/admin";

interface ResultProps {
  text: boolean
  record: any
}


const Result: React.FC<ResultProps> = ({ text,record }) => {


  const handelVerify = useCallback( async(data:any)=>{
    let list = JSON.parse(data.msg)
    let param = {
      signData: list.signData,
      srcData: list.webSrcData
    }
    const vo = await getLogsVerify(param)
    if(vo.code === 200) {
      message.success(vo.data)
    } else {
      message.warning(vo.data)
    }
  },[])


  return (
    <>
      <p className={styles.logCont}><Tooltip placement="topLeft" overlayInnerStyle={{width:'500px'}} title={record.msg}>{record.msg}</Tooltip></p>
     { record.msg.length> 100 && <Button onClick={()=>handelVerify(record)}>验签</Button> }
    </>
  )
}


const columns = [
    ['访问编号', 'infoId'],
    ['用户名称', 'userName'],
    ['地址', 'ipaddr'],
    ['登录状态', 'statusName'],
    ['内容', 'msg',ColType.component, { component: Result }],
    ['访问时间', 'accessTime']
]

const queryInputs = [
    ['用户名称', 'userName'],
    ['内容', 'searchValue'],
    ['访问时间', 'datetimeRange', InputType.dateTimeRange]
]

const LogLoginTable: React.FC = () => {
    console.debug('LogLoginTable')

    const [form] = Form.useForm()

    const tools = [
      ['导出', {
        onClick:async () => {
          await exportLoginFile(form)
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
                toolsHeader={tools}
                request={getLoginlogTable}
            />
        </article>
    )
}

export default LogLoginTable