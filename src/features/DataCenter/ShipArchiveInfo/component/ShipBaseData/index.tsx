
import { Tabs } from "antd";
import ShipBaseInformation from "./component/ShipBaseInformation";
import ShipViewGallery from "./component/ShipViewGallery";
import ShipPerson from "./component/ShipPerson";
import ShipRelationTabs from "./component/ShipRelationTabs";
import styles from "./index.module.sass";
import "../../../dataCenter.sass";
import { useCallback, useMemo, useState } from "react";


interface PropsShipBaseData {
  shipData?: any
  // 用于判断是否编辑了信息，更新视图
  editFlag?: (val: number) => void
  onLoadShipInfo?: () => Promise<any>
  /** 菜单定位key */
  pageKey?: string
}

const ShipBaseData: React.FC<PropsShipBaseData> = ({ shipData, editFlag, onLoadShipInfo, pageKey }) => {
  console.debug('ShipBaseData')


  const [key, setKey] = useState(pageKey || 'item-0')


  const handleEditFlag = useCallback(
    (time: number) => {
      editFlag && editFlag(time)
    },
    [editFlag],
  )

  /*  const item1 = useMemo(() => [
     { label: '基本信息', key: 'item-0', children: <ShipBaseInformation id={shipData.id} dataType={shipData.dataType} editFlag={handleEditFlag} shipData={shipData} /> }, // 船舶信息-基本信息
     { label: '船员信息', key: 'item-1', children: <ShipPerson id={shipData.id} shipCreateTime={shipData?.createTime} /> }, // 船舶信息-船员信息
     { label: '视图库', key: 'item-3', children: <ShipViewGallery id={shipData.id} dataType={shipData.dataType} onLoadShipInfo={onLoadShipInfo} /> }, // '视图库'
   ], [handleEditFlag, onLoadShipInfo, shipData]) */

  const item2 = useMemo(() => [
    { label: '基本信息', key: 'item-0', children: <ShipBaseInformation id={shipData.id} dataType={shipData.dataType} editFlag={handleEditFlag} shipData={shipData} /> }, // 船舶信息-基本信息
    { label: '船员信息', key: 'item-1', children: <ShipPerson id={shipData.id} shipCreateTime={shipData?.createTime} /> }, // 船舶信息-船员信息
    { label: '关系图谱', key: 'item-2', children: <ShipRelationTabs id={shipData.id} shipData={shipData} /> }, // '关系图谱'
    { label: '视图库', key: 'item-3', children: <ShipViewGallery id={shipData.id} dataType={shipData.dataType} onLoadShipInfo={onLoadShipInfo} /> }, // '视图库'
  ], [handleEditFlag, onLoadShipInfo, shipData])


  const handleChange = useCallback(
    (val: string) => {
      setKey(val)
    },
    [],
  )


  return (
    <article className={styles.wapper}>
      {/*  {shipData.focusType === 4 || shipData.focusType === '4' ?
        <Tabs type="card" className={'dc-tabs-card'} items={item1} tabPosition='top' activeKey={key} onChange={handleChange}></Tabs> :
        <Tabs type="card" className={'dc-tabs-card'} items={item2} tabPosition='top' activeKey={key} onChange={handleChange}></Tabs>} */}
      <Tabs type="card" className={'dc-tabs-card'} items={item2} tabPosition='top' activeKey={key} onChange={handleChange}></Tabs>
    </article>
  )
}

export default ShipBaseData
