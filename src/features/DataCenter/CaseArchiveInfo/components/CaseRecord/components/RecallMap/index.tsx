import windowUI from "component/WindowUI";
import WarningDetail from "features/Core/components/WarningModel/components/WarningDetail";
import { YMDHms } from "helper";
import Map2D, { MapTileType } from "helper/Map2D";
import { DayjsPair } from "hooks/hooks";
import { useEffect, useRef, useState } from "react";
import styles from "./index.module.sass";


interface Props {
  record: any
  /** 时间范围 */
  range?: DayjsPair
}

const RecallMap: React.FC<Props> = ({ record, range }) => {
  console.debug('RecallMap')


  const mapRef = useRef<HTMLElement>(null)


  const [map2d, setMap2D] = useState<Map2D>()


  // 初始化地图
  useEffect(() => {
    let _map2d: Map2D
    if (mapRef.current) {
      _map2d = new Map2D(mapRef.current, MapTileType.satellite)
      setMap2D(_map2d)
    }
    return () => {
      _map2d?.map?.remove()
    }
  }, [])

  useEffect(() => {
    let detailWindow: any
    if (map2d) {
      let startTime = undefined
      let endTime = undefined
      if (range) {
        const [start, end] = range
        startTime = start.format(YMDHms)
        endTime = end.format(YMDHms)
      }
      detailWindow = windowUI(<WarningDetail
        id={record.warnContent}
        contentType={record.contentType}
        parentDate={record}
        targetMap={map2d}
        startTime={startTime}
        endTime={endTime}
      />, {
        title: `预警详情`,
        key: '预警详情',
        width: '480px',
        height: '800px',
        offset: [1400, 40]
      })
    }

    return () => {
      detailWindow?.onUnmount()
    }
  }, [map2d, record, range])


  return (
    <article className={styles.wrapper}>
      <section className={styles.map} ref={mapRef}></section>
    </article>
  )
}

export default RecallMap