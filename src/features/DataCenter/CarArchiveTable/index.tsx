import ExportFile from "component/ExportFile";
import LabelManage from "component/LabelManage";
import TabsBtn from "component/TabsBtn"
import popup from "hooks/basis/Popup";
import { UseType } from "hooks/flexibility/FormPanel";
import TableInterface from "hooks/integrity/TableInterface";
import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { doGetCarList, getCarsTypes } from "server/car";
import CarArchiveDetail from "../CarArchiveDetail";
import styles from "./index.module.sass";
import { Form } from "antd";
import ImportFile from "component/ImportFile";
import { importCars } from "api/car";
import "../dataCenter.sass"
import VoitureGallery from "./components/VoitureGallery";
import { useLocation } from "react-router-dom";
import popupUI from "component/PopupUI";


const paginationProps = {
  pageSize: 27,
}

const cardOptions = {
  isFlex: true
}

const queryInputs = [
  ['车辆',
    'searchValue',
    {
      placeholder: '请输入车牌号',
      allowClear: true
    }
  ]
]

const CarArchiveTable: React.FC = (props) => {
  console.debug('CarArchiveTable')


  const [form] = Form.useForm();


  const tableRef = useRef<any>(null)


  const { state } = useLocation() as { state: { focusType: string } }


  const [tabData, setTabData] = useState<any[]>([])
  const [tabType, setTabType] = useState<string | undefined>(state?.focusType ? state.focusType : '')


  const handleFinishEdit = useCallback(
    () => {
      tableRef.current.onRefresh()
    },
    [],
  )


  // 表格右侧功能键区
  const toolsRight = useMemo(() => [
    ['研判', {
      onClick: () => {
        //跳转
      },
      type: 'primary',
    }],
    ['标签管理', {
      onClick: () => {
        console.log('标签管理')
        popup(<LabelManage type={2} />, { title: '标签管理', size: "middle" })
      }
    }],
    ['新增', {
      onClick: () => {
        popup(<CarArchiveDetail type={UseType.edit} onFinish={handleFinishEdit} />, { title: '新增车辆档案', size: "middle" })
      }
    }],
    ['导入', {
      onClick: () => {
        popupUI(<ImportFile api={importCars} templateUrl={'/archive/car/down/template'} refreshTable={handleFinishEdit} />, { title: '导入', size: "mini" })

      }
    }],
    [<ExportFile url={'/archive/car/export'} extra={{ type: tabType }} targetRef={tableRef} targetForm={form} />, {}]
  ], [form, handleFinishEdit, tabType])


  useEffect(() => {
    async function main() {
      const vo = await getCarsTypes({})
      setTabData((oldVal: any) => {
        let arr = vo.data.map((ele: any, index: number) => {
          return ({
            name: ele.keyName, value: ele.key, num: ele.count, img: '', bgClass: ele.bgClass,
            staticPic: ele.key === '2' ? require('images/dataCenter/carpotres.png') :
              ele.key === '3' ? require('images/dataCenter/cargaz.png') : require('images/dataCenter/caryib.png'),
            svgId: ele.key === '2' ? 'importid' : ele.key === '3' ? 'gzdata' : 'yibans',
            svgPic: ele.key === '2' ? require('images/dataCenter/port_car.svga') :
              ele.key === '3' ? require('images/dataCenter/gz_car.svga') : require('images/dataCenter/yb_car.svga')
          })
        })
        return arr
      })
    }
    main()

  }, [])


  const handleChangeFocusType = useCallback(
    (data: string) => {
      setTabType(val => {
        return data
      })
    },
    [],
  )


  const extraParams = useMemo(() => ({ type: tabType }), [tabType])


  return (
    <article className={styles.wrapper}>
      <TabsBtn type='3' data={tabData} defaultValue={state?.focusType} onChange={handleChangeFocusType} />
      <div className={styles.table}>
        <TableInterface
          ref={tableRef}
          card={VoitureGallery}
          request={doGetCarList}
          queryForm={form}
          extraParams={extraParams}
          queryInputs={queryInputs}
          toolsHeader={toolsRight}
          cardOptions={cardOptions}
          paginationProps={paginationProps}
        />
      </div>
    </article>
  )
}

export default CarArchiveTable
