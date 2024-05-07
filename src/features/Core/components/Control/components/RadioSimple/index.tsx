import { Radio, RadioChangeEvent, RadioProps } from "antd"
import React, { useState } from "react"
import { useEffect } from "react"
import NumericInput from "./NumericInput"

interface IRadioProps extends RadioProps {
  /** 下拉组件的参数 */
  options?: any
  onChange?: (e: any) => void
  /** 值 */
  value?: any
  /** 前缀与后缀文字 */
  prefixSuffix?: string[]
  /** 获取input中的值 */
  inputFunc?: Function
  /** 副输入框值 */
  suffixValue: string
}

/** 单选组件 */
const RadioSimple: React.FC<IRadioProps> = ({ options, value, onChange, prefixSuffix, inputFunc, suffixValue }) => {
  console.debug('RadioSimple')

  const [speed, setSpeed] = useState<string>(suffixValue || '')

  useEffect(() => {
    console.log(value, "value")
  }, [value])

  function handleOnChange({ target: { value } }: RadioChangeEvent) {
    value !== '3' && setSpeed('')
    onChange && onChange(value)
  }

  useEffect(() => {
    if (inputFunc && speed) inputFunc(speed)
  }, [inputFunc, speed])

  return (
    <Radio.Group value={value} onChange={handleOnChange}>
      {
        options.map((item: { value: any, name: string }, index: Number) => {
          return (
            <React.Fragment key={'radios_' + index}>
              <Radio value={item?.value}>{`${item?.name}${item?.value === '3' && prefixSuffix?.length ? prefixSuffix[0] : ''}`}</Radio>
              {value === '3' && item?.value === '3' &&
                <span>
                  <NumericInput style={{ width: 120 }} placeholder={'请输入航速'} value={speed} onChange={setSpeed} suffix={prefixSuffix?.length ? prefixSuffix[1] : ''} />
                </span>
              }
            </React.Fragment>
          )
        })
      }
    </Radio.Group>
  )
}

export default RadioSimple