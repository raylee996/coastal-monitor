import { Tabs, TabsProps } from "antd";
import { useAppDispatch } from "app/hooks";
import { useEffect, useState } from "react";
import { resetShowPlanView, setShowPlanView } from "slice/funMenuSlice";
import HighRiskTarget from "./components/HighRiskTarget";
import JudgmentRecord from "./components/JudgmentRecord";
import styles from './index.module.sass'

interface Props {
  /** 看板的默认激活key */
  activeKey?: string
  /** 预案id */
  id?: number
}

// const shipLatLng = [22.465215, 113.922815]

// const latLngList: [number, number][] = [
//   [22.473144, 113.912172],
//   [22.481709, 113.922643],
//   [22.484565, 113.938779]
// ]

// const historyLatLngList: [number, number][] = [
//   [22.433482, 113.893976],
//   [22.442922, 113.915863],
//   [22.454663, 113.924875],
//   [22.460453, 113.927021]
// ]

const ContingencyPlanShow: React.FC<Props> = ({ id, activeKey }) => {
  console.debug('ContingencyPlanShow')


  const dispatch = useAppDispatch()

  const [data, setData] = useState<any[]>([])


  // 获取演示数据
  useEffect(() => {

    setData([])
    return () => {

    }
  }, [id])

  // 绘制模拟目标轨迹
  useEffect(() => {


    return () => {

    }
  }, [data])


  // 绘制演示数据 临时触发
  // useEffect(() => {
  //   if (!map2d) return

  //   const layer = createPlanManagementMap(shipLatLng, latLngList,
  //     <WarnMapInfo text={'粤蛇渔运8888'} textColor={'#fff'} isNotOpenWindow={true} />,
  //     <WarnMapInfo text={'超速'} textColor={'#fff'} themeColor={'#ffa940'} customIcon={<span className={`iconfont icon-lingdang ${styles.icon}`} style={{ color: '#ffa940' }}></span>} isNotOpenWindow={true} />,
  //     (data: any) => {
  //       const { index } = data || {}
  //       return <SvgPic pic={planDestinationSvga} svagid={`planDestinationSvga${index}`} option={{ height: '72px', width: '72px', borderRadius: '30px' }} />
  //     },
  //     (data: any) => {
  //       const { index } = data || {}
  //       return <PlanManagementPopup data={{ index }} />
  //     },
  //     map2d,
  //     historyLatLngList
  //   )

  //   return () => {
  //     layer && layer()
  //   }
  // }, [map2d, planDestinationSvga])

  // 更新页面窗口打开标识
  useEffect(() => {
    dispatch(setShowPlanView(true))
    return () => {
      dispatch(resetShowPlanView())
    }
  }, [dispatch])


  const items: TabsProps['items'] = [{
    key: '1',
    label: '高危目标',
    children: <HighRiskTarget />,
  }, {
    key: '2',
    label: '研判记录',
    children: <JudgmentRecord />,
  }]


  return (
    <article className={styles.wrapper}>
      <Tabs items={items} defaultActiveKey={activeKey || '2'} destroyInactiveTabPane={true} />
    </article>
  )
}

export default ContingencyPlanShow