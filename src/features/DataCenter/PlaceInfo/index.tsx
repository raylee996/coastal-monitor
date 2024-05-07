import { Menu } from "antd";
import { useMemo, useState } from "react";
import PlaceBaseInfo from "./component/PlaceBaseInfo";
import PlaceDataInfo from "./component/PlaceDataInfo";
import PlaceWarningInfo from "./component/PlaceWarningInfo";
import styles from "./index.module.sass";
import caseSrc from 'images/dataCenter/case.png'


const items = [
  {
    key: '0',
    label: '场所信息',
    icon: <span className={"iconfont icon-changsuodangan"}></span>
  },
  {
    key: '1',
    label: '数据信息',
    icon: <span className={"iconfont icon-changsuodangan"}></span>
  },
  {
    key: '2',
    label: '场所布防',
    icon: <span className={"iconfont icon-changsuodangan"}></span>
  }
]

interface IPlaceInfo {
  /** 场所id */
  id: number
  /** popup组件隐式传入的关闭窗口函数 */
  onClosePopup?: () => void
  /** 场所类型 */
  labelId?: number
  /** 默认展示选项 */
  defaultTargetKey?: string
  /** 预警信息默认选项卡 */
  warningInfoKey?: string
  /** 场所信息*/
  placeInfo?: any
}

const PlaceInfo: React.FC<IPlaceInfo> = ({ id, onClosePopup, labelId, defaultTargetKey, warningInfoKey, placeInfo }): any => {
  console.debug('PelaceInfo')


  const [targetKey, setTargetKey] = useState(defaultTargetKey ? defaultTargetKey : '0');


  const defaultSelectedKeys = useMemo(() => defaultTargetKey ? [defaultTargetKey] : ['0'], [defaultTargetKey])


  //点击菜单项事件
  function handleClick(evt: any) {
    setTargetKey(evt.key)
  }


  return (
    <article className={styles.wrapper}>

      <div className={styles.boxL}>
        <div className={styles.boxLTop}>
          <img alt="" src={caseSrc} style={{ width: '200px' }} />
          <p className={styles.placeName}>{placeInfo.name}</p>
        </div>
        <Menu items={items} onClick={handleClick} defaultSelectedKeys={defaultSelectedKeys} className={'dc-menus'} style={{ color: '#a6cdff' }} />
        <div className={styles.itemBottom}></div>
      </div>

      <div className={styles.boxR}>
        {targetKey === '0' && <PlaceBaseInfo placeId={id} labelId={labelId} />}
        {targetKey === '1' && <PlaceDataInfo placeId={id} onClosePopup={onClosePopup} />}
        {targetKey === '2' && <PlaceWarningInfo placeId={id} warningInfoKey={warningInfoKey} />}
      </div>

    </article>
  )
}

export default PlaceInfo