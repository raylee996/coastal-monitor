import { Button, message } from "antd";
import ImageSimple from "hooks/basis/ImageSimple";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import VideoLargeScreen from "./components/VideoLargeScreen";
import styles from "./index.module.sass";
import imgDefSrc from 'images/video/video_def.jpg'


/** 华为云获取视频参数 */
export interface HuaweiCloudProps {
  /** 开始时间 */
  startTime?: string
  /** 结束时间 */
  endTime?: string
  /** 视频通道 */
  deviceChannelCode?: string
  /** 设备id */
  deviceCode?: string
}

export interface VideoSimpleProps {
  /** 视频资源访问地址 */
  src?: string
  /** 获取云服务器视频 */
  getVideoParams?: HuaweiCloudProps
  /** 视频缩略图 */
  posterImage?: string
  /** 是否显示进度条 */
  isShowPlayerTime?: boolean
  /** 是否显示进度条*/
  isAutoPlay?: boolean
}

const VideoSimple: React.FC<VideoSimpleProps> = ({ src, getVideoParams, posterImage, isShowPlayerTime, isAutoPlay }) => {
  console.debug('VideoSimple')


  const videoBoxRef = useRef<any>(null)


  const [isPlayer, setIsPlayer] = useState<boolean>(isAutoPlay ? isAutoPlay : false)
  const [isEffective, setIsEffective] = useState<boolean>(true)
  const [isFullscreen, setIsFullscreen] = useState(false)


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
    if (isAutoPlay) {
      return
    }
    setIsPlayer(false)
  }, [getVideoParams, src, isAutoPlay])

  // function handleClick(e: any) {
  //   // 视频无法播放时提示用户
  //   if (!isEffective) {
  //     message.error('视频无法播放')
  //     return
  //   }
  //   setIsPlayer(true)
  // }

  const handleClick = useCallback(
    (e: any) => {
      e.stopPropagation()
      if (!isEffective) {
        message.error('视频无法播放')
        return
      }
      setIsPlayer(true)
    },
    [isEffective],
  )

  const handleReset = useCallback(() => setIsPlayer(false), [])


  const contentJsx = useMemo(() => {
    if (src) {
      return <video muted controls>
        <source src={src} type="video/mp4"></source>
        <source src={src} type="video/webm"></source>
        <source src={src} type="video/ogg"></source>
        您的浏览器不支持Video标签。
      </video>
    } else {
      // const test = {
      //   deviceCode: '44030500101325247247',
      //   deviceChannelCode: "44030500101325547247",
      //   startTime: '2023-04-20 04:16:24',
      //   endTime: '2023-04-20 15:00:24'
      // }
      return <VideoLargeScreen
        getVideoParams={getVideoParams}
        // getVideoParams={test}
        setIsEffective={setIsEffective}
        handleOpenPopupVideo={handleFull}
        playResetFunc={handleReset}
        isShowPlayerTime={isShowPlayerTime}
      />
    }
  }, [src, getVideoParams, handleFull, handleReset, isShowPlayerTime])


  return (
    <div className={styles.wrapper} ref={videoBoxRef} >
      {isFullscreen && <div className={styles.closeAlt}>按Esc键退出全屏</div>}
      {isPlayer ?
        contentJsx :
        <ImageSimple src={posterImage} preview={false} width={'100%'} height={'100%'} onDoubleClick={handleFull} defaultSrc={imgDefSrc} />
      }
      {getVideoParams && !isPlayer &&
        <Button className={styles.iconBox} size="small" type="text" onClick={(e) => handleClick(e)}>
          <i className={`fa fa-play ${styles.icon}`} aria-hidden="true"></i>
        </Button>
      }
    </div>
  )
}

export default VideoSimple