import { nodeLevelDict } from "helper/dictionary";
import FormPanel, { InputType } from "hooks/flexibility/FormPanel";
import { useEffect, useState } from "react";
import { getOtherRelationAsync, getOtherRelationPageAsync, getShipOwerListAsync } from "server/ship";
import TableInterface from "hooks/integrity/TableInterface";
import XcEchartsNode from "component/XcEchartsNode";

import styles from "./index.module.sass";
import { message } from "antd";
import ShipArchiveInfo from "features/DataCenter/ShipArchiveInfo";
import popup from "hooks/basis/Popup";
import Title from "component/Title";

interface Props {
  id: any
}

let size = 5
const ShipRelationShipowners: React.FC<Props> = ({ id }) => {
  console.debug('ShipRelationPeer')

  const [relationData, setRelationData] = useState<any>(undefined)
  //数据定义

  const columns = [
    ['关系类型', 'relationTypeName',{
      itemProps: {
        render: (text: any, record: any) => {
          return (
            <>
              同船东
            </>
          )
        }
      }
    }],
    ['船名', 'name'],
    ['MMSI', 'mmsi'],
    ['船型', 'shipTypeName'],
    ['船主', 'shipOwer'],
    ['船上负责人', 'shipPrincipal'],
    ['船舶经营公司', 'cobCompany'],
    ['船舶管理公司', 'mtgCompany'],
    ['船舶注册公司', 'regCompany'],
    [
      ['查看档案', (record: any) => {

        //查看档案,跳转档案详情
        popup(<ShipArchiveInfo id={record.id} dataType={record.dataType} />, { title: '查看船舶档案', size: "fullscreen" })
        //record.id
      }]
    ]
  ]


  const formInputs = [
    [
      '每层条数', 'size', InputType.select, {
        dict: nodeLevelDict,
      }],
    [
      '船东', 'shipOwnerName', InputType.selectRemote, {
        request: () => getShipOwerListAsync({ archiveId: id }),
        placeholder: '请选择',
        style: {
          width: '200px'
        }
      }
    ]
  ]


  //初次获取图谱数据
  useEffect(() => {
    async function main() {
      let res = await getOtherRelationAsync({
        relationType: 14,
        current: 1,
        size: 5,
        sourceId: id,
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
    let shipOwnerList = await getShipOwerListAsync({ archiveId: id })
    // 可能有同名的船东，使用find找第一个
    let shipOwnerInfo = shipOwnerList.find((item: any) => item.name === value.shipOwnerName)
    // 船东信息
    let info = {
      targetIdNum: (shipOwnerInfo && shipOwnerInfo.idNum) || '',
      targetName: (shipOwnerInfo && shipOwnerInfo.name) || '',
      targetPhone: (shipOwnerInfo && shipOwnerInfo.phone) || '',
      targetType: 1,
    } || {}

    let res = await getOtherRelationAsync({
      relationType: 14,
      current: 1,
      size: value.size || 5,
      sourceId: id,
      ...info,
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
            initData={{
              size
            }}
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
        <XcEchartsNode data={relationData} relationName='同船东' />
      </div>

      <div className={styles.panel}>
        {/* <div className={styles.panelTitle}>船舶列表</div> */}
        <Title title="船舶列表"/>
        <div className={styles.panelContent}>
          <TableInterface
            extraParams={{
              relationType: 14,
              sourceId: id,
            }}
            columns={columns}
            request={getOtherRelationPageAsync}
          />
        </div>
      </div>
    </div>
  )
}

export default ShipRelationShipowners