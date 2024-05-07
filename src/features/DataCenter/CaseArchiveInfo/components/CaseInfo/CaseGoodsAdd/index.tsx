import React, { useEffect, useState } from "react";
import styles from './index.module.sass'
import { InputType, ShowType, UseType } from "hooks/flexibility/FormPanel";
import { caseRelationGoodsDict } from "../../../../../../helper/dictionary";
import { Input, InputNumber } from "antd";
import { doUploadFile } from "server/common";
import FormInterface from "hooks/integrity/FormInterface";
import { addEditCaseThingItem, getCaseThingDetail } from "server/dataCenter/caseArchive";
import {isNumbers} from "helper/validate";

interface InputUnitProps {
  /** 提示文字 */
  inputPlaceholder?: string
  /** 受控属性*/
  value?: any
  /** 值变化时的回调函数 */
  onChange?: (value: string[]) => void
}

/*数量*/
const InputUnit: React.FC<InputUnitProps> = ({ inputPlaceholder, value, onChange }) => {
  const [realValue, setRealValue] = useState<string>()
  const [unitValue, setUnitValue] = useState<string>()

  useEffect(() => {
    const [realVal, unitVal] = value || ['', '']
    setRealValue(realVal)
    setUnitValue(unitVal)
  }, [value])

  function handleRealChange(e: any) {
    onChange && onChange([e, unitValue || ''])
    setRealValue(e)
  }

  function handleUnitChange(e: any) {
    onChange && onChange([realValue || '', e.target.value])
    setUnitValue(e.target.value)
  }

  return (
    <div className={styles.inputs}>
      <InputNumber className={styles.amount} placeholder={`请输入${inputPlaceholder}`} value={realValue} onChange={handleRealChange} />
      <Input placeholder='请输入单位' value={unitValue} onChange={handleUnitChange} />
    </div>
  )
}

interface Props {
  /** 案件id */
  caseId: number
  /** id */
  id?: number
  /** 更新table */
  refreshTable: Function
  /** 关闭弹窗 */
  onClosePopup?: Function
}

const CaseGoodsAdd: React.FC<Props> = ({ caseId, id, refreshTable, onClosePopup }) => {
  console.debug('CaseGoodsAdd')

  const Inputs = [
    ['品名', 'productName', {
      isRequired: true,
      placeholder: '请输入品名'
    }],
    ['涉案物品性质', 'nature', InputType.select, {
      isRequired: true,
      dict: caseRelationGoodsDict,
    }],
    ['产地', 'origin', {
      isRow: true,
      placeholder: '请输入产地',
      itemProps: {
        labelCol: { span: 3 }
      }
    }],
    ['规格/性能', 'specification', {
      placeholder: '请输入规格/性能'
    }],
    ['样式', 'style', {
      placeholder: '请输入样式'
    }],
    ['产牌', 'license', {
      placeholder: '请输入产牌'
    }],
    ['型号', 'type', {
      placeholder: '请输入型号'
    }],
    ['颜色', 'color', {
      placeholder: '请输入颜色'
    }],
    ['成色', 'conditions', {
      placeholder: '请输入成色'
    }],
    ['数量', 'quantityArray', InputType.component, {
      component: InputUnit,
      inputPlaceholder: '数量'
    }],
    ['重量', 'weightArray', InputType.component, {
      component: InputUnit,
      inputPlaceholder: '重量'
    }],
    ['价值', 'worth', {
      placeholder: '请输入价值',
      suffix: '元',
      maxLength: 20,
      itemProps: { rules: [isNumbers] }
    }],
    ['文物年代', 'age', InputType.textArea],
    ['照片', 'urlsArray',
      InputType.uploadImg,
      ShowType.image,
      {
        isRow: true,
        maxCount: 9,
        useType: UseType.edit,
        uploadImgFn: doUploadFile,
        showMessage: true
      }
    ],
  ];

  async function handleFinish(params: any) {
    console.log(params, 'params')
    await addEditCaseThingItem({ caseId, ...params })
    refreshTable && refreshTable()
    onClosePopup && onClosePopup()
  }

  return <div className={styles.wrapper}>
    <FormInterface
      id={id}
      options={{
        column: 2,
        isShowReset: true
      }}
      formProps={{
        labelCol: {
          span: 6,
        }
      }}
      onFinish={handleFinish}
      inputs={Inputs}
      getRequest={getCaseThingDetail}
    />
  </div>
}

export default CaseGoodsAdd
