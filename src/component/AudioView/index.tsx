import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { Button, Image } from "antd";
import VideoCommon from "component/VideoCommon";
import XcEmpty from "component/XcEmpty";
import ImageSimple from "hooks/basis/ImageSimple";
import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./index.module.sass";

interface AudioViewProps {
  /** 自定义图片视频title */
  title?: string
  isActiveImage?: boolean
  /** 视频数据 */
  videoList?: {
    /** id */
    id: string;
    /** 视频地址 */
    videoUrl: string
    /** 视频类型 02-可直接播放 03-华为云拉流播放视频 */
    fileType: string
    /** 视频缩略图 */
    picUrl?: string
    /** 华为云视频播放参数集合 */
    vstartTime?: string
    vendTime?: string
    channel?: string
    deviceCode?: string
  }[]
  /** 图片数据 */
  imageList?: {
    /** id */
    id: string;
    /** 图片地址 */
    picUrl: string
    /** 待扩展...... */
  }[]
}

const AudioView: React.FC<AudioViewProps> = ({ title, videoList, imageList, isActiveImage }) => {
  console.debug('AudioView')


  const [activeUrl, setActiveUrl] = useState<any>()
  const [activeId, setActiveId] = useState<string>('')
  const [activeImage, setActiveImage] = useState(isActiveImage === false ? false : true)
  const [visible, setVisible] = useState(false);
  const [numberScale, setNumberScale] = useState(1);

  const [isDisableLeftBtn, setIsDisableLeftBtn] = useState(false)
  const [isDisableRightBtn, setIsDisableRightBtn] = useState(false)
  const [currentImgIndex, setCurrentImgIndex] = useState(0)

  // 设置初始选中值
  useEffect(() => {
    activeImage
      ? handleChangeActive(imageList?.length ? imageList[0].id : '', imageList?.length ? imageList[0] : '')
      : handleChangeActive(videoList?.length ? videoList[0].id : '', videoList?.length ? videoList[0] : '')
  }, [activeImage, imageList, videoList])


  function handleClick(val: boolean) {
    setActiveImage(val)
  }

  function handleChangeActive(id: string, obj: any) {
    setActiveId(id || '')
    setActiveUrl(obj)
    setNumberScale(1)
  }

  const handleClickLeft = useCallback(
    () => {
      if (imageList) {
        const currentIndex = imageList.findIndex(item => item.id === activeId)
        let target: any
        setCurrentImgIndex(currentIndex)
        if (currentIndex === 0) {
          return
        }
        if (currentIndex === 0) {
          target = imageList[imageList.length - 1]
        } else {
          const previousIndex = currentIndex - 1
          target = imageList[previousIndex]
        }
        setActiveId(target.id)
        setActiveUrl(target)
        setNumberScale(1)
        // 当前图片滚动到可视区
        const imgBottom = document.getElementById(target.id)!;
        imgBottom.scrollIntoView({
          behavior: 'smooth',
          block: 'end',
          inline: 'start'
        })
      }
    },
    [imageList, activeId],
  )

  const handleClickRight = useCallback(
    () => {
      if (imageList) {
        const currentIndex = imageList.findIndex(item => item.id === activeId)
        let target: any
        setCurrentImgIndex(currentIndex)
        if (currentIndex === imageList.length - 1) {
          return
        }
        if (currentIndex === imageList.length - 1) {
          target = imageList[0]
        } else {
          const nextIndex = currentIndex + 1
          target = imageList[nextIndex]
        }
        setActiveId(target.id)
        setActiveUrl(target)
        setNumberScale(1)
        // 当前图片滚动到可视区
        const imgBottom = document.getElementById(target.id)!;
        imgBottom.scrollIntoView({
          behavior: 'smooth',
          block: 'end',
          inline: 'start'
        })
      }
    },
    [imageList, activeId],
  )

  useEffect(() => {
    setIsDisableLeftBtn(false)
    setIsDisableRightBtn(false)
    if (currentImgIndex === 0) {
      setIsDisableLeftBtn(true)
    }
    if (imageList && currentImgIndex === imageList?.length - 1) {
      setIsDisableRightBtn(true)
    }
  }, [currentImgIndex, imageList])


  const handlePreview = useCallback(
    () => {
      setVisible(true)
    },
    [],
  )

  const preview = useMemo(() => {
    let current = 0
    if (imageList) {
      current = imageList.findIndex(item => item.id === activeId)
    }
    return {
      visible,
      current,
      onVisibleChange: (is: boolean) => setVisible(is),
      onChange: (index: number, prevCurrent: number) => {

        if (imageList) {
          const current = imageList[index]
          setActiveId(current.id)
          setActiveUrl(current)
          const imgBottom = document.getElementById(current.id)!;
          imgBottom.scrollIntoView({
            behavior: 'smooth',
            block: 'end',
            inline: 'start'
          })
        }
      }
    }
  }, [visible, activeId, imageList])
  function handelWheel(e: any) {
    let directoin = e.deltaY > 0 ? 'down' : 'up'
    if (directoin === 'up') {
      let num = numberScale + 0.1
      if (num > 1.5) {
        return
      }
      setNumberScale(num)
    } else {
      let num = numberScale - 0.1
      if (num < 0.3) {
        return
      }
      setNumberScale(num)
    }
  }

  return (
    <article className={styles.wrapper}>
      <section className={`${styles.list} ${activeImage ? styles.imageBg : styles.videoBg}`}>
        <div className={styles.tabs}>
          <div className={`${styles.tabsItem} ${activeImage ? styles.active : styles.unActive}`} onClick={() => handleClick(true)}>{`${title || ''}图片`}</div>
          <div className={`${styles.tabsItem} ${activeImage ? styles.unActive : styles.active}`} onClick={() => handleClick(false)}>{`${title || ''}视频`}</div>
        </div>
        <div className={styles.audioBox}>
          {activeImage
            ? (imageList?.length ? imageList?.map(item =>
              <div
                className={`${styles.audio} ${activeId === item.id ? styles.audioActive : styles.audioUnactive}`}
                key={item.id}
                id={item.id}
                onClick={() => handleChangeActive(item.id, item)}
              >
                <ImageSimple src={item.picUrl} width={'100%'} height={'100%'} preview={false} />
              </div>
            ) : <XcEmpty />)
            : (videoList?.length ? videoList?.map(item =>
              <div
                className={`${styles.audio} ${activeId === item.id ? styles.audioActive : styles.audioUnactive}`}
                key={item.id}
                onClick={() => handleChangeActive(item.id, item)}
              >
                <div className={styles.mask}></div>
                <VideoCommon {...item} />
              </div>
            ) : <XcEmpty />
            )
          }
        </div>
      </section>
      <section className={styles.contentBox}>
        {activeUrl &&
          <div className={styles.content} onWheel={(e: any) => handelWheel(e)}>
            {activeImage ? <ImageSimple className={styles.bigImg} style={{ transform: `scale(${numberScale})` }} src={activeUrl?.picUrl} width={'100%'} height={'100%'} preview={false} onClick={handlePreview} /> : <VideoCommon {...activeUrl} />}
          </div>
        }
        {activeImage && activeUrl &&
          <>
            <Button className={styles.leftButton} icon={<LeftOutlined />} size='large' type="text" onClick={handleClickLeft} disabled={isDisableLeftBtn} />
            <Button className={styles.rightButton} icon={<RightOutlined />} size='large' type="text" onClick={handleClickRight} disabled={isDisableRightBtn} />
          </>
        }
      </section>
      <aside className={styles.previewGroup} >
        <Image.PreviewGroup preview={preview}>
          {imageList && imageList.map(item =>
            <Image key={item.id} src={item.picUrl} />
          )}
        </Image.PreviewGroup>
      </aside>
    </article>
  )
}

export default AudioView