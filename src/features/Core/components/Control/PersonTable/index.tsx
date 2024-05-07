import { Button, Form, Space } from "antd";
import ExportFile from "component/ExportFile";
import LabelManage from "component/LabelManage";
import popup from "hooks/basis/Popup";
import { InputType } from "hooks/flexibility/FormPanel";
import TableInterface from "hooks/integrity/TableInterface";
import { useRef } from "react";
import { cancelItem, doGetControlInfoList, getAreaOptionsAndRecords } from "server/core/controlManage";
import PersonDetail from "../PersonDetail";
import styles from "./index.module.sass";
import { continueControlItem, cancelControlItem, deleteControlItem } from "server/core/controlManage"
import ContinueCancelControl from "../components/ContinueCancelControl"
import { Popconfirm } from "antd";
import windowstill from "hooks/basis/Windowstill";
import PersonInfo from "../PersonInfo";
import { getDeptCascader, getUserListByDept } from "server/user";
import { ControlStatusDict } from "helper/dictionary";
import { useAppDispatch } from "app/hooks";
import { setIndex, setParams } from "slice/funMenuSlice";

const commonForm = [
  ['审批部门', 'approveDeptId', InputType.cascaderRemote,
    {
      remote: getDeptCascader,
      placeholder: '请选择审批部门',
      changeOnSelect: true,
      isRequired: true,
    }],
  ['审批人', 'approvePersonId', InputType.selectRemote,
    {
      watchKey: 'approveDeptId',
      request: getUserListByDept,
      placeholder: '请选择审批人',
      isRequired: true,
      isSelectFirst: true
    }],
]

const ContinueInputs = [
  ['续控天数', 'continueDay', InputType.number, {
    placeholder: '请选择输入续控天数',
    isRequired: true,
    min: 1,
    max: 9999,
    style: {
      width: '280px'
    }
  }],
]
const CancelInputs = [
  ['备注', 'desc', InputType.textArea, {
    placeholder: '请输入备注',
    isRequired: true,
  }],
]

const queryInputs = [
  ['布控区域', 'areaId', InputType.selectRemote, {
    request: async () => {
      const [options] = await getAreaOptionsAndRecords()
      let arr = options.map((item: any) => {
        return {
          ...item,
          name: item.label
        }
      })
      return arr
    },
    width: '180px'
  }
  ],
  ['布控名称', 'controlName', {
    placeholder: '请输入',
    allowClear: true
  }],
  ['布控状态', 'controlStatus', InputType.select, {
    dict: ControlStatusDict,
    placeholder: '请选择',
    allowClear: true,
    width: '150px'
  }],
  ['创建日期', 'createTime', InputType.dateTimeRange]
]

interface Props {
  onClosePopup?: Function
}
const PersonTable: React.FC<Props> = ({ onClosePopup }) => {
  console.debug('PersonTable')

  //数据定义
  const [form] = Form.useForm();
  const tableRef = useRef<any>(null)

  const dispatch = useAppDispatch()

  const tools = [
    ['新增', {
      onClick: () => {
        popup(<PersonDetail onSuccess={refresh} />, { title: '新增人车布控', size: "middle" })
      },
      type: "primary"
    }],
    ['布控分类管理', {
      onClick: () => {
        popup(<LabelManage type={10} />, { title: '布控分类管理', size: "middle" })
      }
    }],
    [<ExportFile url={'/alarm/controlInfo/exportControlInfoExcel'} conf={{ method: 'get' }} extra={{ controlCategory: 2 }} targetRef={tableRef} targetForm={form} />, {}]
  ]

  const columns = [
    ['布控人', 'createByName'],
    ['布控分类', 'controlTypeName'],
    ['布控名称', 'controlName'],
    ['布控等级', 'controlLevelName'],
    ['布控单位', 'createByDeptName'],
    ['公开方式', 'publicWayName'],
    ['布控事由', 'controlReason', {
      itemProps: {
        ellipsis: true
      }
    }],
    ['布控区域', 'areaName'],
    ['创建时间', 'createTime'],
    ['截止日期', 'expiryDate'],
    ['布控状态', 'controlStatusName'],
    ['预警次数', 'alarmNum', {
      itemProps: {
        width: '100px',
        render: (text: any, record: any) => {
          return (
            <>
              <Button type={"link"} onClick={() => handleGoEarlyWarning({ ...record, modelName: record.controlName })}>{record.alarmNum}</Button>
            </>
          )
        }
      }
    }],
    ['操作', '', {
      itemProps: {
        width: '180px',
        render: (text: any, record: any) => {
          // 布控状态;(1:待审批,2:已撤回,3:已布控,4:已撤控,5:已驳回,6:续控中,7:撤控中)
          const showBtn = {
            withdraw: [1].includes(record.controlStatus),
            edit: [2, 4, 5].includes(record.controlStatus),
            del: [2, 4, 5].includes(record.controlStatus),
            continued: [3].includes(record.controlStatus) && ![6].includes(record.approveStatus),
            cancel: [3].includes(record.controlStatus) && ![7].includes(record.approveStatus),
            continuednext: [6].includes(record.approveStatus),
            cancelnext: [7].includes(record.approveStatus),
          }
          return (
            <Space>
              <Button type={"link"} onClick={() => showDetail(record)}>查看</Button>
              {showBtn.withdraw &&
                <Popconfirm title="确定要撤回吗?" onConfirm={() => withdrawControl(record)}>
                  <Button type={"link"}>撤回</Button>
                </Popconfirm>
              }
              {showBtn.edit &&
                <Button type={"link"} onClick={() => openControl(record)}>编辑</Button>
              }
              {showBtn.del &&
                <Popconfirm title="确定要删除吗?" onConfirm={() => handleDelControl(record)}>
                  <Button type={"link"} >删除</Button>
                </Popconfirm>
              }
              {showBtn.continued &&
                <Button type={"link"} onClick={() => continuedControl(record)}>续控</Button>
              }
              {showBtn.continuednext && <Button type={"link"} onClick={() => continuedControl(record)}>续控中</Button>}
              {showBtn.cancel &&
                <Button type={"link"} onClick={() => cancelControl(record)}>撤控</Button>
              }
              {showBtn.cancelnext && <Button type={"link"} onClick={() => cancelControl(record)}>撤控中</Button>}
            </Space>
          )
        }
      }
    }]
  ]

  // 跳转并打开至预警列表 弹窗
  function handleGoEarlyWarning(record: any) {
    dispatch(setParams(record))
    dispatch(setIndex(2))
    onClosePopup && onClosePopup()
  }

  function showDetail(record: any) {
    windowstill(<PersonInfo id={record.id} record={record} />, { title: '布控信息查看', width: '1680px', height: '820px', offset: [120, 60] })
  }

  function openControl(record?: any) {
    windowstill(<PersonDetail id={record.id} onSuccess={refresh} params={record} />, { title: `${record ? '编辑' : '新增'}布控`, width: '1280px', height: '780px', offset: [320, 60] })
  }

  async function handleDelControl(record: any) {
    await deleteControlItem({ id: record.id })
    refresh()
  }

  function continuedControl(record: any) {
    console.log(record, 'record')
    popup(<ContinueCancelControl id={record.id} formInputs={[...ContinueInputs, ...commonForm]} api={continueControlItem} refresh={refresh} />, { title: '续控', size: "small" })
  }

  function cancelControl(record: any) {
    console.log(record, 'record')
    popup(<ContinueCancelControl id={record.id} formInputs={[...CancelInputs, ...commonForm]} api={cancelControlItem} refresh={refresh} />, { title: '撤控', size: "small" })
  }

  async function withdrawControl(record: any) {
    await cancelItem({ id: record.id })
    refresh()
  }

  function refresh() {
    tableRef.current.onRefresh()
  }

  return (
    <div className={styles.wrapper}>
      <TableInterface
        ref={tableRef}
        queryForm={form}
        columns={columns}
        queryInputs={queryInputs}
        toolsRight={tools}
        request={doGetControlInfoList}
      />
    </div>
  )
}

export default PersonTable