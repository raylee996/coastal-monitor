import _ from "lodash";
import { useCallback, useEffect, useRef, useState } from "react";
import { getAllCamera } from "server/device";
import DeviceList from "./components/DeviceList";
import PlayerWindow from "./components/PlayerWindow";
import styles from "./index.module.sass";


interface Props {
  /** 设备ids，选中的设备，只支持一项 */
  id?: number
  /** 设备code，选中的设备，只支持一项 */
  code?: string
  /** 场所id */
  placeId?: number
  /** 历史视频回放时段 */
  timeRange?: string[]
}

const Mp4HistoryMonitor: React.FC<Props> = ({ id, code, placeId, timeRange }) => {
  console.debug('Mp4HistoryMonitor')


  const videoBoxRef = useRef<HTMLElement>(null)


  const [allVideoList, setAllVideoList] = useState<any[]>([])
  const [playVideoList, setPlayVideoList] = useState<any[]>()
  const [targetVideo, setTargetVideo] = useState<any>()
  const [lockList, setLockList] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [realTimeRange, setRealTimeRange] = useState(timeRange)


  // 获取所有视频源列表
  useEffect(() => {
    let signal: AbortController
    async function main() {
      signal = new AbortController()
      const _videoList = await getAllCamera({ placeId, text: search }, signal)
      setAllVideoList(_videoList)
    }
    main()
    return () => {
      signal && signal.abort()
    }
  }, [placeId, search])

  // 调整视频播放类型
  useEffect(() => {
    if (allVideoList.length !== 0) {
      if (id || code) {
        const _targetVideo = allVideoList.find(item => item.id === id || item.deviceCode === code)
        if (_targetVideo) {
          setTargetVideo(_targetVideo)
          setPlayVideoList([_targetVideo])
        } else {
          const _head = _.head(allVideoList)
          setTargetVideo(_head)
          setPlayVideoList([_head])
        }
      } else {
        const _head = _.head(allVideoList)
        setTargetVideo(_head)
        setPlayVideoList([_head])
      }
    }
  }, [allVideoList, id, code])


  // 双击设备列表选择新的播放设备
  const handleDeviceChange = useCallback((data: any) => {
    if (!lockList.some(item => _.isEqual(item, data.target))) {
      const idx = data.selectItems.findIndex((ele: any) => _.isEqual(ele, data.target))
      if (idx !== -1) {
        const _selectItems = _.clone(data.selectItems)
        _selectItems.splice(idx, 1, data.clickItem)
        setPlayVideoList(_selectItems)
        setTargetVideo(data.clickItem)
        setRealTimeRange(undefined)
      }
    }
  }, [lockList])

  // 点击选择播放视频窗口
  const handleVideo = useCallback(
    (device: any) => {
      setTargetVideo(device)
    },
    [],
  )

  const handleLock = useCallback(
    (param: any) => {
      setLockList(val => {
        const _lockList = _.clone(val)
        _lockList.push(param)
        return _lockList
      })
    },
    [],
  )

  const handleUnLock = useCallback(
    (param: any) => {
      setLockList(val => {
        const _lockList = _.clone(val)
        _.remove(_lockList, item => _.isEqual(item, param))
        return _lockList
      })
    },
    [],
  )

  const handleSearch = useCallback(
    (value: string) => {
      setSearch(value)
    },
    [],
  )


  return (
    <article className={styles.wrapper}>
      <section className={styles.videoList}>
        <section className={`${styles.content} ${styles.content1}`} ref={videoBoxRef}>
          {realTimeRange && targetVideo &&
            <PlayerWindow
              className={styles.videoBox}
              device={targetVideo}
              timeRange={timeRange}
              onClick={handleVideo}
              onLock={handleLock}
              onUnLock={handleUnLock}
            />
          }
          {!realTimeRange && targetVideo &&
            <PlayerWindow
              className={styles.videoBox}
              device={targetVideo}
              onClick={handleVideo}
              onLock={handleLock}
              onUnLock={handleUnLock}
            />
          }
        </section>
      </section>
      <section className={styles.panel}>
        <DeviceList
          list={allVideoList}
          checkList={playVideoList}
          target={targetVideo}
          onChange={handleDeviceChange}
          onSearch={handleSearch}
        />
      </section>
    </article>
  )
}

export default Mp4HistoryMonitor