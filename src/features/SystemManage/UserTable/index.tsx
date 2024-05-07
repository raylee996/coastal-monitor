import { PlusOutlined } from "@ant-design/icons";
import { Button } from "antd";
// import popupmini from "component/PopupMini";
import { UseType } from "hooks/flexibility/FormPanel";
import { ColType } from "hooks/flexibility/TablePanel";
import TableInterface from "hooks/integrity/TableInterface"
import { useRef } from "react";
import { deleteUserData, editUserStatus, getUserTable, resetUserData } from "server/user";
import UserDetail from "../UserDetail";
import styles from "./index.module.sass";
import ResetPwds from './ResetPwd'
import WindowDelet from "component/WindowDelet";
import popupUI from "component/PopupUI";

const queryInputs = [
  ['', 'searchValue', { placeholder: '请输入姓名/账号/身份证', style: { width: 240 } }]
]

const UserTable: React.FC = () => {
  console.debug('UserTable')

  const tableRef = useRef<any>()

  const columns = [
    ['姓名', 'name'],
    // ['用户昵称', 'nickName'],
    ['登录账号', 'userName'],
    // ['性别', 'sexName'],
    ['身份证', 'idCard', ColType.tooltip],
    ['邮箱', 'email'],
    ['部门', 'deptName'],
    ['角色', 'rolesName'],
    ['权限等级', 'levelName'],
    ['有效时间', 'effectiveTime'],
    ['状态', 'statusBoolean', ColType.switch, {
      remote: editUserStatus
    }],
    ['操作', '', {
      itemProps: {
        width: '180px',
        render: (text: any, record: any) => {
          return (
            <>
              {/* <Popconfirm title="确定要重置密码吗?" onConfirm={async () => {
                resetPwd(record)
              }}> */}
              <Button type={"link"} onClick={() => windowModel(1, record.userId, '确定要重置密码吗?', '重置密码')}>重置密码</Button>
              {/* </Popconfirm> */}

              <Button type={"link"} onClick={() => {
                popupUI(<UserDetail id={record.userId} onSuccess={() => {
                  tableRef.current.onRefresh()
                }} />, { title: '编辑用户详细', size: 'auto' })
              }}>编辑</Button>

              {/* <Popconfirm title="确定要删除吗?" onConfirm={async () => {
                await deleteUserData(record.userId)
                tableRef.current.onRefresh()
              }}> */}
              <Button type={"link"} onClick={() => windowModel(2, record.userId, '确定要删除吗?', '删除提示')}>删除</Button>
              {/* </Popconfirm> */}
            </>
          )
        }
      }
    }],
    /*  [
       ['重置密码', (record: any) => {
         resetPwd(record)
       },ActionType.confirm],
       ['编辑', (record: any) => {
         popup(<UserDetail id={record.userId} onSuccess={() => {
           tableRef.current.onRefresh()
         }} />, { title: '编辑用户详细', size: 'auto' })
       }],
       ['删除', async (record: any) => {
         await deleteUserData(record.userId)
         tableRef.current.onRefresh()
       }, ActionType.confirm]
     ] */
  ]

  const tools = [
    ['新增', {
      onClick: () => {
        popupUI(<UserDetail type={UseType.add} onSuccess={() => {
          tableRef.current.onRefresh()
        }} />, { title: '新增用户', size: 'auto' })
      },
      type: 'primary',
      icon: <PlusOutlined />
    }]
  ]
  async function windowModel(type: any, id: any, title: any, topTitle: any) {
    popupUI(<WindowDelet title={title} request={type === 1 ? resetUserData : deleteUserData} id={id} onSuccess={() => {
      if (type === 1) {
        popupUI(<ResetPwds />, { title: '提示', size: 'auto' })
      }
      tableRef.current.onRefresh()
    }} />, { title: topTitle, size: 'auto' })
  }
  /* async function resetPwd(data: any) {
    await resetUserData(data.userId)
    popup(<ResetPwds />, { title: '提示', size: 'auto' })
    tableRef.current.onRefresh()
  } */


  return (
    <article className={styles.wrapper}>
      <TableInterface
        ref={tableRef}
        tableProps={{
          rowKey: 'userId'
        }}
        columns={columns}
        queryInputs={queryInputs}
        tools={tools}
        request={getUserTable}
      />
    </article>
  )
}

export default UserTable