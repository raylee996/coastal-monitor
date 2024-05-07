import ButtonSmall from "component/ButtonSmall"
import { useCallback, useEffect, useState } from "react"
import useRealtimeVideo from "useHook/useRealtimeVideo"
import styles from './index.module.sass'

interface Props {
  // 提示框key值
  notificationKey: string
  // 取消跟踪
  continueFollow: Function,
  // 继续跟踪
  cancelContinueFollow: Function
  // 倒计时时间
  count: number
  // 联动需要的数据
  data?: any,
  notificationApi?: any
}

const WarnContinueFollow: React.FC<Props> = ({ notificationKey, continueFollow, cancelContinueFollow, count, data, notificationApi }) => {

  const [timeCount, setTimeCount] = useState(count)

  // 实时视频
  let handleOpenRealtimeWin = useRealtimeVideo()

  const handleExitFullscreen = useCallback(
    () => {
      document.fullscreenElement && document.exitFullscreen()
    },
    [],
  )

  useEffect(() => {
    let timer: any;
    timer = setInterval(() => {
      setTimeCount((val: number) => {
        if (val <= 1) {
          clearInterval(timer)
          return 0
        }
        return val - 1
      })
    }, 1000)

    return () => {
      timer && clearInterval(timer)
    }
  }, [])


  function handleCloseNotification() {
    notificationApi.destroy(notificationKey)
    cancelContinueFollow()
  }

  function handleContinue() {
    notificationApi.destroy(notificationKey)
    continueFollow()
    handleVideo()
    handleExitFullscreen()
  }

  // 打开视频
  function handleVideo() {
    handleOpenRealtimeWin({
      deviceCode: data.deviceCode
    })
    /*   windowUI(<RealTimeVideo deviceCode={data.deviceCode} channel={data.channel} />, {
          title: `跟踪视频:${data.deviceName}`,
          key: '目标跟踪',
          width: '820px',
          height: 'auto',
          offset: [1100, 55]
        }) */
  }

  return <>
    <section className={styles.text}>
      是否继续联动跟踪？{timeCount}
    </section>
    <footer>
      <ButtonSmall className={styles.action} onClick={handleCloseNotification} name='取消' />
      <ButtonSmall className={styles.action} onClick={handleContinue} name='继续跟踪' />
    </footer>
  </>
}

export default WarnContinueFollow