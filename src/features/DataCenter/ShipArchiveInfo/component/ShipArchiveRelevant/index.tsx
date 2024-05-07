import { Checkbox, FormProps, PaginationProps, Space } from "antd";
import ShipTrackPlay, { TarckData } from "component/ShipTrackPlay";
import dayjs from "dayjs";
import { YMDHm, YMDHms } from "helper";
import DateTimeRangeSimple from "hooks/basis/DateTimeRangeSimple";
import ImageSimple from "hooks/basis/ImageSimple";
import FormPanel, { InputType } from "hooks/flexibility/FormPanel";
import TableInterface from "hooks/integrity/TableInterface";
import { useCallback, useMemo, useState } from "react";
import { doGetHistoryTrack, doGetRelationResult } from "server/search";
import styles from "./index.module.sass";
import '../../../dataCenter.sass'
import RelevancePersonCard from "features/DataCenter/components/RelevancePersonCard";
import RelevanceCarCard from "features/DataCenter/components/RelevanceCarCard";
import { defaultImgPeople } from "helper/common";
import { DayjsPair } from "hooks/hooks";


const paginationProps: PaginationProps = {
  size: 'small',
  showQuickJumper: false,
  showSizeChanger: false
}

const formProps: FormProps = {
  layout: 'inline'
}

const options = {
  isShowItemButton: true,
  isNotShowFooter: true,
  submitText: '查询'
}

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

interface Legend {
  type: number,
  content: string
}

interface Props {
  /** 船舶信息 */
  shipData?: any
}

const ShipArchiveRelevant: React.FC<Props> = ({ shipData }) => {
  console.debug('ShipArchiveRelevant')


  const [timeVal, setTimeVal] = useState<DayjsPair>([dayjs().subtract(7, 'day'), dayjs()])
  const [timeVal2, setTimeVal2] = useState<DayjsPair>([dayjs().subtract(7, 'day'), dayjs()])
  const [activeFaceData, setActiveFaceData] = useState<any>()
  const [formData, setFormData] = useState({ coincidence: 0, datetime: [dayjs().subtract(7, 'day'), dayjs()] })
  const [trackData, setTrackData] = useState<TarckData[]>()
  const [selectList, setSelectList] = useState<Legend[]>([])

  // 关联人脸选择
  const handleFaceSelected = useCallback(
    (data: any) => {
      if (data.length !== 0) {
        setActiveFaceData(data[0])
        setFormData(val => {
          return {
            ...val,
            datetime: [dayjs(timeVal[0]), dayjs(timeVal[1])]
          }
        })
      }
    },
    [timeVal]
  )

  // 关联汽车选择
  const handleCarSelected = useCallback(
    (data: any) => {
      console.log(data)
    },
    []
  )


  const faceExtraParams = useMemo(() => {
    const params: any = {
      tagCodeType: 0,
      startTime: timeVal[0].format(YMDHms),
      endTime: timeVal[1].format(YMDHms)
    }
    if (shipData.dataType === 1) { // ais船舶
      params.srcCodeType = 6
      params.codeValue = shipData.mmsi
    } else {
      params.srcCodeType = 7
      params.codeValue = shipData.radarNumber
    }
    return params
  }, [shipData, timeVal])

  const faceCardOptions = useMemo(() => {
    return {
      isRadio: true,
      isSelectedFirst: true,
      onSelected: handleFaceSelected
    }
  }, [handleFaceSelected])

  const carExtraParams = useMemo(() => {
    if (activeFaceData) {
      return {
        srcCodeType: 0,
        codeValue: activeFaceData.codeValue,
        tagCodeType: 1,
        startTime: timeVal2[0].format(YMDHms),
        endTime: timeVal2[1].format(YMDHms)
      }
    } else {
      return undefined
    }
  }, [activeFaceData, timeVal2])

  const carCardOptions = useMemo(() => {
    return {
      isRadio: true,
      isSelectedFirst: true,
      onSelected: handleCarSelected
    }
  }, [handleCarSelected])

  const legendList = useMemo<Legend[]>(() => {
    const result: Legend[] = []
    if (shipData.dataType === 1) {
      result.push({
        type: 1,
        content: shipData.mmsi
      })
    } else {
      result.push({
        type: 2,
        content: shipData.radarNumber
      })
    }
    if (activeFaceData) {
      result.push({
        type: 3,
        content: activeFaceData.imgPath
      })
    }
    return result
  }, [shipData, activeFaceData])


  // 轨迹信息查询按钮
  const handleFinish = useCallback(
    async (params: any) => {


      if (selectList.length > 0) {

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

        selectList.forEach(item => {
          switch (item.type) {
            case 1:
              dto.mmsi = item.content
              break;
            case 2:
              dto.radarNumber = item.content
              break;
            case 3:
              dto.faceId = item.content
              break;
            default:
              break;
          }
        })

        const vo = await doGetHistoryTrack({ pageSize: 1000000, pageNumber: 1 }, dto)

        setTrackData(vo.newData)
      }
    },
    [selectList],
  )

  // 轨迹radio选择
  const handleTrajectoryChange = useCallback(
    (data: any[]) => {
      setSelectList(data)
    },
    [],
  )

  return (
    <article className={styles.wrapper}>
      <section className={styles.archive}>
        <article className={styles.adjointShip}>
          <header>
            <div className={'subTitle'}><span className={`iconfont icon-zhuangshitubiao titleIconFont`}></span>关联人脸（由：{faceExtraParams.codeValue}关联的结果）</div>
            <DateTimeRangeSimple value={timeVal} onChange={(dates: any, dateStrings: any) => {
              setTimeVal([dates[0], dates[1]])
            }} />
          </header>
          <section>
            <TableInterface
              extraParams={faceExtraParams}
              request={doGetRelationResult}
              card={RelevancePersonCard}
              cardOptions={faceCardOptions}
              paginationProps={paginationProps}
            />
          </section>
        </article>
        <article className={styles.adjointShip}>
          <header>
            <div className={'subTitle'}><span className={`iconfont icon-zhuangshitubiao titleIconFont`}></span>关联车辆（由：<ImageSimple width={"24px"} height={"24px"} src={activeFaceData?.path} defaultSrc={defaultImgPeople} />关联的结果）</div>
            <DateTimeRangeSimple value={timeVal2} onChange={(dates: any, dateStrings: any) => {
              setTimeVal2([dates[0], dates[1]])
            }} />
          </header>
          <section>
            <TableInterface
              request={doGetRelationResult}
              extraParams={carExtraParams}
              isMustExtraParams={true}
              card={RelevanceCarCard}
              cardOptions={carCardOptions}
              paginationProps={paginationProps}
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
                formProps={formProps}
                formData={formData}
                options={options}
                onAsyncFinish={handleFinish}
              />
            </section>
          </div>

          <div className={styles.mapContainer}>
            <ShipTrackPlay tarckList={trackData} mapAttribute={mapAttribute} />
          </div>

          <div className={styles.legend}>
            <Checkbox.Group onChange={handleTrajectoryChange} >
              <Space direction="vertical">
                {legendList.map(item => item.type === 3 ?
                  <Checkbox key={item.content} value={item}>
                    <ImageSimple width={"60px"} src={item.content} defaultSrc={defaultImgPeople}/>
                  </Checkbox > :
                  <Checkbox key={item.content} value={item}>{item.content}</Checkbox >
                )}
              </Space>
            </Checkbox.Group>
          </div>

        </section>

        <footer className={styles.table}>
          <div className={'subTitle03'}><span className={`iconfont icon-zhuangshitubiao titleIconFont`}></span>轨迹详情</div>
          <TableInterface
            columns={columns}
            tableDataSource={[]}
          />
        </footer>

      </section>
    </article>
  )
}

export default ShipArchiveRelevant