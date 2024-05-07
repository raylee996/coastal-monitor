import React, { useState } from "react";
import { Radio, RadioGroupProps } from 'antd';
import { Type } from "../../../helper/dictionary";

interface Props extends RadioGroupProps {
  /** 单选组件的可选项字典类型 */
  dict: Type<any>[]
}
const RadioSimple: React.FC<Props> = ({ dict, ...radioProps }) => {
  console.debug('RadioSimple')

  const [options] = useState<any[]>(() => {
    const result = dict.map(type => ({ ...type, label: type.name }))
    return result
  })

  return <>
    <Radio.Group options={options} {...radioProps} />
  </>
}

export default RadioSimple
