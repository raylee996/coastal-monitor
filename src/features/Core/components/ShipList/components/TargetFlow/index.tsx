import React, { useEffect, useState } from "react";
import { Checkbox, message } from "antd";
import styles from './index.module.sass'
import ClientWebsocket from "../../../../../../helper/websocket";
import { useAppDispatch, useAppSelector } from "../../../../../../app/hooks";
import { selectValue } from "../../../../../../slice/userInfoSlice";
import _ from "lodash";
import {
  getCameraPTZIntervalAsync,
  getRealtimeVideoUrlAsync,
  stopCameraLockAsync
} from "../../../../../../server/ship";
import CameraControl from "../../../../../../component/CameraControl";
import TargetMap from "./components/TargetMap";
import { clearSelectTargetByValue, selectTarget } from "slice/selectTargetSlice";

const CheckboxGroup = Checkbox.Group;


interface Props {
  targetType: 'ais' | 'radar'
  lat?: number
  lng?: number
  mmsi?: string       //ais船舶mmsi
  uniqueId?: string   //雷达批号
  fusionId?: string  	//融合ID
  station?: string    //ais 才有station
  batchNum?: string
}

let cameraLockIdDeviceCode = ({
  lockId: '',
  deviceCode: ''
})

//目标跟踪组件
const TargetFlow: React.FC<Props> = ({ targetType, lat, lng, mmsi, uniqueId, fusionId, station, batchNum }) => {
  console.debug('TargetFlow,目标跟踪')
  const [checkedList, setCheckedList] = useState([1, 2]);
  const plainOptions = [
    { label: '实时轨迹', value: 1 },
    { label: '视频联动-全景', value: 2 },
    // {label: '视频联动-细节', value: 3},
  ];
  const dispatch = useAppDispatch()
  const userInfo = useAppSelector(selectValue)
  const [clientWebsocket, setClientWebsocket] = useState<ClientWebsocket>()

  //实时轨迹
  const [realTimeTrail, setRealTimeTrail] = useState<any>();

  // 实时尾迹
  const [realTimePath, setRealTimePath] = useState<any>()

  //全景视频
  const [allViewVideoInfo, setAllViewVideoInfo] = useState({
    url: '',
    isShowVideo: true,
    channel: '0',
    deviceCode: '',
    lockId: ''
  });
  //细节视频
  const [smallViewVideoInfo, setSmallViewVideoInfo] = useState({
    url: '',
    isShowVideo: false,
    channel: '0',
    deviceCode: '',
    lockId: ''
  });

  // 摄像头ptz
  const [cameraPTZ, setCameraPTZ] = useState<any>(null)


  // 退出清除指定选中目标
  useEffect(() => {
    // 展示选中效果
    if (mmsi) {
      dispatch(selectTarget({ mmsi: mmsi }))
    } else {
      dispatch(selectTarget({ radar: uniqueId }))
    }
    return () => {
      dispatch(clearSelectTargetByValue({ mmsi, radar: uniqueId }))
    }
  }, [dispatch, mmsi, uniqueId])

  //建立目标跟踪实时轨迹websocket，获取目标实时轨迹
  useEffect(() => {
    let _clientWebsocket: ClientWebsocket
    try {
      _clientWebsocket = new ClientWebsocket(`${WEBSOCKET_URL}/channel`, userInfo.token)
      _clientWebsocket.onMessage(data => {
        const message = JSON.parse(data)
        // ais
        const aisList = _.filter(message.data, ele => _.has(ele, 'shipDataAisDto'))
        // radar
        const radarList = _.filter(message.data, ele => _.has(ele, 'shipDataRadarDto') && !_.has(ele, 'shipDataAisDto'))
        // 融合
        const focusList = _.filter(message.data, ele => _.has(ele, 'shipDataRadarDto') && _.has(ele, 'shipDataAisDto'))

        if (message.code === 200) {
          //获取实时轨迹
          if (message.module === '01' && message.cmd === '0103') {
            // 实时尾迹
            setRealTimePath(message.data[0].pathList)
            //实时轨迹数据
            let tagCode = ''
            if (targetType === 'ais') {
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
                    originCourse: aisData.cog,
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
                    originCourse: radarData.cog,
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
                    originCourse: radarData.course,
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
                    originCourse: radarData.course,
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
          } else if (message.module === '04' && message.cmd === '0402') {
            //切换摄像头
            setAllViewVideoInfo((val) => {
              return {
                ...val,
                ...message.data,
                url: message.data.videoUrl,
                deviceCode: message.data.deviceCode,
                channel: message.data.channel,
                lockId: message.data.lockId
              }
            })
          } else if (message.module === '04' && message.cmd === '0401') {
            // 摄像头的ptz设置
            setCameraPTZ(message.data?.ptzVo?.deviceAngleVo)
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
  }, [userInfo, dispatch, targetType])

  //发送websocket消息,获取轨迹
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
      clientWebsocket.send(JSON.stringify({
        module: "01",
        cmd: "0106",
        data: {
          selected: true,
          mmsi,
          fusionId,
          uniqueId,
          batchNum
        }
      }))
    }
  }, [clientWebsocket, targetType, uniqueId, mmsi, fusionId, batchNum])

  //获取实时联动视频流地址
  useEffect(() => {
    let timer: any = null;
    async function main() {
      let codeType = 6
      let codeValue = ''
      if (targetType === 'ais') {
        codeType = 6
        codeValue = mmsi || ''
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
        mmsi: mmsi || '',
        batchNum: uniqueId || '',
        station: station || '',
      }).then(async (res) => {
        if (res.code !== 200) {
          setAllViewVideoInfo((val: any) => {
            return {
              ...val,
              url: undefined,
            }
          })
          message.error(res.msg)
          return false;
        } else {
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

  //显示隐藏全景，细节视频
  useEffect(() => {
    if (checkedList.includes(2)) {
      //显示全景视频
      setAllViewVideoInfo((val) => {
        return {
          ...val,
          isShowVideo: true
        }
      })
    }
    if (!checkedList.includes(2)) {
      //隐藏全景视频
      setAllViewVideoInfo((val) => {
        return {
          ...val,
          isShowVideo: false
        }
      })
    }
    if (checkedList.includes(3)) {
      //显示细节视频
      setSmallViewVideoInfo((val) => {
        return {
          ...val,
          isShowVideo: true
        }
      })
    }
    if (!checkedList.includes(3)) {
      //隐藏细节视频
      setSmallViewVideoInfo((val) => {
        return {
          ...val,
          isShowVideo: false
        }
      })
    }
  }, [checkedList]);

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

  //获取细节视频
  /* function getSmallViewVideoUrl(deviceCode:any){
     getVideoSrcByDeviceCodeAsync({
       visibleLight: 4,
       deviceCode
     }).then(async res=>{
       //获取实时视频流地址
       const vo = await doGetDeviceRTSP({
         deviceCode: res.deviceCode,
         deviceChannelCode: res.channel
       })
       setSmallViewVideoInfo((val)=>{
         return{
           ...val,
           url: vo.data.ws_flv,
           deviceCode: res.deviceCode,
           channel: res.channel,
           lockId: res.lockId
         }
       })
     })
   }*/
  //勾选CheckBox
  function onChange(val: any) {
    setCheckedList(val)
  }

  function hanldeCameraLockIdDeviceCode(val: any) {
    cameraLockIdDeviceCode = {
      lockId: val.lockId,
      deviceCode: val.deviceCode
    }
  }

  return <div className={styles.wrapper}>
    <div className={styles.topCheckbox}>
      <CheckboxGroup options={plainOptions} value={checkedList} onChange={onChange} />
    </div>
    {/*放置地图的位置*/}
    {(checkedList && checkedList.includes(1)) && <div className={styles.mapContainer}>
      {/* <TargetTrackPlay data={realTimeTrail} isNotControlPanel={true}/> */}
      <TargetMap data={realTimeTrail} realTimePath={realTimePath} targetType={targetType} />
    </div>}
    <CameraControl
      setCameraPTZ={setCameraPTZ}
      cameraPTZ={cameraPTZ}
      allViewVideoInfo={allViewVideoInfo}
      smallViewVideoInfo={smallViewVideoInfo}
      targetInfo={realTimeTrail}
      ids={{ mmsi, fusionId, uniqueId }}
      setCameraLockIdDeviceCode={hanldeCameraLockIdDeviceCode}
      setAllViewVideoInfo={setAllViewVideoInfo}
    />
  </div>
}
export default React.memo(TargetFlow)
