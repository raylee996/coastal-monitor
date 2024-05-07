import { useRoutes } from "react-router-dom";

import { useMemo } from "react";

import useAuth from "useHook/useAuth";

import Login from "./features/Login";
import Home from "./features/Home";
import NoMatch from "./features/NoMatch";
import Core from "features/Core";
import DataCenter from "features/DataCenter";
import SystemManage from "features/SystemManage";
import PersonnelArchiveTable from "features/DataCenter/PersonnelArchiveTable";
import UserTable from "features/SystemManage/UserTable";
import DeviceTable from "features/SystemManage/DeviceTable";
import LogTabs from "features/SystemManage/LogTabs";
import ControlWarn from "./features/DataCenter/TotalDataMange/ControlWarn";
import TotalCollectionData from "./features/DataCenter/TotalDataMange/CollectionData";
import TotalHotData from "./features/DataCenter/TotalDataMange/HotData";
import TotalCaseData from "./features/DataCenter/TotalDataMange/CaseTotal";
import ShipArchiveTable from "./features/DataCenter/ShipArchiveTable";
import CaseArchiveTable from "./features/DataCenter/CaseArchiveTable";
import CarArchiveTable from "features/DataCenter/CarArchiveTable";
import PlaceTable from "features/DataCenter/PlaceTable";
import RoleTable from "features/SystemManage/RoleTable";
import MenuTable from "features/SystemManage/MenuTable";
import DeptTable from "features/SystemManage/DeptTable";
import PersonalWorkbench from "features/SystemManage/PersonalWorkbench/Tabs";
import NoticeTable from "features/SystemManage/NoticeTable";
import DictionaryTable from "features/SystemManage/DictionaryTable";
import RosterTabs from "features/SystemManage/RosterTabs";
import DataCenterHome from "features/DataCenterHome";
import BigData from "features/Test/BigData";
import PlayerMultipath from "features/Test/PlayerMultipath";
import Viewpdf from "features/Home/components/Viewpdf";


interface RouteItem {
  path: string,
  element: JSX.Element
  children?: RouteItem[]
}

function RouterConfig() {
  console.debug('RouterConfig')


  const dataCenterAuth = useAuth(['数据中心', '船舶档案', '人员档案', '车辆档案', '案件档案', '重点场所', '数据统计'])
  const totalDataAuth = useAuth(['布控预警信息', '数据采集信息', '数据热力图', '案事件统计'])
  const coreAuth = useAuth(['情指中心'])
  const systemAuth = useAuth(['系统管理', '用户管理', '角色管理', '菜单管理', '部门管理', '设备管理', '个人工作台', '黑白名单管理', '字典管理', '通知公告', '日志'])

  const routes = useMemo(() => {

    if (!dataCenterAuth[0] && !coreAuth[0] && !systemAuth[0]) {
      return [
        {
          path: "login",
          element: <Login />,
        },
        {
          path: 'bigData',
          element: <BigData />
        },
        {
          path: 'playerMultipath',
          element: <PlayerMultipath />
        },
        {
          path: "*",
          element: <NoMatch />
        },
      ]
    } else {

      const homeChild: RouteItem[] = []

      if (dataCenterAuth[0]) {

        const dataCenterChild: RouteItem[] = []

        dataCenterAuth[1] && dataCenterChild.push({ path: 'shipArchive', element: <ShipArchiveTable /> })
        dataCenterAuth[2] && dataCenterChild.push({ path: 'personnelArchive', element: <PersonnelArchiveTable /> })
        dataCenterAuth[3] && dataCenterChild.push({ path: 'carArchive', element: <CarArchiveTable /> })
        dataCenterAuth[4] && dataCenterChild.push({ path: 'caseArchive', element: <CaseArchiveTable /> })
        dataCenterAuth[5] && dataCenterChild.push({ path: 'placeTable', element: <PlaceTable /> })

        if (dataCenterAuth[6]) {
          totalDataAuth[0] && dataCenterChild.push({ path: 'totalData', element: <ControlWarn /> })
          totalDataAuth[1] && dataCenterChild.push({ path: 'collectionData', element: <TotalCollectionData /> })
          totalDataAuth[2] && dataCenterChild.push({ path: 'hotData', element: <TotalHotData /> })
          totalDataAuth[3] && dataCenterChild.push({ path: 'caseTotal', element: <TotalCaseData /> })
        }

        homeChild.push({
          path: 'dataCenterHome',
          element: <DataCenterHome />
        }, {
          path: 'dataCenter',
          element: <DataCenter />,
          children: dataCenterChild
        })
      }

      if (coreAuth[0]) {
        homeChild.push({
          path: 'core',
          element: <Core />
        })
      }

      if (systemAuth[0]) {

        const systemManageChild: RouteItem[] = []

        systemAuth[1] && systemManageChild.push({ path: '', element: <UserTable /> }, { path: 'userTable', element: <UserTable /> })
        systemAuth[2] && systemManageChild.push({ path: 'roleTable', element: <RoleTable /> })
        systemAuth[3] && systemManageChild.push({ path: 'menuTable', element: <MenuTable /> })
        systemAuth[4] && systemManageChild.push({ path: 'deptTable', element: <DeptTable /> })
        systemAuth[5] && systemManageChild.push({ path: 'deviceTable', element: <DeviceTable /> })
        systemAuth[6] && systemManageChild.push({ path: 'personalWorkbench', element: <PersonalWorkbench /> })
        systemAuth[7] && systemManageChild.push({ path: 'rosterTabs', element: <RosterTabs /> })
        systemAuth[8] && systemManageChild.push({ path: 'dictionaryTable', element: <DictionaryTable /> })
        systemAuth[9] && systemManageChild.push({ path: 'noticeTable', element: <NoticeTable /> })
        systemAuth[10] && systemManageChild.push({ path: 'logTabs', element: <LogTabs /> })

        homeChild.push({
          path: 'systemManage',
          element: <SystemManage />,
          children: systemManageChild
        })
      }

      if (homeChild.length !== 0) {
        const head = homeChild[0]
        homeChild.push({
          path: '',
          element: head.element,
          children: head.children
        })
      }

      return [
        {
          path: "login",
          element: <Login />,
        },
        {
          path: "/",
          element: <Home />,
          children: homeChild
        },
        {
          path: 'bigData',
          element: <BigData />
        },
        {
          path: 'playerMultipath',
          element: <PlayerMultipath />
        },
        {
          path: 'pdf',
          element: <Viewpdf />
        },
        {
          path: "*",
          element: <NoMatch />
        },
      ]
    }
  }, [dataCenterAuth, coreAuth, systemAuth, totalDataAuth])

  let element = useRoutes(routes);

  return element;
}

export default RouterConfig;
