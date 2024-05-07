import styles from "./index.module.sass";
import { useEffect, useState } from "react";

interface IMediaVideo {
  width?: any
  height?: any
  src?: any
  controls?: any
  /**父级样式 */
  styleStr?: any
}

const MediaVideo: React.FC<IMediaVideo> = (props) => {
  console.debug('MediaVideo')
  const { width, height, src, controls, styleStr } = props

  const [videoSrc, setVideoSrc] = useState('')

  useEffect(() => {
    setVideoSrc(src)
  }, [src])

  return (
    <article className={`${styles.wrapper}`} style={{ ...styleStr }}>
      <video width={width} height={height} controls={controls} src={videoSrc} />
    </article>
  )
}

MediaVideo.defaultProps = {
  width: '320px',
  height: '240px',
  controls: true
}
export default MediaVideo