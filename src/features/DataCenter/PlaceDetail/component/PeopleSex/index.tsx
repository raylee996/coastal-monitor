import { Radio, RadioChangeEvent } from "antd";
import { useState } from "react"
import { sexDict } from "helper/dictionary";
import styles from "./index.module.sass";

interface ISex {
    /** 数据项 */
    data?: any
    onFinish?: any
    /** 受控属性*/
    value?: any
    /** 值变化时的回调函数 */
    onChange?: (value: string) => void
}

const PeopleSex: React.FC<ISex> = ({ onChange, onFinish }) => {
    const [value, setValue] = useState("0");
    function handleOnChange({ target: { value } }: RadioChangeEvent) {
        if (onFinish) {
            onFinish(value)
        }
        setValue(value)
        onChange && onChange(value)
    }

    return (
        <div className={styles.radioSex}>
            <Radio.Group onChange={handleOnChange} value={value}>
                {sexDict.map((item: any, index: number) => {
                    return (
                        <Radio key={index} value={item.value}>{item.name}</Radio>
                    )
                })}
            </Radio.Group>
        </div>
    )
}


export default PeopleSex