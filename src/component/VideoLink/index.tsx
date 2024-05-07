
import { message } from 'antd'
import { getCameraPTZ } from 'api/preset'
import { useAppDispatch, useAppSelector } from 'app/hooks'
import ClientWebsocket from 'helper/websocket'
import { DraglistenFn, DragParams, ResizelistenFn, ResizeParams } from 'hooks/basis/Windowstill'
import _ from 'lodash'
import { useEffect, useState } from 'react'
import { getCameraPTZIntervalAsync, stopCameraLockAsync } from 'server/ship'
import { selectValue } from 'slice/userInfoSlice'
import { selectVideoLinkDeviceList, setDeviceList, setSelectedKey, setWinInfo } from 'slice/videoLinkSlice'
import VideoWin from './VideoWin'


interface Props {
  targetType?: 'ais' | 'radar'
  mmsi?: string       //ais船舶mmsi
  uniqueId?: string   //雷达批号
  fusionId?: string  	//融合ID
  uniqueKey: string
  isRealTimeVideo?: boolean //是否是实时视频
  onResize?: (fn: ResizelistenFn) => void
  offResize?: (fn: ResizelistenFn) => void
  onDrag?: (fn: DraglistenFn) => void
  offDrag?: (fn: DraglistenFn) => void
  onChangeWinTitle?: (title: string) => void
}
// 视频联动弹窗
const VideoLink: React.FC<Props> = ({
  targetType,
  mmsi,
  uniqueId,
  fusionId,
  uniqueKey,
  isRealTimeVideo,
  onResize,
  offResize,
  onDrag,
  offDrag,
  onChangeWinTitle
}) => {
  console.debug('VideoLink')
  const dispatch = useAppDispatch()
  const userInfo = useAppSelector(selectValue)
  const VideoLinkDeviceList = useAppSelector(selectVideoLinkDeviceList)

  const [clientWebsocket, setClientWebsocket] = useState<ClientWebsocket>()
  const [allViewVideoInfo, setAllViewVideoInfo] = useState<any>();
  const [cameraPTZ, setCameraPTZ] = useState<any>(null) // 摄像头ptz
  const [targetInfo, setTargetInfo] = useState<any>(null) //实时轨迹

  // 是否停止了联动
  const [isStopedVideoLink, setIsStopedVideoLink] = useState(false)

  // 联动需要的参数
  const [videoLinkData, setVideoLinkData] = useState<any>(null)

  const [deviceCode, setDeviceCode] = useState<any>(null)
  const [lockId, setLockId] = useState<any>(null)

  // 获取当前视频联动需要的参数
  useEffect(() => {
    for (let i = 0; i < VideoLinkDeviceList.length; i++) {
      if (VideoLinkDeviceList[i].key === uniqueKey && VideoLinkDeviceList[i].key) {
        setVideoLinkData(VideoLinkDeviceList[i].videoLinkData)
      }
    }
  }, [VideoLinkDeviceList, uniqueKey])

  // 根据key值，在全局变量中获取当前视频信息
  useEffect(() => {
    if (VideoLinkDeviceList.length > 0) {
      let currentVideoInfo = VideoLinkDeviceList.find((item: any) => {
        return item.key === uniqueKey
      })
      setAllViewVideoInfo(currentVideoInfo?.videoInfo)
      if (deviceCode === currentVideoInfo?.videoInfo.deviceCode) {
        return
      }
      setDeviceCode(currentVideoInfo?.videoInfo.deviceCode)
      setLockId(currentVideoInfo?.videoInfo.lockId)
    }
  }, [uniqueKey, VideoLinkDeviceList, deviceCode])

  useEffect(() => {
    const handleDrag = (params: DragParams) => {
      console.log(params);
      dispatch(setWinInfo(params))
    }
    const handleResize = (params: ResizeParams) => {
      console.log(params)
      dispatch(setWinInfo(params))
    }
    onDrag && onDrag(handleDrag)
    onResize && onResize(handleResize)
    return () => {
      offDrag && offDrag(handleDrag)
      offResize && offResize(handleResize)
    }
  }, [onDrag, offDrag, onResize, offResize, dispatch])



  //建立目标跟踪实时轨迹websocket
  useEffect(() => {
    if (isRealTimeVideo) {
      return
    }
    let _clientWebsocket: ClientWebsocket
    try {
      _clientWebsocket = new ClientWebsocket(`${WEBSOCKET_URL}/channel`, userInfo.token)
      _clientWebsocket.onMessage(async data => {
        const messageData = JSON.parse(data)
        if (messageData.code === 200) {
          //切换摄像头
          if (messageData.module === '04' && messageData.cmd === '0402') {
            setAllViewVideoInfo((val: any) => {
              return {
                ...val,
                ...messageData.data,
                url: messageData.data.vedioUrl,
                deviceCode: messageData.data.deviceCode,
                channel: messageData.data.deviceCode,
                lockId: messageData.data.lockId
              }
            })
            dispatch(setDeviceList({
              key: uniqueKey,
              deviceCode: messageData.data.deviceCode,
              videoInfo: {
                ...messageData.data,
                url: messageData.data.vedioUrl,
                deviceCode: messageData.data.deviceCode,
                channel: messageData.data.deviceCode,
                lockId: messageData.data.lockId
              },
              videoLinkData: videoLinkData
            }))
            dispatch(setSelectedKey(uniqueKey))
            onChangeWinTitle && onChangeWinTitle('视频联动:' + messageData.data.deviceName)
            message.success('接力跟踪成功，跟踪继续！')


          } else if (messageData.module === '04' && messageData.cmd === '0401') {
            // 摄像头的ptz设置
            // setCameraPTZ(message.data?.ptzVo?.deviceAngleVo)
          } else if (messageData.module === '04' && messageData.cmd === '0407') {

            message.success(messageData.desc || '目标已超出雷视联动范围')

          } else if (messageData.module === '01' && messageData.cmd === '0103') {
            // ais
            const aisList = _.filter(messageData.data, ele => _.has(ele, 'shipDataAisDto'))
            // radar
            const radarList = _.filter(messageData.data, ele => _.has(ele, 'shipDataRadarDto') && !_.has(ele, 'shipDataAisDto'))
            // 融合
            const focusList = _.filter(messageData.data, ele => _.has(ele, 'shipDataRadarDto') && _.has(ele, 'shipDataAisDto'))
            //实时数据
            if (targetType === 'ais') {
              let tagCode = ''
              // 默认值，避免无数据时报错
              let _aisLayerGroup: any[] = [{
                trackId: '',
                lng: null,
                lat: null,
                speed: 0,
                course: 0,
                originCourse: 0,
                heading: 0,
                extraData: null,
                time: 0,
                riskLevel: 0,
                otherDataType: 'ais' //用于判断当前目标的类型，ais,radar,focus
              }]
              if (messageData.data[0]?.tagType === '1') {
                _aisLayerGroup = aisList.map(ele => {
                  const aisData = ele.shipDataAisDto
                  tagCode = ele.tagCode
                  return {
                    trackId: ele.mmsi,
                    lng: messageData.data[0].lng,
                    lat: messageData.data[0].lat,
                    speed: ele.speed || 0,
                    course: aisData.cog * Math.PI / 180.0 || 0,
                    originCourse: aisData.cog || 0,
                    heading: aisData.true_heading * Math.PI / 180.0 || 0,
                    extraData: ele,
                    time: aisData.capTime,
                    riskLevel: ele.riskLevel,
                    otherDataType: 'ais' //用于判断当前目标的类型，ais,radar,focus
                  }
                })
              } else if (messageData.data[0]?.tagType === '3') {
                _aisLayerGroup = focusList.map(ele => {
                  const radarData = ele.shipDataAisDto
                  tagCode = ele.tagCode
                  return {
                    trackId: ele.mmsi,
                    lng: messageData.data[0].lng,
                    lat: messageData.data[0].lat,
                    speed: ele.speed || 0,
                    course: radarData.cog || 0,
                    originCourse: radarData.cog || 0,
                    heading: radarData.cog || 0,
                    extraData: ele,
                    time: radarData.capTime,
                    riskLevel: ele.riskLevel,
                    otherDataType: 'focus' //用于判断当前目标的类型，ais,radar,focus
                  }
                })
              }
              setTargetInfo({
                legendName: tagCode,
                latLngList: _aisLayerGroup
              })
            } else if (targetType === 'radar') {
              let tagCode = ''
              let _radarLayerGroup: any[] = [{
                trackId: '',
                lng: null,
                lat: null,
                speed: 0,
                course: 0,
                originCourse: 0,
                heading: 0,
                extraData: null,
                time: 0,
                riskLevel: 0,
                otherDataType: 'radar'
              }]
              if (messageData.data[0]?.tagType === '2') { //雷达
                _radarLayerGroup = radarList.map(ele => {
                  const radarData = ele.shipDataRadarDto
                  tagCode = ele.tagCode
                  return {
                    trackId: ele.batchNum,
                    lng: messageData.data[0].lng,
                    lat: messageData.data[0].lat,
                    speed: ele.speed || 0,
                    course: radarData.course * Math.PI / 180.0 || 0,
                    originCourse: radarData.course || 0,
                    heading: radarData.course * Math.PI / 180.0 || 0,
                    extraData: ele,
                    time: radarData.capTime,
                    riskLevel: ele.riskLevel,
                    otherDataType: 'radar' //用于判断当前目标的类型，ais,radar,focus
                  }
                })
              } else if (messageData.data[0]?.tagType === '3') { //融合
                _radarLayerGroup = focusList.map(ele => {
                  const radarData = ele.shipDataRadarDto
                  tagCode = ele.tagCode
                  return {
                    trackId: ele.mmsi,
                    lng: messageData.data[0].lng,
                    lat: messageData.data[0].lat,
                    speed: ele.speed || 0,
                    course: radarData.cog || 0,
                    originCourse: radarData.cog || 0,
                    heading: radarData.cog || 0,
                    extraData: ele,
                    time: radarData.capTime,
                    riskLevel: ele.riskLevel,
                    otherDataType: 'focus' //用于判断当前目标的类型，ais,radar,focus
                  }
                })
              }
              setTargetInfo({
                legendName: tagCode,
                latLngList: _radarLayerGroup
              })
            }
          }
        } else if (messageData.code === 201) {
          // 停止联动了
          setIsStopedVideoLink(true)
        }
      })
      setClientWebsocket(_clientWebsocket)
    } catch (error) {
      console.error('连接websocket异常', error)
    }
    return () => {
      _clientWebsocket?.close()
    }
  }, [userInfo, targetType, dispatch, uniqueKey, isRealTimeVideo, videoLinkData, onChangeWinTitle])

  //发送websocket消息
  useEffect(() => {
    if (clientWebsocket) {
      if (targetType === 'ais') {
        // 有融合目标，需要传递雷达批号
        let targetList = []
        if (uniqueId) {
          targetList = [mmsi, fusionId, uniqueId]
        } else {
          targetList = [mmsi, fusionId]
        }
        clientWebsocket.send(JSON.stringify({
          module: "01",
          cmd: "0101",
          data: {
            targetList
          }
        }))

      } else if (targetType === 'radar') {
        clientWebsocket.send(JSON.stringify({
          module: "01",
          cmd: "0101",
          data: {
            targetList: [uniqueId, fusionId]
          }
        }))
      }
    }
  }, [clientWebsocket, targetType, uniqueId, mmsi, fusionId])

  // 如果有联动视频，需要发送视频联动心跳
  useEffect(() => {
    let timer: any = null;
    if (allViewVideoInfo?.url) {
      // 联动未停止
      if (clientWebsocket && !isStopedVideoLink) {
        timer && clearInterval(timer)
        timer = setInterval(() => {
          clientWebsocket.send(JSON.stringify({
            module: "04",
            cmd: "0401",
            data: {
              lockId: allViewVideoInfo?.lockId,
              deviceCode: allViewVideoInfo?.deviceCode
            }
          }))
        }, 5000)
      }
    }
    // 联动停止后，不发0401指令
    if (isStopedVideoLink) {
      timer && clearInterval(timer)
      timer = null
    }

    return () => {
      if (timer) {
        clearInterval(timer)
      }
    }
  }, [allViewVideoInfo, clientWebsocket, isStopedVideoLink])


  //关闭页面时，请求关闭视频联动
  useEffect(() => {
    // 请求关闭视频联动
    async function closeCamera() {
      await stopCameraLockAsync({
        deviceCode: deviceCode,
        lockId: lockId
      })
    }
    window.onbeforeunload = () => {
      closeCamera()
    }
    return () => {
      if (deviceCode && !isRealTimeVideo) {
        closeCamera()
      }
    };
  }, [deviceCode, isRealTimeVideo, lockId]);

  // 轮询摄像头ptz
  useEffect(() => {
    // 初次获取立马改变ptz值
    async function main() {
      let res = await getCameraPTZ({
        deviceCode: allViewVideoInfo?.deviceCode,
        channel: allViewVideoInfo?.channel
      })
      setCameraPTZ(res.deviceAngleVo)
    }
    let _worker: Worker
    if (allViewVideoInfo?.deviceCode) {
      main()
      _worker = getCameraPTZIntervalAsync({
        deviceCode: allViewVideoInfo?.deviceCode,
        channel: allViewVideoInfo?.channel
      }, (res: any) => {
        if (res.code === 200) {
          setCameraPTZ(res.data.deviceAngleVo)
        } else {
          _worker.terminate()
        }
      })
    }
    return () => {
      _worker && _worker.terminate()
    }
  }, [allViewVideoInfo])

  return <VideoWin
    cameraPTZ={cameraPTZ}
    allViewVideoInfo={allViewVideoInfo}
    setAllViewVideoInfo={setAllViewVideoInfo}
    targetInfo={targetInfo}
    uniqueKey={uniqueKey}
    deviceCode={deviceCode}
    lockId={lockId}
    isStopedVideoLink={isStopedVideoLink}
    setIsStopedVideoLink={setIsStopedVideoLink}
    onChangeWinTitle={onChangeWinTitle}
  />
}

export default VideoLink

