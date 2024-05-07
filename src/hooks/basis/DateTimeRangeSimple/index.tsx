import { DatePicker } from "antd";
import dayjs, { Dayjs } from 'dayjs';
import React, { useCallback } from "react";
import { RangePickerDateProps } from "antd/lib/date-picker/generatePicker";


interface Props extends RangePickerDateProps<Dayjs> {
  /** 是否禁用当前时间和往后的日期 */
  isDisabledTodayAfter?: boolean
  /** 是否禁用当前时间往后的日期 */
  isDisabledAfter?: boolean
}

const DateTimeRangeSimple: React.FC<Props> = ({ isDisabledAfter, isDisabledTodayAfter, ...rangePickerDateProps }) => {
  console.debug('DateTimeRangeSimple')


  const handleDisabledDate = useCallback((current: Dayjs) => {
    if (isDisabledAfter) {
      return current > dayjs().endOf("day")
    } else if (isDisabledTodayAfter) {
      return current > dayjs().subtract(1, "day").endOf("day")
    } else {
      return false
    }
  }, [isDisabledAfter, isDisabledTodayAfter])


  return (
    <article>
      <DatePicker.RangePicker
        showTime={true}
        disabledDate={handleDisabledDate}
        getPopupContainer={triggerNode => triggerNode}
        {...rangePickerDateProps}
      />
    </article>
  );
};

export default DateTimeRangeSimple;
