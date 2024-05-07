import { InputType } from "hooks/flexibility/FormPanel"
import { DayjsRange } from "hooks/hooks";
import FormInterface from "hooks/integrity/FormInterface"
import { useCallback, useState } from "react";
import { addHistoryVideoNote, getWorkbenchTypeDict } from "server/admin";
import { getVideoDeviceDict } from "server/device";
import styles from "./index.module.sass";


const inputs = [
  ['时间段', 'range', InputType.dateTimeRange],
  ['点位', 'deviceCode', InputType.selectRemote, { request: getVideoDeviceDict }],
  ['标签分类', 'noteTypeId', InputType.selectRemote, { request: getWorkbenchTypeDict }],
  ['备注', 'noteDesc', InputType.textArea],
]

const options = {
  isRequired: true
}

interface Props {
  range: DayjsRange
  deviceCode: number
  onClosePopup?: () => void
}

const AddNote: React.FC<Props> = ({ range, deviceCode, onClosePopup }) => {
  console.debug('AddNote')


  const [initData] = useState(() => {
    return {
      range,
      deviceCode
    }
  })


  const handleFinish = useCallback(
    async (params: any) => {
      await addHistoryVideoNote(params)
      onClosePopup && onClosePopup()
    },
    [onClosePopup],
  )


  return (
    <article className={styles.wrapper}>
      <FormInterface inputs={inputs} options={options} initData={initData} onAsyncFinish={handleFinish} />
    </article>
  )
}

export default AddNote