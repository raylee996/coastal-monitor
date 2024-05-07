import ImageSimple from "hooks/basis/ImageSimple";
import { useCallback } from "react"
import styles from "./index.module.sass";


interface Props {
  data: any
  onClick: (data: any) => void
}

const PersonCard: React.FC<Props> = ({ data, onClick }) => {
  console.debug('PersonCard')

  const handleClick = useCallback(() => {
    onClick(data)
  }, [data, onClick])

  return (
    <article className={styles.wrapper} >
      <section>
        <ImageSimple className={styles.img} src={data.picUrl2} />
      </section>
      <section className={styles.data} onClick={handleClick}>
        <div className={styles.info}>
          <div>人员:</div>
          <div>{data.name}</div>
          <div className={styles.mark}>
            {data.mask === 1 && <i className="iconfont icon-kouzhao" />}
            {data.glass === 1 && <i className="iconfont icon-yanjing" />}
            {data.hat === 1 && <i className="iconfont icon-maozi" />}
          </div>
        </div>
        <div className={styles.info}>
          <div>地点:</div>
          <div>{data.deviceName}</div>
        </div>
        <div className={styles.info}>
          <div>时间:</div>
          <div>{data.capTime}</div>
        </div>
      </section>
    </article>
  )
}

export default PersonCard