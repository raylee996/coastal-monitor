import { nodeLevelDict } from "helper/dictionary";
import FormPanel, { InputType } from "hooks/flexibility/FormPanel";
import styles from "./index.module.sass";
import { useEffect, useState } from "react";
import { getOtherRelationAsync, getOtherRelationPageAsync, getPortListAsync } from "server/ship";
import TableInterface from "hooks/integrity/TableInterface";
import { message } from "antd";
import XcEchartsNode from "component/XcEchartsNode";
import ShipArchiveInfo from "features/DataCenter/ShipArchiveInfo";
import popup from "hooks/basis/Popup";
import Title from "component/Title";


interface Props {
  id: any
}
let size = 5
const ShipRelationPort: React.FC<Props> = ({ id }) => {
  console.debug('ShipRelationPort')
  //数据定义
  const [relationData, setRelationData] = useState<any>(undefined)

  const [extraParams, setextraParams] = useState<any>({
    relationType: 15,
    sourceId: id,
  })

  const columns = [
    ['关系', 'relationTypeName'],
    ['船名', 'name'],
    ['MMSI', 'mmsi'],
    ['船型', 'shipTypeName'],
    ['船籍港', 'registryHabour'],
    ['出入港', 'labelHabour'],
    [
      ['查看档案', (record: any) => {
        //查看档案,跳转档案详情
        popup(<ShipArchiveInfo id={record.id} dataType={record.dataType} />, { title: '查看船舶档案', size: "fullscreen" })
      }]
    ]
  ]

  const formInputs = [
    [
      '每层条数', 'size', InputType.select, {
        dict: nodeLevelDict,
        placeholder: '请选择',
      }],
    [
      '港口', 'targetName', InputType.selectRemote, {
        request: () => getPortListAsync({ archiveId: id }),
        placeholder: '请选择',
        style: {
          width: '160px'
        }
      }
    ]
  ]

  //初次获取图谱数据
  useEffect(() => {
    async function main() {
      let res = await getOtherRelationAsync({
        relationType: 15,
        current: 1,
        size: 5,
        sourceId: id,
        targetType: 5,
      })
      if (res.data.code !== 200) {
        message.error(res.data.msg)
      } else {
        setRelationData(res.data)
      }
    }
    main()
  }, [id])


  async function handleFinish(value?: any) {
    size = value.size || 5
    setRelationData(undefined)
    console.log(value);
    setextraParams({
      relationType: 15,
      sourceId: id,
      targetName: value.targetName || ''
    })
    let res = await getOtherRelationAsync({
      relationType: 15,
      current: 1,
      sourceId: id,
      targetType: 5,
      ...value,
      size: value.size || 5,
    })
    if (res.data.code !== 200) {
      message.error(res.data.msg)
    } else {
      setRelationData(res.data)
    }
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
        <XcEchartsNode data={relationData} relationName='同港口' />
      </div>

      <div className={styles.panel}>
        <Title title="船舶列表" />
        <div className={styles.panelContent}>
          <TableInterface
            extraParams={{
              ...extraParams
            }}
            columns={columns}
            request={getOtherRelationPageAsync}
          />
        </div>
      </div>
    </div>
  )
}

export default ShipRelationPort