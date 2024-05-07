import { nationDict } from "helper/dictionary";
import styles from "./index.module.sass";
import SelectSimple from "hooks/basis/SelectSimple";

interface INation {
    /** 数据项 */
    data?: any
    onFinish?: any
    /** 受控属性*/
    value?: any
    /** 值变化时的回调函数 */
    onChange?: (value: string) => void
}

const PeopleNation: React.FC<INation> = ({ onChange, onFinish }) => {
    function handleOnChange(params: any, other: any) {
        onFinish && onFinish({ ...params, ...other })
        onChange && onChange(params)
    }

    return (
        <div className={styles.selectBox}>
            <SelectSimple dict={nationDict} onChange={handleOnChange} />
        </div>
    )
}

export default PeopleNation