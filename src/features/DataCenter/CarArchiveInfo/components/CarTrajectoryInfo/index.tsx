
import { Tabs } from "antd";
import { useCallback, useMemo, useState } from "react";
import Frequented from "./components/Frequented";
import HistoricalTrajectory from "./components/HistoricalTrajectory";

import styles from "./index.module.sass";

interface ICarTrajectoryInfo {
  carId: any
  carItem?: any
  /** 菜单定位key */
  pageKey?: string
}

const CarTrajectoryInfo: React.FC<ICarTrajectoryInfo> = ({ carId, carItem, pageKey }) => {
  console.debug('TrajectoryInfo')

  const items = useMemo(() => [
    { label: '历史轨迹', key: 'item-0', children: <HistoricalTrajectory carId={carId} carItem={carItem} /> },
    { label: '常去地', key: 'item-1', children: <Frequented persionId={carId} personItem={carItem} /> },
  ], [carId, carItem])

  const [key, setKey] = useState<string>(pageKey || 'item-0')

  const handleChange = useCallback(
    (val: string) => {
      setKey(val)
    },
    [],
  )

  return (
    <article className={styles.wapper}>
      <Tabs items={items} type="card" className={'dc-tabs-card'} activeKey={key} onChange={handleChange}>
      </Tabs>
    </article>
  )
}

export default CarTrajectoryInfo
