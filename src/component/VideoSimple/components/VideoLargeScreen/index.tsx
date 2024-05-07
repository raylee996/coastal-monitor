import { RedoOutlined } from "@ant-design/icons";
import { Button, Select } from "antd";
import VideoMultiSegment from "component/VideoMultiSegment";
import { VideoSimpleProps } from "component/VideoSimple";
import dayjs from "dayjs";
import JessibucaProPlayerSegments from "helper/player/JessibucaProPlayerSegments";
import _ from "lodash";
import { useCallback, useDeferredValue, useEffect, useRef, useState } from "react";
import { getHaiweiyunCameraHistory } from "server/common";
import { pauseCameraHistoryStream, queryGbRecord, resumeCameraHistoryStream, seekHistoryStream, speedHistoryStream, stopCameraHistoryStream } from "server/device";
import styles from "./index.module.sass";
import { PlaySpeedDict } from "helper/dictionary";


const speedOptions = PlaySpeedDict.map(val => ({ ...val, label: val.name }))

interface VideoLargeScreenProps extends VideoSimpleProps {
  /** 是否可播放 */
  setIsEffective: Function
  /** 是否在点开大屏播放视频 */
  isLargeScreen?: boolean
  /** 弹窗播放 */
  handleOpenPopupVideo?: Function
  /** 播放完后回调 用于重播 请用useCallback定义  */
  playResetFunc?: Function
}

const VideoLargeScreen: React.FC<VideoLargeScreenProps> = ({ getVideoParams, src, setIsEffective, isLargeScreen, handleOpenPopupVideo, playResetFunc }) => {
  console.debug('VideoLargeScreen')

  // const videoRef = useRef<HTMLVideoElement>(null)
  const videoDivRef = useRef<HTMLDivElement>(null)

  const [videoRemote, setVideoRemote] = useState<any>()
  const [videoAlt, setVideoAlt] = useState<string>('')
  const [speed, setSpeed] = useState(1)
  const [isPlay, setIsPlay] = useState(true)
  const [player, setPlayer] = useState<JessibucaProPlayerSegments>()
  const [isReqEnd, setIsReqEnd] = useState(false)
  const [videoSegmentList, setVideoSegmentList] = useState<any[] | undefined>()
  const [palyerSegmentList, setPalyerSegmentList] = useState<{ beginTime: string, endTime: string }[]>()
  const [stream, setStream] = useState('')
  const [stopFlag, setStopFlag] = useState<boolean>(false)
  const [segmentValue, setSegmentValue] = useState<string>()
  const [timeValue, setTimeValue] = useState(0)

  const deferredSegmentValue = useDeferredValue(segmentValue)



  // 根据时间范围获取有效时段
  useEffect(() => {
    let ctr: AbortController
    async function main() {
      try {
        ctr = new AbortController()
        setVideoAlt('请求视频数据...')
        const vo = await queryGbRecord(getVideoParams, ctr)
        if (vo.timeList.length > 0) {
          setVideoSegmentList(vo.timeList)
          const head: any = _.head(vo.timeList)
          setSegmentValue(head.beginTime)
        } else {
          setVideoAlt('历史视频不存在')
          setStopFlag(true)
          setVideoSegmentList([])
        }
      } catch (error) {
        console.warn('获取有效时段异常', error)
        setVideoAlt('请求视频数据失败')
        setStopFlag(true)
        setVideoSegmentList([])
      }
    }
    getVideoParams && main()
    return () => {
      ctr && ctr.abort()
    }
  }, [getVideoParams])

  // 根据有效时段和当前播放时刻，设置需要请求播放地址的时间范围时段
  useEffect(() => {
    if (videoSegmentList && deferredSegmentValue) {
      const timeSegmentList: { beginTime: string, endTime: string }[] = []
      let isAdd = false
      const currentDateTime = dayjs(deferredSegmentValue)
      videoSegmentList.forEach(item => {
        if (isAdd) {
          timeSegmentList.push({
            beginTime: item.beginTime,
            endTime: item.endTime
          })
        } else {
          const segmentDeginDayjs = dayjs(item.beginTime)
          const segmentEndDayjs = dayjs(item.endTime)
          if (
            (currentDateTime.isSame(segmentDeginDayjs) || currentDateTime.isAfter(segmentDeginDayjs))
            && (currentDateTime.isSame(segmentEndDayjs) || currentDateTime.isBefore(segmentEndDayjs))
          ) {
            isAdd = true
            timeSegmentList.push({
              beginTime: _.clone(deferredSegmentValue),
              endTime: item.endTime
            })
          }
        }
      })
      setPalyerSegmentList(timeSegmentList)
    }
  }, [deferredSegmentValue, videoSegmentList])

  // 实例多段播放
  useEffect(() => {
    let ctr: AbortController
    let flvPlayerSegments: JessibucaProPlayerSegments
    if (videoDivRef.current && getVideoParams && palyerSegmentList) {
      const videoEle = videoDivRef.current
      const getUrl = async (segment: {
        beginTime: string
        endTime: string
      }) => {
        try {
          if (!getVideoParams) {
            return
          }
          ctr = new AbortController()
          setVideoAlt('视频加载中...')
          setIsReqEnd(false)
          const vo = await getHaiweiyunCameraHistory(getVideoParams, segment, ctr)
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
          setVideoRemote(vo)
          setIsReqEnd(true)
          setStream(vo.stream)

          return url
        } catch (error) {
          setVideoAlt('获取视频源播放地址失败')
          setStopFlag(true)
          setPlayer(undefined)
          console.warn('获取视频源播放地址失败', error)
        }
      }

      const onTime = (time: number) => {
        setTimeValue(time)
      }

      const onEnded = () => {
        setStopFlag(true)
      }

      flvPlayerSegments = new JessibucaProPlayerSegments(videoEle, {
        segments: palyerSegmentList,
        getUrl,
        onTime,
        onEnded
      })
      setPlayer(flvPlayerSegments)
    }
    return () => {
      ctr && ctr.abort()
      flvPlayerSegments && flvPlayerSegments.destroy()
    }
  }, [getVideoParams, palyerSegmentList])

  // 停止视频流
  useEffect(() => {

    async function main() {
      if (getVideoParams && stream) {
        const params = {
          deviceCode: getVideoParams.deviceCode,
          channelId: getVideoParams.deviceChannelCode,
          stream: stream
        }
        await stopCameraHistoryStream(params)
      }
    }

    window.onbeforeunload = () => {
      main()
    }

    return () => {
      window.onbeforeunload = null
      main()
    }
  }, [getVideoParams, stream])

  const handleSegment = useCallback(
    (dateTimeText: string, val: number) => {
      setSegmentValue(dateTimeText)
    },
    []
  )

  // 修改播放速度
  async function handleSpeed(param: number) {
    if (videoRemote) {
      await speedHistoryStream({ ...videoRemote, speed: param })
    }
    setSpeed(param)
  }

  // 播放/暂停操作
  function handlePlay(flag: boolean) {
    async function main() {
      flag ? await pauseCameraHistoryStream(videoRemote.stream) : await resumeCameraHistoryStream({ ...videoRemote })
      if (player) {
        flag ? player.pause() : player.play()
      }
    }
    videoRemote && main()
    setIsPlay(!flag)
  }

  // 快进/快退操作
  async function handleFast(is: boolean) {
    if (videoDivRef.current && player && player.jessibucaProPlayer) {
      // const currentTime = player.getCurrentPlayTime()
      const currentTime = 0

      if (currentTime) {
        const segment = player.getCurrentSegment()
        const totalTime = dayjs(segment.endTime).diff(segment.beginTime)
        const val = totalTime / 5
        const time = val > 15 ? 15 : val
        if (is) { // 快进
          if (currentTime < totalTime) {
            // const val = totalTime / 5
            // const time = val > 10 ? 10 : val
            const result = currentTime + time

            await seekHistoryStream({ ...videoRemote, time: _.floor(result) })
          }
        } else {
          if (videoDivRef.current && currentTime > 0) {
            // const val = totalTime / 5
            // const time = val > 10 ? 10 : val
            const count = currentTime - time
            const result = count > 0 ? count : 0

            await seekHistoryStream({ ...videoRemote, time: _.floor(result) })
          }
        }
      }
    }
  }

  function handleEnlargeVideo() {
    handleOpenPopupVideo && handleOpenPopupVideo()
  }

  const handleReset = useCallback(
    () => {
      setStopFlag(false)
      playResetFunc && playResetFunc()
    },
    [playResetFunc]
  )

  return (
    <>
      {videoAlt &&
        <section className={styles.videoAlt}>
          <div className={styles.video_text}>{videoAlt}</div>
        </section>
      }

      <div className={styles.videoBox}>
        {/* <video className={styles.video} ref={videoRef} onDoubleClick={handleEnlargeVideo} muted></video> */}
        <div className={styles.video} ref={videoDivRef} onDoubleClick={handleEnlargeVideo} ></div>

        {!stopFlag && isReqEnd &&
          <div className={styles.tools}>
            <div className={styles.btnTools}>
              <Button size="small" type="text" onClick={() => handleFast(false)} title='快退' >
                <i className={`fa fa-backward ${styles.icon}`} aria-hidden="true"></i>
              </Button>
              <Button size="small" type="text" onClick={() => handlePlay(isPlay)}>
                {isPlay
                  ? <i className={`fa fa-pause ${styles.icon}`} aria-hidden="true"></i>
                  : <i className={`fa fa-play ${styles.icon}`} aria-hidden="true"></i>
                }
              </Button>
              <Button size="small" type="text" onClick={() => handleFast(true)} title='快进' >
                <i className={`fa fa-forward ${styles.icon}`} aria-hidden="true"></i>
              </Button>
              {isLargeScreen &&
                <div>
                  <span className={styles.footerText}>倍速</span>
                  <Select className={styles.speed} size='small' options={speedOptions} defaultValue={speed} onChange={handleSpeed} />
                </div>
              }
              <div className={styles.multiSegment}>
                <VideoMultiSegment
                  beginTime={getVideoParams?.startTime}
                  endTime={getVideoParams?.endTime}
                  segments={videoSegmentList}
                  value={timeValue}
                  onChange={handleSegment}
                />
              </div>
            </div>
          </div>
        }

        {stopFlag &&
          <div className={styles.reset} onClick={handleReset}>
            <RedoOutlined className={styles.icon} />
          </div>
        }

      </div>
    </>
  )
}

export default VideoLargeScreen