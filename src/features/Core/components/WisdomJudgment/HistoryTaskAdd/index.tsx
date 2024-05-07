import React, {useState} from "react";
import styles from "./index.module.sass";
import TableInterface from "hooks/integrity/TableInterface";
import { getJudgmentListAsync} from "../../../../../server/core/wisdomJudgment";
import {Button} from "antd";

interface Props{
  //1:船舶，2：人车
  objType: number,
  //默认选中项
  defaultKeys?: any[]
  //选项改变时触发
  onChange?:Function
  //关闭弹窗
  onClosePopup?:Function
  //选中的数据
  selectedRowsList?:any

}
const HistoryTaskAdd:React.FC<Props> = ({objType,defaultKeys,onChange,onClosePopup,selectedRowsList})=>{
  const columns = [
    ['任务状态', 'statusName'],
    ['任务名称', 'modelName'],
    ['研判对象', 'objType'],
    ['数据类型', 'dataType'],
    ['关联案件', 'caseIdName'],
    ['模型', 'modelIdName'],
    ['研判条件', 'eventType', {
      itemProps: {
        width: '300px'
      }
    }],
    ['结果数量', 'resultNum'],
  ]
  const inputs: any[] = [
    ['任务名称', 'modelName', {
      placeholder: '请输入任务名称',
      itemProps: {},
      allowClear: true
    }],
  ]
  const [rowKeys, setRowKeys] = useState<any[]>(defaultKeys || [])
  const [selectedRows, setSelectedRows] = useState<any[]>(selectedRowsList || []);

  function handleRowCheckBox(selectedRowKeys: any[], selectedRows: any[]){
    setRowKeys(selectedRowKeys)
    setSelectedRows(selectedRows)
  }
  function handleConfirm(){
    onChange && onChange(selectedRows)
    onClosePopup && onClosePopup();
  }
  return <div className={styles.wrapper}>
    <TableInterface
      extraParams={{'objType':objType,'requireResultNum':1}}
      queryInputs={inputs}
      columns={columns}
      tools={[<div className={styles.selectedTaskInfo}>
        已选择 {selectedRows.length}条。
        {selectedRows.length > 0 && selectedRows.map((item:any)=>{
          return <span key={item.id} className={styles.selectedTag}>{item.modelName}</span>
        })}
        {selectedRows.length > 0 && <Button type={"primary"} onClick={handleConfirm}>确定</Button>}
      </div>]}
      tableProps={{
        rowKey: 'id',
        rowSelection: {
          type: 'checkbox',
          onChange: handleRowCheckBox,
          selectedRowKeys: rowKeys,
          preserveSelectedRowKeys: true
        }
      }}
      request={getJudgmentListAsync}
      paginationProps={{
        showTotal: (total: number) => {
          return `总数 : ${total}`
        }
      }}
    />
  </div>
}

export default HistoryTaskAdd
