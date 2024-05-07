import { Button, Form, FormInstance, FormItemProps, FormProps, Input, InputNumber, Space } from "antd";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./index.module.sass";
import _ from "lodash";
import SelectSimple from "hooks/basis/SelectSimple";
import SelectRemote from "hooks/basis/SelectRemote";
import DateRangeSimple from "hooks/basis/DateRangeSimple";
import DateSimple from "hooks/basis/DateSimple";
import DateTimeSimple from "hooks/basis/DateTimeSimple";
import SelectMultipleSimple from "hooks/basis/SelectMultipleSimple";
import SelectMultipleRemote from "hooks/basis/SelectMultipleRemote";
import DateTimeRangeSimple from "hooks/basis/DateTimeRangeSimple";
import { Rule } from "antd/lib/form";
import ImageSimple from "hooks/basis/ImageSimple";
import TextSimple from "hooks/basis/TextSimple";
import UploadImg from "hooks/basis/UploadImg";
import CascaderRemote from "hooks/basis/CascaderRemote";
import RadioSimple from "hooks/basis/RadioSimple";
import CheckboxSimple from "hooks/basis/CheckboxSimple";
import TreeRemote from "hooks/basis/TreeRemote";
import UploadVideo from "hooks/basis/UploadVideo";
import TransferRemote from "hooks/basis/TransferRemote";
import RadioRemote from "hooks/basis/RadioRemote";
import DayTimeRange from "hooks/basis/DayTimeRange";
import { ButtonProps } from "antd/lib/button";
import UploadPicture from "hooks/basis/UploadPicture";

/** 多行文本 */
const { TextArea } = Input;

/** 用于配置表单或表单项的使用类型 */
export enum UseType {
  /** 新增 */
  add = 1,
  /** 编辑 */
  edit,
  /** 展示 */
  show
}

/** 表单项在展示使用时，可配置的展示类型，支持扩展 */
export enum ShowType {
  /** 图片 */
  image = 50,
  /** 图片列表 */
  imageList,
  /** 单行文本 */
  text,
  /** 文本区域 */
  textarea,
  /** 视频 */
  video,
}

/** 输入控件类型，支持扩展 */
export enum InputType {
  /** 基础输入控件 */
  input = 100,
  password,
  number,
  textArea,
  /**
   * 简单的下拉选择
   * @param dict Type[] 字典类型数组
   * */
  select,
  /**
   * 远程的下拉选型
   * @param request () => Promise<Type[]>
   * */
  selectRemote,
  /**
   * 自定义组件类型，[index: string] any 自定义组件参数
   * @param component React.FC 自定义的组件
   * */
  component,
  /**
   * 日期范围组件
   * @param isDisabledDate boolean 是否禁用当前时间及往后日期
   * */
  dateRange,
  /** 单个日期选择 */
  date,
  /** 日期时间选择 */
  dateTime,
  /** 日期时间范围选择 */
  dateTimeRange,
  /**
   * 多选的下拉选型
   * @param dict Type[] 字典类型数组
   * */
  selectMultiple,
  /**
   * 远程的多选下拉选型
   * @param remote () => Promise<Type<any>[]> 远程数据请求
   * */
  selectMultipleRemote,
  /**上传图片
   * @param maxCount 上传文件个数，默认一个
   * @param useType 上传类型，显示和编辑（show, edit）
   * @param uploadImgFn 上传文件的函数（在serve中定义的上传文件函数）
   * @param displayUrl 回显图片接口地址
   * @value [{id, name, path}]
   * */
  uploadImg,
  /**
   * 级联远程的下拉框
   * @param remote () => Promise<{value, label, children}[]> 异步函数获取装填下拉项的数据
   *
  */
  cascaderRemote,
  /**
   * 单选
   * @param dict Type[] 字典类型数组
   * */
  radio,
  /**
   * 远程的单选
   * @param remote () => Promise<Type<any>[]> 远程数据请求
   * */
  radioRemote,
  /**
   * checkbox多选
   * @param list Type[] 字典类型数组
   * */
  checkbox,
  /**
   * 树形控件
   * @param remote () => Promise<DataNode[]> 获取节点数据的异步函数
   */
  treeRemote,
  /**上传视频
   * 使用格式：['上传视频', 'keyName', InputType.uploadImg, {
   *    useType: UseType.edit, //上传类型，显示和编辑（show,edit）
   *    videoType: ['video/mp4'], // 可上传视频格式
   *    videoMaxSize: 2000, // 可上传视频大小上限 单位：MB
   *    maxCount: 9, //上传文件个数，默认一个
   *    uploadVideoFn: doUploadFile, //上传文件的函数（在serve中定义的上传文件函数）
   * }],
    * */
  uploadVideo,
  /**
   * 穿梭框
   * @param remote () => Promise<Type<any>[]> 获取可选项集合
  */
  transferRemote,
  /**
   * 选择某一天的时间范围
   * @param dateProps PickerProps<Dayjs>
   * @param timeRangeProps TimeRangePickerProps
  */
  dayTimeRange,
  /**上传照片
   * @param useType UseType 显示、编辑（show, edit）
   * @param onUpload 上传文件的函数（在serve中定义的上传文件函数）
   * @value {uid: string, name: string, url: string}[]
   * */
  uploadPicture,
}

/** 自定义控件项配置、支持扩展 */
interface CustomProps {
  /** 判断表单中符合对象的值时展示 */
  when?: any
  /** 是否整行，（用于多列表单时，单个输入项是否占一整行） */
  isRow?: boolean
  /** 是否必填 */
  isRequired?: boolean
  /** 三行及以上 配置布局占用n列 */
  colNum?: number
  /** 通过initData初始化表单值时，有值的情况下禁用编辑使用展示形式 */
  isInitHasDisabled?: boolean
  /** 监听表单中某个字段值的变化更新组件 */
  watchKey?: string
}

/** 构建脚本使用的表单项 */
interface InputParams {
  /** 表单项标签文本 */
  label: string
  /** 表单项数据键名 */
  key: string
  useType: UseType,
  showType: ShowType,
  inputType: InputType,
  /** 表单项原始参数 */
  itemProps: FormItemProps,
  /** 表单控件参数 */
  inputProps: any
  /** 自定义参数 */
  customProps: CustomProps
  /** 自定义组件控件 */
  component?: React.FC
  /** 表单项的样式类名 */
  itemClass?: string
  /** 校验规则的副本，用于when判断时恢复校验使用 */
  rules?: Rule[]
  /** 表单项的样式style对象 */
  itemStyle?: any
}

/** 实际使用的表单项配置信息 */
interface RealInput extends InputParams {
  forKey: string
}

type formPanelItem = RealInput | React.ReactElement

interface FooterButton extends ButtonProps {
  /** 按钮名称 */
  text?: string
}

/** 自定义组件配置、支持扩展 */
export interface PanelOptions {
  /** 是否不展示表单底部的按钮栏目 */
  isNotShowFooter?: boolean
  /** 是否展示重置按钮 */
  isShowReset?: boolean
  /** 是否展示取消按钮 */
  isShowClear?: boolean
  /** 是否展示表单中的按钮栏 */
  isShowItemButton?: boolean
  /** 确认按钮的文本，默认：确认 */
  submitText?: string
  /** 输入项的列数 */
  column?: 2 | 3
  /** 表单输入项是否默认必填 */
  isRequired?: boolean
  /** 额外的功能按钮 */
  footerButtons?: FooterButton[]
}

export interface FormPanelProps {
  /** 表单名称，会作为表单字段 id 前缀使用 */
  name?: string
  /** 表单配置项，[输入控件展示label文本, 表单数据key字段, 控件类型以及扩展项, antd表单项原始参数] */
  inputs?: any[]
  /** FormInstance，Form.useForm() const [form] = Form.useForm()*/
  form?: any
  /** 表单初始化数据设置 */
  initData?: any
  /** 表单数据设置 */
  formData?: any
  /** antd表单原始参数 */
  formProps?: FormProps
  /** 表单当前的使用类型 */
  formType?: UseType
  /** 表单自定义配置项 */
  options?: PanelOptions
  /** 确认提交 */
  onFinish?: (data: any, form: FormInstance) => void
  /** 确认提交异步函数，能启动按钮加载动画 */
  onAsyncFinish?: (data: any, form: FormInstance) => Promise<void>
  /** 点击重置的回调 */
  onReset?: (form: FormInstance) => void
  /** 用于填充的函数 */
  onFill?: (form: FormInstance) => void
  /** 响应关闭按钮点击事件 */
  onClose?: () => void
}

const FormPanel: React.FC<FormPanelProps> = ({
  name,
  inputs,
  form,
  initData,
  formData,
  formProps,
  formType,
  options,
  onFinish,
  onAsyncFinish,
  onReset,
  onFill,
  onClose
}) => {
  console.debug('FormPanel')

  const [realForm] = Form.useForm(form)

  const [realInputs, setRealInputs] = useState<formPanelItem[]>([])
  const [formUseType, setFormUseType] = useState<UseType>(formType || UseType.edit)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [realFormProps, setRealFormProps] = useState(formProps)


  const formName = useMemo(() => name || 'FormPanel', [name])
  const realInitData = useMemo(() => initData, [initData])
  const realOptions = useMemo(() => options, [options])
  const cssClass = useMemo(() => {
    const result = {
      form: '',
      formItem: styles.formItemDefault
    }
    if (realOptions?.column) {
      result.form = styles.content
      switch (realOptions.column) {
        case 2:
          result.formItem = styles.formItemTwo
          break;
        case 3:
          result.formItem = styles.formItemThree
          break;
        default:
          break;
      }
    }
    return result
  }, [realOptions])
  const isShow = useMemo(() => {
    return process.env.NODE_ENV === 'development' && onFill
  }, [onFill])


  useEffect(() => {
    formType && setFormUseType(val => _.isEqual(formType, val) ? val : formType)
  }, [formType])

  useEffect(() => {
    setRealFormProps(val => _.isEqual(formProps, val) ? val : formProps)
  }, [formProps])


  /**
   * 校验表单项when，判断是否展示
   * @param params 实际使用的表单项配置信息，本函数内部会对该参数进行修改。
   * @param values 表单当前的所有值
   */
  const handleWhen = useCallback(
    (params: formPanelItem[], values: any) => {
      const _params = _.cloneDeep(params)
      const list = _.filter(_params, ele => !React.isValidElement(ele) && ele.customProps.when) as RealInput[]

      if (list.length > 0) {

        list.forEach(ele => {
          let isShow = true

          isShow = execFn(ele.customProps.when)

          if (isShow && ele.itemProps.hidden === true) {
            ele.itemProps.hidden = false;
            ele.itemProps.rules = ele.rules;
          }

          if (!isShow && (ele.itemProps.hidden === false || _.isUndefined(ele.itemProps.hidden))) {
            ele.itemProps.hidden = true;
            ele.rules = ele.itemProps.rules;
            _.unset(ele.itemProps, 'rules')
          }

        })
        return _params
      } else {
        return params
      }

      function execFn(when: any): boolean {
        const fields = _.keys(when)
        let isShow = true

        for (let i = 0; i < fields.length; i++) {
          const key = fields[i];
          const value = _.get(when, key)
          const currentValue = _.get(values, key)

          // 组合不等于类型
          if (key === '!==') {
            const _when = _.get(when, '!==')
            const result = execFn(_when)

            isShow = !result

          } else {

            if (_.isNumber(value) || _.isString(value) || _.isArray(value)) {
              isShow = _.isEqual(value, currentValue)
            } else if (!_.isUndefined(currentValue)) {
              // 扩展条件
              if (_.has(value, 'in')) {
                const inList = _.get(value, 'in')
                if (_.isArray(currentValue)) {
                  const result = _.union(inList, currentValue)
                  isShow = result.length === currentValue.length
                } else {
                  isShow = inList.includes(currentValue)
                }
              } else if (_.has(value, 'nin')) {
                const ninList = _.get(value, 'nin')
                if (_.isArray(currentValue)) {
                  const result = _.union(ninList, currentValue)
                  isShow = result.length === (currentValue.length + ninList.length)
                } else {
                  isShow = !ninList.includes(currentValue)
                }
              } else if (_.has(value, '!=')) {
                const notEqual = _.get(value, '!=')
                isShow = !_.isEqual(notEqual, currentValue)
              }
            } else {
              isShow = false
            }

          }

          if (!isShow) { break }
        }

        return isShow
      }

    },
    [],
  )

  /**
   * 对于实际使用的输入控件项，做功能处理
   * @param values 表单当前的所有值
   * @param _realInputs 实际使用的输入控件项
   */
  const handleRealInputs = useCallback((values: any, _realInputs?: formPanelItem[]) => {

    if (_realInputs) {
      const result = exe(_realInputs)
      if (isEqual(_realInputs, result)) {
        setRealInputs(_realInputs)
      } else {
        setRealInputs(result)
      }
    } else {
      setRealInputs(val => {
        const result = exe(val)
        if (isEqual(val, result)) {
          return val
        } else {
          return result
        }
      })
    }

    function isEqual(value: any[], other: any[]) {
      if (value.length !== other.length) {
        return false
      } else {
        for (let i = 0; i < value.length; i++) {
          const val = value[i];
          const oth = other[i];
          if (!React.isValidElement(val) && !React.isValidElement(oth) && !_.isEqual(val, oth)) {
            return false
          }
        }
        return true
      }
    }

    function exe(param: formPanelItem[]) {
      const hasDisabledResult = handleHasDisabled(param, values)
      const whenResult = handleWhen(hasDisabledResult, values)
      return whenResult
    }
  }, [handleWhen])

  /**
   * 监听表单配置项，结构出表单项配置信息
   */
  useEffect(() => {
    if (inputs && inputs.length > 0) {
      const _realInputs: formPanelItem[] = []
      inputs.forEach(item => {
        if (_.isArray(item)) {
          //解构数组内容
          const [label, key] = item;
          let inputType: InputType = InputType.input;
          let useType: UseType = formUseType;
          let showType: ShowType = ShowType.text;
          let itemProps: FormItemProps = {};
          let inputProps: any = {};
          let customProps: CustomProps = {};
          for (let i = 2; i < item.length; i++) {
            const target: any = item[i]
            if (InputType[target]) {
              inputType = target
            } else if (UseType[target]) {
              useType = target
            } else if (ShowType[target]) {
              showType = target
            } else {
              //获取自定义参数配置
              const customPropNameList = ['isRow', 'when', 'isRequired', 'colNum', 'isInitHasDisabled', 'watchKey']
              customProps = _.pick(target, customPropNameList)
              itemProps = _.isEmpty(target.itemProps) ? {} : _.cloneDeep(target.itemProps)
              inputProps = _.omit(target, customPropNameList)
              _.unset(inputProps, 'itemProps')
              _.set(inputProps, 'formlabel', label)
              _.set(inputProps, 'formkey', key)
              _.set(inputProps, 'form', realForm)
              if (_.has(customProps, 'watchKey')) {
                _.set(inputProps, 'watchKey', customProps.watchKey)
              }
            }
          }
          if (useType === formUseType) {
            const target = {
              forKey: _.uniqueId('realInputs'),
              label,
              key,
              useType,
              showType,
              inputType,
              itemProps,
              inputProps,
              customProps
            }
            if (inputType === InputType.component) {
              _.set(target, 'component', inputProps.component)
              _.unset(inputProps, 'component')
            }
            // 处理表单自定义配置项
            if ((realOptions && _.has(realOptions, 'isRequired')) || _.has(customProps, 'isRequired')) {
              const required = _.has(customProps, 'isRequired') ? customProps.isRequired : realOptions?.isRequired
              const requiredRule = { required, message: `请输入${label}!` }
              if (itemProps.rules) {
                const result = itemProps.rules.some(ele => _.has(ele, 'required'))
                !result && itemProps.rules.push(requiredRule)
              } else {
                itemProps.rules = [requiredRule]
              }
            }
            // 处理表单项自定义项
            if (customProps.isRow && realOptions?.column) {
              _.set(target, 'itemClass', styles.row)
              const formLabelCol = _.get(realFormProps, 'labelCol', { span: 4 }) as { span: number }
              const rowLabelColSpan = formLabelCol.span / realOptions.column
              if (_.isInteger(rowLabelColSpan)) {
                !_.has(itemProps, 'labelCol') && _.set(itemProps, 'labelCol', { span: rowLabelColSpan })
                !_.has(itemProps, 'wrapperCol') && _.set(itemProps, 'wrapperCol', { span: 24 - rowLabelColSpan })
              } else {
                console.warn('表单在多列时,使用isRow配置整行占位,表单的labelCol.span值除以列数的结果需要等于整数。当前结果是', rowLabelColSpan)
              }
            }
            else if (realOptions?.column && customProps.colNum) {
              _.set(target, 'itemStyle', {
                marginBottom: "8px",
                width: `${100 / realOptions.column * customProps.colNum}%`,
                padding: `0 ${(customProps.colNum - 1) * 5}px`
              })
              const formLabelCol = _.get(realFormProps, 'labelCol', { span: 4 }) as { span: number }
              const rowLabelColSpan = formLabelCol.span / customProps.colNum
              if (_.isInteger(rowLabelColSpan)) {
                !_.has(itemProps, 'labelCol') && _.set(itemProps, 'labelCol', { span: rowLabelColSpan })
                !_.has(itemProps, 'wrapperCol') && _.set(itemProps, 'wrapperCol', { span: 24 - rowLabelColSpan })
              } else {
                console.warn('表单在多列时,使用isRow配置整行占位,表单的labelCol.span值除以列数的结果需要等于整数。当前结果是', rowLabelColSpan)
              }
            }
            else {
              _.set(target, 'itemClass', cssClass.formItem)
            }
            if (customProps.when) {
              _.set(itemProps, 'hidden', true)
              _.set(target, 'rules', itemProps.rules)
              _.unset(itemProps, 'rules')
            }
            _realInputs.push(target)
          }
        } else if (React.isValidElement(item)) {
          _realInputs.push(item)
        }
      })

      let values: any = {}
      if (realInitData) {
        values = realInitData
        realForm.setFieldsValue(realInitData)
      } else if (realForm.isFieldsTouched()) {
        values = realForm.getFieldsValue()
      } else {
        _realInputs.forEach(ele => {
          !React.isValidElement(ele) && _.set(values, ele.key, ele.itemProps.initialValue)
        })
      }
      handleRealInputs(values, _realInputs)
    }
  }, [inputs, realInitData, formUseType, cssClass, realFormProps, realOptions, handleRealInputs, realForm])

  // 表单数据设置
  useEffect(() => {
    if (realForm && formData) {
      const _formData = _.cloneDeep(formData)
      handleRealInputs(_formData)
      realForm.setFieldsValue(_formData)
    }
  }, [formData, realForm, handleRealInputs])

  const handleValuesChange = useCallback((changedValues: any, allValues: any) => {
    handleRealInputs(allValues)
  }, [handleRealInputs])

  /**
   * 校验表单项when，判断是否展示
   * @param params 实际使用的表单项配置信息，本函数内部会对该参数进行修改。
   * @param values 表单当前的所有值
   */
  function handleHasDisabled(params: formPanelItem[], values: any) {
    const _params = _.cloneDeep(params)
    const needDisabledList = _.filter(_params, item => React.isValidElement(item) ? false : item.customProps.isInitHasDisabled) as RealInput[]
    if (needDisabledList.length > 0) {
      needDisabledList.forEach(item => {
        const value = _.get(values, item.key)
        if (!_.isUndefined(value)) {
          item.useType = UseType.show
        }
      })
      return _params
    } else {
      return params
    }
  }



  function handleReset() {
    if (initData) {
      const allFieldsValue = _.cloneDeep(realForm.getFieldsValue(true))
      for (const key in allFieldsValue) {
        const initVal = _.get(initData, key)
        _.set(allFieldsValue, key, initVal)
      }
      realForm.setFieldsValue(allFieldsValue)
    } else {
      realForm.resetFields()
    }
    onReset && onReset(realForm)
  }

  async function handleSubmit() {
    try {
      const result = await realForm.validateFields()
      onFinish && onFinish(result, realForm)
      if (onAsyncFinish) {
        setSubmitLoading(true)
        await onAsyncFinish(result, realForm)
        setSubmitLoading(false)
      }
    } catch (e: any) {
      console.warn('[FormPanel] handleSubmit', e)
    } finally {
      setSubmitLoading(false)
    }
  }

  function handleFill() {
    onFill && onFill(realForm)
  }
  function handleClose() {
    onClose && onClose()
  }

  return (
    <article className={`${styles.wrapper} hooks__FormPanel`}>
      <section>
        {realInputs.length > 0 &&
          <Form
            className={cssClass.form}
            name={formName}
            layout="horizontal"
            form={realForm}
            onValuesChange={handleValuesChange}
            onFinish={handleSubmit}
            {...realFormProps}
          >
            {realInputs.map((ele, index) => React.isValidElement(ele) ?
              <div className={styles.row} key={index}>{ele}</div> :
              <Form.Item style={ele.itemStyle}
                className={ele.itemClass}
                label={ele.label}
                name={ele.key}
                key={ele.forKey}
                {...ele.itemProps}>
                {formUseType === UseType.show || ele.useType === UseType.show ?
                  (ele.inputType === InputType.component && ele.component &&
                    <ele.component useType={UseType.show} {...ele.inputProps} />
                  ) || (ele.showType === ShowType.text &&
                    <TextSimple {...ele.inputProps} />
                  ) || (ele.showType === ShowType.textarea &&
                    <Input.TextArea {...ele.inputProps} readOnly />
                  ) || (ele.showType === ShowType.image &&
                    <ImageSimple {...ele.inputProps} />
                  ) || (ele.showType === ShowType.video &&
                    <video {...ele.inputProps} />
                  ) : (
                    (ele.inputType === InputType.input &&
                      <Input placeholder="请输入" {...ele.inputProps} />
                    ) || (ele.inputType === InputType.password &&
                      <Input.Password {...ele.inputProps} />
                    ) || (ele.inputType === InputType.select &&
                      <SelectSimple {...ele.inputProps} />
                    ) || (ele.inputType === InputType.selectRemote &&
                      <SelectRemote {...ele.inputProps} />
                    ) || (ele.inputType === InputType.component && ele.component &&
                      <ele.component useType={formUseType} {...ele.inputProps} />
                    ) || (ele.inputType === InputType.dateRange &&
                      <DateRangeSimple {...ele.inputProps} />
                    ) || (ele.inputType === InputType.textArea &&
                      <TextArea placeholder="请输入" {...ele.inputProps} />
                    ) || (ele.inputType === InputType.date &&
                      <DateSimple {...ele.inputProps} />
                    ) || (ele.inputType === InputType.dateTime &&
                      <DateTimeSimple {...ele.inputProps} />
                    ) || (ele.inputType === InputType.selectMultiple &&
                      <SelectMultipleSimple {...ele.inputProps} />
                    ) || (ele.inputType === InputType.selectMultipleRemote &&
                      <SelectMultipleRemote {...ele.inputProps} />
                    ) || (ele.inputType === InputType.dateTimeRange &&
                      <DateTimeRangeSimple {...ele.inputProps} />
                    ) || (ele.inputType === InputType.uploadImg &&
                      <UploadImg {...ele.inputProps} />
                    ) || (ele.inputType === InputType.cascaderRemote &&
                      <CascaderRemote {...ele.inputProps} />
                    ) || (ele.inputType === InputType.radio &&
                      <RadioSimple {...ele.inputProps} />
                    ) || (ele.inputType === InputType.checkbox &&
                      <CheckboxSimple {...ele.inputProps} />
                    ) || (ele.inputType === InputType.number &&
                      <InputNumber {...ele.inputProps} />
                    ) || (ele.inputType === InputType.treeRemote &&
                      <TreeRemote {...ele.inputProps} />
                    ) || (ele.inputType === InputType.uploadVideo &&
                      <UploadVideo {...ele.inputProps} />
                    ) || (ele.inputType === InputType.transferRemote &&
                      <TransferRemote {...ele.inputProps} />
                    ) || (ele.inputType === InputType.radioRemote &&
                      <RadioRemote {...ele.inputProps} />
                    ) || (ele.inputType === InputType.dayTimeRange &&
                      <DayTimeRange {...ele.inputProps} />
                    ) || (ele.inputType === InputType.uploadPicture &&
                      <UploadPicture {...ele.inputProps} />
                    )
                  )
                }
              </Form.Item>
            )}
            {realOptions?.isShowItemButton &&
              <Form.Item>
                <Space>
                  <Button type="primary" loading={submitLoading} onClick={handleSubmit}>{realOptions?.submitText || '确认'}</Button>
                  {realOptions?.isShowReset &&
                    <Button htmlType="button" onClick={handleReset}>重置</Button>
                  }
                  {realOptions?.footerButtons?.map(item =>
                    <Button {...item} >{item.text}</Button>
                  )}
                </Space>
              </Form.Item>
            }
          </Form>
        }
      </section>
      {(!realOptions || !realOptions.isNotShowFooter) && formUseType !== UseType.show &&
        <footer>
          <Space>
            {realOptions?.isShowClear &&
              <Button htmlType="button" onClick={handleClose}>取消</Button>
            }
            {(onFinish || onAsyncFinish) &&
              <Button type="primary" loading={submitLoading} onClick={handleSubmit}>{realOptions?.submitText || '确认'}</Button>
            }
            {realOptions?.isShowReset &&
              <Button htmlType="button" onClick={handleReset}>重置</Button>
            }
            {isShow &&
              <Button type="link" htmlType="button" onClick={handleFill}>填充</Button>
            }
            {realOptions?.footerButtons?.map(item =>
              <Button {...item} >{item.text}</Button>
            )}
          </Space>
        </footer>
      }
    </article>
  );
}

export default FormPanel;
