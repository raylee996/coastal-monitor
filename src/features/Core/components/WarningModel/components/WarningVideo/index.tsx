import { message, Pagination, Spin, Button } from "antd";
import VideoSimple from "component/VideoSimple";
import ImageSimple from "hooks/basis/ImageSimple";
import { useCallback, useEffect, useState } from "react"
import { getVideoWarn } from "server/alarm"
import { getWarnVideoInfo } from "server/video";
import styles from "./index.module.sass";
import imgDefSrc from 'images/video/video_def.jpg'
import { getRelationImgSrc } from "helper";
import HandleWarningResult from "../HandleWarningResult";
import popup from "hooks/basis/Popup";
import popupUI from "component/PopupUI";
import EarlyRecordPopup from "../EarlyRecordPopup";

interface Props {
  monitorId?: number
  warnContent?: string
  warnTypes?: string
  startTime?: string
  endTime?: string
}

const WarningVideo: React.FC<Props> = ({
  monitorId,
  warnContent,
  warnTypes,
  startTime,
  endTime
}) => {
  console.debug('WarningVideo')


  const [list, setList] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [random, setRandom] = useState(1)
  const [isImgLoading, setIsImgLoading] = useState(false)
  const [videoInfo, setVideoInfo] = useState({
    posterImage: '',
    params: {
      startTime: '',
      endTime: '',
      deviceChannelCode: '',
      deviceCode: '',
      // fileType: ''
    }
  })
  const [pageCurrent, setPageCurrent] = useState(1)
  const [pageTotal, setPageTotal] = useState(0)


  const handleClick = useCallback(
    async (item: any, index: number) => {
      setList(val => {
        const _list = val.map((ele, idx) => {
          if (idx === index) {
            return { ...ele, class: styles.videoCardSel }
          } else {
            return { ...ele, class: styles.videoCard }
          }
        })
        return _list
      })
      setIsImgLoading(true)
      const videoInfo = await getWarnVideoInfo(item.id)
      if (videoInfo) {
        const src = await getRelationImgSrc(item.warnPic, item.relationInfo)
        setVideoInfo({
          posterImage: src,
          params: {
            startTime: videoInfo.vstartTime,
            endTime: videoInfo.vendTime,
            deviceChannelCode: videoInfo.channel,
            deviceCode: videoInfo.deviceCode,
            // fileType: '02,03'
          }
        })
      } else {
        message.warning('无视频通道信息')
      }
      setIsImgLoading(false)
    },
    [],
  )


  useEffect(() => {
    let ctr: AbortController
    async function main() {
      const params = {
        monitorId,
        warnContent,
        warnTypes,
        startTime,
        endTime,
        current: pageCurrent
      }
      ctr = new AbortController()
      setIsLoading(true)
      const [vo, pageTotal] = await getVideoWarn(params, ctr)
      const _list = vo.map((item: any) => ({ ...item, class: styles.videoCard }))
      setList(_list)
      if (vo.length > 0) {
        const index = 0
        const item = vo[index]
        handleClick(item, index)
      }
      setPageTotal(pageTotal)
      setIsLoading(false)
    }
    main()
    return () => {
      ctr && ctr.abort()
    }
  }, [endTime, startTime, warnContent, warnTypes, monitorId, handleClick, pageCurrent, random])


  const handlePaginationChange = useCallback(
    (page: number) => {
      setPageCurrent(page)
    },
    [],
  )
  const handleClickData = useCallback((data: any) => {
    popup(<HandleWarningResult id={data.id} isShipTarget={false} onRefresh={() => setRandom(Math.random())} />, { title: '处理', size: 'small' })
  }, [])
  const handleOpenMsg = useCallback((data: any) => {
    popupUI(<EarlyRecordPopup data={data.dealRecord} />, { title: '查看处理结果', size: 'mini' })
  }, [])

  return (
    <article className={styles.wrapper}>
      <section className={styles.videoBox}>
        {videoInfo.params.deviceCode &&
          <VideoSimple
            posterImage={videoInfo.posterImage}
            getVideoParams={videoInfo.params}
          />
        }
        {isImgLoading &&
          <aside className={styles.imgLoading}>
            <Spin tip="加载图片数据中"></Spin>
          </aside>
        }
      </section>
      <section className={styles.videoList}>
        <section className={styles.list}>
          {list.map((item, index) =>
            <article className={item.class} key={item.id}>
              <section className={styles.videoImg} onClick={() => handleClick(item, index)}>
                <ImageSimple src={item.warnPic} preview={false} defaultSrc={imgDefSrc} />
                <div className={styles.videoButtons}>
                  {item.status === '0' ? <Button type="primary" size={'small'} onClick={() => handleClickData(item)}>
                    {item.statusName}
                  </Button> : <span onClick={() => handleOpenMsg(item)}>{item.statusName}</span>
                  }
                </div>
                <div className={styles.videoAlt}>{item.monitorName}</div>
              </section>
              <footer>{item.capTime}</footer>
            </article>
          )}
        </section>
        <section className={styles.page}>
          <Pagination
            size="small"
            current={pageCurrent}
            total={pageTotal}
            showQuickJumper={false}
            showSizeChanger={false}
            simple={true}
            onChange={handlePaginationChange}
            pageSize={5}
          />
        </section>
      </section>
      {isLoading &&
        <aside className={styles.loading}>
          <Spin tip="加载数据中" size='large'></Spin>
        </aside>
      }
    </article>
  )
}

export default WarningVideo