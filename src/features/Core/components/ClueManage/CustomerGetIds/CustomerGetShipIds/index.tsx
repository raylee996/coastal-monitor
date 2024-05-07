import React from "react";
import DataCenterListSelect from "../../../../../DataCenter/components/DataCenterListSelect";
import {ColType} from "hooks/flexibility/TablePanel";

interface Props {
  onFinish?: any
  onClosePopup?: any
  defaultSelectedKey?:any
  isSelectSingle?: boolean //是否选择一个
}
const CustomerGetShipIds:React.FC<Props> = ({onClosePopup,onFinish,defaultSelectedKey,isSelectSingle})=>{
  // 船舶布控
  const columns = [
    ['船舶ID', 'id'],
    ['照片', 'shipImgPath', ColType.image],
    ['英文船名', 'enName'],
    ['中文船名', 'cnName'],
    ['船型', 'shipTypeName'],
    ['MMSI', 'mmsi'],
    ['目标ID', 'targetId'],
    ['雷达批号', 'radarBatch'],
    ['船长/米', 'shipLong'],
    ['船宽/米', 'shipWide'],
    ['建档时间', 'updateTime'],
    ['标签', 'labelNames'],
    ['船舶分类', 'focusTypeName']
  ]

  const queryInputs = [
    ['船舶',
      'shipSearchValue',
      {
        placeholder: '请输入船名/MMSI',
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
      url={'/archive/ship/list'}
      onFinish={handleFinish}
      rowSelectionType={isSelectSingle?'radio':'checkbox'}
      columns={columns}
      queryInputs={queryInputs}
    />
  </div>
}

export default CustomerGetShipIds
