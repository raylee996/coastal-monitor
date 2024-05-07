import { useCallback, useEffect, useState } from "react";
import styles from "./index.module.sass";
import SvgPic from 'component/SvgaPic'

interface Data {
  name: string
  value: string
  num: number
  img: string
  bgClass: string
  svgPic: string
  svgId: string
  staticPic: string
}

interface Item extends Data {
  butClass: string
  boxClass: string
}

interface RadioButtonsProps {
  type?: any
  /** 按钮组 */
  data?: Data[]
  /** 默认值 */
  defaultValue?: string
  /** form-值变化时的回调函数 */
  onChange?: (value: string) => void
}

const TabsBtn: React.FC<RadioButtonsProps> = ({ data, defaultValue, onChange, type }) => {
  console.debug("TabsBtn")

  const [active, setActive] = useState<string | undefined>(defaultValue) // 按钮切换项
  const [list, setList] = useState<Item[]>([])


  useEffect(() => {
    if (data) {
      const result = data.map(item => {
        const butClass = item.value === active ? `${styles.btn} ${styles.btnActive}` : styles.btn
        const boxClass = `${styles.btnImg} ${styles[item.bgClass]}`
        return {
          ...item,
          butClass,
          boxClass
        }
      })
      setList(result)
    }
  }, [data, active])


  const handleClick = useCallback(
    (value: string) => {
      setActive(val => {
        if (val === value) {
          return undefined
        } else {
          return value
        }
      })
      onChange && onChange(value)
    },
    [onChange],
  )


  return (
    <div className={styles.wrapper}>

      <div className={`${styles.tabsBtnBox} `}>
        {list.map(item =>
          <div className={`${item.butClass} ${styles.contents}`} key={item.value} >
            {active && active === item.value && <div className={list && list.length === 4 ? styles.topsvg : styles.toptree} style={list && list.length === 4 ? { left: ' 30.3%' } : {}} >
              <SvgPic pic={item.svgPic} svagid={item.svgId} option={{ height: '50px', width: '50px' }} />
            </div>}
            {type === '1' && active !== item.value && <div className={styles.topsvg} style={list && list.length === 4 ? { left: ' 30.3%' } : { left: '35.3%' }}>
              <img src={item.staticPic} alt='' />
            </div>}
            {type === '2' && active !== item.value && <div className={styles.toptree}>
              <img src={item.staticPic} alt='' />
            </div>}
            {type === '3' && active !== item.value && <div className={styles.toptrees}>
              <img src={item.staticPic} alt='' />
            </div>}
            <div
              className={item.boxClass}
              title={item.name}
              onClick={() => { handleClick(item.value) }}
            >
              <span className={styles.itemName}>{item.name}</span>
              <span className={styles.itemTotal}>{item.num}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TabsBtn