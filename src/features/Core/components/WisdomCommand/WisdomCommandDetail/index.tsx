import DepartmentPersonnelCascader from "component/DepartmentPersonnelCascader";
import SelectLatLng from "component/SelectLatLng";
import { InputType } from "hooks/flexibility/FormPanel";
import FormInterface from "hooks/integrity/FormInterface"
import { useEffect, useState } from "react";
import { addEditCommanderCommand, getUserInfo, queryCommanderCommandDetail } from "server/core/wisdomCommand";
import { queryCaseArchiveList } from "server/dataCenter/caseArchive";
import JudgmentModelingSelectAdd from "./component/JudgmentModelingSelectAdd";
import styles from './index.module.sass'

interface Props {
  refreshTable?: Function
  onClosePopup?: Function,
  /** 指挥任务id */
  id?: number
  // 编辑默认值
  defaultData?: any
}

export const PageInfo = { pageSize: -1, pageNumber: 1 }

const Inputs = [
  ['任务名称', 'taskName', InputType.input, {
    placeholder: '请输入任务名称',
    isRequired: true,
    maxLength: 50,
  }],
  ['任务地点', 'latLng', InputType.component, {
    component: SelectLatLng,
    isRequired: true,
  }],
  ['跟踪目标', 'targetCode', InputType.input, {
    placeholder: '请输入MMSI或雷达编号, 多个目标以逗号隔开',
  }],
  ['任务描述', 'taskDesc', InputType.textArea, {
    placeholder: '请输入任务描述',
    rows: 4,
    maxLength: 200,
  }],
  ['智慧模型', 'modelId', InputType.component,
    {
      component: JudgmentModelingSelectAdd,
      placeholder: '请选择模型',
    }
  ],
  ['责任人', 'chargeDepartmentPersonnel', InputType.component,
    {
      component: DepartmentPersonnelCascader,
      PersonnelInputProps: {
        placeholder: "请选择人员"
      }
    }
  ],
  ['关联案件', 'relationCaseId', InputType.selectRemote,
    {
      request: async () => {
        const res = await queryCaseArchiveList(PageInfo, {})
        return res?.data?.map((item: any) => {
          return {
            name: item.caseName,
            value: item.id,
            ...item
          }
        }) || []
      },
      placeholder: '请选择关联案件',
    }
  ],
]

const WisdomCommandDetail: React.FC<Props> = ({ refreshTable, onClosePopup, id, defaultData }) => {
  console.debug('WisdomCommandDetail')

  const [formData, setFormData] = useState<any>();

  async function onFinish(formData: any) {
    await addEditCommanderCommand({ ...formData, ...(id ? { id } : {}) })
    // 刷新表格
    refreshTable && refreshTable()
    // 关闭弹窗
    onClosePopup && onClosePopup();
  }

  useEffect(() => {
    defaultData && setFormData(defaultData)
  }, [defaultData])

  useEffect(() => {
    async function main() {
      if (id) { // 查详情
        const vo = await queryCommanderCommandDetail(id)
        vo && setFormData(vo)
      }
      else { // 新增默认填入当前用户为责任人
        const res = await getUserInfo({})
        const { userId, deptId } = res || {}
        // 默认填入当前用户与部门
        setFormData({
          chargeDepartmentPersonnel: {
            department: deptId || "",
            personnel: userId || ""
          }
        })
      }
    }
    main()
  }, [id])

  return (
    <article className={styles.wrapper}>
      <FormInterface
        initData={formData}
        onFinish={onFinish}
        inputs={Inputs}
        formProps={{
          labelCol: {
            span: 3,
          }
        }}
        options={{
          isShowReset: true,
        }} />
    </article>
  )
}

export default WisdomCommandDetail