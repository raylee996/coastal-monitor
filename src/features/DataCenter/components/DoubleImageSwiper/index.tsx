import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { Button, Carousel, Col, Row, Spin } from "antd"
import { CarouselRef } from "antd/lib/carousel";
import XcEmpty from "component/XcEmpty";
import dayjs from "dayjs";
import PersonnelArchiveInfo from "features/DataCenter/PersonnelArchiveInfo";
import { followTaskStatusDict, getDictName } from "helper/dictionary";
import DateTimeRangeSimple from "hooks/basis/DateTimeRangeSimple";
import popup from "hooks/basis/Popup";
import { DayjsRange } from "hooks/hooks";
import _ from "lodash";
import { useEffect, useRef, useState } from "react"
import { addFollowTask } from "server/personnel";
import { getFollowTask } from "server/ship";
import ArchiveCard from "../ArchiveCard";
import styles from "./index.module.sass";

interface Data {
  cardMark?: string
  cardTitle?: string
  cardImgSrc?: string
}

type DoubleCard = [Data, Data]

interface Props {
  /** 数据请求的额外参数 */
  params?: any

  /** 任务id */
  taskId?: any

  /** 点击查看的回调 */
  onSelect?: (record: any, queryDateRange: DayjsRange) => void
}

const DoubleImageSwiper: React.FC<Props> = ({ params, taskId, onSelect }) => {
  console.debug('DoubleImageSwiper')

  const carouselRef = useRef<CarouselRef>(null)

  const [data, setData] = useState<DoubleCard[]>([])

  const [isLoading, setIsLoading] = useState(true)
  const [isNotData, setIsNotData] = useState(true)
  const [tipLoading, setTipLoading] = useState<string>()
  const [queryDateRange, setQueryDateRange] = useState<DayjsRange>([dayjs().set('h', 0).set('m', 0).set('s', 0).subtract(1, "day"), dayjs()])
  const [followTask, setFollowTask] = useState<any>()

  useEffect(() => {
    if (taskId) {
      setFollowTask({
        taskId: taskId
      })
    }
  }, [taskId])

  useEffect(() => {
    async function main() {
      if (params) {
        const _params = {
          ...params,
          queryDateRange
        }
        setIsLoading(true)
        const vo = await addFollowTask(_params)
        if (vo.status !== 3) {
          setFollowTask(vo)
        } else {
          setIsLoading(false)
        }
      }
    }
    main()
  }, [params, queryDateRange])

  // 获取伴随信息
  useEffect(() => {
    let _worker: Worker
    if (followTask && followTask.status !== 3) { //0 已创建 1 分析中  2 已完成，3失败
      _worker = getFollowTask(followTask, (res: any) => {
        if (res.code === 200) {
          const data = res.data
          if (data.status === 2) {
            console.log(res)
            if (data.result.length === 0) {
              setIsNotData(true)
            } else {
              const list = data.result.map((ele: any) => ({
                ...ele,
                cardMark: ele.followNum,
                cardTitle: ele.tagCode,
                cardImgSrc: ele.path,
              }))
              const _data = _.chunk(list, 2) as any[]
              setData(_data)
              setIsNotData(false)
            }
            setIsLoading(false)
            _worker.terminate()
          } else if (data.status === 3) {
            console.log(res)
            setIsLoading(false)
            _worker.terminate()
          } else {
            const statusName = getDictName(followTaskStatusDict, data.status)
            setTipLoading(statusName)
            setIsLoading(false)
            _worker.terminate()
          }
        } else {
          setIsLoading(false)
          _worker.terminate()
        }
      })
    }
    return () => {
      _worker && _worker.terminate()
    }
  }, [followTask])

  function handleLeft() {
    carouselRef.current?.prev()
  }

  function handleRight() {
    carouselRef.current?.next()
  }

  function handleArchive(params: any) {
    switch (params.archiveType) { //0:人员  1:车辆  2:手机  3:船舶
      case '0':
        popup(<PersonnelArchiveInfo id={params.archiveId} />, { title: '个人档案详情', size: "fullscreen" })
        break;
      default:
        break;
    }
  }

  function handleChange(params: DayjsRange) {
    if(!params){
      return
    }
    setQueryDateRange(params)
  }

  function handleCard(record: any) {
    onSelect && onSelect(record, queryDateRange)
  }

  return (
    <article className={styles.wrapper}>
      <header>
        <Row>
          <Col span={4}><div className={styles.label}>时间</div></Col>
          <Col span={20}><DateTimeRangeSimple isDisabledAfter={true} defaultValue={queryDateRange} onChange={handleChange} /></Col>
        </Row>
      </header>
      {isLoading &&
        <section className={styles.spinBox}>
          <Spin tip={tipLoading}></Spin>
        </section>
      }
      {!isLoading && !isNotData &&
        <section className={`${styles.carousel} DoubleImageSwiper__Carousel`}>
          <Carousel dots={false} ref={carouselRef} autoplay={true}>
            {data.map(doubleCard =>
              <div>
                <Row>
                  <Col span={9} push={2}>
                    <ArchiveCard
                      title={doubleCard[0].cardTitle}
                      mark={doubleCard[0].cardMark}
                      src={doubleCard[0].cardImgSrc}
                      onClick={() => handleCard(doubleCard[0])}
                      onArchive={() => handleArchive(doubleCard[0])} />
                  </Col>
                  {doubleCard[1] &&
                    <Col span={9} push={4}>
                      <ArchiveCard
                        title={doubleCard[1].cardTitle}
                        mark={doubleCard[1].cardMark}
                        src={doubleCard[1].cardImgSrc}
                        onClick={() => handleCard(doubleCard[1])}
                        onArchive={() => handleArchive(doubleCard[1])} />
                    </Col>
                  }
                </Row>
              </div>
            )}
          </Carousel>
          <Button className={styles.prev} type='link' icon={<LeftOutlined />} onClick={handleLeft}></Button>
          <Button className={styles.next} type='link' icon={<RightOutlined />} onClick={handleRight}></Button>
        </section>
      }
      {!isLoading && isNotData &&
        <XcEmpty />
      }
    </article>
  )
}

export default DoubleImageSwiper