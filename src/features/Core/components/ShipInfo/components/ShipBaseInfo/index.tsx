// import dayjs from "dayjs";
import { getDictName, shipStatusDict } from "helper/dictionary";
import { useEffect, useState } from "react";
import _ from "lodash";
import styles from "./index.module.sass";


interface Props {
  /** 采集数据 */
  data?: any
  /** 船舶档案信息 */
  info?: any
}

const ShipBaseInfo: React.FC<Props> = ({ data, info }) => {
  console.debug('ShipBaseInfo')

  const [aisInfo, setAisInfo] = useState<any>({})

  const [radarInfo, setRadarInfo] = useState<any>({})

  useEffect(() => {
    const aisData = _.get(data, 'shipDataAisDto', {})
    // const staticData = _.get(data, 'shipDataStaticAis', {})
    const stateName = getDictName(shipStatusDict, aisData.nav_status)
    // const arrivalTime = _.isEmpty(staticData) ? '' : dayjs().set('M', staticData.eta_month).set('D', staticData.eta_day).set('h', staticData.eta_hour).set('s', staticData.eta_minute).format('MM-DD HH:mm')
    const shipDataStaticAisDto = _.get(data, 'shipDataStaticAisDto', {})
    setAisInfo({
      speed: aisData.sog,
      course: aisData.cog,
      lnglat: aisData.lng && aisData.lat ? `${aisData.lng}/${aisData.lat}` : '',
      heading: aisData.true_heading || aisData.cog,
      state: stateName,
      destination: shipDataStaticAisDto?.destination,
      long: info?.shipLong,
      width: info?.shipWide,
      arrivalTime: shipDataStaticAisDto?.arriveTime,
      draught: info?.draftDepth,
      flagship: info?.registry,
      gatherTime: aisData.capTime
    })
  }, [data, info])

  useEffect(() => {
    const radarData = _.get(data, 'shipDataRadarDto') || {}
    setRadarInfo({
      number: radarData.uniqueid,
      course: radarData.course,
      lnglat: radarData.lat && radarData.lng && `${radarData.lng}/${radarData.lat}`,
      speed: radarData.speed,
      gatherTime: radarData.capTime
    })
  }, [data])

  return (
    <article>
      <article className={styles.content}>
        <header>AIS信息</header>
        <section className={styles.box}>
          <div className={styles.row}>
            <div className={styles.item}>
              <div className={styles.label}>航速/节:</div>
              <div className={styles.value}>{aisInfo.speed}</div>
            </div>
            <div className={styles.item}>
              <div className={styles.label}>经纬度:</div>
              <div className={styles.value}>{aisInfo.lnglat}</div>
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.item}>
              <div className={styles.label}>航艏向:</div>
              <div className={styles.value}>{aisInfo.heading}</div>
            </div>
            <div className={styles.item}>
              <div className={styles.label}>航向:</div>
              <div className={styles.value}>{aisInfo.course}</div>
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.item}>
              <div className={styles.label}>状态:</div>
              <div className={styles.value}>{aisInfo.state}</div>
            </div>
            <div className={styles.item}>
              <div className={styles.label}>目的地:</div>
              <div className={styles.value} title={aisInfo?.destination}>{aisInfo?.destination}</div>
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.item}>
              <div className={styles.label}>船长/米:</div>
              <div className={styles.value}>{aisInfo.long}</div>
            </div>
            <div className={styles.item}>
              <div className={styles.label}>预到时间:</div>
              <div className={styles.value}>{aisInfo.arrivalTime}</div>
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.item}>
              <div className={styles.label}>船宽/米:</div>
              <div className={styles.value}>{aisInfo.width}</div>
            </div>
            <div className={styles.item}>
              <div className={styles.label}>吃水/米:</div>
              <div className={styles.value}>{aisInfo.draught}</div>
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.item}>
              <div className={styles.label}>船籍:</div>
              <div className={styles.value}>{aisInfo.flagship}</div>
            </div>
            <div className={styles.item}>
              <div className={styles.label}>采集时间:</div>
              <div className={styles.value}>{aisInfo.gatherTime}</div>
            </div>
          </div>
        </section>
      </article>
      <article className={styles.content}>
        <header>雷达信息</header>
        <section className={styles.box}>
          <div className={styles.row}>
            <div className={styles.item}>
              <div className={styles.label}>雷达批号</div>
              <div className={styles.value}>{radarInfo.number}</div>
            </div>
            <div className={styles.item}>
              <div className={styles.label}>经纬度</div>
              <div className={styles.value}>{radarInfo.lnglat}</div>
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.item}>
              <div className={styles.label}>航速/节</div>
              <div className={styles.value}>{radarInfo.speed}</div>
            </div>
            <div className={styles.item}>
              <div className={styles.label}>航向</div>
              <div className={styles.value}>{radarInfo.course}</div>
            </div>
          </div>
          <div className={styles.row}>
            {/* <div className={styles.item}>
              <div className={styles.label}>大小</div>
              <div className={styles.value}></div>
            </div> */}
            <div className={styles.item}>
              <div className={styles.label}>采集时间</div>
              <div className={styles.value}>{radarInfo.gatherTime}</div>
            </div>
          </div>
        </section>
      </article>
    </article>
  )
}

export default ShipBaseInfo