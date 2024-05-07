
import { Button } from "antd";
import { defaultImgPeople } from "helper/common";
import { personTypeDict } from "helper/dictionary";
import ImageSimple from "hooks/basis/ImageSimple";
import { InputType, ShowType, UseType } from "hooks/flexibility/FormPanel";
import { ColType } from "hooks/flexibility/TablePanel";
import TableInterface from "hooks/integrity/TableInterface";
import { useEffect, useRef, useState } from "react";
import { doUploadFile } from "server/common";
import { doGetPersonList } from "server/personnel";
import styles from "./index.module.sass";

interface IPersonnelArchiveSelect {
  id?: any
  columns?: any
  queryInputs?: any
  rowSelectionType?: any
  onFinish?: any
  onClosePopup?: Function

}
const PersonnelArchiveSelect: React.FC<IPersonnelArchiveSelect> = (props) => {
  console.debug('PersonnelArchiveSelect')
  const { id, onClosePopup, onFinish, rowSelectionType, columns, queryInputs } = props
  console.log(id)
  const tableRef = useRef<any>(null)

  const [selectedPerson, setSelectedPerson] = useState<any>([]);

  const [columnsData, setColumnsData] = useState<any>([
    // ['序号', 'id'],
    // ['照片', 'facePath', ColType.image],
    ['照片', 'facePath', ColType.image, {
      itemProps: {
        render: (text: any, record: any) => {
          return (
            <ImageSimple width={80} height={80} src={record.facePath} defaultSrc={defaultImgPeople} />
          )
        }
      }
    }],
    ['姓名', 'name'],
    ['性别', 'genderName'],
    ['身份证号', 'idcard'],
    // ['IMSI', 'imsi'],
    ['手机号', 'phone'],
    ['车牌号', 'licensePlate'],
    ['人员分类', 'personTypeName']
  ])

  useEffect(() => {

    if (columns) {
      setColumnsData(columns)
    }
  }, [columns])


  const [queryInputsData, setQueryInputsData] = useState<any>([
    ['人员',
      'searchValue',
      {
        placeholder: '请输入人员信息搜索',
        allowClear: true
      }
    ],
    [
      '人员分类',
      'personType',
      InputType.select,
      {
        dict: personTypeDict,
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
  ])

  useEffect(() => {

    if (queryInputs) {
      setQueryInputsData(queryInputs)
    }
  }, [queryInputs])



  // 单选
  const onSelectChange = (selectedRowKeys: React.Key[], selectedRows: any[]) => {
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
            }
          }}
          columns={columnsData}
          queryInputs={queryInputsData}
          request={doGetPersonList}

        />
      </div>

      <div className={styles.foot}>
        <Button className={styles.btn} onClick={handleCancel}>取消</Button>
        <Button type="primary" onClick={handleFinish}>确定</Button>
      </div>
    </article>
  )
}

PersonnelArchiveSelect.defaultProps = {
  rowSelectionType: 'radio',
}
export default PersonnelArchiveSelect
