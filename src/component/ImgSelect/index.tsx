import { Tooltip } from "antd";
import { getPlaceTypeIconSrc } from "helper";
import { PlaceTypeIconDict, Type } from "helper/dictionary";
import React, { useEffect, useState } from "react";
import styles from "./index.module.sass";


interface IImgSelect {
  /**触发方式 */
  trigger?: any
  /**默认图片 */
  defaultImg?: any
  onFinish?: any

  /** 受控属性*/
  value?: any
  /** 值变化时的回调函数 */
  onChange?: (value: any) => void
}

export type iconProps = { id: string; label: string }

const ImgSelect: React.FC<IImgSelect> = (props) => {
  console.debug("ImgSelect")
  const { value } = props

  const [selectImg, setSelectImg] = useState<Type<string>>({ value: '99', name: '其他' })

  useEffect(() => {
    if (value) {
      const active = PlaceTypeIconDict.find(item => value === item.value)
      setSelectImg(() => {
        return active || { value: '99', name: '其他' }
      })
    }
  }, [value])

  return (
    <div className={styles.wrapper}>
      <Tooltip placement="left" title={selectImg?.name} color='#0b589e'>
        <img className={selectImg?.value === '11' ? styles.otherImg : styles.img} alt={selectImg?.name} width={selectImg?.value === '11' ? '94px' : '28px'} height={selectImg?.value === '11' ? '22px' : '28px'} src={getPlaceTypeIconSrc(selectImg?.value)} />
      </Tooltip>
    </div>
  )
}

export default ImgSelect