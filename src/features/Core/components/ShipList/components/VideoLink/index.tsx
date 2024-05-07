import React, { useEffect, useState } from "react";
import ClientWebsocket from "../../../../../../helper/websocket";
import { getCameraPTZIntervalAsync, getRealtimeVideoUrlAsync, stopCameraLockAsync } from "../../../../../../server/ship";
import { useAppSelector } from "../../../../../../app/hooks";
import { selectValue } from "../../../../../../slice/userInfoSlice";
import CameraControl from "../../../../../../component/CameraControl";
import { message } from "antd";
import styles from './index.module.sass'
import _ from "lodash";


interface Props {
  targetType: 'ais' | 'radar'
  lat?: number
  lng?: number
  mmsi?: string       //ais船舶mmsi
  uniqueId?: string   //雷达批号
  fusionId?: string  	//融合ID
  station?: string //ais才有station
}

let cameraLockIdDeviceCode = ({
  lockId: '',
  deviceCode: ''
})

const VideoLink: React.FC<Props> = ({ targetType, lat, lng, mmsi, uniqueId, fusionId, station }) => {
  console.debug('VideoLink')

  const [clientWebsocket, setClientWebsocket] = useState<ClientWebsocket>()
  const userInfo = useAppSelector(selectValue)
  //全景视频
  const [allViewVideoInfo, setAllViewVideoInfo] = useState({
    url: '',
    isShowVideo: true,
    channel: '0',
    deviceCode: '',
    lockId: ''
  });

  // 摄像头ptz
  const [cameraPTZ, setCameraPTZ] = useState<any>(null)

  //实时轨迹
  const [realTimeTrail, setRealTimeTrail] = useState<any>();

  //建立目标跟踪实时轨迹websocket
  useEffect(() => {
    let _clientWebsocket: ClientWebsocket
    try {
      _clientWebsocket = new ClientWebsocket(`${WEBSOCKET_URL}/channel`, userInfo.token)
      _clientWebsocket.onMessage(async data => {
        const message = JSON.parse(data)
        if (message.code === 200) {
          //切换摄像头
          if (message.module === '04' && message.cmd === '0402') {
            setAllViewVideoInfo((val) => {
              return {
                ...val,
                ...message.data,
                url: message.data.vedioUrl,
                deviceCode: message.data.deviceCode,
                channel: message.data.deviceCode,
                lockId: message.data.lockId
              }
            })
          } else if (message.module === '04' && message.cmd === '0401') {
            // 摄像头的ptz设置
            setCameraPTZ(message.data?.ptzVo?.deviceAngleVo)
          } else if (message.module === '01' && message.cmd === '0103') {
            // ais
            const aisList = _.filter(message.data, ele => _.has(ele, 'shipDataAisDto'))
            // radar
            const radarList = _.filter(message.data, ele => _.has(ele, 'shipDataRadarDto') && !_.has(ele, 'shipDataAisDto'))
            // 融合
            const focusList = _.filter(message.data, ele => _.has(ele, 'shipDataRadarDto') && _.has(ele, 'shipDataAisDto'))
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
              if (message.data[0]?.tagType === '1') {
                _aisLayerGroup = aisList.map(ele => {
                  const aisData = ele.shipDataAisDto
                  tagCode = ele.tagCode
                  return {
                    trackId: ele.mmsi,
                    lng: message.data[0].lng,
                    lat: message.data[0].lat,
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
              } else if (message.data[0]?.tagType === '3') {
                _aisLayerGroup = focusList.map(ele => {
                  const radarData = ele.shipDataAisDto
                  tagCode = ele.tagCode
                  return {
                    trackId: ele.mmsi,
                    lng: message.data[0].lng,
                    lat: message.data[0].lat,
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
              setRealTimeTrail({
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
              if (message.data[0]?.tagType === '2') { //雷达
                _radarLayerGroup = radarList.map(ele => {
                  const radarData = ele.shipDataRadarDto
                  tagCode = ele.tagCode
                  return {
                    trackId: ele.batchNum,
                    lng: message.data[0].lng,
                    lat: message.data[0].lat,
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
              } else if (message.data[0]?.tagType === '3') { //融合
                _radarLayerGroup = focusList.map(ele => {
                  const radarData = ele.shipDataRadarDto
                  tagCode = ele.tagCode
                  return {
                    trackId: ele.mmsi,
                    lng: message.data[0].lng,
                    lat: message.data[0].lat,
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

              setRealTimeTrail({
                legendName: tagCode,
                latLngList: _radarLayerGroup
              })
            }
          }
        }
      })
      setClientWebsocket(_clientWebsocket)
    } catch (error) {
      console.error('连接websocket异常', error)
    }
    return () => {
      _clientWebsocket?.close()
    }
  }, [userInfo, targetType])

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

  //获取实时联动视频流地址
  useEffect(() => {
    let timer: any = null;
    // 有mmsi的才有station
    let stationParams: any = {}
    async function main() {
      let codeType = 6
      let codeValue = ''
      if (targetType === 'ais') {
        codeType = 6
        codeValue = mmsi || ''
        if (mmsi) {
          stationParams.station = station
        }
      } else if (targetType === 'radar') {
        codeType = 7
        codeValue = uniqueId || ''
      }
      getRealtimeVideoUrlAsync({
        codeType,
        codeValue,
        fusionId: fusionId || '',
        latitude: lat,
        longitude: lng,
        station: station || '',
        mmsi: mmsi || '',
        batchNum: uniqueId || ''
      }).then(async res => {
        if (res.code !== 200) {
          setAllViewVideoInfo((val: any) => {
            return {
              ...val,
              url: undefined
            }
          })
          message.error(res.msg)
          return false
        }
        //获取实时视频流地址
        setAllViewVideoInfo((val) => {
          return {
            ...val,
            ...res.data,
            url: res.data.vedioUrl,
            deviceCode: res.data.deviceCode,
            channel: res.data.channel,
            lockId: res.data.lockId
          }
        })
        // 获取成功后，需要发送视频联动心跳
        if (clientWebsocket) {
          clientWebsocket.send(JSON.stringify({
            module: "04",
            cmd: "0401",
            data: {
              lockId: res.data.lockId,
              deviceCode: res.data.deviceCode
            }
          }))
          timer = setInterval(() => {
            clientWebsocket.send(JSON.stringify({
              module: "04",
              cmd: "0401",
              data: {
                lockId: res.data.lockId,
                deviceCode: res.data.deviceCode
              }
            }))
          }, 5000)
        }
      })
    }
    if (clientWebsocket) {
      main()
    }

    return () => {
      if (timer) {
        clearInterval(timer)
      }
    }

  }, [targetType, clientWebsocket, fusionId, lat, lng, mmsi, uniqueId, station]);

  //关闭页面时，请求关闭视频联动
  useEffect(() => {
    return () => {
      // 请求关闭视频联动
      async function closeCamera() {
        await stopCameraLockAsync({
          lockId: cameraLockIdDeviceCode.lockId,
          deviceCode: cameraLockIdDeviceCode.deviceCode
        })
      }
      if (cameraLockIdDeviceCode.deviceCode && cameraLockIdDeviceCode.lockId) {
        closeCamera()
      }
    };
  }, []);

  // 轮询摄像头ptz
  useEffect(() => {
    let _worker: Worker
    if (allViewVideoInfo.deviceCode) {
      _worker = getCameraPTZIntervalAsync({
        deviceCode: allViewVideoInfo.deviceCode,
        channel: allViewVideoInfo.channel
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

  function hanldeCameraLockIdDeviceCode(val: any) {
    cameraLockIdDeviceCode = {
      lockId: val.lockId,
      deviceCode: val.deviceCode
    }
  }

  return <div className={styles.wrapper}>
    <CameraControl
      setCameraPTZ={setCameraPTZ}
      cameraPTZ={cameraPTZ}
      allViewVideoInfo={allViewVideoInfo}
      setAllViewVideoInfo={setAllViewVideoInfo}
      targetInfo={realTimeTrail}
      ids={{ mmsi, fusionId, uniqueId }}
      setCameraLockIdDeviceCode={hanldeCameraLockIdDeviceCode}
    />
  </div>
}

export default VideoLink
