
import { Button } from "antd";
import { InputType } from "hooks/flexibility/FormPanel";
import TableInterface from "hooks/integrity/TableInterface";
import { useRef, useState } from "react";
import { doGetDeviceType } from "server/device";
import { doGetAllDevicesList, doPlaceAddDevice } from "server/place";
import styles from "./index.module.sass";

interface IAddEquipment {
    placeId: any
    onFinish?: any
    onClosePopup?: Function

}
const AddEquipment: React.FC<IAddEquipment> = (props) => {
    console.debug('AddEquipment')
    const { placeId, onClosePopup, onFinish } = props
    // console.log(placeId)

    const tableRef = useRef<any>(null)
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [selectedRows, setSelectedRows] = useState<React.Key[]>([]);

    const columns = [
        ['序号', 'id'],
        ['设备编号', 'deviceCode'],
        ['设备名称', 'deviceName'],
        ['设备类型', 'deviceTypeNumName'],
        ['地址', 'deviceAddr']
    ]

    const queryInputs = [
        ['设备名称',
            'deviceNameOrCode',
            {
                placeholder: '请输入场所',
                allowClear: true
            }
        ],
        [
            '设备类型',
            'deviceType',
            InputType.selectRemote,
            {
                request: doGetDeviceType,
                style: { width: '180px' }
            }
        ]
    ]

    const onSelectChange = (newSelectedRowKeys: React.Key[], selectedRows: any[]) => {
        setSelectedRows(selectedRows)
        setSelectedRowKeys(newSelectedRowKeys);
    }

    async function handleFinish() {
        const vo: any = await doPlaceAddDevice({
            focusPlaceId: placeId,
            deviceId: selectedRowKeys,
            selectedRows
        })

        if (vo?.code === 0) {

        }
        else{
            onFinish && onFinish(selectedRowKeys)
            onClosePopup && onClosePopup() // 关闭POPUP
        }
       
    }

    function handleCancel() {
        onClosePopup && onClosePopup() // 关闭POPUP
    }
    return (
        <article className={styles.wapper}>
            <div className={styles.equiBox}>
                <TableInterface
                    ref={tableRef}
                    extraParams={{}}
                    tableProps={{
                        rowSelection: {
                            selectedRowKeys,
                            onChange: onSelectChange,
                        }
                    }}
                    columns={columns}
                    queryInputs={queryInputs}
                    request={doGetAllDevicesList}
                />
            </div>

            <div className={styles.foot}>
                <Button className={styles.btn} onClick={handleCancel}>取消</Button>
                <Button type="primary" onClick={handleFinish}>确定</Button>
            </div>
        </article>
    )
}

export default AddEquipment
