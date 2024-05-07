import { TableCardProps } from "hooks/flexibility/CardPanel"
import styles from "./index.module.sass"
import ImageSimple from "hooks/basis/ImageSimple";
import './index.css'
import { defaultImgPeople } from "helper/common";


// const iconList = ['nan', 'nv', 'yanjing', 'maozi', 'kouzhao']


const FaceCard: React.FC<TableCardProps<any>> = ({ data }) => {
  console.debug('FaceCard')


  return (
    <article className={styles.wrapper}>
      <div className={styles.imgBox}>
        <ImageSimple className={styles.image} src={data?.path} defaultSrc={defaultImgPeople} />
        <ImageSimple className={styles.image} src={data?.path2} defaultSrc={defaultImgPeople} />
      </div>
      <div className={styles.content}>
        <div className={styles.contentTop}>
          {data.gender === 1 &&
            <div className={`${styles.icon} ${styles.iconItemHeight}`}>
              <span className={`${styles.iconStyle} iconfont icon-nan`}></span>
            </div>
          }
          {data.gender === 2 &&
            <div className={`${styles.icon} ${styles.iconItemHeight}`}>
              <span className={`${styles.iconStyle} iconfont icon-nv`}></span>
            </div>
          }
          {data.glass === 1 &&
            <div className={`${styles.icon} ${styles.iconItemHeight}`}>
              <span className={`${styles.iconStyle} iconfont icon-yanjing`}></span>
            </div>
          }
          {data.hat === 1 &&
            <div className={`${styles.icon} ${styles.iconItemHeight}`}>
              <span className={`${styles.iconStyle} iconfont icon-maozi`}></span>
            </div>
          }
          {data.mask === 1 &&
            <div className={`${styles.icon} ${styles.iconItemHeight}`}>
              <span className={`${styles.iconStyle} iconfont icon-kouzhao`}></span>
            </div>
          }
        </div>
        <p className={styles.text} title={data.capAddress}>{`点位：${data.capAddress}`}</p>
        <p className={styles.text} title={data.capTime}>{data.capTime}</p>
        {/* <p className={styles.text} title={data.similarity}>{`相似度：${(data.similarity || 0) * 100}%`}</p> */}
      </div>
    </article>
  )
}

export default FaceCard