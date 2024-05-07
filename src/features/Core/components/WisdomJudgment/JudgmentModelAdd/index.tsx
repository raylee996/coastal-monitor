import React from "react";
import styles from './index.module.sass'
import FormPanel, {InputType} from "hooks/flexibility/FormPanel";
import {Form, message} from "antd";
import {analyzeModelAddAsync, analyzeModelEditAsync} from "../../../../../server/core/wisdomJudgment";
import {clueType} from "../../../../../helper/dictionary";

interface Props {
  //表单数据
  formData?: any
  onClosePopup?:Function
  //新增成功后，需要选中当前新增的数据
  onCallback?:Function
}

const JudgmentModelAdd: React.FC<Props> = ({formData,onClosePopup,onCallback}) => {
  const [form] = Form.useForm();
  const formInputs = formData ? [
    ['模型名称', 'modelName', {
      placeholder: '请输入模型名称',
      isRequired: true,
    }],
  ] : [
    ['模型名称', 'modelName', {
      placeholder: '请输入模型名称',
      isRequired: true,
    }],
    ['研判对象', 'modelType', InputType.select,{
      dict: clueType,
      placeholder: '请选中研判对象',
      isRequired: true,
    }],
  ]

  function handlerSubmit(data: any) {
    if (formData){
      //确认编辑
      analyzeModelEditAsync({
        ...formData,
        ...data
      }).then(()=>{
        message.success('编辑成功')
        onClosePopup && onClosePopup()
      })
    }else {
      //确认新增
      analyzeModelAddAsync({
        ...data,
      }).then(()=>{
        message.success('添加成功')
        onClosePopup && onClosePopup()
        onCallback && onCallback(data)
      })
    }

  }

  return <div className={styles.wrapper}>
    <FormPanel
      inputs={formInputs}
      onFinish={handlerSubmit}
      options={{
        isShowReset: true,
        submitText:formData?'确认编辑':'确认新增'
      }}
      form={form}
      formProps={{
        labelCol: {
          span: 3,
        }
      }}
      formData={formData || {}}
    />
  </div>
}

export default JudgmentModelAdd
