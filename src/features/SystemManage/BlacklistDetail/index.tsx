import { message } from "antd";
import { BlackArchiveDict } from "helper/dictionary";
import { InputType, UseType } from "hooks/flexibility/FormPanel"
import FormInterface from "hooks/integrity/FormInterface"
import { addBlackData, getDictDataByType } from "server/system";
import styles from "./index.module.sass";
import { isPlate } from 'helper/validate'


const inputs = [
  ['号码类型', 'dataType', InputType.selectRemote, { request: () => getDictDataByType("black_data_type"), isRequired: true }],
  ['号码', 'content', InputType.textArea, { maxLength: 20, isRequired: true }],
  ['是否预警', 'isWarn', InputType.radio, { dict: BlackArchiveDict, isRequired: true }],
  ['登记原因', 'recordReason', InputType.textArea]
]

const initData = {
  isEnableCreateArchive: 1,
  dataType: '6',
  isWarn: 1
}

interface Props {
  onClosePopup?: Function
  onSuccess?: Function
  id?: number
  type?: UseType
}

const BlacklistDetail: React.FC<Props> = ({ onClosePopup, onSuccess, id, type }) => {
  console.debug('BlacklistDetail')

  async function handleFinish(params: any) {
    if (params.dataType === '4') {
      if (!isPlate(params.content)) {
        return message.warning('请输入正确的车牌！')
      }
    }
    await addBlackData(params)
    onSuccess && onSuccess()
    onClosePopup && onClosePopup()
  }
  function handelClose() {
    onClosePopup && onClosePopup()
  }



  return (
    <article className={styles.wrapper}>
      <FormInterface
        inputs={inputs}
        formType={type}
        initData={initData}
        onFinish={handleFinish}
        options={{
          submitText: '确认',
          isShowClear: true
        }}
        onClose={handelClose}
      />
    </article>
  )
}

export default BlacklistDetail