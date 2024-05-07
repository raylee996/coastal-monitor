import { DatePicker } from "antd";
import dayjs, { Dayjs } from 'dayjs';
import React, { useCallback, useEffect, useState } from "react";
import { RangePickerDateProps } from "antd/lib/date-picker/generatePicker";
import { DayjsRange } from "hooks/hooks";


interface Props extends Omit<RangePickerDateProps<Dayjs>, 'value' | 'onChange'> {
  /** 受控属性 */
  value?: DayjsRange
  /** 禁用当前时间往前一段时间的日期 */
  disabledBefore?: number
  /** 可选时间跨度，单位：天。如：20，即可选时间跨度为0-20天 */
  disabledRangeDays?: number
  /** 是否禁用当前时间和往后的日期 */
  isDisabledTodayAfter?: boolean
  /** 是否禁用当前时间往后的日期 */
  isDisabledAfter?: boolean
  /** 值变化时的回调函数 */
  onChange?: (values: DayjsRange, formatString: [string, string]) => void
  /** 选择日期面版关闭后，取值的回调 */
  onFinish?: (rangeString: [string, string]) => void
}

const DateRangeSimple: React.FC<Props> = ({
  value,
  disabledBefore,
  disabledRangeDays,
  isDisabledAfter,
  isDisabledTodayAfter,
  onChange,
  onFinish,
  ...pickerProps }) => {
  console.debug('DateRangeSimple')


  const [realValue, setRealValue] = useState<DayjsRange>()
  const [dates, setDates] = useState<DayjsRange>()


  useEffect(() => {
    setRealValue(dates || value)
  }, [dates, value])


  const handleDisabledDate = useCallback(
    (current: Dayjs) => {
      let result = false
      if (isDisabledTodayAfter) {
        result = !current.isBefore(dayjs(), 'day')
      } else if (isDisabledAfter) {
        result = current.isAfter(dayjs(), 'day')
      }
      if (result === false && disabledBefore) {
        result = current.isBefore(dayjs().subtract(disabledBefore, "day"), 'day')
      }
      if (disabledRangeDays && dates) {
        const tooLate = dates[0] && current.diff(dates[0], 'days') > disabledRangeDays
        const tooEarly = dates[1] && dates[1].diff(current, 'days') > disabledRangeDays
        return !!tooEarly || !!tooLate
      }
      return result
    },
    [isDisabledAfter, isDisabledTodayAfter, disabledBefore, disabledRangeDays, dates]
  )

  const handleChange = useCallback(
    (val: DayjsRange, formatString: [string, string]) => {
      setRealValue(val)
      onChange && onChange(val, formatString)
    },
    [onChange]
  )

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (onFinish && isOpen === false && realValue) {
        const [start, end] = realValue
        if (start && end) {
          const formatString = 'YYYY-MM-DD HH:mm:ss'
          const result: [string, string] = [start.format(formatString), end.format(formatString)]
          onFinish(result)
        }
      }
    },
    [onFinish, realValue]
  )


  return (
    <article>
      <DatePicker.RangePicker
        value={realValue}
        onChange={handleChange}
        disabledDate={handleDisabledDate}
        onCalendarChange={(val: any) => setDates(val)}
        onOpenChange={handleOpenChange}
        getPopupContainer={triggerNode => triggerNode}
        {...pickerProps}
      />
    </article>
  )
}

export default DateRangeSimple;
