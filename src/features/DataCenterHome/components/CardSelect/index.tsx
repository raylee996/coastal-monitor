import SelectSimple from "hooks/basis/SelectSimple";
import { Type } from "hooks/hooks";
import styles from "./index.module.sass";
import { useState, useEffect } from "react"


interface Props {
  defaultValue: number | string
  label: string
  dict: Type<number | string>[]
  onChange: (value: number) => void
}

const CardSelect: React.FC<Props> = ({ label, dict, defaultValue, onChange }) => {
  console.debug('CardSelect')
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

  return (
    <article className={isWhite ? `${styles.wrapper} data_center` : styles.wrapper }>
      <section className={styles.label}>{label}:</section>
      <section>
        <SelectSimple
          className={styles.select}
          defaultValue={defaultValue}
          dict={dict}
          allowClear={false}
          size='small'
          onChange={onChange}
        />
      </section>
    </article>
  )
}

export default CardSelect