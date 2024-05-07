import { Button, Slider, Spin } from "antd";
import ImageSimple from "hooks/basis/ImageSimple";
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import styles from "./index.module.sass";
import imgDefSrc from 'images/video/video_def.jpg'
import { getHistoryVideoInfo } from "server/common";
import { getRelationImgSrc, YMDHms } from "helper";
import Mp4Player from "helper/player/Mp4Player";
import dayjs from "dayjs";
import { seekHistoryStream } from "server/device";


interface Props {
  /** 视频缩略图 */
  imageSrc?: string
  /** 结构化信息json字符串 */
  relationInfo?: string
  /** 设备编码 */
  deviceCode?: string
  /** 设备通道编码 */
  channel?: string
  /** 视频开始时间 */
  startTime?: string
  /** 视频结束时间 */
  endTime?: string
}

const VideoImg: React.FC<Props> = ({ imageSrc, relationInfo, deviceCode, channel, startTime, endTime }) => {
  console.debug('VideoImg')


  const videoRef = useRef<HTMLVideoElement>(null)
  const videoBoxRef = useRef<HTMLElement>(null)


  const [isPlayer, setIsPlayer] = useState(false)
  const [isPlay, setIsPlay] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [src, setSrc] = useState<string>()
  const [stream, setStream] = useState<string>()
  const [videoUrl, setVideoUrl] = useState<string>()
  // const [player, setPlayer] = useState<Mp4Player>()
  const [progressValue, setProgressValue] = useState(0)


  const max = useMemo(() => {
    const beginDay = dayjs(startTime)
    const endDay = dayjs(endTime)
    const result = endDay.diff(beginDay, 's')
    return result
  }, [startTime, endTime])

  const tooltip = useMemo(() => ({
    formatter(val: number | undefined) {
      const beginDay = dayjs(startTime)
      if (val) {
        return beginDay.add(val, 's').format(YMDHms)
      } else {
        return beginDay.format(YMDHms)
      }
    },
    getPopupContainer() {
      return videoBoxRef.current ? videoBoxRef.current : document.body
    }
  }), [startTime])


  useEffect(() => {
    const handleFullscreenchange = () => {
      const is = !!document.fullscreenElement
      setIsFullscreen(is)
    }
    document.addEventListener('fullscreenchange', handleFullscreenchange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenchange)
    }
  }, [])

  useEffect(() => {
    async function main() {
      if (imageSrc) {
        if (relationInfo) {
          const _src = await getRelationImgSrc(imageSrc, relationInfo)
          setSrc(_src)
        } else {
          setSrc(imageSrc)
        }
        setIsPlayer(false)
      }
    }
    main()
  }, [imageSrc, relationInfo])


  useEffect(() => {
    let ctr: AbortController
    async function main() {
      if (isPlayer && deviceCode && channel && startTime && endTime) {
        ctr = new AbortController()
        setIsLoading(true)
        const params = {
          deviceCode,
          channel,
          startTime,
          endTime
        }
        const vo = await getHistoryVideoInfo(params, ctr)
        setStream(vo.stream)
        setVideoUrl(vo.fmp4)
        setIsLoading(false)
      }
    }
    main()
    return () => {
      ctr?.abort()
    }
  }, [channel, deviceCode, endTime, isPlayer, startTime])


  useEffect(() => {
    let _player: Mp4Player
    if (videoUrl && videoRef.current) {
      _player = new Mp4Player(videoRef.current, videoUrl, { isAutoPlay: true })
      setIsPlay(true)
    }
    return () => {
      _player?.destroy()
    }
  }, [videoUrl])



  const handlePlayer = useCallback(
    () => {
      setIsPlayer(true)
    },
    [],
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

  const handleProgress = useCallback(
    (val: number) => {
      setProgressValue(val)
    },
    [],
  )

  const handleAfterChange = useCallback(
    async () => {
      await seekHistoryStream({ stream: stream, time: progressValue })
    },
    [progressValue, stream],
  )

  const handlePlay = useCallback(
    () => {
      setIsPlay(val => !val)
    },
    [],
  )

  const handleFastForward = useCallback(
    async () => {
      const result = progressValue + 10
      await seekHistoryStream({ stream: stream, time: result })
    },
    [progressValue, stream],
  )

  const handleFastRewind = useCallback(
    async () => {
      const result = progressValue - 10
      await seekHistoryStream({ stream: stream, time: result })
    },
    [progressValue, stream],
  )


  const videoClass = useMemo(() => isPlayer ? styles.videoBox : styles.videoBoxHide, [isPlayer])


  return (
    <article className={styles.wrapper}>

      <section className={videoClass} ref={videoBoxRef} onDoubleClick={handleFull}>
        <video className={styles.video} ref={videoRef} muted />
        {isFullscreen && <div className={styles.closeAlt}>按Esc键退出全屏</div>}
        {isLoading &&
          <aside className={styles.loading}>
            <Spin tip="加载数据中" size='large'></Spin>
          </aside>
        }
        <div className={styles.progressBox}>
          <Button size="small" type="text" onClick={handleFastRewind} title='快退' >
            <i className={`fa fa-backward ${styles.icon}`} aria-hidden="true"></i>
          </Button>
          <Button size="small" type="text" onClick={handlePlay}>
            {isPlay
              ? <i className={`fa fa-pause ${styles.icon}`} aria-hidden="true"></i>
              : <i className={`fa fa-play ${styles.icon}`} aria-hidden="true"></i>
            }
          </Button>
          <Button size="small" type="text" onClick={handleFastForward} title='快进' >
            <i className={`fa fa-forward ${styles.icon}`} aria-hidden="true"></i>
          </Button>
          <Slider
            className={styles.progress}
            min={0}
            max={max}
            tooltip={tooltip}
            value={progressValue}
            onChange={handleProgress}
            onAfterChange={handleAfterChange}
          />
        </div>
      </section>

      {!isPlayer &&
        <section className={styles.imgBox}>
          <ImageSimple
            src={src}
            preview={false}
            width='100%'
            height='100%'
            defaultSrc={imgDefSrc}
          />
          <Button className={styles.iconBox} size="small" type="text" onClick={handlePlayer}>
            <i className={`fa fa-play ${styles.icon}`} aria-hidden="true"></i>
          </Button>
        </section>
      }

    </article>
  )
}

export default VideoImg