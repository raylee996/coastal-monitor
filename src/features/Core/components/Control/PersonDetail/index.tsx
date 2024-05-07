import { Form, message } from "antd";
import { queryApproveUser, queryUserInfo } from "api/core/wisdomCommand";
import { getDeptList } from "api/user";
import AreaDeviceInput from "component/AreaDeviceInput";
// import AreaSelectInForm from "component/AreaSelectInForm";
import dayjs from "dayjs";
import { YMD } from "helper";
import { InputType, PanelOptions } from "hooks/flexibility/FormPanel";
import FormInterface from "hooks/integrity/FormInterface";
// import _ from "lodash";
import { useCallback, useEffect, useState } from "react";
import { doAddControlPerson, getControlData } from "server/core/controlManage";
import { getLabelTableWith } from "server/label";
import { getDictDataByType } from "server/system";
import { getDeptCascader, getUserListByDept } from "server/user";
import ControlContent from "./components/ControlContent";
import styles from "./index.module.sass";


const formProps = {
  labelCol: {
    span: 6,
  }
}

const options: PanelOptions = {
  submitText: '确认',
  column: 2,
  isShowReset: true,
  isRequired: true
}

const formInputs: any = [
  ['布控名称', 'controlName',],
  ['布控等级', 'controlLevel', InputType.selectRemote, { request: () => getDictDataByType("controlRiskLevel") }],
  ['审批部门', 'approveDeptId', InputType.cascaderRemote, {
    remote: getDeptCascader,
    changeOnSelect: true
  }],
  ['审批人', 'approvePersonId', InputType.selectRemote, {
    watchKey: 'approveDeptId',
    request: getUserListByDept,
    placeholder: '请选择审批人',
    isRequired: true,
    isSelectFirst: true
  }],
  ['截止日期', 'expiryDate', InputType.date, { isDisabledBefore: true }],
  ['布控分类', 'controlTypeId', InputType.selectRemote, { request: () => getLabelTableWith({ type: 10 }) }],
  // 区域id和设备编码
  // ['布控区域', 'areaIdAreaDeviceCodes', InputType.component, {
  //   component: AreaSelectInForm,
  //   mode: 'single',
  //   isShowDeviceList: true,
  //   inputProps: {
  //     size: 'middle',
  //     placeholder: '请选择布控区域',
  //     extraParams: {
  //       // controlTypeId: 2 //布控区域类型(1:船舶布控, 2: 人员布控)
  //     },
  //   },
  // }],
  ['布控区域', 'areaId', InputType.component, {
    component: AreaDeviceInput
  }],
  ['公开方式', 'publicWay', InputType.selectRemote, { request: () => getDictDataByType("publicWay") }],
  ['布控事由', 'controlReason', InputType.textArea, { isRow: true, isRequired: false }],
  ['是否开启短信通知', 'isOpenSms', InputType.radioRemote, { remote: () => getDictDataByType("isOpenSms") }],
  ['布控内容', 'personCtrlJson', InputType.component, { component: ControlContent, isRow: true }]
]

interface IPersonDetail {
  id?: any
  onSuccess?: () => void
  onClosePopup?: () => void
  /** 提供调起时需要传入值 */
  params?: any
}

// 递归，获取所在部门的ID
function getDeptArr(deptId: number, list: any[]) {
  let deptIds: any[] = [] //所在部门id 如： [22,23,24]
  function main(deptId: number, list: any[]) {
    for (let i = 0; i < list.length; i++) {
      if (list[i].deptId === deptId) {
        deptIds.push(deptId)
        if (list[i].parentId !== 0) {
          main(list[i].parentId, list)
        } else {
          break
        }
      }
    }
    return deptIds
  }
  return main(deptId, list)
}

const PersonDetail: React.FC<IPersonDetail> = ({ id, onSuccess, onClosePopup, params }) => {
  console.debug('PersonDetail')

  const [form] = Form.useForm();
  // const watchValue = Form.useWatch('approveDeptId', form);

  const [initData, setInitData] = useState({
    ...(params || {}),
    ...{
      controlLevel: '1',
      publicWay: params?.publicWay ? String(params?.publicWay) : "1",
      isOpenSms: params?.isOpenSms ? params.isOpenSms : '0',
      expiryDate: dayjs().add(1, 'week').format(YMD)
    },
  })

  // 获取部门列表
  const [deptListArr, setDeptListArr] = useState([])
  //当前用户部门id
  const [currentUserDeptId, setCurrentUserDeptId] = useState<number>(0)
  //当前用户审批人id
  const [currentApproveId, setCurrentApproveId] = useState<any>(null)

  // 获取部门list
  useEffect(() => {
    async function getDeptLists() {
      const dto: any = {
        pageNumber: 1,
        pageSize: -1,
      };
      // 获取部门列表
      const vo = await getDeptList(dto);
      // 获取当前用户的部门ID
      const userDept = await queryUserInfo({})
      // 获取审批人
      const approveUser = await queryApproveUser({
        deptId: userDept.user.deptId || null,
        hasApprovePermission: 1,
        status: '0',
      })
      setCurrentApproveId(approveUser.records[0].userId || null)
      setCurrentUserDeptId(userDept.user.deptId || 0)
      const deptList: any = vo.records || []; //部门列表
      setDeptListArr(deptList)
    }
    getDeptLists()
  }, [])

  useEffect(() => {
    let list = getDeptArr(currentUserDeptId, deptListArr) || []
    let ids = list.reverse()
    setInitData((val: any) => {
      return {
        ...val,
        approveDeptId: ids,
        approvePersonId: currentApproveId,
      }
    })
  }, [currentUserDeptId, deptListArr, currentApproveId])

  // 监听部门id的变化，改变审批人的默认值
  // useEffect(() => {
  //   async function main() {
  //     if (watchValue) {
  //       let deptId = form.getFieldValue('approveDeptId')
  //       const approveUser = await queryApproveUser({
  //         deptId: _.last(deptId) || null,
  //         hasApprovePermission: 1,
  //         status: '0',
  //       })
  //       form.setFieldValue('approvePersonId', approveUser?.records[0]?.userId || null)
  //     }
  //   }
  //   main()

  // }, [form, watchValue])


  const handleFinish = useCallback(
    async (data: any) => {
      // 校验截至日期是否在当前日期之前
      const { expiryDate } = data
      if (expiryDate < dayjs().format('YYYY-MM-DD')) {
        message.error("截至日期不能为今天之前的日期");
        return;
      }
      await doAddControlPerson(data)
      onSuccess && onSuccess()
      onClosePopup && onClosePopup()
    },
    [onClosePopup, onSuccess],
  )

  return (
    <div className={styles.wrapper}>
      <FormInterface
        form={form}
        id={id}
        inputs={formInputs}
        initData={initData}
        formProps={formProps}
        options={options}
        getRequest={getControlData}
        onAsyncFinish={handleFinish}
      />
    </div>
  )
}

export default PersonDetail