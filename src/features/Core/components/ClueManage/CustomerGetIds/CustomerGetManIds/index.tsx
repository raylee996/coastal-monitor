import React from "react";
import DataCenterListSelect from "../../../../../DataCenter/components/DataCenterListSelect";
import {InputType, ShowType, UseType} from "hooks/flexibility/FormPanel";
import {placeTypeDict} from "../../../../../../helper/dictionary";
import {doUploadFile} from "../../../../../../server/common";

interface Props {
  onFinish?: any
  onClosePopup?: any
  defaultSelectedKey?:any
}
const CustomerGetManIds:React.FC<Props> = ({onClosePopup,onFinish,defaultSelectedKey})=>{
  const columns = [
    ['人员ID', 'id'],
    ['照片', 'imgPath'],
    ['姓名', 'name'],
    ['性别', 'sex'],
    ['身份证号', 'idCard'],
    ['IMSI', 'imsi'],
    ['手机号', 'tel'],
    ['车牌号', 'carNum'],
    ['人员分类', 'type']
  ]

  const queryInputs = [
    ['人员',
      'searchValue',
      {
        placeholder: '请输入人员信息搜索',
        allowClear: true
      }
    ],
    [
      '人员分类',
      'equiType',
      InputType.select,
      {
        dict: placeTypeDict,
        style: { width: '180px' }
      }
    ],
    [
      '照片',
      'peopleImgSearchValue',
      InputType.uploadImg,
      ShowType.image,
      {
        isRow: true,
        maxCount: 2,
        useType: UseType.edit,
        uploadImgFn: doUploadFile,
        displayUrl: ''
      }
    ],
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
      url={'/archive/person/list'}
      onFinish={handleFinish}
      rowSelectionType={'checkbox'}
      columns={columns}
      queryInputs={queryInputs}
    />
  </div>
}

export default CustomerGetManIds
