
import { Button } from "antd";
import TableInterface from "hooks/integrity/TableInterface";
import { useRef, useState } from "react";
import { queryCaseArchiveList } from "server/dataCenter/caseArchive";
import styles from "./index.module.sass";

interface IAddCase {
    placeId: any
    onFinish?: any
    onClosePopup?: Function

}
const AddCase: React.FC<IAddCase> = (props) => {
    console.debug('AddEquipment')
    const { placeId, onClosePopup, onFinish } = props
    console.log(placeId)

    const tableRef = useRef<any>(null)

    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

    const columns = [
        ['序号', 'id'],
        ['案件编号', 'caseNo'],
        ['案件名称', 'caseName'],
        ['发案时间', 'happenTimeStart'],
        ['涉案地详址', 'happenAddress'],
        ['接警单位', 'registerUnit'],
        ['案件描述', 'caseDescr'],
    ]

    const queryInputs = [
        ['案件',
            'searchValue',
            {
                placeholder: '请输入案件编号/名称',
                allowClear: true
            }
        ]
    ]

    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
        setSelectedRowKeys(newSelectedRowKeys);
    }

    function handleFinish() {
        onFinish && onFinish(selectedRowKeys)
        onClosePopup && onClosePopup() // 关闭POPUP
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
                    request={queryCaseArchiveList}
                />
            </div>

            <div className={styles.foot}>
                <Button className={styles.btn} onClick={handleCancel}>取消</Button>
                <Button type="primary" onClick={handleFinish}>确定</Button>
            </div>
        </article>
    )
}

export default AddCase
