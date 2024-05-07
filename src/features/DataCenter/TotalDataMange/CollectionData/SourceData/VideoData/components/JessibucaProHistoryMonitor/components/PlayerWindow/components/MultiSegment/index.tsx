import './index.sass';
import { Slider } from "antd"
import dayjs from "dayjs"
import { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react"
import { YMDHms } from 'helper';
import _ from 'lodash';
import styles from "./index.module.sass";
import React from 'react';


export interface MultiSegmentRefProps {
  /** 加减值 */
  addSubtract: (param: number) => void
  /** 获取值 */
  getValue: () => number
  /** 重置值 */
  onReset: () => void
  /** 设置值 */
  setValue: (param: number) => void
}

interface Segment {
  beginTime: string
  endTime: string
}

interface Props {
  beginTime?: string
  endTime?: string
  segments?: Segment[]
  /** 当拖拽播放点后的值变更 */
  onDragChange?: (datetime: string, value: number) => void
}

const MultiSegment = React.forwardRef<MultiSegmentRefProps, Props>(({ beginTime, endTime, segments, onDragChange }, ref) => {
  console.debug('MultiSegment')


  const boxRef = useRef<HTMLElement>(null)


  const [realValue, setRealValue] = useState(0)
  const [sliderAltStyle, setSliderAltStyle] = useState<React.CSSProperties>()
  const [sliderAlt, setSliderAlt] = useState('')
  const [changeValue, setChangeValue] = useState(0)

  const uniqueIdClassName = useMemo(() => `PlayControlPanel__${_.uniqueId()}`, [])

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

  const timeStr = useMemo(() => {
    if (beginTime) {
      const beginDay = dayjs(beginTime)
      return beginDay.add(realValue, 's').format(YMDHms)
    } else {
      return ''
    }
  }, [beginTime, realValue])


  const sliderClassName = useMemo(() => `VideoMultiSegment__Slider ${uniqueIdClassName}`, [uniqueIdClassName])

  const totalSeconds = useMemo(() => dayjs(endTime).diff(beginTime, 's'), [beginTime, endTime])

  useEffect(() => {
    let sliderEle: Element
    const eleList: HTMLDivElement[] = []

    const handleMove = (evt: any) => {
      if (evt.target.className.includes('ant-slider-handle')) {
        setSliderAltStyle({
          display: 'none'
        })
      } else {
        const val = evt.offsetX < 0 ? 0 : evt.offsetX
        const offsetSeconds = totalSeconds * (val / evt.target.clientWidth)
        const currentDayjs = dayjs(beginTime).add(offsetSeconds, 'second')
        const _sliderAlt = currentDayjs.format(YMDHms)
        setSliderAlt(_sliderAlt)
        setSliderAltStyle({
          display: 'block',
          left: evt.offsetX
        })
      }
    }

    const handleLeave = () => {
      setSliderAltStyle({
        display: 'none',
      })
    }

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

        sliderEle.addEventListener('mousemove', handleMove)
        sliderEle.addEventListener('mouseleave', handleLeave)
      }
    }
    return () => {
      if (sliderEle) {
        eleList.forEach(item => sliderEle.removeChild(item))
        sliderEle.removeEventListener('mousemove', handleMove)
        sliderEle.removeEventListener('mouseleave', handleLeave)
      }
    }
  }, [beginTime, max, segments, totalSeconds, uniqueIdClassName])


  const handleChange = useCallback(
    (val: number) => {
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
        }
      } else {
        setRealValue(val)
      }
    },
    [segments, beginTime]
  )

  const handleAfterChange = useCallback(
    (val: number) => {
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
          if (onDragChange) {
            const dateTimeText = currentDateTime.format(YMDHms)
            onDragChange(dateTimeText, val)
          }
        }
      } else {
        if (onDragChange) {
          const currentDateTime = dayjs(beginTime).add(val, 's')
          const dateTimeText = currentDateTime.format(YMDHms)
          onDragChange(dateTimeText, val)
        }
      }
      setChangeValue(val)
    },
    [beginTime, onDragChange, segments],
  )

  /** 导出刷新函数 */
  useImperativeHandle(
    ref,
    () => {
      let count = 0
      return {
        addSubtract(param: number) {
          const result = realValue + param
          setChangeValue(result)
          setRealValue(result)
        },
        getValue() {
          return realValue
        },
        onReset() {
          setChangeValue(0)
          setRealValue(0)
        },
        setValue(param: number) {
          if (changeValue) {
            count += 1
            if (count > 2) {
              setRealValue(param)
              setChangeValue(0)
              count = 0
            }
          } else {
            setRealValue(param)
          }
        }
      }
    },
    [changeValue, realValue]
  )


  return (
    <article className={styles.wapper} ref={boxRef}>
      <section className={styles.sliderAlt} style={sliderAltStyle}>{sliderAlt}</section>
      <section className={styles.time}>{timeStr}</section>
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
})

export default MultiSegment