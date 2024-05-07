import { useMemo, useState, useEffect } from "react";
import styles from "./index.module.sass";


interface Props {
  text: string
}

const CardTitle: React.FC<Props> = ({ text }) => {
  console.debug('CardTitle')
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

  const articleClass = useMemo(() => {
    let result = styles.wrapper
    switch (text) {
      case '预警数据':
        result = isWhite ? styles.alarmTitle_white : styles.alarmTitle
        break;
      case '重点目标数据':
        result = isWhite ? styles.targetTitle_white : styles.targetTitle
        break;
      case '布控数据':
        result = isWhite ? styles.controlTitle_white : styles.controlTitle
        break;
      case '实时船舶数据':
        result = isWhite ? styles.shipTitle_white : styles.shipTitle
        break;
      case '采集数据':
        result = isWhite ? styles.collectionTitle_white : styles.collectionTitle
        break;
      case '实时数据':
        result = isWhite ? styles.alarmTitle_white : styles.alarmTitle
        break;
      case '实时视频':
        result = isWhite ? styles.videoTitle_white : styles.videoTitle
        break;
      case '重点场所数据':
        result = isWhite ? styles.placeTitle_white : styles.placeTitle
        break;
      case '实时人车数据':
        result = isWhite ? styles.personWhite : styles.personNight
        break;
      default:
        break;
    }
    return result
  }, [text, isWhite])


  return (
    <article className={articleClass} />
  )
}

export default CardTitle