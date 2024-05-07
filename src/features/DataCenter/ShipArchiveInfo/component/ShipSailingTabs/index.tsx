import React, { useCallback, useMemo, useState } from "react";
import { Tabs } from "antd";
import HistoryTrack from "./component/HistoryTrack";
import GoThroughPort from "./component/GoThroughPort";
// import SailingInfo from "./component/SailingInfo";
import InoutNanshan from "./component/InoutNanshan";
import "../../../dataCenter.sass";

interface Props {
  /** 船舶信息 */
  shipData?: any
  /** 菜单定位key */
  pageKey?: string
}

/**船舶航行信息*/
const ShipSailing: React.FC<Props> = ({ shipData, pageKey }) => {
  console.debug('ShipSailing')

  const items = useMemo(() => [
    { label: '历史轨迹', key: 'item-0', children: <HistoryTrack shipData={shipData || {}} /> }, // 务必填写 key
    { label: '历经港口', key: 'item-1', children: <GoThroughPort shipData={shipData} /> },
    // { label: '航次信息', key: 'item-2', children: <SailingInfo /> },
    { label: '出入南山信息', key: 'item-3', children: <InoutNanshan shipData={shipData} /> },
  ], [shipData])

  const [key, setKey] = useState<string>(pageKey || 'item-0')

  const handleChange = useCallback(
    (val: string) => {
      setKey(val)
    },
    [],
  )

  return (
    <Tabs items={items} type="card" className={'dc-tabs-card'} activeKey={key} tabPosition='top' onChange={handleChange} />
  )
}

export default ShipSailing
