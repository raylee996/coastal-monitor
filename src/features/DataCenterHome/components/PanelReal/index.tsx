import { Carousel } from "antd";
import { useEffect, useState } from "react";
import { doGetRealTimeShipDataStatisticsV2 } from "server/situation";
import CardTitle from "../CardTitle";
import CardTitleMin from "../CardTitleMin";
import DataCard from "./components/DataCard";
import Statistics from "./components/Statistics";
import styles from "./index.module.sass";
// import XcEmpty from "component/XcEmpty";
import './index.sass'


const PanelReal: React.FC = () => {
  console.debug('PanelReal')

  const [countText, setCountText] = useState('未开AIS船舶()')
  const [alarmList, setAlarmList] = useState<any[]>()
  const [data, setData] = useState<any>()
  const [isOption, setIsOption] = useState(false)

  useEffect(() => {
    let signal: AbortController
    async function main() {
      signal = new AbortController()
      const vo = await doGetRealTimeShipDataStatisticsV2(signal)
      setData(vo)
      setCountText(`未开AIS船舶(${vo.noAisCount})`)
      setAlarmList(vo.shipDataRadarDtoList)
      setIsOption(vo.shipDataRadarDtoList.length === 0 ? false : true)
    }
    main()
    const timer = setInterval(()=>{
      main()
    },1000 * 30 * 1)
    return () => {
      signal && signal.abort()
      clearInterval(timer)
    }
  }, [])


  return (
    <article className={styles.wrapper}>
      <CardTitle text='实时船舶数据' />
      <CardTitleMin>船舶统计</CardTitleMin>
      <Statistics data={data} />
      <CardTitleMin>{countText}</CardTitleMin>
      {isOption ?
        <Carousel
          autoplay={true}
          dotPosition='left'
          dots={false}
          className={'carsellist'}
        >
          {alarmList!.map(item => <DataCard key={item.uniqueid} data={item} />)}
        </Carousel> : <div ></div>
      }
    </article>
  )
}

export default PanelReal