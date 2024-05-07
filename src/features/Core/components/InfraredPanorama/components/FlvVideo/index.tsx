import FlvPlayer from "helper/player/FlvPlayer";
import { useEffect, useRef } from "react";
import styles from "./index.module.sass";


interface Props {
  url?: string
}

const FlvVideo: React.FC<Props> = ({ url }) => {
  console.debug('FlvVideo')

  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    let flvPlayer: FlvPlayer
    if (videoRef.current && url) {
      flvPlayer = new FlvPlayer(videoRef.current, url, { isAutoPlay: true })
    }
    return () => {
      flvPlayer?.destroy()
    }
  }, [url])

  return (
    <article className={styles.wrapper}>
      <video ref={videoRef}></video>
    </article>
  )
}

export default FlvVideo