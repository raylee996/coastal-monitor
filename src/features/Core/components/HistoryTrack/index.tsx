import { Spin } from "antd";
import ShipTrackPlay, { ShipTrackPlayRefProps, TarckData } from "component/ShipTrackPlay";
import dayjs, { Dayjs } from "dayjs";
import { InputType } from "hooks/flexibility/FormPanel";
import FormInterface from "hooks/integrity/FormInterface";
import { useEffect, useRef, useState } from "react";
import { getShipHistoryTrack } from "server/ship";
import { getTargetMapWarnActions } from "server/warn";
import WarnMapInfo from "../WarnMapInfo";
import styles from "./index.module.sass";


const inputs = [
  ['时间', 'range', InputType.dateTimeRange, { allowClear: false }]
]

type Range = [Dayjs, Dayjs]

interface Props {
  dateTimeRangeValues?: Range
  mmsi?: any
  /**雷达目标唯一标识（雷达批号） */
  uniqueId?: any
}

const HistoryTrack: React.FC<Props> = ({ dateTimeRangeValues, mmsi, uniqueId }) => {
  console.debug('HistoryTrack')

  const trackRef = useRef<ShipTrackPlayRefProps>(null)

  const [tarckList, setTarckList] = useState<TarckData[]>([])
  const [actions, setActions] = useState<any[]>()

  const [range, setRange] = useState<Range>(() => {
    if (dateTimeRangeValues) {
      return dateTimeRangeValues
    } else {
      const _range: Range = [dayjs().subtract(10, 'm'), dayjs()]
      return _range
    }
  })

  const [initData] = useState({ range })

  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    async function main() {
      setIsLoading(true)
      const vo = await getShipHistoryTrack({ mmsi, uniqueId }, range)
      const warnActions = await getTargetMapWarnActions({ mmsi, uniqueId }, range)
      setTarckList(vo)
      setActions(warnActions)
      setIsLoading(false)
    }
    main()
  }, [range, mmsi, uniqueId])

  useEffect(() => {
    let layers: any[] = []
    if (trackRef?.current?.mapLeaflet && actions) {
      const map2d = trackRef.current.mapLeaflet
      actions.forEach(item => {
        const infoMarker = map2d.createInfoMarker({
          latLng: [item.firstLat, item.firstLng],
          content: <WarnMapInfo text={`${item.eventName}:${item.modelName}`} />
        })
        infoMarker.addTo(map2d.map)
        layers.push(infoMarker)
      })
    }
    return () => {
      layers.forEach(ele => ele.remove())
    }
  }, [trackRef, actions])

  function handleQuery(values: any) {
    setRange(values.range)
  }

  return (
    <article className={styles.wrapper}>
      {isLoading &&
        <div className={styles.loading}>
          <Spin tip="加载数据中" size="large"></Spin>
        </div>
      }
      <div className={styles.map}>
        <ShipTrackPlay ref={trackRef} isRadarTarget={!!uniqueId} tarckList={tarckList} />
      </div>
      <div className={styles.queryPanel}>
        <FormInterface
          inputs={inputs}
          onFinish={handleQuery}
          initData={initData}
          formProps={{
            layout: 'inline'
          }}
          options={{
            isShowItemButton: true,
            isNotShowFooter: true,
            isShowReset: false,
            submitText: '查询'
          }} />
      </div>
    </article>
  )
}

export default HistoryTrack