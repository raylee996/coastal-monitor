import { DatePicker } from "antd";
import React, { useCallback, useEffect, useState } from "react";
import _ from "lodash";
import { PickerDateProps } from "antd/lib/date-picker/generatePicker";
import dayjs, { Dayjs } from 'dayjs';


type DateValue = Dayjs | string

interface Props extends Omit<PickerDateProps<Dayjs>, 'value' | 'onChange'> {
  /** 受控属性，格式 YYYY-MM-DD */
  value?: DateValue
  /** 值变化时的回调函数 */
  onChange?: (value: string) => void

  /** 是否禁用当前时间和往后的日期 */
  isDisabledTodayAfter: boolean
  /** 是否禁用当前时间往后的日期 */
  isDisabledAfter: boolean
  /** 是否禁用当前时间和往前的日期 */
  isDisabledTodayBefore: boolean
  /** 是否禁用当前时间往前的日期 */
  isDisabledBefore: boolean
}

const DateSimple: React.FC<Props> = ({ value, onChange, isDisabledAfter, isDisabledTodayAfter, isDisabledBefore, ...pickerDateProps }) => {
  console.debug('DateSimple')

  // 日期格式设置
  const [formatString] = useState<any>(pickerDateProps.format ? pickerDateProps.format : 'YYYY-MM-DD')

  const [realValue, setRealValue] = useState<Dayjs>()

  const handleDisabledDate = useCallback((current: Dayjs) => {
    if (isDisabledAfter) {
      return current > dayjs().endOf("day")
    } else if (isDisabledTodayAfter) {
      return current > dayjs().subtract(1, "day").endOf("day")
    } else if (isDisabledTodayAfter) {
      return current < dayjs().endOf("day")
    } else if (isDisabledBefore) {
      return current < dayjs().subtract(1, "day").endOf("day")
    } else {
      return false
    }
  }, [isDisabledAfter, isDisabledTodayAfter, isDisabledBefore])

  useEffect(() => {
    if (value) {
      if (_.isString(value)) {
        setRealValue(dayjs(value, formatString))
      } else {
        setRealValue(value)
      }
    } else {
      setRealValue(undefined)
    }
  }, [value, formatString])

  function handleChange(value: Dayjs | null, dateString: string) {
    onChange && onChange(dateString)
  }

  return (
    <article>
      <DatePicker
        value={realValue}
        onChange={handleChange}
        disabledDate={handleDisabledDate}
        getPopupContainer={triggerNode => triggerNode}
        {...pickerDateProps}
      />
    </article>
  );
};

export default DateSimple;
