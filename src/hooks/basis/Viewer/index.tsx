import { Button, ConfigProvider, Tabs } from "antd";
import { store } from "app/store";
import React, { CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import styles from "./index.module.sass";
import './index.css'
import zhCN from 'antd/lib/locale/zh_CN';
import { CloseOutlined, PictureOutlined, VideoCameraOutlined } from "@ant-design/icons";
import ImageSimple, { IMAGE_FALL_BACK } from "../ImageSimple";
import _ from "lodash";
import { createPlayer } from "helper";


interface ImgViewerProps {
  /** 图片访问地址 */
  src?: string
}

const ImgViewer: React.FC<ImgViewerProps> = ({ src }) => {

  const boxRef = useRef<HTMLElement>(null)

  const [realSrc, setRealSrc] = useState(src)
  const [imgStyle, setImgStyle] = useState<CSSProperties>({})
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({
    offsetMove: { x: 0, y: 0 },
    offsetDown: { x: 0, y: 0 }
  })

  useEffect(() => {
    setImgStyle({})
    setRealSrc(src)
    setOffset({
      offsetMove: { x: 0, y: 0 },
      offsetDown: { x: 0, y: 0 }
    })
  }, [src])

  useEffect(() => {
    let boxEle: HTMLElement

    function handleWheel(evt: WheelEvent) {
      evt.stopPropagation();
      evt.preventDefault();
      if (evt.deltaY > 0) { // 向下滚动
        setScale(val => {
          if (val > 0.2) {
            val -= 0.1
          }
          return val
        })
      } else { // 向上滚动
        setScale(val => {
          if (val > 0.1) {
            val += 0.1
          }
          return val
        })
      }
    }

    const MouseDown = {
      x: 0,
      y: 0
    }

    function handleMouseDown(evt: MouseEvent) {
      evt.stopPropagation();
      evt.preventDefault();
      boxEle.addEventListener('mousemove', handleMousemove)
      boxEle.addEventListener('mouseout', handleRemoveMouse)
      MouseDown.x = evt.offsetX
      MouseDown.y = evt.offsetY
    }

    function handleRemoveMouse(evt: MouseEvent) {
      evt.stopPropagation();
      evt.preventDefault();
      boxEle.removeEventListener('mousemove', handleMousemove)
      boxEle.removeEventListener('mouseout', handleRemoveMouse)
      setOffset(val => ({
        offsetDown: {
          x: val.offsetDown.x + val.offsetMove.x,
          y: val.offsetDown.y + val.offsetMove.y
        },
        offsetMove: { x: 0, y: 0 }
      }))
    }

    function handleMousemove(evt: MouseEvent) {
      setOffset(val => ({
        ...val,
        offsetMove: {
          x: evt.offsetX - MouseDown.x,
          y: evt.offsetY - MouseDown.y
        }
      }))
    }

    if (boxRef.current) {
      boxEle = boxRef.current
      boxEle.addEventListener('wheel', handleWheel)
      boxEle.addEventListener('mousedown', handleMouseDown)
      boxEle.addEventListener('mouseup', handleRemoveMouse)
    }

    return () => {
      if (boxEle) {
        boxEle.removeEventListener('wheel', handleWheel)
        boxEle.removeEventListener('mousedown', handleMouseDown)
        boxEle.removeEventListener('mouseup', handleRemoveMouse)
      }
    }
  }, [])

  useEffect(() => {
    setImgStyle({
      transform: `scale(${scale}, ${scale})`,
      top: offset.offsetDown.y + offset.offsetMove.y,
      left: offset.offsetDown.x + offset.offsetMove.x
    })
  }, [scale, offset])

  function handleError() {
    setRealSrc(IMAGE_FALL_BACK)
  }

  return (
    <article className={styles.imgViewer} ref={boxRef}>
      <div className={styles.imageBox} >
        <img className={styles.image} style={imgStyle} src={realSrc} alt="图片" onError={handleError} />
      </div>
      <div className={styles.mask}></div>
    </article>
  )
}

interface VideoViewerProps {
  /** 视频地址 */
  videoSrc?: string
  /** 视频封面 */
  imgSrc?: string
}

const VideoViewer: React.FC<VideoViewerProps> = ({ videoSrc }) => {

  const boxRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const boxEle = boxRef.current
    let videoEle: HTMLVideoElement
    let flvPlayer: any

    if (boxEle && videoSrc) {
      videoEle = document.createElement('video')
      videoEle.className = styles.video
      flvPlayer = createPlayer(videoEle, videoSrc)
      boxEle.appendChild(videoEle)
    }

    return () => {
      flvPlayer && flvPlayer.destroy()
      boxEle && videoEle && boxEle.removeChild(videoEle)
    }
  }, [videoSrc])

  return (
    <article className={styles.videoViewer} ref={boxRef}></article>
  )
}

interface Params {
  /** 图片列表 */
  imgList?: string[]
  /** 获取图片列表的远程请求 */
  imgListRemote?: (signal: AbortController) => Promise<string[]>
  /** 视频列表 */
  videoList?: VideoViewerProps[]
}

interface Props extends Params {
  /** 清除弹出层组件挂载函数 */
  onUnmount: Function
}

const Viewer: React.FC<Props> = ({ onUnmount, imgList, imgListRemote, videoList }) => {
  console.debug('Viewer')


  const [viewerRoot] = useState<HTMLElement>(() => {
    let viewerRoot = document.getElementById('viewer-root');
    if (viewerRoot) {
      return viewerRoot
    } else {
      viewerRoot = document.createElement('div')
      viewerRoot.id = 'viewer-root'
      viewerRoot.className = styles.viewerRoot
      document.body.appendChild(viewerRoot)
      return viewerRoot
    }
  })
  const [realImgs, setRealImgs] = useState(imgList)
  const [activeKey, setActiveKey] = useState('1')
  const [targetImg, setTargetImg] = useState(() => _.isEmpty(imgList) ? undefined : _.head(imgList))
  const [targetVideo, setTargetVideo] = useState(() => _.isEmpty(videoList) ? undefined : _.head(videoList))


  useEffect(() => {
    let ctr: AbortController
    async function main() {
      if (imgListRemote) {
        ctr = new AbortController()
        const _imgList = await imgListRemote(ctr)
        setTargetImg(_.head(_imgList))
        setRealImgs(_imgList)
      }
    }
    main()
    return () => {
      ctr?.abort()
    }
  }, [imgListRemote])



  const handleClose = useCallback(
    () => {
      onUnmount()
    },
    [onUnmount],
  )

  const handleChange = useCallback(
    (_activeKey: string) => {
      setActiveKey(_activeKey)
    },
    [],
  )

  const handleImage = useCallback(
    (src: string) => {
      setTargetImg(src)
    },
    [],
  )

  const handleVideo = useCallback(
    (item: VideoViewerProps) => {
      setTargetVideo(item)
    },
    [],
  )


  const imgListJSX = useMemo(() => (
    <article className={styles.imgList}>
      {realImgs?.map((src, index) =>
        <section className={`${styles.imgItem} Viewer__imgList__item`} key={index} onClick={() => handleImage(src)}>
          <ImageSimple src={src} preview={false} />
        </section>
      )}
    </article>
  ), [handleImage, realImgs])

  const videoListJSX = useMemo(() => (
    <article className={styles.videoList}>
      {videoList?.map((item, index) =>
        <section className={`${styles.videoItem} Viewer__videoList__item`} key={index} onClick={() => handleVideo(item)}>
          <ImageSimple src={item.imgSrc} preview={false} />
        </section>
      )}
    </article>
  ), [handleVideo, videoList])

  const items = useMemo(() => [{
    label: (
      <span>
        <PictureOutlined />
        照片
      </span>
    ),
    key: '1',
    children: imgListJSX,
  }, {
    label: (
      <span>
        <VideoCameraOutlined />
        视频
      </span>
    ),
    key: '2',
    children: videoListJSX,
  }], [imgListJSX, videoListJSX])


  const setImageVideoShow = useCallback(
    () => {
      let keys: string[] = []
      realImgs?.length && keys.push('1')
      videoList?.length && keys.push('2')
      return items.filter(item => keys.includes(item.key))
    },
    [realImgs, items, videoList],
  )


  return ReactDOM.createPortal(
    <article className={`${styles.wrapper} hooks__Viewer-wrapper`}>
      <article className={styles.content}>
        <section className={styles.closeViewer}>
          <Button shape="circle" icon={<CloseOutlined />} size="large" onClick={handleClose} />
        </section>
        <section className={styles.view}>
          {activeKey === '1' && <ImgViewer src={targetImg} />}
          {activeKey === '2' && <VideoViewer {...targetVideo} />}
        </section>
        <footer className={`${styles.footer} hooks__Viewer-footer`}>
          <Tabs
            activeKey={activeKey}
            items={setImageVideoShow()}
            onChange={handleChange}
          />
        </footer>
      </article>
    </article>,
    viewerRoot
  );
}

const viewer = (params: Params) => {
  const container = document.createElement('div');
  const root = createRoot(container);

  function onUnmount() {
    root.unmount();
  }

  root.render(
    <React.StrictMode>
      <Provider store={store}>
        <ConfigProvider locale={zhCN}>
          <Viewer onUnmount={onUnmount} {...params} />
        </ConfigProvider>
      </Provider>
    </React.StrictMode>
  );
}

export default viewer