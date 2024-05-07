
import { Tabs } from "antd";
import PlaceBaseData from "./component/PlaceBaseData";
import PlaceStaff from "./component/PlaceStaff";
import styles from "./index.module.sass";

interface IPlaceBaseInfo {
  placeId: any
  /** 场所类型 */
  labelId?: number
}
const PlaceBaseInfo: React.FC<IPlaceBaseInfo> = (props) => {
  console.debug('PlaceBaseInfo')
  const { placeId, labelId } = props
  const items = [
    { label: '基本信息', key: 'item-0', children: <PlaceBaseData placeId={placeId} labelId={labelId} /> },
    { label: '工作人员', key: 'item-1', children: <PlaceStaff placeId={placeId} /> }
  ];

  return (
    <article className={styles.wapper}>
      <Tabs items={items} type="card" className={'dc-tabs-card'}>
      </Tabs>
    </article>
  )
}

export default PlaceBaseInfo
