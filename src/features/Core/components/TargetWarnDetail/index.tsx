import styles from "./index.module.sass";
import { Divider, Space, Spin } from 'antd';
import { useEffect, useState } from "react";
import { getDictDataByType } from "server/system";
import { getDictName } from "helper/dictionary";
import { getWarnActionsAndDate } from "server/warn";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { selectValue, setSituationalAnalysis } from "slice/coreMapSlice";
import ImageSimple from "hooks/basis/ImageSimple";
import XcEmpty from "component/XcEmpty";
import { getMapRadarTargetIcon } from "helper/mapIcon";
import { createDottedSolidPolyline } from "helper/map/common";
import dayjs from "dayjs";
import _ from "lodash";

interface AltProps {
  /** 行为信息 */
  data: any
}

const WarnAlt: React.FC<AltProps> = ({ data }) => {
  console.debug('WarnAlt')

  return (
    <article className={styles.itemWrapper}>
      <header>{data.firstTime}&nbsp;&nbsp;{data.lastSpeed ? `${data.lastSpeed}节` : ''}</header>
      <section>{data.eventName}</section>
    </article>
  )
}

interface Props {
  /** 预警记录 */
  data: any
}

const TargetWarnDetail: React.FC<Props> = ({ data }) => {
  console.debug('TargetWarnDetail')

  const dispatch = useAppDispatch()

  const { map2d } = useAppSelector(selectValue)

  const [warnTypeText, setWarnTypeText] = useState('')

  const [altList, setAltList] = useState<any[]>([])
  const [trackList, setTrackList] = useState<any[]>([])
  const [shipInfo, setShipInfo] = useState<any>()

  const [isLoad, setIsLoad] = useState(false)

  useEffect(() => {
    dispatch(setSituationalAnalysis(false))
    return () => {
      dispatch(setSituationalAnalysis(true))
    }
  }, [dispatch])

  useEffect(() => {
    setIsLoad(true)
    async function main() {
      const dict = await getDictDataByType('warn_type')

      const typeList = data.warnType.split(';')
      const typeNameList = typeList.map((val: string) => {
        const name = getDictName(dict, val)
        return name
      }).filter((v: string) => v)
      const _warnTypeText = typeNameList.toString()

      const [_altList, _trackList, _shipInfo] = await getWarnActionsAndDate(data)

      setShipInfo(_shipInfo)
      setWarnTypeText(_warnTypeText)
      setAltList(_altList)
      setTrackList(_trackList.sort((a: { datetime: number }, b: { datetime: number }) => {
        return dayjs(a.datetime).isAfter(dayjs(b.datetime)) ? 1 : -1;
      }))
      setIsLoad(false)
    }
    main()
  }, [data])

  useEffect(() => {
    const layers: any[] = []
    let polyline: any[] = []
    let shipLayer: any
    let stratMarker: any
    let HistoryPolyline: any[] = []
    let arrowLine: any

    if (map2d) {
      // 地图上绘制行为分析 对相同时间的相同经纬度的轨迹进行合并处理
      if (altList?.length) {
        let textAltList: any[] = []
        // 对行为名称进行合并
        _.values(_.groupBy(altList.map(item => {
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
        // 进行行为标注
        textAltList.forEach((item: any) => {
          const circleMarker = map2d.createCircleMarker({
            latLng: [item.firstLat, item.firstLng]
          })
          circleMarker.addTo(map2d.map)

          const infoMarker = map2d.createInfoMarker({
            isNotShowLine: true,
            latLng: [item.firstLat, item.firstLng],
            content: <WarnAlt data={item} />
          })
          infoMarker.addTo(map2d.map)

          layers.push(circleMarker, infoMarker)
        })
      }

      if (trackList.length) {
        // 绘制复杂线 虚实结合
        HistoryPolyline = createDottedSolidPolyline(map2d, trackList)
        arrowLine = map2d.createPolylineDecorator(trackList).addTo(map2d?.map)
      }

      // 标注起点
      if (trackList.length > 0) {
        stratMarker = map2d.createInfoMarker({
          latLng: trackList[0],
          content: <div className={styles.startDot}>起点</div>
        }).addTo(map2d.map)
      }

      if (shipInfo) {
        // shipLayer = map2d.createShip(shipInfo)
        // 绘制船舶/图案
        if (shipInfo?.extraData?.codeType === 7) {
          const latLng = {
            lat: Number(shipInfo.lat),
            lng: Number(shipInfo.lng)
          }
          const icon = getMapRadarTargetIcon({
            riskLevel: 0,
            caseBottom: 0,
            heading: shipInfo.course
          })
          shipLayer = L.marker(latLng, { icon })
        }
        else {
          shipLayer = map2d.createShip({
            ...shipInfo,
            speed: shipInfo.speed * 0.5144444444,
            // heading: Number(shipInfo.heading || 0) === 511 ? shipInfo.course : shipInfo.heading * Math.PI / 180.0,
            heading: Number(shipInfo.heading || 0) === 511 ? shipInfo.course : (shipInfo.heading || 0) * Math.PI / 180.0,
            course: (shipInfo.course || 0) * Math.PI / 180.0
          })
        }
        shipLayer.addTo(map2d.map);
        map2d.map.flyTo(shipLayer.getLatLng())
      }
    }

    return () => {
      shipLayer && shipLayer.remove()
      polyline && polyline.map(item => {
        map2d?.map.removeLayer(item)
        return item
      })
      layers.forEach((layer: any) => {
        layer.remove()
      })
      stratMarker && stratMarker.remove()
      arrowLine && map2d?.map.removeLayer(arrowLine)
      HistoryPolyline && HistoryPolyline?.map((item: any) => {
        map2d?.map.removeLayer(item)
        return item
      })
    }
  }, [map2d, altList, trackList, shipInfo])

  return (
    <article className={styles.wrapper}>
      <header>
        <Space direction="vertical">
          <b>{data.monitorName}</b>
          <span>{data.warnTime}&nbsp;&nbsp;{data.speed ? `${data.speed}节` : ''}</span>
          <span>预警类型:{warnTypeText}</span>
        </Space>
      </header>
      <section className={styles.content}>
        <Divider orientation="left" plain className={styles.title}>行为记录</Divider>
        {altList.length ?
          <div className={styles.box}>
            {altList.map(item =>
              <div className={styles.card} key={item.id}>
                <div className={styles.img}>
                  <ImageSimple src={item.picUrl} />
                </div>
                <div className={styles.info}>
                  <div>{item.firstTime}&nbsp;&nbsp;{item.lastSpeed ? `${item.lastSpeed}节` : ''}</div>
                  <div>{item.eventName}</div>
                </div>
              </div>
            )}
          </div> : isLoad
            ? <div className={styles.loading}><Spin tip={'正在加载中'} /></div>
            : <XcEmpty />
        }
      </section>
    </article>
  )
}

export default TargetWarnDetail