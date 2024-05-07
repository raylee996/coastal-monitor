import { Form } from "antd"
import { importCaseArchive } from "api/dataCenter/caseArchive"
import ExportFile from "component/ExportFile"
import ImportFile from "component/ImportFile"
import LabelManage from "component/LabelManage"
import popup from "hooks/basis/Popup"
import { InputType, UseType } from "hooks/flexibility/FormPanel"
import { ColType } from "hooks/flexibility/TablePanel"
import TableInterface from "hooks/integrity/TableInterface"
import { useRef } from "react"
import { deleteCaseArchive, queryCaseArchiveList } from "server/dataCenter/caseArchive"
import CaseArchiveDetail from "../CaseArchiveDetail"
import CaseArchiveInfo from "../CaseArchiveInfo"
import styles from "./index.module.sass";
import WindowDelet from "component/WindowDelet";
// import popupmini from "component/PopupMini";
import popupUI from "component/PopupUI"

const CaseArchiveTable: React.FC = () => {
  console.debug('CaseAchive')

  const tableRef = useRef<any>(null)
  const [form] = Form.useForm();

  const columns = [
    ['案件名称', 'caseName', {
      itemProps: {
        ellipsis: true,
      }
    }],
    ['案件编号', 'caseNo'],
    ['案情来源', 'caseSourceName'],
    ['专案标识', 'caseMarkName'],
    ['案件类别', 'labelName'],
    ['发案地详址', 'happenAddress', {
      itemProps: {
        ellipsis: true,
      }
    }],
    ['发案时间', 'happenTime', ColType.tooltip],
    ['操作人', 'updateBy'],
    ['操作时间', 'updateTime'],
    [
      ['编辑', (record: any) => {
        //打开信息编辑窗口
        popup(<CaseArchiveDetail type={UseType.edit} id={record.id} onFinish={handleFinishEdit} />, { title: '编辑案件', size: "fullscreen" })
      }],
      ['详情', (record: any) => {
        //打开信息详情窗口
        popup(<CaseArchiveInfo caseItem={record} />, { title: '案件详情', size: "fullscreen" })
      }],
      ['删除', async (record: any) => {
        popupUI(<WindowDelet title={'确定删除档案吗？'} request={deleteCaseArchive} id={record.id} onSuccess={() => {
          // message.success('删除成功！')
          handleFinishEdit()
        }} />, { title: '删除提示', size: 'auto' })
        // await deleteCaseArchive(record.id)
        // handleFinishEdit()
      }]
    ]
  ]

  const queryInputs = [
    ['案件',
      'searchValue',
      {
        placeholder: '请输入案件名称/案件编号',
        allowClear: true
      }
    ],
    ['发案时间', 'createTime', InputType.dateTimeRange]
  ]

  // 表格右侧功能键区
  const toolsRight: any = [
    ['案件类别管理', {
      onClick: () => {
        popup(<LabelManage type={8} />, { title: '案件类别管理', size: "middle" })
      },
      type: 'primary',
    }],
    ['新增', {
      onClick: () => {
        popup(<CaseArchiveDetail type={UseType.add} onFinish={handleFinishEdit} />, { title: '新增案件', size: "fullscreen" })
      },
      //type: 'primary',
    }],
    ['导入', {
      onClick: () => {
        popupUI(<ImportFile templateUrl={'/archive/caseBase/down/template'} api={importCaseArchive} fileName={'案件档案导入模板'} importFileName={`案件档案导入_${new Date().getTime()}`} refreshTable={handleFinishEdit} />, { title: '导入', size: "mini" })
      }
    }],
    [<ExportFile url={'/archive/caseBase/export'} extra={{}} targetRef={tableRef} targetForm={form} fileName={'案件档案列表'} />, {}]
  ]

  function handleFinishEdit() {
    tableRef.current.onRefresh()
  }

  return (
    <article className={styles.wrapper}>
      <TableInterface
        ref={tableRef}
        columns={columns}
        queryInputs={queryInputs}
        queryForm={form}
        toolsHeader={toolsRight}
        request={queryCaseArchiveList}
      />
    </article>
  )
}

export default CaseArchiveTable