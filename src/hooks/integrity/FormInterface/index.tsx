import { FormInstance } from "antd";
import FormPanel, { FormPanelProps, UseType } from "hooks/flexibility/FormPanel"
import _ from "lodash";
import React from "react";
import { useEffect, useMemo, useState } from "react";
import styles from "./index.module.sass";

type ID = any;

interface Props extends Omit<FormPanelProps, 'onFinish' | 'onAsyncFinish' | 'formData' | 'onClose' | 'initData'> {
  /** 展示详情时，数据请求所使用的ID */
  id?: ID
  /** form实例，用于操作form */
  queryForm?: any
  /** 表单数据设置 */
  formData?: any
  /** 表单初始化数据设置 */
  initData?: any
  /** 传入id时，需要调用的数据返回异步函数 */
  getRequest?: (id: ID, signal: AbortController) => Promise<any>
  /** 确认回调函数 */
  onFinish?: (data: any, form?: FormInstance) => void
  /** 确认回调的异步函数，能启动按钮加载动画 */
  onAsyncFinish?: (data: any, form?: FormInstance) => Promise<void>
  /** 响应关闭按钮点击事件 */
  onClose?: () => void
  /** 异步请求数据回调 */
  onRequest?: (data: any) => void
}

const FormInterface: React.FC<Props> = ({
  id,
  formType,
  formProps,
  queryForm,
  formData,
  getRequest,
  onRequest,
  onFinish,
  onAsyncFinish,
  onClose,
  initData,
  inputs,
  ...formPanelProps
}) => {
  console.debug('FormInterface')


  const [realformPanelProps, setRealformPanelProps] = useState<FormPanelProps>(formPanelProps)
  const [realFormData, setRealFormData] = useState<any>(() => {
    if ((id && getRequest) || _.isUndefined(formData)) {
      return undefined
    } else {
      return formData
    }
  })


  const formName = useMemo(() => {
    const uniqueId = _.uniqueId()
    return `FormInterfaceName_${uniqueId}`
  }, [])
  const formUseType = useMemo<UseType>(() => formType || UseType.edit, [formType])
  const realInitData = useMemo(() => id ? undefined : initData, [id, initData])


  useEffect(() => {
    let ctr: AbortController
    async function main() {
      if (id && getRequest) {
        ctr = new AbortController()
        const vo = await getRequest(id, ctr)
        setRealFormData(vo)
        onRequest && onRequest(vo)
      }
    }
    main()
    return () => {
      ctr?.abort()
    }
  }, [id, getRequest, onRequest])

  useEffect(() => {
    if (!(id && getRequest) && !_.isUndefined(formData)) {
      setRealFormData((val: any) => _.isEqual(val, formData) ? val : formData)
    }
  }, [formData, id, getRequest])

  useEffect(() => {
    setRealformPanelProps(val => {
      const valJson = JSON.stringify(val)
      const resultJson = JSON.stringify(formPanelProps)
      if (_.isEqual(valJson, resultJson)) {
        return val
      } else {
        return formPanelProps
      }
    })
  }, [formPanelProps])

  const realFormProps = useMemo(() => {
    const result = { ...formProps }
    if (!_.has(formProps, 'labelCol') && formProps?.layout !== 'inline' && formProps?.layout !== 'vertical') {
      _.set(result, 'labelCol', { span: 6 })
    }
    return result
  }, [formProps])

  function handleFinish(data: any) {
    if (onFinish) {
      if (id) {
        onFinish({ id, ...data })
      } else {
        onFinish({ ...data })
      }
    }
  }

  async function handleAsyncFinish(data: any, form: FormInstance) {
    if (onAsyncFinish) {
      if (id) {
        await onAsyncFinish({ id, ...data }, form)
      } else {
        await onAsyncFinish({ ...data }, form)
      }
    }
  }
  function handleClose() {
    if (onClose) {
      onClose()
    }
  }

  return (
    <article className={`${styles.wrapper} hooks_FormInterface`}>
      <FormPanel
        form={queryForm}
        name={formName}
        inputs={inputs}
        formType={formUseType}
        formData={realFormData}
        initData={realInitData}
        formProps={realFormProps}
        onFinish={handleFinish}
        onClose={handleClose}
        onAsyncFinish={handleAsyncFinish}
        {...realformPanelProps} />
    </article>
  )
}

export default React.memo(FormInterface)