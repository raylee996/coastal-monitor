import ShipTrackPlay, { ShipTrackPlayRefProps, TarckData } from "component/ShipTrackPlay";
import { useEffect, useMemo, useRef, useState } from "react";
import { getPlaceListDetailinfos } from "server/place";
import { getPlaceTargetTrack } from "server/track";
import styles from "./index.module.sass";


interface Props {
  /** 表格记录 */
  record: {
    codeType: number
    codeValue: string
    capTime: string
    /** 港口id */
    placeId: number
  }
}

const MapTarck: React.FC<Props> = ({ record }) => {
  console.debug('MapTarck')

  const [tarckList, setTarckList] = useState<TarckData[]>([])

  const trackRef = useRef<ShipTrackPlayRefProps>(null)

  const [placeAreaList, setPlaceAreaList] = useState<any[]>()

  useEffect(() => {
    async function main() {
      const vo = await getPlaceTargetTrack(record)
      setTarckList(vo)
    }
    main()
  }, [record])

  // 通过placeId获取区域形状并绘制
  useEffect(() => {
    async function getPlace(placeId: number) {
      const vo = await getPlaceListDetailinfos({ placeId })
      setPlaceAreaList(vo)
    }
    record?.placeId && getPlace(record.placeId)
  }, [record])

  useEffect(() => {
    console.log(placeAreaList, 'placeAreaList')
  }, [placeAreaList])

  const isRadarTarget = useMemo(() => record.codeType === 7, [record])

  return (
    <article className={styles.wrapper}>
      <ShipTrackPlay
        ref={trackRef}
        tarckList={tarckList}
        isRadarTarget={isRadarTarget}
        isNotControlPanel
        isShowArrow
        isShowStart
        targetInitIndex={tarckList?.length - 1 || 0}
      />
    </article>
  )
}

export default MapTarck