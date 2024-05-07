import { Menu } from "antd";
import React, { useMemo, useState } from "react";
import styles from "./index.module.sass";
import CaseInfo from "./components/CaseInfo";
import CaseRelationMan from "./components/CaseRelationMan";
import CaseProgress from "./components/CaseProgress";
import CaseRecord from "./components/CaseRecord";


interface Props {
  /**选中的案件 */
  caseItem?: {
    id: number
    caseName?: string
  }
}

/**tabs选项 */
const items = [
  {
    key: '0',
    label: '案件信息',
    icon: <span className={"iconfont icon-changsuodangan"}></span>
  },
  {
    key: '1',
    label: '案件进展',
    icon: <span className={"iconfont icon-changsuodangan"}></span>
  },
  {
    key: '2',
    label: '涉案人员',
    icon: <span className={"iconfont icon-changsuodangan"}></span>
  },
  {
    key: '3',
    label: '分析记录',
    icon: <span className={"iconfont icon-changsuodangan"}></span>
  },
]

const CaseArchiveInfo: React.FC<Props> = ({ caseItem }) => {
  console.debug('CaseArchiveInfo')

  const [targetKey, setTargetKey] = useState('0');

  const name = useMemo(() => caseItem?.caseName ? caseItem.caseName : '', [caseItem])

  //点击菜单项事件
  function handleClick(evt: any) {
    setTargetKey(evt.key)
  }

  return (<article className={styles.wrapper}>

    <div className={styles.boxLeft}>
      <img alt="" src={require('../../../images/dataCenter/case.png')} style={{ width: '200px' }} />
      <p className={styles.caseName}>{name}</p>
      <Menu style={{ width: 200, color: '#a6cdff' }} mode="inline" items={items} onClick={handleClick} defaultSelectedKeys={['0']} className={'dc-menus'} />
      {/* <div className={styles.itemBottom}></div> */}
    </div>

    <div className={styles.boxRight}>
      {/*案件信息*/}
      {targetKey === '0' && caseItem && <CaseInfo id={caseItem.id} />}
      {/*案件进展*/}
      {targetKey === '1' && caseItem && <CaseProgress caseItem={caseItem} />}
      {/*涉案人员*/}
      {targetKey === '2' && caseItem && <CaseRelationMan caseItem={caseItem} />}
      {/*分析记录*/}
      {targetKey === '3' && caseItem && <CaseRecord id={caseItem.id} />}
    </div>
  </article>)
}

export default CaseArchiveInfo
