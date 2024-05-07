// import { FormInstance } from "antd";
import dayjs from "dayjs";
import { sexDict, userLevelOptions, userStatusDict } from "helper/dictionary";
import { validatorIdCard, validatorPassword, validatorUserName } from "helper/validate";
import { InputType, UseType } from "hooks/flexibility/FormPanel"
import FormInterface from "hooks/integrity/FormInterface"
import { useEffect, useState } from "react";
import { addUserData, editUserData, getDeptCascader, getDeptTable, getRoleAllData, getUserData } from "server/user";
import styles from "./index.module.sass";
import Title from "component/Title";
import { Form } from "antd";

const dataInput = [
  ['登录账号', 'userName', { placeholder: '请输入登录账号', isRequired: true, itemProps: { rules: [validatorUserName] }, maxLength: 20 }, UseType.add],
  ['登录账号', 'userName', { disabled: true, }, UseType.edit],
  ['登录密码', 'password', InputType.password, { placeholder: '请输入登录密码', isRequired: true, itemProps: { rules: [validatorPassword] } }, UseType.add],
  ['角色', 'roleIds', InputType.selectMultipleRemote, { placeholder: '请选择角色', remote: getRoleAllData }],
  ['有效日期', 'effectiveTime', InputType.date, { isRequired: true, isDisabledBefore: true }],
  ['状态', 'status', InputType.radio, { dict: userStatusDict }]
]
const inputs = [
  ['姓名', 'name', { placeholder: '请输入姓名', maxLength: 30, isRequired: true }],
  // ['用户昵称', 'nickName', { isRequired: true }],
  //['登录账号', 'userName', { isRequired: true, itemProps: { rules: [validatorUserName] }, maxLength: 20 }, UseType.add],
  //['登录账号', 'userName', { disabled: true, }, UseType.edit],
  //['登录密码', 'password', InputType.password, { isRequired: true, itemProps: { rules: [validatorPassword] } }, UseType.add],
  ['性别', 'sex', InputType.select, { dict: sexDict }],
  ['身份证', 'idCard', { placeholder: '请输入身份证', itemProps: { rules: [validatorIdCard] } }],
  ['部门', 'deptId', InputType.cascaderRemote, { remote: getDeptCascader }],
  //['角色', 'roleIds', InputType.selectMultipleRemote, { remote: getRoleAllData }],
  ['权限等级', 'level', InputType.select, { dict: userLevelOptions }],
  ['用户邮箱', 'email', { placeholder: '请输入用户邮箱' }],
  //['有效日期', 'effectiveTime', InputType.date, { isRequired: true, isDisabledBefore: true }],
  //['状态', 'status', InputType.radio, { dict: userStatusDict }]
]

interface Props {
  onClosePopup?: Function
  onSuccess?: Function
  id?: number
  type?: UseType
}

const UserDetail: React.FC<Props> = ({ onClosePopup, onSuccess, id, type }) => {
  console.debug('UserDetail')

  const [initData, setInitData] = useState<any>()
  const [form] = Form.useForm();

  useEffect(() => {
    queryInitData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function queryInitData() {
    const res = await getDeptTable({ pageNumber: 1, pageSize: -1 }, {})
    getFirstDeptId(res?.data)
  }

  // 获取第一个部门id
  function getFirstDeptId(data: any[]) {
    const deepTree = (node: any[], callback: any) => {
      if (node?.length) {
        if (node[0]?.children?.length) {
          console.log(node[0].children, "node[0].children")
          deepTree(node[0].children, callback)
        }
        else {
          return callback(node[0].deptId)
        }
      }
    }
    deepTree(data, (deptId: number) => {
      setInitData({
        // password: '',
        // status: '0',
        // effectiveTime: dayjs().add(1, 'y'),
        level: 3,
        sex: '1',
        deptId
      })
    })
  }

  async function handleFinish(params: any) {
    let data = form.getFieldsValue()
    if (id) {
      await editUserData({ ...data, ...params })
    } else {
      await addUserData({ ...data, ...params })
    }
    onSuccess && onSuccess()
    onClosePopup && onClosePopup()
  }

  /*  function handleFill(form: FormInstance) {
     form.setFieldsValue({
       name: Mock.Random.cname(),
       // nickName: Mock.Random.cname(),
       userName: Mock.Random.string('lower', 4, 8),
       email: Mock.Random.email()
     })
   } */

  return (
    <article className={styles.wrapper}>
      <Title title={'账号信息'} />
      <FormInterface
        id={id}
        getRequest={getUserData}
        form={form}
        inputs={dataInput}
        formType={type}
        formProps={{
          labelCol: {
            span: 4,
          }
        }}
        initData={{
          password: '',
          status: '0',
          effectiveTime: dayjs().add(1, 'y')
        }}
        options={{
          //column: 2,
          isShowClear: true,
          isNotShowFooter: true
        }}
      />
      <Title title={'用户信息'} />
      <FormInterface
        id={id}
        getRequest={getUserData}
        inputs={inputs}
        formType={type}
        formProps={{
          labelCol: {
            span: 4,
          }
        }}
        initData={initData}
        options={{
          //column: 2,
          isShowClear: true
        }}
        onAsyncFinish={handleFinish}
        onClose={() => onClosePopup && onClosePopup()}
      // onFill={handleFill}
      />
    </article>
  )
}

export default UserDetail