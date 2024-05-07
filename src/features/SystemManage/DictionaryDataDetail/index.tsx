import { FormInstance } from "antd";
import { dictionaryStatusDict } from "helper/dictionary";
import { InputType, UseType } from "hooks/flexibility/FormPanel";
import FormInterface from "hooks/integrity/FormInterface";
import { useCallback, useState } from "react";
import { addDictionaryDataDetail, editDictionaryDataDetail, getDictionaryDataDetail } from "server/system";
import SelectIcon from "./components/SelectIcon";
import styles from "./index.module.sass";


const formProps = { labelCol: { span: 7 } }

const inputs = [
  ['字典标签', 'dictType', { isInitHasDisabled: true }],
  ['数据标签', 'dictLabel', {
    isRequired: true
  }],
  ['数据键值', 'dictValue', {
    isRequired: true
  }],
  ['显示排序', 'dictSort', InputType.number],
  ['状态', 'status', InputType.radio, {
    dict: dictionaryStatusDict
  }],
  ['图标类型', 'picPath', InputType.component, {
    component: SelectIcon,
    when: {
      dictType: 'archive_ship_type'
    }
  }],
  ['备注', 'remark', InputType.textArea]
]

interface Props {
  dictType: string
  onClosePopup?: () => void
  onSuccess?: () => void
  id?: number
  type?: UseType
}

const DictionaryDataDetail: React.FC<Props> = ({ onClosePopup, onSuccess, id, type, dictType }) => {
  console.debug('DictionaryDataDetail')


  const [initData] = useState({ dictType, status: '0' })


  const handleFinish = useCallback(
    async (params: any) => {
      if (id) {
        await editDictionaryDataDetail(params)
      } else {
        await addDictionaryDataDetail(params)
      }
      onSuccess && onSuccess()
      onClosePopup && onClosePopup()
    },
    [id, onClosePopup, onSuccess],
  )

  const handleFill = useCallback(
    (form: FormInstance) => {
      form.setFieldsValue({
        dictLabel: Mock.Random.ctitle(),
        dictValue: Mock.Random.integer(0, 100),
        dictSort: Mock.Random.integer(0, 100),
        remark: Mock.Random.csentence(),
      })
    },
    [],
  )


  return (
    <article className={styles.wrapper}>
      <FormInterface
        id={id}
        getRequest={getDictionaryDataDetail}
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

export default DictionaryDataDetail