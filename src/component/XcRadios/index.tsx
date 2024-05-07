import { Radio, RadioChangeEvent } from "antd";
import React, { useEffect } from "react";
import { useState } from "react";
import styles from "./index.module.sass";


interface IRadioButtonsProps {
  defaultValue?: any
  option?: any
  onFinish?: any
  /** 受控属性*/
  value?: any
  /** 值变化时的回调函数 */
  onChange?: (value: string) => void
}

export interface RadioBtn {
  /** 选项名 */
  name: string
  /** 选项值 */
  value: string
}

const XcRadios: React.FC<IRadioButtonsProps> = ({ value, option, onFinish, onChange }) => {
  console.debug('XcRadios')


  const [myVal, setMyVal] = useState(() => {
    onChange && onChange(value)
    return value
  })

  // 按钮组
  const [radioBtns, setRadioBtns] = useState<RadioBtn[]>([])

  useEffect(() => {
    if (option.data.constructor.name === 'Array') {
      setRadioBtns(option.data)
    } else {
      option.data().then((result: any) => {
        setRadioBtns(result)
      })
    }
  }, [option, option.data])


  useEffect(() => {
    setMyVal(value)
  }, [value])

  function handleOnChange({ target: { value } }: RadioChangeEvent) {
    if (onFinish) {
      onFinish(value)
    }
    setMyVal(value)
    onChange && onChange(value)
  }

  return (
    <div className={styles.wrapper}>
      <Radio.Group value={myVal} name="radiogroup" onChange={handleOnChange} >
        {
          radioBtns.map((item, index: Number) => {
            return (
              <React.Fragment key={'xc_radios_' + index}>
                <Radio value={item?.value}>{item?.name}</Radio>
              </React.Fragment>
            )
          })
        }
      </Radio.Group>
    </div>
  )
}

export default XcRadios