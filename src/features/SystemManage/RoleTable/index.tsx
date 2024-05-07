import { PlusOutlined } from "@ant-design/icons";
import { roleStatusDict } from "helper/dictionary";
// import popup from "hooks/basis/Popup";
// import popupmini from "component/PopupMini";
import { InputType } from "hooks/flexibility/FormPanel";
import { ColType } from "hooks/flexibility/TablePanel";
import TableInterface from "hooks/integrity/TableInterface";
import { useRef } from "react";
import { deleteRoleData, editRoleStatus, getRoleTable } from "server/user";
import RoleDetail from "../RoleDetail";
import styles from "./index.module.sass";
import WindowDelet from "component/WindowDelet";
import popupUI from "component/PopupUI";
import RoleDataDetail from "../RoleDataDetail";

const queryInputs = [
  ['角色名称', 'roleName'],
  ['角色编码', 'roleKey'],
  ['角色概述', 'remark'],
  ['状态', 'status', InputType.select, { dict: roleStatusDict, style: { width: '180px' } }]
]

const RoleTable: React.FC = () => {
  console.log('RoleTable')

  const tableRef = useRef<any>()

  const columns = [
    ['角色名称', 'roleName'],
    ['角色编码', 'roleKey'],
    ['角色概述', 'remark'],
    ['角色排序', 'roleSort'],
    ['超级管理员', 'adminName'],
    ['状态', 'statusBoolean', ColType.switch, { remote: editRoleStatus }],
    ['创建时间', 'createTime'],
    [
      ['详情', (record: any) => {
        popupUI(<RoleDataDetail id={record.roleId} />, { title: '查看详情', size: 'auto' })
      }],
      ['编辑', (record: any) => {
        popupUI(<RoleDetail id={record.roleId} onSuccess={() => {
          tableRef.current.onRefresh()
        }} />, { title: '编辑角色', size: 'auto' })
      }],
      ['删除', async (record: any) => {
        popupUI(<WindowDelet title={'确定删除角色吗？'} request={deleteRoleData} id={record.roleId} onSuccess={() => {
          tableRef.current.onRefresh()
        }} />, { title: '删除提示', size: 'auto' })
        // await deleteRoleData(record.roleId)
        // tableRef.current.onRefresh()
      }]
    ]
  ]

  const tools = [
    ['新增', {
      onClick: () => {
        popupUI(<RoleDetail onSuccess={() => {
          tableRef.current.onRefresh()
        }} />, { title: '新增角色', size: 'auto' })
      },
      type: 'primary',
      icon: <PlusOutlined />
    }]
  ]

  return (
    <article className={styles.wrapper}>
      <TableInterface
        ref={tableRef}
        tableProps={{ rowKey: 'roleId' }}
        columns={columns}
        request={getRoleTable}
        queryInputs={queryInputs}
        tools={tools}
      />
    </article>
  )
}

export default RoleTable