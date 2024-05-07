import { Image, Spin } from "antd";
import VideoSimple, { HuaweiCloudProps } from "component/VideoSimple";
import XcEmpty from "component/XcEmpty";
import { getRelationImgSrc } from "helper";
import _ from "lodash";
import { useCallback, useEffect, useState } from "react";
import { getImageVideoPage } from "server/common";
import styles from "./index.module.sass";
import './index.sass';


interface Props {
  /** 预警记录id */
  id: number
}

const VideoWarning: React.FC<Props> = ({ id }) => {
  console.debug('VideoWarning')


  const [videoList, setVideoList] = useState<any[]>([])
  const [active, setActive] = useState<any>()
  const [videoParams, setVideoParams] = useState<HuaweiCloudProps>()
  const [isLoading, setIsLoading] = useState(true)
  const [posterImage, setPosterImage] = useState('')


  useEffect(() => {
    async function main() {
      try {
        if (id) {
          const pageInfo = {
            pageNumber: 1,
            pageSize: -1
          }
          const params = {
            type: 'video',
            fileType: '02,03',
            businessId: id + "",
            businessType: '05'
          }
          setIsLoading(true)
          const vo = await getImageVideoPage(pageInfo, params)
          setVideoList(vo.data)
          vo.data.length && setActive(vo.data[0])
        }
      } catch (error) {
        console.warn(error)
      } finally {
        setIsLoading(false)
      }
    }
    main()
  }, [id])

  useEffect(() => {
    async function main() {
      if (active) {
        const { vstartTime, vendTime, channel, deviceCode } = active
        const src = await getRelationImgSrc(active.picUrl, active.relationInfo)
        setVideoParams({
          startTime: vstartTime,
          endTime: vendTime,
          deviceChannelCode: channel,
          deviceCode: deviceCode,
        })
        setPosterImage(src)
      }
    }
    main()
  }, [active])


  const handleActive = useCallback(
    (data: any) => {
      setActive(data)
    },
    [],
  )


  return (
    <article className={styles.wrapper}>

      <section className={styles.videoBox}>
        {!isLoading && active &&
          <VideoSimple posterImage={posterImage} getVideoParams={videoParams} />
        }
        {!isLoading && !active &&
          <XcEmpty />
        }
      </section>

      <section className={styles.listBox}>
        {!isLoading && videoList.length && videoList.map(item =>
          <div key={item.id} className={`${styles.preview} ${_.isEqual(item, active) ? styles.active : styles.unActive} VideoWarning__image`} onClick={() => handleActive(item)}>
            <Image preview={false} src={item.picUrl} />
          </div>
        )}
        {!isLoading && !videoList.length &&
          <XcEmpty />
        }
      </section>

      {isLoading &&
        <aside className={styles.loading}>
          <Spin size="large" tip="加载中..." />
        </aside>
      }
    </article>
  )
}

export default VideoWarning