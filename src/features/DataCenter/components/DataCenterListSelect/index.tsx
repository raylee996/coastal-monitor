
import { Button } from "antd";
import TableInterface from "hooks/integrity/TableInterface";
import { useEffect, useRef, useState } from "react";
import { doAll } from "server/common";
import styles from "./index.module.sass";

interface IDataCenterListSelect {
    url?: any
    props?: any
    id?: any
    /**表格列配置 */
    columns?: any
    /**查询条件配置 */
    queryInputs?: any
    /**选择类型，单选:radio，多选:checkbox */
    rowSelectionType?: any
    onFinish?: any
    onClosePopup?: Function,
    /*默认选中项*/
    defaultSelectedKey?:any

}
const DataCenterListSelect: React.FC<IDataCenterListSelect> = (props) => {
    console.debug('DataCenterListSelect')
    const { url, id, onClosePopup, onFinish, rowSelectionType, columns, queryInputs,defaultSelectedKey } = props
    console.log(id)
    const tableRef = useRef<any>(null)

    // 选择的数据
    const [selectedPerson, setSelectedPerson] = useState<any>([]);

    const [selectedKey,setSelectedKey] = useState<any>([])

    // 列配置
    const [columnsData, setColumnsData] = useState<any>([])

    // 表格查询条件配置
    const [queryInputsData, setQueryInputsData] = useState<any>([])

    //默认选中项
    useEffect(() => {
      if (defaultSelectedKey){
          setSelectedKey(defaultSelectedKey)
      }
    }, [defaultSelectedKey]);


    // 监听列配置
    useEffect(() => {
        if (columns) {
            setColumnsData(columns)
        }
    }, [columns])

    // 监听查询条件配置
    useEffect(() => {
        if (queryInputs) {
            setQueryInputsData(queryInputs)
        }
    }, [queryInputs])

    // 单选
    const onSelectChange = (selectedRowKeys: React.Key[], selectedRows: any[]) => {
        setSelectedKey(selectedRowKeys)
        setSelectedPerson([selectedRowKeys, selectedRows])
    }

    // 确定
    function handleFinish() {
        onFinish && onFinish(selectedPerson)
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
                            type: rowSelectionType,
                            onChange: onSelectChange,
                            preserveSelectedRowKeys: true,
                            selectedRowKeys: selectedKey,
                        }
                    }}
                    columns={columnsData}
                    queryInputs={queryInputsData}
                    request={(pageInfo: any, params: any) => {
                        return doAll({ ...pageInfo }, { ...params }, { url, method: 'get', })
                    }}
                />
            </div>

            <div className={styles.foot}>
                <Button className={styles.btn} onClick={handleCancel}>取消</Button>
                <Button type="primary" onClick={handleFinish}>确定</Button>
            </div>
        </article>
    )
}

DataCenterListSelect.defaultProps = {
    rowSelectionType: 'radio',
}
export default DataCenterListSelect
