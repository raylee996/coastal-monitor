import React, { useRef } from "react";
import TableInterface from "hooks/integrity/TableInterface";
import { ColType } from "hooks/flexibility/TablePanel";
import { Button, message } from "antd";
import popup from "hooks/basis/Popup";
import PersonnelArchiveSelect from "features/DataCenter/PersonnelArchiveTable/component/PersonnelArchiveSelect";
import { InputType, ShowType, UseType } from "hooks/flexibility/FormPanel";
import { doUploadFile } from "server/common";
import { personTypeDict } from "helper/dictionary";
import { addCaseSuspectsItem, deleteCaseSuspects, qureyCaseSuspectsList } from "server/dataCenter/caseArchive";
import PersonnelArchiveInfo from "features/DataCenter/PersonnelArchiveInfo";
import styles from './index.module.sass'
import ImageSimple from "hooks/basis/ImageSimple";
import { defaultImgPeople } from "helper/common";
import WindowDelet from "component/WindowDelet";
// import popupmini from "component/PopupMini";
import popupUI from "component/PopupUI";

interface Props {
  /**选中的案件 */
  caseItem?: any
}

//涉案人员
const CaseMan: React.FC<Props> = ({ caseItem }) => {
  console.debug('CaseMan')

  const tableRef = useRef<any>(null)

  const inputs = [
    ['人员', 'searchValue', {
      itemProps: {
        style: {
          width: '300px'
        },
      },
      placeholder: '请输入姓名/身份证号/车牌搜索'
    }]
  ]
  const columns = [
    ['照片', 'facePathArray', ColType.image, {
      itemProps: {
        render: (text: any, record: any) => {
          return (<>
            {<ImageSimple width={60} height={60} src={record.facePathArray} defaultSrc={defaultImgPeople} />}
          </>
          )
        }
      }
    }],
    ['姓名', 'name'],
    ['车牌', 'licensePlate'],
    ['性别', 'genderName'],
    ['身份证号', 'idcard'],
    // ['身高/cm', 'height'],
    ['地区', 'censusRegion'],
    ['家庭住址', 'address'],
    ['操作时间', 'handleTime'],
    ['操作人', 'handleName'],
    [
      ['查看档案', (record: any) => {
        popup(<PersonnelArchiveInfo id={record.personId} />, { title: '个人档案详情', size: "fullscreen" })
      }],
      ['删除', async (record: any) => {
        popupUI(<WindowDelet title={'确定删除人员吗？'} request={deleteCaseSuspects} id={record.id} onSuccess={() => {
          message.success('删除成功！')
          refreshTable()
        }} />, { title: '删除提示', size: 'auto' })
        // await deleteCaseSuspects(record.id)
        // refreshTable()
      }]
    ]
  ]

  function handleAdd() {
    const columns = [
      // ['序号', 'id'],
      ['照片', 'facePath', ColType.image, {
        itemProps: {
          render: (text: any, record: any) => {
            return (<>
              {<ImageSimple width={60} height={60} src={record.facePath} defaultSrc={defaultImgPeople} />}
            </>
            )
          }
        }
      }],
      ['姓名', 'name'],
      ['性别', 'genderName'],
      ['身份证号', 'idcard'],
      ['手机号', 'phone'],
      ['车牌号', 'licensePlate'],
      ['人员分类', 'personTypeName']
    ]

    const queryInputs = [['人员',
      'searchValue',
      {
        placeholder: '请输入人员信息搜索',
        allowClear: true
      }
    ],
    ['人员分类', 'personType', InputType.select, {
      dict: personTypeDict
    }],
    [
      '照片',
      'facePath',
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
    popup(<PersonnelArchiveSelect onFinish={handleSelectPerson} rowSelectionType={'checkbox'} columns={columns} queryInputs={queryInputs} />, { title: '添加人员', size: "large" })
  }

  // 选择人员后
  async function handleSelectPerson(data: any) {
    const params = {
      peroson: data?.length ? data[0] : [],
      caseId: caseItem.id
    }
    await addCaseSuspectsItem(params)
    refreshTable()
  }

  // 刷新列表
  function refreshTable() {
    tableRef.current.onRefresh()
  }

  return <article className={styles.warpperCases}>
    <TableInterface
      queryInputs={inputs}
      ref={tableRef}
      columns={columns}
      request={qureyCaseSuspectsList}
      extraParams={{ caseId: caseItem.id }}
      toolsRight={[<div style={{ marginRight: '20px' }}>
        <Button type={"primary"} onClick={handleAdd}>添加</Button>
      </div>]}
    />
  </article>
}

export default CaseMan
