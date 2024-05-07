import { nodeLevelDict } from "helper/dictionary";
import FormPanel, { InputType } from "hooks/flexibility/FormPanel";
import styles from "./index.module.sass";
import { useEffect, useRef, useState } from "react";
import { delRelationEntityAsync, getOtherRelationAsync, getOtherRelationPageAsync } from "server/ship";
import TableInterface from "hooks/integrity/TableInterface";
import { Button, message } from "antd";
import XcEchartsNode from "component/XcEchartsNode";
import ShipArchiveInfo from "features/DataCenter/ShipArchiveInfo";
import popup from "hooks/basis/Popup";
import Title from "component/Title";
import AddShip from "./component/AddShip";
import { ActionType } from "hooks/flexibility/TablePanel";


interface Props {
  id: any
}

let size = 5
const ShipRelationFleet: React.FC<Props> = ({ id }) => {
  console.debug('ShipRelationFleet')
  //数据定义
  const [relationData, setRelationData] = useState<any>(undefined)
  const tableRef = useRef<any>();
  const columns = [
    ['关系', 'relationTypeName'],
    ['船队名称', 'team'],
    ['船名', 'name'],
    ['MMSI', 'mmsi'],
    ['船型', 'shipTypeName'],
    [
      ['查看档案', (record: any) => {
        //查看档案,跳转档案详情
        popup(<ShipArchiveInfo id={record.id} dataType={record.dataType} />, { title: '查看船舶档案', size: "fullscreen" })
      }],
      ['编辑', (record: any) => {
        popup(<AddShip selfShipId={id} id={record.id} teamName={record.team} record={record} />, {
          size: 'small', title: '编辑船舶', onCloseCallback: () => {
            tableRef.current && tableRef.current.onRefresh()
          }
        })
      }],
      ['删除', async (record: any) => {
        let vo2 = await delRelationEntityAsync({
          sourceId: id,
          relationType: 22,
          targetIds: id,
          dataType: 6
        })
        let vo = await delRelationEntityAsync({
          sourceId: id,
          relationType: 22,
          targetIds: record.id,
          dataType: 6
        })

        if (vo && vo2) {
          tableRef.current && tableRef.current.onRefresh()
        }
      }, ActionType.confirm]
    ]
  ]

  const formInputs = [
    [
      '每层条数', 'size', InputType.select, {
        dict: nodeLevelDict,
        placeholder: '请选择',
      }]
  ]

  //初次获取图谱数据
  useEffect(() => {
    async function main() {
      let res = await getOtherRelationAsync({
        relationType: 16,
        current: 1,
        size: 5,
        sourceId: id,
        targetType: 2,
      })
      if (res.data.code !== 200) {
        message.error(res.data.msg)
      } else {
        setRelationData(res.data)
      }
    }
    main()
  }, [id])

  // 查询
  async function handleFinish(value?: any) {
    size = value.size || 5
    setRelationData(undefined)
    let res = await getOtherRelationAsync({
      relationType: 16,
      current: 1,
      sourceId: id,
      targetType: 2,
      ...value,
      size: value.size || 5,
    })
    if (res.data.code !== 200) {
      message.error(res.data.msg)
    } else {
      setRelationData(res.data)
    }
  }

  // 新增船舶
  function hanlderAdd() {
    popup(<AddShip selfShipId={id} />, {
      size: 'small', title: '新增船舶', onCloseCallback: () => {
        tableRef.current && tableRef.current.onRefresh()
      }
    })
  }


  return (
    <div className={styles.wrapper}>
      <div className={styles.condition}>
        {
          <FormPanel
            inputs={formInputs}
            initData={{ size }}
            onAsyncFinish={handleFinish}
            formProps={{
              layout: "inline",
            }}
            options={{
              isNotShowFooter: true,
              isShowItemButton: true,
              isShowReset: false,
            }} />
        }
      </div>

      <div className={styles.boxEchartsNode}>
        <XcEchartsNode data={relationData} relationName='同船队' />
      </div>

      <div className={styles.panel}>
        <div className={styles.panelContent}>
          <TableInterface
            ref={tableRef}
            extraParams={{
              relationType: 16,
              sourceId: id,
            }}
            paginationProps={{
              showTotal: (total: number) => {
                return `总数 : ${total} 条`
              }
            }}
            columns={columns}
            request={getOtherRelationPageAsync}
            tools={
              [<>
                <Title title="船舶列表" />
              </>]
            }
            toolsRight={[<>
              <Button type={"primary"} onClick={hanlderAdd}>新增</Button>
            </>]}
          />
        </div>
      </div>
    </div>
  )
}

export default ShipRelationFleet