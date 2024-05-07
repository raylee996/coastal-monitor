import { message, Tabs } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./index.module.sass";
import ImageSimple from "hooks/basis/ImageSimple";
import WarningTable from "../WarningTable";
import _ from "lodash";
import ShipArchiveInfo from "features/DataCenter/ShipArchiveInfo";
import popup from "hooks/basis/Popup";
import { getShipInfoData } from "server/ship";
import RadarRelational from "./components/RadarRelational";
import ButtonSmall from "component/ButtonSmall";
import windowUI from "component/WindowUI";
import TargetFlow from "../ShipList/components/TargetFlow";
import risk4_src from "images/ship/risk4.png"
import ViewHistoryTrack from "../ShipList/components/ViewHistoryTrack";
import { getRiskLevelIconSrc } from "helper";
import { getDictName, ShipRiskDict } from "helper/dictionary";
import shipDefSrc from 'images/default/ship.png'
import useVideoLinkage from "useHook/useVideoLinkage";

interface Props {
  /** 雷达批号 */
  radarNumber?: string
  /** 包含shipDataRadarDto的websocket消息数据 */
  data?: any
  /** 风险等级信息 */
  riskLevel?: number
  /** 船舶预警记录截至时间 */
  alarmEndTime?: string
}

const RadarTargetInfo: React.FC<Props> = ({ radarNumber, data, riskLevel, alarmEndTime }) => {
  console.debug('RadarTargetInfo')

  const handleOpenVideoLinkWin = useVideoLinkage()

  const [shipInfo, setShipInfo] = useState<any>()
  const [levelText, setLevelText] = useState('')
  const [levelSrc, setLevelSrc] = useState(risk4_src)
  const [baseInfo] = useState(() => {
    let info = {
      targetId: '',
      speed: '',
      lnglat: '',
      course: '',
      radar: '',
      time: ''
    }
    if (data) {
      const radarData = _.get(data, 'shipDataRadarDto', {})
      info = {
        targetId: data.tagCode,
        speed: radarData.speed,
        lnglat: radarData.lng && radarData.lat ? `${radarData.lng.toFixed(6)}/${radarData.lat.toFixed(6)}` : '',
        course: radarData.course,
        radar: radarData.uniqueid,
        time: data.capTime
      }
    }
    return info
  })


  useEffect(() => {
    async function main() {
      if (data && data.batchNum) {
        const dto = {
          radarNumber: data.batchNum
        }
        const vo = await getShipInfoData(dto)
        setShipInfo(vo)
      }
    }
    main()
  }, [data])

  // 获取船舶风险信息
  useEffect(() => {
    async function main() {
      if (riskLevel) {
        const src = getRiskLevelIconSrc(riskLevel)
        const text = getDictName(ShipRiskDict, riskLevel)
        setLevelText(text)
        setLevelSrc(src)
      }
    }
    main()
  }, [riskLevel, radarNumber])

  const items = useMemo(() => [{
    key: '1',
    label: '预警记录',
    children: <WarningTable batchNum={data?.batchNum} endTime={alarmEndTime} />
  }, {
    key: '2',
    label: '关联信息',
    children: <RadarRelational shipInfo={shipInfo} />
  }], [data, shipInfo, alarmEndTime])


  /*   const handleOpenVideo = useCallback(
      () => {
        windowUI(<VideoLink
          targetType='radar'
          uniqueId={data.batchNum}
          fusionId={data.shipDataRadarDto.global_id}
          lat={data.shipDataRadarDto.lat}
          lng={data.shipDataRadarDto.lng}
        />, {
          title: `雷达批号:${data.batchNum}`,
          key: '目标跟踪',
          width: '800px',
          height: 'auto',
          offset: [1100, 55]
        })
      },
      [data, dispatch],
    ) */

  const handleOpenVideo = useCallback(
    () => {
      handleOpenVideoLinkWin({
        targetType: 'radar',
        uniqueId: data.batchNum,
        fusionId: data.shipDataRadarDto.global_id,
        lat: data.shipDataRadarDto.lat,
        lng: data.shipDataRadarDto.lng,
      })
    },
    [data, handleOpenVideoLinkWin],
  )

  function handleHistoryTrack() {
    const uniqueid = data?.shipDataRadarDto?.uniqueid
    if (uniqueid) {
      windowUI(<ViewHistoryTrack list={[{ batchNum: uniqueid }]} targetType='radar' />, {
        title: '船舶历史轨迹',
        key: '历史轨迹',
        width: '800px',
        height: '300px',
        offset: [600, 580],
      })
    } else {
      message.warning('无雷达目标唯一标识')
    }
  }

  function handleArchive() {
    if (shipInfo) {
      popup(<ShipArchiveInfo id={shipInfo.id} dataType={shipInfo.dataType} />, { title: '查看船舶档案', size: "fullscreen" })
    } else {
      message.warning('无档案信息')
    }
  }

  // function handleType() {
  //   if (shipInfo) {
  //     windowUI(<ShipChangeType id={shipInfo.id} focusType={shipInfo.focusType} onFinish={(type) => {
  //       _.set(shipInfo, 'focusType', type)
  //     }} />, { title: `更改船舶类型`, width: 300, height: 200, offset: [533, 565] })
  //   } else {
  //     message.warning('无档案信息')
  //   }
  // }

  // 目标跟踪
  function handleTrace() {
    windowUI(<TargetFlow
      targetType='radar'
      lat={data?.shipDataRadarDto.lat}
      lng={data?.shipDataRadarDto.lng}
      uniqueId={radarNumber}
      fusionId={data?.shipDataRadarDto.global_id}
      batchNum={radarNumber}
    />, {
      title: '目标跟踪',
      key: '目标跟踪',
      width: '800px',
      height: 'auto',
      offset: [1100, 55]
    })
  }

  function handleOpenControl() {
    message.error('雷达目标暂不支持布控操作！')
  }

  return (
    <article className={styles.wrapper}>
      <header>
        <ImageSimple className={styles.shipImg} defaultSrc={shipDefSrc} />
        <div className={styles.box}>
          <div className={styles.row}>
            <div className={styles.label}>航速(节):</div>
            <div className={styles.value}>{baseInfo.speed}</div>
          </div>
          <div className={styles.row}>
            <div className={styles.label}>航向:</div>
            <div className={styles.value}>{baseInfo.course}</div>
          </div>
          <div className={styles.row}>
            <div className={styles.label}>目标ID:</div>
            <div className={styles.value} title={baseInfo.targetId}>{baseInfo.targetId}</div>
          </div>
          <div className={styles.row}>
            <div className={styles.label}>关联雷达:</div>
            <div className={styles.value}>{baseInfo.radar}</div>
          </div>
          <div className={styles.row}>
            <div className={styles.label}>经纬度:</div>
            <div className={styles.value}>{baseInfo.lnglat}</div>
          </div>
          <div className={styles.row}>
            <div className={styles.label}>采集时间:</div>
            <div className={styles.value}>{baseInfo.time}</div>
          </div>
        </div>
        <div className={styles.level}>
          <img src={levelSrc} alt="" />
          <span>{levelText}</span>
        </div>
      </header>
      <section>
        <Tabs
          className={`${styles.tabs} tabs_ui`}
          defaultActiveKey="1"
          items={items}
        />
      </section>
      <footer>
        <div className={styles.buttomRow}>
          <ButtonSmall className={styles.buttom} name='目标跟踪' onClick={handleTrace} />
          <ButtonSmall className={styles.buttom} name='视频联动' onClick={handleOpenVideo} />
          {/* <ButtonSmall className={styles.buttom} name='联动测试' onClick={handleOpenVideo1} /> */}

          {/* <ButtonSmall className={styles.buttom} name='无人机跟拍' /> */}
          {/* <ButtonSmall className={styles.buttom} name='实时指挥' /> */}
          <ButtonSmall className={styles.buttom} name='历史轨迹' onClick={handleHistoryTrack} />
          <ButtonSmall className={styles.buttom} name='布控' onClick={handleOpenControl} />
        </div>
        <div className={styles.buttomRow}>
          <ButtonSmall className={styles.buttom} name='查看档案' onClick={handleArchive} />
          {/* <ButtonSmall className={styles.buttom} name='更改分类' onClick={handleType} /> */}
        </div>
      </footer>
    </article>
  )
}

export default RadarTargetInfo
