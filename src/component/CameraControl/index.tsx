import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./index.module.sass";
import MediaVideo from "../MediaVideo";
import { Alert, Button, message, Spin } from "antd";
import { DoubleRightOutlined } from "@ant-design/icons";
import { changeLockTimeAsync, shipTakePhotoAsync, startRecordingAsync, stopRecordingAsync } from "../../server/ship";
import ControlTools from "../../features/Core/components/ShipList/components/ControlTools";
import { setNavigate } from "slice/routerSlice";
import Player from "helper/player";
import { createPlayer, YMD } from "helper";

import { useAppDispatch } from "app/hooks";
import { setParams } from "slice/coreSectorSlice";
import AudioView from "component/AudioView";
import popup from "hooks/basis/Popup";
import { getImageVideoPage } from "server/common";
import TimeCount from "./TimeCount";
import { DragElement } from "helper/common";
import dayjs from "dayjs";


interface LocationXY {
  x: number
  y: number
}

interface videoInfoProps {
  //视频地址
  url?: string
  //是否显示视频
  isShowVideo: boolean
  //通道
  channel?: any
  //设备编码
  deviceCode?: any
  //资源锁
  lockId?: any
}

interface cameraPTZProps {
  coverRaduis: number
  latitude: number
  longitude: number
  maxAngle: number
  minAngle: number
}

interface IdsProps {
  mmsi?: string       //ais船舶mmsi
  uniqueId?: string   //雷达批号
  fusionId?: string  	//融合ID
}

interface Props {
  //全景视频信息
  allViewVideoInfo?: videoInfoProps
  setAllViewVideoInfo?: Function
  //细节视频信息
  smallViewVideoInfo?: videoInfoProps
  setSmallViewVideoInfo?: Function
  // 摄像头ptz
  cameraPTZ?: cameraPTZProps
  setCameraPTZ?: Function
  // 摄像头lockID和deviceCode
  setCameraLockIdDeviceCode?: any
  // 是否显示目标占比
  isNotShowTargetPercent?: Boolean
  //  联动目标信息
  targetInfo?: any
  // ids，用于初始显示mmsi或者雷达ID相关的信息
  ids?: IdsProps
}

// 防止多次点击录像按钮
let disableTakeVideo = false
// 录制全景定时器
let recordAllViewVideoTimer: any
// 录制细节视频定时器
let recordSmallViewVideoTimer: any

// 录制全景视频文件id
let recordAllViewVideoFileId: any
// 录制细节视频文件id
let recordSmallViewVideoFileId: any

// 全屏下，鼠标移动时需要显示控制面板，定时器
let showControlToolsTimer: any
let currentTime: number
let lastTime: number

const CameraControl: React.FC<Props> = ({
  allViewVideoInfo,
  smallViewVideoInfo,
  setAllViewVideoInfo,
  setSmallViewVideoInfo,
  cameraPTZ,
  setCameraPTZ,
  setCameraLockIdDeviceCode,
  isNotShowTargetPercent,
  targetInfo,
  ids
}) => {
  console.debug('CameraControl')
  //显示隐藏云台控制面板
  const [showControlTools, setShowControlTools] = useState(false);
  //显示隐藏所有云台控制面板（包括拍照，历史视频，云台控制）
  const [showToolsPanel, setShowToolsPanel] = useState(true);
  //当前选中的视频标识(allViewVideo,smallViewVideo)，全景，细节
  const [activeVideoFlag, setActiveVideoFlag] = useState('allViewVideo');
  //选中视频的信息
  const [currentVideoInfo, setCurrentVideoInfo] = useState<any>({ ...allViewVideoInfo });

  // 当前联动的目标
  const [currentTargetInfo, setCurrentTargetInfo] = useState(() => {
    if (targetInfo) {
      return targetInfo.latLngList
    } else {
      if (ids) {
        let { mmsi, uniqueId, fusionId } = ids

        // 默认，有mmsi，显示mmsi。有融合ID，显示融合ID，有雷达ID，显示雷达ID
        if (mmsi) {
          return {
            trackId: mmsi,
            speed: '--',
            originCourse: '--',
            otherDataType: 'radar'
          }
        } else if (fusionId) {
          return {
            trackId: fusionId,
            speed: '--',
            originCourse: '--',
            otherDataType: 'ais'
          }
        } else {
          return {
            trackId: uniqueId,
            speed: '--',
            originCourse: '--',
            otherDataType: 'radar'
          }
        }
      } else {
        return {
          trackId: '--',
          speed: '--',
          originCourse: '--',
          otherDataType: 'ais'
        }
      }
    }

  })

  //录制全景视频
  const [recordAllViewVideo, setRecordAllViewVideo] = useState({
    //文件Id
    fileId: '',
    //时长
    time: '00:00:00',
    //是否显示录制按钮
    showTime: false,
  });

  //录制细节视频
  const [recordSmallViewVideo, setRecordSmallViewVideo] = useState({
    //文件Id
    fileId: '',
    //时长
    time: '00:00:00',
    //是否显示录制按钮
    showTime: false,
  });

  // 倒计时跟踪定时器
  const [timerCount, setTimerCount] = useState<any>(30)
  const [isDisableTimeSelect, setIsDisableTimeSelect] = useState<boolean>(false)

  const dispatch = useAppDispatch()

  const videoRef = useRef(null)

  const [isTakePhotoSuccess, setIsTakePhotoSuccess] = useState(false)
  const [isTakeVideoSuccess, setIsTakeVideoSuccess] = useState(false)

  const videoBoxRef = useRef<any>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLocation, setIsLocation] = useState(false)
  const [beginXY, setBeginXY] = useState<LocationXY>()
  const [endXY, setEndXY] = useState<LocationXY>()
  // 3D控制参数
  const [threeControlParams, setThreeControlParams] = useState<any>()

  // 全屏中是否显示控制面板
  const [isShowControlTools, setIsShowControlTools] = useState(false)

  // 判断是否显示全屏控制面板逻辑：当前时间和上次移动时间相差5秒没动，则隐藏。
  useEffect(() => {
    let controlToolsContainer = videoBoxRef.current
    function mousemoveFn() {
      setIsShowControlTools(true)
      lastTime = new Date().getTime()
      showControlToolsTimer && clearInterval(showControlToolsTimer)
      showControlToolsTimer = setInterval(() => {
        currentTime = new Date().getTime();
        if (currentTime - lastTime > 5000) {
          setIsShowControlTools(false)
          lastTime = new Date().getTime()
          showControlToolsTimer = null
        }
      }, 1000)
    }
    if (isFullscreen && controlToolsContainer) {
      controlToolsContainer.addEventListener('mousemove', mousemoveFn)
    } else {
      setIsShowControlTools(false)
      showControlToolsTimer && clearInterval(showControlToolsTimer)
      showControlToolsTimer = null
      controlToolsContainer && controlToolsContainer.removeEventListener('mousemove', mousemoveFn)
    }
    return () => {
      showControlToolsTimer && clearInterval(showControlToolsTimer)
      controlToolsContainer && controlToolsContainer.removeEventListener('mousemove', mousemoveFn)
    }
  }, [isFullscreen])

  useEffect(() => {
    let _player: Player
    if (videoRef.current && allViewVideoInfo?.url) {
      _player = createPlayer(videoRef.current, allViewVideoInfo.url, { isAutoPlay: true })
    }
    return () => {
      _player?.destroy()
    }
  }, [allViewVideoInfo])

  // 改变了视频对象信息，需要修改当前的对象 ,才能获取最新的lockId
  useEffect(() => {
    if (activeVideoFlag === 'allViewVideo') {
      setCurrentVideoInfo({ ...allViewVideoInfo })
    } else {
      setCurrentVideoInfo({ ...smallViewVideoInfo })
    }
  }, [activeVideoFlag, allViewVideoInfo, smallViewVideoInfo])



  // 联动目标信息更新
  useEffect(() => {
    if (targetInfo) {
      setCurrentTargetInfo(targetInfo.latLngList[0])
    }
  }, [targetInfo])

  // 在摄像头处画扇形
  useEffect(() => {
    if (cameraPTZ) {
      dispatch(setParams({
        center: [cameraPTZ.latitude, cameraPTZ.longitude],
        radius: cameraPTZ.coverRaduis / 100000 || 0.05, //默认为5000米
        startAngle: cameraPTZ.minAngle,
        endAngle: cameraPTZ.maxAngle,
        pointNum: 100,
        showSector: true
      }))
    }
    return () => {
      dispatch(setParams({
        showSector: false
      }))
    }
  }, [cameraPTZ, dispatch])


  //显示控制工具时，滚动到底部
  useEffect(() => {
    if (showControlTools) {
      const moveToBottom = document.getElementById('controlTools')!;
      moveToBottom.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'start'
      })
    }
  }, [showControlTools]);

  //切换全景和细节时，自动选中对应的视频
  useEffect(() => {
    //当前选中全景视频时，隐藏全景视频，则选中细节视频
    if (!allViewVideoInfo?.isShowVideo && activeVideoFlag === 'allViewVideo') {
      setActiveVideoFlag('smallViewVideo')
    }
    //当前选中细节视频，隐藏细节视频，则选中全景视频
    if (!smallViewVideoInfo?.isShowVideo && activeVideoFlag === 'smallViewVideo') {
      setActiveVideoFlag('allViewVideo')
    }
    //只选中全景视频
    if (allViewVideoInfo?.isShowVideo && !smallViewVideoInfo?.isShowVideo) {
      setActiveVideoFlag('allViewVideo')
    }
    //只选中细节视频
    if (!allViewVideoInfo?.isShowVideo && smallViewVideoInfo?.isShowVideo) {
      setActiveVideoFlag('smallViewVideo')
    }
    //两个都不选中
    if (!allViewVideoInfo?.isShowVideo && !smallViewVideoInfo?.isShowVideo) {
      setShowToolsPanel(false)
      setActiveVideoFlag('')
    } else {
      setShowToolsPanel(true)
    }
  }, [activeVideoFlag, allViewVideoInfo?.isShowVideo, smallViewVideoInfo?.isShowVideo]);

  //切换视频时，当前需要控制的视频信息，传递给子组件的信息需要更新
  useEffect(() => {
    if (activeVideoFlag === 'allViewVideo') {
      setCurrentVideoInfo({ ...allViewVideoInfo })
    } else {
      setCurrentVideoInfo({ ...smallViewVideoInfo })
    }
  }, [activeVideoFlag, smallViewVideoInfo, allViewVideoInfo]);

  // 按esc退出全屏，全屏后无法监听键盘事件，只能用window.onresize来监听
  useEffect(() => {
    window.onresize = () => {
      if (document.fullscreenElement !== videoBoxRef.current) {
        setIsFullscreen(false)
      }
    }
  }, [])

  // 双击全屏
  const handleFull = useCallback(
    () => {
      if (document.fullscreenElement === videoBoxRef.current) {
        document.exitFullscreen()
        setIsFullscreen(false)
      } else {
        videoBoxRef.current && videoBoxRef.current.requestFullscreen()
        setIsFullscreen(true)
        let el = document.getElementById('dragControlTools')
        new DragElement(el, true)
      }
    },
    [],
  )

  //退出页面时，需要关闭定时器和视频录制
  useEffect(() => {
    return () => {
      if (recordAllViewVideoTimer) {
        clearInterval(recordAllViewVideoTimer)
        stopRecordingAsync({ fileId: recordAllViewVideoFileId })
      }
      if (recordSmallViewVideoTimer) {
        clearInterval(recordSmallViewVideoTimer)
        stopRecordingAsync({ fileId: recordSmallViewVideoFileId })
      }
      //  取消录像按钮置灰
      disableTakeVideo = false
    };
  }, []);

  // 跟踪倒计时
  useEffect(() => {
    let timer: any = null
    if (timerCount === -1) {
      setTimerCount('持续跟踪')
      timer && clearInterval(timer)
      return
    }
    timer = setInterval(() => {
      setTimerCount((val: any) => {
        if (val <= 1) {
          clearInterval(timer)
          setIsDisableTimeSelect(true)
          return '已停止'
        }
        return val - 1
      })
    }, 1000)
    if (timerCount === '已停止' || timerCount === '持续跟踪') {
      clearInterval(timer)
    }
    return () => {
      timer && clearInterval(timer)
    }
  }, [timerCount])

  // camera lockID和deviceCode改变时触发
  function handleSetCameraLockIdDeviceCode(val: any) {
    setCameraLockIdDeviceCode && setCameraLockIdDeviceCode(val)
  }

  // 触发修改ptz
  function handleSetCameraPTZ(val: any) {
    setCameraPTZ && setCameraPTZ(val)
  }

  //切换显示云控制
  function handleToggleShowControls() {
    const controlTools = document.getElementById('controlTools')!;
    setShowControlTools((val: boolean) => {
      return !val
    })
    setTimeout(() => {
      controlTools.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
        inline: 'start'
      })
    }, 500)
  }

  //拍照
  async function takePhoto() {
    setIsTakeVideoSuccess(false)
    setIsTakePhotoSuccess(false)
    //全景视频拍照
    if (activeVideoFlag === 'allViewVideo') {
      let vo = await shipTakePhotoAsync({
        channel: allViewVideoInfo && allViewVideoInfo.channel,
        deviceCode: allViewVideoInfo && allViewVideoInfo.deviceCode,
        lockId: allViewVideoInfo && allViewVideoInfo.lockId
      })
      if (vo.data.code === 200) {
        message.success('拍照成功')
        setIsTakePhotoSuccess(true)
      } else {
        message.error('暂无可拍照的设备')
      }
    } else {
      //细节视频拍照
      let vo = await shipTakePhotoAsync({
        channel: smallViewVideoInfo && smallViewVideoInfo.channel,
        deviceCode: smallViewVideoInfo && smallViewVideoInfo.deviceCode,
        lockId: smallViewVideoInfo && smallViewVideoInfo.lockId
      })
      if (vo.data.code === 200) {
        message.success('拍照成功')
        setIsTakePhotoSuccess(true)
      } else {
        message.error('暂无可拍照的设备')
      }
    }
  }
  //格式化时分秒，传入秒，返回时分秒
  function formatSeconds(time: any) {
    let result = parseInt(time)
    let h = Math.floor(result / 3600) < 10 ? '0' + Math.floor(result / 3600) : Math.floor(result / 3600)
    let m = Math.floor((result / 60 % 60)) < 10 ? '0' + Math.floor((result / 60 % 60)) : Math.floor((result / 60 % 60))
    let s = Math.floor((result % 60)) < 10 ? '0' + Math.floor((result % 60)) : Math.floor((result % 60))
    return `${h}:${m}:${s}`
  }
  //录像
  function takeVideo() {
    setIsTakeVideoSuccess(false)
    setIsTakePhotoSuccess(false)

    if (activeVideoFlag === 'allViewVideo') {
      //录制全景视频
      if (!allViewVideoInfo?.url) {
        message.error('暂无视频，无法录制...')
        return;
      }
      if (disableTakeVideo) {
        message.error('正在录制中...')
        return;
      }
      disableTakeVideo = true
      //开始录制接口
      startRecordingAsync({
        channel: allViewVideoInfo && allViewVideoInfo.channel,
        deviceCode: allViewVideoInfo && allViewVideoInfo.deviceCode,
        lockId: allViewVideoInfo && allViewVideoInfo.lockId
      }).then(res => {
        //开始录制时间
        let startTime = new Date().getTime()
        setRecordAllViewVideo((val) => {
          return {
            ...val,
            fileId: res.fileId,
            showTime: true
          }
        })
        recordAllViewVideoFileId = res.fileId
        //清除定时器
        if (recordAllViewVideoTimer) {
          clearInterval(recordAllViewVideoTimer)
        }
        recordAllViewVideoTimer = setInterval(() => {
          let endTime = new Date().getTime()
          setRecordAllViewVideo((val) => {
            return {
              ...val,
              time: formatSeconds(parseInt(String((endTime - startTime) / 1000)))
            }
          })
        }, 1000)
      })

    } else {
      //录制细节视频
      if (!smallViewVideoInfo?.url) {
        message.error('暂无视频，无法录制...')
        return;
      }
      if (disableTakeVideo) {
        message.error('正在录制中...')
        return;
      }
      disableTakeVideo = true
      //开始录制接口
      startRecordingAsync({
        channel: smallViewVideoInfo && smallViewVideoInfo.channel,
        deviceCode: smallViewVideoInfo && smallViewVideoInfo.deviceCode,
        lockId: smallViewVideoInfo && smallViewVideoInfo.lockId
      }).then(res => {
        //开始录制时间
        let startTime = new Date().getTime()
        setRecordSmallViewVideo((val) => {
          return {
            ...val,
            fileId: res.fileId,
            showTime: true
          }
        })

        recordSmallViewVideoFileId = res.fileId
        //清除定时器
        if (recordSmallViewVideoTimer) {
          clearInterval(recordSmallViewVideoTimer)
        }
        recordSmallViewVideoTimer = setInterval(() => {
          let endTime = new Date().getTime()
          setRecordSmallViewVideo((val) => {
            return {
              ...val,
              time: formatSeconds(parseInt(String((endTime - startTime) / 1000)))
            }
          })
        }, 1000)
      })
    }
  }

  function handleGoVideoList() {
    dispatch(setNavigate({
      path: '/dataCenter/collectionData',
      state: {
        activeKey: 'item-1',
        sourceDataActiveKey: '7',
        videoDataRadio: 1,
        deviceCode: allViewVideoInfo?.deviceCode
      }
    }))
  }

  //激活选中当前视频
  function activeCurrentVideo(active: string) {
    setActiveVideoFlag(active)
  }
  //停止录制全景视频
  async function stopRecordingAllVideo(fileId: any) {
    setRecordAllViewVideo((val) => {
      return {
        ...val,
        showTime: false,
        time: '00:00:00'
      }
    })
    disableTakeVideo = false
    //清除定时器
    if (recordAllViewVideoTimer) {
      clearInterval(recordAllViewVideoTimer)
    }
    let vo = await stopRecordingAsync({ fileId })
    if (vo) {
      setIsTakeVideoSuccess(true)
      message.success('录像成功，视频保存在智搜-视频中')
    }
  }
  //停止录制细节视频
  async function stopRecordingSmallVideo(fileId: any) {
    setRecordSmallViewVideo((val) => {
      return {
        ...val,
        showTime: false,
        time: '00:00:00'
      }
    })
    disableTakeVideo = false
    if (recordSmallViewVideoTimer) {
      clearInterval(recordSmallViewVideoTimer)
    }
    let vo = await stopRecordingAsync({ fileId })
    if (vo) {
      setIsTakeVideoSuccess(true)
      message.success('录像成功，视频保存在智搜-视频中')
    }

  }

  // 查看照片
  async function handleOpenPicture() {
    let imgArr: any = []
    let videoArr: any = []
    let startTime = dayjs().format(YMD) + ' 00:00:00'
    let endTime = dayjs().format(YMD) + ' 23:59:59'
    const imgRes = await getImageVideoPage({ pageNumber: 1, pageSize: 20, }, { type: 'image', fileType: '01', deviceCode: allViewVideoInfo?.deviceCode, startTime, endTime })
    const videoRes = await getImageVideoPage({ pageNumber: 1, pageSize: 10, }, { type: 'video', fileType: '02,03', deviceCode: allViewVideoInfo?.deviceCode, startTime, endTime })
    imgArr = imgRes.data
    videoArr = videoRes.data
    popup(<AudioView
      isActiveImage={true}
      videoList={videoArr?.filter((item: any) => ['02', '03'].includes(item.fileType))}
      imageList={imgArr?.filter((item: any) => item.fileType === '01')} />, { title: '图片查看', size: "auto" })
  }
  // 查看视频
  async function handleOpenVideo() {
    let imgArr: any = []
    let videoArr: any = []
    let startTime = dayjs().format(YMD) + ' 00:00:00'
    let endTime = dayjs().format(YMD) + ' 23:59:59'
    const imgRes = await getImageVideoPage({ pageNumber: 1, pageSize: 20, }, { type: 'image', fileType: '01', deviceCode: allViewVideoInfo?.deviceCode, startTime, endTime })
    const videoRes = await getImageVideoPage({ pageNumber: 1, pageSize: 10, }, { type: 'video', fileType: '02,03', deviceCode: allViewVideoInfo?.deviceCode, startTime, endTime })
    imgArr = imgRes.data
    videoArr = videoRes.data
    popup(<AudioView
      isActiveImage={false}
      videoList={videoArr?.filter((item: any) => ['02', '03'].includes(item.fileType))}
      imageList={imgArr?.filter((item: any) => item.fileType === '01')} />, { title: '视频查看', size: "auto" })
  }

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
        setThreeControlParams({
          spixel: beginXY,
          epixel: endXY,
          width: videoBoxRef.current.clientWidth,
          height: videoBoxRef.current.clientHeight,
          controlType: 7,
          startFlag: true,
        })
      }
      setIsLocation(false)
      setBeginXY(undefined)
      setEndXY(undefined)
    },
    [beginXY, endXY],
  )

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

  // 切换跟踪倒计时
  async function handleChangeTime(time: number) {
    let result = await changeLockTimeAsync({
      deviceCode: currentVideoInfo.deviceCode,
      lockId: currentVideoInfo.lockId,
      ttl: time,
      controlType: currentTargetInfo.controlType,
    })
    if (result) {
      setTimerCount(time)
    }
  }

  return <div className={styles.container}>
    <div className={styles.videoWrapper}>
      {/*放置全景视频*/}
      {allViewVideoInfo?.isShowVideo &&
        <div className={`${styles.video} ${activeVideoFlag === 'allViewVideo' ? styles.activeVideo : ''}`}
          onClick={() => activeCurrentVideo('allViewVideo')} ref={videoBoxRef} onDoubleClick={handleFull}>
          {/* 3d定位 */}
          <div className={styles.locationBox}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          ></div>
          {locationStyle && <div className={styles.location} style={locationStyle}></div>}

          {isFullscreen && <div className={styles.closeAlt}>按Esc键退出全屏</div>}
          {/* 全屏悬浮云台控制 */}
          {<div className={styles.fullScreenControlTools} style={{ display: (isFullscreen && isShowControlTools) ? 'block' : 'none' }}>
            <div className={styles.title} id="dragControlTools">云台控制</div>
            <ControlTools
              {...currentVideoInfo}
              setCameraPTZ={handleSetCameraPTZ}
              activeVideoFlag={activeVideoFlag}
              setAllViewVideoInfo={setAllViewVideoInfo}
              setSmallViewVideoInfo={setSmallViewVideoInfo}
              setCameraLockIdDeviceCode={handleSetCameraLockIdDeviceCode}
              isNotShowTargetPercent={isNotShowTargetPercent}
              threeControlParams={threeControlParams}
              isNotShowPrecast={true}
            />
          </div>}

          {allViewVideoInfo.url && <video ref={videoRef} className={styles.videoRef} style={{ height: isFullscreen ? '100%' : targetInfo ? 'calc( 100% - 30px )' : '100%' }}></video>}
          {allViewVideoInfo.url === '' && <div className={styles.noVideo}><Spin size="large" tip="视频加载中" /></div>}
          {allViewVideoInfo.url === undefined && <div className={styles.noVideo}>暂无视频</div>}
          {/* 跟踪倒计时 */}
          {targetInfo && allViewVideoInfo.url && <div className={styles.timeCount}>
            <div className={styles.time}>{timerCount}{(timerCount !== '已停止' && timerCount !== '持续跟踪') && <span>秒</span>}</div>
            <TimeCount handleChange={handleChangeTime} isDisableSelect={isDisableTimeSelect} />
          </div>}

          {/* 录制视频 */}
          {recordAllViewVideo.showTime && <div className={styles.recordVideo}>
            <span className={styles.stopVideo} onClick={() => stopRecordingAllVideo(recordAllViewVideo.fileId)} />
            <span>{recordAllViewVideo.time}</span>
          </div>}
        </div>}
      {/*放置细节视频*/}
      {smallViewVideoInfo?.isShowVideo &&
        <div className={`${styles.video} ${activeVideoFlag === 'smallViewVideo' ? styles.activeVideo : ''}`}
          onClick={() => activeCurrentVideo('smallViewVideo')}>
          {smallViewVideoInfo.url && <MediaVideo width={'100%'} src={smallViewVideoInfo.url} />}

          {!smallViewVideoInfo.url && <div className={styles.noVideo}><Spin size="large" tip="视频加载中" /></div>}
          {/* 录制视频 */}
          {recordSmallViewVideo.showTime && <div className={styles.recordVideo}>
            <span className={styles.stopVideo} onClick={() => stopRecordingSmallVideo(recordSmallViewVideo.fileId)} />
            <span>{recordSmallViewVideo.time}</span>
          </div>}
        </div>}
    </div>

    {/*拍照，历史视频，云台控制*/}
    {(showToolsPanel && allViewVideoInfo?.url) && <div>
      <div className={styles.bottom}>
        <div className={styles.bottomLeft}>
          {isTakePhotoSuccess && <div className={styles.takeSuccess}>
            <Alert
              message="拍照成功"
              type="success"
              showIcon
              action={
                <Button size="small" type="link" onClick={handleOpenPicture}>立即查看</Button>
              }
              onClose={() => setIsTakePhotoSuccess(false)}
              closable
            />
          </div>}
          {isTakeVideoSuccess && <div className={styles.takeSuccess}>
            <Alert
              message="录像成功"
              type="success"
              showIcon
              action={
                <Button size="small" type="link" onClick={handleOpenVideo}>立即查看</Button>
              }
              onClose={() => setIsTakeVideoSuccess(false)}
              closable
            />
          </div>}

          <Button type={"link"} onClick={takePhoto}>拍照</Button>
          <Button type={"link"} onClick={takeVideo}>录像</Button>
          <Button type={"link"} onClick={(handleGoVideoList)}>历史视频</Button>
        </div>

        <div className={styles.showControlTools}>
          {targetInfo && <div className={styles.targetInfos}>
            {currentTargetInfo?.otherDataType === 'radar' && <span>雷达编号：{currentTargetInfo?.trackId || '--'}</span>}
            {currentTargetInfo?.otherDataType !== 'radar' && <span>MMSI：{currentTargetInfo?.trackId || '--'}</span>}
            <span>航速：{(currentTargetInfo?.speed !== '--' && currentTargetInfo?.speed.toFixed(2)) || '0.00'}节</span>
            <span>航向：{(currentTargetInfo?.originCourse !== '--' && currentTargetInfo?.originCourse.toFixed(2)) || '--'}</span>
          </div>}
          <div onClick={handleToggleShowControls}>
            <Button type={"link"}>云台控制</Button>
            <DoubleRightOutlined className={`${styles.arrow}  ${showControlTools ? styles.arrowUp : styles.arrowDown}`} />
          </div>
        </div>
      </div>
      <div style={{ display: showControlTools ? 'block' : 'none' }} id='controlTools'>
        <ControlTools
          {...currentVideoInfo}
          targetVideo={currentVideoInfo}
          setCameraPTZ={handleSetCameraPTZ}
          activeVideoFlag={activeVideoFlag}
          setAllViewVideoInfo={setAllViewVideoInfo}
          setSmallViewVideoInfo={setSmallViewVideoInfo}
          setCameraLockIdDeviceCode={handleSetCameraLockIdDeviceCode}
          isNotShowTargetPercent={isNotShowTargetPercent}
          threeControlParams={threeControlParams}
        />
      </div>
    </div>}
  </div>
}

export default CameraControl