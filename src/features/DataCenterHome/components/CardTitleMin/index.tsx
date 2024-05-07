import { useMemo,useState,useEffect} from "react";
import styles from "./index.module.sass";

interface Props {
  className?: string
  children: string
  onClick?: () => void
}

const CardTitleMin: React.FC<Props> = ({ className, children, onClick }) => {
  console.debug('CardTitleMin')
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

  const articleClass = useMemo(() =>  isWhite ? `${styles.wrapper} ${styles.day} ${className}` : `${styles.wrapper} ${styles.night} ${className}`, [isWhite,className])

  return (
    <article className={articleClass} onClick={onClick}>{children}</article>
  )
}

export default CardTitleMin