import { CloseOutlined, RedoOutlined } from "@ant-design/icons";
import { Button, message, Space } from "antd";
import { useAppDispatch } from "app/hooks";
import { CameraOptionType, SteeringType } from "component/SteeringWheel";
import { createPlayer } from "helper";
import Player from "helper/player";
import JessibucaProPlayer from "helper/player/JessibucaProPlayer";
import _ from "lodash";
import React, { CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cameraControl, CameraDeviceInfo, cameraPicture, getUrlByCodeAndChannel, getVideoUrlByLevel, sendCameraOption, stopCameraControl, unCameraLock } from "server/device";
import { setNavigate } from "slice/routerSlice";
import ControlPanel from "./components/ControlPanel";
import styles from "./index.module.sass";


export interface DeviceAction {
  /** 步长 */
  step?: number
  /** 方向操作类型 */
  steeringType?: SteeringType
  /** 镜头操作类型 */
  optionType?: CameraOptionType
  /** 开始标记 */
  startFlag?: boolean
}

interface LocationXY {
  x: number
  y: number
}

interface PlayerInfo extends CameraDeviceInfo {
  /** 通道 */
  channelNo?: string
  ttl?: number
  deviceInfoList?: any[]
}

interface PlayerWindowProps {
  /** 列表序号 */
  index?: number
  /** 样式类名 */
  className?: string
  /** 要展示的设备 */
  device?: PlayerInfo
  /** 选中的设备 */
  target?: any
  /** 是否开启轮巡 */
  isOpenPatro?: boolean
  /** 是否是轮询窗口 */
  isPatro?: boolean
  /** 操作集 */
  action?: DeviceAction
  /** 分屏类型 */
  screenType?: string
  /** 是否展示控制面版的回调 */
  onShowPanel?: (is: boolean) => void
  /** 点击事件回调 */
  onClick?: (device: any, channel: string, set: (val: string) => void) => void
  /** 锁的回调 */
  onLock?: (device: any) => void
  /** 解锁的回调 */
  onUnLock?: (device: any) => void
  /** 3d定位回调 */
  onLocation?: (device: any, channel: string, params: {
    spixel: LocationXY
    epixel: LocationXY
    width: number
    height: number
  }) => void
  onClosePopup?: () => void
}

const PlayerWindow: React.FC<PlayerWindowProps> = ({
  index,
  className,
  device,
  target,
  isOpenPatro,
  action,
  isPatro,
  screenType,
  onShowPanel,
  onClick,
  onLock,
  onUnLock,
  onLocation,
  onClosePopup
}) => {
  console.debug('PlayerWindow')


  const dispatch = useAppDispatch()


  const videoRef = useRef<HTMLVideoElement>(null)
  const videoDivRef = useRef<HTMLDivElement>(null)
  const videoBoxRef = useRef<HTMLElement>(null)


  const [messageApi, contextHolder] = message.useMessage({
    getContainer: () => {
      if (document.fullscreenElement) {
        return document.fullscreenElement as HTMLElement
      } else {
        return document.body
      }
    }
  });


  // const [lightType, setLightType] = useState(1)
  const [articleClass, setArticleClass] = useState(styles.videoBox)
  const [isLock, setIsLock] = useState(false)
  const [url, setUrl] = useState('')
  const [player, setPlayer] = useState<Player>()
  const [videoAlt, setVideoAlt] = useState('')
  const [deviceInfo, setDeviceInfo] = useState<PlayerInfo>()
  const [channel, setChannel] = useState(() => {
    if (device?.channelList?.length) {
      // 选中轮询列表，通道类型使用vadioType
      const result = device.channelList.find((item: any) => item.type === 1 || item.vadioType === 1)
      if (result) {
        // 选中轮询列表，无channel字段，有channelNo
        return result.channel || result.channelNo
      } else {
        const target = device.channelList[0]
        // 选中轮询列表，无channel字段，有channelNo
        return target.channel || target.channelNo
      }
    } else {
      return ''
    }
  })
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLocation, setIsLocation] = useState(false)
  const [beginXY, setBeginXY] = useState<LocationXY>()
  const [endXY, setEndXY] = useState<LocationXY>()
  const [actionEvent, setActionEvent] = useState<DeviceAction>()
  const [lockId, setLockId] = useState<string>('')
  const [is3d, setIs3d] = useState(false)
  const [isHideCtrl, setIsHideCtrl] = useState(false)
  const [hideCtrlCount, setHideCtrlCount] = useState(0)
  const [isEnterCtrl, setIsEnterCtrl] = useState(false)
  const [isShowRefresh, setIsShowRefresh] = useState(false)


  const level = useMemo(() => {
    // 0:主码流, 1:子码流
    if (isFullscreen || (screenType === '1' && index === 0)) {
      return 0
    } else {
      return 1
    }
  }, [index, isFullscreen, screenType])

  const channelOptions = useMemo(() => device?.channelList || [], [device])


  // 全屏监听
  useEffect(() => {
    const handleFullscreenchange = () => {
      if (document.fullscreenElement === videoBoxRef.current) {
        setIsFullscreen(true)
      } else {
        setIsFullscreen(false)
      }
    }
    document.addEventListener('fullscreenchange', handleFullscreenchange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenchange)
    }
  }, [])

  // 轮巡配置
  useEffect(() => {
    let timer: any

    if (device && device.ttl && device.deviceInfoList) {
      const allDevice: any[] = device.deviceInfoList.map((item: any) => {
        const result = item.deviceChannelList.find((ele: any) => ele.channelType === 1)
        return {
          deviceCode: item.deviceCode,
          channelNo: result ? result.channelNo : ''
        }
      })

      const handle = (isInterval?: boolean) => {
        setDeviceInfo(val => {
          if (val) {
            if (!isInterval || _.isEmpty(allDevice)) {
              return val
            } else {
              const idx = allDevice.findIndex(item => item.deviceCode === val.deviceCode)
              if (idx === -1 || idx === (allDevice.length - 1)) {
                const _head = _.head(allDevice)!
                return _head
              } else {
                const next = allDevice[idx + 1]
                return next
              }
            }
          } else {
            if (_.isEmpty(allDevice)) {
              return val
            } else {
              return _.head(allDevice)
            }
          }
        })
      }
      handle()
      if (isOpenPatro) {
        timer = setInterval(() => {
          handle(true)
        }, device.ttl * 1000)
      }
    } else if (device) {
      setDeviceInfo(device)
    }
    return () => {
      timer && clearInterval(timer)
    }
  }, [device, isOpenPatro])

  // 获取播放地址
  useEffect(() => {
    let ctr: AbortController
    async function main() {
      try {
        if (deviceInfo && channel) {
          setVideoAlt('加载中...')
          setIsShowRefresh(false)
          if (deviceInfo.channelList) {
            if (!_.isEmpty(deviceInfo.channelList)) {
              // 用于设备列表
              const vo = await getVideoUrlByLevel(deviceInfo.deviceCode, channel, level, ctr)
              if (vo.url) {
                setUrl(vo.url)
                setVideoAlt('')
              } else {
                setUrl('')
                setVideoAlt('无视频播放地址')
              }
            } else {
              setUrl('')
              setVideoAlt('设备无通道信息')
            }
          } else if (deviceInfo.channelNo && deviceInfo.deviceCode) {
            // 用于轮巡列表
            const _url = await getUrlByCodeAndChannel(deviceInfo.deviceCode, deviceInfo.channelNo, ctr)
            if (_url) {
              setUrl(_url)
              setVideoAlt('')
            } else {
              setUrl('')
              setVideoAlt('无视频播放地址')
            }
          }

        } else {
          setUrl('')
          setVideoAlt('')
          setPlayer(undefined)
        }
      } catch (err: any) {
        setUrl(val => {
          if (!val) {
            setVideoAlt('暂无视频信号')
            setIsShowRefresh(true)
            setPlayer(undefined)
          } else {
            setVideoAlt('')
          }
          return val
        })
        console.warn(err)
      }
    }
    main()
    return () => {
      ctr && ctr.abort()
    }
  }, [deviceInfo, channel, level])

  //创建播放器实例
  useEffect(() => {
    let _player: Player
    if (url) {
      if (url.includes('flv')) {
        _player = new JessibucaProPlayer(videoDivRef.current!, url, { isAutoPlay: true })
      } else {
        _player = createPlayer(videoRef.current!, url, { isAutoPlay: true })
      }
      setPlayer(_player)
    }
    return () => {
      if (_player) {
        _player.destroy()
      }
    }
  }, [url])

  // 响应选中样式
  useEffect(() => {
    if (device && target && device.id === target.id) {
      setArticleClass(styles.videoBoxSelect)
    } else {
      setArticleClass(styles.videoBox)
    }
  }, [device, target])

  useEffect(() => {
    if (onShowPanel && target && device && device.id === target.id) {
      onShowPanel(!!player)
    }
  }, [device, target, onShowPanel, player])

  // 接收操作集
  useEffect(() => {
    setActionEvent(action)
  }, [action])

  // 使用操作集
  useEffect(() => {
    async function main() {
      try {
        if (device && target && device.id === target.id && actionEvent) {
          if (actionEvent.steeringType) {
            let _lockId = ''
            if (actionEvent.steeringType === SteeringType.stop) {
              _lockId = await stopCameraControl(device, lockId, channel)
            } else {
              _lockId = await cameraControl(actionEvent.steeringType, device, lockId, channel, actionEvent.step)
            }
            setLockId(_lockId)
            setActionEvent(undefined)
          } else if (actionEvent.optionType) {
            const _lockId = await sendCameraOption(actionEvent.optionType, device, lockId, channel, !!actionEvent.startFlag, actionEvent.step)
            setLockId(_lockId)
            setActionEvent(undefined)
          }
        }
      } catch (error: any) {
        messageApi.error(error.message)
      }
    }
    main()
  }, [device, target, actionEvent, channel, lockId, messageApi])

  // 释放操作权限
  useEffect(() => {
    return () => {
      async function main() {
        if (device && lockId) {
          await unCameraLock(device.deviceCode, lockId)
          setLockId('')
        }
      }
      main()
    }
  }, [device, lockId])

  // 全屏时定时隐藏迷你操作面板
  useEffect(() => {
    let timer: NodeJS.Timer
    if (isFullscreen) {
      setIsHideCtrl(false)
      if (!isEnterCtrl) {
        timer = setTimeout(() => {
          setIsHideCtrl(true)
        }, 5 * 1000);
      }
    }
    return () => {
      clearTimeout(timer)
    }
  }, [isFullscreen, hideCtrlCount, isEnterCtrl])


  const handleClick = useCallback(
    () => {
      if (onClick) {
        const set = (_channel: string) => {
          setChannel(_channel)
        }
        onClick(device, channel, set)
      }
    },
    [onClick, device, channel],
  )

  // 默认选中第一项
  useEffect(() => {
    index === 0 && handleClick()
  }, [index, handleClick])


  const allClass = useMemo(() => {
    if (className) {
      return `${className} ${articleClass}`
    } else {
      return articleClass
    }
  }, [className, articleClass])

  const handleClose = useCallback(
    () => {
      if (isLock) {
        setIsLock(false)
      } else if (player) {
        setUrl('')
        setVideoAlt('已关闭')
        setIsShowRefresh(true)
        setPlayer(undefined)
      }
    },
    [isLock, player],
  )

  const handleLock = useCallback(
    () => {
      setIsLock(true)
      onLock && onLock(device)
    },
    [device, onLock],
  )

  const handleUnLock = useCallback(
    () => {
      setIsLock(false)
      onUnLock && onUnLock(device)
    },
    [device, onUnLock],
  )

  const handlePicture = useCallback(
    async () => {
      if (device && player) {
        let channel = device?.channelList[0]?.channelNo ? device?.channelList[0]?.channelNo : device?.channelList[0]?.channel
        await cameraPicture(device.deviceCode, channel)
      }
    },
    [player, device]
  )

  const handleLookPicture = useCallback(
    () => {
      onClosePopup && onClosePopup()
      dispatch(setNavigate({
        path: '/dataCenter/collectionData',
        state: {
          activeKey: 'item-1',
          sourceDataActiveKey: '8',
          device
        }
      }))
    },
    [device, onClosePopup, dispatch]
  )

  const handleHistory = useCallback(
    () => {
      if (deviceInfo) {
        onClosePopup && onClosePopup()
        dispatch(setNavigate({
          path: '/dataCenter/collectionData',
          state: {
            activeKey: 'item-1',
            sourceDataActiveKey: '7',
            videoDataRadio: 1,
            deviceCodes: [deviceInfo.deviceCode]
          }
        }))
      }
    },
    [deviceInfo, dispatch, onClosePopup],
  )

  const handleFooterClick = useCallback(
    (evt: React.MouseEvent) => {
      evt.stopPropagation()
    },
    [],
  )

  const handleFull = useCallback(
    () => {
      if (document.fullscreenElement === videoBoxRef.current) {
        document.exitFullscreen()
      } else {
        videoBoxRef.current?.requestFullscreen()
      }
    },
    [],
  )

  const handleMouseDown = useCallback(
    (evt: any) => {
      // console.log('handleMouseDown', evt.nativeEvent.offsetX, evt.nativeEvent.offsetY)
      setIsLocation(true)
      setBeginXY({
        x: evt.nativeEvent.offsetX,
        y: evt.nativeEvent.offsetY
      })
    },
    [],
  )

  const handleMouseMove = useCallback(
    (evt: any) => {
      if (isLocation) {
        // console.log('handleMouseMove', evt.nativeEvent.offsetX, evt.nativeEvent.offsetY)
        setEndXY({
          x: evt.nativeEvent.offsetX,
          y: evt.nativeEvent.offsetY
        })
      }
    },
    [isLocation],
  )

  const handleMouseUp = useCallback(
    () => {
      if (videoBoxRef.current && beginXY && endXY) {
        const xDiff = Math.abs(beginXY.x - endXY.x)
        const yDiff = Math.abs(beginXY.y - endXY.y)
        if (xDiff > 4 && yDiff > 4) {
          onLocation && onLocation(device, channel, {
            spixel: beginXY,
            epixel: endXY,
            width: videoBoxRef.current.clientWidth,
            height: videoBoxRef.current.clientHeight,
          })
        }
      }
      setIsLocation(false)
      setBeginXY(undefined)
      setEndXY(undefined)
    },
    [onLocation, device, channel, beginXY, endXY],
  )

  const handleCtrlAction = useCallback(
    (action: DeviceAction) => {
      setActionEvent(action)
    },
    [],
  )

  const handleCtrlChannel = useCallback(
    (val: any) => {
      setChannel(val.channel)
      handleClick()
    },
    [handleClick],
  )

  const handle3d = useCallback(
    () => {
      setIs3d(!is3d)
    },
    [is3d],
  )

  const handleChange = useCallback((e: any) => {

    setIs3d(e)
  }, [])

  const handleMouseMoveBox = useCallback(
    (evt: React.MouseEvent) => {
      setHideCtrlCount(evt.pageX)
    },
    [],
  )

  const handleEnterCtrl = useCallback(
    () => {
      setIsEnterCtrl(true)
    },
    [],
  )

  const handleLeaveCtrl = useCallback(
    () => {
      setIsEnterCtrl(false)
    },
    [],
  )

  const handleRefresh = useCallback(
    () => {
      setDeviceInfo(val => {
        if (val) {
          return { ...val }
        } else {
          return val
        }
      })
    },
    [],
  )


  const text3d = useMemo(() => is3d ? '关闭3d定位' : '开启3d定位', [is3d])

  const locationStyle = useMemo(() => {
    if (beginXY && endXY) {
      let left = 0
      let width = 0
      if (beginXY.x > endXY.x) {
        left = endXY.x
        width = beginXY.x - endXY.x
      } else {
        left = beginXY.x
        width = endXY.x - beginXY.x
      }

      let top = 0
      let height = 0
      if (beginXY.y < endXY.y) {
        top = beginXY.y
        height = endXY.y - beginXY.y
      } else {
        top = endXY.y
        height = beginXY.y - endXY.y
      }

      return {
        top,
        left,
        width,
        height
      }
    } else {
      return undefined
    }
  }, [beginXY, endXY])

  const isShowDivVideo = useMemo(() => url.includes('flv'), [url])

  const panelstyle = useMemo<CSSProperties>(() => ({ display: isFullscreen ? 'block' : 'none' }), [isFullscreen])

  const panelClass = useMemo(() => isHideCtrl ? styles.panelHide : styles.panel, [isHideCtrl])

  return (
    <article className={allClass} onClick={handleClick}>
      <section className={styles.videoContent}
        ref={videoBoxRef}
        onDoubleClick={handleFull}
        onMouseMove={handleMouseMoveBox}
      >
        {is3d &&
          <div className={styles.locationBox}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          ></div>
        }
        {locationStyle && <div className={styles.location} style={locationStyle}></div>}
        {isFullscreen && <div className={styles.closeAlt}>按Esc键退出全屏</div>}

        <ControlPanel
          className={panelClass}
          style={panelstyle}
          channelValue={channel}
          device={device}
          channelOptions={channelOptions}
          onChannel={handleCtrlChannel}
          onAction={handleCtrlAction}
          onEnter={handleEnterCtrl}
          onLeave={handleLeaveCtrl}
          onChange3D={handleChange}
        />
        {!isShowDivVideo && <video className={styles.video} ref={videoRef} controls={false}></video>}
        {isShowDivVideo && <div className={styles.video} ref={videoDivRef} ></div>}
        {contextHolder}
      </section>

      {videoAlt &&
        <section className={styles.videoAlt}>
          {videoAlt}
          {isShowRefresh &&
            <Button
              type="link"
              size="small"
              icon={<RedoOutlined />}
              onClick={handleRefresh}
            >
              刷新
            </Button>
          }
        </section>
      }

      {player && !isFullscreen &&
        <footer className={styles.footer} onClick={handleFooterClick}>
          <div className={styles.actions}>
            <Space>
              {!isPatro && isLock &&
                <Button size="small" type="text" onClick={handleUnLock}>
                  <i className="fa fa-lock" aria-hidden="true" style={{ color: '#fff' }}></i>
                </Button>
              }
              {!isPatro && !isLock &&
                <Button size="small" type="text" onClick={handleLock}>
                  <i className="fa fa-unlock-alt" aria-hidden="true" style={{ color: '#fff' }}></i>
                </Button>
              }
              {device?.deviceSource === 0 && <Button size="small" type="link" onClick={handlePicture}>拍照</Button>}
              <Button size="small" type="link" onClick={handleLookPicture}>查看图片</Button>
              {device?.deviceSource === 0 && <Button size="small" type="link" onClick={handleHistory}>历史视频</Button>}
              {!isPatro && <Button size="small" type="link" onClick={handle3d}>{text3d}</Button>}
            </Space>
          </div>
          <div className={styles.close}>
            <Button size="small" type="text" style={{ color: '#f5222d' }} icon={<CloseOutlined />} onClick={handleClose} />
          </div>
        </footer>
      }
    </article>
  )
}

export default PlayerWindow