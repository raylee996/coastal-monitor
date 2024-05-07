import { importPlaceList } from "api/ship";
import ExportFile from "component/ExportFile";
import ImportFile from "component/ImportFile";
import LabelManage from "component/LabelManage";
import popup from "hooks/basis/Popup";
import { InputType, UseType } from "hooks/flexibility/FormPanel";
import { ColType } from "hooks/flexibility/TablePanel";
import TableInterface from "hooks/integrity/TableInterface";
import { useCallback, useMemo, useRef } from "react";
import { getQueryPlaceList, deletePlaceList } from "server/place";
import PlaceDetail from "../PlaceDetail";
import PlaceInfo from "../PlaceInfo";
import { Form } from "antd";
import styles from "./index.module.sass";
import { getLabelTable } from "server/label";
import WindowDelet from "component/WindowDelet";
// import popupmini from "component/PopupMini";
import popupUI from "component/PopupUI";


const queryInputs = [
  ['场所', 'name', {
    placeholder: '请输入场所',
    allowClear: true
  }
  ],
  ['场所类型', 'labelId', InputType.selectRemote,
    {
      request: async () => {
        const vo = await getLabelTable({ type: 9 })
        return vo?.data?.map((item: any) => {
          const { labelName, id } = item
          return {
            name: labelName,
            value: id,
          }
        }) || []
      },
      allowClear: true,
      style: { width: '150px' }
    }
  ]
]

// [
//   '场所类型',
//   'labelId',
//   InputType.select,
//   {
//     dict: labelList.map(item => {
//       return {
//         name: item.labelName,
//         value: item.id
//       }
//     }),
//     allowClear: true,
//     onChange: handleLabelIdChange
//   }
// ],


const PlaceTable: React.FC = () => {
  console.debug('PlaceTable')


  const [form] = Form.useForm();

  const tableRef = useRef<any>(null)


  const handleRefresh = useCallback(
    () => {
      tableRef.current.onRefresh()
    },
    [],
  )


  const columns = useMemo(() => [
    // ['序号', 'index'],
    ['场所名称', 'name', {
      itemProps: {
        ellipsis: true
      }
    }],
    ['场所类型', 'labelName'],
    ['风险等级', 'levelName'],
    ['场所地区', 'areaFullName', ColType.tooltip],
    ['场所详址', 'address', ColType.tooltip],
    ['采集设备数量', 'deviceNum'],
    ['关联案件数', 'caseNum'],
    ['最新关联案件', 'newestCaseName'],
    [
      ['查看', (record: any) => {
        popup(<PlaceInfo id={record.id} labelId={record.labelId} placeInfo={record} />, { title: '查看重点场所详情', size: "fullscreen" })
      }],
      ['编辑', (record: any) => {
        popup(<PlaceDetail type={UseType.edit} id={record.id} onSuccess={() => {
          tableRef.current.onRefresh()
        }} />, { title: '编辑重点场所', size: "large" })
      }],
      ['删除', async (record: any) => {
        popupUI(<WindowDelet title={'确定删除重点场所吗？'} request={deletePlaceList} id={record.id} onSuccess={() => {
          tableRef.current.onRefresh()
        }} />, { title: '删除提示', size: 'auto' })
        // await deletePlaceList(record.id)
        // tableRef.current.onRefresh()
      }],
      ['布控', (record: any) => {
        popup(<PlaceInfo id={record.id} labelId={record.labelId} defaultTargetKey='2' warningInfoKey="1" placeInfo={record} />, { title: '查看重点场所详情', size: "fullscreen" })
      }],
    ]
  ], [])

  const toolsRight = useMemo(() => [
    ['场所类型管理', {
      onClick: () => {
        popup(<LabelManage type={9} />, { title: '场所类型管理', size: "middle" })
      },
      type: 'primary',
    }],
    ['新增', {
      onClick: () => {
        popup(<PlaceDetail onSuccess={handleRefresh} />, { title: '新增重点场所', size: "large" })
      }
    }],
    ['导入', {
      onClick: () => {
        popupUI(<ImportFile fileName={'重点场所导入模板'} api={importPlaceList} templateUrl={'/archive/place/down/template'} refreshTable={handleRefresh} />, { title: '导入', size: "mini" })
      }
    }],
    [<ExportFile fileName={'重点场所列表'} targetForm={form} url={'/archive/place/export'} extra={{}} />, {}]
  ], [handleRefresh, form])




  return (
    <div className={styles.wrapper}>
      <TableInterface
        ref={tableRef}
        queryForm={form}
        columns={columns}
        queryInputs={queryInputs}
        toolsHeader={toolsRight}
        request={getQueryPlaceList}
      />
    </div>
  )
}

export default PlaceTable