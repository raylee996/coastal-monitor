import { DatePicker } from "antd";
import React, { useCallback, useEffect, useState } from "react";
import { PickerDateProps } from "antd/lib/date-picker/generatePicker";
import dayjs, { Dayjs } from 'dayjs';
import _ from "lodash";


const formatString = 'YYYY-MM-DD HH:mm:ss'

type DateTimeValue = string | Dayjs

interface Props extends Omit<PickerDateProps<Dayjs>, 'value' | 'onChange'> {
  /** 受控属性，格式 YYYY-MM-DD */
  value?: DateTimeValue
  /** 值变化时的回调函数 */
  onChange?: (value: string) => void

  /** 是否禁用当前时间和往后的日期 */
  isDisabledTodayAfter: boolean
  /** 是否禁用当前时间往后的日期 */
  isDisabledAfter: boolean
}

const DateTimeSimple: React.FC<Props> = ({ value, onChange, isDisabledTodayAfter, isDisabledAfter, ...pickerDateProps }) => {
  console.debug('DateTimeSimple')


  const [realValue, setRealValue] = useState<Dayjs>()

  const handleDisabledDate = useCallback((current: Dayjs) => {
    if (isDisabledAfter) {
      return current > dayjs().endOf("day")
    } else if (isDisabledTodayAfter) {
      return current > dayjs().subtract(1, "day").endOf("day")
    } else {
      return false
    }
  }, [isDisabledAfter, isDisabledTodayAfter])

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
  }, [value])

  function handleChange(value: Dayjs | null, dateString: string) {
    onChange && onChange(dateString)
  }

  return (
    <article>
      <DatePicker
        value={realValue}
        onChange={handleChange}
        showTime={true}
        disabledDate={handleDisabledDate}
        getPopupContainer={triggerNode => triggerNode}
        {...pickerDateProps}
      />
    </article>
  );
};

export default DateTimeSimple;
