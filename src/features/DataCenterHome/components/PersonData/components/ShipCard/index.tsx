import ImageSimple from "hooks/basis/ImageSimple";
import _ from "lodash";
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import styles from "./index.module.sass";
import shipDefSrc from 'images/default/ship.png'
import { getCameraDeviceUrl } from "server/device";
import Player from "helper/player";
import { createPlayer } from "helper";


interface Props {
  index: number
  slideIdx: number
  data: any
  onClick: (data: any) => void
}

const ShipCard: React.FC<Props> = ({ index, slideIdx, data, onClick }) => {
  console.debug('ShipCard')


  const videoRef = useRef<HTMLVideoElement>(null)
  const videoBoxRef = useRef<HTMLDivElement>(null)


  const [isFullscreen, setIsFullscreen] = useState(false)


  const handleClick = useCallback(() => {
    onClick(data)
  }, [data, onClick])


  const imgSrc = useMemo(() => {
    if (_.isEmpty(data.picUrl)) {
      return ''
    } else {
      const head: string = data.picUrl[0]
      const list = head.split(',')
      return list[0]
    }
  }, [data])


  useEffect(() => {
    let ctr: AbortController
    let player: Player
    async function main() {
      try {
        if (index === slideIdx && videoRef.current && !_.isEmpty(data.videoUrl)) {
          const videoData: any = _.head(data.videoUrl)
          const url = await getCameraDeviceUrl(videoData.deviceCode, videoData.channel, ctr)
          player = createPlayer(videoRef.current, url, { isAutoPlay: true })
        }
      } catch (err: any) {
        console.warn('获取视频播放地址失败')
      }
    }
    main()
    return () => {
      ctr?.abort()
      player?.destroy()
    }
  }, [index, slideIdx, data])

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


  return (
    <article className={styles.wrapper}>

      <section className={styles.imgBox} >
        <div className={styles.img} onDoubleClick={handleFull} ref={videoBoxRef}>
          {isFullscreen && <div className={styles.closeAlt}>按Esc键退出全屏</div>}
          <video className={styles.video} ref={videoRef} controls={false} />
        </div>
      </section>

      <section className={styles.imgBox}>
        <ImageSimple className={styles.img} src={imgSrc} defaultSrc={shipDefSrc} />
      </section>

      <section className={styles.content} onClick={handleClick}>
        <div className={styles.info}><div>船名:</div><div>{data.cnName}</div></div>
        <div className={styles.info}><div>MMSI:</div><div>{data.mmsi}</div></div>
        <div className={styles.info}><div>经纬度:</div><div>{data.lngDeg},{data.latDeg}</div></div>
        <div className={styles.info}><div>航速航向:</div><div>{data.sog}节/{data.trueHeading % 360}</div></div>
        <div className={styles.info}><div>时间:</div><div>{data.capTime}</div></div>
      </section>

    </article>
  )
}

export default ShipCard