import { Avatar } from "antd";
import XcEmpty from "component/XcEmpty";
import { useEffect, useState } from "react"
import { queryCommandProcessList } from "server/core/wisdomCommand";
import styles from "./index.module.sass";

interface Props {
  /** 反馈记录 */
  id?: number
  /** 刷新请求 */
  refresh?: boolean
}

const CommandFeedbackRecord: React.FC<Props> = ({ id, refresh }) => {
  console.debug('CommandFeedbackRecord')

  const [feedbackRecord, setFeedbackRecord] = useState<any[]>([])

  useEffect(() => {
    id && handleCommandProcess(id)
  }, [id, refresh])

  // 查询反馈记录列表
  async function handleCommandProcess(id: number) {
    const res = await queryCommandProcessList({ id })
    setFeedbackRecord(res)
  }

  return (
    <div className={styles.wrapper}>
      {
        feedbackRecord?.length ? feedbackRecord.map(item => {
          return <div className={styles.cardBox} key={item.id}>
            <div className={styles.topBox}>
              <div className={styles.topBox}>
                <Avatar className={styles.avatar} src={item.avatar} />
                <div className={styles.name}>{item.createByName || '--'}</div>
              </div>
              <div>{item.createTime || '--'}</div>
            </div>
            <div>{`进展类型：${item.typeIdName || "--"}`}</div>
            <div>{`进展内容：${item.content || "--"}`}</div>
          </div>
        }) : <XcEmpty />
      }
    </div>
  )
}

export default CommandFeedbackRecord

