import { CaretRightOutlined, PauseOutlined } from "@ant-design/icons";
import { InputNumber, Slider } from "antd";
import dayjs from "dayjs";
import { MDHms, YMDHms } from "helper";
import _ from "lodash";
import React, { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import styles from "./index.module.sass";


interface Props {
  /** 样式类名 */
  className?: string
  /** 日期时间字符串格式列表 */
  datetimeList?: string[]
  /** 开始时间与连续时间, 请用useMemo定义 */
  startCount?: {
    /** 开始时间 */
    datetime: string,
    /** 连续时间段 */
    count: number,
    /** 连续时间段单位 */
    unit?: 'd' | 'h' | 'm' | 's'
    /** 每次更新的时长 */
    step?: number
    /** 触发时间间隔(秒),默认1秒 */
    seconds?: number
  }
  /** 播放按钮是否可用 */
  isNotCanPlay?: boolean
  /**播放进度回调，请用useCallback定义 */
  onChange?: (value: number) => void
}

export interface PlayControlPanelRefProps {
  /** 播放 */
  play: () => void
  /** 暂停 */
  pause: () => void
  /** 手动设置进度，仅当使用datetimeList时生效
   * @param val 传入string类型时是字符串日期格式，number时是数组下标
   */
  onDatetimeCurrent: (val: string | number) => void
}

const PlayControlPanel = React.forwardRef<PlayControlPanelRefProps, Props>(({ datetimeList, startCount, onChange, isNotCanPlay, className }, ref) => {
  console.debug('PlayControlPanel')


  const boxRef = useRef<HTMLDivElement>(null)


  const [isPlay, setIsPlay] = useState(false)
  const [currentTime, setCurrentTime] = useState('')
  const [completeTime, setCompleteTime] = useState('')
  const [maxLength, setMaxLength] = useState(0)
  const [playSpeed, setPlaySpeed] = useState(1)
  const [currentIndex, setCurrentIndex] = useState<number>()
  const [maxSpeed, setMaxSpeed] = useState(() => {
    if (datetimeList) {
      return 20
    } else if (startCount) {
      return 1000
    } else {
      return 10
    }
  })
  const [sliderAltStyle, setSliderAltStyle] = useState<React.CSSProperties>()
  const [sliderAlt, setSliderAlt] = useState('')


  const uniqueIdClassName = useMemo(() => `PlayControlPanel__${_.uniqueId()}`, [])

  const beginDateTime = useMemo(() => {
    if (datetimeList && datetimeList.length > 0) {
      const result = datetimeList[0]
      return result
    } else if (startCount) {
      return startCount.datetime
    }
  }, [datetimeList, startCount])

  const endDateTime = useMemo(() => {
    if (datetimeList && datetimeList.length > 0) {
      const result = _.last(datetimeList)
      return result
    } else if (startCount) {
      return dayjs(startCount.datetime).add(startCount.count, startCount.unit || 's').format(YMDHms)
    }
  }, [datetimeList, startCount])

  const totalSeconds = useMemo(() => {
    const result = dayjs(endDateTime).diff(beginDateTime, 's')
    return result
  }, [beginDateTime, endDateTime])


  // 设置
  useEffect(() => {
    setIsPlay(false)
    if (datetimeList) {
      const last = _.last(datetimeList)
      setCompleteTime(last || '')
      setMaxLength(datetimeList.length - 1)
      setCurrentIndex(0)
      setMaxSpeed(20)
    } else if (startCount) {
      const _completeTime = dayjs(startCount.datetime).add(startCount.count, startCount.unit || 's').format(MDHms)
      setCompleteTime(_completeTime)
      setMaxLength(startCount.count)
      setCurrentIndex(0)
      setMaxSpeed(1000)
    } else {
      setMaxSpeed(10)
    }
  }, [datetimeList, startCount])

  // 播放控制
  useEffect(() => {
    let interval: any
    if (isPlay && maxLength > 0) {
      interval = setInterval(() => {
        setCurrentIndex(val => {
          if (val && val >= maxLength) {
            setIsPlay(false)
            return maxLength
          } else {
            if (_.isUndefined(val)) {
              return val
            } else {
              if (startCount) {
                const result = startCount.step ? startCount.step * playSpeed : playSpeed
                return val + result
              } else {
                return val + playSpeed
              }
            }
          }
        })
      }, 1000)
    }
    return () => {
      interval && clearInterval(interval)
    }
  }, [isPlay, playSpeed, maxLength, datetimeList, startCount])

  // currentIndex传参至父级组件onchange
  useEffect(() => {
    if (!_.isUndefined(currentIndex) && (datetimeList || startCount)) {
      let current: string
      if (datetimeList) {
        current = datetimeList[currentIndex]
        setCurrentTime(current || '')
        onChange && onChange(currentIndex)
      } else if (startCount) {
        current = dayjs(startCount.datetime).add(currentIndex, startCount.unit || 's').format(MDHms)
        setCurrentTime(current)
        if (startCount.seconds) {
          if (currentIndex % startCount.seconds === 0) {
            onChange && onChange(currentIndex)
          }
        } else {
          onChange && onChange(currentIndex)
        }
      }
    }
  }, [onChange, currentIndex, datetimeList, startCount])

  useEffect(() => {
    let sliderEle: HTMLElement
    const list: any = document.getElementsByClassName(uniqueIdClassName)

    const handleMove = (evt: any) => {
      if (evt.target.className.includes('ant-slider-handle')) {
        setSliderAltStyle({
          display: 'none'
        })
      } else {
        const val = evt.offsetX < 0 ? 0 : evt.offsetX
        const offsetSeconds = totalSeconds * (val / evt.target.clientWidth)
        const currentDayjs = dayjs(beginDateTime).add(offsetSeconds, 'second')
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

    if (list.length !== 0) {
      sliderEle = list[0]
      sliderEle.addEventListener('mousemove', handleMove)
      sliderEle.addEventListener('mouseleave', handleLeave)
    }

    return () => {
      if (sliderEle) {
        sliderEle.removeEventListener('mousemove', handleMove)
        sliderEle.removeEventListener('mouseleave', handleLeave)
      }
    }
  }, [beginDateTime, totalSeconds, uniqueIdClassName])


  const handlePlay = useCallback(
    () => {
      if (!isNotCanPlay) {
        if (currentIndex === maxLength) {
          setCurrentIndex(0)
        }
        setIsPlay(val => !val)
      }
    },
    [currentIndex, isNotCanPlay, maxLength]
  )

  function handleSpeed(param: any) {
    _.isNumber(param) && setPlaySpeed(param)
  }

  function handleChange(param: any) {
    // setIsPlay(false)
    _.isNumber(param) && setCurrentIndex(param)
  }

  function handleSliderUp(param: any) {
    _.isNumber(param) && onChange && onChange(param)
  }


  useImperativeHandle(ref, () => {

    const onDatetimeCurrent = (val: string | number) => {
      if (datetimeList) {
        if (_.isString(val)) {
          const idx = datetimeList.findIndex(ele => ele === val)
          if (idx !== -1) {
            setCurrentIndex(idx)
          }
        } else {
          setCurrentIndex(val)
        }
      }
    }

    return {
      play: () => setIsPlay(true),
      pause: () => setIsPlay(false),
      onDatetimeCurrent
    }
  },
    [datetimeList],
  )

  const tooltip = useMemo(() => ({
    formatter(val: number | undefined) {
      if (_.isUndefined(val)) {
        return ''
      } else {
        if (datetimeList) {
          const current = datetimeList[val]
          return current
        } else {
          return dayjs(beginDateTime).add(val, 's').format(YMDHms)
        }
      }
    },
    getPopupContainer() {
      return boxRef.current ? boxRef.current : document.body
    }
  }), [beginDateTime, datetimeList])

  const articleClassName = useMemo(() => className ? `${styles.wapper} ${className}` : styles.wapper, [className])

  return (
    <article className={articleClassName}>
      <section className={styles.playBut} onClick={handlePlay}>
        {isPlay ? <PauseOutlined /> : <CaretRightOutlined />}
      </section>
      <section className={styles.playTime}>{currentTime}/{completeTime}</section>
      <section className={styles.playSlider} ref={boxRef}>
        <div className={styles.sliderAlt} style={sliderAltStyle}>{sliderAlt}</div>
        <Slider className={uniqueIdClassName} value={currentIndex} max={maxLength} tooltip={tooltip} onChange={handleChange} onAfterChange={handleSliderUp} />
      </section>
      <section>
        <span className={styles.label}>播放速度</span>
        <InputNumber className={styles.speedInput} size="small" min={1} max={maxSpeed} value={playSpeed} onChange={handleSpeed} />
      </section>
    </article>
  )
})

export default PlayControlPanel