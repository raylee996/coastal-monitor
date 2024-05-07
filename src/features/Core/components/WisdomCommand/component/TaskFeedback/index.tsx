import { TaskTypeDict } from 'helper/dictionary'
import { InputType } from 'hooks/flexibility/FormPanel'
import FormInterface from 'hooks/integrity/FormInterface'
import { addCommandProcess } from 'server/core/wisdomCommand'
import styles from './index.module.sass'

interface Props {
  refreshTable?: Function
  onClosePopup?: Function,
  // id值
  id?: any
}

const Inputs = [
  ['进展类型', 'typeId', InputType.radio, {
    dict: TaskTypeDict
  }],
  ['进展内容', 'content', InputType.textArea, {
    placeholder: '请输入进展内容',
    rows: 6,
    maxLength: 500
  }],
]

const TaskFeedback: React.FC<Props> = ({ refreshTable, onClosePopup, id }) => {
  console.debug('TaskFeedback')

  async function onFinish(formData: any) {
    console.log(formData, "formData")
    await addCommandProcess({ commandTaskId: id, ...formData })
    // 关闭弹窗
    onClosePopup && onClosePopup();
    // 刷新反馈列表
    refreshTable && refreshTable(id)
  }

  return (
    <article className={styles.wrapper}>
      <FormInterface
        onFinish={onFinish}
        inputs={Inputs}
        formProps={{
          labelCol: {
            span: 3,
          }
        }}
        options={{
          isShowReset: true,
        }}
        initData={{
          typeId: 1
        }} />
    </article>
  )
}

export default TaskFeedback