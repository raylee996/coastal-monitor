import { Button, message, Modal, Select, Space, Form } from "antd";
import Text from "antd/es/typography/Text";
import dayjs from "dayjs";
import { YMDHms } from "helper";
import { PlaySpeedDict } from "helper/dictionary";
import JessibucaProPlayerSegments, { PlayerSegment } from "helper/player/JessibucaProPlayerSegments";
import { InputType } from "hooks/flexibility/FormPanel";
import { DayjsRange } from "hooks/hooks";
import FormInterface from "hooks/integrity/FormInterface";
import _ from "lodash";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { checkCameraHistoryStream, getVideoHistoryUrl, pauseCameraHistoryStream, resumeCameraHistoryStream, seekHistoryStream, speedHistoryStream, stopCameraHistoryStream } from "server/device";
import { getVideoSegmentList } from "server/video";
import AddNote from "./components/AddNote";
import MultiSegment, { MultiSegmentRefProps } from "./components/MultiSegment";
import VideoDownload from "./components/VideoDownload";
import styles from "./index.module.sass";


interface XY {
  x: number
  y: number
}

const FAST_STEP = 18

const speedOptions = PlaySpeedDict.map(val => ({ ...val, label: val.name }))

const inputs = [
  ['时间范围', 'dateTimeRange', InputType.dateTimeRange]
]

const formProps = {
  labelCol: { span: 4 }
}

let rebuildTime: number | undefined

interface fastData {
  isClick: boolean
  timer: NodeJS.Timer | null
}

const fastForward: fastData = {
  isClick: true,
  timer: null
}

const fastRewind: fastData = {
  isClick: true,
  timer: null
}

interface Props {
  /** 样式类名 */
  className?: string
  /** 要展示的设备 */
  device: any
  /** 历史视频回放时段 */
  timeRange?: string[]
  /** 点击事件回调 */
  onClick?: (device: any) => void
  /** 锁的回调 */
  onLock?: (device: any) => void
  /** 解锁的回调 */
  onUnLock?: (device: any) => void
}

const PlayerWindow: React.FC<Props> = ({ className, device, timeRange, onClick, onLock, onUnLock }) => {
  console.debug('PlayerWindow')


  const videoRef = useRef<HTMLDivElement>(null)
  const videoBoxRef = useRef<HTMLElement>(null)
  const multiSegmentRef = useRef<MultiSegmentRefProps>(null)


  const [form] = Form.useForm()


  const [initData] = useState<{ dateTimeRange: DayjsRange }>(() => {
    if (timeRange?.length) {
      return {
        dateTimeRange: [dayjs(timeRange[0]), dayjs(timeRange[1])]
      }
    } else {
      return {
        dateTimeRange: [dayjs().set('h', 0).set('m', 0).set('s', 0), dayjs()]
      }
    }
  })
  const [player, setPlayer] = useState<JessibucaProPlayerSegments>()
  const [isPlay, setIsPlay] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [speedBefore, setSpeedBefore] = useState(1)
  const [range, setRange] = useState<DayjsRange>(initData.dateTimeRange)
  const [isOpenRange, setIsOpenRange] = useState(false)
  const [videoAlt, setVideoAlt] = useState('')
  const [videoSegmentList, setVideoSegmentList] = useState<any[] | undefined>()
  const [videoSegmentChannel, setVideoSegmentChannel] = useState('')
  const [palyerSegmentList, setPalyerSegmentList] = useState<{ beginTime: string, endTime: string }[]>([])
  const [palyerSegmentIndex, setPalyerSegmentIndex] = useState<number>(0)
  const [isOpenDownloadRange, setIsOpenDownloadRange] = useState(false)
  const [isOpenDownloadFile, setIsOpenDownloadFile] = useState(false)
  const [isOpenSaveNote, setIsOpenSaveNote] = useState(false)
  const [downloadRange, setDownloadRange] = useState<DayjsRange>()
  const [isZoom, setIsZoom] = useState(false)
  const [isOpenZoom, setIsOpenZoom] = useState(false)
  const [beginXY, setBeginXY] = useState<XY>()
  const [endXY, setEndXY] = useState<XY>()
  const [isFastReady, setIsFastReady] = useState(true)
  const [stream, setStream] = useState('')
  const [channel, setChannel] = useState('')
  const [deviceCode, setDeviceCode] = useState('')


  useState(() => {
    const result = window.navigator.userAgent.toLowerCase().match(/chrome\/([\d.]+)/)
    const version = result![1]
    const versionNumber = parseInt(version)
    if (versionNumber < 104) {
      message.warning('浏览器版本过低,请升级浏览器至104及以上')
    }
  })


  const ctrlBeginTime = useMemo(() => range && range[0] ? range[0].format(YMDHms) : undefined, [range])
  const ctrlEndTime = useMemo(() => range && range[1] ? range[1].format(YMDHms) : undefined, [range])
  // const deviceCode = useMemo(() => device.deviceCode, [device])
  const channelOptions = useMemo(() => {
    if (device?.channelList) {
      const result = device.channelList.map((item: any) => {
        return {
          value: item.channel,
          label: item.name
        }
      })
      return result
    } else {
      return []
    }
  }, [device])


  // 配置设备编码、通道信息
  useEffect(() => {

    if (device) {
      if (!_.isEmpty(device.channelList)) {
        const targetChannel = device.channelList.find((ele: any) => ele.type === 1)
        const result = targetChannel ? targetChannel.channel : device.channelList[0].channel
        setChannel(result)
      } else {
        setChannel('')
      }
      setSpeed(1)
      setDeviceCode(device.deviceCode)
    }

    setPalyerSegmentIndex(0)

    return () => {
      setStream('')
    }
  }, [device])

  // 根据时间范围获取有效时段
  useEffect(() => {
    let ctr: AbortController
    async function main() {
      try {
        if (channel && !_.isEmpty(device.channelList)) {
          ctr = new AbortController()
          setIsPlay(false)
          if (!rebuildTime) {
            multiSegmentRef.current?.onReset()
          }
          const vo = await getVideoSegmentList(device, range, channel, ctr)
          if (vo && vo.length && range) {
            const val = dayjs(vo[0].beginTime).diff(range[0], 's')
            const _palyerSegmentList = vo.map(item => ({
              beginTime: item.beginTime,
              endTime: item.endTime
            }))
            multiSegmentRef.current?.setValue(val)
            setPalyerSegmentList(_palyerSegmentList)
            setVideoSegmentList(vo)
          } else {
            setVideoAlt('无有效播放时段')
            setPalyerSegmentList([])
            setVideoSegmentList([])
          }
          setVideoSegmentChannel(channel)
        } else {
          setVideoAlt('设备无通道信息')
          setPalyerSegmentList([])
          setVideoSegmentList([])
        }
      } catch (error) {
        console.warn('获取有效时段异常', error)
        setPalyerSegmentList([])
        setVideoSegmentList([])
      }
    }
    main()
    return () => {
      ctr && ctr.abort()
    }
  }, [device, channel, range])

  // 实例多段播放
  useEffect(() => {
    let ctr: AbortController
    let playerSegments: JessibucaProPlayerSegments

    const getUrl = async (segment: {
      beginTime: string
      endTime: string
    }, index: number) => {
      try {
        ctr = new AbortController()
        setVideoAlt('视频加载中...')
        setPalyerSegmentIndex(val => {
          if (val === index) {
            return val
          } else {
            if (palyerSegmentList && multiSegmentRef.current && !rebuildTime) {
              const head = palyerSegmentList[0]
              const currentTime = multiSegmentRef.current.getValue()
              const val = dayjs(segment.beginTime).diff(head.beginTime, 's')
              rebuildTime = currentTime - val
            }
            return index
          }
        })
        const vo = await getVideoHistoryUrl(device, segment, videoSegmentChannel, ctr)
        let url = ''
        if (document.location.protocol === 'http:') {
          url = vo.ws_flv
        } else {
          url = vo.wss_flv
        }
        if (url) {
          setVideoAlt('')
        } else {
          setVideoAlt('无视频源播放地址')
        }
        setStream(vo.stream)

        if (rebuildTime) {
          await seekHistoryStream({ stream: vo.stream, time: rebuildTime })
          multiSegmentRef.current?.setValue(rebuildTime)
          rebuildTime = undefined
        }

        return url
      } catch (error) {
        setPlayer(undefined)
        setVideoAlt('获取视频源播放地址失败')
        console.warn('获取视频源播放地址失败', error)
      }
    }

    const onTime = (time: number, segment: PlayerSegment) => {
      const diff = dayjs(segment.beginTime).diff(ctrlBeginTime, 's')
      const result = diff + time
      multiSegmentRef.current?.setValue(result)
    }

    const onPlay = () => {
      setIsPlay(true)
    }

    const onEnded = () => {
      setIsPlay(false)
      setVideoAlt('视频播放已结束')
    }

    if (videoRef.current && device && !_.isEmpty(device.channelList) && palyerSegmentList.length) {
      playerSegments = new JessibucaProPlayerSegments(videoRef.current, {
        segments: palyerSegmentList,
        getUrl,
        onTime,
        onPlay,
        onEnded
      })
      setPlayer(playerSegments)
    }
    return () => {
      ctr && ctr.abort()
      playerSegments && playerSegments.destroy()
    }
  }, [device, ctrlBeginTime, palyerSegmentList, videoSegmentChannel])

  // 响应速度变倍
  useEffect(() => {
    let ctr: AbortController
    async function main() {
      if (stream && speed && player) {
        ctr = new AbortController()
        await speedHistoryStream({ stream: stream, speed: speed }, ctr)
        // videoRef.current.playbackRate = speed
        player.setPlaybackRate(speed)
      }
    }
    main()
    return () => {
      ctr?.abort()
    }
  }, [stream, speed, player])

  // 停止视频流
  useEffect(() => {

    async function main() {
      try {
        if (deviceCode && channel && stream) {
          const params = {
            deviceCode,
            channelId: channel,
            stream: stream
          }
          await stopCameraHistoryStream(params)
        }
      } catch (error) {
        console.warn('stopCameraHistoryStream', error)
      }
    }

    window.onbeforeunload = () => {
      main()
    }

    return () => {
      window.onbeforeunload = null
      main()
    }
  }, [channel, deviceCode, stream])

  // 切换界面逻辑
  useEffect(() => {
    const handle = async () => {
      if (player) {
        try {
          if (!document.hidden && isPlay) {
            const is = await checkCameraHistoryStream(stream)
            if (!is) {
              rebuildTime = multiSegmentRef.current?.getValue()
              player.rebuild()
            }
          }
        } catch (error) {
          console.warn('PlayerWindow visibilitychange', error)
        }
      }
    }
    document.addEventListener('visibilitychange', handle)
    return () => {
      document.removeEventListener('visibilitychange', handle)
    }
  }, [isPlay, player, stream])


  const handleClick = useCallback(
    () => {
      onClick && onClick(device)
    },
    [onClick, device]
  )

  const handlePlay = useCallback(
    async () => {
      if (player) {
        if (isPlay) {
          try {
            await pauseCameraHistoryStream(stream)
            setIsPlay(false)
            player.pause()
          } catch (error) {
            console.warn(error)
            setIsPlay(false)
            player.pause()
          }
        } else {
          try {
            const is = await checkCameraHistoryStream(stream)
            if (is) {
              await resumeCameraHistoryStream(stream)
              setIsPlay(true)
              player.play()
            } else {
              rebuildTime = multiSegmentRef.current?.getValue()
              player.rebuild()
            }
          } catch (error) {
            console.warn(error)
            rebuildTime = multiSegmentRef.current?.getValue()
            player.rebuild()
          }
        }
      }
    },
    [player, isPlay, stream]
  )

  const handleDateTimeRange = useCallback(
    (val: any) => {
      setRange(val.dateTimeRange)
      setIsOpenRange(false)
    },
    []
  )

  const handleSpeed = useCallback(
    (param: number) => {
      setSpeed(param)
      // setIsPlay(true)
    },
    []
  )

  // 检查进度值是否在当前播放段内
  const checkInCurrentSegment = useCallback(
    (val: number) => {
      if (palyerSegmentList) {
        const head = palyerSegmentList[0]
        const segment = palyerSegmentList[palyerSegmentIndex]
        const currenntDayjs = dayjs(head.beginTime).add(val, 's')
        return !currenntDayjs.isBefore(segment.beginTime) && !currenntDayjs.isAfter(segment.endTime)
      } else {
        return false
      }
    },
    [palyerSegmentList, palyerSegmentIndex],
  )

  // 根据进度值获取所属播放段下标
  const getCurrentSegment = useCallback(
    (val: number): [{ beginTime: string; endTime: string; }, number] => {
      const head = palyerSegmentList[0]
      const currenntDayjs = dayjs(head.beginTime).add(val, 's')
      const index = palyerSegmentList.findIndex(item => {
        return !currenntDayjs.isBefore(item.beginTime) && !currenntDayjs.isAfter(item.endTime)
      })
      return [palyerSegmentList[index], index]
    },
    [palyerSegmentList],
  )

  const handleSegment = useCallback(
    async (dateTimeText: string, val: number) => {
      if (player) {
        const isKeep = await checkCameraHistoryStream(stream)
        const is = checkInCurrentSegment(val)
        const [target, index] = getCurrentSegment(val)
        if (is && isKeep) {
          const diff = dayjs(target.beginTime).diff(ctrlBeginTime, 's')
          const result = val - diff
          await seekHistoryStream({ stream: stream, time: result })
          player.jessibucaProPlayer?.player.clearBufferDelay()
        } else {
          rebuildTime = dayjs(dateTimeText).diff(target.beginTime, 's')
          player.setSegmentIndex(index)
          player.rebuild()
          setIsPlay(false)
        }
      }
    },
    [checkInCurrentSegment, ctrlBeginTime, getCurrentSegment, player, stream]
  )

  const handleNote = useCallback(
    () => {
      setIsOpenSaveNote(true)
    },
    [],
  )

  const handleChannel = useCallback(
    (val: string) => {
      rebuildTime = multiSegmentRef.current?.getValue()
      setStream('')
      setChannel(val)
    },
    [],
  )

  const handleDownloadRange = useCallback(
    (values: any) => {
      if (values.dateTimeRange) {
        setDownloadRange(values.dateTimeRange)
        setIsOpenDownloadRange(false)
        setIsOpenDownloadFile(true)
      }
    },
    [],
  )

  const handleOpenDownload = useCallback(
    () => {
      setIsOpenDownloadRange(true)
    },
    [],
  )

  const handleZoom = useCallback(
    () => {
      setBeginXY(undefined)
      setEndXY(undefined)
      setIsOpenZoom(true)
      setIsZoom(false)
    },
    [],
  )

  const handleZoomExit = useCallback(
    () => {
      setIsZoom(false)
    },
    [],
  )

  const handleMouseDown = useCallback(
    (evt: any) => {
      // console.log('handleMouseDown', evt.nativeEvent.offsetX, evt.nativeEvent.offsetY)
      // setIsLocation(true)
      setBeginXY({
        x: evt.nativeEvent.offsetX,
        y: evt.nativeEvent.offsetY
      })
    },
    [],
  )

  const handleMouseMove = useCallback(
    (evt: any) => {
      // console.log('handleMouseMove', evt.nativeEvent.offsetX, evt.nativeEvent.offsetY)
      setEndXY({
        x: evt.nativeEvent.offsetX,
        y: evt.nativeEvent.offsetY
      })
    },
    [],
  )

  const handleMouseUp = useCallback(
    () => {
      setIsOpenZoom(false)
      setIsZoom(true)
    },
    [],
  )

  const getZoomValues = useCallback(
    () => {
      if (beginXY && endXY) {
        let left = 0
        let width = 0
        if (beginXY.x > endXY.x) {
          left = endXY.x
          width = beginXY.x - endXY.x
        } else {
          left = beginXY.x
          width = endXY.x - beginXY.x
        }

        let top = 0
        let height = 0
        if (beginXY.y < endXY.y) {
          top = beginXY.y
          height = endXY.y - beginXY.y
        } else {
          top = endXY.y
          height = beginXY.y - endXY.y
        }

        return {
          top,
          left,
          width,
          height
        }
      } else {
        return undefined
      }
    },
    [beginXY, endXY],
  )

  const handleFull = useCallback(
    () => {
      if (document.fullscreenElement === videoBoxRef.current) {
        document.exitFullscreen()
      } else {
        videoBoxRef.current?.requestFullscreen()
      }
    },
    [],
  )

  const handleContainer = useCallback(
    () => {
      if (videoBoxRef.current) {
        return videoBoxRef.current
      } else {
        return document.body
      }
    },
    [],
  )

  const handleFastForwardBegin = useCallback(
    () => {
      fastForward.isClick = true
      fastForward.timer = setTimeout(() => {
        fastForward.isClick = false

        const target = speed * 2
        if (target < 16) {
          const realTarget = target < 8 ? 8 : target
          setSpeedBefore(speed)
          setSpeed(realTarget)
        }
      }, 1000)
    },
    [speed],
  )

  const handleFastForwardEnd = useCallback(
    async () => {
      fastForward.timer && clearTimeout(fastForward.timer)
      if (fastForward.isClick && player && multiSegmentRef.current) {
        if (isFastReady) {
          setIsFastReady(false)

          const val = multiSegmentRef.current.getValue()
          const is = checkInCurrentSegment(val)
          const [target, index] = getCurrentSegment(val)
          const diff = dayjs(target.beginTime).diff(ctrlBeginTime, 's')
          const fastStep = FAST_STEP * speed
          const result = val + fastStep - diff

          if (is) {
            await seekHistoryStream({ stream: stream, time: result })
            multiSegmentRef.current.addSubtract(fastStep)
          } else {
            rebuildTime = result
            player.setSegmentIndex(index)
            player.rebuild()
          }

          setTimeout(() => setIsFastReady(true), 1000)
        }
      } else {
        setSpeed(speedBefore)
      }
      setIsPlay(true)
    },
    [checkInCurrentSegment, ctrlBeginTime, getCurrentSegment, isFastReady, player, speed, speedBefore, stream],
  )

  const handleFastRewindBegin = useCallback(
    () => {
      fastRewind.isClick = true
      fastRewind.timer = setTimeout(() => {
        fastRewind.isClick = false
      }, 1000)
    },
    [],
  )

  const handleFastRewindEnd = useCallback(
    async () => {
      fastForward.timer && clearTimeout(fastForward.timer)
      if (fastForward.isClick && player && isFastReady && multiSegmentRef.current) {
        if (isFastReady) {
          setIsFastReady(false)

          const val = multiSegmentRef.current.getValue()
          const is = checkInCurrentSegment(val)
          const [target, index] = getCurrentSegment(val)
          const diff = dayjs(target.beginTime).diff(ctrlBeginTime, 's')
          const fastStep = FAST_STEP * speed
          const result = val - fastStep - diff

          if (val) {
            if (is) {
              const _result = result < 0 ? 0 : result
              await seekHistoryStream({ stream: stream, time: _result })
              const param = -fastStep
              multiSegmentRef.current?.addSubtract(param)
            } else {
              rebuildTime = result
              player.setSegmentIndex(index)
              player.rebuild()
            }
          }

          setTimeout(() => setIsFastReady(true), 1000)
        }
      }
      setIsPlay(true)
    },
    [checkInCurrentSegment, ctrlBeginTime, getCurrentSegment, isFastReady, player, speed, stream],
  )


  const formDataDownload = useMemo(() => {
    return {
      dateTimeRange: range
    }
  }, [range])

  const zoomStyle = useMemo(() => {
    return isOpenZoom && getZoomValues()
  }, [isOpenZoom, getZoomValues])

  const videoStyle = useMemo(() => {
    if (isZoom && videoRef.current) {
      const zoomValues = getZoomValues()
      if (zoomValues) {
        let multiple = 1
        if (zoomValues.width > zoomValues.height) {
          multiple = videoRef.current.clientWidth / zoomValues.width
        } else {
          multiple = videoRef.current.clientHeight / zoomValues.height
        }
        const x = -zoomValues.left
        const y = -zoomValues.top
        return {
          transform: `scale(${multiple}) translateX(${x}px) translateY(${y}px)`
        }
      } else {
        return undefined
      }
    } else {
      return undefined
    }
  }, [isZoom, getZoomValues])

  const allClass = useMemo(() => {
    if (className) {
      return `${className} ${styles.videoBox}`
    } else {
      return styles.videoBox
    }
  }, [className])


  const handleChangeHour = useCallback(() => {

    let time: any = []
    time = [dayjs().subtract(1, 'h'), dayjs()]
    form.setFieldValue('dateTimeRange', time)
    setRange(time)
    setIsOpenRange(false)
  }, [form])

  const handleTask = useCallback(() => {

    let time: any = []
    time = [dayjs().set('h', 0).set('m', 0).set('s', 0), dayjs()]
    form.setFieldValue('dateTimeRange', time)
    setRange(time)
    setIsOpenRange(false)
  }, [form])


  const options = useMemo(() => {
    return {
      submitText: '确认',
      footerButtons: [{
        text: '近1小时',
        onClick: handleChangeHour
      }, {
        text: '今天',
        onClick: handleTask
      },]
    }
  }, [handleChangeHour, handleTask])


  return (
    <article
      className={allClass}
      ref={videoBoxRef}
      onClick={handleClick}
      onDoubleClick={handleFull}
    >
      <section className={styles.videoContent}>

        {isZoom &&
          <Text className={styles.zoomExit} underline onClick={handleZoomExit}>退出局部放大</Text>
        }

        {isOpenZoom &&
          <div
            className={styles.zoomBox}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          />
        }

        {zoomStyle &&
          <div className={styles.zoom} style={zoomStyle} />
        }

        <div className={styles.video} ref={videoRef} style={videoStyle} />
      </section>
      {videoAlt &&
        <section className={styles.videoAlt}><span>{videoAlt}</span></section>
      }

      <footer className={styles.footer} onDoubleClick={(e) => e.stopPropagation()}>
        <div className={styles.tools}>
          <div className={styles.actions}>
            <Space>
              <Button size="small" type="text" onClick={() => setIsOpenRange(true)} title='回放时段设置'>
                <i className="fa fa-clock-o" aria-hidden="true"></i>
              </Button>
              <Button size="small" type="text" onClick={handleZoom} title='部分画面放大' >
                <i className="fa fa-search" aria-hidden="true"></i>
              </Button>
              <Button size="small" type="text" onClick={handleOpenDownload} title='下载视频' >
                <i className="fa fa-cloud-download" aria-hidden="true"></i>
              </Button>
              <Button size="small" type="text" title='添加便签' onClick={handleNote}>
                <i className="iconfont icon-bianqian1" aria-hidden="true" style={{ fontSize: 12 }}></i>
              </Button>
              <Button size="small" type="text" onClick={handlePlay}>
                {isPlay
                  ? <i className="fa fa-pause" aria-hidden="true"></i>
                  : <i className="fa fa-play" aria-hidden="true"></i>
                }
              </Button>
              <Button size="small" type="text" onMouseDown={handleFastRewindBegin} onMouseUp={handleFastRewindEnd} title='快退'>
                <i className="fa fa-backward" aria-hidden="true"></i>
              </Button>
              <Button size="small" type="text" onMouseDown={handleFastForwardBegin} onMouseUp={handleFastForwardEnd} title='快进' >
                <i className="fa fa-forward" aria-hidden="true"></i>
              </Button>
              <div>
                <span className={styles.footerText}>倍速</span>
                <Select className={styles.speed} size='small' options={speedOptions} value={speed} onChange={handleSpeed} getPopupContainer={handleContainer} />
              </div>
              <div>
                <span className={styles.footerText}>通道</span>
                <Select className={styles.speed} size='small' options={channelOptions} value={channel} onChange={handleChannel} getPopupContainer={handleContainer} />
              </div>
            </Space>
          </div>
          <div className={styles.multiSegment}>
            <MultiSegment
              ref={multiSegmentRef}
              beginTime={ctrlBeginTime}
              endTime={ctrlEndTime}
              segments={videoSegmentList}
              onDragChange={handleSegment}
            />
          </div>
        </div>
      </footer>

      <aside>
        <Modal
          title="回放时段设置"
          open={isOpenRange}
          onCancel={() => setIsOpenRange(false)}
          centered={true}
          footer={false}
          maskClosable={false}
          getContainer={handleContainer}
        >
          <FormInterface
            form={form}
            inputs={inputs}
            initData={initData}
            formProps={formProps}
            options={options}
            onFinish={handleDateTimeRange}
          />
        </Modal>

        <Modal
          title="下载时段设置"
          open={isOpenDownloadRange}
          onCancel={() => setIsOpenDownloadRange(false)}
          centered={true}
          footer={false}
          maskClosable={false}
          getContainer={handleContainer}
        >
          <FormInterface
            inputs={inputs}
            initData={initData}
            formData={formDataDownload}
            formProps={formProps}
            onFinish={handleDownloadRange}
          />
        </Modal>

        <Modal
          title="视频文件下载"
          open={isOpenDownloadFile}
          onCancel={() => setIsOpenDownloadFile(false)}
          centered={true}
          footer={false}
          maskClosable={false}
          destroyOnClose={true}
          getContainer={handleContainer}
        >
          <VideoDownload
            deviceCode={deviceCode}
            channel={channel}
            range={downloadRange}
          />
        </Modal>

        <Modal
          title="存入我的便签"
          open={isOpenSaveNote}
          onCancel={() => setIsOpenSaveNote(false)}
          centered={true}
          footer={false}
          maskClosable={false}
          destroyOnClose={true}
          getContainer={handleContainer}
        >
          <AddNote
            range={range}
            deviceCode={device.deviceCode}
            onClosePopup={() => setIsOpenSaveNote(false)}
          />
        </Modal>
      </aside>
    </article >
  )
}

export default PlayerWindow