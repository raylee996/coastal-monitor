import { WarningOutlined } from "@ant-design/icons";
import { Space } from "antd";
import windowUI from "component/WindowUI";
import { useCallback } from "react";
import VideoWarning from "../WarningModel/components/VideoWarning";
import WarningDetail from "../WarningModel/components/WarningDetail";
import styles from "./index.module.sass";


interface Props {
  text: string
  data?: any
  isNotOpenWindow?: boolean
  /** 背景主题颜色 */
  themeColor?: string
  /** 文字颜色 */
  textColor?: string
  /** 自定义图标 */
  customIcon?: any
}

const WarnMapInfo: React.FC<Props> = ({ text, data, isNotOpenWindow, themeColor, textColor, customIcon }) => {
  console.debug('WarnMapInfo')


  const handleOpenWarningDetail = useCallback(
    () => {
      if (!isNotOpenWindow) {
        data.monitorType === '05'
          ? windowUI(<VideoWarning id={data.id} />, { title: `视频预警`, key: '预警详情', width: '1330px', height: '800px', offset: [550, 40] })
          : windowUI(<WarningDetail id={data.warnContent} contentType={data.contentType} parentDate={data} />, { title: `预警详情`, key: '预警详情', width: '480px', height: '800px', offset: [1400, 40] })
      }
    },
    [data, isNotOpenWindow],
  )


  return (
    <article className={styles.wrapper}
      style={{
        boxShadow: `0 0 8px ${themeColor || 'red'} inset`,
      }}
    >
      <Space onClick={handleOpenWarningDetail}>
        {
          customIcon || <WarningOutlined />
        }
        <span style={{ color: textColor || themeColor || 'red' }}>{text}</span>
      </Space>
    </article>
  )
}

export default WarnMapInfo