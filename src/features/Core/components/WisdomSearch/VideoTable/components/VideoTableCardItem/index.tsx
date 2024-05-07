import { TableCardProps } from "hooks/flexibility/CardPanel"
import styles from "./index.module.sass"
import "../../../wisdomSearchUtils.sass"
import VideoCommon from "component/VideoCommon"
import { clueContentDict, getDictName } from "helper/dictionary"

const VideoTableCardItem: React.FC<TableCardProps<any>> = (props) => {
  console.debug('VideoTableCardItem')

  const { index, data } = props
  
  return (
    <article className={`${styles.wrapper} ${(index + 1) % 5 === 0 ? styles.delMarginLeft : ''}`} key={data.id}>
      <div className={styles.videoBox}>
        <VideoCommon {...data} />
      </div>
      <div className={styles.content}>
        {/* 后端暂未提供对应字段 */}
        <div className={styles.textBox}>
          <span className={styles.iconStyle}>{getDictName(clueContentDict, data.codeType) || ''}</span>
          &nbsp;&nbsp;
          {data.codeType===9? data.codeValueName : data.codeValue || ''}
        </div>
        <div className={styles.textBox}>
          <span className={`${styles.iconStyle} iconfont icon-shijian`}></span>
          &nbsp;&nbsp;&nbsp;&nbsp;
          {data.capTime || ''}
        </div>
        <div className={styles.textBox}>
          <span className={`${styles.iconStyle} iconfont icon-dingwei`}></span>
          &nbsp;&nbsp;&nbsp;&nbsp;
          {data.deviceName || ''}
        </div>
      </div>
    </article>
  )
}

export default VideoTableCardItem