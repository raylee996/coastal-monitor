import { Checkbox, Space } from "antd";
import ShipTrackPlay, { TarckData } from "component/ShipTrackPlay";
import dayjs from "dayjs";
import RelevancePersonCard from "features/DataCenter/components/RelevancePersonCard";
import RelevanceShipCard from "features/DataCenter/components/RelevanceShipCard";
import { YMDHm, YMDHms } from "helper";
import { defaultImgPeople } from "helper/common";
import CoastalMonitorWebgis from "helper/map";
import { getCRSByMapType, MapType } from "helper/map/crsUtil";
import getMapOffLineDate from "helper/map/getMap";
import DateTimeRangeSimple from "hooks/basis/DateTimeRangeSimple";
import ImageSimple from "hooks/basis/ImageSimple";
import FormPanel, { InputType } from "hooks/flexibility/FormPanel";
import TableInterface from "hooks/integrity/TableInterface";
import { useEffect, useRef, useState } from "react";
import { getCarArchiveData } from "server/car";
import { doGetHistoryTrack, doGetRelationResult } from "server/search";
// import FaceCard from "../../../components/ImageCard";
import styles from "./index.module.sass";


const columns: any[] = [
  ['序号', 'ordinal', { itemProps: { width: 60 } }],
  ['数据类型', 'codeTypeName'],
  ['数据内容', 'content'],
  ['采集时间', 'capTime'],
  ['采集地址', 'capAddress']
]

const inputs: any[] = [
  ['时间范围', 'datetime', InputType.dateTimeRange],
  ['轨迹类型', 'coincidence', InputType.select, {
    dict: [{
      name: '全部',
      value: 0
    }, {
      name: '共轨',
      value: 1
    }]
  }],
]

const mapAttribute: any = { zoom: 12, zoomRange: [8, 16] }

interface ICarRelevant {
  /** 车辆档案id */
  id?: string | number | any
}

const CarRelevant: React.FC<ICarRelevant> = (props) => {
  console.debug('CarRelevant')
  const { id } = props
  const mapRef = useRef<HTMLDivElement>(null)
  const [timeVal, setTimeVal] = useState<any>([dayjs(new Date()).subtract(7, 'day'), dayjs(new Date())])
  const [timeVal2, setTimeVal2] = useState<any>([dayjs(new Date()).subtract(7, 'day'), dayjs(new Date())])

  const [carInfo, setCarInfo] = useState<any>({})

  const [activeFaceData, setActiveFaceData] = useState<any>({})

  // 轨迹查询条件
  const [trackQuery, setTrackQuery] = useState<any>({});
  const [trackListQuery, setTrackListQuery] = useState<any>({});

  const [trackData, setTrackData] = useState<TarckData[]>()

  // 获取船舶详情数据
  useEffect(() => {
    async function main() {
      const vo = await getCarArchiveData(id)
      setCarInfo(vo)
    }
    id && main()
  }, [id])


  useEffect(() => {
    let _mapLeaflet: CoastalMonitorWebgis
    if (mapRef.current) {
      const crs = getCRSByMapType(MapType.StreetMap);
      _mapLeaflet = new CoastalMonitorWebgis(mapRef.current, { crs })
      getMapOffLineDate(MapType.StreetMap).addTo(_mapLeaflet.map);
    }
    return () => {
      _mapLeaflet && _mapLeaflet.remove()
    }
  }, [])

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
  function handleFaceSelected(data: any) {
    if (data.length !== 0) {
      setActiveFaceData(data[0]) // 选择人脸后，数据变化，会自动请求
    }
  }

  // 关联汽车选择
  function handleCarSelected(data: any) {
    console.log(data)
  }

  return (
    <article className={styles.wrapper}>
      <section className={styles.archive}>
        <article className={styles.adjointShip}>
          <header>
            <div className={'subTitle'}><span className={`iconfont icon-zhuangshitubiao titleIconFont`}></span>关联人脸（由：{carInfo.licensePlate}关联的结果）</div>

            <DateTimeRangeSimple value={timeVal} onChange={(dates: any, dateStrings: any) => {
              setTimeVal([dates[0], dates[1]])
            }} />
          </header>
          <section>
            <TableInterface
              extraParams={{
                srcCodeType: 1,
                codeValue: carInfo.licensePlate,
                tagCodeType: 0,
                startTime: dayjs(timeVal[0]).format(YMDHms),
                endTime: dayjs(timeVal[1]).format(YMDHms)
              }}
              request={doGetRelationResult}
              card={RelevancePersonCard}
              cardOptions={{
                isRadio: true,
                isSelectedFirst: true,
                onSelected: handleFaceSelected
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
            <div className={'subTitle'}><span className={`iconfont icon-zhuangshitubiao titleIconFont`}></span>关联船舶（由：<ImageSimple width={"24px"} height={"24px"} src={activeFaceData.path} defaultSrc={defaultImgPeople} />关联的结果）</div>
            <DateTimeRangeSimple value={timeVal2} onChange={(dates: any, dateStrings: any) => {
              setTimeVal2([dates[0], dates[1]])
            }} />
          </header>
          <section>
            <TableInterface
              request={doGetRelationResult}
              extraParams={{
                srcCodeType: 0,
                codeValue: activeFaceData.codeValue,
                tagCodeType: 6,
                startTime: dayjs(timeVal2[0]).format(YMDHms),
                endTime: dayjs(timeVal2[1]).format(YMDHms)
              }}
              card={RelevanceShipCard}
              cardOptions={{
                isRadio: true,
                isSelectedFirst: true,
                onSelected: handleCarSelected
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
          {/*放置地图的位置*/}
          <div className={styles.conditionPanel}>
            <div className={styles.cItem}><span className={`iconfont icon-zhuangshitubiao ${styles.titleIconFont}`}></span>轨迹信息</div>
            <section className={`${styles.query} ${styles.cItem} ${'dc-form'}`}>
              <FormPanel
                inputs={inputs}
                formProps={{
                  layout: 'inline',
                  initialValues: trackQuery
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
                <Checkbox value={carInfo.licensePlate}>{carInfo.licensePlate}</Checkbox >
                {
                  activeFaceData.imgPath && <Checkbox value={carInfo.path}>
                    <ImageSimple width={"60px"} src={activeFaceData.imgPath} />
                  </Checkbox >
                }

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

export default CarRelevant