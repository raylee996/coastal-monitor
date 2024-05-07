// import { Button } from "antd"
// import popupUI from "component/PopupUI";
import { useAppDispatch } from "app/hooks";
import TextButtom from "component/TextButtom";
// import popup from "hooks/basis/Popup";
import { TableCardProps } from "hooks/flexibility/CardPanel"
import _ from "lodash";
import { useCallback } from "react";
import { setIndex, setParams } from "slice/funMenuSlice";
import useRealtimeVideo from "useHook/useRealtimeVideo";
// import EarlyRecordPopup from "../EarlyRecordPopup";
// import HandleWarningResult from "../HandleWarningResult";
import styles from "./index.module.sass";

export const earlyWarningIconColor = ['#fadb14', '#ff4d4f', '#ffa940', '#fadb14']

const WarningTypeCardItem: React.FC<TableCardProps<any>> = (props) => {
  console.debug('WarningTypeCardItem')

  const dispatch = useAppDispatch()

  // const { data, onSelect, activeData, onRefresh } = props
  const { data, onSelect, activeData } = props

  // const { id, monitorName, monitorType, contentType, warnTime, warnContent, sameWarnCount, status, statusName, warnTypeName, riskLevel, dealRecord, speed } = data || {}
  const { id, monitorName, monitorType, warnTime, warnContent, sameWarnCount, warnTypeName, riskLevel, speed, deviceType, deviceCode } = data || {}

  const openRealTimeWin = useRealtimeVideo()

  function onclick() {
    onSelect && onSelect(true, data)
  }

  /* function handleClick() {
    popup(<HandleWarningResult id={id} isShipTarget={[6].includes(contentType)} onRefresh={onRefresh} />, { title: '处理', size: 'small' })
  }

  function handleOpenMsg() {
    dealRecord && popupUI(<EarlyRecordPopup data={dealRecord} />, { title: '查看处理结果', size: 'mini' })
  } */

  const handleVideo = useCallback(
    () => {
      // 设备类型为外周扫时打开周扫页面
      if (deviceType === 7) {
        dispatch(setParams({
          deviceCode
        }))
        dispatch(setIndex(6))
      }
      else {
        openRealTimeWin({
          deviceCode
        })
      }
    },
    [deviceType, dispatch, deviceCode, openRealTimeWin],
  )


  return (
    <article className={`${styles.wrapperItem} ${activeData && _.some(activeData, data) ? styles.active : styles.unActive}`} data-value={id} onClick={onclick}>
      <section className={styles.modelTitle}>
        <div className={`${styles.modelTitleLeft} ${styles.label}`}>
          <span className={`iconfont icon-lingdang ${styles.icon}`} style={{ color: earlyWarningIconColor[riskLevel || 0] }}></span>
          {monitorName}
        </div>

        {/* <div>
          {status === '0' ? <Button type="primary" size={'small'} onClick={handleClick}>
            {statusName}
          </Button> : <span onClick={handleOpenMsg}>{statusName}</span>
          }
        </div> */}
      </section>

      <section className={styles.modelContent}>
        <div>
          <div className={styles.warningCondition}>{warnTime}&nbsp;&nbsp;{(speed >= 0 || speed) && speed !== null ? `${speed}节` : ''}</div>

          <div className={styles.warningConditionRow}>
            {monitorType === '05'
              ? <div>预警点位：{data.deviceName}</div>
              : <div>预警内容：{warnContent}</div>
            }
            <div>{`${sameWarnCount || 0}次`}</div>
          </div>

          <div className={styles.warningConditionRow}>
            <div>预警类型：{warnTypeName}</div>
            {monitorType === '05' &&
              <div>
                <TextButtom onClick={handleVideo}>实时视频</TextButtom>
              </div>
            }
          </div>

        </div>
      </section>

      <div className={`${styles.bottomLine} ${_.some(activeData, data) ? styles.activeLine : styles.unActiveLine}`}></div>
    </article>
  )
}

export default WarningTypeCardItem