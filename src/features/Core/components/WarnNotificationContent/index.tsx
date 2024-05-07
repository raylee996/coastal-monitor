import { Col, message, Row } from "antd";
import ButtonSmall from "component/ButtonSmall";
import popupUI from "component/PopupUI";
import windowUI from "component/WindowUI";
import { getDictName } from "helper/dictionary";
import ImageSimple from "hooks/basis/ImageSimple";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getDictDataByType } from "server/system";
import HandleWarningResult from "../WarningModel/components/HandleWarningResult";
// import TargetFlow from "../ShipList/components/TargetFlow";
import styles from "./index.module.sass";
import shipDefSrc from 'images/default/ship.png'
// import VideoWarning from "../WarningModel/components/VideoWarning";
import WarningDetail from "../WarningModel/components/WarningDetail";
import VideoWarning from "../WarningModel/components/VideoWarning";
import _ from "lodash";


interface Props {
  /** 实时预警数据 */
  data: any
  // 打开联动，选中目标
  selectTarget?: Function
  /** 预警类型文本展示 */
  typeText?: string
  /** 视频预警回调 */
  onVideoWarn: (data: any) => void
  // 预览图片
  onPreview: (data: any) => void

}

const WarnNotificationContent: React.FC<Props> = ({ data, selectTarget, typeText, onVideoWarn, onPreview }) => {
  console.debug('WarnNotificationContent')


  const [warnTypeText, setWarnTypeText] = useState(typeText)
  const [isClick, setIsClick] = useState(true)
  const [isAction, setIsAction] = useState(true)

  useEffect(() => {
    async function main() {
      if (!typeText) {
        const dict = await getDictDataByType('warn_type')
        const typeList = data.warnType.split(';')
        const typeNameList = typeList.map((val: string) => {
          const name = getDictName(dict, val)
          return name
        })
        const _warnTypeText = _.filter(typeNameList, ele => ele).toString()
        setWarnTypeText(_warnTypeText)
      }
    }
    main()
  }, [data, typeText])


  const handleExitFullscreen = useCallback(
    () => {
      document.fullscreenElement && document.exitFullscreen()
    },
    [],
  )

  const handleVideo = useCallback(
    () => {
      if (!isClick) {
        return message.warning('不能重复点击！')
      }
      handleExitFullscreen()
      if (data.contentType === 7) {
        selectTarget && selectTarget({ radar: data.warnContent, isCenter: true, })
      } else {
        selectTarget && selectTarget({ mmsi: data.warnContent, isCenter: true, })
      }
      onVideoWarn(data)
      setIsClick(false)
    },
    [handleExitFullscreen, selectTarget, data, onVideoWarn, isClick],
  )

  const handleAction = useCallback(() => {
    if (!isAction) {
      return message.warning('不能重复点击！')
    }
    setIsAction(false)
    handleExitFullscreen()
    popupUI(<HandleWarningResult id={data.id} isShipTarget={[6].includes(data.contentType)} />, { title: '处理', size: 'mini' })
  }, [data.contentType, data.id, handleExitFullscreen, isAction])

  // 打开预警详情
  const handleOpenWarningDetail = useCallback(
    () => {
      handleExitFullscreen()
      if (data.monitorType === '05') {
        windowUI(<VideoWarning
          id={data.id}
        />, {
          title: `视频预警`,
          key: '预警详情',
          width: '1330px',
          height: '800px',
          offset: [550, 40]
        })
      } else {
        windowUI(<WarningDetail
          id={data.warnContent}
          contentType={data.contentType}
          parentDate={data} />, {
          title: `预警详情`,
          key: '预警详情',
          width: '480px',
          height: '800px',
          offset: [1400, 40]
        })
      }
    },
    [data, handleExitFullscreen],
  )

  const handlePreview = useCallback(
    () => {
      handleExitFullscreen()
      onPreview(data)
    },
    [data, handleExitFullscreen, onPreview],
  )


  const buttonText = useMemo(() => data.monitorType === '05' || data.monitorType === '0101' ? '实时视频' : '视频联动', [data])


  return (
    <article className={styles.wrapper}>
      <Row>
        <Col span={8}>
          <ImageSimple className={styles.img} src={data.warnPic} defaultSrc={shipDefSrc} onClick={handlePreview} preview={false} />
        </Col>
        <Col className={styles.infoBox} span={16} onClick={handleOpenWarningDetail}>
          <section className={styles.box}>
            {data.monitorType !== '05' && data.shipName &&
              <Row>
                <Col className={styles.label} span={8}>船名</Col>
                <Col className={styles.value} span={16}>{data.shipName}</Col>
              </Row>
            }
            {data.contentType === 6 &&
              <Row>
                <Col className={styles.label} span={8}>MMSI</Col>
                <Col className={styles.value} span={16}>{data.warnContent}</Col>
              </Row>
            }
            {data.contentType === 7 &&
              <Row>
                <Col className={styles.label} span={8}>雷达目标</Col>
                <Col className={styles.value} span={16}>{data.warnContent}</Col>
              </Row>
            }
            <Row>
              <Col className={styles.label} span={8}>布控名称</Col>
              <Col className={styles.value} span={16}>{data.monitorName}</Col>
            </Row>
            <Row>
              <Col className={styles.label} span={8}>预警类型</Col>
              <Col className={styles.value} span={16}>{warnTypeText}</Col>
            </Row>
            <Row>
              <Col className={styles.label} span={8}>预警时间</Col>
              <Col className={styles.value} span={16}>{data.capTime}</Col>
            </Row>
            {data.monitorType !== '05' && data.speed &&
              <Row>
                <Col className={styles.label} span={8}>航速</Col>
                <Col className={styles.value} span={16}>{data.speed ? `${data.speed}节` : ''}</Col>
              </Row>
            }
          </section>
        </Col>
      </Row>
      <footer>
        <ButtonSmall className={styles.action} onClick={handleVideo} name={buttonText} />
        <ButtonSmall className={styles.action} onClick={handleAction} name='处理' />
      </footer>
    </article>
  )
}

export default WarnNotificationContent