import styles from "./index.module.sass";
import level1Src from 'images/situation/dark/risk_level_01.png'
import level2Src from 'images/situation/dark/risk_level_02.png'
import level3Src from 'images/situation/dark/risk_level_03.png'
import level0Src from 'images/situation/dark/risk_level_other.png'
import { useCallback, useMemo ,useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import popup from "hooks/basis/Popup";
import HOCPlaceInfo from "./components/HOCPlaceInfo";



interface Props {
  data: any
  index: number
}

const AlarmCard: React.FC<Props> = ({ data, index }) => {
  console.debug('AlarmCard')


  const navigate = useNavigate();
  const [isWhite, setIsWhite] = useState(()=>{
    let date = new Date()
    let hour = date.getHours()
    if(hour>=18||hour<=6) {
      return false
    } else{
      return true
    }
  })

  useEffect(()=>{
    const timer = setInterval(()=>{
      let data = localStorage.getItem('skin')
      if(data) {
        let param = JSON.parse(data)
        if(!param.auto){
          return
        }
      }
      let date = new Date()
      let hour = date.getHours()
      if(hour>=18||hour<=6) {
        setIsWhite(false)
      } else {
        setIsWhite(true)
      }
    },1000*60*10)
    return () => clearInterval(timer)
  },[])

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

  const imgSrc = useMemo(() => {
    let result: string
    switch (index) {
      case 0:
        result = level1Src
        break;
      case 1:
        result = level2Src
        break;
      case 2:
        result = level3Src
        break;
      default:
        result = level0Src
        break;
    }
    return result
  }, [index])


  const handleClick = useCallback(
    () => {
      navigate('dataCenter/placeTable')
      popup(<HOCPlaceInfo id={data.id} />, {
        title: '查看重点场所详情',
        size: "fullscreen"
      })
    },
    [data, navigate]
  )


  return (
    <article className={styles.wrapper} onClick={handleClick}>
      <aside className={isWhite? styles.bkwhite :styles.bk} />
      <img className={styles.img} src={imgSrc} alt="" />
      <section className={isWhite? styles.namewhite : styles.name}>{data.name}</section>
      <section className={styles.count}>{data.warnNum}</section>
    </article>
  )
}

export default AlarmCard