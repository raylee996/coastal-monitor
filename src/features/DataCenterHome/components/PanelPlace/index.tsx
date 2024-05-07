import { Carousel, Select, Tooltip } from "antd";
import { useAppDispatch } from "app/hooks";
import dayjs from "dayjs";
import { YMDHms } from "helper";
import { useEffect, useState } from "react";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getPlaceCameraList, getAllPlaceList, getEntryExitLog } from "server/situation";
import { getAreaAlarmRankData } from "server/statistics";
import { setIndex } from "slice/funMenuSlice";
import CardButton from "../CardButton";
import CardTitle from "../CardTitle";
import CardTitleMin from "../CardTitleMin";
import PlayerCarousel from "../PanelVideo/components/PlayerCarousel";
import AlarmCard from "./components/AlarmCard";
import EntryExitCard from "./components/EntryExitCard";
import styles from "./index.module.sass";


const optionsA = [{
  name: '今日',
  value: 0
}, {
  name: '近一周',
  value: 2
}, {
  name: '近一月',
  value: 3
}]

const optionsB = [{
  name: '今日',
  value: 0
}, {
  name: '近一周',
  value: 2
}, {
  name: '近一月',
  value: 3
}]

const PanelPlace: React.FC = () => {
  console.debug('PanelPlace')


  const navigate = useNavigate();
  const dispatch = useAppDispatch()


  const [placeOptions, setPlaceOptions] = useState<any[]>()
  const [placeId, setPlaceId] = useState<any>()
  const [entryExitList, setEntryExitList] = useState<any[]>()
  const [entryExitRange, setEntryExitRange] = useState(0)
  const [alarmList, setAlarmList] = useState<any[]>()
  const [alarmRange, setAlarmRange] = useState(2)
  const [cameraList, setCameraList] = useState<any[]>([])

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
    const times = setInterval(()=>{
      let data = localStorage.getItem('skin')
      if(data) {
        let param = JSON.parse(data)
        if(param.sun && !param.moon ) {
          setIsWhite(true)
        } 
        if(!param.sun && param.moon ) {
          setIsWhite(false)
        }
        if(param.auto) {
          let date = new Date()
          let hour = date.getHours()
          if (hour >= 18 || hour <= 6) {
            setIsWhite(false)
          } else {
            setIsWhite(true)
          }
        }
      }
    },1000)
    return () => clearInterval(times)
  },[])


  // 获取重点场所下拉数据
  useEffect(() => {
    let signal: AbortController
    async function main() {
      signal = new AbortController()
      const _placeList = await getAllPlaceList(signal) as any[]
      const riskClassNameList = [
        styles.riskType1,
        styles.riskType2,
        styles.riskType3,
        styles.riskType4
      ]
      if (_placeList.length !== 0) {
        const _placeOptions = _placeList.map((item: any) => {
          const riskClassName = riskClassNameList[item.level - 1]
          return {
            label: <div className={styles.selectItem}>
              <Tooltip placement="leftTop" title={item.name}>
                <span className={riskClassName} >[{item.levelName}]</span><span>{item.name}</span>
              </Tooltip>
            </div>,
            value: item.id
          }
        })
        setPlaceOptions(_placeOptions)
        setPlaceId(_placeList[0].id)
      }
    }
    main()
    return () => {
      signal && signal.abort()
    }
  }, [])

  // 进出港统计
  useEffect(() => {
    let signal: AbortController
    async function main() {
      signal = new AbortController()
      const vo = await getEntryExitLog(entryExitRange, signal)
      setEntryExitList(vo)
    }
    main()
    return () => {
      signal && signal.abort()
    }
  }, [entryExitRange])

  // 预警排行
  useEffect(() => {
    let signal: AbortController
    async function main() {
      signal = new AbortController()
      const vo = await getAreaAlarmRankData(alarmRange, signal)
      setAlarmList(vo)
    }
    main()
    return () => {
      signal && signal.abort()
    }
  }, [alarmRange])

  // 根据场所获取场所视频
  useEffect(() => {
    let ctr: AbortController
    async function main() {
      ctr = new AbortController()
      const vo = await getPlaceCameraList({ placeId }, ctr)
      setCameraList(vo)
    }
    main()
    return () => {
      ctr && ctr.abort()
    }
  }, [placeId])


  const handleEntryExit = useCallback(
    (param: any) => {
      setEntryExitRange(param)
    },
    [],
  )

  const handlePlace = useCallback(
    (param: any) => {
      setPlaceId(param)
    },
    [],
  )

  const handleAlarm = useCallback(
    (param: any) => {
      setAlarmRange(param)
    },
    [],
  )

  const handleGoEntryExit = useCallback(
    (data: any) => {
      let range: [string, string]
      switch (alarmRange) {
        case 0:
          range = [dayjs().hour(0).minute(0).second(0).format(YMDHms), dayjs().format(YMDHms)]
          break;
        case 2:
          range = [dayjs().subtract(7, 'd').format(YMDHms), dayjs().format(YMDHms)]
          break;
        case 3:
          range = [dayjs().subtract(30, 'd').format(YMDHms), dayjs().format(YMDHms)]
          break;
        default:
          range = [dayjs().hour(0).minute(0).second(0).format(YMDHms), dayjs().format(YMDHms)]
          break;
      }
      navigate('core', {
        replace: true,
        state: {
          id: String(data.placeId),
          range: range
        }
      })
      dispatch(setIndex(4))
    },
    [alarmRange, navigate, dispatch]
  )


  return (
    <article className={isWhite ? `${styles.wrapper} data_center` : styles.wrapper}>
      <CardTitle text="重点场所数据" />
      <article className={styles.content}>
        <section>
          <CardTitleMin>场所视频</CardTitleMin>
          <header className={styles.placeName}>
            <span className={styles.selectLabel}>重点场所名称</span>
            {placeOptions &&
              <Select
                className={styles.placeSelect}
                options={placeOptions}
                onChange={handlePlace}
                value={placeId}
                size='small'
              />
            }
          </header>
          <article className={styles.cardContent} style={{ height: '96px' }}>
            {cameraList.length === 0
              ? <div className={styles.placeCameraAlt}>场所无相关设备</div>
              : <div className={styles.placeVideo}>
                <PlayerCarousel list={cameraList} />
              </div>
            }
          </article>
        </section>
        <section>
          <CardTitleMin>进出港统计</CardTitleMin>
          <header>
            <div>
              <CardButton options={optionsA} defaultValue={0} onChange={handleEntryExit} />
            </div>
          </header>
          <article className={styles.cardContent}>
            {entryExitList &&
              <Carousel
                dotPosition="left"
                autoplay={true}
                dots={false}
                slidesToShow={3}
                slidesToScroll={1}
                autoplaySpeed={4000}
              >
                {entryExitList.map(item =>
                  <EntryExitCard key={item.placeName} data={item} onClick={handleGoEntryExit} />
                )}
              </Carousel>
            }
          </article>
        </section>
        <section>
          <CardTitleMin>场所预警排行</CardTitleMin>
          <header>
            <div>
              <CardButton options={optionsB} defaultValue={2} onChange={handleAlarm} />
            </div>
          </header>
          <article className={styles.cardContent}>
            {alarmList &&
              <Carousel
                dotPosition="left"
                autoplay={true}
                dots={false}
                slidesToShow={3}
                slidesToScroll={1}
                autoplaySpeed={4000}
              >
                {alarmList.map((item, index) =>
                  <AlarmCard key={item.id} data={item} index={index} />
                )}
              </Carousel>
            }
          </article>
        </section>
      </article>
    </article>
  )
}

export default PanelPlace