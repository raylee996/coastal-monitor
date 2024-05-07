import { Button, Checkbox, Form, message } from "antd";
import { CheckboxValueType } from "antd/lib/checkbox/Group";
import { queryApproveUser, queryUserInfo } from "api/core/wisdomCommand";
import { getDeptList } from "api/user";
import SelectArea from "component/AreaSelectInForm";
import Title from "component/Title";
import dayjs from "dayjs";
import common from "helper/common";
import { ControlLevelDict, ControlSubTypeDict } from "helper/dictionary";
import FormPanel, { InputType } from "hooks/flexibility/FormPanel"
import moment from "moment";
import { forwardRef, useEffect, useRef, useState } from "react";
import { addControlItem } from "server/core/controlManage";
import { getLabelSelect } from "server/label";
import { getDictDataByType } from "server/system";
import { getDeptCascader, getUserListByDept } from "server/user";
import AddControlContent from "../components/AddControlContent";
import styles from "./index.module.sass";

interface Popup {
  /** 关闭popup */
  onClosePopup?: Function
}

interface Props extends Popup {
  /** 类型 */
  controlType: number
  /** 编辑回显json */
  editData?: any
  /** 更新table方法 */
  refresh?: Function
  /** 提供调起时需要传入值 */
  params?: any
}

interface ContentForm {
  /** 船舶、人员类型 */
  controlType: number
  /** 人员布控的布控子类型 手机/人员/车辆 */
  controlSubType: number[]
  /** 人员布控json */
  personCtrlJson: { [key: string]: any }[]
}

export type FormProps = { [key: string]: any }

const formInputs = [
  ['布控名称', 'controlName', {
    placeholder: '请输入',
    isRequired: true,
    maxLength: 100,
    showCount: true,
    itemProps: {
      rules: [{ max: 100, message: '输入字符不能超过100个' }]
    }
  }],
  [
    '布控等级',
    'controlLevel',
    InputType.select,
    {
      dict: common.handleLableOptions(ControlLevelDict),
      isRequired: true,
    }
  ],
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
  ['截止日期', 'expiryDate', InputType.date, {
    placeholder: '截止日期',
    isRequired: true,
    isDisabledBefore: true
  }],
  ['布控分类', 'controlTypeId', InputType.selectRemote,
    {
      request: async () => await getLabelSelect({ type: 6 }),
      placeholder: '请选择布控分类',
      isRequired: true,
    }],
  ['布控区域', 'areaId', InputType.component, {
    component: SelectArea,
    isRequired: true,
    mode: 'single',
    extraParams: {
      controlTypeId: 1 //布控区域类型(1:船舶布控, 2: 人员布控)
    },
    inputProps: {
      size: 'middle',
      placeholder: '请选择布控区域',
      extraParams: {
        controlTypeId: 1 //布控区域类型(1:船舶布控, 2: 人员布控)
      },
    },
  }],
  ['公开方式', 'publicWay', InputType.selectRemote,
    {
      request: () => getDictDataByType("public_type"),
      placeholder: '请选择公开方式',
      isRequired: true,
    }],
  ['布控事由', 'controlReason', InputType.textArea, {
    isRow: true,
    placeholder: '请填写布控事由',
    isRequired: true,
    maxLength: 500,
    showCount: true,
    itemProps: {
      rules: [{ max: 500, message: '输入字符不能超过500个' }]
    }
  }],
  ['是否开启短信通知', 'isOpenSms', InputType.radioRemote, { remote: () => getDictDataByType("isOpenSms"), isRequired: true }],
]
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
const ShipAdd = forwardRef(({ onClosePopup, controlType, editData, refresh, params }: Props, refs) => {
  console.debug('ShipAdd', editData)

  const [formA] = Form.useForm();
  const ref: any = useRef(null);

  const [contentForm, setContentForm] = useState<ContentForm>({
    controlType,
    controlSubType: [0],
    personCtrlJson: []
  })

  const [contentFormData, setContentFormData] = useState<FormProps>()
  // 获取部门列表
  const [deptListArr, setDeptListArr] = useState([])
  //当前用户部门id
  const [currentUserDeptId, setCurrentUserDeptId] = useState<number>(0)
  //当前用户审批人id
  const [currentApproveId, setCurrentApproveId] = useState<any>(null)

  const [initData, setInitData] = useState<any>()

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
    if (!editData) {
      let list = getDeptArr(currentUserDeptId, deptListArr) || []
      setInitData({
        approveDeptId: list.reverse(),
        approvePersonId: currentApproveId,
        isOpenSms: '0',
        expiryDate: moment().add(30, 'days').format('YYYY-MM-DD')
      })
    } else {
      const { approvalJson, areaId, controlName, controlLevel, expiryDate, controlTypeId, controlReason, publicWay, isOpenSms } = editData
      const { approveDeptId, approvePersonId } = approvalJson || {}
      let list = getDeptArr(approveDeptId, deptListArr) || []
      setInitData({
        approveDeptId: list.reverse(),
        approvePersonId,
        areaId,
        controlName,
        controlLevel,
        expiryDate,
        controlTypeId,
        controlReason,
        publicWay: publicWay + "",
        isOpenSms
      })
    }

  }, [editData, deptListArr, currentUserDeptId, currentApproveId])

  useEffect(() => {
    if (editData) {
      const { shipConditionJson } = editData
      setContentFormData(shipConditionJson)
    }
  }, [editData])

  useEffect(() => {
    params && setContentFormData(params)
  }, [params])

  function onCheckboxChange(checkedValues: CheckboxValueType[]) {
    setContentForm({
      ...contentForm,
      controlSubType: checkedValues.map(Number)
    })
  }

  async function handleFinish() {
    const result = await formA.validateFields()
    const flowGraphData = await ref.current.getContentData()

    const item = flowGraphData?.length ? flowGraphData[0].shipConditionJson : null
    if (item && item.controlScope === '1' && Boolean(!item.alarmConditionShipNames && !item.alarmConditionShipMmsis && !item.alarmConditionShipFaceIds)) {
      message.error('船名、MMSI、船脸至少填写一项')
      return;
    }
    // 校验截至日期是否在当前日期之前
    const { expiryDate } = result
    if (expiryDate < dayjs().format('YYYY-MM-DD')) {
      message.error("截至日期不能为今天之前的日期");
      return;
    }
    // 请求接口 新增/编辑: editData
    try {
      await addControlItem({
        controlCategory: 1,
        ...(editData ? { id: editData.id } : {}),
        ...{ ...result }
      }, flowGraphData, 'ship', !Boolean(editData))
      handleCancel()
      refresh && refresh()
      console.log('新增/编辑成功')
    } catch (error) {
      console.error('新增/编辑失败', error)
    }
  }

  function handleCancel() {
    onClosePopup && onClosePopup()
  }

  return (
    <article className={styles.wrapper}>
      <div className={styles.addForm}>
        <FormPanel
          inputs={formInputs}
          form={formA}
          formProps={{
            labelCol: {
              span: 6,
            }
          }}
          options={{
            column: 2,
          }}
          initData={initData}
        />
        {/* 下部分布控内容 */}
        <section>
          <Title title={'布控内容'} />
          {/* <div>布控内容：</div> */}
          {controlType === 2 && <section className={styles.paddingLeft}>
            <Checkbox.Group options={common.handleLableOptions(ControlSubTypeDict)} value={contentForm.controlSubType} onChange={onCheckboxChange} />
          </section>}
          <section>
            {((!editData && !params) || contentFormData) && <AddControlContent ref={ref} contentFormData={contentFormData} controlType={controlType} personCtrlType={contentForm.controlSubType} />}
          </section>
        </section>
        {/* 底部按钮 */}
        <section className={styles.formBtn}>
          <Button className={styles.btnCancel} onClick={handleCancel}>取消</Button>
          <Button type="primary" onClick={handleFinish}>确定</Button>
        </section>
      </div>
    </article>
  )
})

export default ShipAdd