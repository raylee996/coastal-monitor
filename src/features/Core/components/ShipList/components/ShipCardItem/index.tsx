import React, { useEffect, useState } from "react";
import styles from "./index.module.sass";
import _ from "lodash";
import { Button, message } from 'antd'
import ShipInfo from "../../../ShipInfo";
import ShipRelational from "../../../ShipInfo/components/ShipRelational";
import TargetFlow from "../TargetFlow";
import windowUI from "component/WindowUI";
import { getShipInfoData } from "../../../../../../server/ship";
import WarningDetail from "../../../WarningModel/components/WarningDetail";
import { useAppDispatch } from "app/hooks";
import { selectTarget } from "slice/selectTargetSlice";

interface Props {
  data?: any
  activeData?: any
  onSelect?: any,
  onAction?: any
}
const ShipCardItem: React.FC<Props> = ({ data, activeData, onSelect, onAction }) => {
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
        message.error('获取船舶信息异常')
      }
    }
    main()
  }, [data])

  function onclick(searchText: any) {
    onSelect && onSelect(true, data)
    dispatch(selectTarget({ mmsi: searchText, isCenter: true }))
  }
  //船舶信息
  function openShipPanel(data: any) {
    windowUI(<ShipInfo
      mmsi={data.shipDataAisDto.mmsi}
      data={data}
    />, {
      title: 'AIS船舶信息',
      key: '船舶',
      width: 400,
      height: 720,
      offset: [480, 160]
    })
  }
  //船舶关联信息
  function openShipArchiveFitting() {
    windowUI(<ShipRelational info={shipInfo} />, {
      title: '关联信息',
      width: 400,
      height: 720,
      offset: [480, 160],
      key: '关联信息'
    })
  }
  //目标跟踪
  function openTargetFlow(data: any) {
    windowUI(<TargetFlow
      targetType='ais'
      lat={data.shipDataAisDto.lat}
      lng={data.shipDataAisDto.lng}
      mmsi={data.shipDataAisDto.mmsi}
      fusionId={data.tagCode}
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
  //预警记录
  function openWarning() {
    //contentType 0-人脸 1-车牌 2-IMSI 3-IMEI 4-MAC 5-手机 6-MMSI 7-雷达目标 8-目标ID 9-视频告警,多个按逗号分割.
    //id  mmsi:mmsi, radarNumber:雷达批号
    windowUI(<WarningDetail id={data.mmsi} contentType={6} />, { title: `预警记录`, key: '预警记录', width: '480px', height: '800px', offset: [1400, 40] })
  }
  //历史轨迹
  function openViewHistory(data: any) {
    onAction && onAction('historyTrack', data)
  }
  return <>
    <div className={`${styles.wrapperItem} ${activeData && _.some(activeData, data) ? styles.active : styles.unActive}`} onClick={() => onclick(data.mmsi)}>
      <div className={styles.top}>
        <div className={styles.topLeft}>
          {/*风险等级图标*/}
          {data.riskLevel === 1 && <span className={`${styles.icon} ${styles.highIcon}`} style={{ transform: `rotate(${data.shipDataAisDto.true_heading + 90}deg)` }} />}
          {data.riskLevel === 2 && <span className={`${styles.icon} ${styles.middleIcon}`} style={{ transform: `rotate(${data.shipDataAisDto.true_heading + 90}deg)` }} />}
          {data.riskLevel === 3 && <span className={`${styles.icon} ${styles.lowIcon}`} style={{ transform: `rotate(${data.shipDataAisDto.true_heading + 90}deg)` }} />}
          {data.riskLevel === 4 && <span className={`${styles.icon} ${styles.shipIcon}`} style={{ transform: `rotate(${data.shipDataAisDto.true_heading + 90}deg)` }} />}

          {data?.shipInfoWsDto?.cnName || data?.shipInfoWsDto?.enName || ' --'} / {data?.mmsi}

        </div>
        <div className={styles.topRight}>
          {data.shipTypeName || '--'}
        </div>
      </div>
      <div className={styles.middle}>
        <div>航速/航向：{data.speed?.toFixed(3) || '--'}节 / {data.shipDataAisDto.true_heading || '--'}</div>
        <div className={styles.lngLat}>经纬度：{data.shipDataAisDto.lng.toFixed(6)},{data.shipDataAisDto.lat.toFixed(6)}</div>
      </div>
      {(activeData && _.some(activeData, data)) && <div className={styles.bottom}>
        <Button type="link" size={"small"} onClick={() => openTargetFlow(data)}>目标跟踪</Button>
        <Button type="link" size={"small"} onClick={() => openShipPanel(data)}>查看详情</Button>
        <Button type="link" size={"small"} onClick={() => openViewHistory(data)}>历史轨迹</Button>
        <Button type="link" size={"small"} onClick={openShipArchiveFitting}>关联信息</Button>
        <Button type="link" size={"small"} onClick={openWarning}>预警记录</Button>
      </div>}
      <div className={`${styles.bottomLine} ${_.some(activeData, data) ? styles.activeLine : styles.unActiveLine}`} />
    </div>
  </>
}

export default ShipCardItem
