import { PlusOutlined } from "@ant-design/icons";
import { menuStatusDict } from "helper/dictionary";
// import popup from "hooks/basis/Popup";
// import popupmini from "component/PopupMini";
import { InputType } from "hooks/flexibility/FormPanel";
// import { ActionType } from "hooks/flexibility/TablePanel";
import TableInterface from "hooks/integrity/TableInterface";
import React, { useRef } from "react";
import { deleltMenuData, getMenuTable } from "server/user";
import MenuDetail from "../MenuDetail";
import styles from "./index.module.sass";
import WindowDelet from "component/WindowDelet";
import popupUI from "component/PopupUI";

const tableProps = {
  rowKey: 'menuId'
}

const tableOptions = {
  isShowRowNumber: false
}

const queryInputs = [
  ['菜单名称', 'menuName'],
  ['菜单状态', 'status', InputType.select, { dict: menuStatusDict, style: { width: '180px' } }],
]

const MenuTable: React.FC = () => {
  console.debug('MenuTable')

  const tableRef = useRef<any>()

  const columns = [
    ['菜单名称', 'menuName', { itemProps: { width: 260 } }],
    ['类型', 'menuTypeName'],
    ['权限字符串', 'perms'],
    ['组件路径', 'component'],
    ['路由地址', 'path'],
    ['显示顺序', 'orderNum'],
    ['菜单状态', 'statusName'],
    ['创建时间', 'createTime'],
    [
      ['编辑', (record: any) => {
        popupUI(<MenuDetail id={record.menuId} onSuccess={() => {
          tableRef.current.onRefresh()
        }} />, { title: '编辑菜单', size: 'auto' })
      }],
      ['删除', async (record: any) => {
        popupUI(<WindowDelet title={'确定删除菜单吗？'} request={deleltMenuData} id={record.menuId} onSuccess={() => {
          tableRef.current.onRefresh()
        }} />, { title: '删除提示', size: 'auto' })
        // await deleltMenuData(record.menuId)
        // tableRef.current.onRefresh()
      }]
    ]
  ]

  const tools = [
    ['新增', {
      onClick: () => {
        popupUI(<MenuDetail onSuccess={() => {
          tableRef.current.onRefresh()
        }} />, { title: '新增菜单', size: 'auto' })
      },
      type: 'primary',
      icon: <PlusOutlined />
    }]
  ]

  return (
    <article className={styles.wrapper}>
      <TableInterface
        ref={tableRef}
        tableProps={tableProps}
        tableOptions={tableOptions}
        columns={columns}
        queryInputs={queryInputs}
        tools={tools}
        request={getMenuTable}
        isNotPagination={true}
      />
    </article>
  )
}

export default MenuTable