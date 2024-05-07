import { useCallback, useState, useEffect } from "react"
import styles from "./index.module.sass";


interface Props {
  defaultValue: number | string
  options: { name: string, value: number | string }[]
  onChange: (value: number | string) => void
}

const CardButton: React.FC<Props> = ({ defaultValue, options, onChange }) => {
  console.debug('CardButton')

  const [initValue] = useState(defaultValue)
  const [tempValue,setTempValue] = useState(defaultValue)
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


  const [realOptions, setRealOptions] = useState(() => options.map(ele => {
    const sassClass =  isWhite ? initValue === ele.value ? styles.buttonActwhite : styles.buttonDefwhite : initValue === ele.value ? styles.buttonAct : styles.buttonDef
    //const sassClass = initValue === ele.value ? styles.buttonAct : styles.buttonDef
    return {
      ...ele,
      sassClass
    }
  }))


  const handleChange = useCallback((param: number | string) => {
    setRealOptions(val => {
      const _val = val.map(ele => {
        // const sassClass = param === ele.value ? styles.buttonAct : styles.buttonDef
        const sassClass =  isWhite ? param === ele.value ? styles.buttonActwhite : styles.buttonDefwhite : param === ele.value ? styles.buttonAct : styles.buttonDef
        return {
          ...ele,
          sassClass
        }
      })
      return _val
    })
    setTempValue(param)
    onChange(param)
  }, [onChange,isWhite])
  useEffect(()=>{
    setRealOptions(val => {
      const _val = val.map(ele => {
        // const sassClass = param === ele.value ? styles.buttonAct : styles.buttonDef
        const sassClass =  isWhite ? tempValue === ele.value ? styles.buttonActwhite : styles.buttonDefwhite : tempValue === ele.value ? styles.buttonAct : styles.buttonDef
        return {
          ...ele,
          sassClass
        }
      })
      return _val
    })
  },[isWhite,tempValue])


  return (
    <article className={styles.wrapper}>
      {realOptions.map(item => <section className={item.sassClass} key={item.name} onClick={() => { handleChange(item.value) }}>{item.name}</section>)}
    </article>
  )
}

export default CardButton