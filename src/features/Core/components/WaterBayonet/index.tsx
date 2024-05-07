import { Row, Col } from 'antd'
import RightTotal from './components/RightTotal'
import styles from "./index.module.sass";
import { useCallback, useEffect, useRef, useState } from 'react';
import Player from 'helper/player';
import { createPlayer } from 'helper';


//水域卡口
const WaterBayonet: React.FC = () => {
  console.debug('WaterBayonet')

  // 全景视频
  const allViewVideoRef = useRef<HTMLVideoElement>(null)
  const allViewBoxRef = useRef<HTMLElement>(null)
  const [allViewVideoUrl, setAllViewVideoUrl] = useState('')

  // 细节视频
  const detailViewVideoRef = useRef<HTMLVideoElement>(null)
  const detailViewBoxRef = useRef<HTMLElement>(null)
  const [detailViewVideoUrl, setDetailViewVideoUrl] = useState('')


  // 创建全景视频播放对象
  useEffect(() => {
    let player: Player
    if (allViewVideoRef.current && allViewVideoUrl) {
      player = createPlayer(allViewVideoRef.current, allViewVideoUrl, { isAutoPlay: true })
    }
    return () => {
      player?.destroy()
    }
  }, [allViewVideoUrl])

  // 创建细节视频播放对象
  useEffect(() => {
    let player: Player
    if (detailViewVideoRef.current && detailViewVideoUrl) {
      player = createPlayer(detailViewVideoRef.current, detailViewVideoUrl, { isAutoPlay: true })
    }
    return () => {
      player?.destroy()
    }
  }, [detailViewVideoUrl])


  // 切换设备时触发
  const handleDeviceChange = useCallback(
    async (val: any) => {
      for (let i = 0; i < val.length; i++) {
        if (val[i].workType === '3') { //全景-可见光
          setAllViewVideoUrl(val[i].visibleLightUrl)
        } else if (val[i].workType === '4') {//细节-可见光
          setDetailViewVideoUrl(val[i].visibleLightUrl)
        }
      }
    },
    [],
  )

  // 全景视频双击全屏
  const handleAllFull = useCallback(
    () => {
      if (document.fullscreenElement === allViewBoxRef.current) {
        document.exitFullscreen()
      } else {
        allViewBoxRef.current && allViewBoxRef.current.requestFullscreen()
      }
    },
    [],
  )

  // 细节视频双击全屏
  const handleDetailFull = useCallback(
    () => {
      if (document.fullscreenElement === detailViewBoxRef.current) {
        document.exitFullscreen()
      } else {
        detailViewBoxRef.current && detailViewBoxRef.current.requestFullscreen()
      }
    },
    [],
  )


  return (
    <article className={styles.wrapper}>
      <Row className={styles.content} gutter={20}>
        <Col span={10}>
          <div className={styles.videoWrapper}>
            <section className={styles.videoBox} onDoubleClick={handleAllFull} ref={allViewBoxRef}>
              <video className={styles.video} ref={allViewVideoRef} controls={false}></video>
              {!allViewVideoUrl && <div className={styles.alt}>暂无全景视频</div>}
            </section>
            <section className={styles.videoBox} onDoubleClick={handleDetailFull} ref={detailViewBoxRef}>
              <video className={styles.video} ref={detailViewVideoRef} controls={false}></video>
              {!detailViewVideoUrl && <div className={styles.alt}>暂无细节视频</div>}
            </section>
          </div>

        </Col>
        <Col span={14}>
          <RightTotal changeSelect={handleDeviceChange} />
        </Col>
      </Row>
    </article>
  )
}

export default WaterBayonet