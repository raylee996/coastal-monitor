import { Radio, InputNumber, DatePicker, RadioGroupProps } from 'antd';
import React, { useState, useCallback } from 'react';
import dayjs from "dayjs";
import { DayjsPair } from 'hooks/hooks';
// import { YMDHms } from "helper";


const { RangePicker } = DatePicker;

interface Props extends Omit<RadioGroupProps, 'value' | 'onChange'> {
  onChange: (val: DayjsPair) => void
  value: DayjsPair
}

const BackTime: React.FC<Props> = ({ value, onChange, ...othProps }) => {
  console.debug('BackTime')


  const [timeType, setTimeType] = useState(1)
  const [minutes, setMinutes] = useState(30)
  const [hours, setHours] = useState(1)
  const [rangTime, setRangTime] = useState(value)


  // 切换时间类型
  const handleRadio = useCallback((e: any) => {
    setTimeType(e.target.value)

    let range: any = []
    if (e.target.value === 1) {
      range = [dayjs().subtract(minutes, 'm'), dayjs()]
      setRangTime([dayjs().subtract(minutes, 'm'), dayjs()])
    }

    if (e.target.value === 2) {
      range = [dayjs().subtract(hours, 'h'), dayjs()]
      setRangTime([dayjs().subtract(hours, 'h'), dayjs()])
    }

    if (e.target.value === 3) {
      range = [rangTime[0], rangTime[1]]
    }

    onChange(range)
  }, [minutes, hours, rangTime, onChange])

  // 近多少分钟
  const handleMinute = useCallback((e: any) => {
    const _rangTime: DayjsPair = [dayjs().subtract(e, 'm'), dayjs()]
    setMinutes(e)
    setRangTime(_rangTime)
    timeType === 1 && onChange(_rangTime)
  }, [onChange, timeType])

  // 近多少小时
  const handleHours = useCallback((e: any) => {
    const _rangTime: DayjsPair = [dayjs().subtract(e, 'h'), dayjs()]
    setHours(e)
    setRangTime(_rangTime)
    timeType === 2 && onChange(_rangTime)
  }, [onChange, timeType])

  // 自定义时间范围
  const handleTime = useCallback((e: any) => {
    setRangTime(e)
    timeType === 3 && onChange(e)
  }, [onChange, timeType])


  return (
    <Radio.Group onChange={handleRadio} value={timeType} {...othProps}>
      <Radio value={1} >
        近
        <InputNumber
          min={1}
          max={60}
          size='small'
          style={{ width: '50px' }}
          value={minutes}
          onChange={handleMinute}
        />
        分钟
      </Radio>

      <Radio value={2}>
        近
        <InputNumber
          min={1}
          max={24}
          size='small'
          style={{ width: '50px' }}
          value={hours}
          onChange={handleHours}
        />
        小时
      </Radio>

      <Radio value={3}>
        自定义
        <RangePicker
          showTime
          defaultValue={[rangTime[0], rangTime[1]]}
          value={[rangTime[0], rangTime[1]]}
          onChange={handleTime}
        />
      </Radio>

    </Radio.Group>
  )
}
export default BackTime