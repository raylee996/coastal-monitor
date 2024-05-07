import React, { useRef } from "react";
import styles from './index.module.sass'
import TableInterface from "hooks/integrity/TableInterface";
import { Button, Popconfirm } from "antd";
import popup from "hooks/basis/Popup";
import PlanAdd from "./PlanAdd";
import PlanShow from "./PlanShow";
import LabelManage from "../../../../component/LabelManage";
import { delPlanAsync, getPlanListAsync } from "../../../../server/core/planManage";
import PlanAnimation from "./PlanAnimation";

interface Props {
}

/**预案管理*/
const PlanManage: React.FC<Props> = () => {
  const tableRef = useRef<any>();
  const columns = [
    ['预案名称', 'name'],
    ['预案类型', 'planTypeName'],
    ['模型名称', 'modelName'],
    ['目的', 'purpose'],
    ['指挥长', 'commanderName'],
    ['副指挥长', 'deputyCommanderName'],
    ['操作人', 'createByName'],
    ['更新时间', 'createTime'],
    ['操作', '', {
      itemProps: {
        width: '120px',
        render: (text: any, record: any) => {
          return (
            <>
              <Button type={"link"} onClick={() => handleShow(record.id, record.modelId)}>演示</Button>
              <Button type={"link"} onClick={() => handleOpenPlanEdit(record)}>编辑</Button>
              <Popconfirm title="确定要删除吗?" onConfirm={() => {
                delPlanList(record.id)
              }}>
                <Button type={"link"}>删除</Button>
              </Popconfirm>
            </>
          )
        }
      }
    }],
  ]
  const inputs = [
    ['预案名称', 'search', { placeholder: '请输入预案名称' }],
  ]

  //预案演示
  function handleShow(id: any, modelId: any) {
    if (id === 97) {
      popup(<PlanAnimation modelId={modelId} />, {
        title: '预案演示',
        size: 'fullscreen'
      })
    } else {
      popup(<PlanShow id={id} modelId={modelId} />, {
        title: '预案演示',
        size: 'fullscreen'
      })
    }
  }

  /*新增预案*/
  function handleOpenPlanAdd() {
    popup(<PlanAdd />, {
      title: '新增预案',
      size: "fullscreen",
      onCloseCallback: () => {
        tableRef.current.onRefresh()
      }
    })
  }

  /*编辑预案*/
  function handleOpenPlanEdit(record: any) {
    popup(<PlanAdd record={record} />, {
      title: '编辑预案', size: "fullscreen", onCloseCallback: () => {
        tableRef.current.onRefresh()
      }
    })
  }

  //删除预案
  async function delPlanList(id: any) {
    await delPlanAsync(id)
    tableRef.current.onRefresh()
  }

  //预案管理
  function showCaseManage() {
    popup(<LabelManage type={12} hasSystem={false} typeName='预案类型' />,
      {
        title: '预案管理', size: 'middle'
      })
  }

  return <div className={styles.wrapper}>
    <TableInterface
      ref={tableRef}
      queryInputs={inputs}
      request={getPlanListAsync}
      columns={columns}
      paginationProps={{
        showQuickJumper: true,
        showTotal: (total: number) => {
          return `共 ${total} 条`
        }
      }}
      tableProps={{
        size: 'small',
        rowSelection: {
          type: 'checkbox',
          preserveSelectedRowKeys: true
        }
      }}
      toolsHeader={[<>
        <Button type={"primary"} onClick={showCaseManage} className={styles.toolsBtn}>预案类型</Button>
        <Button type={"default"} onClick={handleOpenPlanAdd}>新增预案</Button>
      </>]}
    />
  </div>
}

export default PlanManage
