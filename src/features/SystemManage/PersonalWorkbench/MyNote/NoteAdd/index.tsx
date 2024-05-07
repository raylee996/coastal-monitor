import { InputType } from "hooks/flexibility/FormPanel"
import FormInterface from "hooks/integrity/FormInterface"
import { addMyNoteItem, updateMyNoteItem } from 'server/system'
import { getLabelSelect } from "server/label";
interface Props {
  id?: number
  labelName?: string
  noteContent?: string
  noteType?: number
  taskName?: string
  resultNum?: number
  onClosePopup?: Function
  onSuccess?: Function
}

const inputs = [
  ['分类', 'labelName', InputType.selectRemote, {
    request: async () => getLabelSelect({ type: 11 }),
    placeholder: '请选择分类',
    isRequired: true,
  }],
  ['内容', 'noteContent', InputType.textArea, {
    placeholder: '请输入内容',
    isRequired: true,
  }],
]

const NoteAdd: React.FC<Props> = ({ id, labelName, noteContent, noteType, taskName, resultNum, onClosePopup, onSuccess }) => {
  console.debug('NoteAdd')
  async function handleFinish(params: any) {
    console.log(params)
    if (id) {
      let dto: any = {
        id: id,
        noteType: 0,
        noteTypeId: params.labelName,
        noteContent: params.noteContent
      }
      await updateMyNoteItem(dto)
    } else {
      let dto: any = {
        resultNum: resultNum || 0,
        taskName: taskName || '',
        noteType: noteType || 0,
        noteTypeId: params.labelName,
        noteContent: params.noteContent
      }
      await addMyNoteItem(dto)
    }
    onSuccess && onSuccess()
    onClosePopup && onClosePopup()
  }


  return (
    <article style={{ width: 500,  padding: 10 }}>
      <FormInterface
        inputs={inputs}
        options={{
          submitText: '确认',
          isShowReset: true
        }}
        formProps={{
          labelCol: {
            span: 3,
          }
        }}
        initData={{ labelName: labelName, id: id, noteContent: noteContent }}
        onFinish={handleFinish}
      />
    </article>
  )
}

export default NoteAdd
