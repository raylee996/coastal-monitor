import { Menu, message } from "antd";
import { useEffect, useState } from "react";
import { doGetCarList, getCarArchiveData } from "server/car";
import CarArchiveAdjoint from "./components/CarArchiveAdjoint";
import CarBaseInfo from "./components/CarBaseInfo";
import CarEarlyWarning from "./components/CarEarlyWarning";
import CarRelevant from "./components/CarRelevant";
import CarTrajectoryInfo from "./components/CarTrajectoryInfo";
import TargetInfo from "./components/TargetInfo";
import styles from "./index.module.sass";
import "../dataCenter.sass"

/**tabs选项 */
const items = [
  {
    key: '0',
    label: '基本信息',
    icon: <span className={"iconfont icon-cheliangdangan"}></span>
  },
  {
    key: '1',
    label: '轨迹信息',
    icon: <span className={"iconfont icon-cheliangdangan"}></span>
  },
  {
    key: '2',
    label: '伴随信息',
    icon: <span className={"iconfont icon-cheliangdangan"}></span>
  },
  {
    key: '3',
    label: '关联信息',
    icon: <span className={"iconfont icon-cheliangdangan"}></span>
  },
  {
    key: '4',
    label: '预警信息',
    icon: <span className={"iconfont icon-cheliangdangan"}></span>
  }
]

interface ICarArchiveInfo {
  /** 车辆档案id和车牌必填其一 */
  /**车辆档案ID */
  carId?: any
  /**选中的车辆对象 */
  carItem?: any
  /**车牌 */
  carPlate?: string
  /** 菜单定位key */
  pageKey?: {
    // 一级菜单 左侧主菜单
    firstPageKey?: string
    // 二级菜单 页面顶部tab菜单
    secondPageKey?: string
  }
}

const CarArchiveInfo: React.FC<ICarArchiveInfo> = ({ carId, carItem, pageKey, carPlate }) => {
  console.log('CarArchiveInfo')

  const { firstPageKey, secondPageKey } = pageKey || {}

  const [targetKey, setTargetKey] = useState(firstPageKey || '0');

  const [archiveData, setArchiveData] = useState<any>()

  useEffect(() => {
    async function main() {
      const vo = await getCarArchiveData(carId)
      setArchiveData(vo)
    }
    // 根据车牌号查询档案信息
    async function getCard() {
      const vo = await doGetCarList({
        pageNumber: 1,
        pageSize: -1
      }, {
        searchValue: carPlate
      })
      if (vo.data & vo.data.length) {
        setArchiveData(vo.data[0])
      } else {
        message.warning('暂无档案')
      }
    }
    if (carId) {
      main()
    } else if (carPlate) {
      getCard()
    } else {
      message.warning('车辆档案id或者车牌必选其一')
    }
    main()
  }, [carId, carPlate])


  //点击菜单项事件
  function handleClick(evt: any) {
    setTargetKey(evt.key)
  }

  return (<article className={styles.wrapper}>

    <div className={styles.boxL}>
      <TargetInfo id={carId} item={archiveData} />
      <Menu style={{ width: 200, color: '#a6cdff' }} mode="inline" items={items} onClick={handleClick} defaultSelectedKeys={['0']} className={'dc-menus'} />
      {/* <div className={styles.itemBottom}></div> */}

    </div>

    <div className={styles.boxR}>
      {/* {targetKey === '0' && < id={props.id} />} */}
      {targetKey === '0' && <CarBaseInfo carId={carId} carItem={archiveData} setArchiveData={setArchiveData} />}
      {targetKey === '1' && <CarTrajectoryInfo carId={carId} carItem={archiveData} pageKey={secondPageKey} />}
      {targetKey === '2' && <CarArchiveAdjoint data={archiveData} />}
      {targetKey === '3' && <CarRelevant id={carId} />}
      {targetKey === '4' && <CarEarlyWarning carId={carId} carItem={archiveData} />}
    </div>

  </article>)
}

export default CarArchiveInfo