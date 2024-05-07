import { Button, message, PaginationProps } from "antd";
import { TableCardProps } from "hooks/flexibility/CardPanel";
import TableInterface from "hooks/integrity/TableInterface";
import _ from "lodash";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getWarningV3List, handleBehaviorList } from "server/core/earlyWarning";
import { getShipBaseInfo } from "server/ship";
import styles from "./index.module.sass";
import cardStyles from "../WarningTypeCardItem/index.module.sass";
import popup from "hooks/basis/Popup";
import HandleWarningResult from "../HandleWarningResult";
// import ShipArchiveInfo from "features/DataCenter/ShipArchiveInfo";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { selectValue, setHistoryTrackLoading } from "slice/coreMapSlice";
import { getAllHistoryTrack } from "server/dataCenter/shipSailing";
import { codeTypeToKey } from "features/Core/components/WisdomSearch/OverallSituation/components/OverallSituationItem";
import { getCarArchiveData } from "server/car";
import { doGetPersonInfo } from "server/personnel";
import ShipArchiveInfo from "features/DataCenter/ShipArchiveInfo";
import PersonnelArchiveInfo from "features/DataCenter/PersonnelArchiveInfo";
import CarArchiveInfo from "features/DataCenter/CarArchiveInfo";
import ImageSimple from "hooks/basis/ImageSimple";
import { earlyWarningIconColor } from "../WarningTypeCardItem";
import AudioView from "component/AudioView";
import { getMapRadarTargetIcon, selectTargetIcon } from "helper/mapIcon";
import { createDottedSolidPolyline, createDrawAreaPolyline, createYawPolyline } from "helper/map/common";
import { getAreaTwo } from "server/core/controlManage";
import shipDefSrc from 'images/default/ship.png'
import { getPlaceListDetailinfos } from "server/place";
import selectTargetSrc from "images/shipList/select_target.png";
import ViewHistoryPane from "../ViewHistoryPane";
import windowUI from "component/WindowUI";
import Map2D from "helper/Map2D";


// 历史线
let HistoryPolyline: any = []
// 历史标注
let HistoryText: any = []
// 船舶轨迹最后一个
let lastShip: null
// 船舶轨迹最后一个的框线
let lastShipRectangle: null
// 起点
let stratMarker: null
// 箭头
let arrowLine: null
// 区域绘制的形状
let areaPolyline: null
// 航道绘制
let yawPolyline: any[]

// 伴随，尾随等的船舶轨迹
let otherHistoryPolyline: any = []
let otherArrowLine: null
// 另一条轨迹的船舶图标
let otherLastShip: null
let otherShipRectangle: null

// 时间标签
let timeTagList: any[] = []

const WarningDetailCardItem: React.FC<TableCardProps<any>> = (props) => {
  const { data, onSelect, activeData, onRefresh } = props
  const { id, monitorName, contentType, warnContent, warnTypeName, status, statusName, dealRecord, riskLevel, speed, warnPic, warnTime } = data || {}

  console.debug('WarningTypeCardItem')

  const [recordList, setRecordList] = useState<any[]>()

  const [isShowVideo, setIsShowVideo] = useState(false)

  const [relationTarget, setRelationTarget] = useState<any>(null)

  useEffect(() => {
    if (data.relationInfo) {
      let relationTarget = JSON.parse(data.relationInfo);
      if (relationTarget?.codeValue) {
        setRelationTarget(relationTarget.codeValue)
      }
    }


  }, [data])


  useEffect(() => {
    if (data && data.standFiles) {
      let videoList = data.standFiles?.filter((item: any) => ['02', '03'].includes(item.fileType))
      if (videoList.length > 0) {
        setIsShowVideo(true)
      } else {
        setIsShowVideo(false)
      }
    }
  }, [data])

  useEffect(() => {
    let ctr: AbortController
    async function main() {
      if (_.isEqual(activeData[0], data)) {
        ctr = new AbortController()
        const res = await handleBehaviorList({
          alarmId: data.id ? data.id + "" : "",
          monitorId: data.monitorId ? data.monitorId + "" : "",
          monitorType: data.monitorType,
          size: -1,
          current: 1
        }, ctr)
        // console.log(res?.page?.records, "res?.page?.records")
        setRecordList(res?.page?.records || [])
        const imgBottom = document.getElementById(data.id)!;
        imgBottom && imgBottom.scrollIntoView({
          behavior: 'smooth',
          block: 'end',
          inline: 'start'
        })
      }
    }
    main()
    return () => {
      ctr?.abort()
    }
  }, [activeData, data])

  function onclick(e: any) {
    e.stopPropagation();
    onSelect && onSelect(true, data)
  }

  function handleClick(e: any) {
    e.nativeEvent.stopImmediatePropagation()
    popup(<HandleWarningResult id={id} isShipTarget={[6].includes(contentType)} onRefresh={onRefresh} />, { title: '处理', size: 'small' })
  }

  // 打开视图信息
  function openAudio(e: any, arr: any[], isActiveImage?: boolean) {
    e.stopPropagation();
    if (!arr?.length) {
      message.error('暂无视图')
      return
    }
    popup(<AudioView
      isActiveImage={isActiveImage}
      videoList={arr?.filter(item => ['02', '03'].includes(item.fileType))}
      imageList={arr?.filter(item => item.fileType === '01')} />,
      { title: '视图查看', size: "auto" }
    )
  }

  const isSelected = _.isEqual(activeData[0], data)

  return (
    <div onClick={onclick} id={id}>
      <div className={`${cardStyles.wrapperItem} ${styles.detailWrapper} ${isSelected ? cardStyles.active : cardStyles.unActive}`} data-value={id}>
        <div className={cardStyles.modelTitle} >
          <div className={cardStyles.modelTitleLeft}>
            <span className={`iconfont icon-lingdang ${cardStyles.icon}`} style={{ color: earlyWarningIconColor[riskLevel || 0] }}></span>
            {monitorName}
          </div>

          <div>
            {
              status === '0' ? <Button type="primary" size={'small'} onClick={handleClick}>
                {statusName}
              </Button> : <span>{statusName}</span>
            }
          </div>
        </div>
        <div className={cardStyles.modelContent}>
          <div className={cardStyles.imageWrapper}>
            {
              warnPic && <div className={cardStyles.image}>
                <ImageSimple src={warnPic} width={'100%'} height={'100%'} />
              </div>
            }
            {/* 视频 */}
            {
              (warnPic && isShowVideo) && <div className={cardStyles.image} title='查看视频'>
                <ImageSimple
                  src={warnPic}
                  width={'100%'}
                  height={'100%'}
                  preview={false}
                  onClick={(e) => openAudio(e, data.standFiles, false)} />
              </div>
            }
          </div>

          <div className={cardStyles.textBox}>
            <div className={cardStyles.warningCondition}>{warnTime}&nbsp;&nbsp;{(speed >= 0 || speed) && speed !== null ? `${speed} 节` : ''}</div>
            <div className={cardStyles.warningCondition}>{`预警内容：${warnContent}`}</div>
            <div className={cardStyles.warningCondition}>{`预警类型：${warnTypeName}`}</div>
            {relationTarget && <div className={cardStyles.warningCondition}>{`关联目标：${relationTarget}`}</div>}
          </div>
        </div>
      </div>
      <div className={styles.contentBox}>
        {
          isSelected && Boolean(recordList?.length) && <div className={styles.recordsBox}>
            <div className={styles.label}>行为记录</div>
            {recordList?.map((item, index) =>
              <div className={`${styles.content} ${index > recordList.length - 1 ? styles.dashed_border : ''}`} key={item.id}>
                {
                  item.picUrl && <div className={styles.image} onClick={(e) => openAudio(e, item.standFiles, true)}>
                    <ImageSimple src={item.picUrl} preview={false} width={'100%'} height={'100%'} />
                  </div>
                }
                <div className={styles.text}>
                  <div>{item.firstTime}&nbsp;&nbsp;{item.lastSpeed ? `${item.lastSpeed}节` : ''}</div>
                  <div>{item.eventName}</div>
                </div>
              </div>
            )}
          </div>
        }
        {dealRecord &&
          <div className={styles.cardWrapper}>
            <div>{`处理意见：${dealRecord.opinionTypeName}`}</div>
            {dealRecord.remark && <div>{`备注：${dealRecord.remark}`}</div>}
            <div>{`处理人：${dealRecord.createName}`}</div>
            <div>{`处理时间：${dealRecord.createTime}`}</div>
          </div>
        }
        <div className={`${cardStyles.bottomLine} ${isSelected ? cardStyles.activeLine : cardStyles.unActiveLine} ${styles.detailLine}`}></div>
      </div>
    </div>
  )
}

let pageCtr: boolean = true


interface WarningDetailProps {
  /** 用户选择id */
  id: string
  /** 选中记录的内容类型 */
  contentType: number
  /** 关闭弹窗 */
  onCloseWindow?: Function
  /** 父级数据 */
  parentDate?: any
  /** 替换地图实例目标 */
  targetMap?: Map2D
  startTime?: string
  endTime?: string
  pageNum?: number
}

const WarningDetail: React.FC<WarningDetailProps> = ({
  id,
  contentType,
  parentDate,
  targetMap,
  startTime,
  endTime,
}) => {
  console.debug('WarningDetail')

  const { map2d } = useAppSelector(selectValue)
  const dispatch = useAppDispatch()

  // shipInfo数据
  const [shipInfo, setShipInfo] = useState<any>({});
  const [archiveType, setArchiveType] = useState<string>();
  const [selectedId, setSelectedId] = useState<number>()
  const tableRef = useRef<any>();
  const [data, setData] = useState<any>()

  const handleDestroy = useCallback(
    () => {
      const _map2d = targetMap || map2d
      // dispatch && dispatch(setSituationalAnalysis(true))
      HistoryPolyline && HistoryPolyline?.map((item: any) => {
        _map2d?.map.removeLayer(item)
        return item
      })
      HistoryText?.length && HistoryText.map((item: any) => {
        _map2d?.map.removeLayer(item)
        return item
      })
      lastShip && _map2d?.map.removeLayer(lastShip)
      lastShipRectangle && _map2d?.map.removeLayer(lastShipRectangle)
      stratMarker && _map2d?.map.removeLayer(stratMarker)
      arrowLine && _map2d?.map.removeLayer(arrowLine)
      areaPolyline && _map2d?.map.removeLayer(areaPolyline)
      // 移除航道
      if (yawPolyline && yawPolyline.length > 0) {
        for (let i = 0; i < yawPolyline.length; i++) {
          _map2d?.map.removeLayer(yawPolyline[i])
        }
      }
      // 移除时间标签
      if (timeTagList.length > 0) {
        for (let i = 0; i < timeTagList.length; i++) {
          _map2d && _map2d.map.removeLayer(timeTagList[i])
        }
      }
      map2d?.clearSelectTarget()
      HistoryPolyline = []
      HistoryText = []
      lastShip = null
      lastShipRectangle = null
      stratMarker = null
      arrowLine = null
      areaPolyline = null
      yawPolyline = []
      timeTagList = []
    },
    [map2d, targetMap],
  )

  const handleDestroyOther = useCallback(
    () => {
      otherHistoryPolyline && otherHistoryPolyline?.map((item: any) => {
        map2d?.map.removeLayer(item)
        return item
      })
      otherArrowLine && map2d?.map.removeLayer(otherArrowLine)
      otherLastShip && map2d?.map.removeLayer(otherLastShip)
      otherShipRectangle && map2d?.map.removeLayer(otherShipRectangle)
      otherLastShip = null
      otherArrowLine = null
      otherHistoryPolyline = null
      otherShipRectangle = null
    },
    [map2d],
  )


  // 绘制轨迹
  const handleDraw = useCallback(
    async (markerPolylineList: any[], TextList: any[], contentType: number, riskLevel: number, areaId?: string, monitorType?: string, isShowTimeLabel: boolean = true) => {
      const _map2d = targetMap || map2d
      if (_map2d && markerPolylineList?.length && pageCtr) {
        handleDestroy()
        HistoryPolyline = createDottedSolidPolyline(_map2d, markerPolylineList)
        arrowLine = _map2d.createPolylineDecorator(markerPolylineList).addTo(_map2d?.map)
        // 标注起点， 人脸车辆的不显示起点
        if (markerPolylineList.length > 0 && contentType !== 0 && contentType !== 1) {
          stratMarker = _map2d.createInfoMarker({
            latLng: markerPolylineList[0],
            content: <div className={styles.startDot}>起点</div>
          }).addTo(_map2d.map)
        }
        // 绘制时间标签
        if (_map2d && markerPolylineList) {
          for (let i = 0; i < markerPolylineList.length; i++) {
            if (!isShowTimeLabel) {
              break
            }
            if (markerPolylineList[i].timeTag) {
              let toolTip = L.tooltip({
                permanent: true,
                direction: i % 2 === 0 ? 'left' : 'right'
              }).setLatLng([markerPolylineList[i].lat, markerPolylineList[i].lng]).setContent(`${markerPolylineList[i].datetime}`).addTo(_map2d.map)
              timeTagList.push(toolTip)
            }
          }
        }

        let textAltList: any[] = []
        // 对行为名称进行合并
        _.values(_.groupBy(TextList.map(item => {
          // 相同时间相同经纬度的行为进行合并
          item.check = item.firstTime + item.firstLat + item.firstLng
          return item
        }), 'check')).forEach((itemList) => {
          let data: any = {}
          // 合并属性值
          itemList.forEach(d => {
            const { check, ...v } = d
            data = Object.assign(data, v)
          })
          // 组装行为名称
          data.eventName = [..._.uniq(itemList.map(v => v.eventName))].filter(v => v).join(';')
          return textAltList.push(data)
        })
        // 绘制标识
        textAltList.filter(item => Boolean(item.firstLat && item.firstLng)).map((item) => {
          const infoMarker = _map2d.createInfoMarker({
            latLng: [item.firstLat, item.firstLng],
            content: <article className={styles.infoWrapper}>
              <div>{item.firstTime}&nbsp;&nbsp;{item.lastSpeed ? `${item.lastSpeed}节` : ''}</div>
              <div>{item.eventName}</div>
            </article>
          })
          HistoryText.push(infoMarker)
          infoMarker.addTo(_map2d.map)
          return item
        })

        const shipItem = _.last(markerPolylineList)
        const latLng = {
          lat: Number(shipItem.lat),
          lng: Number(shipItem.lng)
        }
        // 绘制船舶/图案
        if (contentType === 7) {
          const icon = getMapRadarTargetIcon({
            riskLevel: 0,
            caseBottom: 0,
            heading: shipItem.course
          })
          lastShip = L.marker(latLng, { icon }).addTo(_map2d.map)
          lastShipRectangle = L.marker(latLng, {
            icon: selectTargetIcon,
            offset: L.point(0, -4),
            pane: 'shadowPane'
          }).addTo(_map2d.map)
        } else if (contentType === 0 || contentType === 1) {
          // 人脸或者车辆，选中当前摄像头
          /*  let Icon = L.icon({
             iconUrl: selectTargetSrc,
             iconSize: [32, 32],
             iconAnchor: [16, 32]
           })
           lastShipRectangle = L.marker(latLng, {
             icon: Icon,
             pane: 'shadowPane'
           }).addTo(_map2d.map) */
        } else {
          // 修改船舶图标样式
          let color = '#25F076'
          switch (riskLevel) {
            case 1:
              color = '#ff2f25'
              break;
            case 2:
              color = '#FFA517'
              break;
            case 3:
              color = '#F4FB34'
              break;
            case 4:
              color = '#25F076'
              break;
            default:
              color = '#25F076'
              break;
          }
          lastShip = _map2d.createShip({
            ...shipItem,
            ...latLng,
            speed: shipItem.speed * 0.5144444444,
            heading: Number(shipItem.heading || 0) === 511 ? shipItem.course : (shipItem.heading || 0) * Math.PI / 180.0,
            course: (shipItem.course || 0) * Math.PI / 180.0,
            color,
            borderColor: '#404040'
          }).addTo(_map2d.map)
          lastShipRectangle = L.marker(latLng, {
            icon: selectTargetIcon,
            offset: L.point(0, -4),
            pane: 'shadowPane'
          }).addTo(_map2d.map)
        }

        // 绘制区域形状
        if (areaId) {

          if (areaPolyline) {
            areaPolyline && _map2d?.map.removeLayer(areaPolyline)
          }

          let areaRes: any
          // 场所预警接口调用场所接口 其他调用区域接口
          if (monitorType === '04') {
            const vo = await getPlaceListDetailinfos(areaId)
            areaRes = vo?.placeAreaMap
          } else {
            let result = await getAreaTwo({ id: areaId })
            areaRes = result.graph
          }
          if (areaRes.type === '5') {
            // 航道相关的绘制
            // areaRes = await getAreaTwo({ id: areaId })
            yawPolyline = createYawPolyline(_map2d, areaRes.graph)
          } else {
            areaPolyline = createDrawAreaPolyline(_map2d, areaRes)
          }
        } /* else {
          // 测试航道
          let areaRes: any
          areaRes = await getAreaTwo({ id: 353 })
          yawPolyline = createYawPolyline(_map2d, areaRes.graph)
        } */
      }
    },
    [handleDestroy, map2d, targetMap],
  )

  // 绘制另一条船舶的轨迹
  const handleDrawOther = useCallback(
    (list: any, codeType: number) => {
      if (map2d) {
        handleDestroyOther()
        otherHistoryPolyline = createDottedSolidPolyline(map2d, list, {
          color: '#f35d08'
        })
        otherArrowLine = map2d.createPolylineDecorator(list, {
          patterns: {
            symbol: L.Symbol.arrowHead({
              pixelSize: 8,
              headAngle: 60,
              polygon: false,
              pathOptions: {
                stroke: true,
                weight: 1,
                color: '#f35d08'
              }
            })
          }
        }).addTo(map2d.map)

        const shipItem: any = _.last(list)
        const latLng = {
          lat: Number(shipItem.lat),
          lng: Number(shipItem.lng)
        }
        otherShipRectangle = L.marker(latLng, {
          icon: selectTargetIcon,
          offset: L.point(0, -4),
          pane: 'shadowPane'
        }).addTo(map2d.map)

        if (codeType === 7) {
          const icon = getMapRadarTargetIcon({
            riskLevel: 0,
            caseBottom: 0,
            heading: shipItem.course
          })
          otherLastShip = L.marker(latLng, { icon }).addTo(map2d.map)
        } else {
          otherLastShip = map2d.createShip({
            ...shipItem,
            ...latLng,
            speed: shipItem.speed * 0.5144444444,
            heading: Number(shipItem.heading || 0) === 511 ? shipItem.course : (shipItem.heading || 0) * Math.PI / 180.0,
            course: (shipItem.course || 0) * Math.PI / 180.0,
            color: '#25F076',
            borderColor: '#404040'
          }).addTo(map2d.map)
        }
      }
    },
    [handleDestroyOther, map2d],
  )


  //模型列表点击切换
  const handleClick = useCallback(
    async (data: any, extraParams?: any) => {
      if (data.length) {
        try {
          const [target] = data
          const { id, monitorId, monitorType, contentType, warnContent, riskLevel, areaId } = target
          const dto = {
            alarmId: id ? id + "" : "",
            monitorId: monitorId ? monitorId + "" : "",
            monitorType,
            size: -1,
            current: 1
          }
          const vo = await handleBehaviorList(dto)

          if (vo) {
            const { beginTime, endTime, page } = vo

            // 获取历史轨迹信息
            let params: any = {
              beginTime,
              endTime,
              ...extraParams
            }

            params[codeTypeToKey[contentType]] = warnContent

            if ((contentType === 0 || contentType === 1) && map2d) {
              // 人脸或者车辆，选中当前摄像头
              let Icon = L.icon({
                iconUrl: selectTargetSrc,
                iconSize: [32, 32],
                iconAnchor: [16, 32]
              })
              lastShipRectangle = L.marker([target.latitude, target.longitude], {
                icon: Icon,
                pane: 'shadowPane'
              }).addTo(map2d.map)
              map2d.map.flyTo([target.latitude, target.longitude], 16)
            }

            const pointRes = await getAllHistoryTrack(params)

            // 另一条伴随，尾随等的船舶轨迹
            let relationInfo = JSON.parse(target.relationInfo);
            if (relationInfo.codeType && relationInfo.codeValue && pointRes.length) {
              let relationParams: any = {
                beginTime,
                endTime,
                ...extraParams
              }
              relationParams[codeTypeToKey[relationInfo.codeType]] = relationInfo.codeValue
              const anotherPointRes = await getAllHistoryTrack({
                ...relationParams,
                beginTime,
                endTime,
                ...extraParams,
              })
              handleDrawOther(anotherPointRes, relationInfo.codeType)
            }

            if (pointRes.length) {
              handleDraw(pointRes, [...(page?.records || []), ...data], contentType, riskLevel, areaId, monitorType, extraParams?.isShowTimeLabel)
            }
          }

          if (extraParams && extraParams?.isUseOldWin) {
            dispatch(setHistoryTrackLoading(false))
          } else {
            setData(data)
          }
        } catch (error) {
          dispatch(setHistoryTrackLoading(false))
        }
      }
    },
    [dispatch, handleDraw, handleDrawOther, map2d],
  )



  const handleOpenShipInfo = useCallback(
    async () => {
      if (!shipInfo.id) {
        message.error('该目标无档案！')
        return
      }
      if (archiveType === 'ship') {
        popup(<ShipArchiveInfo id={shipInfo.id} dataType={shipInfo.dataType} />, { title: '查看船舶档案', size: "fullscreen" })
      }
      else if (archiveType === 'personnel') {
        popup(<PersonnelArchiveInfo id={shipInfo.id} />, { title: '个人档案详情', size: "fullscreen" })
      }
      else if (archiveType === 'car') {
        const vo = await getCarArchiveData(shipInfo.id)
        if (!vo) {
          message.error('该目标无档案！')
          return
        }
        popup(<CarArchiveInfo carId={shipInfo.id} />, { title: '车辆档案详情', size: "fullscreen" })
      }
    },
    [archiveType, shipInfo.dataType, shipInfo.id],
  )

  const handleTableData = useCallback(
    (data: any[]) => {
      if (data.length && parentDate) {
        // 解构parentDate 是否需要默认选中第一个
        const { isActiveFirst } = parentDate
        const target = isActiveFirst ? data[0] : data.find(item => item.warnTime === parentDate.warnTime)
        target && setSelectedId(target.id)
      }
    },
    [parentDate],
  )


  const extraParams = useMemo(() => ({
    contentType,
    warnContent: id,
    startTime,
    endTime
  }), [contentType, endTime, id, startTime])

  const cardOptions = useMemo(() => ({
    onSelected: handleClick,
    isRadio: true,
    selectedId: selectedId
    // isSelectedFirst: true
  }), [selectedId, handleClick])


  // 页面初始化
  useEffect(() => {
    // 查询船舶、人员、车辆等船舶档案显示为相关详情
    async function main() {
      const typeToKey: { [key: number]: any } = {
        // 内容类型 0-人脸 1-车牌 2-IMSI 3-IMEI 4-MAC 5-手机 6-MMSI 7-雷达目标 8-目标ID 9-视频告警
        0: { key: 'faceid', api: doGetPersonInfo, archiveType: 'personnel' },
        1: { key: 'licensePlate', api: getCarArchiveData, archiveType: 'car' },
        6: { key: 'mmsi', api: getShipBaseInfo, archiveType: 'ship' },
        7: { key: 'radarNumber', api: getShipBaseInfo, archiveType: 'ship' },
        8: { key: 'targetId', api: getShipBaseInfo, archiveType: 'ship' },
      }
      if (!Object.keys(typeToKey).map(String).includes(contentType + "")) return;
      const para: { [key: string]: any } = {}
      para[typeToKey[contentType].key] = id
      if (startTime) {
        para.startTime = startTime
      }
      if (endTime) {
        para.endTime = endTime
      }
      const vo = await typeToKey[contentType].api(para)
      setShipInfo(vo || {})
      setArchiveType(typeToKey[contentType].archiveType)
    }
    main()
  }, [contentType, endTime, id, startTime])

  // // 预警记录数据
  // useEffect(() => {
  //   let ctr: AbortController
  //   async function main() {
  //     ctr = new AbortController()
  //     const vo = await getWarningV3List({
  //       pageSize: -1,
  //       pageNumber: 1
  //     }, extraParams, ctr)
  //     console.log(vo)
  //   }
  //   main()
  //   return () => {
  //     ctr?.abort()
  //   }
  // }, [extraParams])


  // 关闭页面时
  useEffect(() => {
    pageCtr = true
    return () => {
      handleDestroy()
      handleDestroyOther()
      pageCtr = false
    };
  }, [handleDestroy, handleDestroyOther]);


  useEffect(() => {
    let ui: any
    if (data && archiveType === 'ship') {
      const [target] = data
      const { warnContent } = target
      ui = windowUI(<ViewHistoryPane searchHisotryTrack={handleClick} name={warnContent} data={data} />, {
        title: '船舶历史轨迹',
        key: '历史轨迹',
        width: '800px',
        height: '300px',
        offset: [560, 620],
      })
    }
    return () => {
      ui?.onUnmount()
    }
  }, [archiveType, data, handleClick])



  const paginationProps: PaginationProps = {
    showQuickJumper: false,
    showSizeChanger: false,
    size: 'small',
    pageSize: 10000
  }

  return (
    <article className={styles.wrapper}>
      <div className={styles.card}>
        {/* 船舶档案 */}
        {
          archiveType === 'ship' && <div className={styles.cardBetween}>
            <ImageSimple
              src={shipInfo.shipImgPath}
              className={styles.image}
              defaultSrc={shipDefSrc}
            />
            <div className={styles.cardRight}>
              {
                shipInfo && Object.keys(shipInfo)?.length ? <>
                  <p className={styles.title}>{`${shipInfo.cnName || shipInfo.enName || '--'} / ${shipInfo.mmsi || shipInfo.radarNumber || '--'}`}</p>
                  <p>{`船型：${shipInfo.shipTypeName || '--'}`}</p>
                </> : <>
                  <p className={styles.title}>{`${parentDate?.shipName || '--'} / ${parentDate?.warnContent || '--'}`}</p>
                  <p>{`船型：${parentDate?.shipTypeName || '--'}`}</p>
                </>
              }
              <p>
                <Button type="link" onClick={handleOpenShipInfo}>{`查看档案`}</Button>
              </p>
            </div>
          </div>
        }
        {/* 人员档案 */}
        {
          archiveType === 'personnel' && <div className={styles.cardBetween}>
            <ImageSimple
              src={shipInfo.facePath}
              className={styles.image}
            />
            <div className={styles.cardRight}>
              <p className={styles.title}>{`姓名：${shipInfo.name || '--'}`}</p>
              <p>{`人员类型：${shipInfo.personTypeName || '--'}`}</p>
              <p>
                <Button type="link" onClick={handleOpenShipInfo}>{`查看档案`}</Button>
              </p>
            </div>
          </div>
        }
        {/* 车辆档案 */}
        {
          archiveType === 'car' &&
          <div className={styles.cardBetween}>
            <ImageSimple
              src={shipInfo.carImgPath}
              className={styles.image}
            />
            <div className={styles.cardRight}>
              <p className={styles.title}>{`车牌：${shipInfo.licensePlate || '--'}`}</p>
              <p>{`车辆分类：${shipInfo.typeName || '--'}`}</p>
              <p>
                <Button type="link" onClick={handleOpenShipInfo}>{`查看档案`}</Button>
              </p>
            </div>
          </div>
        }
      </div>
      <div className={styles.tableLabel}>预警记录</div>
      <section className={styles.tableWrapper}>
        <TableInterface
          ref={tableRef}
          card={WarningDetailCardItem}
          request={getWarningV3List}
          onTableData={handleTableData}
          extraParams={extraParams}
          cardOptions={cardOptions}
          paginationProps={paginationProps}
        />
      </section>
    </article>
  )
}

export default WarningDetail