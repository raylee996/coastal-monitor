import { FormInstance } from "antd";
import { dictionaryStatusDict } from "helper/dictionary";
import { InputType, UseType } from "hooks/flexibility/FormPanel";
import FormInterface from "hooks/integrity/FormInterface";
import { useCallback } from "react";
import { addDictionaryDetail, editDictionaryDetail, getDictionaryDetail } from "server/system";
import styles from "./index.module.sass";


const initData = {
  status: '0'
}

const formProps = {
  labelCol: { span: 5 }
}

const inputs = [
  ['字典名称', 'dictName', {
    isRequired: true
  }],
  ['字典类型', 'dictType', {
    isRequired: true
  }],
  ['状态', 'status', InputType.radio, {
    dict: dictionaryStatusDict
  }],
  ['备注', 'remark', InputType.textArea]
]

interface Props {
  onClosePopup?: () => void
  onSuccess?: () => void
  id?: number
  type?: UseType
}

const DictionaryDetail: React.FC<Props> = ({ onClosePopup, onSuccess, id, type }) => {
  console.debug('DictionaryDetail')


  const handleFinish = useCallback(
    async (params: any) => {
      if (id) {
        await editDictionaryDetail(params)
      } else {
        await addDictionaryDetail(params)
      }
      onSuccess && onSuccess()
      onClosePopup && onClosePopup()
    },
    [id, onClosePopup, onSuccess],
  )


  const handleFill = useCallback(
    (form: FormInstance) => {
      form.setFieldsValue({
        dictName: Mock.Random.ctitle(),
        dictType: Mock.Random.word(),
        remark: Mock.Random.csentence(),
      })
    },
    [],
  )


  return (
    <article className={styles.wrapper}>
      <FormInterface
        id={id}
        getRequest={getDictionaryDetail}
        formType={type}
        inputs={inputs}
        initData={initData}
        formProps={formProps}
        onAsyncFinish={handleFinish}
        onFill={handleFill}
      />
    </article>
  )
}

export default DictionaryDetail