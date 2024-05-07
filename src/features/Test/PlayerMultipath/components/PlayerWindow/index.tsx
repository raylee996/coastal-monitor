import { Button, Input } from "antd";
import { createPlayer } from "helper";
import Player from "helper/player";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./index.module.sass";


const PlayerWindow: React.FC = () => {
  console.debug('PlayerWindow')


  const videoRef = useRef<HTMLVideoElement>(null)
  const videoBoxRef = useRef<HTMLElement>(null)


  const [url, setUrl] = useState('')
  const [realUrl, setRealUrl] = useState('')


  useEffect(() => {
    let _player: Player

    if (videoRef.current && realUrl) {
      _player = createPlayer(videoRef.current, realUrl, { isAutoPlay: true })
    }

    return () => {
      _player?.destroy()
    }
  }, [realUrl])


  const handleChange = useCallback(
    ({ target: { value } }: any) => {
      setUrl(value)
    },
    [],
  )

  const handleOk = useCallback(
    () => {
      setRealUrl(url)
    },
    [url],
  )

  const handleClose = useCallback(
    () => {
      setUrl('')
      setRealUrl('')
    },
    [],
  )


  // 双击全屏
  const handleFull = useCallback(
    () => {
      if (document.fullscreenElement === videoBoxRef.current) {
        document.exitFullscreen()
      } else {
        videoBoxRef.current && videoBoxRef.current.requestFullscreen()
      }
    },
    [],
  )


  return (
    <article className={styles.wrapper}>
      <section onDoubleClick={handleFull} ref={videoBoxRef}>
        <video ref={videoRef} controls={false} />
      </section>
      <footer>
        <Input size="small" value={url} onChange={handleChange} />
        <Button onClick={handleOk} type='primary'>确认</Button>
        <Button onClick={handleClose} type='default'>关闭</Button>
      </footer>
    </article>
  )
}


export default PlayerWindow