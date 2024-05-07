import VideoCommon from "component/VideoCommon";
import XcEmpty from "component/XcEmpty";
import styles from "./index.module.sass";
import './index.sass';

interface VideProps {
  /** 视频url集合 */
  videoList: any[]
}

const RelationVideo: React.FC<VideProps> = ({ videoList }) => {
  console.debug('RelationVideo')

  return (
    <article className={`${styles.wrapper}`}>
      {
        videoList?.length ? videoList.map(item => {
          return <li key={item.id} className={`${styles.imgList} RelationVideo__wrapper`}>
            <div className={styles.image}>
              <VideoCommon {...item} />
            </div>
            <p>{item.capTime || item.createTime}</p>
          </li>
        }) : <XcEmpty />
      }
    </article>
  )
}

export default RelationVideo