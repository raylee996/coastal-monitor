import { Radio, RadioChangeEvent } from "antd";
import RealTimeMonitor from "features/Core/components/RealTimeMonitor";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import JessibucaProHistoryMonitor from "./components/JessibucaProHistoryMonitor";
import styles from "./index.module.sass";


const VideoData: React.FC = () => {
  console.debug('VideoData')

  const { state } = useLocation() as { state: any }


  const [type, setType] = useState(1)


  const codes = useMemo(() => {
    if (state?.deviceCodes) {
      return state.deviceCodes
    } else {
      return undefined
    }
  }, [state])

  const code = useMemo(() => {
    if (state?.deviceCode) {
      return state.deviceCode
    } else {
      return undefined
    }
  }, [state])


  const handleChange = useCallback(
    ({ target: { value } }: RadioChangeEvent) => {
      setType(value)
    },
    [],
  )

  useEffect(() => {
    if (state && state.videoDataRadio) {
      setType(state.videoDataRadio)
    }
  }, [state])



  return (
    <article className={styles.wrapper}>
      <header>
        <span>播放类型：</span>
        <Radio.Group onChange={handleChange} value={type}>
          <Radio value={1}>历史视频</Radio>
          <Radio value={2}>实时视频</Radio>
        </Radio.Group>
      </header>
      <section className={styles.content}>
        {type === 1 && <JessibucaProHistoryMonitor code={code} />}
        {type === 2 && <RealTimeMonitor checkCameraList={codes} />}
      </section>
    </article>
  )
}

export default VideoData