import { Checkbox, Space } from "antd";
import ShipTrackPlay, { TarckData } from "component/ShipTrackPlay";
import dayjs from "dayjs";
import { YMDHm, YMDHms } from "helper";
import DateTimeRangeSimple from "hooks/basis/DateTimeRangeSimple";
import ImageSimple from "hooks/basis/ImageSimple";
import FormPanel, { InputType } from "hooks/flexibility/FormPanel";
import TableInterface from "hooks/integrity/TableInterface";
import { useEffect, useState } from "react";
import { doGetPersonInfo } from "server/personnel";
import { doGetHistoryTrack, doGetRelationResult } from "server/search";
import styles from "./index.module.sass";
import '../../../dataCenter.sass'
import RelevanceShipCard from "features/DataCenter/components/RelevanceShipCard";
import RelevanceCarCard from "features/DataCenter/components/RelevanceCarCard";
import { defaultImgPeople } from "helper/common";

const columns: any[] = [
  ['序号', 'ordinal', { itemProps: { width: 60 } }],
  ['数据类型', 'type'],
  ['数据内容', 'content'],
  ['采集时间', 'datetime'],
  ['采集地址', 'address']
]

const inputs: any[] = [
  ['时间范围', 'datetime', InputType.dateTimeRange],
  ['轨迹类型', 'type', InputType.select, {
    dict: [{
      name: '全部',
      value: 0
    }, {
      name: '共轨',
      value: 1
    }]
  }],
]

const initialValues: any = {
  type: 0
}

interface Props {
  /** 船舶id */
  id?: string | number
}

const mapAttribute: any = { zoom: 12, zoomRange: [8, 16] }

const RelationInfo: React.FC<Props> = ({ id }) => {
  console.debug('RelationInfo', id)

  // 关联车辆时间
  const [carTime, setCarTime] = useState<any>([dayjs(new Date()).subtract(7, 'day'), dayjs(new Date())])
  // 关联人脸时间
  const [faceTime, setFaceTime] = useState<any>([dayjs(new Date()).subtract(7, 'day'), dayjs(new Date())])

  // 个人信息详情
  const [personInfo, setPersonInfo] = useState<any>({ faceid: '' })

  // 地图轨迹数据
  const [trackData, setTrackData] = useState<TarckData[]>()

  // 轨迹查询条件
  const [trackQuery, setTrackQuery] = useState<any>({});
  const [trackListQuery, setTrackListQuery] = useState<any>({});


  const [activeCarData, setActiveCarData] = useState<any>({})
  const [activeShipData, setActiveShipData] = useState<any>({})

  // 获取个人信息详情数据
  useEffect(() => {
    async function getPersonDetail() {
      const vo = await doGetPersonInfo({ id })
      setPersonInfo(vo)
    }
    id && getPersonDetail()
  }, [id])


  // 轨迹信息查询按钮
  async function handleFinish(params: any) {
    let dto: any = {
      analyzeType: 6 // 船人关联
    }

    if (params.datetime) {
      dto.beginTime = dayjs(params.datetime[0]).format(YMDHm)
      dto.endTime = dayjs(params.datetime[1]).format(YMDHm)
    }

    if (params.coincidence === 1) {
      // 共轨
      dto.coincidence = true
    } else if (params.coincidence === 0) {
      //全部
      dto.coincidence = false
    }

    if (trackQuery.mmsi) {
      dto.mmsi = trackQuery.mmsi
    }

    if (trackQuery.faceId) {
      dto.faceId = trackQuery.faceId
    }

    setTrackQuery((oldVal: any) => {
      return {
        ...oldVal,
        ...dto
      }
    })

    const vo = await doGetHistoryTrack({ pageSize: 1000000, pageNumber: 1 }, dto)
    console.log(vo)
    setTrackData(vo.newData)
    // 轨迹列表获取数据
    setTrackListQuery(trackQuery)
  }


  // 轨迹radio选择
  function handleTrajectoryChange(data: any) {
    // 轨迹查询条件
    setTrackQuery((oldVal: any) => {
      return {
        ...oldVal,
        mmsi: data[0],
        faceId: data[1]
      }
    })
  }


  // 关联人脸选择
  function handleShipSelected(data: any) {
    if (data.length !== 0) {
      setActiveShipData(data[0])
    }
  }

  // 关联汽车选择
  function handleCarSelected(data: any) {
    if (data.length !== 0) {
      setActiveCarData(data[0])
    }
  }

  return (
    <article className={styles.wrapper}>
      <section className={styles.archive}>
        <article className={styles.adjointShip}>
          <header>
            <div className={'subTitle'}><span className={`iconfont icon-zhuangshitubiao titleIconFont`}></span>关联车辆（由：<ImageSimple width={"24px"} height={"24px"} src={personInfo.facePath}  defaultSrc={defaultImgPeople}/>关联的结果）</div>

            <DateTimeRangeSimple value={carTime} onChange={(dates: any, dateStrings: any) => {
              setCarTime([dates[0], dates[1]])
            }} />
          </header>
          <section>
            <TableInterface
              extraParams={{
                srcCodeType: 0,
                codeValue: personInfo.faceid,
                tagCodeType: 1,
                startTime: dayjs(carTime[0]).format(YMDHms),
                endTime: dayjs(carTime[1]).format(YMDHms)
              }}
              request={doGetRelationResult}
              card={RelevanceCarCard}
              cardOptions={{
                isRadio: true,
                isSelectedFirst: true,
                onSelected: handleCarSelected,
              }}
             
              paginationProps={{
                size: 'small',
                showQuickJumper: false,
                showSizeChanger: false
              }}
            />
          </section>
        </article>

        <article className={styles.adjointShip}>
          <header>
            <div className={'subTitle'}><span className={`iconfont icon-zhuangshitubiao titleIconFont`}></span>关联船舶（由：<ImageSimple width={"24px"} height={"24px"} src={personInfo.facePath}  defaultSrc={defaultImgPeople}/>关联的结果）</div>
            <DateTimeRangeSimple value={faceTime} onChange={(dates: any, dateStrings: any) => {
              setFaceTime([dates[0], dates[1]])
            }} />
          </header>
          <section>
            <TableInterface
              extraParams={{
                srcCodeType: 0,
                codeValue: personInfo.faceid,
                tagCodeType: 6,
                startTime: dayjs(carTime[0]).format(YMDHms),
                endTime: dayjs(carTime[1]).format(YMDHms)
              }}
              request={doGetRelationResult}
              card={RelevanceShipCard}
              cardOptions={{
                isRadio: true,
                isSelectedFirst: true,
                onSelected: handleShipSelected
              }}
              paginationProps={{
                size: 'small',
                showQuickJumper: false,
                showSizeChanger: false
              }}
            />
          </section>
        </article>

      </section>
      <section className={styles.content}>
        <section className={styles.mapBox} >
          <div className={styles.conditionPanel}>
            <div className={styles.cItem}><span className={`iconfont icon-zhuangshitubiao ${styles.titleIconFont}`}></span>轨迹信息</div>
            <section className={`${styles.query} ${styles.cItem} ${'dc-form'}`}>
              <FormPanel
                inputs={inputs}
                formProps={{
                  layout: 'inline',
                  initialValues
                }}
                options={{
                  isShowItemButton: true,
                  isNotShowFooter: true,
                  submitText: '查询'
                }}
                onFinish={handleFinish} />
            </section>
          </div>
          <div className={styles.mapContainer}>
            <ShipTrackPlay tarckList={trackData} mapAttribute={mapAttribute} />
          </div>
          <div className={styles.legend}>
            <Checkbox.Group onChange={handleTrajectoryChange}>
              <Space direction="vertical">
                <Checkbox value={personInfo.faceId}>
                  <ImageSimple width={"24px"} src={personInfo.facePath}  defaultSrc={defaultImgPeople}/>
                </Checkbox >
                {/* 车牌 */}
                {activeCarData.licensePlate && <Checkbox value={activeCarData.licensePlate}>{activeCarData.licensePlate}</Checkbox >}
                {/* 船舶信息 */}
                {activeShipData.mmsi && <Checkbox value={activeShipData.mmsi}>{activeShipData.mmsi}</Checkbox >}
              </Space>
            </Checkbox.Group>
          </div>
        </section>
        <footer className={styles.table}>
          <div className={'subTitle03'}><span className={`iconfont icon-zhuangshitubiao titleIconFont`}></span>轨迹详情</div>
          <TableInterface
            columns={columns}
            extraParams={{ ...trackListQuery }}
            request={doGetHistoryTrack}
          />
        </footer>
      </section>
    </article>
  )
}

export default RelationInfo