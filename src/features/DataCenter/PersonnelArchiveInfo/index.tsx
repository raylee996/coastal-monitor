import { Menu } from "antd";
import { useEffect, useState } from "react";
import { doGetPersonInfo } from "server/personnel";
import AccompanyInfo from "./component/AccompanyInfo";
import PersonBaseData from "./component/PersonBaseData";
import RelationInfo from "./component/RelationInfo";
import TargetInfo from "./component/TargetInfo";
import TrajectoryInfo from "./component/TrajectoryInfo";
import WarningInfo from "./component/WarningInfo";
import styles from "./index.module.sass";
import "../dataCenter.sass"

const items = [
  {
    key: '0',
    label: '个人信息',
    icon: <span className={"iconfont icon-renyuandangan"}></span>
  },
  {
    key: '1',
    label: '轨迹信息',
    icon: <span className={"iconfont icon-renyuandangan"}></span>
  },
  {
    key: '2',
    label: '伴随信息',
    icon: <span className={"iconfont icon-renyuandangan"}></span>
  },
  {
    key: '3',
    label: '关联信息',
    icon: <span className={"iconfont icon-renyuandangan"}></span>
  },
  {
    key: '4',
    label: '预警信息',
    icon: <span className={"iconfont icon-renyuandangan"}></span>
  }
]

interface IPersonInfo {
  id?: string | number,
  itemProps?: any
  /** 菜单定位key */
  pageKey?: {
    // 一级菜单 左侧主菜单
    firstPageKey?: string
    // 二级菜单 页面顶部tab菜单
    secondPageKey?: string
  }
}

const PersonnelArchiveInfo: React.FC<IPersonInfo> = ({ id, itemProps, pageKey }): any => {
  console.debug('PersonnelArchiveInfo')

  const { firstPageKey, secondPageKey  } = pageKey || {}

  const [targetKey, setTargetKey] = useState(firstPageKey || '0');

  const [targetData, setTargetData] = useState<any>()

  useEffect(() => {

    async function main() {
      const vo = await doGetPersonInfo({ id })
      setTargetData(vo)
    }
    main()
  }, [id])


  //点击菜单项事件
  function handleClick(evt: any) {
    setTargetKey(evt.key)
  }

  return (
    <article className={styles.wrapper}>

      <div className={styles.boxL}>
        <TargetInfo id={id} />
        <Menu  style={{ width: 200, color: '#a6cdff' }} mode="inline" items={items} onClick={handleClick} defaultSelectedKeys={['0']} className={'dc-menus'} />
        {/* <div className={styles.itemBottom}></div> */}
      </div>

      <div className={styles.boxR}>
        {targetKey === '0' && <PersonBaseData id={id} personInfo={targetData} pageKey={secondPageKey} />}
        {targetKey === '1' && <TrajectoryInfo id={id} personItem={itemProps} pageKey={secondPageKey} />}
        {targetKey === '2' && <AccompanyInfo data={targetData} />}
        {targetKey === '3' && <RelationInfo id={id} />}
        {targetKey === '4' && <WarningInfo id={id} />}
      </div>

    </article>
  )
}

export default PersonnelArchiveInfo