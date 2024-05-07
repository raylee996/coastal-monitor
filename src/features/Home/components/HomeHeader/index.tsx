import styles from "./index.module.sass";
import { useLocation, useNavigate } from "react-router-dom";
import { Avatar, Badge, Button, Dropdown, MenuProps, Space } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BellOutlined, ContainerOutlined, DoubleRightOutlined, DownOutlined, LogoutOutlined, UserOutlined,UpOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { clear, selectValue } from "slice/userInfoSlice";
import { getHasWaitData, userLogout } from "server/user";
import WisdomSearchHome from "features/Core/components/WisdomSearch";
import ControlManageTabs from "features/Core/components/Control/ControlManageTabs";
import WisdomModel from "features/Core/components/WisdomModel";
import WisdomJudgment from "features/Core/components/WisdomJudgment";
import WisdomCommand from "features/Core/components/WisdomCommand";
import TaskReview from "features/Core/components/TaskReview";
import dayjs from "dayjs";
import header_start from "images/header/nightstart.png"
import header_end from "images/header/nightend.png"
import whiteheader_start from "images/header/whitestart.png"
import whiteheader_end from "images/header/whiteend.png"
import whiteheader_title from "images/header/whitetitle.png"
import header_title from "images/header/title.png"
import windowstill from "hooks/basis/Windowstill";
import windowUI from "component/WindowUI";
import useAuth from "useHook/useAuth";
import whites from "images/situation/whites.png"
import whiteselect from "images/situation/whiteselect.png"
import moons from "images/situation/moons.png"
import moonselect from "images/situation/moonselect.png"
import zd from "images/situation/zd.png"
import zdselect from "images/situation/zdselect.png"
import PlanManagement from "features/Core/components/PlanManagement";


interface MenuItem {
  key: string;
  label: JSX.Element;
}

interface MenuNode {
  name: string;
  path: string;
  class: string;
  menu?: {
    items: MenuItem[]
  }
}

const HomeHeader: React.FC = () => {
  console.debug('HomeHeader')

  const navigate = useNavigate();
  const location = useLocation();


  const dispatch = useAppDispatch()
  const userInfo = useAppSelector(selectValue)


  const dataCenterAuth = useAuth(['数据中心', '船舶档案', '人员档案', '车辆档案', '案件档案', '重点场所', '数据统计'])
  const coreAuth = useAuth(['情指中心', '智搜', '布控管理', '智慧建模', '智能研判', '智慧指挥', '预案管理', '任务回顾'])
  const systemAuth = useAuth(['系统管理'])


  const [approvalCount, setApprovalCount] = useState(0)
  const [noticeCount, setNoticeCount] = useState(0)
  const [messageTotal, setMessageTotal] = useState(0)
  const [btnIndex, setBtnIndex] = useState(-1)
  const [isDrop,setIsDrop] = useState(false)
  const [isSun,setIsSun] = useState(false)
  const [isMoon,setIsMoon] = useState(false)
  const [isAuto,setIsAuto] = useState(true)
  const [isWhite, setIsWhite] = useState(() => {
    let date = new Date()
    let hour = date.getHours()
    if (hour >= 18 || hour <= 6) {
      return false
    } else {
      return true
    }
  })

  useEffect(() => {
    const timer = setInterval(() => {
      let data = localStorage.getItem('skin')
      if(data) {
        let param = JSON.parse(data)
        if(!param.auto){
          return
        }
      }
      let date = new Date()
      let hour = date.getHours()
      if (hour >= 18 || hour <= 6) {
        setIsWhite(false)
      } else {
        setIsWhite(true)
      }
    }, 1000 * 60 * 10)
    return () => clearInterval(timer)
  }, [])

  useEffect(()=>{
    if(isSun && !isMoon ) {
      setIsWhite(true)
    } 
    if(!isSun && isMoon ) {
      setIsWhite(false)
    }
    if(isAuto) {
      let date = new Date()
      let hour = date.getHours()
      if (hour >= 18 || hour <= 6) {
        setIsWhite(false)
      } else {
        setIsWhite(true)
      }
    }
  },[isSun,isMoon,isAuto])

  const handleMenuButton = useCallback(
    (param: string, btnIdx: number) => {

      const goto = () => {
        if (param === '智搜') { windowstill(<WisdomSearchHome />, { title: '智搜', key: 'WisdomSearchHome', width: '1880px', height: '840px', offset: [20, 70] }) }
        else if (param === '布控管理') { windowstill(<ControlManageTabs />, { title: '布控管理', key: 'ControlManageTabs', width: '1880px', height: '840px', offset: [20, 70] }) }
        else if (param === '智慧建模') { windowstill(<WisdomModel />, { title: '智慧建模', key: 'WisdomModel', width: '1880px', height: '840px', offset: [20, 70] }) }
        else if (param === '智能研判') { windowstill(<WisdomJudgment />, { title: '智能研判', key: 'WisdomJudgment', width: '1880px', height: '840px', offset: [20, 70] }) }
        else if (param === '智慧指挥') { windowUI(<WisdomCommand />, { title: '智慧指挥', key: 'WisdomCommand', width: '480px', height: '800px', offset: [60, 100] }) }
        else if (param === '预案管理') { windowstill(<PlanManagement />, { title: '预案管理', key: 'PlanManagement', width: '1880px', height: '840px', offset: [20, 70] }) }
        else if (param === '任务回顾') { windowstill(<TaskReview />, { title: '任务回顾', key: 'TaskReview', width: '1880px', height: '840px', offset: [20, 70] }) }
      }

      const pathArr = location.pathname.split("/")
      if (pathArr.includes('core')) {
        goto()
      } else {
        setBtnIndex(btnIdx)
        navigate('core')
        goto()
      }


    },
    [location, navigate]
  )


  /* const userMenu = useMemo(() => {
    const handleLogout = () => {
      userLogout()
      dispatch(clear())
      navigate('/login')
    }
    const handlePdf =() => {
        window.open('/pdf')
    }
    const result: MenuProps = {
      items: [
        {
          key: '0',
          label: <div>
            <img src={whites} alt=""/>
            <img src={moons} alt=""/>
            <img src={zd} alt=""/>
          </div>
        },
        {
          key: '1',
          label: <Button type="text" className="iconfont icon-rizhiguanli" onClick={handlePdf}>&nbsp;使用手册</Button>
        },
        {
          key: '2',
          label: <Button type="text" icon={<LogoutOutlined />} onClick={handleLogout}>退出登录</Button>
        },
      ]
    }
    return result
  }, [dispatch, navigate]) */

  const messageMenu = useMemo(() => {
    const handleApproval = () => {
      navigate('/systemManage/personalWorkbench')
    }
    const handleNotice = () => {
      navigate('/systemManage/noticeTable')
    }
    const result: MenuProps = {
      items: [{
        key: '1',
        label:
          <Badge count={approvalCount} size='small' offset={[-4, 14]}>
            <Button type="text" icon={<ContainerOutlined />} onClick={handleApproval}>待办审批</Button>
          </Badge>
      }, {
        key: '2',
        label:
          <Badge count={noticeCount} size='small' offset={[-4, 14]}>
            <Button type="text" icon={<BellOutlined />} onClick={handleNotice}>通知公告</Button>
          </Badge>
      }]
    }
    return result
  }, [approvalCount, navigate, noticeCount])

  const menuList = useMemo(() => {
    const result: MenuNode[] = []

    if (dataCenterAuth[0]) {
      const topNode: MenuNode = {
        name: '数据中心',
        path: '/',
        class: styles.item,
        menu: {
          items: []
        }
      }

      const items: MenuItem[] = []

      dataCenterAuth[1] && items.push({ key: '0', label: <div className={styles.subTitle} onClick={() => navigate('dataCenter/shipArchive')}>船舶档案</div> })
      dataCenterAuth[2] && items.push({ key: '1', label: <div className={styles.subTitle} onClick={() => navigate('dataCenter/personnelArchive')}>人员档案</div> })
      dataCenterAuth[3] && items.push({ key: '2', label: <div className={styles.subTitle} onClick={() => navigate('dataCenter/carArchive')}>车辆档案</div> })
      dataCenterAuth[4] && items.push({ key: '3', label: <div className={styles.subTitle} onClick={() => navigate('dataCenter/caseArchive')}>案件档案</div> })
      dataCenterAuth[5] && items.push({ key: '4', label: <div className={styles.subTitle} onClick={() => navigate('dataCenter/placeTable')}>重点场所</div> })
      dataCenterAuth[6] && items.push({ key: '5', label: <div className={styles.subTitle} onClick={() => navigate('dataCenter/totalData')}>数据统计</div> })

      topNode.menu!.items = items

      result.push(topNode)
    }

    if (coreAuth[0]) {

      const topNode: MenuNode = {
        name: '情指中心',
        path: 'core',
        class: styles.item,
        menu: {
          items: []
        }
      }

      const items: MenuItem[] = []

      const index = result.length

      coreAuth[1] && items.push({ key: '0', label: <div className={styles.subTitle} onClick={() => handleMenuButton('智搜', index)}>智搜</div> })
      coreAuth[2] && items.push({ key: '1', label: <div className={styles.subTitle} onClick={() => handleMenuButton('布控管理', index)}>布控管理</div> })
      coreAuth[3] && items.push({ key: '2', label: <div className={styles.subTitle} onClick={() => handleMenuButton('智慧建模', index)}>智慧建模</div> })
      coreAuth[4] && items.push({ key: '3', label: <div className={styles.subTitle} onClick={() => handleMenuButton('智能研判', index)}>智能研判</div> })
      coreAuth[5] && items.push({ key: '4', label: <div className={styles.subTitle} onClick={() => handleMenuButton('智慧指挥', index)}>智慧指挥</div> })
      coreAuth[6] && items.push({ key: '5', label: <div className={styles.subTitle} onClick={() => handleMenuButton('预案管理', index)}>预案管理</div> })
      coreAuth[7] && items.push({ key: '6', label: <div className={styles.subTitle} onClick={() => handleMenuButton('任务回顾', index)}>任务回顾</div> })

      topNode.menu!.items = items

      result.push(topNode)
    }

    if (systemAuth[0]) {
      const topNode: MenuNode = {
        name: '系统管理',
        path: 'systemManage',
        class: styles.item,
      }

      result.push(topNode)
    }

    if (btnIndex !== -1) {
      result[btnIndex].class = isWhite ? styles.itemActivewhite : styles.itemActive
    }
    return result
  }, [isWhite, btnIndex, dataCenterAuth, coreAuth, systemAuth, navigate, handleMenuButton])


  // 根据路由更新激活菜单项
  useEffect(() => {
    const pathArr = location.pathname.split("/")
    let idx = 0
    if (pathArr.includes('core')) {
      idx = menuList.findIndex(ele => ele.path === 'core')
    } else if (pathArr.includes('systemManage')) {
      idx = menuList.findIndex(ele => ele.path === 'systemManage')
    }
    idx !== -1 && setBtnIndex(idx)
  }, [location, menuList])

  // 轮询获取用户通知
  useEffect(() => {
    const _worker = getHasWaitData((res: any) => {
      if (res.code === 200) {
        setNoticeCount(res.data.notReadCount)
        setApprovalCount(res.data.waitHandleCount)
        setMessageTotal(res.data.total)
      }
    })
    return () => {
      _worker && _worker.terminate()
    }
  }, [])


  const handleChange = useCallback(
    (idx: any) => {
      const path = menuList[idx].path
      setBtnIndex(idx)
      navigate(path)
    },
    [menuList, navigate],
  )

  const handleNotice = useCallback(
    () => {
      navigate('/systemManage/personalWorkbench')
    },
    [navigate],
  )
  
  const handleLogout = () => {
    userLogout()
    dispatch(clear())
    navigate('/login')
  }
  const handlePdf =() => {
      window.open('/pdf')
  }

  const dateText = useMemo(() => dayjs().format("YYYY.MM.DD"), [])

  const handelSun = useCallback((e:any)=>{
    setIsAuto(false)
    setIsSun(true)
    setIsMoon(false)
    let param ={
      sun:true,
      moon:false,
      auto:false
    }
    localStorage.setItem('skin',JSON.stringify(param))
    e.stopPropagation()
  },[])
  const handelMoon = useCallback((e:any)=>{
    setIsAuto(false)
    setIsSun(false)
    setIsMoon(true)
    let param ={
      sun:false,
      moon:true,
      auto:false
    }
    localStorage.setItem('skin',JSON.stringify(param))
    e.stopPropagation()
  },[])
  const handelAuto = useCallback((e:any)=>{
    setIsAuto(true)
    setIsSun(false)
    setIsMoon(false)
    let param ={
      sun:false,
      moon:false,
      auto:true
    }
    localStorage.setItem('skin',JSON.stringify(param))
    e.stopPropagation()
  },[])
  const handelClick = useCallback((e:any)=>{
    setIsDrop(!isDrop)
    e.stopPropagation()
  },[isDrop])
  useEffect(()=>{
    document.addEventListener('click',()=>{
      setIsDrop(false)
    })
  },[])

  return (
    <article  >
      <article className={styles.wrapper} >
        <article className={styles.content}>
          <section className={styles.nav}>
            {menuList.map((item, index: any) => (item.menu ?
              <Dropdown overlayClassName='dropdown_ui' menu={item.menu} key={item.name} >
                <div
                  key={item.name}
                  className={item.class}
                  onClick={() => {
                    handleChange(index)
                  }}
                >
                  <span className={isWhite ? styles.menuNamewhite : styles.menuName}>{item.name}</span>
                  <DoubleRightOutlined className={isWhite ? styles.menuIconwhite : styles.menuIcon} />
                </div>
              </Dropdown> :
              <div
                key={item.name}
                className={item.class}
                onClick={() => {
                  handleChange(index)
                }}
              >
                <span className={isWhite ? styles.menuNamewhite : styles.menuName}>{item.name}</span>
              </div>
            ))}
          </section>

          <section className={styles.box}>

            <div className={styles.date}>{dateText}</div>

            <div className={styles.personInfo}>
              <Dropdown overlayClassName='dropdown_ui' menu={messageMenu} placement="bottomRight">
                <div className={styles.dotBox}>
                  <Badge count={messageTotal} size='small' offset={[-6, 6]}>
                    <Avatar size={32} icon={<UserOutlined />} onClick={handleNotice} />
                  </Badge>
                </div>
              </Dropdown>

              <Space>
                <span className={styles.personName} onClick={handelClick}>{userInfo.name}</span>
                {isDrop? <UpOutlined/> : <DownOutlined /> }
              </Space>
              
            {/*  <Dropdown overlayClassName='dropdown_ui' menu={userMenu} placement="bottomRight">
                <Space>
                  <span className={styles.personName}>{userInfo.name}</span>
                  <DownOutlined />
                </Space>
              </Dropdown> */}
            </div>

          </section>
        </article>
        <aside className={styles.backgroundImgs}>
          <img src={isWhite ? whiteheader_start : header_start} alt="" />
          <img src={isWhite ? whiteheader_end : header_end} alt="" />
          <img src={isWhite ? whiteheader_title : header_title} alt="" />
        </aside>
      </article>
      
      {isDrop&&<div className={styles.drops}>
        <div>
          <img title='白天' onClick={handelSun} src={ !isSun? whites : whiteselect} alt="" className={styles.skin} style={{marginLeft:'10px'}}/>
          <img title='晚上' onClick={handelMoon} src={!isMoon? moons : moonselect} alt="" className={styles.skin}  style={{marginLeft:'16px',marginRight:'6px'}}/>
          <img title='自动' onClick={handelAuto} src={!isAuto?zd:zdselect} alt="" className={styles.skin}/>
        </div>
        <div>
          <Button type="text" className="iconfont icon-rizhiguanli" onClick={handlePdf}>&nbsp;使用手册</Button>
        </div>
        <div>
          <Button type="text" icon={<LogoutOutlined />} onClick={handleLogout}>退出登录</Button>
        </div>
      </div>}
    </article >
  );
}

export default HomeHeader;
