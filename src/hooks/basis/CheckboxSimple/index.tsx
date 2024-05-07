import React, { useMemo } from "react";
import { Checkbox } from 'antd';
import { Type } from "../../../helper/dictionary";
import { CheckboxGroupProps } from "antd/lib/checkbox";


interface Props extends CheckboxGroupProps {
  dict: Type<any>[]
}

const CheckboxSimple: React.FC<Props> = ({ dict, ...checkboxGroupProps }) => {
  console.debug('CheckboxSimple')


  const options = useMemo(() => {
    const result = dict.map(type => ({ ...type, label: type.name }))
    return result
  }, [dict])


  return (
    <article>
      <Checkbox.Group
        options={options}
        {...checkboxGroupProps}
      />
    </article>
  )
}

export default CheckboxSimple
