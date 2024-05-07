import styles from "./index.module.sass";
import { getLabelSelect } from "server/label";
import SelectRemote from "hooks/basis/SelectRemote";
import common from "helper/common";

interface ILabelSelect {
    /** 数据项 */
    data?: any
    isFilter?: any
    onFinish?: any
    mode?: any
    style?: any
    /**是否显示向下箭头 */
    showArrow?: any
    /**标签类型 1人员档案 2车辆档案 3手机档案 4船舶档案 5雷达目标 6船舶布控 7建模风险类别 8案件类别 9场所类型 10人员布控 11便签类别 */
    type?: any
    /** 受控属性*/
    value?: any
    isSelect?:boolean
    /** 值变化时的回调函数 */
    onChange?: (value: string) => void
    optionMode?: number
}

const LabelSelect: React.FC<ILabelSelect> = (props) => {

    const { style, showArrow, mode, type, onChange, onFinish, value, isFilter, optionMode,isSelect } = props

    let val: any = []

    if (!common.isNull(value)) {
        val = value.split(",")
    }

    if (val && val.length !== 0) {
        val.forEach((item: any, index: number) => {
            val[index] = parseInt(item)
        })
    }

    // onChange方法
    function handleOnChange(params: any, other: any) {
        onFinish && onFinish({ ...params, ...other })
        onChange && onChange(params && params.length !== 0 ? params.join(",") : '')
    }

    return (
        <div className={styles.selectBox}>
            <SelectRemote
                optionMode={optionMode}
                value={val}
                style={style}
                showArrow={showArrow} mode={mode}
                onChange={handleOnChange}
                request={() => {
                    return getLabelSelect({ type, isFilter,isSelect })
                }}
            />
        </div>
    )
}

// 组件属性默认值
LabelSelect.defaultProps = {
    mode: 'multiple',
    showArrow: true,
    isFilter: true,
    optionMode: 1
}

export default LabelSelect