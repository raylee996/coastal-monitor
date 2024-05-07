import { Form, FormInstance, Select, SelectProps } from "antd"
import { Type } from "helper/dictionary"
import { CSSProperties, useCallback, useEffect, useState } from "react";
import styles from "./index.module.sass";


interface Props extends Omit<SelectProps, 'value' | 'onChange'> {
  /** 自定义宽度 */
  width?: Number
  /** 自定义最小宽度 */
  minWidth?: Number
  /** 受控属性 */
  value?: any
  /** 表单FormInstance */
  form?: FormInstance<any>
  /** 监听表单对应的字段 */
  watchKey?: string
  /** 值变化时的回调函数 */
  onChange?: (value: any) => void
  /** 远程数据请求 */
  remote: (params?: any) => Promise<Type<any>[]>
}

const SelectMultipleRemote: React.FC<Props> = ({ width, minWidth, value, form, watchKey, onChange, remote, ...selectProps }) => {
  console.debug('SelectMultipleRemote')

  const [realform] = Form.useForm(form);
  const watchValue = Form.useWatch(watchKey || '', realform);


  const [options, setOptions] = useState<any[]>([])

  const [selectStyle] = useState<CSSProperties>(() => {
    const result: CSSProperties = {}
    if (width) {
      result.width = width as number
    }
    if (minWidth) {
      result.minWidth = minWidth as number
    }
    return result
  })


  useEffect(() => {
    async function main() {
      const result: any[] = []
      const vo = await remote(watchValue)
      vo.forEach(ele => result.push({ ...ele, label: ele.name }))
      setOptions(result)
    }
    main();
    return () => {
      setOptions([])
    };
  }, [remote, watchValue]);


  const handleChange = useCallback(
    (value: any) => {
      onChange && onChange(value)
    },
    [onChange],
  )


  return (
    <article className={styles.wrapper}>
      <Select
        mode="multiple"
        style={selectStyle}
        options={options}
        onChange={handleChange}
        value={value}
        allowClear
        placeholder="请选择"
        getPopupContainer={triggerNode => triggerNode.parentElement}
        {...selectProps}>
      </Select>
    </article>
  )
}

export default SelectMultipleRemote