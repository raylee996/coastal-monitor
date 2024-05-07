import React, { CSSProperties, useCallback, useEffect, useMemo, useState } from "react";
import styles from "./index.module.sass";
import { Form, FormInstance, Select, SelectProps } from "antd";
import { Type } from "helper/dictionary"

interface Props extends SelectProps {
  /** 远程请求 */
  request: (params?: any) => Promise<Type<any>[]>
  /** 自定义宽度 */
  width?: Number
  /** 表单的标签名称 */
  formlabel?: string
  /** 表单的标签名称 */
  formkey?: string
  /** 表单FormInstance */
  form?: FormInstance<any>
  /** 监听表单对应的字段 */
  watchKey?: string
  /** 值模式：1：普通模式 2 自定义格式  */
  optionMode?: number
  /** 样式类名 */
  className?: string
  /** 是否默认选中第一项 */
  isSelectFirst?: boolean
}

const SelectRemote: React.FC<Props> = ({ request, width, formlabel, formkey, form, watchKey, optionMode, className, isSelectFirst, ...otherProps }) => {
  console.debug('SelectRemote')

  const [realform] = Form.useForm(form);
  const watchValue = Form.useWatch(watchKey || '', realform);

  const [options, setOptions] = useState<any[]>([]);

  const [selectStyle] = useState<CSSProperties>(() => {
    const result: CSSProperties = {}
    if (width) {
      result.width = width as number
    }
    return result
  })

  const [placeholder] = useState<string>(() => {
    return formlabel ? `请选择${formlabel}` : "请选择"
  })

  const handleOnChange = useCallback(
    (val: any, option: any) => {
      formkey && realform.setFieldValue(formkey, val)
    },
    [formkey, realform],
  )


  useEffect(() => {
    async function main() {
      let result: any[] = []
      const vo: any = await request(watchValue)
      if (optionMode === 1) {
        vo.forEach((ele: { name: any; }) => result.push({ ...ele, label: ele.name }))
      } else if (optionMode === 2) {
        result = vo
      }
      if (isSelectFirst && formkey) {
        if (result.length) {
          realform.setFieldValue(formkey, result[0].value)
        } else {
          realform.setFieldValue(formkey, undefined)
        }
      }
      setOptions(result)
    }
    main();
    return () => {
      setOptions([])
    };
  }, [request, watchValue, optionMode, isSelectFirst, formkey, realform]);


  const selectClassName = useMemo(() => className ? `${styles.select} ${className}` : styles.select, [className])

  return (
    <Select
      className={selectClassName}
      style={selectStyle}
      options={options}
      placeholder={placeholder}
      onChange={handleOnChange}
      allowClear
      getPopupContainer={triggerNode => triggerNode.parentElement}
      {...otherProps}>
    </Select>
  )
}
SelectRemote.defaultProps = {
  optionMode: 1,// 下拉值模式，1：普通  2：自定义
}
export default SelectRemote
