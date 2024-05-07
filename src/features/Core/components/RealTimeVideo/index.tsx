
import CameraControl from 'component/CameraControl'
import { useEffect, useState } from 'react';
import { getCameraPTZIntervalAsync, getVideoSrcByDeviceCodeAsync, stopCameraLockAsync } from 'server/ship';


interface Props {
  deviceCode: string
  channel?: any
}
let cameraLockIdDeviceCode = ({
  lockId: '',
  deviceCode: ''
})
// 实时视频
const RealTimeVideo: React.FC<Props> = ({ deviceCode,channel }) => {
  console.debug('RealTimeVideo')

  //全景视频
  const [allViewVideoInfo, setAllViewVideoInfo] = useState({
    url: '',
    isShowVideo: true,
    channel: channel || '0',
    deviceCode: '',
    lockId: ''
  });

  // 摄像头ptz
  const [cameraPTZ, setCameraPTZ] = useState<any>(null)

  useEffect(() => {
    async function main() {
      let dto = channel?{
        deviceCode,
        channel
      }:{
        deviceCode
      }
      let vo = await getVideoSrcByDeviceCodeAsync({ ...dto })
      if (vo) {
        setAllViewVideoInfo((val: any) => {
          return {
            ...val,
            ...vo,
            url: vo.vedioUrl
          }
        })
        cameraLockIdDeviceCode = {
          lockId: vo.lockId,
          deviceCode: vo.deviceCode
        }
        setCameraPTZ(vo?.ptzVo?.deviceAngleVo)
      } else {
        setAllViewVideoInfo((val: any) => {
          return {
            ...val,
            ...vo,
            url: undefined
          }
        })
      }
    }
    main()
  }, [deviceCode,channel])

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
    if(allViewVideoInfo.deviceCode){
      _worker = getCameraPTZIntervalAsync({
        deviceCode: allViewVideoInfo.deviceCode,
        channel: allViewVideoInfo.channel
      },(res:any)=>{
        if(res.code === 200){
          setCameraPTZ(res.data.deviceAngleVo)
        }else{
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

  return <>
    <CameraControl
      setCameraPTZ={setCameraPTZ}
      cameraPTZ={cameraPTZ}
      allViewVideoInfo={allViewVideoInfo}
      setAllViewVideoInfo={setAllViewVideoInfo}
      setCameraLockIdDeviceCode={hanldeCameraLockIdDeviceCode}
      isNotShowTargetPercent={true}
    />
  </>
}

export default RealTimeVideo
