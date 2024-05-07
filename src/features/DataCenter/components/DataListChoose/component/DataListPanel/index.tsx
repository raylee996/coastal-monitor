
import { Button } from "antd";
import TableInterface from "hooks/integrity/TableInterface";
import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./index.module.sass";

interface IDataListPanel {
  /**server */
  request?: any
  /**表格列配置 */
  columns?: any
  /**查询条件配置 */
  queryInputs?: any
  /**选择类型，单选:radio，多选:checkbox */
  rowSelectionType?: any
  onFinish?: any
  onClosePopup?: Function,
  /*默认选中项*/
  defaultSelectedKey?: any
  /** 查询条件默认参数 */
  queryInit?: any
}

const DataListPanel: React.FC<IDataListPanel> = ({ request, onClosePopup, onFinish, rowSelectionType, columns, queryInputs, defaultSelectedKey, queryInit }) => {
  console.debug('DataListPanel')


  const tableRef = useRef<any>(null)


  const [selectedPerson, setSelectedPerson] = useState<any>([]); // 选择的数据
  const [selectedKey, setSelectedKey] = useState<any>([]) // 选择的数据
  const [columnsData, setColumnsData] = useState<any>([]) // 列配置
  const [queryInputsData, setQueryInputsData] = useState<any>([]) // 表格查询条件配置


  //默认选中项
  useEffect(() => {
    if (defaultSelectedKey) {
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
    setSelectedPerson(selectedRows)
  }

  // 确定
  function handleFinish() {
    onFinish && onFinish(selectedPerson)
    onClosePopup && onClosePopup() // 关闭POPUP
  }

  function handleCancel() {
    onClosePopup && onClosePopup() // 关闭POPUP
  }

  const tableProps = useMemo(() => {
    return {
      rowSelection: {
        type: rowSelectionType,
        onChange: onSelectChange,
        preserveSelectedRowKeys: true,
        selectedRowKeys: selectedKey,
      }
    }
  }, [rowSelectionType, selectedKey])


  return (
    <article className={styles.wapper}>
      <div className={styles.equiBox}>
        <TableInterface
          ref={tableRef}
          tableProps={tableProps}
          columns={columnsData}
          queryInputs={queryInputsData}
          queryInit={queryInit}
          request={request}
        />
      </div>

      <div className={styles.foot}>
        <Button className={styles.btn} onClick={handleCancel}>取消</Button>
        <Button type="primary" onClick={handleFinish}>确定</Button>
      </div>
    </article>
  )
}

DataListPanel.defaultProps = {
  rowSelectionType: 'radio',
}

export default DataListPanel