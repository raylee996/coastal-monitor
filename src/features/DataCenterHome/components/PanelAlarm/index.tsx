import { Carousel,Button } from "antd";
import { useAppDispatch } from "app/hooks";
import windowUI from "component/WindowUI";
import VideoWarning from "features/Core/components/WarningModel/components/VideoWarning";
import WarningDetail from "features/Core/components/WarningModel/components/WarningDetail";
// import { warningTypeDict } from "helper/dictionary";
import EchartPanel from "hooks/flexibility/EchartPanel";
import { useCallback, useEffect, useState, useRef } from "react"
import { useNavigate } from "react-router-dom";
import { doQueryNewWarn } from "server/alarm";
import { doGetWarningDataLine, doGetWarningDataPie } from "server/situation";
import { getDictDataByType } from "server/system";
import { setIndex } from "slice/funMenuSlice";
import CardButton from "../CardButton"
import CardSelect from "../CardSelect"
import CardTitle from "../CardTitle"
import CardTitleMin from "../CardTitleMin";
import AlarmCard from "./components/AlarmCard";
import TotalShow from "./components/TotalShow";
import styles from "./index.module.sass";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { CarouselRef } from "antd/lib/carousel";

const options = [{
  name: '近一周',
  value: 'week'
}, {
  name: '近一月',
  value: 'month'
}, {
  name: '今年',
  value: 'quarter'
}]

interface Props {
  onAlarm?: (data: any[]) => void
}

const PanelAlarm: React.FC<Props> = ({ onAlarm }) => {
  console.debug('PanelAlarm')


  const navigate = useNavigate();
  const dispatch = useAppDispatch()


  const [warnType, setWarnType] = useState(-1)
  const [rangeType, setRangeType] = useState('week')
  const [chartOptionA, setChartOptionA] = useState<any>()
  const [chartOptionB, setChartOptionB] = useState<any>()
  const [total, setTotal] = useState<number>()
  const [alarmList, setAlarmList] = useState<any[]>([])
  const [warningTypeDict, setWarningTypeDict] = useState<any>([]) // 预警类型字典
  const carouselRef = useRef<CarouselRef>(null)


  useEffect(() => {
    let signal: AbortController
    async function main() {
      const dto = {
        dateTime: rangeType,
        warningType: warnType
      }
      signal = new AbortController()
      const optionB = await doGetWarningDataLine(dto, signal)
      const vo: any = await doGetWarningDataPie(dto, signal)
      // 获取预警类型字典
      const warnTypeDict = await getDictDataByType("monitor_type")

      setChartOptionB(optionB)
      setChartOptionA(vo.options)
      setTotal(vo.total)
      // 添加一个总计
      setWarningTypeDict([{ name: "总计", value: -1 }, ...warnTypeDict])
    }
    main()
    return () => {
      signal && signal.abort()
    }
  }, [warnType, rangeType])

  useEffect(() => {
    const dto = {}
    const _worker = doQueryNewWarn(dto, (res: any) => {
      if (res.code === 200) {
        const vo: any[] = res.data.records
        const _alarmList = vo.map(item => ({
          ...item,
          title: item.eventName ? `${item.eventName}-${item.monitorName}` : item.monitorName,
          src: item.warnPic,
          shipLicense: item.warnContent,
          address: item.warnAddr,
          time: item.warnTime
        }))
        setAlarmList(_alarmList)
        onAlarm && onAlarm(vo)
      } else {
        _worker.terminate()
      }
    })

    return () => {
      _worker && _worker.terminate()
    }
  }, [onAlarm])


  const handleTimeRange = useCallback((param: any) => {
    setRangeType(param)
  }, [])

  const handleType = useCallback((param: any) => {
    setWarnType(param)
  }, [])

  const handleAlarm = useCallback((data: any) => {
    navigate('core')
    // dispatch(setIndex(2))
    // dispatch(setParams({
    //   alarmId: data.id
    // }))
    data.monitorType === '05'
      ? windowUI(<VideoWarning id={data.id} />, { title: `视频预警`, key: '预警详情', width: '1330px', height: '800px', offset: [550, 40] })
      : windowUI(<WarningDetail id={data.warnContent} contentType={data.contentType} parentDate={data} />, { title: `预警详情`, key: '预警详情', width: '480px', height: '800px', offset: [1400, 40] })
  }, [navigate])

  const handleClick = useCallback(
    () => {
      navigate('dataCenter/totalData')
    },
    [navigate]
  )

  const handleClickTitle = useCallback(
    () => {
      navigate('core')
      dispatch(setIndex(2))
    },
    [dispatch, navigate],
  )
  function handleLeft() {
    carouselRef.current?.prev()
  }

  function handleRight() {
    carouselRef.current?.next()
  }


  return (
    <article className={styles.wrapper}>

      <CardTitle text='预警数据' />

      <section className={styles.content}>

        <section className={styles.card}>
          <header className={styles.cardHeader}>
            <div>
              <CardSelect
                label="预警类型"
                dict={warningTypeDict}
                defaultValue={warnType}
                onChange={handleType}
              />
            </div>
            <div>
              <CardButton
                options={options}
                defaultValue={rangeType}
                onChange={handleTimeRange}
              />
            </div>
          </header>
          <section className={styles.box}>
            <div className={styles.chart} onClick={handleClick}>
              <TotalShow className={styles.total} value={total} />
              <EchartPanel option={chartOptionA} />
            </div>
            <div className={styles.chart} onClick={handleClick}>
              <EchartPanel option={chartOptionB} />
            </div>
          </section>
        </section>

        <section className={styles.card}>
          <CardTitleMin className={styles.alarmTitle} onClick={handleClickTitle}>最近预警</CardTitleMin>
          <section className={styles.box}>
            <Carousel
              autoplay={true}
              dotPosition='bottom'
              dots={false}
              ref={carouselRef}
            >
              {alarmList!.map(item => <AlarmCard key={item.id} data={item} onClick={handleAlarm} />)}
            </Carousel>
          </section>
          <Button className={styles.prev} type='link' icon={<LeftOutlined />} onClick={handleLeft}></Button>
          <Button className={styles.next} type='link' icon={<RightOutlined />} onClick={handleRight}></Button>
        </section>

      </section>

    </article>
  )
}

export default PanelAlarm