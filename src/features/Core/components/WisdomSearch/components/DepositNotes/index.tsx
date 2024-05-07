import { InputType } from "hooks/flexibility/FormPanel"
import FormInterface from "hooks/integrity/FormInterface"
import { getLabelSelect } from "server/label";
import { addMyNoteItem } from "server/system";
import styles from "./index.module.sass";

interface Props {
  /** 需要保存的便签内容 */
  content?: any
  /** 结果条数 */
  total?: number
  /** 战法，研判--任务名字 ， 智搜--侦码数据/车牌数据/人脸数据 */
  taskName?: string
  /** 弹窗隐式关闭函数 */
  onClosePopup?: () => void
}

const formInputs = [
  ['便签分类', 'noteTypeId', InputType.selectRemote, {
    request: () => getLabelSelect({ type: 11 }),
    placeholder: '请选择便签分类',
    style: {
      width: '200px'
    },
    isRequired: true,
  }],
  ['备注', 'noteDesc', InputType.textArea, {
    placeholder: '请输入备注',
    maxLength: 100,
    showCount: true,
    rows: 6,
    isRequired: true,
  }]
]

const DepositNotes: React.FC<Props> = ({ content, total, taskName, onClosePopup }) => {
  console.debug('DepositNotes')


  async function handleFinish(data: any) {
    const { noteType, ...obj } = content || {}
    const dto = {
      // 0自建便签 1技战法 2研判 3智搜
      noteType: noteType || 3,
      noteContent: JSON.stringify({ searchData: obj }),
      resultNum: total,
      taskName,
      ...data,
    }
    await addMyNoteItem(dto)
    onClosePopup && onClosePopup()
  }


  return (
    <article className={styles.wrapper}>
      <FormInterface
        inputs={formInputs}
        formProps={{
          labelCol: {
            span: 4,
          },
          wrapperCol: { span: 18 }
        }}
        options={{
          submitText: '确认',
          isShowReset: true
        }}
        onFinish={handleFinish}
      />
    </article>
  )
}

export default DepositNotes