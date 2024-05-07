import { MinusOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Col, Input, InputNumber, Row, Slider, Alert } from "antd";
import SteeringWheel, { CameraOptionType, SteeringType } from "component/SteeringWheel";
import { DragElement } from "helper/common";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DeviceAction } from "../..";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { setNavigate } from "slice/routerSlice";
import { cameraPicture } from "server/device";
import styles from "./index.module.sass";
import { selectMonitorStep, setMonitorStep } from "slice/monitorStepSlice";


interface Props {
  className?: string
  style?: React.CSSProperties
  channelOptions?: any[]
  channelValue?: any
  device?: any
  onChannel?: (value: any) => void
  onAction?: (action: DeviceAction) => void
  onEnter?: (evt: React.MouseEvent) => void
  onLeave?: (evt: React.MouseEvent) => void
  onChange3D?: (value: any) => void
}

const ControlPanel: React.FC<Props> = ({
  className,
  style,
  channelValue,
  channelOptions,
  device,
  onChange3D,
  onChannel,
  onAction,
  onEnter,
  onLeave
}) => {
  console.debug('ControlPanel')


  const dispatch = useAppDispatch()


  const step = useAppSelector(selectMonitorStep)


  const headerRef = useRef<HTMLElement>(null)


  // const [step, setStep] = useState(20)
  const [isMouseDown, setIsMouseDown] = useState(false)
  const [isTakePhotoSuccess, setIsTakePhotoSuccess] = useState(false)
  const [is3d, setIs3d] = useState(false)


  // 装载拖动功能
  useEffect(() => {
    if (headerRef.current) {
      new DragElement(headerRef.current, true)
    }
  }, [])


  // 方向控制
  const handleDirection = useCallback(
    async (type: SteeringType) => {
      setIsMouseDown(true)
      if (onAction) {
        onAction({
          step,
          steeringType: type
        })
      }
    },
    [onAction, step]
  )

  // 停止方向控制
  const handleStopDirection = useCallback(
    async () => {
      setIsMouseDown(false)
      if (onAction) {
        onAction({
          steeringType: SteeringType.stop
        })
      }
    },
    [onAction]
  )

  // 鼠标离开控制盘
  const handleLeaveDirection = useCallback(
    async () => {
      if (isMouseDown && onAction) {
        onAction({
          steeringType: SteeringType.stop
        })
      }
    },
    [isMouseDown, onAction],
  )

  // 变倍、聚焦、光圈设置
  const handleOption = useCallback(
    async (type: CameraOptionType, startFlag: boolean) => {
      if (onAction) {
        onAction({
          step,
          startFlag,
          optionType: type
        })
      }
    },
    [onAction, step]
  )

  // 步长设置
  const handleStep = useCallback(
    (param: number | null) => {
      param && dispatch(setMonitorStep(param))
    },
    [dispatch]
  )

  const handleEnter = useCallback(
    (evt: React.MouseEvent) => {
      onEnter && onEnter(evt)
    },
    [onEnter],
  )

  const handleLeave = useCallback(
    (evt: React.MouseEvent) => {
      onLeave && onLeave(evt)
    },
    [onLeave],
  )


  const handleStopPropagation = useCallback(
    (evt: React.MouseEvent) => {
      evt.stopPropagation()
    },
    [],
  )

  const handleLookPicture = useCallback(
    () => {
      document.exitFullscreen()
      dispatch(setNavigate({
        path: '/dataCenter/collectionData',
        state: {
          activeKey: 'item-1',
          sourceDataActiveKey: '8',
          device
        }
      }))
    },
    [device, dispatch]
  )

  const handleHistory = useCallback(
    () => {
      if (device) {
        document.exitFullscreen()
        dispatch(setNavigate({
          path: '/dataCenter/collectionData',
          state: {
            activeKey: 'item-1',
            sourceDataActiveKey: '7',
            videoDataRadio: 1,
            deviceCodes: [device.deviceCode]
          }
        }))
      }
    },
    [device, dispatch],
  )

  const handlePicture = useCallback(
    async () => {
      if (device) {
        let channel = device?.channelList[0]?.channelNo ? device?.channelList[0]?.channelNo : device?.channelList[0]?.channel
        const vo = await cameraPicture(device.deviceCode, channel)
        if (vo.picUrl) {

          setIsTakePhotoSuccess(true)
        } else {
          setIsTakePhotoSuccess(false)
        }
      }
    },
    [device]
  )

  const handle3d = useCallback(
    () => {
      setIs3d(!is3d)
      onChange3D && onChange3D(!is3d)
    },
    [is3d, onChange3D],
  )


  const articleClass = useMemo(() => className ? `${styles.wrapper} ${className}` : styles.wrapper, [className])
  const text3d = useMemo(() => is3d ? '关闭3d定位' : '开启3d定位', [is3d])


  return (
    <article
      className={articleClass}
      style={style}
      onClick={handleStopPropagation}
      onDoubleClick={handleStopPropagation}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <header className={styles.header} ref={headerRef}>
        <span>云台控制</span>
        <Button size="small" type="link" onClick={handlePicture}>拍照</Button>
        <Button size="small" type="link" onClick={handleLookPicture}>查看图片</Button>
        {device.deviceSource === 0 && <Button size="small" type="link" onClick={handleHistory}>历史视频</Button>}
        <Button size="small" type="link" onClick={handle3d}>{text3d}</Button>
        {isTakePhotoSuccess && <div className={styles.takeSuccess}>
          <Alert
            message={isTakePhotoSuccess ? "拍照成功" : "拍照失败"}
            type={isTakePhotoSuccess ? "success" : "error"}
            showIcon
            onClose={() => setIsTakePhotoSuccess(false)}
            closable
          />
        </div>}
      </header>
      <section className={styles.content}>
        <div>
          <SteeringWheel onMouseDown={handleDirection} onMouseUp={handleStopDirection} onMouseLeave={handleLeaveDirection} onStop={handleStopDirection} />
        </div>
        <div className={styles.actions}>
          <Row className={styles.actionRow} justify="center" align="middle">
            <Col span={12}>
              {channelOptions &&
                <div className={styles.light}>
                  {channelOptions.map((item: any) =>
                    <div
                      className={item.channel === channelValue ? styles.lightButAct : styles.lightBut}
                      key={item.channel}
                      onClick={() => { onChannel && onChannel(item) }}
                    >
                      {item.name}
                    </div>
                  )}
                </div>
              }
            </Col>
            <Col span={12}>
              <Input.Group compact>
                <Button type="primary" size="small" icon={<PlusOutlined />}
                  onMouseDown={() => handleOption(CameraOptionType.zoomIn, true)}
                  onMouseUp={() => handleOption(CameraOptionType.zoomIn, false)}
                ></Button>
                <span className={styles.actionLabel}>变倍</span>
                <Button type="primary" size="small" icon={<MinusOutlined />}
                  onMouseDown={() => handleOption(CameraOptionType.zoomOut, true)}
                  onMouseUp={() => handleOption(CameraOptionType.zoomOut, false)}
                ></Button>
              </Input.Group>
            </Col>
          </Row>
          <Row className={styles.actionRow} justify="center" align="middle">
            <Col span={12}>
              <Input.Group compact>
                <Button type="primary" size="small" icon={<PlusOutlined />}
                  onMouseDown={() => handleOption(CameraOptionType.focusIn, true)}
                  onMouseUp={() => handleOption(CameraOptionType.focusIn, false)}
                ></Button>
                <span className={styles.actionLabel}>焦距</span>
                <Button type="primary" size="small" icon={<MinusOutlined />}
                  onMouseDown={() => handleOption(CameraOptionType.focusOut, true)}
                  onMouseUp={() => handleOption(CameraOptionType.focusOut, false)}
                ></Button>
              </Input.Group>
            </Col>
            <Col span={12}>
              <Input.Group compact>
                <Button type="primary" size="small" icon={<PlusOutlined />}
                  onMouseDown={() => handleOption(CameraOptionType.apertureIn, true)}
                  onMouseUp={() => handleOption(CameraOptionType.apertureIn, false)}
                ></Button>
                <span className={styles.actionLabel}>光圈</span>
                <Button type="primary" size="small" icon={<MinusOutlined />}
                  onMouseDown={() => handleOption(CameraOptionType.apertureOut, true)}
                  onMouseUp={() => handleOption(CameraOptionType.apertureOut, false)}
                ></Button>
              </Input.Group>
            </Col>
          </Row>
          <Row>
            <Col className={styles.stepLabel} span={5}>步长:</Col>
            <Col span={19}>
              <div className={styles.stepBox}>
                <Slider className={styles.stepSlider} onChange={handleStep} min={1} max={100} value={step} />
                <InputNumber className={styles.stepInputNumber} onChange={handleStep} min={1} max={100} value={step} size='small' />
              </div>
            </Col>
          </Row>
        </div>
      </section>
    </article>
  )
}

export default ControlPanel