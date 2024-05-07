import { Select, SelectProps } from "antd"
import { Type } from "helper/dictionary"
import _ from "lodash";
import { CSSProperties, useState } from "react";
import styles from "./index.module.sass";


interface Props extends Omit<SelectProps, 'value' | 'onChange'> {
    /** 下拉组件的可选项字典类型 */
    dict: Type<any>[]
    /** 自定义宽度 */
    width?: Number
    /** 受控属性 */
    value?: any
    /** 值变化时的回调函数 */
    onChange?: (value: any) => void
}

const SelectMultipleSimple: React.FC<Props> = props => {
    console.debug('SelectSimple', props)

    const { dict, value, width } = props

    const [options] = useState<any[]>(() => {
        const result: any[] = []
        dict.forEach(ele => result.push({ ...ele, label: ele.name }))
        return result
    })

    const [selectStyle] = useState<CSSProperties>(() => {
        const result: CSSProperties = {}
        if (width) {
            result.width = width as number
        }
        return result
    })

    const [selectProps] = useState<SelectProps>(() => {
        // 忽略自定义接口参数和受控参数，得出下拉组件原始参数
        const result = _.omit(props, ['onChange', 'value']);
        return result
    })

    function handleChange(value: any) {
        props.onChange && props.onChange(value)
    }

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

export default SelectMultipleSimple