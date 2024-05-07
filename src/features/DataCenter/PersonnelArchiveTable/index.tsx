import { message } from "antd";
import ExportFile from "component/ExportFile";
import LabelManage from "component/LabelManage";
import TabsBtn from "component/TabsBtn"
import popup from "hooks/basis/Popup";
import { InputType, ShowType, UseType } from "hooks/flexibility/FormPanel";
import TableInterface from "hooks/integrity/TableInterface";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { doUploadFileFaceid } from "server/common";
import { doGetPersonList, getPersonTypes } from "server/personnel";
import PersonnelArchiveDetail from "../PersonnelArchiveDetail";
import styles from "./index.module.sass";
import { Form } from "antd";
import ImportFile from "component/ImportFile";
import { importPersons } from "api/personnel";
import "../dataCenter.sass"
import WisdomJudgment from "features/Core/components/WisdomJudgment";
import PersonGallery from "./component/PersonGallery";
import { useLocation } from "react-router-dom";
import popupUI from "component/PopupUI";


const paginationProps = {
  pageSize: 18,
  pageSizeOptions: [18, 27, 36, 54, 81],
  showTotal: (total: number) => {
    return `共 ${total} 条`
  }
}

const queryInputs = [
  ['人员',
    'searchValue',
    {
      placeholder: '请输入姓名/身份证/手机号/IMSI',
      allowClear: true
    }
  ],
  [
    '照片',
    'facePath',
    InputType.uploadImg,
    ShowType.image,
    {

      isRow: true,
      maxCount: 1,
      useType: UseType.edit,
      uploadImgFn: doUploadFileFaceid,// 上传带
      displayUrl: ''
    }
  ]
]

const PersonnelArchiveTable: React.FC = () => {
  console.debug('PersonnelArchiveTable')


  const [form] = Form.useForm();


  const tableRef = useRef<any>(null)


  const { state } = useLocation() as { state: { focusType: string } }


  const [tabData, setTabData] = useState<any[]>([])
  const [tabType, setTabType] = useState<string | undefined>(state?.focusType ? state.focusType : undefined)
  const [selectedItem] = useState<any>([])


  const handleGetTabData = useCallback<any>(() => {
    async function main() {
      const vo = await getPersonTypes({})
      let _tabData = vo.data.map((ele: any,) => ({
        name: ele.keyName,
        value: ele.key,
        num: ele.count,
        img: '',
        bgClass: ele.bgClass,
        staticPic: ele.key === '2' ? require('images/dataCenter/personsport.png') :
          ele.key === '3' ? require('images/dataCenter/persongz.png') : require('images/dataCenter/personyiban.png'),
        svgId: ele.key === '2' ? 'importid' : ele.key === '3' ? 'gzdata' : 'yibans',
        svgPic: ele.key === '2' ? require('images/dataCenter/port_person.svga') :
          ele.key === '3' ? require('images/dataCenter/gz_person.svga') : require('images/dataCenter/yb_person.svga')
      }))
      setTabData(_tabData)
    }
    main()
  }, [])

  const handleRefresh = useCallback(
    () => {
      tableRef.current.onRefresh()
      handleGetTabData()
    },
    [handleGetTabData],
  )


  // 表格右侧功能键区
  const toolsRight = useMemo(
    () => [
      ['研判', {
        onClick: () => {
          //跳转
          if (selectedItem.length === 0) {
            message.warning('请选择数据')
          } else {
            let clueInfo: any[] = []
            for (let i = 0; i < selectedItem.length; i++) {
              if (selectedItem[i].radarNumber) {
                clueInfo.push({
                  codeType: 7,
                  codeValue: selectedItem[i].radarNumber,
                  imageUrl: selectedItem[i].shipImgPath
                })
              } else {
                clueInfo.push({
                  codeType: 6,
                  codeValue: selectedItem[i].mmsi,
                  imageUrl: selectedItem[i].shipImgPath
                })
              }
            }
            popup(<WisdomJudgment data={{ clueInfo, objType: 1, dataType: ['04', '05'] }} />, { title: '智能研判', size: 'fullscreen' })
          }
        },
        type: 'primary',
      }],
      ['标签管理', {
        onClick: () => {
          console.log('个人档案标签管理')
          popup(<LabelManage type={1} />, { title: '个人档案标签管理', size: "middle" })
        }
      }],
      ['新增', {
        onClick: () => {
          popup(<PersonnelArchiveDetail type={UseType.edit} onFinish={handleRefresh} />, { title: '新增个人档案', size: "fullscreen" })
        }
      }],
      ['导入', {
        onClick: () => {
          popupUI(<ImportFile api={importPersons} templateUrl={'/archive/person/down/template'} refreshTable={handleRefresh} />, { title: '导入', size: "mini" })
        }
      }],
      [<ExportFile url={'/archive/person/export'} extra={{ personType: tabType }} targetRef={tableRef} targetForm={form} />, {}]
    ],
    [form, handleRefresh, selectedItem, tabType]
  )


  useEffect(() => {
    handleGetTabData()
  }, [handleGetTabData])


  // 选择人员
  function handlerSelectPeople(data?: any) {
    console.log(data)
  }

  function handleChangeFocusType(data: string) {
    setTabType(val => {
      if (val === data) {
        return undefined
      } else {
        return data
      }
    })
  }

  const handlerAction = useCallback(() => {
    handleGetTabData()
  }, [handleGetTabData])


  const extraParams = useMemo(() => ({
    personType: tabType
  }), [tabType])

  const cardOptions = useMemo(() => ({
    onSelected: handlerSelectPeople,
    isFlex: true,
    onCardActions: handlerAction,
  }), [handlerAction])


  return (
    <article className={styles.wrapper}>
      <TabsBtn type='2' data={tabData} defaultValue={state?.focusType} onChange={handleChangeFocusType} />
      <div className={styles.table}>
        <TableInterface
          ref={tableRef}
          card={PersonGallery}
          queryForm={form}
          extraParams={extraParams}
          request={doGetPersonList}
          queryInputs={queryInputs}
          toolsHeader={toolsRight}
          cardOptions={cardOptions}
          paginationProps={paginationProps}
        />
      </div>

    </article>
  )
}

export default PersonnelArchiveTable
