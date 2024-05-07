import { Form, FormInstance } from "antd";
import { commonIntIsDict, roleStatusDict } from "helper/dictionary";
import { InputType, UseType } from "hooks/flexibility/FormPanel";
import FormInterface from "hooks/integrity/FormInterface";
import { useCallback, useEffect } from "react";
import { addRoleData, editRoleData, getMenuTree, getRoleData } from "server/user";
import styles from "./index.module.sass";


const inputs = [
  ['角色名称', 'roleName', { maxLength: 50 }],
  ['角色编码', 'roleKey'],
  ['角色概述', 'remark', InputType.textArea, { maxLength: 100 }],
  ['角色排序', 'roleSort', InputType.number],
  ['状态', 'status', InputType.radio, { dict: roleStatusDict }],
  ['审批权限', 'hasApprovePermission', InputType.radio, { dict: commonIntIsDict }],
  ['菜单权限', 'menuIds', InputType.treeRemote, { remote: getMenuTree, watchKey: 'hasApprovePermission' }]
]

const initData = {
  status: '0',
  hasApprovePermission: 0
}

const options = {
  isRequired: true
}

const formProps = {
  labelCol: { span: 7 }
}

const approvalMenuId = 2045 // 个人工作台菜单id

interface Props {
  onClosePopup?: Function
  onSuccess?: Function
  id?: number
  type?: UseType
}

const RoleDetail: React.FC<Props> = ({ onClosePopup, onSuccess, id, type }) => {
  console.debug('RoleDetail')


  const [form] = Form.useForm();
  const isApproval = Form.useWatch('hasApprovePermission', form);


  useEffect(() => {
    if (isApproval) {
      const _menuIds = form.getFieldValue('menuIds')
      if (_menuIds) {
        let ids: any[] | undefined = undefined
        if (_menuIds.checkedKeys && !_menuIds.checkedKeys.includes(approvalMenuId)) {
          ids = [..._menuIds.checkedKeys, approvalMenuId]
        } else if (Array.isArray(_menuIds) && !_menuIds.includes(approvalMenuId)) {
          ids = [..._menuIds, approvalMenuId]
        }
        if (ids) {
          form.setFieldValue('menuIds', ids)
        }
      } else if (!_menuIds) {
        form.setFieldValue('menuIds', [approvalMenuId])
      }
    }
  }, [isApproval, form])


  const handleFinish = useCallback(
    async (params: any) => {
      if (id) {
        await editRoleData(params)
      } else {
        await addRoleData(params)
      }
      onSuccess && onSuccess()
      onClosePopup && onClosePopup()
    },
    [id, onClosePopup, onSuccess],
  )

  const handleFill = useCallback(
    (_form: FormInstance) => {
      _form.setFieldsValue({
        roleName: Mock.Random.ctitle(),
        roleKey: Mock.Random.word(),
        roleSort: Mock.Random.integer(10, 1000),
        remark: Mock.Random.csentence()
      })
    },
    [],
  )


  return (
    <article className={styles.wrapper}>
      <FormInterface
        form={form}
        id={id}
        options={options}
        getRequest={getRoleData}
        formType={type}
        inputs={inputs}
        initData={initData}
        formProps={formProps}
        onAsyncFinish={handleFinish}
        onFill={handleFill}
      />
    </article>
  )
}

export default RoleDetail