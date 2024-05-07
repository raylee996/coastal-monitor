import { BulbFilled } from "@ant-design/icons";
import { message, Popover } from "antd";
import { useAppDispatch, useAppSelector } from "app/hooks";
import windowUI from "component/WindowUI";
import VoicePlayPanel from "features/Core/components/Voice/VoicePlayPanel";
import { createDrawAreaPolyline } from "helper/map/common";
import { useCallback, useMemo } from "react";
import { selectValue } from "slice/coreMapSlice";
import { setIndex, setParams } from "slice/funMenuSlice";
import useRealtimeVideo from "useHook/useRealtimeVideo";
import { DevicePopupData } from "../.."
import DeviceItem from "../DeviceItem";
import styles from "./index.module.sass";


let areaPolyline: any

interface Props {
  data: DevicePopupData[]
}

const DeviceGroup: React.FC<Props> = ({ data }) => {
  console.debug('DeviceGroup')


  const dispatch = useAppDispatch()
  const openRealTimeWin = useRealtimeVideo()

  const { map2d, isSituationalAnalysis } = useAppSelector(selectValue)


  const realData = useMemo(() => data.map(item => {
    let color = '#ff4d4f'
    if (item.status === 1) {
      color = '#25F076'
    }
    return {
      ...item,
      content: <DeviceItem data={item} />,
      style: {
        color
      }
    }
  }), [data])


  const handleClick = useCallback(
    (item: any) => {
      if (item.cameraType !== 0) {
        if (item.deviceCode) {
          openRealTimeWin({
            deviceCode: item.deviceCode
          })
        } else {
          console.warn('无设备编码', item)
          message.warning('无设备编码')
        }
      } else {
        if (item.deviceType === '5' && map2d && isSituationalAnalysis) {
          areaPolyline && map2d.map.removeLayer(areaPolyline)
          areaPolyline = createDrawAreaPolyline(map2d, JSON.parse(item.graph))
          areaPolyline.on('click', () => {
            map2d.map.removeLayer(areaPolyline)
          })
        } else if (item.deviceType === '7') {
          dispatch(setParams(item))
          dispatch(setIndex(6))
        } else if (item.deviceType === '9') {
          windowUI(<VoicePlayPanel deviceCodes={[item.deviceCode]} />, {
            title: '点播',
            offset: [1480, 80],
            width: '400px',
            height: '800px',
            key: '点播'
          })
        }
      }
    },
    [openRealTimeWin, map2d, isSituationalAnalysis, dispatch]
  )


  return (
    <article className={styles.wrapper}>
      {realData.map(item =>
        <Popover key={item.id} content={item.content} placement='right'>
          <section className={styles.row} onClick={() => handleClick(item)} >
            <BulbFilled className={styles.state} style={item.style} />
            <div className={styles.name}>{item.name}</div>
          </section>
        </Popover>
      )}
    </article>
  )
}

export default DeviceGroup