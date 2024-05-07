import { Tabs } from "antd";
import { useMemo } from "react";
import useAuth from "useHook/useAuth";
import LogErrorTable from "../LogErrorTable";
import LogLoginTable from "../LogLoginTable";
import LogSystemTable from "../LogSystemTable";
import styles from "./index.module.sass";


interface TabsItem {
  label: string
  key: string
  children: JSX.Element
}

const LogTabs: React.FC = () => {
  console.debug('LogTabs')


  const logAuth = useAuth(['登录日志', '操作日志', '异常日志'])


  const items = useMemo(() => {
    const result: TabsItem[] = []
    logAuth[0] && result.push({ label: '登录日志', key: 'item-2', children: <LogLoginTable /> })
    logAuth[1] && result.push({ label: '操作日志', key: 'item-1', children: <LogSystemTable /> })
    logAuth[2] && result.push({ label: '异常日志', key: 'item-3', children: <LogErrorTable /> })
    return result
  }, [logAuth])


  return (
    <article className={styles.wrapper}>
      <Tabs className={`${styles.tabs} core__tabs-content-height`} items={items} />
    </article>
  )
}

export default LogTabs