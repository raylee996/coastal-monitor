import { message } from "antd";
import { whiteArchiveDict } from "helper/dictionary";
import { InputType, UseType } from "hooks/flexibility/FormPanel"
import FormInterface from "hooks/integrity/FormInterface"
import { addWhiteData, getDictDataByType } from "server/system";
import styles from "./index.module.sass";
import { isIMSI, isIMEI, isMAC, isPlate } from 'helper/validate'

const inputs = [
  ['号码类型', 'dataType', InputType.selectRemote, { request: () => getDictDataByType("black_data_type"), isRequired: true }],
  ['号码', 'content', InputType.textArea, { maxLength: 20, isRequired: true }],
  ['允许建档', 'isEnableCreateArchive', InputType.radio, { dict: whiteArchiveDict, isRequired: true }],
  ['登记原因', 'recordReason', InputType.textArea]
]

const initData = {
  isEnableCreateArchive: 1, 
  dataType: '6'
}

interface Props {
  onClosePopup?: Function
  onSuccess?: Function
  id?: number
  type?: UseType
}

const WhitelistDetail: React.FC<Props> = ({ onClosePopup, onSuccess, id, type }) => {
  console.debug('WhitelistDetail')

  async function handleFinish(params: any) {
    if (params.dataType === '1') {
      if (!isIMSI(params.content)) {
        return message.warning('请输入正确的IMSI！')
      }
    }
    if (params.dataType === '2') {
      if (!isIMEI(params.content)) {
        return message.warning('请输入正确的IMEI！')
      }
    }
    if (params.dataType === '3') {
      if (!isMAC(params.content)) {
        return message.warning('请输入正确的MAC！')
      }
    }
    if (params.dataType === '4') {
      if (!isPlate(params.content)) {
        return message.warning('请输入正确的车牌！')
      }
    }
    await addWhiteData(params)
    onSuccess && onSuccess()
    onClosePopup && onClosePopup()
  }
  function handelClose() {
    onClosePopup && onClosePopup()
  }

  /* function handleFill(form: FormInstance) {
    form.setFieldsValue({
      dataType: '5',
      content: Mock.Random.word(),
      recordReason: Mock.Random.word()
    })
  } */


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
      // onFill={handleFill}
      />
    </article>
  )
}

export default WhitelistDetail