import React, {useState} from "react";
import { ColType} from "hooks/flexibility/TablePanel";
import TableInterface from "hooks/integrity/TableInterface";
import {getShipListTable} from "../../../../../../server/ship";
import styles from './index.module.sass'
import {Button} from "antd";
import {InputType} from "hooks/flexibility/FormPanel";
import {personTypeDict} from "../../../../../../helper/dictionary";

const CaseManAdd:React.FC = ()=>{

  const [selectedMount, setSelectedMount] = useState(0);
  const inputs = [
    ['人员','name',{
      itemProps:{
        style:{
          width:'300px'
        },
      },
      placeholder:'请输入姓名/身份证号/车牌搜索'
    }],
    ['人员分类','type',InputType.select,{
      dict: personTypeDict
    }],
    ['照片','image',InputType.uploadImg]
  ]
  const columns = [
    ['照片', 'image', ColType.image],
    ['姓名', 'mmsi'],
    ['性别', 'mmsi'],
    ['身份证号', 'mmsi'],
    ['手机号', 'mmsi'],
    ['车牌号', 'mmsi'],
    ['人员分类', 'mmsi']
  ]
  //勾选
  function handleRowCheckbox(selectedRowKeys: any[]){
    setSelectedMount(selectedRowKeys.length)
  }
  return<div className={styles.wrapper}>
    <TableInterface
      queryInputs={inputs}
      columns={columns}
      request={getShipListTable}
      tableProps={{
        size: 'small',
        rowSelection: {
          type: 'checkbox',
          onChange: handleRowCheckbox,
          preserveSelectedRowKeys: true
        }
      }}
      tools={[
        <div className={styles.tools}>
          <div className={styles.selected}>
            已选择<span>{selectedMount}</span>个
          </div>
          <Button type='primary'>确定添加</Button>
        </div>
      ]}
    />
  </div>
}

export default CaseManAdd
