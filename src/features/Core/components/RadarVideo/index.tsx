import { MinusOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Col, Input, Row, Select } from "antd";
import { useAppDispatch } from "app/hooks";
import SteeringWheel, { SteeringType } from "component/SteeringWheel";
import FlvPlayer from "helper/player/FlvPlayer";
import { useEffect, useRef, useState } from "react";
import { websocketSend } from "slice/websocketSendSlice";
import styles from "./index.module.sass";


interface Props {
  /** 船舶id */
  id: string | number
}

const RadarVideo: React.FC<Props> = ({ id }) => {
  console.debug('RadarVideo')

  const dispatch = useAppDispatch()

  const videoRef = useRef<HTMLVideoElement>(null)
  const [flvPlayer, setFlvPlayer] = useState<FlvPlayer>()

  // 视频联动心跳
  useEffect(() => {
    const timer = setInterval(() => {
      dispatch(websocketSend({
        channel: JSON.stringify({
          module: "04",
          cmd: "0401"
        })
      }))
    }, 15 * 1000)
    return () => {
      clearInterval(timer)
    }
  }, [dispatch])

  useEffect(() => {
    console.log('根据船舶id请求数据', id)
    if (videoRef.current) {
      const _flvPlayer = new FlvPlayer(videoRef.current, 'ws://172.16.6.128/rtp/0BEBC22C.live.flv')
      setFlvPlayer(_flvPlayer)
    }
  }, [id])

  // 发送设备控制指令接口
  function handleCameraMovement(type: SteeringType) {
    console.log(flvPlayer, type)
  }

  return (
    <article className={styles.wrapper}>
      <section className={styles.videoPanel}>
        <section className={styles.videoBox}>
          <video className={styles.videoEle} ref={videoRef}></video>
        </section>
        <section className={styles.targetActions}>
          <Row className={styles.targetActionsTools} align="middle">
            <Col>
              <Input.Group compact>
                <Button type="text">光电设备</Button>
                <Select className={styles.selectToolsBox} defaultValue="1" >
                  <Select.Option value="1">邮轮码头</Select.Option>
                  <Select.Option value="2">游艇会</Select.Option>
                </Select>
              </Input.Group>
            </Col>
            <Col>
              <Input.Group compact>
                <Button type="text">自动跟踪</Button>
                <Select defaultValue="1" >
                  <Select.Option value="1">是</Select.Option>
                  <Select.Option value="2">否</Select.Option>
                </Select>
              </Input.Group>
            </Col>
            <Col>
              <Input.Group compact>
                <span className={styles.label}>目标经纬度</span>
                <span>22.123456/112.998765</span>
              </Input.Group>
            </Col>
          </Row>
        </section>
      </section>
      <section className={styles.actionPanel}>
        <section className={styles.deviceAction}>
          <div className={styles.angleLabel}>水平角/俯仰角</div>
          <div className={styles.angleLabel}>130°123'32"/130°123'32"</div>
          <Row className={styles.actionRow} justify="center" align="middle">
            <Col>
              <Input.Group compact>
                <Button type="text">云台速度</Button>
                <Select className={styles.selectBox} defaultValue="1" >
                  <Select.Option value="1">1</Select.Option>
                  <Select.Option value="2">2</Select.Option>
                  <Select.Option value="3">3</Select.Option>
                  <Select.Option value="4">4</Select.Option>
                  <Select.Option value="5">5</Select.Option>
                </Select>
              </Input.Group>
            </Col>
          </Row>
          <Row className={styles.actionRow} justify="center" align="middle">
            <Col>
              <Input.Group compact>
                <Button type="text">成像设置</Button>
                <Select className={styles.selectBox} defaultValue="1" >
                  <Select.Option value="1">白光</Select.Option>
                  <Select.Option value="2">红外</Select.Option>
                </Select>
              </Input.Group>
            </Col>
          </Row>
          <Row className={styles.actionRow} justify="center" align="middle">
            <Col>
              <Input.Group compact>
                <Button type="text">启动透雾</Button>
                <Select className={styles.selectBox} defaultValue="1" >
                  <Select.Option value="1">是</Select.Option>
                  <Select.Option value="2">否</Select.Option>
                </Select>
              </Input.Group>
            </Col>
          </Row>
          <Row className={styles.actionRow} justify="center" align="middle">
            <Col>
              <Input.Group compact>
                <Button type="text">启动激光</Button>
                <Select className={styles.selectBox} defaultValue="1" >
                  <Select.Option value="1">是</Select.Option>
                  <Select.Option value="2">否</Select.Option>
                </Select>
              </Input.Group>
            </Col>
          </Row>
          <Row className={styles.actionRow} justify="center" align="middle">
            <Col>
              <Input.Group compact>
                <Button type="primary" icon={<PlusOutlined />}></Button>
                <Button type="text">视场</Button>
                <Button type="primary" icon={<MinusOutlined />}></Button>
              </Input.Group>
            </Col>
          </Row>
          <Row className={styles.actionRow} justify="center" align="middle">
            <Col>
              <Input.Group compact>
                <Button type="primary" icon={<PlusOutlined />}></Button>
                <Button type="text">焦距</Button>
                <Button type="primary" icon={<MinusOutlined />}></Button>
              </Input.Group>
            </Col>
          </Row>
          <Row className={styles.actionRow} justify="center" align="middle">
            <Col>
              <Input.Group compact>
                <Button type="primary" icon={<PlusOutlined />}></Button>
                <Button type="text">光圈</Button>
                <Button type="primary" icon={<MinusOutlined />}></Button>
              </Input.Group>
            </Col>
          </Row>
        </section>
        <section className={styles.steeringWheel}>
          <SteeringWheel onMouseDown={handleCameraMovement} />
        </section>
      </section>
    </article>
  )
}

export default RadarVideo