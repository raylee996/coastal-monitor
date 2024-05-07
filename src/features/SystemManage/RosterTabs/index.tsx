import { Tabs } from "antd";
import { useMemo } from "react";
import useAuth from "useHook/useAuth";
import BlacklistTable from "../BlacklistTable";
import WhitelistTable from "../WhitelistTable";
import styles from "./index.module.sass";


interface TabsItem {
  label: string
  key: string
  children: JSX.Element
}

const RosterTabs: React.FC = () => {
  console.debug('RosterTabs')


  const blackWhiteAuth = useAuth(['黑名单', '白名单'])


  const items = useMemo(() => {
    const result: TabsItem[] = []
    blackWhiteAuth[0] && result.push({ label: '黑名单', key: 'item-1', children: <BlacklistTable /> })
    blackWhiteAuth[1] && result.push({ label: '白名单', key: 'item-2', children: <WhitelistTable /> })
    return result
  }, [blackWhiteAuth])


  return (
    <article className={styles.wrapper}>
      <Tabs className={`${styles.tabs} core__tabs-content-height`} items={items} />
    </article>
  )
}

export default RosterTabs