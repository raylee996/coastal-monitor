import EchartPanel from "hooks/flexibility/EchartPanel";
import { useCallback, useEffect, useState } from "react";
import CardTitleMin from "../CardTitleMin";
import CountCard from "../CountCard";
import styles from "./index.module.sass";
import aisSrc from 'images/situation/dark/collection_ais.png'
import carSrc from 'images/situation/dark/collection_car.png'
// import faceSrc from 'images/situation/dark/collection_face.png'
import unAisSrc from 'images/situation/dark/collection_unais.png'
// import unAisSrcwhite from 'images/situation/dark/collection_unais_white.png'
import aisSrcwhite from 'images/situation/dark/AIS_white.png'
import carSrcwhite from 'images/situation/dark/car_white.png'
// import faceSrcwhite from 'images/situation/dark/face_white.png'
// import unAisSrcwhite from 'images/situation/dark/phone_white.png'
import CardTitle from "../CardTitle";
import { doGetCollectionDataV2, doGetTodayFirstCountV2 } from "server/situation";
import { useNavigate } from "react-router-dom";
import XcEmpty from "component/XcEmpty";



const PanelCollection: React.FC = () => {
  console.debug('PanelCollection')


  const navigate = useNavigate();
  const [isOption, setIsOption] = useState(false)

  const [option, setOption] = useState<any>()
  const [count, setCount] = useState({
    ais: '',
    unAis: '',
    face: '',
    car: ''
  })
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


  useEffect(() => {
    let signal: AbortController
    async function main() {
      signal = new AbortController()

      const _option = await doGetCollectionDataV2(signal)
      const vo = await doGetTodayFirstCountV2(signal)

      if (_option.series[0].data === 0 && _option.series[1].data === 0 && _option.series[2].data === 0 && _option.series[3].data === 0) {
        setIsOption(true)
      } else {
        setIsOption(false)
      }
      setOption(_option)
      setCount(vo)
    }
    main()
    return () => {
      signal && signal.abort()
    }
  }, [])


  const handleClick = useCallback(
    () => {
      navigate('dataCenter/collectionData')
    },
    [navigate],
  )



  return (
    <article className={styles.wrapper}>

      <CardTitle text="采集数据" />

      <section className={styles.chart} onClick={handleClick}>
        {isOption ? <XcEmpty option={{ height: '30px' }} /> : <EchartPanel option={option} />}
      </section>

      <CardTitleMin>今日首次出现数据</CardTitleMin>

      <section className={styles.count}>
        <CountCard className={styles.countCard} src={isWhite ? aisSrcwhite : aisSrc} value={count.ais} label='AIS' />
        <CountCard className={styles.countCard} src={isWhite ? aisSrcwhite : unAisSrc} value={count.unAis} label='未开AIS' />
        {/* <CountCard className={styles.countCard} src={isWhite? faceSrcwhite : faceSrc} value={count.face} label='人脸' /> */}
        <CountCard className={styles.countCard} src={isWhite ? carSrcwhite : carSrc} value={count.car} label='车牌' />
      </section>

    </article>
  )
}

export default PanelCollection