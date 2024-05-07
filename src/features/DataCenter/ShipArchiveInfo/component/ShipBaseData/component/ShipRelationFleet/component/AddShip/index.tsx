import { Button, Input, message } from "antd"
import CustomerGetShipIds from "features/Core/components/ClueManage/CustomerGetIds/CustomerGetShipIds"
import popup from "hooks/basis/Popup"
import { useState } from "react"
import { addArchiveEntityAndRelationAsync, editRelationEntityAsync } from "server/ship"
import styles from './index.module.sass'

interface Props {
    id?: any //编辑时候使用的ID
    teamName?: string //船队名称
    onClosePopup?: Function
    record?: any
    selfShipId: string //自身船舶的id
}
// 新增编辑船舶
const AddShip: React.FC<Props> = ({ id, teamName, onClosePopup, record, selfShipId }) => {

    const [selectedShip, setselectedShip] = useState(id || null)
    const [shipName, setshipName] = useState(teamName || '')
    const [selectedShipInfo, setselectedShipInfo] = useState<any>(record || {})


    // 选择船舶
    function selectShip() {
        popup(<CustomerGetShipIds onFinish={handleChooseShip} isSelectSingle={true} />, { title: '添加船舶', size: 'large' })
    }
    function handleChooseShip(data: any) {
        let info = data[1][0]
        setselectedShipInfo(info)

        setselectedShip(data[0][0])
    }
    function handleChange(e: any) {
        setshipName(e.target.value)
    }

    // 确定添加
    async function handleSubmit() {
        if (shipName === '') {
            message.error('船队名称不能为空')
            return
        }
        if (!selectedShip) {
            message.error('请选择船舶')
            return
        }
        let dto = {
            relationType: 22,
            sourceDataType: 6,
            targetDataType: 3,
            targetId: selectedShip,
            sourceName: shipName
        }
        // 自身船舶信息
        let dto2 = {
            relationType: 22,
            sourceDataType: 6,
            targetDataType: 3,
            targetId: selfShipId,
            sourceName: shipName
        }
        let vo = await addArchiveEntityAndRelationAsync(dto)
        let vo2 = await addArchiveEntityAndRelationAsync(dto2)
        if (vo.data.code === 200 && vo2.data.code === 200) {
            message.success('新增成功')
            onClosePopup && onClosePopup()
        } else {
            message.error(vo.data.msg)
        }
    }
    // 编辑
    async function handleEdit() {
        if (shipName === '') {
            message.error('船队名称不能为空')
            return
        }
        if (!selectedShip) {
            message.error('请选择船舶')
            return
        }
        let dto = {
            relationType: 22,
            sourceDataType: 6,
            targetDataType: 3,
            targetId: selectedShip,
            sourceName: shipName,
            oldSourceName: teamName
        }
        let dto2 = {
            relationType: 22,
            sourceDataType: 6,
            targetDataType: 3,
            targetId: selfShipId,
            sourceName: shipName,
            oldSourceName: teamName
        }
        let vo = await editRelationEntityAsync(dto)
        let vo2 = await editRelationEntityAsync(dto2)
        if (vo.data.code === 200 && vo2.data.code === 200) {
            message.success('编辑成功')
            onClosePopup && onClosePopup()
        } else {
            message.error(vo.data.msg)
        }
    }
    return <div className={styles.wrapper}>
        <div>
            <span className={styles.title}>基本信息 :</span> <Button type="primary" onClick={selectShip}>选择船舶</Button>
        </div>
        {selectedShip && <div className={styles.shipInfo}>
            <span className={styles.title}>已选择船舶 :</span>
            <div>
                <div>船名：{selectedShipInfo.cnName || selectedShipInfo.enName || selectedShipInfo.name}</div>
                <div>mmsi：{selectedShipInfo.mmsi}</div>
                <div>ID：{selectedShip}</div>

            </div>
        </div>}
        <div>
            <span className={`${styles.title} ${styles.required}`}>船队名称 :</span>
            <Input className={styles.input} value={shipName} onChange={(e) => handleChange(e)} />
        </div>
        <div className={styles.bottom}>
            {!id && <Button type="primary" onClick={handleSubmit}>确定</Button>}
            {id && <Button type="primary" onClick={handleEdit}>确定</Button>}
            <Button type="default" onClick={() => onClosePopup && onClosePopup()}>取消</Button>
        </div>
    </div>
}

export default AddShip