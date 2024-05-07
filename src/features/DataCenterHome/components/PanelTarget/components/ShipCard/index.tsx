import ImageSimple from "hooks/basis/ImageSimple";
import _ from "lodash";
import { useCallback, useMemo, } from "react"
import styles from "./index.module.sass";
import shipDefSrc from 'images/default/ship.png'
/* import { getVideoHistoryDataCenter } from "server/device";
import Player from "helper/player";
import { createPlayer } from "helper"; */


interface Props {
  index: number
  slideIdx: number
  data: any
  onClick: (index: any, data: any) => void
}

const ShipCard: React.FC<Props> = ({ index, slideIdx, data, onClick }) => {
  console.debug('ShipCard')

  /* 
    const videoRef = useRef<HTMLVideoElement>(null)
    const videoBoxRef = useRef<HTMLDivElement>(null)
  
  
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [isShowVideo, setIsShowVideo] = useState(true) */

  const handleClick = useCallback((e: any) => {
    onClick(e, data)
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


  /*   useEffect(() => {
      let ctr: AbortController
      let player: Player
      async function main() {
        try {
          if (index === slideIdx && videoRef.current && !_.isEmpty(data.videoUrl)) {
            const videoData: any = _.head(data.videoUrl)
  
            const url = await getVideoHistoryDataCenter(videoData.deviceCode, videoData.channel, videoData.vstartTime, videoData.vendTime, ctr)
            player = createPlayer(videoRef.current, url.ws_flv, { isAutoPlay: true })
            setIsShowVideo(true)
          }
        } catch (err: any) {
          console.warn('获取视频播放地址失败')
          setIsShowVideo(false)
        }
      }
      main()
      return () => {
        ctr?.abort()
        player?.destroy()
      }
    }, [index, slideIdx, data]) */

  /* useEffect(() => {
    const handleFullscreenchange = () => {
      const is = !!document.fullscreenElement
      setIsFullscreen(is)
    }
    document.addEventListener('fullscreenchange', handleFullscreenchange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenchange)
    }
  }, []) */


  /*  const handleFull = useCallback(
     () => {
       if (document.fullscreenElement === videoBoxRef.current) {
         document.exitFullscreen()
       } else {
         videoBoxRef.current?.requestFullscreen()
       }
     },
     [],
   ) */


  return (
    <article className={styles.wrapper}>

      {/* {isShowVideo && <section className={styles.imgBox} >
        <div className={styles.img} onDoubleClick={handleFull} ref={videoBoxRef}>
          {isFullscreen && <div className={styles.closeAlt}>按Esc键退出全屏</div>}
          <video className={styles.video} ref={videoRef} controls={false} />
        </div>
      </section>} */}
      {data.codeType === 6 &&
        <> <section className={styles.imgBox}>
          <ImageSimple className={styles.img} src={imgSrc} defaultSrc={shipDefSrc} />
        </section>

          <section className={styles.content} onClick={() => handleClick(6)}>
            <div className={styles.info}><div>船名:</div><div>{data.cnName}</div></div>
            <div className={styles.info}><div>MMSI:</div><div>{data.mmsi}</div></div>
            <div className={styles.info}><div>经纬度:</div><div>{data.lngDeg},{data.latDeg}</div></div>
            <div className={styles.info}><div>航速航向:</div><div>{data.sog}节/{data.trueHeading % 360}</div></div>
            <div className={styles.info}><div>时间:</div><div>{data.capTime}</div></div>
          </section>
        </>
      }
      {data.codeType === 0 &&
        <> <section className={styles.imgBox}>
          <ImageSimple className={styles.img} src={data.picUrl1} defaultSrc={shipDefSrc} />
        </section>

          <section className={`${styles.content} ${styles.facetops}`} onClick={() => handleClick(0)}>
            <div className={styles.info}><div>地点:</div><div>{data.deviceName}</div></div>
            <div className={styles.info}><div>时间:</div><div>{data.capTime}</div></div>
          </section>
        </>
      }
      {data.codeType === 1 &&
        <> <section className={styles.imgBox}>
          <ImageSimple className={styles.img} src={data.picUrls} defaultSrc={shipDefSrc} />
        </section>

          <section className={`${styles.content} ${styles.tops}`} onClick={() => handleClick(1)}>
            <div className={styles.info}>
              <div>车牌:</div>
              <div>{data.plateNo}</div>
            </div>
            <div className={styles.info}><div>地点:</div><div title={data.deviceName}>{data.deviceName}</div></div>
            <div className={styles.info}><div>时间:</div><div>{data.capTime}</div></div>
          </section>
        </>
      }


    </article>
  )
}

export default ShipCard