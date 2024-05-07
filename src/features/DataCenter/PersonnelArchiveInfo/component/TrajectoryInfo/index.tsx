
import { Tabs } from "antd";
import Frequented from "./components/Frequented";
import HistoricalTrajectory from "./components/HistoricalTrajectory";
import styles from "./index.module.sass";
import "../../../dataCenter.sass"
import { useCallback, useMemo, useState } from "react";

interface ITrajectoryInfo {
  id: any
  personItem?: any
  /** 菜单定位key */
  pageKey?: string
}

const TrajectoryInfo: React.FC<ITrajectoryInfo> = ({ id, personItem, pageKey }) => {
  console.debug('TrajectoryInfo')

  const items = useMemo(() => [
    { label: '历史轨迹', key: 'item-0', children: <HistoricalTrajectory persionId={id} personItem={personItem} /> },
    { label: '常去地', key: 'item-1', children: <Frequented persionId={id} personItem={personItem} /> },
  ], [id, personItem])

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

export default TrajectoryInfo
