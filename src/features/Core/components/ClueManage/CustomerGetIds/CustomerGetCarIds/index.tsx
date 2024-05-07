import React from "react";
import DataCenterListSelect from "../../../../../DataCenter/components/DataCenterListSelect";

interface Props {
  onFinish?: any
  onClosePopup?: any
  defaultSelectedKey?:any
}
const CustomerGetCarIds:React.FC<Props> = ({onClosePopup,onFinish,defaultSelectedKey})=>{
  // 船舶布控
  const columns = [
    ['车辆ID', 'id'],
    ['车牌', 'licensePlate'],
    ['创建时间', 'createTime'],

  ]

  const queryInputs = [
    ['车牌号',
      'licensePlate',
      {
        placeholder: '请输入车牌',
        allowClear: true
      }
    ]
  ]

  // 确定
  function handleFinish(data?: any) {
    onFinish && onFinish(data)
    onClosePopup && onClosePopup() // 关闭POPUP
  }

  return <div style={{padding:'20px'}}>
    <DataCenterListSelect
      defaultSelectedKey={defaultSelectedKey}
      onClosePopup={onClosePopup}
      url={'/archive/car/list'}
      onFinish={handleFinish}
      rowSelectionType={'checkbox'}
      columns={columns}
      queryInputs={queryInputs}
    />
  </div>
}

export default CustomerGetCarIds
