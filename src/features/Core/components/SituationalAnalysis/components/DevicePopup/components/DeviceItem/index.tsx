import { Button, Descriptions } from "antd"
import { useAppDispatch } from "app/hooks"
import { useCallback, useMemo } from "react"
import { setNavigate } from "slice/routerSlice"
import { DevicePopupData } from "../.."
import styles from "./index.module.sass";


interface Props {
  data: DevicePopupData
}

const DeviceItem: React.FC<Props> = ({ data }) => {
  console.debug('DeviceItem')


  const dispatch = useAppDispatch()


  const isShowButton = useMemo(() => !['7', '8', '9', '10', '11', '12', '20'].includes(data.deviceType), [data])

  const isNotShowStatus = useMemo(() => ['10'].includes(data.deviceType), [data])

  const isShowGoVideo = useMemo(() => data.cameraType !== 0, [data])

  const isShowGoData = useMemo(() => (
    data.deviceType === '4' || data.deviceType === '5' || data.deviceType === '6'
    || (data.deviceType === '3' && data.businessFunction?.indexOf('4') !== -1)
    || (data.deviceType === '2' && data.businessFunction?.indexOf('3') !== -1)
  ), [data])


  const handleClick = useCallback(
    () => {
      switch (data.deviceType) {
        case '2': // 人脸识别
          dispatch(setNavigate({
            path: '/dataCenter/collectionData',
            state: {
              activeKey: 'item-1',
              sourceDataActiveKey: '4',
              deviceCode: data.deviceCode
            }
          }))
          break;
        case '3': // 车辆卡口
          dispatch(setNavigate({
            path: '/dataCenter/collectionData',
            state: {
              activeKey: 'item-1',
              sourceDataActiveKey: '5',
              deviceCode: data.deviceCode
            }
          }))
          break;
        case '4': // AIS
          dispatch(setNavigate({
            path: '/dataCenter/collectionData',
            state: {
              activeKey: 'item-1',
              sourceDataActiveKey: '1',
              // deviceCode: data.deviceCode
            }
          }))
          break;
        case '5': // 海防雷达
        case '6': // 激光雷达
          dispatch(setNavigate({
            path: '/dataCenter/collectionData',
            state: {
              activeKey: 'item-1',
              sourceDataActiveKey: '2',
              // deviceCode: data.deviceCode
            }
          }))
          break;
        default:
          break;
      }
    },
    [data, dispatch],
  )

  const handleGoHistoryVideo = useCallback(
    () => {
      dispatch(setNavigate({
        path: '/dataCenter/collectionData',
        state: {
          activeKey: 'item-1',
          sourceDataActiveKey: '7',
          deviceCode: data.deviceCode
        }
      }))
    },
    [data, dispatch],
  )


  return (
    <article className={styles.wrapper}>
      <section className={styles.content}>
        <Descriptions size='small' column={2}>
          <Descriptions.Item label={data.deviceTypeName} span={2}>{data.name}</Descriptions.Item>
          {!isNotShowStatus &&
            <Descriptions.Item label="状态">{data.statusName}</Descriptions.Item>
          }
        </Descriptions>
      </section>
      {isShowButton &&
        <footer>
          {isShowGoVideo && <Button type="link" onClick={handleGoHistoryVideo}>历史视频</Button>}
          {isShowGoData && <Button type="link" onClick={handleClick}>查看数据</Button>}
        </footer>
      }
    </article>
  )
}

export default DeviceItem