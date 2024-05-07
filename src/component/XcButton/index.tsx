import React from "react";
import styles from './index.module.sass'
interface Props{
  type?: 'primary' | 'default'
  onClick?:Function
  label: String
  style?: any
}
const XcButton:React.FC<Props> = ({type,onClick,label,style})=>{
  function handlerClick(){
    onClick && onClick()
  }
  return<>
    { (type && type==='default') && <span onClick={handlerClick} style={style} className={`${styles.xcBtn} ${styles.xcBtnDefault}`}>{label}</span>}
    { (type && type==='primary') && <span onClick={handlerClick} style={style} className={`${styles.xcBtn} ${styles.xcBtnPrimary}`}>{label}</span>}
  </>
}

export default XcButton
