import { Button, Popconfirm, Space } from "antd";
import windowUI from "component/WindowUI";
import popup from "hooks/basis/Popup";
import { TableCardProps } from "hooks/flexibility/CardPanel"
import { deleteCommanderCommand } from "server/core/wisdomCommand";
import TaskPlayback from "../../TaskPlayback";
import TaskRealtimeCommand from "../../TaskRealtimeCommand";
import WisdomCommandDetail from "../../WisdomCommandDetail";
import TaskFeedback from "../TaskFeedback";
import styles from "./index.module.sass";

const WisdomCommandCardItem: React.FC<TableCardProps<any>> = (props) => {
  console.debug('WisdomCommandCardItem')

  const { data, onRefresh } = props

  const { id, taskName, taskStateId, taskStateName, targetCodeName, chargePersonName, updateTime } = data || {}

  function openRealtimeCommand() {
    windowUI(<TaskRealtimeCommand onRefresh={onRefresh} data={data} />, { title: `任务实时指挥`, key: '任务实时指挥', width: '480px', height: '800px', offset: [50, 50] })
  }

  function openTaskPlayback() {
    popup(<TaskPlayback data={data} />, { title: '任务回放', size: 'fullscreen' })
  }

  async function del(id: number) {
    console.log(id, 'id')
    if (!id) return
    await deleteCommanderCommand(id)
    onRefresh && onRefresh()
  }

  function openDetail(id: number) {
    popup(<WisdomCommandDetail refreshTable={onRefresh} id={id} />, { title: '编辑任务', size: 'middle' })
  }

  function openTaskFeedback(id: number) {
    popup(<TaskFeedback refreshTable={onRefresh} id={id} />, { title: '任务反馈', size: 'small' })
  }

  return (
    <article className={styles.wrapper} data-value={id}>
      <div className={styles.content}>
        <div className={styles.labelBox}>
          {/* <div className={styles.label}>{`【${taskSourceName || '--'}】 ${taskName || '--'}`}</div> */}
          <div className={styles.label}>{`${taskName || '--'}`}</div>
          <div className={styles.text}>{taskStateName || '--'}</div>
        </div>
        <div className={styles.text} title={targetCodeName}>{`跟踪目标：${targetCodeName || '--'}`}</div>
        <div className={styles.text}>{`责任人：${chargePersonName || '--'}`}</div>
        <div className={styles.text}>{`更新时间：${updateTime || '--'}`}</div>
        <div className={styles.splitLine}></div>
        <Space>
          {taskStateId === 1 && <Button type={'link'} onClick={openRealtimeCommand}>实时指挥</Button>}
          {/* <Button type={'link'} onClick={openRealtimeCommand}>实时指挥</Button> */}
          {taskStateId === 3 && <Button type={'link'} onClick={openTaskPlayback}>任务回放</Button>}
          {(taskStateId === 1 || taskStateId === 2) && <Button type={'link'} onClick={() => openDetail(id)}>编辑</Button>}
          <Popconfirm title="确定要删除吗?" onConfirm={() => del(id)}>
            <Button type={'link'}>删除</Button>
          </Popconfirm>
          {taskStateId === 1 && <Button type={'link'} onClick={() => openTaskFeedback(id)}>任务反馈</Button>}
        </Space>
      </div>
      <div className={styles.line}></div>
    </article>
  )
}

export default WisdomCommandCardItem