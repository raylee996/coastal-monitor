import { useAppDispatch } from "app/hooks";
import Player from "helper/player";
import JessibucaProPlayer from "helper/player/JessibucaProPlayer";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getVideoUrlByLevel } from "server/device";
import { setIndex, setParams } from "slice/funMenuSlice";
import styles from "./index.module.sass";


interface Props {
  className?: string
  data?: any
  index: number
  currentIdx: number
  length: number
}

const VideoCard: React.FC<Props> = ({ className, data, index, currentIdx, length }) => {
  console.debug('VideoCard')


  const navigate = useNavigate();
  const dispatch = useAppDispatch()


  const videoRef = useRef<HTMLDivElement>(null)


  const [isPlay, setPlay] = useState(false)
  const [isFull, setIsFull] = useState(false)
  const [altText, setAltText] = useState('')

  const [isWhite, setIsWhite] = useState(() => {
    let date = new Date()
    let hour = date.getHours()
    if (hour >= 18 || hour <= 6) {
      return false
    } else {
      return true
    }
  })

  useEffect(() => {
    const timer = setInterval(() => {
      let data = localStorage.getItem('skin')
      if(data) {
        let param = JSON.parse(data)
        if(!param.auto){
          return
        }
      }
      let date = new Date()
      let hour = date.getHours()
      if (hour >= 18 || hour <= 6) {
        setIsWhite(false)
      } else {
        setIsWhite(true)
      }
    }, 1000 * 60 * 10)
    return () => clearInterval(timer)
  }, [])

  useEffect(()=>{
    const times = setInterval(()=>{
      let data = localStorage.getItem('skin')
      if(data) {
        let param = JSON.parse(data)
        if(param.sun && !param.moon ) {
          setIsWhite(true)
        } 
        if(!param.sun && param.moon ) {
          setIsWhite(false)
        }
        if(param.auto) {
          let date = new Date()
          let hour = date.getHours()
          if (hour >= 18 || hour <= 6) {
            setIsWhite(false)
          } else {
            setIsWhite(true)
          }
        }
      }
    },1000)
    return () => clearInterval(times)
  },[])


  useEffect(() => {
    const leftIdx = currentIdx
    const rightIdx = currentIdx + 1 < length ? currentIdx + 1 : 0
    if ((index === leftIdx || index === rightIdx) || isFull) {
      setPlay(true)
    } else {
      setPlay(false)
    }
  }, [index, length, currentIdx, isFull])


  useEffect(() => {
    let _player: Player
    async function main() {
      try {
        if (videoRef.current && data && isPlay) {
          setAltText('加载视频中...')
          const level = isFull ? 0 : 1
          const vo = await getVideoUrlByLevel(data.deviceCode, data.channelCode, level)
          setAltText('')
          if (vo.url) {
            _player = new JessibucaProPlayer(videoRef.current, vo.url, { isAutoPlay: true })
          } else {
            setAltText('无视频播放地址')
          }
        }
      } catch (error) {
        console.warn('VideoCard', error)
        setAltText('获取视频播放地址异常')
      }
    }
    main()
    return () => {
      _player?.destroy()
    }
  }, [data, isFull, isPlay])

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.onfullscreenchange = (evt: Event) => {
        if (document.fullscreenElement) {
          setIsFull(true)
        } else {
          setIsFull(false)
        }
      }
    }
  }, [])


  const handleFull = useCallback(
    () => {
      videoRef.current && videoRef.current.requestFullscreen()
    },
    [],
  )

  const handleClick = useCallback(
    () => {
      navigate('core')
      dispatch(setIndex(7))
      if (data.placeId) {
        dispatch(setParams({
          placeId: data.placeId,
          checkCameraList: [data.deviceCode]
        }))
      } else {
        dispatch(setParams({
          checkCameraList: [data.deviceCode]
        }))
      }

    },
    [data, dispatch, navigate],
  )


  const articleClass = useMemo(() => isWhite ? className ? `${styles.wrapperwhite} ${className}` : styles.wrapperwhite : styles.wrapper, [className, isWhite])


  return (
    <article className={articleClass} onClick={handleClick}>
      {/* <video ref={videoRef} muted onDoubleClick={handleFull} data-video='VideoCard' /> */}
      <div ref={videoRef} onDoubleClick={handleFull} data-video='VideoCard' />
      {altText &&
        <div className={styles.alt}>
          <span>{altText}</span>
        </div>
      }
    </article>
  )
}

export default VideoCard