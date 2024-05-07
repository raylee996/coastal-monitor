import { DatePicker, TimePicker, TimeRangePickerProps } from "antd"
import { PickerProps } from "antd/es/date-picker/generatePicker"
import dayjs, { Dayjs } from "dayjs"
import { DayjsPair, DayjsRange, DayjsType } from "hooks/hooks"
import { useCallback, useEffect, useMemo, useState } from "react"


export type DayTimeRangeValue = [DayjsType, DayjsRange]

export type TimePanelType = 'start' | 'end'

interface Props {
  dateProps?: PickerProps<Dayjs>
  timeRangeProps?: TimeRangePickerProps
  value?: DayTimeRangeValue
  onChange?: (val: DayTimeRangeValue) => void
  onRangeDisabledTime?: (date: DayjsType, type: TimePanelType, dates: DayjsRange) => {
    disabledHours?: () => number[];
    disabledMinutes?: (hour: number) => number[];
    disabledSeconds?: (hour: number, minute: number) => number[];
  }
}

const DayTimeRange: React.FC<Props> = ({ onRangeDisabledTime, value, onChange, dateProps, timeRangeProps }) => {
  console.debug('DayTimeRange')


  const [dates, setDates] = useState<DayjsRange>(null)
  const [dateValue, setDateValue] = useState<DayjsType>(() => {
    if (value) {
      const [date] = value
      return date
    } else {
      return null
    }
  })
  const [timeRangeValue, setTimeRangeValue] = useState<DayjsRange>(() => {
    if (value) {
      const timeRange = value[1]
      return timeRange
    } else {
      return null
    }
  })


  useEffect(() => {
    if (value) {
      const [date, timeRange] = value
      setDateValue(date)
      setTimeRangeValue(timeRange)
    } else {
      setDateValue(null)
      setTimeRangeValue(null)
    }
  }, [value])


  const handleChange = useCallback(
    (date: DayjsType, timeRange: DayjsRange) => {
      date && console.log(date.format('YYYY-MM-DD'))
      timeRange && console.log(timeRange[0]?.format('HH:mm:ss'))
      timeRange && console.log(timeRange[1]?.format('HH:mm:ss'))
      if (onChange) {
        onChange([date, timeRange])
        setDateValue(date)
        setTimeRangeValue(timeRange)
      } else {
        setDateValue(date)
        setTimeRangeValue(timeRange)
      }
    },
    [onChange]
  )

  const handleDateChange = useCallback(
    (value: DayjsType) => {
      handleChange(value, timeRangeValue)
    },
    [handleChange, timeRangeValue]
  )

  const handleTimeRangeChange = useCallback(
    (value: DayjsRange) => {
      handleChange(dateValue, value)
    },
    [handleChange, dateValue]
  )

  const handleCalendarChange = useCallback(
    (value: DayjsRange) => {
      setDates(value)
    },
    []
  )


  const handleRangeDisabledTime = useMemo(() => {
    if (onRangeDisabledTime && dates) {
      return (date: DayjsType, type: TimePanelType) => {
        return onRangeDisabledTime(date, type, dates)
      }
    } else {
      return undefined
    }
  }, [onRangeDisabledTime, dates])


  return (
    <article>
      <DatePicker
        value={dateValue}
        onChange={handleDateChange}
        getPopupContainer={triggerNode => triggerNode}
        {...dateProps}
      />
      <TimePicker.RangePicker
        value={timeRangeValue}
        onChange={handleTimeRangeChange}
        disabledTime={handleRangeDisabledTime}
        onCalendarChange={handleCalendarChange}
        getPopupContainer={triggerNode => triggerNode}
        {...timeRangeProps}
      />
    </article>
  )
}


/** 提供将 类型：DayTimeRangeValue 转换为 类型：DayjsPair，的工具函数 */
export const dayTimeRangeToDayjsPair = (daytimeRangeValue: DayTimeRangeValue): DayjsPair => {
  const [date, timeRange] = daytimeRangeValue
  let start = dayjs()
  let end = dayjs()
  if (date) {
    start = start.set('y', date.get('y')).set('M', date.get('M')).set('D', date.get('D'))
    end = start.set('y', date.get('y')).set('M', date.get('M')).set('D', date.get('D'))
  }
  if (timeRange) {
    const [startTime, endTime] = timeRange
    if (startTime) {
      start = start.set('h', startTime.get('h')).set('m', startTime.get('m')).set('s', startTime.get('s'))
    }
    if (endTime) {
      end = end.set('h', endTime.get('h')).set('m', endTime.get('m')).set('s', endTime.get('s'))
    }
  }
  return [start, end]
}


export default DayTimeRange