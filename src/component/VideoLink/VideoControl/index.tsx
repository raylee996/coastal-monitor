import { Button, Input, Slider, Segmented, InputNumber, message } from 'antd';
import SteeringWheel, { SteeringType } from 'component/SteeringWheel'
import { MinusOutlined, PlusOutlined } from "@ant-design/icons";
import styles from './index.module.sass'
import { useEffect, useState } from 'react';
import { cameraControlAsync, changeChannelAsync } from 'server/ship';
import { useAppDispatch, useAppSelector } from 'app/hooks';
import { selectedKey, selectVideoLinkDeviceList, setControlWinPosition, setDeviceList, setSelectedKey } from 'slice/videoLinkSlice';
import Precast from 'features/Core/components/ShipList/components/ControlTools/Precast';
import { ResizelistenFn, DraglistenFn, DragParams, ResizeParams } from 'hooks/basis/Windowstill';
import TimeCount from 'component/CameraControl/TimeCount';

interface Props {
  // 关闭弹窗
  onClosePopup?: Function
  isNotShowPrecast?: boolean
  onResize?: (fn: ResizelistenFn) => void
  offResize?: (fn: ResizelistenFn) => void
  onDrag?: (fn: DraglistenFn) => void
  offDrag?: (fn: DraglistenFn) => void

  // 继续跟踪相关
  handlerFollow?: Function
  isFollow?: boolean
  handleChangeTime?: Function
  timerText?: string
  isShowFollow?: boolean
  timerCountNum?: number
}
// 云台控制面板
const VideoControl: React.FC<Props> = ({
  onClosePopup,
  isNotShowPrecast,
  onResize,
  offResize,
  onDrag,
  offDrag,
  handlerFollow,
  isFollow,
  handleChangeTime,
  timerText,
  timerCountNum,
  isShowFollow
}) => {

  const dispatch = useAppDispatch()

  const VideoLinkDeviceList = useAppSelector(selectVideoLinkDeviceList)
  // 当前选中的视频，弹窗key值
  const selectedVideoKey = useAppSelector(selectedKey)
  //可见光
  const [visibleLight, setVisibleLight] = useState<number>();
  // 当前视频信息
  const [currentVideoInfo, setcurrentVideoInfo] = useState<any>()

  // channelList 通道列表
  const [channelList, setChannelList] = useState<any>()

  // channelType 1.可见光 2.红外
  const [channelType, setChannelType] = useState(1)
  //步长
  const [stepVal, setStepVal] = useState(20);

  // 判断鼠标是否在方向按钮上
  const [isMouseInBtn, setIsMouseInBtn] = useState(false)

  // 判断鼠标按下后，接口请求是否完成的标识。
  const [isRequestComplete, setIsRequestComplete] = useState(false)
  const [directionType, setDirectionType] = useState<SteeringType>()
  const [isControlDirection, setIsControlDirection] = useState(false)

  // 判断当前控制的是联动还是实时视频
  const [isRealTimeVideo, setIsRealTimeVideo] = useState<boolean>(false)

  // 隐式获取弹窗的位置信息
  useEffect(() => {
    const handleDrag = (params: DragParams) => {
      dispatch(setControlWinPosition(params))
      console.log(params)
    }
    const handleResize = (params: ResizeParams) => {
      console.log(params)
      dispatch(setControlWinPosition(params))
    }
    onDrag && onDrag(handleDrag)
    onResize && onResize(handleResize)
    return () => {
      offDrag && offDrag(handleDrag)
      offResize && offResize(handleResize)
    }
  }, [onDrag, offDrag, onResize, offResize, dispatch])

  // 判断是否有可控制的视频联动，无可用的视频则关闭云台控制。
  useEffect(() => {
    let isHideControlPlane = VideoLinkDeviceList.every((item: any) => !item.deviceCode)
    // 剩余的全是高清枪机、车辆卡口、全景摄像机
    let cameraTypeList = [3, 6, 9]
    let isNotShowControl = VideoLinkDeviceList.every((item: any) => cameraTypeList.includes(item.videoInfo?.cameraType) || !item.videoInfo)
    if (isHideControlPlane || isNotShowControl) {
      onClosePopup && onClosePopup()
      dispatch(setSelectedKey(''))
    }
  }, [VideoLinkDeviceList, dispatch, onClosePopup])

  // 获取当前视频信息
  useEffect(() => {
    for (let i = 0; i < VideoLinkDeviceList.length; i++) {
      if (VideoLinkDeviceList[i].key === selectedVideoKey && VideoLinkDeviceList[i].videoInfo) {
        setStepVal(VideoLinkDeviceList[i].stepVal || 20)
        if (currentVideoInfo
          && currentVideoInfo.deviceCode === VideoLinkDeviceList[i].deviceCode
          && currentVideoInfo.channel === VideoLinkDeviceList[i].videoInfo.channel
        ) {
          return
        }
        setcurrentVideoInfo(VideoLinkDeviceList[i].videoInfo)
        if (VideoLinkDeviceList[i].videoLinkData) {
          setIsRealTimeVideo(false)
        } else {
          setIsRealTimeVideo(true)
        }
      }
    }
  }, [VideoLinkDeviceList, currentVideoInfo, selectedVideoKey])


  // 可见光，红外list列表
  useEffect(() => {
    let channelInfoList = currentVideoInfo?.channelInfoList
    if (channelInfoList && channelInfoList.length > 0) {
      let arr = []
      for (let i = 0; i < channelInfoList.length; i++) {
        if (channelInfoList[i].channelType === 2) {
          arr.push({
            ...channelInfoList[i],
            label: '红外',
            value: i,
          })
        } else if (channelInfoList[i].channelType === 1) {
          arr.push({
            ...channelInfoList[i],
            label: '可见光',
            value: i
          })
        }
      }
      // 设置当前选中的通道
      let currentChannelIndex = channelInfoList.findIndex((item: any) => item.channelNo === currentVideoInfo?.channel)
      setChannelList(arr)
      if (currentChannelIndex > -1) {
        setChannelType(arr[currentChannelIndex].channelType)
        setVisibleLight(arr[currentChannelIndex].value)
      }
    }
  }, [currentVideoInfo])

  function handlerIsFollow() {
    handlerFollow && handlerFollow()
  }

  //摄像头控制
  function controlCamera(params: any) {
    cameraControlAsync({
      channel: currentVideoInfo?.channel,
      lockId: currentVideoInfo?.lockId,
      deviceCode: currentVideoInfo?.deviceCode,
      ...params
    }).then(res => {
      if (res.data.code !== 200) {
        message.error(res.data.msg)
        return
      }
      setIsRequestComplete(true)
    })
  }

  // 摄像头方向键：鼠标弹起时触发
  useEffect(() => {
    if (isRequestComplete && !isMouseInBtn && isControlDirection) {
      cameraControlAsync({
        channel: currentVideoInfo?.channel,
        lockId: currentVideoInfo?.lockId,
        deviceCode: currentVideoInfo?.deviceCode,
        direction: directionType,
        controlType: 4,
        step: stepVal,
        startFlag: false,
      }).then((res: any) => {
        if (res.data.code !== 200) {
          message.error(res.data.msg)
          return
        }
      })
      setIsRequestComplete(false)
      setIsControlDirection(false)
    }
  }, [currentVideoInfo, directionType, isControlDirection, isMouseInBtn, isRequestComplete, stepVal])


  //切换 1、可见光，2、红外线。
  function handlerVisibleLight(value: any) {
    console.log(value);
    let channelInfoList = currentVideoInfo?.channelInfoList
    let params = channelInfoList && channelInfoList[value]
    setVisibleLight(value)
    changeChannelAsync({
      ...params,
      lockId: currentVideoInfo?.lockId,
      channel: params.channelNo,
      streamLevel: document.fullscreenElement ? 0 : 1
    }).then(async (res) => {
      let videoLinkData: any = null
      for (let i = 0; i < VideoLinkDeviceList.length; i++) {
        if (VideoLinkDeviceList[i].key === selectedVideoKey && VideoLinkDeviceList[i].videoLinkData) {
          videoLinkData = VideoLinkDeviceList[i].videoLinkData
        }
      }
      // 设置全局设备列表
      dispatch(setDeviceList({
        key: selectedVideoKey,
        deviceCode: res.deviceCode,
        videoInfo: {
          ...res,
          url: res.vedioUrl,
          channel: res.channel,
          deviceCode: res.deviceCode,
          lockId: res.lockId ? res.lockId : currentVideoInfo?.lockId,
        },
        videoLinkData
      }))
    })
  }

  // 摄像头方向：鼠标按下
  function handleMouseDown(type: SteeringType) {
    setIsMouseInBtn(true)
    setDirectionType(type)
    setIsRequestComplete(false)
    setIsControlDirection(true)
    controlCamera({
      direction: type,
      controlType: 4,
      step: stepVal,
      startFlag: true
    })
  }
  // 摄像头方向：鼠标弹起
  function handleMouseUp(type: SteeringType) {
    setIsMouseInBtn(false)
    setDirectionType(type)
  }
  // 鼠标移出，触发鼠标弹起事件
  function handleMouseLeave(type: SteeringType) {
    setIsMouseInBtn(false)
    setDirectionType(type)
  }

  //目标占比
  function handleTargetPercent(val: string) {
    let scrstatus = 1
    switch (val) {
      case '1/8':
        scrstatus = 4
        break;
      case '1/4':
        scrstatus = 2
        break;
      case '1/2':
        scrstatus = 3
        break;
      case '1':
        scrstatus = 5
        break;
      case '2':
        scrstatus = 6
        break;
      case 'MAX':
        scrstatus = 7
        break;
    }
    // setTargetPercent(val)
    controlCamera({
      controlType: 5,
      scrstatus
    })
  }

  // 修改步长
  function handleChangeStepVal(val: number) {
    setStepVal(val)
    for (let i = 0; i < VideoLinkDeviceList.length; i++) {
      if (VideoLinkDeviceList[i].key === selectedVideoKey) {
        dispatch(setDeviceList({
          ...VideoLinkDeviceList[i],
          stepVal: val
        }))
      }
    }
  }

  return <div className={styles.wrapper} id='controlTools'>
    {isShowFollow && <div className={styles.top}>
      <div className={styles.goOnFollow}>
        <Button type='link' onClick={handlerIsFollow} style={{ marginRight: '10px' }}>{isFollow ? '暂停跟踪' : '继续跟踪'}</Button>
        <TimeCount value={timerCountNum} handleChange={handleChangeTime} isDisableSelect={!isFollow} />
        <div className={styles.time}>{timerText}</div>
      </div>
    </div>}
    <div className={styles.bottom}>
      <div className={styles.left}>
        <section className={styles.steeringWheel}>
          <SteeringWheel onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} onMouseLeave={handleMouseLeave} />
        </section>
      </div>
      <div className={styles.right}>
        {/* 可见光并且是联动才显示目标占比 */}
        {channelType === 1 && !isRealTimeVideo && <div style={{ marginBottom: '4px' }}>
          <span>目标占比</span>
          <Button size="small" className={styles.btn} onClick={() => handleTargetPercent('1/8')}>1/8</Button>
          <Button size="small" className={styles.btn} onClick={() => handleTargetPercent('1/4')}>1/4</Button>
          <Button size="small" className={styles.btn} onClick={() => handleTargetPercent('1/2')}>1/2</Button>
          <Button size="small" className={styles.btn} onClick={() => handleTargetPercent('1')}>1</Button>
          <Button size="small" className={styles.btn} onClick={() => handleTargetPercent('2')}>2</Button>
          <Button size="small" className={styles.btn} onClick={() => handleTargetPercent('MAX')} style={{ fontSize: '10px', padding: '0 2px' }}>MAX</Button>
        </div>}
        <div className={styles.actionBtns}>
          <div className={styles.left}>
            <Segmented size='small' options={channelList} value={visibleLight} onChange={handlerVisibleLight} />
          </div>
          <div className={styles.right}>
            <Input.Group compact>
              <Button
                size='small'
                type="primary"
                icon={<PlusOutlined />}
                onMouseDown={() => controlCamera({ controlType: 1, cmd: 2, startFlag: true })}
                onMouseUp={() => controlCamera({ controlType: 1, cmd: 2, startFlag: false })}

              />
              <Button size='small' type="text" className={styles.middleText}>变倍</Button>
              <Button
                size='small'
                type="primary"
                icon={<MinusOutlined />}
                onMouseDown={() => controlCamera({ controlType: 1, cmd: 1, startFlag: true })}
                onMouseUp={() => controlCamera({ controlType: 1, cmd: 1, startFlag: false })}
              />
            </Input.Group>
          </div>
        </div>
        <div className={styles.actionBtns}>
          <div className={styles.left}>
            <Input.Group compact>
              <Button
                type="primary"
                size='small'
                icon={<PlusOutlined />}
                onMouseDown={() => controlCamera({ controlType: 2, cmd: 2, startFlag: true })}
                onMouseUp={() => controlCamera({ controlType: 2, cmd: 2, startFlag: false })}
              />
              <Button size='small' type="text" className={styles.middleText}>聚焦</Button>
              <Button size='small' type="primary"
                icon={<MinusOutlined />}
                onMouseDown={() => controlCamera({ controlType: 2, cmd: 1, startFlag: true })}
                onMouseUp={() => controlCamera({ controlType: 2, cmd: 1, startFlag: false })}
              />
            </Input.Group>
          </div>
          <div className={styles.right}>
            <Input.Group compact>
              <Button
                size='small'
                type="primary"
                icon={<PlusOutlined />}
                onMouseDown={() => controlCamera({ controlType: 3, cmd: 2, startFlag: true })}
                onMouseUp={() => controlCamera({ controlType: 3, cmd: 2, startFlag: false })}
              />
              <Button size='small' type="text" className={styles.middleText}>光圈</Button>
              <Button
                size='small'
                type="primary"
                icon={<MinusOutlined />}
                onMouseDown={() => controlCamera({ controlType: 3, cmd: 1, startFlag: true })}
                onMouseUp={() => controlCamera({ controlType: 3, cmd: 1, startFlag: false })}
              />
            </Input.Group>
          </div>
        </div>
        <div className={styles.stepLength}>
          <span>步长</span>
          <Slider
            min={1}
            max={100}
            value={stepVal}
            onChange={(val: any) => setStepVal(val)}
            onAfterChange={(val: any) => handleChangeStepVal(val)}
          />
          <span>
            <InputNumber
              value={stepVal}
              max={100}
              onChange={(val: any) => handleChangeStepVal(val)}
              className={styles.stepVal}
              size='small'
            />
          </span>
        </div>
      </div>
    </div>

    {!isNotShowPrecast && <div className={styles.precast}>
      <Precast
        deviceCode={currentVideoInfo?.deviceCode}
        targetVideo={currentVideoInfo}
        channel={currentVideoInfo?.channel}
        lockId={currentVideoInfo?.lockId}
      />
    </div>}
  </div>
}

export default VideoControl