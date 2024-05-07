import TargetTrackPlay from "component/TargetTrackPlay";
import dayjs from "dayjs";
import ImageSimple from "hooks/basis/ImageSimple";
import FormPanel, { InputType } from "hooks/flexibility/FormPanel";
import _ from "lodash";
import { useEffect, useRef, useState } from "react";
import { queryCommandPlayTask, queryTrackTargetTracking } from "server/core/wisdomCommand";
import BehaviorAnalysis from "../component/BehaviorAnalysis";
import CommandFeedbackRecord from "../component/CommandFeedbackRecord";
import styles from "./index.module.sass";
import markerIcon from "images/core/wisdomCommand/markerIcon.svg";

interface Props {
  /** 任务参数 */
  data?: {
    /** 任务id */
    id?: number
    /** 任务开始时间 */
    createTime?: string
    /** 任务结束时间 */
    completeTaskTime?: string
  }
}

const inputs = [
  ['场景回放', 'scenePlayback', InputType.radio, {
    dict: [
      { name: '整个任务', value: 1 },
      { name: '自定义', value: 2 },
    ]
  }],
  ['时间', 'time', InputType.dateTimeRange, {
    when: { scenePlayback: 2 }
  }]
]

const TimeFormat = 'YYYY-MM-DD HH:mm:ss'

// 历史数据集
let HistoryObj: any = []
// 历史标注
let HistoryMarker: any = []

const TaskPlayback: React.FC<Props> = ({ data }) => {
  console.debug('TaskPlayback')

  const { id, createTime, completeTaskTime } = data || {}

  const [trackData, setTrackData] = useState<any>()

  const [behaviorAnalysis, setBehaviorAnalysis] = useState<any[]>([])

  const [targetId, setTargetId] = useState<string[]>([])

  const [taskDesc, setTaskDesc] = useState<string>()

  const [targetInfo, setTargetInfo] = useState<any[]>([])

  const [relationInfo, setRelationInfo] = useState<any[]>([])

  const trackRef = useRef<any>(null);

  useEffect(() => {
    id && getCommandPlayTask(id)
  }, [id])

  useEffect(() => {
    targetId?.length && queryTrackData(targetId, [createTime || '', completeTaskTime || ''], behaviorAnalysis)
  }, [behaviorAnalysis, completeTaskTime, createTime, targetId])

  function handleQuery(values: any) {
    console.log(values, targetId, 'values')
    // 时间范围默认使用任务开始与结束时间
    let timeArr = [createTime || '', completeTaskTime || '']
    // 用户选择自定义时间时 获取用户选择时间
    if (values?.scenePlayback === 2 && values?.time?.length) {
      timeArr = [
        values.time[0] ? dayjs(values.time[0]).format(TimeFormat) : '',
        values.time[1] ? dayjs(values.time[1]).format(TimeFormat) : ''
      ]
    }
    queryTrackData(targetId, timeArr, behaviorAnalysis)
  }

  // 关闭页面时置空
  useEffect(() => {
    return () => {
      HistoryObj = []
      HistoryMarker = []
    };
  }, []);

  // 获取任务回放数据
  async function getCommandPlayTask(id: number) {
    const res = await queryCommandPlayTask({ id })
    console.log(res, "res")
    // 任务描述 跟踪目标id 跟踪目标视图信息 关联目标视图信息 behaviourDtoList
    const { taskDesc, targetIds, targetInfo, relationInfo, behaviourDtoList } = res || {}
    taskDesc && setTaskDesc(taskDesc)
    targetIds && setTargetId(targetIds)
    // 行为分析记录
    behaviourDtoList?.length && setBehaviorAnalysis(behaviourDtoList)
    // 关联/跟踪目标视图
    targetInfo?.length && setTargetInfo(targetInfo)
    relationInfo?.length && setRelationInfo(relationInfo)
  }

  // 获取多个目标轨迹
  async function queryTrackData(targetId: string[], timeArr: string[], data: any[]) {
    const res = await queryTrackTargetTracking(targetId, timeArr)
    setTrackData(res)
    // 获取地图示例, 绘制行为预警信息
    if (trackRef?.current?.mapLeaflet) {
      const mapLeaflet = trackRef.current?.mapLeaflet
      data?.filter(item => Boolean(item.latitude && item.longitude)).map((item, index) => {
        if (!_.find(HistoryObj, item)) {
          // 绘制标识点
          mapLeaflet.createMarker({
            markerId: index, latLng: [item.latitude, item.longitude], markerOptions: {
              icon: L.icon({
                iconUrl: markerIcon,
                iconSize: [20, 20],
                markerColor: 'red'
              })
            }
          }).addTo(mapLeaflet.map)
          // 绘制标识内容
          const infoMarker = mapLeaflet.createInfoMarker({
            latLng: [item.latitude, item.longitude],
            content: <article className={styles.infoWrapper}>
              <div className={styles.top}>
                <div>{item.warnTime}</div>
                <div>{item.speed}</div>
              </div>
              <div className={styles.bottom}>{item.monitorName}</div>
            </article>,
            lineColor: '#00f4fa'
          })
          HistoryMarker.push(infoMarker)
          infoMarker.addTo(mapLeaflet.map)
          HistoryObj.push(item)
        }
        return item
      })
    }
  }

  // 关联目标获取显示内容
  function getRelationTargetContent(item:any) {
    return item[[6,7].includes(item.codeType)?'codeValue':'name']
  }

  return (
    <article className={styles.wrapper}>
      <div className={styles.leftRighBox}>
        <div className={styles.commonLabel}>任务概览</div>
        <div className={styles.info}>
          <textarea className={styles.infoContent} value={taskDesc} readOnly></textarea>
        </div>
        <div className={styles.commonLabel}>行为分析记录</div>
        <div className={styles.content}>
          <BehaviorAnalysis behaviorAnalysis={behaviorAnalysis} />
        </div>
      </div>
      <div className={styles.middleBox}>
        <div className={styles.form}>
          <FormPanel
            inputs={inputs}
            onFinish={handleQuery}
            formProps={{
              layout: 'inline',
              initialValues: {
                scenePlayback: 1
              }
            }}
            options={{
              isShowItemButton: true,
              isNotShowFooter: true,
              submitText: '查询'
            }} />
        </div>
        <div className={styles.map}>
          <TargetTrackPlay ref={trackRef} data={trackData} isMarker={false} dashed={{ weight: 1, dashArray: '5' }} />
        </div>
      </div>
      <div className={styles.leftRighBox}>
        <div className={styles.commonLabel}>视图信息</div>
        <div className={styles.viewInfo}>
          {
            targetInfo.map(item => {
              return <div className={styles.image} key={item.id} >
                <ImageSimple src={item.picUrl} width={'100%'} height={'100%'} />
              </div>
            })
          }
        </div>
        <div className={styles.commonLabel}>关联信息</div>
        <div className={styles.viewInfo}>
          {
            relationInfo.map(item => {
              return <div className={styles.image} key={item.id} >
                <ImageSimple src={item.picUrl} width={'100%'} height={'100%'} />
                <div className={styles.imageLabel} title={getRelationTargetContent(item)}>{getRelationTargetContent(item)}</div>
              </div>
            })
          }
        </div>
        <div className={styles.commonLabel}>进展信息</div>
        <div className={styles.feedbackContent}>
          <CommandFeedbackRecord id={id} />
        </div>
      </div>
    </article>
  )
}

export default TaskPlayback