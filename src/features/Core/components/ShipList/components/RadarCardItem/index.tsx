import React, { useEffect, useState } from "react";
import styles from "./index.module.sass";
import _ from "lodash";
import { Button, message } from 'antd'
import TargetFlow from "../TargetFlow";
import windowUI from "../../../../../../component/WindowUI";
import { getShipInfoData } from "../../../../../../server/ship";
import ShipRelational from "../../../ShipInfo/components/ShipRelational";
import WarningDetail from "../../../WarningModel/components/WarningDetail";
import RadarTargetInfo from "features/Core/components/RadarTargetInfo";
import { selectTarget } from "slice/selectTargetSlice";
import { useAppDispatch } from "app/hooks";

interface Props {
  data?: any
  activeData?: any
  onSelect?: any
  onAction?: any
}
const RadarCardItem: React.FC<Props> = ({ data, activeData, onSelect, onAction }) => {
  //用于关联信息
  const [shipInfo, setShipInfo] = useState<any>()
  const dispatch = useAppDispatch()
  useEffect(() => {
    async function main() {
      try {
        if (data) {
          const params = {
            radarNumber: _.get(data, 'batchNum', undefined),
            mmsi: _.get(data, 'mmsi', undefined)
          }
          const vo = await getShipInfoData(params)
          setShipInfo(vo)
        }
      } catch (error) {
        message.error('获取雷达信息异常')
      }
    }
    main()
  }, [data])
  function onclick(searchText: any) {
    onSelect && onSelect(true, data)
    dispatch(selectTarget({ radar: searchText, isCenter: true }))
  }

  //查看详情
  function openRadarTargetInfo(data: any) {
    const title = `雷达目标-批号(${data.batchNum})`
    windowUI(<RadarTargetInfo radarNumber={data.batchNum} data={data} />, {
      title,
      key: '船舶',
      width: 400,
      height: 720,
      offset: [480, 160]
    })
  }
  //关联信息
  function openShipArchiveFitting() {
    windowUI(<ShipRelational info={shipInfo} />, {
      title: '关联信息',
      width: 400,
      height: 720,
      offset: [480, 160]
    })
  }
  //目标跟踪
  function openTargetFlow(item: any) {
    windowUI(<TargetFlow targetType='radar'
      lat={item.shipDataRadarDto.lat}
      lng={item.shipDataRadarDto.lng}
      uniqueId={item.shipDataRadarDto.uniqueid}
      fusionId={item.tagCode}
    />, {
      title: '目标跟踪',
      key: '目标跟踪',
      width: '800px',
      height: 'auto',
      offset: [1100, 55]
    })
  }
  //预警记录
  function openWarning() {
    //contentType 0-人脸 1-车牌 2-IMSI 3-IMEI 4-MAC 5-手机 6-MMSI 7-雷达目标 8-目标ID 9-视频告警,多个按逗号分割.
    //id  mmsi:mmsi, radarNumber:雷达批号
    windowUI(<WarningDetail id={data.batchNum} contentType={7} />, { title: `预警记录`, key: '预警记录', width: '480px', height: '800px', offset: [1400, 40] })
  }
  //历史轨迹
  function openViewHistory(data: any) {
    onAction && onAction('historyTrack', data)
  }
  return <>
    <div className={`${styles.wrapperItem} ${activeData && _.some(activeData, data) ? styles.active : styles.unActive}`} onClick={() => onclick(data.batchNum)}>
      <div className={styles.top}>
        <div className={styles.topLeft}>
          {data.riskLevel === 1 && <span className={`${styles.icon} ${styles.highIcon}`} />}
          {data.riskLevel === 2 && <span className={`${styles.icon} ${styles.middleIcon}`} />}
          {data.riskLevel === 3 && <span className={`${styles.icon} ${styles.lowIcon}`} />}
          {data.riskLevel === 4 && <span className={`${styles.icon} ${styles.radarIcon}`} />}
          {data.batchNum || '--'}
        </div>
        <div className={styles.topRight}>
          {data.shipTypeName || '--'}
        </div>
      </div>
      <div className={styles.middle}>
        <div>航速/航向：{data.speed.toFixed(3) || '--'}节 / {data.shipDataRadarDto.course}</div>
        <div className={styles.lngLat}>经纬度：{data.shipDataRadarDto.lng.toFixed(6)},{data.shipDataRadarDto.lat.toFixed(6)}</div>
      </div>
      {(activeData && _.some(activeData, data)) && <div className={styles.bottom}>
        <Button type="link" size={"small"} onClick={() => openTargetFlow(data)}>目标跟踪</Button>
        <Button type="link" size={"small"} onClick={() => openRadarTargetInfo(data)}>查看详情</Button>
        <Button type="link" size={"small"} onClick={() => openViewHistory(data)}>历史轨迹</Button>
        <Button type="link" size={"small"} onClick={openShipArchiveFitting}>关联信息</Button>
        <Button type="link" size={"small"} onClick={openWarning}>预警记录</Button>
      </div>}
      <div className={`${styles.bottomLine} ${_.some(activeData, data) ? styles.activeLine : styles.unActiveLine}`} />
    </div>
  </>
}

export default RadarCardItem


