import { useCallback, useEffect, useMemo, useState } from "react";
import ShipBaseData from "./component/ShipBaseData";
import styles from "./index.module.sass";
import ShipSailingTabs from "./component/ShipSailingTabs";
import ShipWarndata from './component/ShipWarndata'
import ShipBehiors from './component/ShipBehivor'
import { Menu, Spin } from "antd";
import ShipArchiveRelevant from "./component/ShipArchiveRelevant";
import ShipArchiveAdjoint from "./component/ShipArchiveAdjoint";
import TargetInfo from "./component/TargetInfo";
import { getShipInfoData } from "server/ship";
import '../dataCenter.sass'
import { useAppDispatch } from "app/hooks";
import { setSituationalAnalysis } from "slice/coreMapSlice";


const items = [
  {
    key: '1',
    label: '船舶信息',
    icon: <span className={"iconfont icon-chuanbodangan"}></span>
  },
  {
    key: '2',
    label: '航行信息',
    icon: <span className={"iconfont icon-chuanbodangan"}></span>
  },
  {
    key: '3',
    label: '伴随信息',
    icon: <span className={"iconfont icon-chuanbodangan"}></span>
  },
  {
    key: '4',
    label: '关联信息',
    icon: <span className={"iconfont icon-chuanbodangan"}></span>
  },
  {
    key: '5',
    label: '预警信息',
    icon: <span className={"iconfont icon-chuanbodangan"}></span>
  },
  {
    key: '6',
    label: '行为分析',
    icon: <span className={"iconfont icon-chuanbodangan"}></span>
  },
]

const defaultSelectedKeys = ['1']

interface Props {
  /** 档案id */
  id?: string
  /** mmsi */
  mmsi?: string
  /** 雷达批号 */
  radarNumber?: string
  /** 数据类型 1-AIS 2-雷达 */
  dataType?: number
  /** 菜单定位key */
  pageKey?: {
    // 一级菜单 左侧主菜单
    firstPageKey?: string
    // 二级菜单 页面顶部tab菜单
    secondPageKey?: string
  }
}

const ShipArchiveInfo: React.FC<Props> = ({ id, mmsi, radarNumber, dataType, pageKey }) => {
  console.debug('ShipArchiveInfo')

  const { firstPageKey, secondPageKey } = pageKey || {}

  const dispatch = useAppDispatch()


  const [targetKey, setTargetKey] = useState(firstPageKey || '1');
  const [targetData, setTargetData] = useState<any>()
  const [editFlag, setEditFlag] = useState<number>()
  const [loading, setLoading] = useState(false)
  const [info, setInfo] = useState<any>({})

  const loadShipArchiveInfo = useCallback(
    async () => {
      if ((id || mmsi || radarNumber) && dataType) {
        const params = { id, mmsi, radarNumber, dataType }
        const vo = await getShipInfoData(params)
        setInfo(vo)

      }
    },
    [dataType, id, mmsi, radarNumber],
  )

  useEffect(() => {
    dispatch(setSituationalAnalysis(false))
    return () => {
      dispatch(setSituationalAnalysis(true))
    }
  }, [dispatch])

  useEffect(() => {
    let ctr: AbortController
    async function main() {
      try {
        if ((id || mmsi || radarNumber) && dataType) {
          setLoading(true)
          ctr = new AbortController()
          const params = { id, mmsi, radarNumber, dataType }
          const vo = await getShipInfoData(params, ctr)
          setTargetData(vo)
          setInfo(vo)
          setLoading(false)
        }
      } catch (error) {
        console.warn('获取船舶档案信息异常', error)
        setLoading(false)
      }
    }
    main()
    return () => {
      ctr?.abort()
    }
  }, [dataType, id, mmsi, radarNumber])


  const handleEditFlag = useCallback(
    (time: number) => {
      setEditFlag(time)
    },
    [],
  )

  //点击菜单项事件
  const handleClick = useCallback(
    (evt: any) => {
      setTargetKey(evt.key)
    },
    [],
  )


  const contentJsx = useMemo(() => {
    let result
    if (!targetData) return
    switch (targetKey) {
      case '1':
        result = <ShipBaseData shipData={targetData} editFlag={handleEditFlag} onLoadShipInfo={loadShipArchiveInfo} pageKey={secondPageKey} />
        break;
      case '2':
        result = <ShipSailingTabs shipData={targetData} pageKey={secondPageKey} />
        break;
      case '3':
        result = <ShipArchiveAdjoint shipData={targetData} />
        break
      case '4':
        result = <ShipArchiveRelevant shipData={targetData} />
        break
      case '5':
        result = <ShipWarndata shipData={targetData} />
        break
      case '6':
        result = <ShipBehiors shipData={targetData} />
        break
      default:
        break;
    }
    return result
  }, [targetKey, targetData, handleEditFlag, loadShipArchiveInfo, secondPageKey])


  return (
    <article className={styles.wrapper}>

      <section className={styles.boxL}>
        <TargetInfo shipData={info} editFlag={editFlag} />
        <Menu className={styles.menulist} style={{ width: 200, color: '#a6cdff' }} mode="inline" items={items} onClick={handleClick} defaultSelectedKeys={defaultSelectedKeys} />
        {/* <div className={styles.itemBottom}></div> */}
      </section>

      <section className={styles.boxR}>
        {loading ? <Spin /> : contentJsx}
      </section>

    </article>
  )
}

export default ShipArchiveInfo
