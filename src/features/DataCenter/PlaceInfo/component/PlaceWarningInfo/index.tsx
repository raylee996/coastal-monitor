
import { Tabs } from "antd";
import { useMemo } from "react";
import DeployIng from "./component/DeployIng";
import WarningInfo from "./component/WarningInfo";
import styles from "./index.module.sass";


interface Props {
  placeId: number
  warningInfoKey?: string
}

const PlaceWarningInfo: React.FC<Props> = ({ placeId, warningInfoKey }) => {
  console.debug('PlaceWarningInfo')


  const items = useMemo(() => [
    { label: '预警信息', key: '0', children: <WarningInfo placeId={placeId} /> },
    { label: '布防信息', key: '1', children: <DeployIng placeId={placeId} /> },
  ], [placeId])


  return (
    <article className={styles.wapper}>
      <Tabs items={items} type="card" className={'dc-tabs-card'} defaultActiveKey={warningInfoKey} />
    </article>
  )
}

export default PlaceWarningInfo
