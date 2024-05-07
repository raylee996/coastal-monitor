import { Outlet, useLocation, useNavigate } from "react-router-dom";
import styles from "./index.module.sass";
import './dataCenter.sass'
import { Menu } from "antd";
import { useCallback, useEffect, useMemo, useRef } from "react";
import _ from "lodash";
import useAuth from "useHook/useAuth";


interface Item {
  key: string
  label: string
  path: string
  icon: JSX.Element
}

const DataCenter: React.FC = () => {
  console.debug('DataCenter')


  const navigate = useNavigate();
  const location = useLocation();


  const windowstillRootRef = useRef<HTMLElement>(null)


  const statisticsAuth = useAuth(['布控预警信息', '数据采集信息', '数据热力图', '案事件统计'])


  const items = useMemo(() => {
    const result: Item[] = []
    statisticsAuth[0] && result.push({ key: 'controlWarn', label: '布控预警信息', path: 'totalData', icon: <span className={"iconfont icon-bukongshuju"}></span> })
    statisticsAuth[1] && result.push({ key: 'collectionData', label: '数据采集信息', path: 'collectionData', icon: <span className={"iconfont icon-caijishuju"}></span> })
    statisticsAuth[2] && result.push({ key: 'hotData', label: '数据热力图', path: 'hotData', icon: <span className={"iconfont icon-changsuodangan"}></span> })
    statisticsAuth[3] && result.push({ key: 'caseTotal', label: '案事件统计', path: 'caseTotal', icon: <span className={"iconfont icon-changsuodangan"}></span> })
    return result
  }, [statisticsAuth])


  const defaultSelectedKeys = useMemo(() => {
    const item = items.find(item => _.endsWith(location.pathname, item.path))
    return item ? [item.key] : ['controlWarn']
  }, [items, location])


  const isShowMenu = useMemo(() => {
    return items.some(item => _.endsWith(location.pathname, item.path))
  }, [items, location])


  //点击菜单项事件
  const handleClick = useCallback(
    (evt: any) => {
      let menu: any
      let list = items
      evt.keyPath.reverse().forEach((key: string) => {
        menu = list.find(item => item.key === key)
        if (menu.children) {
          list = menu.children
        }
      })
      menu.path && navigate(menu.path)
    },
    [items, navigate],
  )


  useEffect(() => {
    let winRoot = windowstillRootRef.current
    return () => {
      if (winRoot) {
        const event = new Event('rootclear')
        winRoot.dispatchEvent(event)
      }
    }
  }, [])


  return (
    <article className={styles.wrapper}>
      <div className={styles.wrapperContent}>
        {isShowMenu &&
          <section className={styles.menu}>
            <Menu
              defaultSelectedKeys={defaultSelectedKeys}
              onClick={handleClick}
              style={{ width: 180, color: '#a6cdff' }}
              className={styles.menulist}
              mode="inline"
              items={items}
            />
          </section>
        }
        <section className={styles.content}>
          <Outlet />
        </section>
      </div>
      <aside id='windowstill-root' ref={windowstillRootRef} />
      <aside id='popup-root'></aside>
    </article>
  )
}

export default DataCenter
