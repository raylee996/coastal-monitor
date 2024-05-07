import { InputNumber, Select } from "antd";
import { useEffect, useState } from "react"
import styles from "./index.module.sass";

interface Props {
    /** 是否不显示自动与手动选择框 */
    isNotShowAuto?: boolean
    /** 设置值 */
    value?: any
    /** 值更新回调 */
    onChange?: (values: any) => void
    onClosePopup?: Function
}

const SceneModeConfig: React.FC<Props> = ({ isNotShowAuto, value, onChange }) => {
    console.debug('SceneModeConfig')

    const [isAuto, setIsAuto] = useState<number>(1)
    const [num, setNum] = useState<number>()

    useEffect(() => {
        value?.isAuto && setIsAuto(value.isAuto)
        value?.num && setNum(value.num)
    }, [value])

    function handleChangeAuto(val: number) {
        setIsAuto(() => {
            onChange && onChange({
                isAuto: val,
                num 
            })
            return val
        })
    }

    function handleChangeNum(val: any) {
        setNum(() => {
            onChange && onChange({
                isAuto,
                num: val
            })
            return val
        })
    }

    return <article className={styles.wrapper}>
        {
            isNotShowAuto ? <></> : <Select
                className={styles.select}
                options={[
                    { label: '自动', value: 0 },
                    { label: '手动', value: 1 },
                ]}
                value={isAuto}
                onChange={handleChangeAuto}
            />
        }
        {
            isAuto === 1 ? <InputNumber
                className={styles.num}
                placeholder={'请输入值'}
                min={0}
                value={num}
                onChange={handleChangeNum}
            /> : <></>
        }
    </article>
}

export default SceneModeConfig