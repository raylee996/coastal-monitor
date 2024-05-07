import { Menu } from "antd";
import _ from "lodash";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import useAuth from "useHook/useAuth";
import styles from "./index.module.sass";


interface Item {
  key: string;
  label: string;
  path: string;
  icon: JSX.Element;
}

const SystemManage: React.FC = () => {
  console.debug('SystemManage')


  const navigate = useNavigate();
  const location = useLocation();

  const windowstillRootRef = useRef<HTMLElement>(null)

  const systemAuth = useAuth(['用户管理', '角色管理', '菜单管理', '部门管理', '设备管理', '个人工作台', '黑白名单管理', '字典管理', '通知公告', '日志'])


  const items = useMemo(() => {
    const result: Item[] = []

    systemAuth[0] && result.push({ key: 'userTable', label: '用户管理', path: 'userTable', icon: <span className={"iconfont icon-yonghuguanli"}></span> })
    systemAuth[1] && result.push({ key: 'roleTable', label: '角色管理', path: 'roleTable', icon: <span className={"iconfont icon-a-jiaoseguanlixiao"}></span> })
    systemAuth[2] && result.push({ key: 'menuTable', label: '菜单管理', path: 'menuTable', icon: <span className={"iconfont icon-caidanguanli"}></span> })
    systemAuth[3] && result.push({ key: 'deptTable', label: '部门管理', path: 'deptTable', icon: <span className={"iconfont icon-changsuodangan"}></span> })
    systemAuth[4] && result.push({ key: 'deviceTable', label: '设备管理', path: 'deviceTable', icon: <span className={"iconfont icon-shebeiguanli"}></span> })
    systemAuth[5] && result.push({ key: 'personalWorkbench', label: '个人工作台', path: 'personalWorkbench', icon: <span className={"iconfont icon-gerengongzuotai"}></span> })
    systemAuth[6] && result.push({ key: 'rosterTabs', label: '黑白名单管理', path: 'rosterTabs', icon: <span className={"iconfont icon-baimingdan"}></span> })
    systemAuth[7] && result.push({ key: 'dictionaryTable', label: '字典管理', path: 'dictionaryTable', icon: <span className={"iconfont icon-zidianguanli"}></span> })
    systemAuth[8] && result.push({ key: 'noticeTable', label: '通知公告', path: 'noticeTable', icon: <span className={"iconfont icon-gonggao"}></span> })
    systemAuth[9] && result.push({ key: 'logTabs', label: '日志', path: 'logTabs', icon: <span className={"iconfont icon-rizhiguanli"}></span> })

    return result
  }, [systemAuth])

  const defaultSelectedKeys = useMemo(() => {
    const item = items.find(item => _.endsWith(location.pathname, item.path))
    return item ? [item.key] : ['userTable']
  }, [items, location])


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
        <section className={styles.menu}>
          <Menu
            onClick={handleClick}
            style={{ width: 180, color: '#a6cdff' }}
            className={styles.menulist}
            // defaultSelectedKeys={defaultSelectedKeys}
            selectedKeys={defaultSelectedKeys}
            mode="inline"
            items={items}
          />
        </section>
        <section className={styles.content}>
          <Outlet />
        </section>
      </div>
      <aside id='windowstill-root' ref={windowstillRootRef} />
      <aside id='popup-root'></aside>
    </article>
  )
}

export default SystemManage
