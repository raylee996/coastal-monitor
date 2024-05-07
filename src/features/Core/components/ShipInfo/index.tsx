import { message, Tabs, Tooltip } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./index.module.sass";
import { getShipInfoData } from "server/ship";
import ImageSimple from "hooks/basis/ImageSimple";
import WarningTable from "../WarningTable";
import _ from "lodash";
import popup from "hooks/basis/Popup";
import ShipArchiveInfo from "features/DataCenter/ShipArchiveInfo";
import ShipChangeType from "./components/ShipChangeType";
import ShipRelational from "./components/ShipRelational";
import ShipRiskRadar from "./components/ShipRiskRadar";
import ShipBaseInfo from "./components/ShipBaseInfo";
import ButtonSmall from "component/ButtonSmall";
import TargetFlow from "../ShipList/components/TargetFlow";
import windowUI from "component/WindowUI";
import ViewHistoryTrack from "../ShipList/components/ViewHistoryTrack";
import ShipAdd from "../Control/ShipAdd";
import popupUI from "component/PopupUI";
import { getRiskLevelIconSrc } from "helper";
import { getDictName, ShipRiskDict } from "helper/dictionary";
import shipDefSrc from 'images/default/ship.png'
import useVideoLinkage from "useHook/useVideoLinkage";

interface Props {
  mmsi?: string
  /** 包含shipDataAisDto的websocket消息数据 */
  data: any
  /** 风险等级信息 */
  riskLevel?: number
  /** 目标id */
  targetId?: string
  /** 船舶预警记录截至时间 */
  alarmEndTime?: string
}

const ShipInfo: React.FC<Props> = ({ mmsi, data, riskLevel, targetId, alarmEndTime }) => {
  console.debug('ShipInfo')
  const handleOpenVideoLinkWin = useVideoLinkage()

  const [shipInfo, setShipInfo] = useState<any>()
  const [levelText, setLevelText] = useState('')
  const [levelSrc, setLevelSrc] = useState('')
  const [baseInfo, setBaseInfo] = useState({
    img: '',
    name: '-',
    imo: '-',
    mmsi: '-',
    type: '-',
    call: '-'
  })

  useEffect(() => {
    async function main() {
      try {
        if (mmsi) {
          const params = {
            mmsi: mmsi
          }
          const vo = await getShipInfoData(params)
          setBaseInfo({
            img: vo.headShipImg,
            name: vo.cnName || vo.enName,
            imo: vo.imo,
            mmsi: vo.mmsi,
            type: vo.shipTypeName,
            call: vo.callSign
          })
          setShipInfo(vo)
        }
      } catch (error) {
        console.error('获取船舶信息异常', error)
      }
    }
    main()
  }, [mmsi])

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
  }, [mmsi, riskLevel])

  const items = useMemo(() => {
    const warningTableProps = {
      mmsi,
      targetId,
      endTime: alarmEndTime
    }
    return [{
      key: '1',
      label: '基本信息',
      children: <ShipBaseInfo data={data} info={shipInfo} />
    }, {
      key: '2',
      label: '预警记录',
      children: <WarningTable {...warningTableProps} />
    }, {
      key: '3',
      label: '风险分布图',
      children: <ShipRiskRadar data={{ mmsi }} />
    }, {
      key: '4',
      label: '关联信息',
      children: <ShipRelational info={shipInfo} data={data} />
    }]
  }, [data, shipInfo, targetId, mmsi, alarmEndTime])

/* 
  const handleOpenVideo = useCallback(
    () => {
      windowUI(<VideoLink
        targetType='ais'
        mmsi={mmsi}
        lat={data.shipDataAisDto.lat}
        lng={data.shipDataAisDto.lng}
        fusionId={data.shipDataAisDto.global_id}
        station={data.shipDataAisDto.station}
      />, {
        title: `MMSI:${mmsi}`,
        key: '目标跟踪',
        width: '800px',
        height: 'auto',
        offset: [1100, 55],
        style: {
          wrapperStyle: {
            resize: 'both'
          }
        }
        // offset: [undefined, 160, 80]
      })
    },
    [data, mmsi, dispatch],
  ) */
  const handleOpenVideo = useCallback(
    () => {
      handleOpenVideoLinkWin({
        targetType:'ais',
        mmsi,
        fusionId:data.shipDataAisDto.global_id,
        lat:data.shipDataAisDto.lat,
        lng:data.shipDataAisDto.lng,
        station:data.shipDataAisDto.station
      })
    },
    [data, handleOpenVideoLinkWin, mmsi],
  )

  function handleHistoryTrack() {
    if (mmsi) {
      windowUI(<ViewHistoryTrack list={[{ mmsi }]} targetType='ais' />, {
        title: '船舶历史轨迹',
        key: '历史轨迹',
        width: '800px',
        height: '300px',
        offset: [600, 580],
      })
      // dispatch(set({
      //   targetList: [{ mmsi }],
      //   isShow: true
      // }))
    } else {
      message.warning('无mmsi标识')
    }
  }

  function handleArchive() {
    if (shipInfo) {
      popup(<ShipArchiveInfo id={shipInfo.id} dataType={shipInfo.dataType} />, { title: '查看船舶档案', size: "fullscreen" })
    } else {
      message.error('该目标无档案')
    }
  }

  function handleType() {
    if (shipInfo) {
      windowUI(<ShipChangeType id={shipInfo.id} focusType={shipInfo.focusType} onFinish={(type) => {
        _.set(shipInfo, 'focusType', type)
      }} />, { title: `更改船舶类型`, width: 300, height: 200, offset: [533, 565] })
    } else {
      message.error('该目标无档案')
    }
  }

  // 目标跟踪
  function handleTrace() {
    // 对于融合目标，需要传递雷达Id
    windowUI(<TargetFlow
      mmsi={mmsi}
      targetType='ais'
      lat={data.shipDataAisDto.lat}
      lng={data.shipDataAisDto.lng}
      fusionId={data.shipDataAisDto.global_id}
      uniqueId={data.batchNum}
      station={data.shipDataAisDto.station}
      batchNum={data.batchNum}
    />, {
      title: '目标跟踪',
      key: '目标跟踪',
      width: '800px',
      height: 'auto',
      offset: [1100, 55]
    })
  }

  function handleOpenControl() {
    if (!mmsi) {
      message.warning(`无mmsi数据`);
      return;
    }
    const params = {
      controlScope: "1",
      alarmConditionShipMmsis: mmsi,
    }
    popupUI(<ShipAdd controlType={1} params={params} />, { title: '新增布控', size: "middle", })
  }

  return (
    <article className={styles.wrapper}>
      <header>
        <ImageSimple className={styles.shipImg} src={baseInfo.img} defaultSrc={shipDefSrc} />
        <div className={styles.box}>
          <div className={styles.row}>
            <div className={styles.label}>MMSI:</div>
            <div className={styles.value}>{baseInfo.mmsi}</div>
          </div>
          <div className={styles.row}>
            <div className={styles.label}>船名:</div>
            <Tooltip title={baseInfo.name}>
              <div className={styles.value}>{baseInfo.name}</div>
            </Tooltip>
          </div>
          <div className={styles.row}>
            <div className={styles.label}>船型:</div>
            <div className={styles.value}>{baseInfo.type}</div>
          </div>
          <div className={styles.row}>
            <div className={styles.label}>呼号:</div>
            <div className={styles.value}>{baseInfo.call}</div>
          </div>
          <div className={styles.row}>
            <div className={styles.label}>IMO:</div>
            <div className={styles.value}>{baseInfo.imo}</div>
          </div>
        </div>
        {levelSrc &&
          <div className={styles.level}>
            <img src={levelSrc} alt="" />
            <span>{levelText}</span>
          </div>
        }
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
          {/* <ButtonSmall className={styles.buttom} name='无人机跟拍' /> */}
          {/* <ButtonSmall className={styles.buttom} name='实时指挥' /> */}
          <ButtonSmall className={styles.buttom} name='历史轨迹' onClick={handleHistoryTrack} />
          <ButtonSmall className={styles.buttom} name='布控' onClick={handleOpenControl} />
        </div>
        <div className={styles.buttomRow}>
          <ButtonSmall className={styles.buttom} name='查看档案' onClick={handleArchive} />
          <ButtonSmall className={styles.buttom} name='更改分类' onClick={handleType} />
        </div>
      </footer>
    </article>
  )
}

export default ShipInfo

