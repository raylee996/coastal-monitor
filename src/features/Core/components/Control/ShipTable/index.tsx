import { cancelControlItem, cancelItem, continueControlItem, deleteControlItem, doGetAreainfoList, getAllControlList } from "server/core/controlManage"
import popup from "hooks/basis/Popup"
import { InputType } from "hooks/flexibility/FormPanel"
import TableInterface from "hooks/integrity/TableInterface";
import { useRef } from "react"
import ShipAdd from "../ShipAdd"
import ContinueCancelControl from "../components/ContinueCancelControl"
import windowstill from "hooks/basis/Windowstill"
import ShipControlDetail from "../ShipDetail"
import LabelManage from "component/LabelManage"
import styles from "./index.module.sass";
import { Button, Popconfirm } from "antd";
import ExportFile from "component/ExportFile";
import moment from "moment";
import popupUI from "component/PopupUI";
import { getDeptCascader, getUserListByDept } from "server/user";
import { useAppDispatch } from "app/hooks";
import { setIndex, setParams } from 'slice/funMenuSlice';
import { ControlLevelDict, ControlStatusDict } from "helper/dictionary";


interface Props {
  /** popup组件隐式传入的关闭窗口函数 */
  onClosePopup?: Function
}

const controlInputs: any[] = [
  ['布控名称', 'controlName', {
    placeholder: '请输入布控名称',
    allowClear: true
  }],
  ['创建日期', 'createTime', InputType.dateRange],
  ['等级', 'controlLevel', InputType.select, {
    dict: ControlLevelDict
  }],
  ['布控区域', 'areaId', InputType.selectRemote, {
    request: async () => {
      const vo = await doGetAreainfoList({
        controlTypeId: '1'
      })
      return vo.data
    },
    width: '180px'
  }],
  ['布控状态', 'controlStatus', InputType.select, {
    dict: ControlStatusDict
  }]
]

const commonForm = [
  ['审批部门', 'approveDeptId', InputType.cascaderRemote, {
    remote: getDeptCascader,
    changeOnSelect: true,
    isRequired: true,
  }],
  ['审批人', 'approvePersonId', InputType.selectRemote, {
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
      width: '180px'
    }
  }],
]

const CancelInputs = [
  ['备注', 'desc', InputType.textArea, {
    placeholder: '请输入备注',
    isRequired: true,
  }],
]

const ShipTable: React.FC<Props> = ({ onClosePopup }) => {
  console.debug('ShipTable')

  const ControlRef = useRef<any>(null)
  const dispatch = useAppDispatch()

  const columns = [
    ['布控人', 'createByName'],
    ['布控分类', 'controlTypeName'],
    ['布控名称', 'controlName', {
      itemProps: {
        ellipsis: true,
        width: '200px',
      }
    }],
    ['等级', 'controlLevelName', {
      itemProps: {
        width: '64px',
      }
    }],
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
          // 布控状态;(1:待审批,2:已撤回,3:已布控,4:已撤控,5:已驳回)
          // 是否续控撤控 (0:正常,1:续控中,2:撤控中)
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
            <section>
              <Button type={"link"} onClick={() => showDetail(record)} className={styles.detailBtn}>查看</Button>
              {showBtn.withdraw && <Popconfirm title="确定要撤回吗?" onConfirm={() => withdrawControl(record)}>
                <Button type={"link"} className={styles.detailBtn}>撤回</Button>
              </Popconfirm>}
              {showBtn.edit && <Button type={"link"} onClick={() => openControl(record)} className={styles.detailBtn}>编辑</Button>}
              {showBtn.del && <Popconfirm title="确定要删除吗?" onConfirm={() => handleDelControl(record)}>
                <Button type={"link"} className={styles.detailBtn}>删除</Button>
              </Popconfirm>}
              {showBtn.continued && <Button type={"link"} onClick={() => continuedControl(record)} className={styles.detailBtn}>续控</Button>}
              {showBtn.continuednext && <Button type={"link"} onClick={() => continuedControl(record, true)} className={styles.detailBtn}>续控中</Button>}
              {showBtn.cancel && <Button type={"link"} onClick={() => cancelControl(record)} className={styles.detailBtn}>撤控</Button>}
              {showBtn.cancelnext && <Button type={"link"} onClick={() => cancelControl(record, true)} className={styles.detailBtn}>撤控中</Button>}
            </section>
          )
        }
      }
    }],
  ]

  const tools: any = [
    ['新增', {
      onClick: () => {
        openControl()
      },
      type: "primary"
    }],
    ['分类布控管理', {
      onClick: () => {
        popup(<LabelManage type={6} typeName={'分类布控'} />, { title: '分类布控标签管理', size: "middle" })
      }
    }],
    [<ExportFile url={'/alarm/controlInfo/exportControlInfoExcel'} extraFunc={getExportParams} conf={{ method: 'get' }} />, {}]
  ]
  // 跳转并打开至预警列表 弹窗
  function handleGoEarlyWarning(record: any) {
    dispatch(setParams(record))
    dispatch(setIndex(2))
    onClosePopup && onClosePopup()
  }
  function showDetail(record: any) {
    console.log(record, 'record')
    windowstill(<ShipControlDetail record={record} />, { title: '布控信息查看', width: '1280px', height: '820px', offset: [320, 60] })
  }

  function continuedControl(record: any, isShow?: boolean) {
    console.log(record, 'record')
    popup(<ContinueCancelControl
      id={record.id}
      formInputs={[...ContinueInputs, ...commonForm]}
      api={continueControlItem}
      isShow={isShow}
      refresh={refresh} />,
      { title: '续控', size: "small" })
  }

  function cancelControl(record: any, isShow?: boolean) {
    console.log(record, 'record')
    popup(<ContinueCancelControl
      id={record.id}
      formInputs={[...CancelInputs, ...commonForm]}
      api={cancelControlItem}
      isShow={isShow}
      refresh={refresh} />,
      { title: '撤控', size: "small" })
  }

  function openControl(record?: any) {
    popupUI(<ShipAdd controlType={1} editData={record ? { ...record, isOpenSms: record?.isOpenSms?.toString() } : record} refresh={refresh} />, { title: `${record ? '编辑' : '新增'}布控`, size: "middle", })
  }

  async function handleDelControl(record: any) {
    await deleteControlItem({ id: record.id })
    refresh()
  }

  async function withdrawControl(record: any) {
    await cancelItem({ id: record.id })
    refresh()
  }

  async function getExportParams() {
    return new Promise(function (resolve, reject) {
      console.log(ControlRef.current.getDto(), "ControlRef.current.getDto()")
      const params = ControlRef.current.getDto() || {}
      // await exportAllControl(params)
      const { pageNumber, pageSize, createTime, ...obj } = params;
      let para: { [key: string]: any } = {};
      Object.keys(obj).map((item) => {
        obj[item] && (para[item] = obj[item]);
        return item;
      });
      if (createTime) {
        createTime[0] &&
          (para.createTimeStart = moment(createTime[0]).format("YYYY-MM-DD"));
        createTime[1] &&
          (para.createTimeEnd = moment(createTime[1]).format("YYYY-MM-DD"));
      }
      resolve(para)
    })
  }

  function refresh() {
    ControlRef.current.onRefresh()
  }

  return (
    <article className={styles.wrapper}>
      <TableInterface
        ref={ControlRef}
        columns={columns}
        queryInputs={controlInputs}
        extraParams={{ controlCategory: 1 }}
        request={getAllControlList}
        toolsRight={tools}
      />
    </article>
  )
}

export default ShipTable
