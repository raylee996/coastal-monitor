
import { Button, Input } from "antd";
import common from "helper/common";
import { useState } from "react";
import { doEditLabel } from "server/label";
import styles from "./index.module.sass";

interface ILabelEdit {
    type?: any
    item?: any
    onFinish?: Function
    onClosePopup?:Function
}
const LabelEdit: React.FC<ILabelEdit> = (props) => {

    const { item, onFinish, type, onClosePopup } = props

    // 编辑
    const [editValue, setEditValue] = useState(item.labelName);

    const handleInputEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditValue(e.target.value);

    };


    /**编辑 */
    async function handleEditLabel() {
        if (editValue === '') {
            common.showMessage({ msg: '标签名不能为空', type: 'warning' })
            return
        }
        const vo = await doEditLabel({
            id: item.id,
            labelName: common.trimString(editValue),//标签名
            type,//标签类型 1人员档案 2车辆档案 3手机档案 4船舶档案 5雷达目标 6船舶布控 7建模风险类别 8案件类别 9场所类型 10人员布控 11便签类别
        })

        // if (vo.code === 200) {
        if (vo.includes("更新")) {
            onFinish && onFinish(editValue)
            onClosePopup && onClosePopup()
        }
    }

    return (
        <div className={styles.wapper}>
            {/* <p>已选标签：{item.labelName}</p> */}
            <Input
                type="text"
                maxLength={20}
                showCount
                style={{ width: 340 }}
                value={editValue}
                onChange={handleInputEditChange}
                allowClear
                className={styles.editInput}
            />
            <Button className={styles.btn} type="primary" onClick={() => { handleEditLabel() }}>确定</Button>
        </div>
    )
}

export default LabelEdit
