import './index.sass';
import { Slider } from "antd"
import dayjs from "dayjs"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { YMDHms } from 'helper';
import _ from 'lodash';

interface Segment {
  beginTime: string
  endTime: string
}

interface Props {
  beginTime?: string
  endTime?: string
  segments?: Segment[]
  value?: number
  onChange?: (datetime: string, value: number) => void
}

const VideoMultiSegment: React.FC<Props> = ({ beginTime, endTime, segments, value, onChange }) => {
  console.debug('VideoMultiSegment')


  const boxRef = useRef<HTMLElement>(null)


  const [realValue, setRealValue] = useState(0)
  const [isDrag, setIsDrag] = useState(false)


  const max = useMemo(() => {
    const beginDay = dayjs(beginTime)
    const endDay = dayjs(endTime)
    const result = endDay.diff(beginDay, 's')
    return result
  }, [beginTime, endTime])

  const tooltip = useMemo(() => ({
    formatter(val: number | undefined) {
      const beginDay = dayjs(beginTime)
      if (val) {
        return beginDay.add(val, 's').format(YMDHms)
      } else {
        return beginDay.format(YMDHms)
      }
    },
    getPopupContainer() {
      return boxRef.current ? boxRef.current : document.body
    }
  }), [beginTime])

  const uniqueIdClassName = useMemo(() => `VideoMultiSegment__${_.uniqueId()}`, [])

  const sliderClassName = useMemo(() => `VideoMultiSegment__Slider ${uniqueIdClassName}`, [uniqueIdClassName])


  useEffect(() => {
    let sliderEle: Element
    const eleList: HTMLDivElement[] = []
    if (segments) {
      const list = document.getElementsByClassName(uniqueIdClassName)
      if (list.length !== 0) {
        sliderEle = list[0]
        segments.forEach(item => {
          const diff = dayjs(item.endTime).diff(item.beginTime, 's')
          const percent = (diff / max) * 100
          const leftValue = dayjs(item.beginTime).diff(beginTime, 's')
          const leftPercent = (leftValue / max) * 100
          const ele = document.createElement('div')
          ele.className = 'segment-ui'
          ele.style.width = `${percent}%`
          ele.style.left = `${leftPercent}%`
          sliderEle.appendChild(ele)
          eleList.push(ele)
        })
      }
    }
    return () => {
      sliderEle && eleList.forEach(item => sliderEle.removeChild(item))
    }
  }, [segments, beginTime, max, uniqueIdClassName])

  useEffect(() => {
    if (value && !isDrag) {
      setRealValue(value)
    }
  }, [value, isDrag])


  const handleChange = useCallback(
    (val: number) => {
      setIsDrag(true)
      if (segments) {
        const currentDateTime = dayjs(beginTime).add(val, 's')
        let is = false
        for (let i = 0; i < segments.length; i++) {
          const item = segments[i]
          const segmentDeginDayjs = dayjs(item.beginTime)
          const segmentEndDayjs = dayjs(item.endTime)
          if (
            (currentDateTime.isSame(segmentDeginDayjs) || currentDateTime.isAfter(segmentDeginDayjs))
            && (currentDateTime.isSame(segmentEndDayjs) || currentDateTime.isBefore(segmentEndDayjs))
          ) {
            is = true
            break
          }
        }
        if (is) {
          setRealValue(val)
          // if (onChange) {
          //   const dateTimeText = currentDateTime.format(YMDHms)
          //   onChange(dateTimeText, val)
          // }
        }
      } else {
        setRealValue(val)
        // if (onChange) {
        //   const currentDateTime = dayjs(beginTime).add(val, 's')
        //   const dateTimeText = currentDateTime.format(YMDHms)
        //   onChange(dateTimeText, val)
        // }
      }
    },
    [segments, beginTime]
  )

  const handleAfterChange = useCallback(
    (val: number) => {
      setIsDrag(false)
      if (segments) {
        const currentDateTime = dayjs(beginTime).add(val, 's')
        let is = false
        for (let i = 0; i < segments.length; i++) {
          const item = segments[i]
          const segmentDeginDayjs = dayjs(item.beginTime)
          const segmentEndDayjs = dayjs(item.endTime)
          if (
            (currentDateTime.isSame(segmentDeginDayjs) || currentDateTime.isAfter(segmentDeginDayjs))
            && (currentDateTime.isSame(segmentEndDayjs) || currentDateTime.isBefore(segmentEndDayjs))
          ) {
            is = true
            break
          }
        }
        if (is) {
          if (onChange) {
            const dateTimeText = currentDateTime.format(YMDHms)
            onChange(dateTimeText, val)
          }
        }
      } else {
        if (onChange) {
          const currentDateTime = dayjs(beginTime).add(val, 's')
          const dateTimeText = currentDateTime.format(YMDHms)
          onChange(dateTimeText, val)
        }
      }
    },
    [beginTime, onChange, segments],
  )



  return (
    <article ref={boxRef}>
      <Slider
        className={sliderClassName}
        min={0}
        max={max}
        tooltip={tooltip}
        value={realValue}
        onChange={handleChange}
        onAfterChange={handleAfterChange}
      />
    </article>
  )
}

export default VideoMultiSegment