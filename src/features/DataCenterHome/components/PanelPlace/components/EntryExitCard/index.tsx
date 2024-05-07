import styles from "./index.module.sass";
import shipSrc from 'images/situation/dark/ship_type_02.png'
import shipSrcwhite from 'images/situation/dark/youtings.png'
import { useEffect, useState } from "react";
import { useCallback } from "react";


interface Props {
  data: any
  onClick?: (data: any) => void
}

const EntryExitCard: React.FC<Props> = ({ data, onClick }) => {
  console.debug('EntryExitCard')


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


  const handleClick = useCallback(
    () => {
      onClick && onClick(data)
    },
    [data, onClick],
  )


  return (
    <article className={styles.wrapper} onClick={handleClick}>
      <aside className={isWhite? styles.bkwhite :styles.bk} />
      <img className={styles.img} src={ isWhite?shipSrcwhite: shipSrc} alt="" />
      <section className={isWhite? styles.namewhite : styles.name}>{data.placeName}</section>
      <section className={styles.in}>
        <span>{data.entry}</span>
        <span style={isWhite ? { color: '#28e29a' } : {}}>进港</span>
      </section>

      <section className={styles.out}>
        <span>{data.exit}</span>
        <span style={isWhite ? { color: '#ffa810' } : {}}>出港</span>
      </section>

    </article>
  )
}

export default EntryExitCard