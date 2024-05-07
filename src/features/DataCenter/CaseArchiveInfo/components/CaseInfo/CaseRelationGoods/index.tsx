import React, { useRef } from "react";
import { Button, message } from "antd";
import styles from './index.module.sass'
import TableInterface from "hooks/integrity/TableInterface";
import { ColType } from "hooks/flexibility/TablePanel";
import popup from "hooks/basis/Popup";
import CaseGoodsAdd from "../CaseGoodsAdd";
import { deleteCaseThing, queryCaseThingList } from "server/dataCenter/caseArchive";
import ImageSimple from "hooks/basis/ImageSimple";
import WindowDelet from "component/WindowDelet";
import popupmini from "component/PopupMini";


interface Props {
  /** 案件id值 */
  id: number
}

/*案件涉案物品*/
const CaseRelationGoods: React.FC<Props> = ({ id }) => {
  const tableRef = useRef<any>(null)

  const columns = [
    ['照片', 'urls', ColType.image, {
      itemProps: {
        render: (text: any, record: any) => {
          return (<>
            {record.urls ? <ImageSimple width={60} height={60} src={record.urlsArray} /> : '--'}
          </>
          )
        }
      }
    }],
    ['品名', 'productName'],
    ['涉案物品性质', 'natureName'],
    ['产地', 'origin'],
    ['型号', 'type'],
    ['颜色', 'color'],
    ['数量', 'quantityName'],
    ['重量', 'weightName'],
    ['价值', 'worthName'],
    [
      ['编辑', (record: any) => {
        popup(<CaseGoodsAdd caseId={id} id={record.id} refreshTable={refreshTable} />, { title: '编辑涉案物品', size: 'middle' })
      }],
      ['删除', async (record: any) => {
        popupmini(<WindowDelet title={'确定删除涉案物品吗？'} request={deleteCaseThing} id={record.id} onSuccess={() => {
          message.success('删除成功！')
          refreshTable()
        }} />, { title: '删除提示', size: 'auto' })
        // console.log(record)
        // await deleteCaseThing(record.id)
        // refreshTable()
      }]
    ]
  ]

  function handleAdd() {
    popup(<CaseGoodsAdd caseId={id} refreshTable={refreshTable} />, { title: '新增涉案物品', size: 'middle' })
  }

  // 刷新列表
  function refreshTable() {
    tableRef.current.onRefresh()
  }

  return <>
    <div className={styles.top}>
      <span>涉案物品</span>
      <Button type={"primary"} onClick={handleAdd}>新增</Button>
    </div>
    <TableInterface
      className={styles.table}
      ref={tableRef}
      columns={columns}
      request={queryCaseThingList}
      extraParams={{ caseId: id }}
    />
  </>
}

export default CaseRelationGoods
