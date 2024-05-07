import React, { useCallback, useEffect, useState } from "react";
import { Button, Col, Input, Row, Slider, Space, Segmented, InputNumber, message } from 'antd';
import styles from './index.module.sass'
import SteeringWheel, { SteeringType } from "../../../../../../component/SteeringWheel";
import { MinusOutlined, PlusOutlined } from "@ant-design/icons";
import { cameraControlAsync, changeChannelAsync } from "../../../../../../server/ship";
import Precast from "./Precast";

interface Props {
  //通道
  channel?: any
  //资源锁id
  lockId?: any
  //设备编码
  deviceCode?: any
  //用于区分是全景还是细节（allViewVideo,smallViewVideo）
  activeVideoFlag?: any
  //全景视频信息修改
  setAllViewVideoInfo?: Function
  //细节视频修改
  setSmallViewVideoInfo?: Function
  // 控制方向时，需要设置摄像头ptz
  setCameraPTZ?: Function
  // 控制方向时候，向父组件传递lockID和deviceCode，方便关闭时候，摄像头释放资源
  setCameraLockIdDeviceCode?: any
  // 是否显示目标占比
  isNotShowTargetPercent?: Boolean
  // 3D控制参数
  threeControlParams?: any
  // 通道列表
  channelInfoList?: any[]
  // 当前视频对象
  targetVideo?: any
  // 是否显示预置位
  isNotShowPrecast?: boolean
}

// 用于缓存当前lockId，判断是否需要更新lockId
let tempLockId: any = null

const ControlTools: React.FC<Props> = ({
  channel,
  channelInfoList,
  lockId,
  deviceCode,
  activeVideoFlag,
  setAllViewVideoInfo,
  setSmallViewVideoInfo,
  setCameraPTZ,
  setCameraLockIdDeviceCode,
  isNotShowTargetPercent,
  threeControlParams,
  targetVideo,
  isNotShowPrecast
}) => {
  //可见光
  const [visibleLight, setVisibleLight] = useState<number>();

  // channelList 通道列表
  const [channelList, setChannelList] = useState<any>()
  // channelType 1.可见光 2.红外
  const [channelType, setChannelType] = useState(1)
  //步长
  const [stepVal, setStepVal] = useState(20);

  // lockId
  const [realLockId, setrealLockId] = useState(lockId)

  // 判断鼠标是否在方向按钮上
  const [isMouseInBtn, setIsMouseInBtn] = useState(false)

  // 判断鼠标按下后，接口请求是否完成的标识。
  const [isRequestComplete, setIsRequestComplete] = useState(false)
  const [directionType, setDirectionType] = useState<SteeringType>()
  const [isControlDirection, setIsControlDirection] = useState(false)

  // 更新lockId，重要***
  useEffect(() => {
    if (tempLockId === lockId || lockId === '') {
      return
    }
    tempLockId = lockId;
    setrealLockId(lockId)
    setCameraLockIdDeviceCode && setCameraLockIdDeviceCode({
      lockId,
      deviceCode
    })
  }, [lockId, deviceCode, setCameraLockIdDeviceCode])

  // realLockId改变时，触发更新lockId
  useEffect(() => {
    if (tempLockId === realLockId || realLockId === '') {
      return
    }
    tempLockId = realLockId;
    setCameraLockIdDeviceCode && setCameraLockIdDeviceCode({
      lockId: realLockId,
      deviceCode
    })
  }, [realLockId, setCameraLockIdDeviceCode, deviceCode])

  // 可见光，红外list列表
  useEffect(() => {
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
      let currentChannelIndex = channelInfoList.findIndex((item: any) => item.channelNo === channel)
      setChannelList(arr)
      if (currentChannelIndex > -1) {
        setChannelType(arr[currentChannelIndex].channelType)
        setVisibleLight(arr[currentChannelIndex].value)
      }

    }
  }, [channelInfoList, channel])


  //摄像头控制
  function controlCamera(params: any) {
    cameraControlAsync({
      channel,
      lockId: realLockId,
      deviceCode,
      ...params
    }).then(res => {
      if (res.data.code !== 200) {
        message.error(res.data.msg)
        return
      }
      // 控制方向时，需要改变ptz值
      setCameraPTZ && setCameraPTZ(res.data.data?.ptzVo?.deviceAngleVo)
      if (res.data.data.lockId) {
        setrealLockId(res.data.data.lockId)
        setCameraLockIdDeviceCode && setCameraLockIdDeviceCode({
          lockId: res.data.data.lockId,
          deviceCode: res.data.data.deviceCode
        })
      }
      setIsRequestComplete(true)
    })
  }

  // 3d控制
  let handleThreeControl = useCallback(
    () => {
      if (threeControlParams) {
        if (threeControlParams.spixel.x === threeControlParams.epixel.x &&
          threeControlParams.spixel.y === threeControlParams.epixel.y) {
          return
        }
        cameraControlAsync({
          channel,
          lockId: realLockId,
          deviceCode,
          ...threeControlParams
        }).then(res => {
          /*  if (res.data.code !== 200) {
             message.error(res.data.msg)
             return
           } */
          if (res.data?.data?.lockId) {
            setrealLockId(res.data.data.lockId)
          }
        })
      }
    },
    [threeControlParams, channel, deviceCode, realLockId],
  )

  useEffect(() => {
    handleThreeControl()
  }, [handleThreeControl])


  // 摄像头方向键：鼠标弹起时触发
  useEffect(() => {
    if (isRequestComplete && !isMouseInBtn && isControlDirection) {
      cameraControlAsync({
        channel,
        lockId: realLockId,
        deviceCode,
        direction: directionType,
        controlType: 4,
        step: stepVal,
        startFlag: false,
      }).then((res: any) => {
        if (res.data.code !== 200) {
          message.error(res.data.msg)
          return
        }
        if (res.data?.data?.lockId) {
          setrealLockId(res.data.data.lockId)
        }
      })
      setIsRequestComplete(false)
      setIsControlDirection(false)
    }
  }, [isRequestComplete, isMouseInBtn, channel, realLockId, deviceCode, directionType, stepVal, isControlDirection])


  //切换 1、可见光，2、红外线。
  function handlerVisibleLight(value: any) {
    console.log(value);
    let params = channelInfoList && channelInfoList[value]
    setVisibleLight(value)
    changeChannelAsync({
      ...params,
      lockId: realLockId,
      channel: params.channelNo
    }).then(async (res) => {
      //获取实时视频流地址
      if (activeVideoFlag === 'allViewVideo') {
        //修改全景视频信息
        setAllViewVideoInfo && setAllViewVideoInfo({
          ...res,
          url: res.vedioUrl,
          channel: res.channel,
          deviceCode: res.deviceCode,
          lockId: res.lockId,
          isShowVideo: true,
        })
        res.lockId && setrealLockId(res.lockId)
      } else {
        //修改细节视频信息
        setSmallViewVideoInfo && setSmallViewVideoInfo({
          ...res,
          url: res.vedioUrl,
          channel: res.channel,
          deviceCode: res.deviceCode,
          lockId: res.lockId,
          isShowVideo: true,
        })
        res.lockId && setrealLockId(res.lockId)
      }
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

  return <div className={styles.wrapper} id='controlTools'>
    <div className={styles.left}>
      <section className={styles.steeringWheel}>
        <SteeringWheel onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} onMouseLeave={handleMouseLeave} />
      </section>
    </div>
    <div className={styles.middle}>
      <Space direction={"vertical"} size={10}>
        {channelType === 1 && !isNotShowTargetPercent && <Row>
          <Col span={24}>
            目标占比：<Button size="small" className={styles.btn} onClick={() => handleTargetPercent('1/8')}>1/8</Button>
            <Button size="small" className={styles.btn} onClick={() => handleTargetPercent('1/4')}>1/4</Button>
            <Button size="small" className={styles.btn} onClick={() => handleTargetPercent('1/2')}>1/2</Button>
            <Button size="small" className={styles.btn} onClick={() => handleTargetPercent('1')}>1</Button>
            <Button size="small" className={styles.btn} onClick={() => handleTargetPercent('2')}>2</Button>
            <Button size="small" className={styles.btn} onClick={() => handleTargetPercent('MAX')}>MAX</Button>
          </Col>
        </Row>}
        <Row gutter={10} style={{ marginBottom: '20px' }}>
          <Col span={12}>
            <Segmented options={channelList} value={visibleLight} onChange={handlerVisibleLight} />
          </Col>
          <Col span={12}>
            <Input.Group compact>
              <Button type="primary"
                icon={<PlusOutlined />}
                onMouseDown={() => controlCamera({ controlType: 1, cmd: 2, startFlag: true })}
                onMouseUp={() => controlCamera({ controlType: 1, cmd: 2, startFlag: false })}

              />
              <Button type="text" className={styles.middleText}>变倍</Button>
              <Button type="primary"
                icon={<MinusOutlined />}
                onMouseDown={() => controlCamera({ controlType: 1, cmd: 1, startFlag: true })}
                onMouseUp={() => controlCamera({ controlType: 1, cmd: 1, startFlag: false })}
              />
            </Input.Group>
          </Col>
        </Row>
        <Row gutter={10}>
          <Col span={12}>
            <Input.Group compact>
              <Button type="primary"
                icon={<PlusOutlined />}
                onMouseDown={() => controlCamera({ controlType: 2, cmd: 2, startFlag: true })}
                onMouseUp={() => controlCamera({ controlType: 2, cmd: 2, startFlag: false })}
              />
              <Button type="text" className={styles.middleText}>聚焦</Button>
              <Button type="primary"
                icon={<MinusOutlined />}
                onMouseDown={() => controlCamera({ controlType: 2, cmd: 1, startFlag: true })}
                onMouseUp={() => controlCamera({ controlType: 2, cmd: 1, startFlag: false })}
              />
            </Input.Group>
          </Col>
          <Col span={12}>
            <Input.Group compact>
              <Button type="primary"
                icon={<PlusOutlined />}
                onMouseDown={() => controlCamera({ controlType: 3, cmd: 2, startFlag: true })}
                onMouseUp={() => controlCamera({ controlType: 3, cmd: 2, startFlag: false })}
              />
              <Button type="text" className={styles.middleText}>光圈</Button>
              <Button type="primary"
                icon={<MinusOutlined />}
                onMouseDown={() => controlCamera({ controlType: 3, cmd: 1, startFlag: true })}
                onMouseUp={() => controlCamera({ controlType: 3, cmd: 1, startFlag: false })}
              />
            </Input.Group>
          </Col>
        </Row>
      </Space>
      <div className={styles.stepLength}>
        <span>步长</span>
        <Slider min={1} max={100} value={stepVal} onChange={(val: any) => setStepVal(val)} />
        <span>
          <InputNumber
            value={stepVal}
            max={100}
            onChange={(val: any) => setStepVal(val)}
            className={styles.stepVal}
          />
        </span>
      </div>
    </div>
    {!isNotShowPrecast && <div className={styles.right}>
      <Precast
        deviceCode={deviceCode}
        targetVideo={targetVideo}
        channel={channel}
        lockId={realLockId}
        setrealLockId={setrealLockId}
      />
    </div>}
  </div>
}

export default ControlTools
