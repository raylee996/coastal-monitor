import { TableCardProps } from "hooks/flexibility/CardPanel"
import { Checkbox } from "antd";
import styles from "./index.module.sass"
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import _ from "lodash";
import ImageSimple from "hooks/basis/ImageSimple";
import './index.css'
import "../../../wisdomSearchUtils.sass"
import { useCallback, useMemo } from "react";

// const iconList = ['nan', 'nv', 'yanjing', 'maozi', 'kouzhao']

const FaceTableCardItem: React.FC<TableCardProps<any>> = ({
  index,
  data,
  activeData,
  radioData,
  onSelect,
  onRadio
}) => {
  console.debug('FaceTableCardItem')


  const content = useMemo(() => data.content, [data])


  const onChange = useCallback(
    ({ target: { checked } }: CheckboxChangeEvent) => {
      onSelect && onSelect(checked, data)
    },
    [data, onSelect],
  )

  const onclick = useCallback(
    () => {
      onRadio && onRadio(data)
    },
    [data, onRadio],
  )


  return (
    <article className={`${styles.wrapper} ${(index + 1) % 3 === 0 ? styles.delMarginLeft : ''} ${_.isEqual(radioData, data) ? 'card__active' : 'card__unActive'}`} data-value={content} onClick={onclick}>
      <div className={styles.imgBox}>
        <Checkbox checked={_.findIndex(activeData, data) > -1} onChange={onChange} />
        <div className={styles.imgFlex}>
          <ImageSimple className={styles.image2} src={data?.path2} />
          <ImageSimple className={styles.image1} src={data?.path} rootClassName='img-preview-face' />
        </div>
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
        <p className={styles.text} title={data.capTime}>{`时间：${data.capTime}`}</p>
        {/* <p className={styles.text} title={data.similarity}>{`相似度：${(data.similarity || 0) * 100}%`}</p> */}
      </div>
    </article>
  )
}

export default FaceTableCardItem