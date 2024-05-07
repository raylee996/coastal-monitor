import { Select, SelectProps } from "antd"
import { Type } from "helper/dictionary"
import { CSSProperties, useEffect, useMemo, useState } from "react";
import styles from "./index.module.sass";


interface Props extends SelectProps {
  /** 扩展类名 */
  wrapperClass?: string
  /** 下拉组件的可选项字典类型 */
  dict?: Type<any>[]
  /** 自定义宽度 */
  width?: number
  /** 自定义最小宽度 */
  minWidth?: number
  /** 表单的标签名称 */
  formlabel?: string
}

const SelectSimple: React.FC<Props> = ({ wrapperClass, dict, width, minWidth, formlabel, ...selectProps }) => {
  console.debug('SelectSimple')

  const [options, setOptions] = useState<any[]>()

  const [selectStyle] = useState<CSSProperties>(() => {
    const result: CSSProperties = {}
    if (width) {
      result.width = width
    }
    if (minWidth) {
      result.minWidth = minWidth
    }
    return result
  })

  const [placeholder] = useState<string>(() => {
    return formlabel ? `请选择${formlabel}` : "请选择"
  })

  // 监听dict
  useEffect(() => {
    if (dict) {
      const result: any[] = []
      dict.forEach(ele => result.push({ ...ele, label: ele.name }))
      setOptions(result)
    }
  }, [dict])

  const articleClass = useMemo(() => wrapperClass ? `${styles.wrapper} ${wrapperClass}` : styles.wrapper, [wrapperClass])

  return (
    <article className={articleClass}>
      <Select
        style={selectStyle}
        options={options}
        placeholder={placeholder}
        allowClear
        getPopupContainer={triggerNode => triggerNode.parentElement}
        {...selectProps}>
      </Select>
    </article>
  )
}

export default SelectSimple