import styles from "./index.module.sass";
import { useEffect, useRef } from "react";
import { doGetDeviceRTSP } from "server/situation";
import FlvPlayer from "helper/player/FlvPlayer";

interface IMediaRealTimeVideo {
  width?: any
  height?: any
  src?: any
  /**滚动时间 */
  rollTime?: any
  /**设备code、channel编号 */
  deviceInfo?: any
  controls?: any
  index?: any
  playIndex?: any
  /**N秒前结束播放，断开播放地址 */
  beforRollTime?: any
  /**播放的个数 */
  slidesToShow?: any
  total?: any
}


const MediaRealTimeVideo: React.FC<IMediaRealTimeVideo> = (props) => {
  console.debug('MediaRealTimeVideo')
  const { width, height, deviceInfo, controls, rollTime, index, playIndex, beforRollTime, slidesToShow, total } = props

  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    let _flvPlayer: FlvPlayer
    setTimeout(() => {
      // 获取设备的rtsp流信息
      async function getDeviceRTSPInfo() {

        const vo = await doGetDeviceRTSP({
          deviceCode: deviceInfo.deviceCode,
          deviceChannelCode: deviceInfo.channelCode
        })

        if (videoRef.current) {
          _flvPlayer = new FlvPlayer(videoRef.current, vo.ws_flv, { isAutoPlay: true })

          setTimeout(() => {
            _flvPlayer.destroy()
          }, rollTime - beforRollTime)
        }
      }
      if (deviceInfo && deviceInfo.deviceCode && deviceInfo.channelCode) {

        if (total / slidesToShow === 0) {
          //偶数总数时
          for (let i = 0; i < slidesToShow; i++) {
            if (playIndex + i === index) {
              getDeviceRTSPInfo()
              break;
            }
          }
        } else {

          if (Math.ceil(total / slidesToShow) === ((playIndex + slidesToShow) / slidesToShow)) {
            // 最后一页 最后一个元素，0
            if ((playIndex === index) || (0 === index)) {
              getDeviceRTSPInfo()
            }
          }
          else {
            for (let i = 0; i < slidesToShow; i++) {
              if (playIndex + i === index) {
                getDeviceRTSPInfo()
                break;
              }
            }
          }
        }

      }

      return () => {
        _flvPlayer && _flvPlayer.destroy()
      }
    }, 1000)



  }, [deviceInfo, playIndex, beforRollTime, index, rollTime, slidesToShow, total])


  return (
    <article className={styles.wrapper}>
      {/* <div className={styles.videoInfo}>
        <p>index={index}</p>
        <p>playIndex={playIndex}</p>
      </div> */}
      <video width={width} height={height} controls={controls} ref={videoRef} />
    </article>
  )
}

MediaRealTimeVideo.defaultProps = {
  width: '320px',
  height: '240px',
  controls: true,
  beforRollTime: 1500
}
export default MediaRealTimeVideo